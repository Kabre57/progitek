"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.updatePreferences = exports.getPreferences = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middleware/errorHandler");
const auditService_1 = require("../services/auditService");
const emailService_1 = require("../services/emailService");
exports.getNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE user_id = $1';
    const params = [req.user.id];
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
        (0, database_1.query)(dataQuery, [...params, limit, offset]),
        (0, database_1.query)(countQuery, params)
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
exports.markAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const { id } = req.params;
    const notification = await (0, database_1.query)('SELECT id FROM notifications WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (notification.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Notification non trouvée', 404);
    }
    await (0, database_1.query)('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue'
    });
});
exports.markAllAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    await (0, database_1.query)('UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND read_at IS NULL', [req.user.id]);
    res.status(200).json({
        success: true,
        message: 'Toutes les notifications marquées comme lues'
    });
});
exports.deleteNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const { id } = req.params;
    const notification = await (0, database_1.query)('SELECT id FROM notifications WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (notification.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Notification non trouvée', 404);
    }
    await (0, database_1.query)('DELETE FROM notifications WHERE id = $1', [id]);
    res.status(200).json({
        success: true,
        message: 'Notification supprimée'
    });
});
exports.getPreferences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const result = await (0, database_1.query)('SELECT * FROM notification_preferences WHERE user_id = $1', [req.user.id]);
    let preferences;
    if (result.rows.length === 0) {
        const defaultPrefs = await (0, database_1.query)(`
      INSERT INTO notification_preferences (user_id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips)
      VALUES ($1, true, false, true, false, true)
      RETURNING *
    `, [req.user.id]);
        preferences = defaultPrefs.rows[0];
    }
    else {
        preferences = result.rows[0];
    }
    res.status(200).json({
        success: true,
        data: { preferences }
    });
});
exports.updatePreferences = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw (0, errorHandler_1.createError)('Utilisateur non authentifié', 401);
    }
    const { check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips } = req.body;
    const result = await (0, database_1.query)(`
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
        const newPrefs = await (0, database_1.query)(`
      INSERT INTO notification_preferences (user_id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, check_unusual_activity, check_new_sign_in, notify_latest_news, notify_feature_update, notify_account_tips]);
        res.status(200).json({
            success: true,
            message: 'Préférences créées avec succès',
            data: { preferences: newPrefs.rows[0] }
        });
    }
    else {
        res.status(200).json({
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: { preferences: result.rows[0] }
        });
    }
});
exports.sendNotification = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { user_id, type, message, data, send_email } = req.body;
    const result = await (0, database_1.query)(`
    INSERT INTO notifications (user_id, type, message, data)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [user_id, type, message, JSON.stringify(data || {})]);
    const notification = result.rows[0];
    if (send_email) {
        try {
            const userResult = await (0, database_1.query)('SELECT email, nom, prenom FROM utilisateur WHERE id = $1', [user_id]);
            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                await (0, emailService_1.sendNotificationEmail)(user.email, `ProgiTek - ${type}`, message);
            }
        }
        catch (error) {
            console.error('Erreur envoi email notification:', error);
        }
    }
    if (req.user) {
        await (0, auditService_1.logAudit)(req.user.id, req.user.email, 'CREATE', 'Notification', notification.id, `Envoi de notification: ${type}`, req.ip);
    }
    res.status(201).json({
        success: true,
        message: 'Notification envoyée avec succès',
        data: { notification }
    });
});
//# sourceMappingURL=notificationController.js.map