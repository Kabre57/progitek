import { z } from 'zod';

export const sendNotificationSchema = z.object({
  user_id: z
    .number()
    .int('L\'ID utilisateur doit être un entier')
    .positive('L\'ID utilisateur doit être positif'),
  type: z
    .string()
    .min(1, 'Le type est requis'),
  message: z
    .string()
    .min(1, 'Le message est requis'),
  data: z
    .object({})
    .optional(),
  send_email: z
    .boolean()
    .optional()
});

export const updatePreferencesSchema = z.object({
  check_unusual_activity: z.boolean(),
  check_new_sign_in: z.boolean(),
  notify_latest_news: z.boolean(),
  notify_feature_update: z.boolean(),
  notify_account_tips: z.boolean()
});