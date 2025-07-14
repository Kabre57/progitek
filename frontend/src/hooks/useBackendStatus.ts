import { useEffect, useState } from 'react';
import {apiClient} from '../services/api';
import toast from 'react-hot-toast';

export function useBackendStatus() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await apiClient.get('/health');
        if (res.status === 200) {
          console.log('✅ Backend opérationnel');
        } else {
          throw new Error('Réponse inattendue');
        }
      } catch (e) {
        toast.error('🚨 Backend inaccessible. Veuillez réessayer plus tard.');
        console.error('❌ Erreur connexion backend:', e);
      } finally {
        setChecked(true);
      }
    };

    check();
  }, []);

  return { checked };
}
