# ⚡ Installation Rapide - 5 Minutes

## 🚀 Commandes rapides

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Initialiser la base de données
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4. Démarrer l'API
npm run dev
```

## ✅ Vérification

- API : http://localhost:3000/health
- Documentation : http://localhost:3000/api-docs
- Connexion test : theogoeffroy5@gmail.com / admin123

## 🧪 Test rapide

```bash
# Tester la connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "theogoeffroy5@gmail.com", "motDePasse": "admin123"}'
```

## 🔧 En cas de problème

```bash
# Réinitialiser tout
rm -f dev.db
rm -rf node_modules
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

**C'est tout ! 🎉**