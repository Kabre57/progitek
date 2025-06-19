import { api } from './api';

export const reportService = {
  async getReports(page = 1, limit = 10, type?: string): Promise<{ reports: any[]; total: number }> {
    const response = await api.get('/reports', {
      params: { page, limit, type }
    });
    return response.data;
  },

  async generateReport(reportData: {
    report_type: 'activity' | 'interventions' | 'clients' | 'technicians' | 'performance';
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const response = await api.post('/reports/generate', reportData);
    return response.data;
  },

  async getDashboardData(): Promise<any> {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  async exportReport(reportId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async getActivityReport(startDate?: string, endDate?: string): Promise<any> {
    const response = await api.get('/reports/activity', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getPerformanceReport(startDate?: string, endDate?: string): Promise<any> {
    const response = await api.get('/reports/performance', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getClientReport(clientId?: number): Promise<any> {
    const response = await api.get('/reports/clients', {
      params: { client_id: clientId }
    });
    return response.data;
  },

  async getTechnicianReport(technicianId?: number): Promise<any> {
    const response = await api.get('/reports/technicians', {
      params: { technician_id: technicianId }
    });
    return response.data;
  }
};