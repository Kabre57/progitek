import { apiClient } from './api';
import { Intervention, PaginatedResponse } from '../types/api';

export interface CreateInterventionData {
  dateHeureDebut?: string;
  dateHeureFin?: string;
  duree?: number;
  missionId: number;
  technicienId?: number;
}

class InterventionService {
  // Lister les interventions
  async getInterventions(page = 1, limit = 10): Promise<PaginatedResponse<Intervention>> {
    const response = await apiClient.get(`/interventions?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Créer une intervention
  async createIntervention(interventionData: CreateInterventionData): Promise<Intervention> {
    const response = await apiClient.post('/interventions', interventionData);
    return response.data.data;
  }

  // Récupérer une intervention par ID
  async getInterventionById(id: number): Promise<Intervention> {
    const response = await apiClient.get(`/interventions/${id}`);
    return response.data.data;
  }

  // Modifier une intervention
  async updateIntervention(id: number, interventionData: Partial<CreateInterventionData>): Promise<Intervention> {
    const response = await apiClient.put(`/interventions/${id}`, interventionData);
    return response.data.data;
  }

  // Supprimer une intervention
  async deleteIntervention(id: number): Promise<void> {
    await apiClient.delete(`/interventions/${id}`);
  }
}

export const interventionService = new InterventionService();