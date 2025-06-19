import { api } from './api';
import { User, Role } from '../types';

export const userService = {
  async getUsers(page = 1, limit = 10, search?: string): Promise<{ users: User[]; total: number }> {
    const response = await api.get('/users', {
      params: { page, limit, search }
    });
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getRoles(): Promise<Role[]> {
    const response = await api.get('/roles');
    return response.data;
  }
};