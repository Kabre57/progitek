import { api } from './api';

export const fileService = {
  async uploadFile(file: File, type: 'avatar' | 'document' | 'image' = 'document'): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async uploadMultipleFiles(files: File[], type: 'avatar' | 'document' | 'image' = 'document'): Promise<{ url: string; filename: string }[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', type);

    const response = await api.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async deleteFile(filename: string): Promise<void> {
    await api.delete(`/files/${filename}`);
  },

  async getFileUrl(filename: string): Promise<string> {
    const response = await api.get(`/files/url/${filename}`);
    return response.data.url;
  },

  async downloadFile(filename: string): Promise<Blob> {
    const response = await api.get(`/files/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async getFileInfo(filename: string): Promise<any> {
    const response = await api.get(`/files/info/${filename}`);
    return response.data;
  }
};