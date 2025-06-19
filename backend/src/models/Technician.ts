export interface Specialite {
  id: number;
  libelle: string;
}

export interface Technicien {
  id: number;
  nom?: string | null;
  prenom?: string | null;
  contact?: string | null;
  specialite_id?: number | null;
}

export interface TechnicienWithSpecialite extends Technicien {
  specialite?: Specialite;
}

export interface CreateTechnicienRequest {
  nom: string;
  prenom: string;
  contact?: string;
  specialite_id: number;
}

export interface UpdateTechnicienRequest {
  nom?: string;
  prenom?: string;
  contact?: string;
  specialite_id?: number;
}

export interface TechniciensListResponse {
  success: boolean;
  data: {
    techniciens: TechnicienWithSpecialite[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}