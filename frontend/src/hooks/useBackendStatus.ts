import { useEffect, useState } from 'react';
import api from '../services/api';

export const useBackendStatus = () => {
  const [online, setOnline] = useState<boolean | null>(null);

  const checkHealth = async () => {
    try {
      await api.get('/health');
      setOnline(true);
    } catch (err) {
      setOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return online;
};

