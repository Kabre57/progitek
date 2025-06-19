import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ovgeteqpraiamshqpdog.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2V0ZXFwcmFpYW1zaHFwZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjI2MTQsImV4cCI6MjA2NTgzODYxNH0.sJDXN5_9lvq3oipSKm2cNPX9fiXs1Re4zu5kfZm7aM4';

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas définies');
}

// Créer le client Supabase
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// Fonction pour tester la connexion
export const testSupabaseConnection = async () => {
  try {
    // Tester une requête simple pour vérifier la connexion
    const { data, error } = await supabase.from('role').select('*').limit(1);
    
    if (error) {
      console.error('Erreur de connexion à Supabase:', error);
      return { success: false, error };
    }
    
    console.log('Connexion à Supabase réussie:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception lors de la connexion à Supabase:', error);
    return { success: false, error };
  }
};