// Types de base pour l'API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types des entités
export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
  theme?: string;
  displayName?: string;
  address?: string;
  state?: string;
  country?: string;
  designation?: string;
  balance?: number;
  emailStatus?: string;
  kycStatus?: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  role: {
    id: number;
    libelle: string;
    description?: string;
  };
}

export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  typeDeCart?: string;
  statut: 'active' | 'inactive';
  localisation?: string;
  dateDInscription: string;
  createdAt: string;
  updatedAt: string;
}

export interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  contact?: string;
  specialiteId?: number;
  specialite?: {
    id: number;
    libelle: string;
    description?: string;
  };
  totalInterventions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Specialite {
  id: number;
  libelle: string;
  description?: string;
  totalTechniciens?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  libelle: string;
  description?: string;
  totalUtilisateurs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  numIntervention: number;
  natureIntervention: string;
  objectifDuContrat?: string;
  description?: string;
  dateSortieFicheIntervention?: string;
  clientId: number;
  client?: Client;
  interventions?: Intervention[];
  createdAt: string;
  updatedAt: string;
}

export interface Intervention {
  id: number;
  dateHeureDebut?: string;
  dateHeureFin?: string;
  duree?: number;
  missionId: number;
  technicienId?: number;
  mission?: Mission;
  technicien?: Technicien;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  data?: string;
  readAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalTechniciens: number;
  totalMissions: number;
  totalInterventions: number;
  missionsEnCours: number;
  interventionsEnCours: number;
}

export interface Devis {
  id: number;
  numero: string;
  clientId: number;
  missionId?: number;
  titre: string;
  description?: string;
  montantHT: number;
  tauxTVA: number;
  montantTTC: number;
  statut: 'brouillon' | 'envoye' | 'valide_dg' | 'refuse_dg' | 'accepte_client' | 'refuse_client' | 'facture';
  dateCreation: string;
  dateValidite: string;
  dateValidationDG?: string;
  dateReponseClient?: string;
  commentaireDG?: string;
  commentaireClient?: string;
  validePar?: number;
  factureId?: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  mission?: Mission;
  validateur?: User;
  facture?: Facture;
  lignes?: DevisLigne[];
}
export interface DevisLigne {
  id: number;
  devisId: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montantHT: number;
  ordre: number;
}

export interface Facture {
  id: number;
  numero: string;
  clientId: number;
  devisId: number;
  montantHT: number;
  tauxTVA: number;
  montantTTC: number;
  statut: 'emise' | 'envoyee' | 'payee' | 'annulee';
  dateEmission: string;
  dateEcheance: string;
  datePaiement?: string;
  modePaiement?: string;
  referenceTransaction?: string;
  createdAt: string;
  updatedAt: string;
  devis?: Devis;
  client?: Client;
  lignes?: FactureLigne[];
}


export interface FactureLigne {
  id: number;
  factureId: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montantHT: number;
  ordre: number;
}