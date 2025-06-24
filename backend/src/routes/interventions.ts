import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createInterventionSchema, updateInterventionSchema } from '../validations/intervention';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/interventions:
 *   get:
 *     summary: Récupérer la liste des interventions
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [interventions, total] = await Promise.all([
      prisma.intervention.findMany({
        skip,
        take: limit,
        include: {
          mission: {
            select: { 
              numIntervention: true, 
              natureIntervention: true,
              description: true,
              client: { 
                select: { nom: true, entreprise: true } 
              }
            },
          },
          technicien: {
            select: { nom: true, prenom: true, contact: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.intervention.count(),
    ]);

    res.json({
      success: true,
      message: 'Interventions récupérées avec succès',
      data: interventions,
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
      message: 'Erreur lors de la récupération des interventions',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/interventions:
 *   post:
 *     summary: Créer une nouvelle intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', validateRequest(createInterventionSchema), async (req: Request, res: Response) => {
  try {
    const intervention = await prisma.intervention.create({
      data: req.body,
      include: {
        mission: {
          include: { client: true },
        },
        technicien: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'INTERVENTION',
      entityId: intervention.id,
      details: `Intervention créée pour la mission ${intervention.mission?.natureIntervention}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Intervention créée avec succès',
      data: intervention,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'intervention',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/interventions/{id}:
 *   get:
 *     summary: Récupérer une intervention par ID
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const interventionId = parseInt(req.params.id);
    
    const intervention = await prisma.intervention.findUnique({
      where: { id: interventionId },
      include: {
        mission: {
          include: { client: true },
        },
        technicien: {
          include: { specialite: true },
        },
      },
    });

    if (!intervention) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Intervention récupérée avec succès',
      data: intervention,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'intervention',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/interventions/{id}:
 *   put:
 *     summary: Modifier une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', validateRequest(updateInterventionSchema), async (req: Request, res: Response) => {
  try {
    const interventionId = parseInt(req.params.id);
    
    const intervention = await prisma.intervention.update({
      where: { id: interventionId },
      data: req.body,
      include: {
        mission: true,
        technicien: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'INTERVENTION',
      entityId: intervention.id,
      details: `Intervention modifiée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Intervention modifiée avec succès',
      data: intervention,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'intervention',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/interventions/{id}:
 *   delete:
 *     summary: Supprimer une intervention
 *     tags: [Interventions]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const interventionId = parseInt(req.params.id);
    
    const intervention = await prisma.intervention.delete({
      where: { id: interventionId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'INTERVENTION',
      entityId: intervention.id,
      details: `Intervention supprimée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Intervention supprimée avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'intervention',
    } as ApiResponse);
  }
});

export { router as interventionRouter };