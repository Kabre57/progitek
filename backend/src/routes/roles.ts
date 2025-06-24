import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { createRoleSchema, updateRoleSchema } from '../validations/role';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Récupérer la liste des rôles
 *     tags: [Roles]
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
router.get('/', requireRole(['admin']), async (req: Request, res: Response) => {
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

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          utilisateurs: {
            select: { id: true, nom: true, prenom: true, email: true },
          },
        },
        orderBy: { libelle: 'asc' },
      }),
      prisma.role.count({ where }),
    ]);

    const rolesWithStats = roles.map(role => ({
      ...role,
      totalUtilisateurs: role.utilisateurs.length,
    }));

    res.json({
      success: true,
      message: 'Rôles récupérés avec succès',
      data: rolesWithStats,
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
      message: 'Erreur lors de la récupération des rôles',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Créer un nouveau rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireRole(['admin']), validateRequest(createRoleSchema), async (req: Request, res: Response) => {
  try {
    // Vérifier si le rôle existe déjà
    const existingRole = await prisma.role.findUnique({
      where: { libelle: req.body.libelle },
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: 'Un rôle avec ce libellé existe déjà',
      } as ApiResponse);
    }

    const role = await prisma.role.create({
      data: req.body,
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'ROLE',
      entityId: role.id,
      details: `Rôle ${role.libelle} créé`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Rôle créé avec succès',
      data: role,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du rôle',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Récupérer un rôle par ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        utilisateurs: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            status: true,
            lastLogin: true,
            createdAt: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Rôle non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Rôle récupéré avec succès',
      data: {
        ...role,
        totalUtilisateurs: role.utilisateurs.length,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du rôle',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Modifier un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', requireRole(['admin']), validateRequest(updateRoleSchema), async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    
    // Vérifier si le nouveau libellé existe déjà (si modifié)
    if (req.body.libelle) {
      const existingRole = await prisma.role.findFirst({
        where: { 
          libelle: req.body.libelle,
          id: { not: roleId },
        },
      });

      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: 'Un rôle avec ce libellé existe déjà',
        } as ApiResponse);
      }
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: req.body,
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'ROLE',
      entityId: role.id,
      details: `Rôle ${role.libelle} modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Rôle modifié avec succès',
      data: role,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du rôle',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Supprimer un rôle
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.id);
    
    // Vérifier s'il y a des utilisateurs associés
    const utilisateursCount = await prisma.utilisateur.count({
      where: { roleId: roleId },
    });

    if (utilisateursCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Impossible de supprimer ce rôle car ${utilisateursCount} utilisateur(s) y sont associé(s)`,
      } as ApiResponse);
    }

    // Empêcher la suppression du rôle admin
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (role?.libelle === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer le rôle administrateur',
      } as ApiResponse);
    }

    const deletedRole = await prisma.role.delete({
      where: { id: roleId },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'ROLE',
      entityId: deletedRole.id,
      details: `Rôle ${deletedRole.libelle} supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Rôle supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du rôle',
    } as ApiResponse);
  }
});

export { router as roleRouter };