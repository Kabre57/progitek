module.exports = {
  apps: [
    {
      name: 'progitek-backend',
      script: './dist/server.js', // ? C�est le bon fichier compil�
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      }
    }
  ]
};
