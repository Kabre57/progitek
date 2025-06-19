import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test connection function
export const testConnection = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.from('role').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      throw error;
    }
    console.log('✅ Connexion Supabase établie');
  } catch (error) {
    console.error('❌ Erreur de connexion à Supabase:', error);
    throw error;
  }
};