import { useEffect, useState } from 'react';
import apiClient from '../services/api'; // baseURL = https://pblserver.taile0fd44.ts.net
import toast from 'react-hot-toast';

export function useBackendStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get('/api/health');
        setIsOnline(response.status === 200);
      } catch (error) {
        console.error('❌ Erreur connexion backend: ', error);
        toast.error('Connexion au backend échouée');
        setIsOnline(false);
      }
    };

    checkHealth();
  }, []);

  return isOnline;
}
