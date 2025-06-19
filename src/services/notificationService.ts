import { api } from './api';
import { Notification, NotificationPreferences } from '../types';

export const notificationService = {
  async getNotifications(page = 1, limit = 20, unreadOnly = false): Promise<{ notifications: Notification[]; total: number }> {
    const response = await api.get('/notifications', {
      params: { page, limit, unread: unreadOnly }
    });
    return response.data;
  },

  async markAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  },

  async deleteNotification(notificationId: number): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },

  async sendNotification(notification: {
    user_id: number;
    type: string;
    message: string;
    data?: any;
    send_email?: boolean;
  }): Promise<Notification> {
    const response = await api.post('/notifications/send', notification);
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }
};