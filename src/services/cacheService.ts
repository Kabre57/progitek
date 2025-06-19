interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut

  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Nettoie automatiquement les éléments expirés
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Obtient les statistiques du cache
  getStats(): {
    size: number;
    expired: number;
    hitRate: number;
  } {
    const now = Date.now();
    let expired = 0;
    
    for (const item of this.cache.values()) {
      if (now > item.expiry) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      expired,
      hitRate: this.cache.size > 0 ? ((this.cache.size - expired) / this.cache.size) * 100 : 0
    };
  }

  // Méthodes utilitaires pour les clés de cache communes
  getUserKey(userId: number): string {
    return `user_${userId}`;
  }

  getClientKey(clientId: number): string {
    return `client_${clientId}`;
  }

  getTechnicianKey(technicianId: number): string {
    return `technician_${technicianId}`;
  }

  getMissionKey(missionId: number): string {
    return `mission_${missionId}`;
  }

  getInterventionKey(interventionId: number): string {
    return `intervention_${interventionId}`;
  }

  getListKey(type: string, page: number, limit: number, filters?: any): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `${type}_list_${page}_${limit}_${filterStr}`;
  }
}

export const cacheService = new CacheService();

// Nettoyage automatique toutes les 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);