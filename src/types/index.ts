export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  theme?: string;
  display_name?: string;
  phone?: string;
  status?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  libelle: string;
}

export interface Specialite {
  id: number;
  libelle: string;
}

export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  type_de_carte?: string;
  statut?: string;
  date_d_inscription: string;
  localisation?: string;
}

export interface Technicien {
  id: number;
  nom: string;
  prenom: string;
  contact?: string;
  specialite?: Specialite;
}

export interface Mission {
  num_intervention: number;
  nature_intervention?: string;
  objectif_du_contrat?: string;
  description?: string;
  date_sortie_fiche_intervention?: string;
  client: Client;
}

export interface Intervention {
  id: number;
  date_heure_debut?: string;
  date_heure_fin?: string;
  duree?: number;
  mission: Mission;
  technicien?: Technicien;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: number;
  check_unusual_activity: boolean;
  check_new_sign_in: boolean;
  notify_latest_news: boolean;
  notify_feature_update: boolean;
  notify_account_tips: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalTechniciens: number;
  totalMissions: number;
  totalInterventions: number;
  activeInterventions: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}