export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/progitek-api',
};

if (!config.API_BASE_URL) {
  console.error('❌ Configuration API manquante');
  throw new Error('Configuration API non disponible');
}

console.log(`🔗 API Base URL: ${config.API_BASE_URL}`);
