import { Mission, MissionWithClient } from './Mission';
import { TechnicienWithSpecialite } from './Technician';

export interface Intervention {
  id: number;
  date_heure_debut?: Date | null;
  date_heure_fin?: Date | null;
  duree?: number | null;
  mission_id?: number | null;
  technicien_id?: number | null;
}

export interface InterventionWithDetails extends Intervention {
  mission?: MissionWithClient;
  technicien?: TechnicienWithSpecialite;
}

export interface CreateInterventionRequest {
  date_heure_debut?: string;
  date_heure_fin?: string;
  mission_id: number;
  technicien_id?: number;
}

export interface UpdateInterventionRequest {
  date_heure_debut?: string;
  date_heure_fin?: string;
  mission_id?: number;
  technicien_id?: number;
  duree?: number;
}

export interface InterventionsListResponse {
  success: boolean;
  data: {
    interventions: InterventionWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}