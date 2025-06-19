import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  sendNotification
} from '../controllers/notificationController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { sendNotificationSchema, updatePreferencesSchema } from '../validations/notification';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestion des notifications
 */

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les notifications
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);

// Routes pour les préférences
router.get('/preferences', getPreferences);
router.put('/preferences', validateBody(updatePreferencesSchema), updatePreferences);

// Route pour envoyer des notifications (admin seulement)
router.post('/send', 
  authorizeRoles('Administrator'), 
  validateBody(sendNotificationSchema), 
  sendNotification
);

export default router;