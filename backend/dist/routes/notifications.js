"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const notification_1 = require("../validations/notification");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', notificationController_1.getNotifications);
router.patch('/:id/read', notificationController_1.markAsRead);
router.patch('/mark-all-read', notificationController_1.markAllAsRead);
router.delete('/:id', notificationController_1.deleteNotification);
router.get('/preferences', notificationController_1.getPreferences);
router.put('/preferences', (0, validation_1.validateBody)(notification_1.updatePreferencesSchema), notificationController_1.updatePreferences);
router.post('/send', (0, auth_1.authorizeRoles)('Administrator'), (0, validation_1.validateBody)(notification_1.sendNotificationSchema), notificationController_1.sendNotification);
exports.default = router;
//# sourceMappingURL=notifications.js.map