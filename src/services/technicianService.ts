import { api } from './api';
import { Technicien, Specialite } from '../types';

export const technicianService = {
  async getTechnicians(page = 1, limit = 10, search?: string, filters?: any): Promise<{ technicians: Technicien[]; total: number }> {
    const response = await api.get('/technicians', {
      params: { page, limit, search, ...filters }
    });
    return response.data;
  },

  async getTechnicianById(id: number): Promise<Technicien> {
    const response = await api.get(`/technicians/${id}`);
    return response.data;
  },

  async createTechnician(technicianData: Partial<Technicien>): Promise<Technicien> {
    const response = await api.post('/technicians', technicianData);
    return response.data;
  },

  async updateTechnician(id: number, technicianData: Partial<Technicien>): Promise<Technicien> {
    const response = await api.put(`/technicians/${id}`, technicianData);
    return response.data;
  },

  async deleteTechnician(id: number): Promise<void> {
    await api.delete(`/technicians/${id}`);
  },

  async getSpecialites(): Promise<Specialite[]> {
    const response = await api.get('/technicians/specialites');
    return response.data;
  },

  async getTechniciansBySpeciality(specialityId: number): Promise<Technicien[]> {
    const response = await api.get(`/technicians/speciality/${specialityId}`);
    return response.data;
  },

  async getTechnicianAvailability(technicianId: number, startDate: string, endDate: string): Promise<any> {
    const response = await api.get(`/technicians/${technicianId}/availability`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  async getTechnicianStats(technicianId?: number): Promise<any> {
    const url = technicianId ? `/technicians/${technicianId}/stats` : '/technicians/stats';
    const response = await api.get(url);
    return response.data;
  }
};