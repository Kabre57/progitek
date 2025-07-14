// environment.ts

const environments = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
  },
  production: {
    API_BASE_URL: 'https://pblserver.taile0fd44.ts.net', // ✅ domaine public via Tailscale Funnel
  },
  preview: {
    API_BASE_URL: 'https://progitek-preview.vercel.app', // ✅ adapte selon tes builds Preview Vercel
  }
};

// 🔍 Détection intelligente de l'environnement
const getEnvironment = () => {
  const hostname = window.location.hostname;

  if (import.meta.env.DEV) return 'development';
  if (hostname.includes('vercel.app')) return 'preview';
  if (hostname.includes('taile') || hostname.endsWith('.ts.net')) return 'production';

  return 'production'; // fallback sécurisé
};

// 🔄 Appliquer la config
const selectedEnv = getEnvironment();

export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || environments[selectedEnv].API_BASE_URL,
};

// 🔎 Vérification de la config
if (!config.API_BASE_URL) {
  console.error('❌ API_BASE_URL manquante dans le fichier environment.ts');
  throw new Error('Configuration API non disponible');
}

// 🪵 Log utile au démarrage
console.log(`🔗 Environnement détecté : ${selectedEnv}`);
console.log(`🔗 API Base URL utilisée : ${config.API_BASE_URL}`);
