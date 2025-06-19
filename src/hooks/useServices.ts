import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '../services/cacheService';

interface UseServiceOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export const useService = <T>(
  serviceCall: () => Promise<T>,
  options: UseServiceOptions<T> = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const {
    cacheKey,
    cacheTTL,
    immediate = true,
    onSuccess,
    onError
  } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier le cache d'abord
      if (cacheKey) {
        const cachedData = cacheService.get<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      const result = await serviceCall();
      setData(result);

      // Mettre en cache si nécessaire
      if (cacheKey) {
        cacheService.set(cacheKey, result, cacheTTL);
      }

      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [serviceCall, cacheKey, cacheTTL, onSuccess, onError]);

  const refresh = useCallback(() => {
    if (cacheKey) {
      cacheService.delete(cacheKey);
    }
    return execute();
  }, [execute, cacheKey]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refresh
  };
};

// Hook spécialisé pour les listes paginées
export const usePaginatedService = <T>(
  serviceCall: (page: number, limit: number, filters?: any) => Promise<{ data: T[]; total: number }>,
  initialPage = 1,
  initialLimit = 10
) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<any>({});
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await serviceCall(page, limit, filters);
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [serviceCall, page, limit, filters]);

  useEffect(() => {
    execute();
  }, [execute]);

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset à la première page
  }, []);

  const updateFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset à la première page
  }, []);

  const refresh = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    total,
    loading,
    error,
    page,
    limit,
    filters,
    totalPages: Math.ceil(total / limit),
    changePage,
    changeLimit,
    updateFilters,
    refresh
  };
};

// Hook pour les notifications en temps réel
export const useRealTimeUpdates = <T>(
  type: string,
  onUpdate: (data: T) => void,
  filter?: (data: T) => boolean
) => {
  useEffect(() => {
    const { websocketService } = require('../services/websocketService');
    
    const unsubscribe = websocketService.subscribe(type, onUpdate, filter);
    
    return unsubscribe;
  }, [type, onUpdate, filter]);
};

// Hook pour la gestion des erreurs de service
export const useServiceError = () => {
  const [errors, setErrors] = useState<any[]>([]);

  const addError = useCallback((error: any) => {
    setErrors(prev => [...prev, { ...error, id: Date.now() }]);
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors(prev => prev.filter(err => err.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    addError,
    removeError,
    clearErrors
  };
};