// Import des hooks React
import { useEffect, useState } from 'react';
// Import du client axios préconfiguré (voir api.ts)
import apiClient from '../services/api';
// Import de la bibliothèque de notifications
import toast from 'react-hot-toast';

// Hook personnalisé pour vérifier si le backend est en ligne
export function useBackendStatus() {
  // État pour suivre la disponibilité du backend
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Fonction asynchrone pour appeler l'API de santé
    const checkHealth = async () => {
      try {
        // ✅ Appel correct à la route /api/health
        const response = await apiClient.get('/api/health');
        // Si le backend répond avec 200, on le considère "en ligne"
        setIsOnline(response.status === 200);
      } catch (error) {
        // Log et toast en cas d'échec
        console.error('❌ Erreur connexion backend: ', error);
        toast.error('Connexion au backend échouée');
        setIsOnline(false);
      }
    };

    // Exécuter l’appel dès le chargement du composant
    checkHealth();
  }, []);

  // Retourner l’état actuel (true = online / false = offline)
  return isOnline;
}
