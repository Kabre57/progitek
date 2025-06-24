import { apiClient } from './api';
import { Technicien, Specialite, PaginatedResponse } from '../types/api';

export interface CreateTechnicianData {
  nom: string;
  prenom: string;
  contact?: string;
  specialiteId?: number;
}

class TechnicianService {
  // Lister les techniciens
  async getTechnicians(page = 1, limit = 10): Promise<PaginatedResponse<Technicien>> {
    const response = await apiClient.get(`/technicians?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Créer un technicien
  async createTechnician(technicianData: CreateTechnicianData): Promise<Technicien> {
    const response = await apiClient.post('/technicians', technicianData);
    return response.data.data;
  }

  // Récupérer un technicien par ID
  async getTechnicianById(id: number): Promise<Technicien> {
    const response = await apiClient.get(`/technicians/${id}`);
    return response.data.data;
  }

  // Modifier un technicien
  async updateTechnician(id: number, technicianData: Partial<CreateTechnicianData>): Promise<Technicien> {
    const response = await apiClient.put(`/technicians/${id}`, technicianData);
    return response.data.data;
  }

  // Supprimer un technicien
  async deleteTechnician(id: number): Promise<void> {
    await apiClient.delete(`/technicians/${id}`);
  }

  // Récupérer les spécialités
  async getSpecialites(): Promise<Specialite[]> {
    const response = await apiClient.get('/specialites');
    return response.data.data;
  }
}

export const technicianService = new TechnicianService();