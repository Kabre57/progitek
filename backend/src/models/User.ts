export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  role_id: number | null;
  reset_password_token?: string | null;
  reset_password_expires_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  theme?: string | null;
  display_name?: string | null;
  dob?: Date | null;
  balance?: number | null;
  phone?: string | null;
  email_status?: string | null;
  kyc_status?: string | null;
  last_login?: Date | null;
  status?: string | null;
  address?: string | null;
  state?: string | null;
  country?: string | null;
  designation?: string | null;
  projects?: any | null;
  performed?: any | null;
  tasks?: any | null;
}

export interface UserWithRole extends Omit<User, 'mot_de_passe'> {
  role?: {
    id: number;
    libelle: string;
  };
}

export interface CreateUserRequest {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  role_id: number;
  phone?: string;
  theme?: string;
  display_name?: string;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  role_id?: number;
  phone?: string;
  theme?: string;
  display_name?: string;
  status?: string;
  address?: string;
  state?: string;
  country?: string;
  designation?: string;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserWithRole;
    token: string;
    refreshToken?: string;
  };
}

export interface Role {
  id: number;
  libelle: string;
}