# 🚀 Guide de Configuration Backend ProgiTek

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **PostgreSQL** (version 12 ou supérieure)
- **npm** ou **yarn**

## 🛠️ Installation

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Configuration de la base de données PostgreSQL

#### Créer la base de données

```sql
-- Se connecter à PostgreSQL en tant que superuser
psql -U postgres

-- Créer la base de données
CREATE DATABASE progitek_db;

-- Créer un utilisateur (optionnel)
CREATE USER progitek_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE progitek_db TO progitek_user;

-- Quitter psql
\q
```

#### Exécuter le script de création des tables

```bash
# Se connecter à la base progitek_db
psql -U postgres -d progitek_db

# Ou si vous avez créé un utilisateur spécifique
psql -U progitek_user -d progitek_db

# Dans psql, exécuter le script
\i database.sql

# Vérifier que les tables ont été créées
\dt

# Quitter
\q
```

### 3. Configuration des variables d'environnement

Le fichier `.env` est déjà configuré avec vos paramètres :

```env
# Base de données
DATABASE_URL=postgresql://postgres:1234@localhost:5432/progitek_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=progitek_db
DB_USER=postgres
DB_PASSWORD=1234

# JWT
JWT_SECRET=9d8bdd2670420cb110ec8e1ce780beed77e85600276b0ce1d8d0110c0ba3ba59
JWT_EXPIRES_IN=1h

# Email (Gmail configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=theogeoffroy5@gmail.com
SMTP_PASS=uitjnlfdvecgsejq
FROM_EMAIL=theogeoffroy5@gmail.com
FROM_NAME=Progitek System

# Serveur
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
# Build
npm run build

# Démarrer
npm start
```

## 🔐 Comptes par défaut

Le script de base de données crée automatiquement des comptes de démonstration :

### Administrateur
- **Email** : `admin@progitek.com`
- **Mot de passe** : `admin123`
- **Rôle** : Administrator

### Technicien
- **Email** : `technicien@progitek.com`
- **Mot de passe** : `tech123`
- **Rôle** : Technician

## 📚 Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible à :
- **URL** : http://localhost:3000/api-docs

## 🔍 Vérification de l'installation

### 1. Test de connexion à la base de données

```bash
# Tester la connexion
psql -U postgres -d progitek_db -c "SELECT COUNT(*) FROM utilisateur;"
```

### 2. Test du serveur

```bash
# Health check
curl http://localhost:3000/health

# Test de connexion
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progitek.com","mot_de_passe":"admin123"}'
```

## 🐛 Dépannage

### Erreur de connexion PostgreSQL

1. Vérifiez que PostgreSQL est démarré :
```bash
# Sur Ubuntu/Debian
sudo systemctl status postgresql

# Sur macOS avec Homebrew
brew services list | grep postgresql

# Sur Windows
net start postgresql-x64-13
```

2. Vérifiez les paramètres de connexion dans `.env`

3. Testez la connexion manuellement :
```bash
psql -U postgres -h localhost -p 5432 -d progitek_db
```

### Erreur de port déjà utilisé

```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur d'email

1. Vérifiez que le mot de passe d'application Gmail est correct
2. Activez l'authentification à 2 facteurs sur Gmail
3. Générez un nouveau mot de passe d'application

## 📊 Structure de la base de données

### Tables principales

- **utilisateur** : Gestion des utilisateurs et authentification
- **client** : Informations des clients
- **technicien** : Données des techniciens
- **mission** : Missions d'intervention
- **intervention** : Interventions techniques
- **notifications** : Système de notifications
- **audit_logs** : Logs d'audit et traçabilité

### Relations

```
utilisateur (1) ←→ (N) audit_logs
client (1) ←→ (N) mission
mission (1) ←→ (N) intervention
technicien (1) ←→ (N) intervention
specialite (1) ←→ (N) technicien
role (1) ←→ (N) utilisateur
```

## 🔧 Scripts utiles

```bash
# Réinitialiser la base de données
npm run db:reset

# Sauvegarder la base de données
pg_dump -U postgres progitek_db > backup.sql

# Restaurer la base de données
psql -U postgres progitek_db < backup.sql

# Voir les logs en temps réel
tail -f logs/app.log
```

## 🌐 URLs importantes

- **API** : http://localhost:3000/api/v1
- **Documentation** : http://localhost:3000/api-docs
- **Health Check** : http://localhost:3000/health
- **Frontend** : http://localhost:5173

## ✅ Checklist de vérification

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `progitek_db` créée
- [ ] Script `database.sql` exécuté
- [ ] Fichier `.env` configuré
- [ ] Dépendances npm installées
- [ ] Serveur démarre sans erreur
- [ ] Documentation Swagger accessible
- [ ] Connexion avec comptes par défaut fonctionne
- [ ] Frontend peut communiquer avec l'API

## 🆘 Support

En cas de problème :

1. Vérifiez les logs : `logs/app.log`
2. Consultez la documentation API
3. Testez les endpoints avec Postman ou curl
4. Vérifiez la configuration de la base de données

---

**ProgiTek Backend** - Système de gestion des interventions techniques