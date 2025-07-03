export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T = any> extends ApiResponse {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
  client?: any;
  mission?: any;
  validateur?: any;
  facture?: any;
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
  devisId: number;
  clientId: number;
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
  client?: any;
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

export interface Document {
  id: number;
  title: string;
  type: string;
  url: string;
  missionId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  mission?: any;
  createdBy?: any;
}