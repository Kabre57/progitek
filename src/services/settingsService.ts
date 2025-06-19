import { api } from './api';

export const settingsService = {
  async getSystemSettings(): Promise<any> {
    const response = await api.get('/settings/system');
    return response.data;
  },

  async updateSystemSettings(settings: any): Promise<any> {
    const response = await api.put('/settings/system', settings);
    return response.data;
  },

  async getUserSettings(userId?: number): Promise<any> {
    const url = userId ? `/settings/user/${userId}` : '/settings/user';
    const response = await api.get(url);
    return response.data;
  },

  async updateUserSettings(settings: any, userId?: number): Promise<any> {
    const url = userId ? `/settings/user/${userId}` : '/settings/user';
    const response = await api.put(url, settings);
    return response.data;
  },

  async getEmailTemplates(): Promise<any[]> {
    const response = await api.get('/settings/email-templates');
    return response.data;
  },

  async updateEmailTemplate(templateId: number, template: any): Promise<any> {
    const response = await api.put(`/settings/email-templates/${templateId}`, template);
    return response.data;
  },

  async getBackupSettings(): Promise<any> {
    const response = await api.get('/settings/backup');
    return response.data;
  },

  async updateBackupSettings(settings: any): Promise<any> {
    const response = await api.put('/settings/backup', settings);
    return response.data;
  },

  async testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/settings/test-email');
    return response.data;
  }
};