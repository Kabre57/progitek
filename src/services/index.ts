// Export de tous les services pour un import centralisé
export { authService } from './authService';
export { userService } from './userService';
export { clientService } from './clientService';
export { technicianService } from './technicianService';
export { missionService } from './missionService';
export { interventionService } from './interventionService';
export { notificationService } from './notificationService';
export { reportService } from './reportService';
export { auditService } from './auditService';
export { validationService } from './validationService';
export { settingsService } from './settingsService';
export { fileService } from './fileService';
export { searchService } from './searchService';
export { exportService } from './exportService';
export { cacheService } from './cacheService';
export { websocketService } from './websocketService';
export { dashboardService } from './dashboardService';
export { api } from './api';

// Types pour les services
export interface ServiceResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
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

export interface ApiError {
  message: string;
  status: number;
  errors?: any;
}

// Utilitaires pour les services
export const createServiceError = (message: string, status: number, errors?: any): ApiError => ({
  message,
  status,
  errors
});

export const handleServiceResponse = <T>(response: any): T => {
  if (response.data?.success === false) {
    throw createServiceError(
      response.data.message || 'Erreur inconnue',
      response.status || 500,
      response.data.errors
    );
  }
  return response.data?.data || response.data;
};

// Configuration globale des services
export const configureServices = (config: {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
}) => {
  // Configuration de l'API
  if (config.baseURL) {
    api.defaults.baseURL = config.baseURL;
  }
  
  if (config.timeout) {
    api.defaults.timeout = config.timeout;
  }

  // Configuration du WebSocket
  if (config.baseURL) {
    const wsUrl = config.baseURL.replace('http', 'ws');
    // websocketService.configure({ url: wsUrl });
  }
};