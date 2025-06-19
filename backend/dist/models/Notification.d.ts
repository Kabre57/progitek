export interface Notification {
    id: number;
    user_id: number;
    type: string;
    message: string;
    data?: any;
    read_at?: Date | null;
    created_at: Date;
}
export interface NotificationPreferences {
    id: number;
    user_id: number;
    check_unusual_activity: boolean;
    check_new_sign_in: boolean;
    notify_latest_news: boolean;
    notify_feature_update: boolean;
    notify_account_tips: boolean;
    updated_at: Date;
}
export interface CreateNotificationRequest {
    user_id: number;
    type: string;
    message: string;
    data?: any;
    send_email?: boolean;
}
//# sourceMappingURL=Notification.d.ts.map