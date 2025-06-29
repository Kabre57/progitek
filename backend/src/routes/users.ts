import { Router } from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateUserSchema, createUserSchema } from '../validations/user';
import { auditService } from '../services/auditService';
import { ApiResponse, PaginatedResponse } from '../models';
import { config } from '../config/config';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer la liste des utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.utilisateur.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          phone: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          role: {
            select: { libelle: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.utilisateur.count(),
    ]);

    res.json({
      success: true,
      message: 'Utilisateurs récupérés avec succès',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as PaginatedResponse);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireRole(['admin']), validateRequest(createUserSchema), async (req: Request, res: Response) => {
  try {
    const { motDePasse, ...userData } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà',
      } as ApiResponse);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motDePasse, config.security.bcryptRounds);

    // Créer l'utilisateur
    const user = await prisma.utilisateur.create({
      data: {
        ...userData,
        motDePasse: hashedPassword,
        emailStatus: 'verified',
        status: 'active',
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        phone: true,
        roleId: true,
        createdAt: true,
        role: {
          select: { libelle: true, description: true },
        },
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      details: `Utilisateur ${user.nom} ${user.prenom} créé`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'utilisateur',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        phone: true,
        theme: true,
        displayName: true,
        address: true,
        state: true,
        country: true,
        designation: true,
        balance: true,
        emailStatus: true,
        kycStatus: true,
        lastLogin: true,
        status: true,
        createdAt: true,
        role: {
          select: { id: true, libelle: true, description: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Utilisateur récupéré avec succès',
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', requireRole(['admin']), validateRequest(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updateData = req.body;

    // Si un nouveau mot de passe est fourni, le hasher
    if (updateData.motDePasse) {
      updateData.motDePasse = await bcrypt.hash(updateData.motDePasse, config.security.bcryptRounds);
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        phone: true,
        theme: true,
        displayName: true,
        address: true,
        state: true,
        country: true,
        designation: true,
        status: true,
        updatedAt: true,
        role: {
          select: { libelle: true },
        },
      },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'UPDATE',
      entityType: 'USER',
      entityId: userId,
      details: `Utilisateur ${updatedUser.nom} ${updatedUser.prenom} modifié`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Utilisateur modifié avec succès',
      data: updatedUser,
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'utilisateur',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', requireRole(['admin']), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Empêcher la suppression de son propre compte
    if (userId === req.user!.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte',
      } as ApiResponse);
    }

    // Vérifier si l'utilisateur est un admin
    const userToDelete = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (userToDelete?.role.libelle === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un compte administrateur',
      } as ApiResponse);
    }

    const user = await prisma.utilisateur.delete({
      where: { id: userId },
      select: { nom: true, prenom: true },
    });

    await auditService.logAction({
      userId: req.user!.id,
      actionType: 'DELETE',
      entityType: 'USER',
      entityId: userId,
      details: `Utilisateur ${user.nom} ${user.prenom} supprimé`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    } as ApiResponse);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        phone: true,
        theme: true,
        displayName: true,
        address: true,
        state: true,
        country: true,
        designation: true,
        balance: true,
        emailStatus: true,
        kycStatus: true,
        lastLogin: true,
        createdAt: true,
        role: {
          select: { id: true, libelle: true, description: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Profil récupéré avec succès',
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profile', validateRequest(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const updateData = req.body;

    // Empêcher la modification du rôle via cette route
    delete updateData.roleId;

    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        phone: true,
        theme: true,
        displayName: true,
        address: true,
        state: true,
        country: true,
        designation: true,
        updatedAt: true,
      },
    });

    await auditService.logAction({
      userId,
      actionType: 'UPDATE',
      entityType: 'USER',
      entityId: userId,
      details: 'Profil utilisateur mis à jour',
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: updatedUser,
    } as ApiResponse);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/users/roles:
 *   get:
 *     summary: Récupérer la liste des rôles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/roles', async (_req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { libelle: 'asc' },
    });

    res.json({
      success: true,
      message: 'Rôles récupérés avec succès',
      data: roles,
    } as ApiResponse);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des rôles',
    } as ApiResponse);
  }
});

export { router as userRouter };

