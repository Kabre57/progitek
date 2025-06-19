export interface Client {
  id: number;
  nom: string;
  theme?: string | null;
  email: string;
  telephone?: string | null;
  entreprise?: string | null;
  type_de_carte?: string | null;
  numero_de_carte?: string | null;
  date_d_inscription: Date;
  statut?: string | null;
  image?: string | null;
  localisation?: string | null;
}

export interface CreateClientRequest {
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  type_de_carte?: string;
  numero_de_carte?: string;
  statut?: string;
  localisation?: string;
  theme?: string;
}

export interface UpdateClientRequest {
  nom?: string;
  email?: string;
  telephone?: string;
  entreprise?: string;
  type_de_carte?: string;
  numero_de_carte?: string;
  statut?: string;
  localisation?: string;
  theme?: string;
}

export interface ClientsListResponse {
  success: boolean;
  data: {
    clients: Client[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}