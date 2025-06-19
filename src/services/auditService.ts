import { api } from './api';

export const auditService = {
  async getAuditLogs(page = 1, limit = 50, filters?: {
    userId?: number;
    actionType?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ logs: any[]; total: number }> {
    const response = await api.get('/audit/logs', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  async getAuditStats(): Promise<any> {
    const response = await api.get('/audit/stats');
    return response.data;
  },

  async getActivityLogs(userId?: number, limit = 10): Promise<any[]> {
    const response = await api.get('/audit/activity', {
      params: { user_id: userId, limit }
    });
    return response.data;
  },

  async getSecurityEvents(severity?: 'low' | 'medium' | 'high'): Promise<any[]> {
    const response = await api.get('/audit/security', {
      params: { severity }
    });
    return response.data;
  },

  async exportAuditLogs(filters?: any, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await api.get('/audit/export', {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  }
};