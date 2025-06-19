import { api } from './api';

export const validationService = {
  async getValidations(page = 1, limit = 10, status?: string): Promise<{ validations: any[]; total: number }> {
    const response = await api.get('/validations', {
      params: { page, limit, status }
    });
    return response.data;
  },

  async createValidation(validationData: {
    entity_type: string;
    entity_id: number;
    assigned_validator_id?: number;
    comments?: string;
  }): Promise<any> {
    const response = await api.post('/validations', validationData);
    return response.data;
  },

  async updateValidation(id: number, validationData: {
    status?: string;
    assigned_validator_id?: number;
    validated_by_user_id?: number;
    comments?: string;
  }): Promise<any> {
    const response = await api.put(`/validations/${id}`, validationData);
    return response.data;
  },

  async approveValidation(id: number, comments?: string): Promise<any> {
    const response = await api.patch(`/validations/${id}/approve`, { comments });
    return response.data;
  },

  async rejectValidation(id: number, comments: string): Promise<any> {
    const response = await api.patch(`/validations/${id}/reject`, { comments });
    return response.data;
  },

  async getValidationsByUser(userId: number): Promise<any[]> {
    const response = await api.get(`/validations/user/${userId}`);
    return response.data;
  },

  async getPendingValidations(): Promise<any[]> {
    const response = await api.get('/validations/pending');
    return response.data;
  }
};