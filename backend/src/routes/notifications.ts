import { Router } from 'express';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { ApiResponse } from '../models';
import { sendNotificationSchema, updateNotificationPreferencesSchema } from '../validations/notification';

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      message: 'Notifications récupérées avec succès',
      data: notifications,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);

    await prisma.notification.update({
      where: { 
        id: notificationId,
        userId: req.user!.id,
      },
      data: { readAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/mark-all-read', async (req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        userId: req.user!.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notifications',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);

    await prisma.notification.delete({
      where: { 
        id: notificationId,
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'Notification supprimée avec succès',
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Récupérer les préférences de notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: req.user!.id },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId: req.user!.id },
      });
    }

    res.json({
      success: true,
      message: 'Préférences de notification récupérées avec succès',
      data: preferences,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des préférences',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Mettre à jour les préférences de notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.put('/preferences', validateRequest(updateNotificationPreferencesSchema), async (req: Request, res: Response) => {
  try {
    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: req.user!.id },
      update: req.body,
      create: {
        userId: req.user!.id,
        ...req.body,
      },
    });

    res.json({
      success: true,
      message: 'Préférences de notification mises à jour avec succès',
      data: preferences,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des préférences',
    } as ApiResponse);
  }
});

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Envoyer une notification (admin seulement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/send', requireRole(['admin']), validateRequest(sendNotificationSchema), async (req: Request, res: Response) => {
  try {
    const { userId, type, message, data } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Notification envoyée avec succès',
      data: notification,
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification',
    } as ApiResponse);
  }
});

export { router as notificationRouter };