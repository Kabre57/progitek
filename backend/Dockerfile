# Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Installer les dépendances OpenSSL nécessaires pour Prisma sur Alpine Linux
RUN apk add --no-cache openssl

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Copier tout le code source (y compris prisma/)
COPY . .

# Installer les dépendances (npm install exécutera npx prisma generate via postinstall)
RUN npm install

# Exécuter les migrations Prisma (si non déjà fait par postinstall ou pour s'assurer)
RUN npx prisma migrate deploy --schema=./prisma/schema.prisma

# Construire l'application TypeScript
RUN npm run build

# Exposer le port sur lequel l'application s'exécute (par défaut 3001 pour Express)
EXPOSE 3001

# Commande pour démarrer l'application
CMD [ "npm", "start" ]