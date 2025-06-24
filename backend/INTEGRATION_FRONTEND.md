# 🔗 Guide d'Intégration Frontend - API ParabellumGroups System

## 🎯 Vue d'ensemble

Ce guide explique comment intégrer l'API ParabellumGroups System avec un frontend (React, Vue, Angular, etc.).

## ⚙️ Configuration Frontend

### Variables d'Environnement
```env
# .env (Frontend)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_VERSION=v1
VITE_APP_NAME=ParabellumGroups System
```

### Configuration Axios (Recommandé)
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Instance Axios configurée
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token automatiquement
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data.tokens;
        localStorage.setItem('accessToken', accessToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Rediriger vers la page de connexion
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## 🔐 Service d'Authentification

### AuthService
```typescript
// src/services/authService.ts
import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  phone?: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  phone?: string;
  role: {
    id: number;
    libelle: string;
  };
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    const { user, tokens } = response.data.data;

    // Stocker les tokens
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  }

  // Inscription
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);
    const { user, tokens } = response.data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Récupérer le profil
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  }

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Récupérer l'utilisateur depuis le localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Vérifier le rôle
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role.libelle === role;
  }
}

export const authService = new AuthService();
```

## 👥 Service de Gestion des Utilisateurs

### UserService
```typescript
// src/services/userService.ts
import { apiClient } from './api';

export interface CreateUserData {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  phone?: string;
  roleId: number;
}

export interface UpdateUserData {
  nom?: string;
  prenom?: string;
  phone?: string;
  theme?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UserService {
  // Lister les utilisateurs (Admin)
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Créer un utilisateur (Admin)
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data.data;
  }

  // Récupérer un utilisateur par ID (Admin)
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  }

  // Modifier un utilisateur (Admin)
  async updateUser(id: number, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data.data;
  }

  // Supprimer un utilisateur (Admin)
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  // Modifier son profil
  async updateProfile(userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put('/users/profile', userData);
    return response.data.data;
  }

  // Récupérer les rôles
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get('/users/roles');
    return response.data.data;
  }
}

export const userService = new UserService();
```

## 🏢 Service de Gestion des Clients

### ClientService
```typescript
// src/services/clientService.ts
import { apiClient } from './api';

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

export interface CreateClientData {
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  typeDeCart?: string;
  statut?: 'active' | 'inactive';
  localisation?: string;
}

class ClientService {
  // Lister les clients
  async getClients(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get(`/clients?${params}`);
    return response.data;
  }

  // Créer un client
  async createClient(clientData: CreateClientData): Promise<Client> {
    const response = await apiClient.post('/clients', clientData);
    return response.data.data;
  }

  // Récupérer un client par ID
  async getClientById(id: number): Promise<Client> {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data.data;
  }

  // Modifier un client
  async updateClient(id: number, clientData: Partial<CreateClientData>): Promise<Client> {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data.data;
  }

  // Supprimer un client
  async deleteClient(id: number): Promise<void> {
    await apiClient.delete(`/clients/${id}`);
  }
}

export const clientService = new ClientService();
```

## 🔧 Service de Gestion des Techniciens

### TechnicianService
```typescript
// src/services/technicianService.ts
import { apiClient } from './api';

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
}

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
```

## 📊 Service Dashboard

### DashboardService
```typescript
// src/services/dashboardService.ts
import { apiClient } from './api';

export interface DashboardStats {
  totalClients: number;
  totalTechniciens: number;
  totalMissions: number;
  totalInterventions: number;
  missionsEnCours: number;
  interventionsEnCours: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: Array<{
    id: number;
    action: string;
    entity: string;
    user: string;
    timestamp: string;
    details: string;
  }>;
  monthlyStats: any[];
  topTechniciens: Array<{
    id: number;
    nom: string;
    prenom: string;
    specialite?: string;
    interventionsCount: number;
  }>;
}

class DashboardService {
  // Récupérer les données du dashboard
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard');
    return response.data.data;
  }

  // Générer un rapport
  async generateReport(reportType: string, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.post('/reports/generate', {
      reportType,
      startDate,
      endDate,
    });
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();
```

## 🔔 Service de Notifications

### NotificationService
```typescript
// src/services/notificationService.ts
import { apiClient } from './api';

export interface Notification {
  id: number;
  type: string;
  message: string;
  data?: string;
  readAt?: string;
  createdAt: string;
}

class NotificationService {
  // Récupérer mes notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  }

  // Marquer comme lue
  async markAsRead(id: number): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  }

  // Marquer toutes comme lues
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/mark-all-read');
  }

  // Supprimer une notification
  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }
}

export const notificationService = new NotificationService();
```

## 🛡️ Composant de Protection des Routes (React)

### ProtectedRoute
```typescript
// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const isAuthenticated = authService.isAuthenticated();
  const hasRequiredRole = requiredRole ? authService.hasRole(requiredRole) : true;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## 🎣 Hooks React Personnalisés

### useAuth Hook
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService, User } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, motDePasse: string) => {
    const response = await authService.login({ email, motDePasse });
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => user?.role.libelle === role,
  };
};
```

### useApi Hook
```typescript
// src/hooks/useApi.ts
import { useState, useEffect } from 'react';

export const useApi = <T>(apiCall: () => Promise<T>, deps: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, deps);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};
```

## 📱 Exemples d'Utilisation dans les Composants

### Composant de Connexion
```typescript
// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, motDePasse);
      // Redirection automatique via ProtectedRoute
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={motDePasse}
        onChange={(e) => setMotDePasse(e.target.value)}
        placeholder="Mot de passe"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
};
```

### Liste des Clients
```typescript
// src/components/ClientList.tsx
import React from 'react';
import { useApi } from '../hooks/useApi';
import { clientService } from '../services/clientService';

export const ClientList: React.FC = () => {
  const { data, loading, error, refetch } = useApi(
    () => clientService.getClients(1, 10),
    []
  );

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      <h2>Liste des Clients</h2>
      <button onClick={refetch}>Actualiser</button>
      
      {data?.data.map((client) => (
        <div key={client.id}>
          <h3>{client.nom}</h3>
          <p>{client.email}</p>
          <p>Statut: {client.statut}</p>
        </div>
      ))}
      
      {/* Pagination */}
      <div>
        Page {data?.pagination.page} sur {data?.pagination.totalPages}
      </div>
    </div>
  );
};
```

## 🚀 Configuration de Routage (React Router)

```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/Dashboard';
import { ClientList } from './components/ClientList';
import { UserManagement } from './pages/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute>
            <ClientList />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## 🔧 Configuration CORS Backend

Assurez-vous que votre backend autorise les requêtes depuis votre frontend :

```typescript
// backend/src/server.ts
app.use(cors({
  origin: ['http://localhost:5173', 'https://votre-domaine.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## 📝 Types TypeScript Partagés

Créez un fichier de types partagés pour maintenir la cohérence :

```typescript
// src/types/api.ts
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
```

---

**🎉 Votre frontend est maintenant prêt à communiquer avec l'API ParabellumGroups System !**

Cette intégration vous offre :
- ✅ Authentification automatique avec refresh token
- ✅ Gestion des erreurs centralisée
- ✅ Protection des routes par rôle
- ✅ Services typés pour toutes les entités
- ✅ Hooks React réutilisables
- ✅ Configuration CORS appropriée