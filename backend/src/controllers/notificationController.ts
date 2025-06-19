import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logAudit } from '../services/auditService';
import { sendNotificationEmail } from '../services/emailService';

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupérer les notifications de l'utilisateur
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 */
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const unreadOnly = req.query.unread === 'true';
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE user_id = $1';
  const params: any[] = [req.user.id];

  if (unreadOnly) {
    whereClause += ' AND read_at IS NULL';
  }

  const dataQuery = `
    SELECT * FROM notifications
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) as total FROM notifications ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, [...params, limit, offset]),
    query(countQuery, params)
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      notifications: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }
  });
});

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Marquer une notification comme lue
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification marquée comme lue
 */
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  const { id } = req.params;

  // Vérifier que la notification appartient à l'utilisateur
  const notification = await query(
    'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (notification.rows.length === 0) {
    throw createError('Notification non trouvée', 404);
  }

  // Marquer comme lue
  await query(
    'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );

  res.status(200).json({
    success: true,
    message: 'Notification marquée comme lue'
  });
});

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Marquer toutes les notifications comme lues
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Toutes les notifications marquées comme lues
 */
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  await query(
    'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND read_at IS NULL',
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    message: 'Toutes les notifications marquées comme lues'
  });
});

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification supprimée
 */
export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  const { id } = req.params;

  // Vérifier que la notification appartient à l'utilisateur
  const notification = await query(
    'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
    [id, req.user.id]
  );

  if (notification.rows.length === 0) {
    throw createError('Notification non trouvée', 404);
  }

  await query('DELETE FROM notifications WHERE id = $1', [id]);

  res.status(200).json({
    success: true,
    message: 'Notification supprimée'
  });
});

/**
 * @swagger
 * /notifications/preferences:
 *   get:
 *     summary: Récupérer les préférences de notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Préférences de notification
 */
export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  const result = await query(
    'SELECT * FROM notification_preferences WHERE user_id = $1',
    [req.user.id]
  );

  let preferences;
  if (result.rows.length === 0) {
    // Créer des préférences par défaut
    const defaultPrefs = await query(`
      INSERT INTO notification_preferences (user_id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips)
      VALUES ($1, true, false, true, false, true)
      RETURNING *
    `, [req.user.id]);
    preferences = defaultPrefs.rows[0];
  } else {
    preferences = result.rows[0];
  }

  res.status(200).json({
    success: true,
    data: { preferences }
  });
});

/**
 * @swagger
 * /notifications/preferences:
 *   put:
 *     summary: Mettre à jour les préférences de notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Préférences mises à jour
 */
export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw createError('Utilisateur non authentifié', 401);
  }

  const {
    check_unusual_activity,
    check_new_sign_in,
    notify_latest_news,
    notify_feature_update,
    notify_account_tips
  } = req.body;

  const result = await query(`
    UPDATE notification_preferences 
    SET 
      check_unusual_activity = $2,
      check_new_sign_in = $3,
      notify_latest_news = $4,
      notify_feature_update = $5,
      notify_account_tips = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
  `, [req.user.id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips]);

  if (result.rows.length === 0) {
    // Créer si n'existe pas
    const newPrefs = await query(`
      INSERT INTO notification_preferences (user_id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips]);
    
    res.status(200).json({
      success: true,
      message: 'Préférences créées avec succès',
      data: { preferences: newPrefs.rows[0] }
    });
  } else {
    res.status(200).json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      data: { preferences: result.rows[0] }
    });
  }
});

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Envoyer une notification (admin seulement)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notification envoyée
 */
export const sendNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user_id, type, message, data, send_email } = req.body;

  // Créer la notification en base
  const result = await query(`
    INSERT INTO notifications (user_id, type, message, data)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [user_id, type, message, JSON.stringify(data || {})]);

  const notification = result.rows[0];

  // Envoyer par email si demandé
  if (send_email) {
    try {
      const userResult = await query('SELECT email, nom, prenom FROM utilisateur WHERE id = $1', [user_id]);
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        await sendNotificationEmail(user.email, `ProgiTek - ${type}`, message);
      }
    } catch (error) {
      console.error('Erreur envoi email notification:', error);
    }
  }

  // Logger l'audit
  if (req.user) {
    await logAudit(
      req.user.id,
      req.user.email,
      'CREATE',
      'Notification',
      notification.id,
      `Envoi de notification: ${type}`,
      req.ip
    );
  }

  res.status(201).json({
    success: true,
    message: 'Notification envoyée avec succès',
    data: { notification }
  });
});