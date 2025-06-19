import { api } from './api';
import { Mission } from '../types';

export const missionService = {
  async getMissions(page = 1, limit = 10, search?: string, filters?: any): Promise<{ missions: Mission[]; total: number }> {
    const response = await api.get('/missions', {
      params: { page, limit, search, ...filters }
    });
    return response.data;
  },

  async getMissionById(id: number): Promise<Mission> {
    const response = await api.get(`/missions/${id}`);
    return response.data;
  },

  async createMission(missionData: Partial<Mission>): Promise<Mission> {
    const response = await api.post('/missions', missionData);
    return response.data;
  },

  async updateMission(id: number, missionData: Partial<Mission>): Promise<Mission> {
    const response = await api.put(`/missions/${id}`, missionData);
    return response.data;
  },

  async deleteMission(id: number): Promise<void> {
    await api.delete(`/missions/${id}`);
  },

  async getMissionsByClient(clientId: number): Promise<Mission[]> {
    const response = await api.get(`/missions/client/${clientId}`);
    return response.data;
  },

  async getMissionStats(): Promise<any> {
    const response = await api.get('/missions/stats');
    return response.data;
  },

  async assignTechnician(missionId: number, technicianId: number): Promise<Mission> {
    const response = await api.patch(`/missions/${missionId}/assign`, {
      technicien_id: technicianId
    });
    return response.data;
  }
};