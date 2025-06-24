import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../config/database';
import { ApiResponse } from '../models';
import {
  registerSchema,
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '../validations/auth';
import { config } from '../config/config';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentication]
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription utilisateur
 *     tags: [Authentication]
 */
router.post('/register', validateRequest(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticateToken, async (req, res) => {
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
      message: 'Informations utilisateur récupérées avec succès',
      data: user,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations utilisateur',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demander la réinitialisation du mot de passe
 *     tags: [Authentication]
 */
router.post('/forgot-password', validateRequest(resetPasswordRequestSchema), authController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     tags: [Authentication]
 */
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Changer le mot de passe de l'utilisateur connecté
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/change-password', authenticateToken, validateRequest(changePasswordSchema), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.utilisateur.findUnique({
      where: { id: userId },
      select: { id: true, motDePasse: true, nom: true, prenom: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé',
      } as ApiResponse);
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.motDePasse);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      } as ApiResponse);
    }

    // Hasher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id: userId },
      data: { motDePasse: hashedNewPassword },
    });

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir le token d'accès
 *     tags: [Authentication]
 */
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshToken);

export { router as authRouter };