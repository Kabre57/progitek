import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'progitek_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000, // ferme les clients inactifs après 30 secondes
  connectionTimeoutMillis: 2000, // timeout de connexion de 2 secondes
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

export const pool = new Pool(poolConfig);

export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion PostgreSQL établie');
    
    // Test de la connexion
    const result = await client.query('SELECT NOW()');
    console.log('🕒 Heure de la base de données:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à PostgreSQL:', error);
    throw error;
  }
};

// Fonction utilitaire pour exécuter des requêtes
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Requête exécutée:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erreur de requête:', error);
    throw error;
  }
};

// Fonction pour les transactions
export const transaction = async (callback: (client: any) => Promise<any>): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Fermeture propre du pool
export const closeDatabase = async (): Promise<void> => {
  await pool.end();
  console.log('🔒 Connexion à la base de données fermée');
};

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabase();
  process.exit(0);
});