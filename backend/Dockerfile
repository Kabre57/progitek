# Dockerfile - backend
FROM node:20

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Générer le client Prisma (nécessaire pour le runtime)
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# Exposer le port de l'API
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "dist/server.js"]
