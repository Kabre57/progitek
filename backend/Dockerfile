# Étape 1 : Image de base
FROM node:18-alpine

# Étape 2 : Dépendances nécessaires pour Prisma
RUN apk add --no-cache openssl

# Étape 3 : Dossier de travail
WORKDIR /app

# Étape 4 : Copie des fichiers essentiels en premier (cache npm)
COPY package*.json ./
COPY prisma ./prisma
COPY tsconfig.json ./

# Étape 5 : Installation des dépendances (npm install exécutera aussi postinstall avec prisma generate)
RUN npm install

# Étape 6 : Copie du reste du code
COPY . .

# Étape 7 : Build TypeScript
RUN npm run build

# Étape 8 : Migration (optionnel, à activer si tu déploies sur PostgreSQL ou Supabase)
# RUN npx prisma migrate deploy --schema=./prisma/schema.prisma

# Étape 9 : Port exposé (doit correspondre à app.listen())
EXPOSE 3000

# Étape 10 : Lancement de l'application
CMD ["npm", "start"]
