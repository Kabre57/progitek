import { api } from './api';

export const exportService = {
  async exportData(type: 'users' | 'clients' | 'technicians' | 'missions' | 'interventions', format: 'csv' | 'excel' | 'pdf' = 'csv', filters?: any): Promise<Blob> {
    const response = await api.get(`/export/${type}`, {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportCustomReport(data: any[], filename: string, format: 'csv' | 'excel' = 'csv'): Promise<void> {
    const response = await api.post('/export/custom', {
      data,
      filename,
      format
    }, {
      responseType: 'blob'
    });

    // Télécharger le fichier
    const blob = new Blob([response.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportInterventionReport(interventionId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/export/intervention/${interventionId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportMissionReport(missionId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/export/mission/${missionId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportClientReport(clientId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/export/client/${clientId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async exportTechnicianReport(technicianId: number, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await api.get(`/export/technician/${technicianId}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};