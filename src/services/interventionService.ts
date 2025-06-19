import { api } from './api';
import { Intervention } from '../types';

export const interventionService = {
  async getInterventions(page = 1, limit = 10, search?: string, filters?: any): Promise<{ interventions: Intervention[]; total: number }> {
    const response = await api.get('/interventions', {
      params: { page, limit, search, ...filters }
    });
    return response.data;
  },

  async getInterventionById(id: number): Promise<Intervention> {
    const response = await api.get(`/interventions/${id}`);
    return response.data;
  },

  async createIntervention(interventionData: Partial<Intervention>): Promise<Intervention> {
    const response = await api.post('/interventions', interventionData);
    return response.data;
  },

  async updateIntervention(id: number, interventionData: Partial<Intervention>): Promise<Intervention> {
    const response = await api.put(`/interventions/${id}`, interventionData);
    return response.data;
  },

  async deleteIntervention(id: number): Promise<void> {
    await api.delete(`/interventions/${id}`);
  },

  async completeIntervention(id: number, endDate?: string): Promise<Intervention> {
    const response = await api.patch(`/interventions/${id}/complete`, {
      date_heure_fin: endDate || new Date().toISOString()
    });
    return response.data;
  },

  async getInterventionsByTechnician(technicianId: number): Promise<Intervention[]> {
    const response = await api.get(`/interventions/technician/${technicianId}`);
    return response.data;
  },

  async getInterventionsByMission(missionId: number): Promise<Intervention[]> {
    const response = await api.get(`/interventions/mission/${missionId}`);
    return response.data;
  },

  async getInterventionStats(): Promise<any> {
    const response = await api.get('/interventions/stats');
    return response.data;
  }
};