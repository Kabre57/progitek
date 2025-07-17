import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createTechnicienSchema, updateTechnicienSchema } from '../validations/technicien';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [techniciens, total] = await Promise.all([
      prisma.technicien.findMany({
        skip,
        take: limit,
        include: {
          specialite: {
            select: { libelle: true, description: true },
          },
          technicienInterventions: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.technicien.count(),
    ]);

    const techniciensWithStats = techniciens.map(technicien => ({
      ...technicien,
      totalInterventions: technicien.technicienInterventions.length,
    }));

    res.json({
      success: true,
      message: 'Techniciens récupérés avec succès',
      data: techniciensWithStats,
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
      message: 'Erreur lors de la récupération des techniciens',
    } as ApiResponse);
  }
});

router.post('/', validateRequest(createTechnicienSchema), async (req: Request, res: Response) => {
  try {
    const technicien = await prisma.technicien.create({
      data: req.body,
      include: {
        specialite: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'TECHNICIEN',
      entityId: technicien.id,
      details: `Technicien ${technicien.nom} ${technicien.prenom} créé`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Technicien créé avec succès',
      data: technicien,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du technicien',
    } as ApiResponse);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const technicienId = parseInt(req.params.id);
    
    const technicien = await prisma.technicien.findUnique({
      where: { id: technicienId },
      include: {
        specialite: true,
        technicienInterventions: {
          include: {
            intervention: {
              include: {
                mission: {
                  include: { client: true },
                },
              },
            },
          },
        },
      },
    });

    if (!technicien) {
      return res.status(404).json({
        success: false,
        message: 'Technicien non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Technicien récupéré avec succès',
      data: technicien,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du technicien',
    } as ApiResponse);
  }
});

router.put('/:id', validateRequest(updateTechnicienSchema), async (req: Request, res: Response) => {
  try {
    const technicienId = parseInt(req.params.id);
    
    const technicien = await prisma.technicien.update({
      where: { id: technicienId },
      data: req.body,
      include: {
        specialite: true,
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'TECHNICIEN',
      entityId: technicien.id,
      details: `Technicien ${technicien.nom} ${technicien.prenom} modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Technicien modifié avec succès',
      data: technicien,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du technicien',
    } as ApiResponse);
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const technicienId = parseInt(req.params.id);
    
    const technicien = await prisma.technicien.delete({
      where: { id: technicienId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'TECHNICIEN',
      entityId: technicien.id,
      details: `Technicien ${technicien.nom} ${technicien.prenom} supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Technicien supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du technicien',
    } as ApiResponse);
  }
});


router.get('/specialites', async (_req: Request, res: Response) => {
  try {
    const specialites = await prisma.specialite.findMany({
      include: {
        techniciens: {
          select: { id: true },
        },
      },
      orderBy: { libelle: 'asc' },
    });

    const specialitesWithStats = specialites.map(specialite => ({
      ...specialite,
      totalTechniciens: specialite.techniciens.length,
    }));

    res.json({
      success: true,
      message: 'Spécialités récupérées avec succès',
      data: specialitesWithStats,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des spécialités',
    } as ApiResponse);
  }
});

export { router as technicienRouter };