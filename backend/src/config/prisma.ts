import { PrismaClient as PrismaClientOriginal } from '@prisma/client';

// Créer une classe personnalisée pour étendre PrismaClient
class PrismaClient extends PrismaClientOriginal {}

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern pour éviter les multiples connexions en développement
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Fonction de connexion
export const connectPrisma = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connecté à la base de données');
  } catch (error) {
    console.error('❌ Erreur de connexion Prisma:', error);
    throw error;
  }
};

// Fonction de déconnexion propre
export const disconnectPrisma = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('🔒 Prisma déconnecté');
};

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectPrisma();
  process.exit(0);
});

export default prisma;