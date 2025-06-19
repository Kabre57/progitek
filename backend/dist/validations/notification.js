"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferencesSchema = exports.sendNotificationSchema = void 0;
const zod_1 = require("zod");
exports.sendNotificationSchema = zod_1.z.object({
    user_id: zod_1.z
        .number()
        .int('L\'ID utilisateur doit être un entier')
        .positive('L\'ID utilisateur doit être positif'),
    type: zod_1.z
        .string()
        .min(1, 'Le type est requis'),
    message: zod_1.z
        .string()
        .min(1, 'Le message est requis'),
    data: zod_1.z
        .object({})
        .optional(),
    send_email: zod_1.z
        .boolean()
        .optional()
});
exports.updatePreferencesSchema = zod_1.z.object({
    check_unusual_activity: zod_1.z.boolean(),
    check_new_sign_in: zod_1.z.boolean(),
    notify_latest_news: zod_1.z.boolean(),
    notify_feature_update: zod_1.z.boolean(),
    notify_account_tips: zod_1.z.boolean()
});
//# sourceMappingURL=notification.js.map