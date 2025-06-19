import { api } from './api';
import { Client } from '../types';

export const clientService = {
  async getClients(page = 1, limit = 10, search?: string): Promise<{ clients: Client[]; total: number }> {
    const response = await api.get('/clients', {
      params: { page, limit, search }
    });
    return response.data;
  },

  async getClientById(id: number): Promise<Client> {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  async createClient(clientData: Partial<Client>): Promise<Client> {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },

  async deleteClient(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  }
};