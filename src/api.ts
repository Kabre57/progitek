import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes de timeout
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur dans la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur de réponse API:', error);
    
    if (error.response?.status === 401) {
      // Ne pas déconnecter en mode démo
      const token = localStorage.getItem('token');
      if (!token?.startsWith('demo-token')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Si le serveur backend n'est pas disponible
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.warn('Backend non disponible, utilisation du mode démo');
      // Vous pouvez retourner des données mockées ici
    }
    
    return Promise.reject(error);
  }
);

export default api;