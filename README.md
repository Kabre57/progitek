# Progitek

Progitek est une application de gestion de missions, devis, interventions, techniciens et factures. Elle permet à une entreprise de suivre ses activités opérationnelles de bout en bout.

## 🚀 Technologies utilisées

### Backend
- Node.js / Express
- TypeScript
- Prisma ORM (SQLite ou PostgreSQL)
- JWT Authentication
- Supabase (auth + base de données)

### Frontend
- React (Vite)
- Tailwind CSS
- DaisyUI
- Lucide React Icons

### Outils
- GitHub Actions (CI/CD)
- Vercel (build frontend)
- PM2 (backend en production)
- Docker (optionnel)
- Tailscale (accès SSH sécurisé)

## 📂 Structure du projet

```bash
progitek/
│
├── backend/               # API Express (TypeScript + Prisma)
│   ├── src/
│   ├── prisma/
│   └── .env               # Variables d’environnement backend
│
├── frontend/              # Interface utilisateur React (Vite)
│   ├── src/
│   └── .env               # Variables d’environnement frontend
│
├── .github/
│   └── workflows/         # Fichiers GitHub Actions (déploiement)
│
├── deploy.sh              # Script de déploiement serveur (production)
├── docker-compose.yml     # Configuration Docker (optionnel)
└── .gitignore             # Ignore fichiers sensibles et de build
```

## ⚙️ Variables d’environnement

Crée un fichier `.env` dans chaque dossier (`backend/` et `frontend/`) à partir de `.env.example`.

### ✅ `backend/.env`
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="votre-cle-secrete"
JWT_REFRESH_SECRET="votre-cle-refresh"
CORS_ORIGIN=http://localhost:5173
```

### ✅ `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:3000
```

## 🛠️ Démarrage en local

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Déploiement automatique

Le projet utilise **GitHub Actions** pour :

- Déclencher le déploiement à chaque `push` sur la branche `main`
- Se connecter via SSH au VPS (`pblserver`)
- Lancer le script `deploy.sh`

Fichier `.github/workflows/deploy.yml` :
```yaml
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Déploiement SSH
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/progitek
            bash ./deploy.sh
```

## 📦 Production

- `deploy.sh` met à jour le code, reconstruit le frontend et redémarre le backend (`pm2 restart`)
- Base de données SQLite ou PostgreSQL
- Accès SSH sécurisé via Tailscale

## 👤 Auteur

**Théodore KABRE**  
Backend Developer chez Parabellum Groups  
GitHub : [@Kabre57](https://github.com/Kabre57)

## 📄 Licence

Ce projet est sous licence MIT.
