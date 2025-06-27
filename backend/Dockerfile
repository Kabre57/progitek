FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copier tout le code source (y compris prisma/)
COPY . .

# 🔥 Copie explicite pour être certain
COPY prisma ./prisma

# Générer Prisma client et appliquer les migrations
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npx prisma migrate deploy --schema=./prisma/schema.prisma

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
