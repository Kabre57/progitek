import { z } from 'zod';

export const sendNotificationSchema = z.object({
  body: z.object({
    userId: z.number().int().positive(),
    type: z.string().min(1, 'Le type est requis'),
    message: z.string().min(1, 'Le message est requis'),
    data: z.any().optional(),
  }),
});

export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    checkUnusualActivity: z.boolean().optional(),
    checkNewSignIn: z.boolean().optional(),
    notifyLatestNews: z.boolean().optional(),
    notifyFeatureUpdate: z.boolean().optional(),
    notifyAccountTips: z.boolean().optional(),
  }),
});