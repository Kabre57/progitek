import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createSpecialiteSchema, updateSpecialiteSchema } from '../validations/specialite';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/specialites:
 *   get:
 *     summary: Récupérer la liste des spécialités
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche par libellé
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { libelle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [specialites, total] = await Promise.all([
      prisma.specialite.findMany({
        where,
        skip,
        take: limit,
        include: {
          techniciens: {
            select: { id: true, nom: true, prenom: true },
          },
        },
        orderBy: { libelle: 'asc' },
      }),
      prisma.specialite.count({ where }),
    ]);

    const specialitesWithStats = specialites.map(specialite => ({
      ...specialite,
      totalTechniciens: specialite.techniciens.length,
    }));

    res.json({
      success: true,
      message: 'Spécialités récupérées avec succès',
      data: specialitesWithStats,
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
      message: 'Erreur lors de la récupération des spécialités',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/specialites:
 *   post:
 *     summary: Créer une nouvelle spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireRole(['admin']), validateRequest(createSpecialiteSchema), async (req: Request, res: Response) => {
  try {
    const specialite = await prisma.specialite.create({
      data: req.body,
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'SPECIALITE',
      entityId: specialite.id,
      details: `Spécialité ${specialite.libelle} créée`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Spécialité créée avec succès',
      data: specialite,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la spécialité',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/specialites/{id}:
 *   get:
 *     summary: Récupérer une spécialité par ID
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const specialiteId = parseInt(req.params.id);
    
    const specialite = await prisma.specialite.findUnique({
      where: { id: specialiteId },
      include: {
        techniciens: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            contact: true,
            createdAt: true,
          },
        },
      },
    });

    if (!specialite) {
      return res.status(404).json({
        success: false,
        message: 'Spécialité non trouvée',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Spécialité récupérée avec succès',
      data: {
        ...specialite,
        totalTechniciens: specialite.techniciens.length,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la spécialité',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/specialites/{id}:
 *   put:
 *     summary: Modifier une spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', requireRole(['admin']), validateRequest(updateSpecialiteSchema), async (req: Request, res: Response) => {
  try {
    const specialiteId = parseInt(req.params.id);
    
    const specialite = await prisma.specialite.update({
      where: { id: specialiteId },
      data: req.body,
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'SPECIALITE',
      entityId: specialite.id,
      details: `Spécialité ${specialite.libelle} modifiée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Spécialité modifiée avec succès',
      data: specialite,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la spécialité',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/specialites/{id}:
 *   delete:
 *     summary: Supprimer une spécialité
 *     tags: [Specialites]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const specialiteId = parseInt(req.params.id);
    
    // Vérifier s'il y a des techniciens associés
    const techniciensCount = await prisma.technicien.count({
      where: { specialiteId: specialiteId },
    });

    if (techniciensCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer cette spécialité car ${techniciensCount} technicien(s) y sont associé(s)`,
      } as ApiResponse);
    }

    const specialite = await prisma.specialite.delete({
      where: { id: specialiteId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'SPECIALITE',
      entityId: specialite.id,
      details: `Spécialité ${specialite.libelle} supprimée`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Spécialité supprimée avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la spécialité',
    } as ApiResponse);
  }
});

export { router as specialiteRouter };