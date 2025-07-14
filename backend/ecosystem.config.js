// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'progitek-backend',
      script: './dist/server.js', // Le fichier compilé avec tsc
      instances: 1,               // Tu peux mettre 'max' pour auto scaling
      exec_mode: 'fork',         // Ou 'cluster' si tu veux multi-threadé
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
// Pour démarrer l'application avec PM2, utilise la commande :
// pm2 start ecosystem.config.js
// Pour surveiller l'application, utilise :