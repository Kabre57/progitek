# 🚀 ParabellumGroups System API - Backend

API RESTful complète pour la gestion technique avec TypeScript, Express et Prisma.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure) - [Télécharger ici](https://nodejs.org/)
- **npm** (inclus avec Node.js)

## 🔧 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

**Contenu minimal du fichier `.env` :**

```env
# Database (SQLite pour le développement local)
DATABASE_URL="file:./dev.db"

# JWT (Générez vos propres clés sécurisées)
JWT_SECRET="votre_cle_secrete_jwt_super_longue_et_securisee"
JWT_REFRESH_SECRET="votre_cle_refresh_jwt_encore_plus_longue_et_securisee"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="30d"

# Server
PORT=3000
NODE_ENV="development"

# Email (Optionnel pour le développement)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre_email@gmail.com"
SMTP_PASS="votre_mot_de_passe_app"
FROM_EMAIL="noreply@ParabellumGroups.com"
FROM_NAME="ParabellumGroups System"
```

### 3. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# Peupler la base de données avec des données de test
npm run db:seed
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

L'API sera accessible sur : **http://localhost:3000**

### Mode production

```bash
# Compiler le TypeScript
npm run build

# Démarrer en mode production
npm start
```

## 🧪 Tests

### Exécuter tous les tests

```bash
npm test
```

### Tests en mode watch (surveillance)

```bash
npm run test:watch
```

### Tests avec couverture de code

```bash
npm run test:coverage
```

## 📚 Documentation API

Une fois l'API démarrée, accédez à :

- **Documentation Swagger** : http://localhost:3000/api-docs
- **Health Check** : http://localhost:3000/health
- **Info API** : http://localhost:3000/api/info

## 🔐 Comptes de test

Après avoir exécuté `npm run db:seed`, vous aurez accès à :

**Compte Administrateur :**
- Email : `theogoeffroy5@gmail.com`
- Mot de passe : `admin123`

## 📡 Endpoints principaux

### Authentication
```bash
POST /api/auth/register     # Inscription
POST /api/auth/login        # Connexion
POST /api/auth/refresh      # Rafraîchir token
POST /api/auth/logout       # Déconnexion
```

### Users
```bash
GET  /api/users            # Liste utilisateurs (admin)
GET  /api/users/profile    # Profil utilisateur
PUT  /api/users/profile    # Modifier profil
```

### Clients
```bash
GET  /api/clients          # Liste clients
POST /api/clients          # Créer client
```

### Techniciens
```bash
GET  /api/techniciens      # Liste techniciens
```

### Missions & Interventions
```bash
GET  /api/missions         # Liste missions
GET  /api/interventions    # Liste interventions
```

## 🧪 Tester l'API

### 1. Connexion avec curl

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "theogoeffroy5@gmail.com",
    "motDePasse": "admin123"
  }'
```

### 2. Utiliser le token reçu

```bash
# Remplacez YOUR_TOKEN par le token reçu
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛠️ Scripts disponibles

```bash
npm run dev              # Démarrer en mode développement
npm run build           # Compiler pour la production
npm start               # Démarrer en mode production
npm test                # Exécuter les tests
npm run test:watch      # Tests en mode surveillance
npm run test:coverage   # Tests avec couverture
npm run lint            # Vérifier le code
npm run lint:fix        # Corriger automatiquement
npm run db:migrate      # Appliquer les migrations
npm run db:generate     # Générer le client Prisma
npm run db:seed         # Peupler la base de données
npm run db:studio       # Ouvrir Prisma Studio
npm run db:reset        # Réinitialiser la base de données
```

## 🏗️ Architecture

```
src/
├── config/           # Configuration (database, config, supabase)
├── controllers/      # Contrôleurs des routes
├── middleware/       # Middlewares (auth, validation, errors)
├── models/           # Types et interfaces TypeScript
├── routes/           # Définition des routes
├── services/         # Services métier (audit, email)
├── validations/      # Schémas de validation Zod
└── server.ts         # Point d'entrée de l'application
```

## 🔒 Sécurité

- Authentification JWT avec refresh tokens
- Validation des données avec Zod
- Rate limiting
- CORS configuré
- Audit des actions utilisateur
- Hashage des mots de passe avec bcrypt

## 🐛 Dépannage

### Problème de port occupé

```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Tuer le processus (remplacez PID par l'ID du processus)
kill -9 PID
```

### Réinitialiser la base de données

```bash
npm run db:reset
```

### Problèmes de dépendances

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licence

Ce projet est sous licence MIT.

---

**🎉 Votre API ParabellumGroups System est maintenant opérationnelle !**