import { api } from './api';

export const searchService = {
  async globalSearch(query: string, filters?: {
    types?: string[];
    limit?: number;
  }): Promise<{
    users: any[];
    clients: any[];
    technicians: any[];
    missions: any[];
    interventions: any[];
    total: number;
  }> {
    const response = await api.get('/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  async searchUsers(query: string, limit = 10): Promise<any[]> {
    const response = await api.get('/search/users', {
      params: { q: query, limit }
    });
    return response.data;
  },

  async searchClients(query: string, limit = 10): Promise<any[]> {
    const response = await api.get('/search/clients', {
      params: { q: query, limit }
    });
    return response.data;
  },

  async searchTechnicians(query: string, limit = 10): Promise<any[]> {
    const response = await api.get('/search/technicians', {
      params: { q: query, limit }
    });
    return response.data;
  },

  async searchMissions(query: string, limit = 10): Promise<any[]> {
    const response = await api.get('/search/missions', {
      params: { q: query, limit }
    });
    return response.data;
  },

  async searchInterventions(query: string, limit = 10): Promise<any[]> {
    const response = await api.get('/search/interventions', {
      params: { q: query, limit }
    });
    return response.data;
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await api.get('/search/suggestions', {
      params: { q: query }
    });
    return response.data;
  },

  async saveSearch(query: string, filters?: any): Promise<any> {
    const response = await api.post('/search/save', {
      query,
      filters
    });
    return response.data;
  },

  async getSavedSearches(): Promise<any[]> {
    const response = await api.get('/search/saved');
    return response.data;
  }
};