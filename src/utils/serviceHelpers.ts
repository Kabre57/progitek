import { cacheService } from '../services/cacheService';
import toast from 'react-hot-toast';

// Utilitaires pour la gestion des erreurs
export const handleServiceError = (error: any, showToast = true) => {
  console.error('Service Error:', error);
  
  let message = 'Une erreur est survenue';
  
  if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  if (showToast) {
    toast.error(message);
  }

  return {
    message,
    status: error.response?.status || 500,
    details: error.response?.data || error
  };
};

// Utilitaires pour la mise en cache
export const createCacheKey = (prefix: string, params: any = {}) => {
  const paramString = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return paramString ? `${prefix}_${paramString}` : prefix;
};

// Utilitaires pour les requêtes avec retry
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }

      // Attendre avant la prochaine tentative
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Utilitaires pour la validation des données
export const validateServiceResponse = (response: any, expectedFields: string[] = []) => {
  if (!response) {
    throw new Error('Réponse vide du serveur');
  }

  if (response.success === false) {
    throw new Error(response.message || 'Erreur du serveur');
  }

  if (expectedFields.length > 0) {
    const data = response.data || response;
    const missingFields = expectedFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      throw new Error(`Champs manquants dans la réponse: ${missingFields.join(', ')}`);
    }
  }

  return response;
};

// Utilitaires pour la transformation des données
export const transformApiResponse = <T>(response: any, transformer?: (data: any) => T): T => {
  const data = response.data || response;
  return transformer ? transformer(data) : data;
};

// Utilitaires pour la gestion des filtres
export const buildQueryParams = (filters: Record<string, any>) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, String(value));
      }
    }
  });

  return params;
};

// Utilitaires pour la pagination
export const calculatePagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    showing: `${startIndex + 1}-${endIndex} sur ${total}`
  };
};

// Utilitaires pour le debouncing des requêtes
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Utilitaires pour la gestion des uploads
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
} = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB par défaut
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    maxFiles = 1
  } = options;

  const errors: string[] = [];

  if (file.size > maxSize) {
    errors.push(`Le fichier est trop volumineux (max: ${maxSize / 1024 / 1024}MB)`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`Type de fichier non autorisé (autorisés: ${allowedTypes.join(', ')})`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utilitaires pour la gestion des dates
export const formatDateForApi = (date: Date | string) => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString();
};

export const parseDateFromApi = (dateString: string) => {
  return new Date(dateString);
};

// Utilitaires pour la gestion des erreurs réseau
export const isNetworkError = (error: any) => {
  return !error.response && error.request;
};

export const isServerError = (error: any) => {
  return error.response && error.response.status >= 500;
};

export const isClientError = (error: any) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};

// Utilitaires pour les notifications
export const showSuccessNotification = (message: string) => {
  toast.success(message);
};

export const showErrorNotification = (message: string) => {
  toast.error(message);
};

export const showInfoNotification = (message: string) => {
  toast(message, { icon: 'ℹ️' });
};

export const showWarningNotification = (message: string) => {
  toast(message, { icon: '⚠️' });
};