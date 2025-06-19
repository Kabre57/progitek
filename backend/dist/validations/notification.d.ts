import { z } from 'zod';
export declare const sendNotificationSchema: z.ZodObject<{
    user_id: z.ZodNumber;
    type: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>>;
    send_email: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: string;
    user_id: number;
    message: string;
    data?: {} | undefined;
    send_email?: boolean | undefined;
}, {
    type: string;
    user_id: number;
    message: string;
    data?: {} | undefined;
    send_email?: boolean | undefined;
}>;
export declare const updatePreferencesSchema: z.ZodObject<{
    check_unusual_activity: z.ZodBoolean;
    check_new_sign_in: z.ZodBoolean;
    notify_latest_news: z.ZodBoolean;
    notify_feature_update: z.ZodBoolean;
    notify_account_tips: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    check_unusual_activity: boolean;
    check_new_sign_in: boolean;
    notify_latest_news: boolean;
    notify_feature_update: boolean;
    notify_account_tips: boolean;
}, {
    check_unusual_activity: boolean;
    check_new_sign_in: boolean;
    notify_latest_news: boolean;
    notify_feature_update: boolean;
    notify_account_tips: boolean;
}>;
//# sourceMappingURL=notification.d.ts.map