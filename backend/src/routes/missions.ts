import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createMissionSchema, updateMissionSchema } from '../validations/mission';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/missions:
 *   get:
 *     summary: Récupérer la liste des missions
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        skip,
        take: limit,
        include: {
          client: {
            select: { nom: true, email: true, entreprise: true },
          },
          interventions: {
            include: {
              technicien: {
                select: { nom: true, prenom: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mission.count(),
    ]);

    res.json({
      success: true,
      message: 'Missions récupérées avec succès',
      data: missions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/missions:
 *   post:
 *     summary: Créer une nouvelle mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createMissionSchema), async (req: Request, res: Response) => {
  try {
    const mission = await prisma.mission.create({
      data: req.body,
      include: {
        client: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'MISSION',
      entityId: mission.numIntervention,
      details: `Mission ${mission.natureIntervention} créée`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Mission créée avec succès',
      data: mission,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la mission',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/missions/{id}:
 *   get:
 *     summary: Récupérer une mission par ID
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.id);
    
    const mission = await prisma.mission.findUnique({
      where: { numIntervention: missionId },
      include: {
        client: true,
        interventions: {
          include: {
            technicien: {
              include: { specialite: true },
            },
          },
        },
      },
    });

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission non trouvée',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Mission récupérée avec succès',
      data: mission,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la mission',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/missions/{id}:
 *   put:
 *     summary: Modifier une mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateMissionSchema), async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.id);
    
    const mission = await prisma.mission.update({
      where: { numIntervention: missionId },
      data: req.body,
      include: {
        client: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'MISSION',
      entityId: mission.numIntervention,
      details: `Mission ${mission.natureIntervention} modifiée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Mission modifiée avec succès',
      data: mission,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la mission',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/missions/{id}:
 *   delete:
 *     summary: Supprimer une mission
 *     tags: [Missions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const missionId = parseInt(req.params.id);
    
    const mission = await prisma.mission.delete({
      where: { numIntervention: missionId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'MISSION',
      entityId: mission.numIntervention,
      details: `Mission ${mission.natureIntervention} supprimée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Mission supprimée avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la mission',
    } as ApiResponse);
  }
});

export { router as missionRouter };