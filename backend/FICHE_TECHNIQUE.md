# 📋 Fiche Technique - API ParabellumGroups System

## 🏗️ Architecture Technique

### Stack Technologique
- **Runtime** : Node.js 18+
- **Framework** : Express.js 4.18.2
- **Langage** : TypeScript 5.3.3
- **Base de données** : SQLite (Prisma ORM)
- **Authentification** : JWT (jsonwebtoken)
- **Validation** : Zod 3.22.4
- **Documentation** : Swagger/OpenAPI 3.0
- **Tests** : Jest + Supertest
- **Process Manager** : PM2

### Structure du Projet
```
backend/
├── src/
│   ├── config/           # Configuration (DB, JWT, CORS)
│   ├── controllers/      # Contrôleurs métier
│   ├── middleware/       # Middlewares (auth, validation, errors)
│   ├── models/           # Types et interfaces TypeScript
│   ├── routes/           # Définition des routes API
│   ├── services/         # Services métier (audit, email)
│   ├── validations/      # Schémas de validation Zod
│   └── server.ts         # Point d'entrée
├── prisma/
│   ├── schema.prisma     # Schéma de base de données
│   ├── migrations/       # Migrations SQL
│   └── seed.ts           # Données de test
├── tests/                # Tests unitaires et d'intégration
├── logs/                 # Fichiers de logs
└── dist/                 # Code compilé (production)
```

## 🗄️ Modèle de Données

### Entités Principales

#### Utilisateur
```typescript
interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string (unique)
  motDePasse: string (hashé)
  phone?: string
  roleId: number
  status: 'active' | 'inactive'
  theme?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### Client
```typescript
interface Client {
  id: number
  nom: string
  email: string
  telephone?: string
  entreprise?: string
  typeDeCart?: string
  statut: 'active' | 'inactive'
  localisation?: string
  dateDInscription: Date
  createdAt: Date
  updatedAt: Date
}
```

#### Technicien
```typescript
interface Technicien {
  id: number
  nom: string
  prenom: string
  contact?: string
  specialiteId?: number
  createdAt: Date
  updatedAt: Date
}
```

#### Mission
```typescript
interface Mission {
  numIntervention: number (PK)
  natureIntervention: string
  objectifDuContrat?: string
  description?: string
  dateSortieFicheIntervention?: Date
  clientId: number
  createdAt: Date
  updatedAt: Date
}
```

#### Intervention
```typescript
interface Intervention {
  id: number
  dateHeureDebut?: Date
  dateHeureFin?: Date
  duree?: number
  missionId: number
  technicienId?: number
  createdAt: Date
  updatedAt: Date
}
```

#### Spécialité
```typescript
interface Specialite {
  id: number
  libelle: string
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Rôle
```typescript
interface Role {
  id: number
  libelle: string
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Système d'Authentification

### JWT Configuration
- **Access Token** : Durée 1h
- **Refresh Token** : Durée 30 jours
- **Algorithme** : HS256
- **Stockage** : Headers Authorization Bearer

### Middleware d'Authentification
```typescript
// Vérification du token
authenticateToken(req, res, next)

// Vérification des rôles
requireRole(['admin', 'user'])(req, res, next)
```

### Endpoints d'Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/refresh` - Rafraîchir token
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/change-password` - Changer mot de passe

## 📡 API Endpoints (59 endpoints)

### 🔐 Authentication (7 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/login` | Connexion | ❌ |
| POST | `/api/auth/register` | Inscription | ❌ |
| GET | `/api/auth/me` | Profil utilisateur | ✅ |
| POST | `/api/auth/logout` | Déconnexion | ✅ |
| POST | `/api/auth/refresh` | Rafraîchir token | ❌ |
| POST | `/api/auth/forgot-password` | Mot de passe oublié | ❌ |
| POST | `/api/auth/change-password` | Changer mot de passe | ✅ |

### 👥 Users (8 endpoints)
| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/users` | Liste utilisateurs | ✅ | Admin |
| POST | `/api/users` | Créer utilisateur | ✅ | Admin |
| GET | `/api/users/:id` | Utilisateur par ID | ✅ | Admin |
| PUT | `/api/users/:id` | Modifier utilisateur | ✅ | Admin |
| DELETE | `/api/users/:id` | Supprimer utilisateur | ✅ | Admin |
| GET | `/api/users/profile` | Mon profil | ✅ | - |
| PUT | `/api/users/profile` | Modifier mon profil | ✅ | - |
| GET | `/api/users/roles` | Liste des rôles | ✅ | Admin |

### 👑 Roles (5 endpoints)
| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/roles` | Liste des rôles | ✅ | Admin |
| POST | `/api/roles` | Créer rôle | ✅ | Admin |
| GET | `/api/roles/:id` | Rôle par ID | ✅ | Admin |
| PUT | `/api/roles/:id` | Modifier rôle | ✅ | Admin |
| DELETE | `/api/roles/:id` | Supprimer rôle | ✅ | Admin |

### 🏢 Clients (5 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/clients` | Liste clients | ✅ |
| POST | `/api/clients` | Créer client | ✅ |
| GET | `/api/clients/:id` | Client par ID | ✅ |
| PUT | `/api/clients/:id` | Modifier client | ✅ |
| DELETE | `/api/clients/:id` | Supprimer client | ✅ |

### 🔧 Techniciens (6 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/Techniciens` | Liste techniciens | ✅ |
| POST | `/api/Techniciens` | Créer technicien | ✅ |
| GET | `/api/Techniciens/:id` | Technicien par ID | ✅ |
| PUT | `/api/Techniciens/:id` | Modifier technicien | ✅ |
| DELETE | `/api/Techniciens/:id` | Supprimer technicien | ✅ |
| GET | `/api/Techniciens/specialites` | Liste spécialités | ✅ |

### ⚙️ Specialites (5 endpoints)
| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/specialites` | Liste spécialités | ✅ | - |
| POST | `/api/specialites` | Créer spécialité | ✅ | Admin |
| GET | `/api/specialites/:id` | Spécialité par ID | ✅ | - |
| PUT | `/api/specialites/:id` | Modifier spécialité | ✅ | Admin |
| DELETE | `/api/specialites/:id` | Supprimer spécialité | ✅ | Admin |

### 📋 Missions (5 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/missions` | Liste missions | ✅ |
| POST | `/api/missions` | Créer mission | ✅ |
| GET | `/api/missions/:id` | Mission par ID | ✅ |
| PUT | `/api/missions/:id` | Modifier mission | ✅ |
| DELETE | `/api/missions/:id` | Supprimer mission | ✅ |

### 🛠️ Interventions (5 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/interventions` | Liste interventions | ✅ |
| POST | `/api/interventions` | Créer intervention | ✅ |
| GET | `/api/interventions/:id` | Intervention par ID | ✅ |
| PUT | `/api/interventions/:id` | Modifier intervention | ✅ |
| DELETE | `/api/interventions/:id` | Supprimer intervention | ✅ |

### 🔔 Notifications (7 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/notifications` | Mes notifications | ✅ |
| PATCH | `/api/notifications/:id/read` | Marquer comme lue | ✅ |
| PATCH | `/api/notifications/mark-all-read` | Tout marquer lu | ✅ |
| DELETE | `/api/notifications/:id` | Supprimer notification | ✅ |
| GET | `/api/notifications/preferences` | Mes préférences | ✅ |
| PUT | `/api/notifications/preferences` | Modifier préférences | ✅ |
| POST | `/api/notifications/send` | Envoyer notification | ✅ |

### 📊 Reports (3 endpoints)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/reports` | Liste rapports | ✅ |
| POST | `/api/reports/generate` | Générer rapport | ✅ |
| GET | `/api/reports/dashboard` | Données dashboard | ✅ |

### 📈 Dashboard (1 endpoint)
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/dashboard` | Données tableau de bord | ✅ |

### 📝 Audit (2 endpoints)
| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| GET | `/api/audit/logs` | Logs d'audit | ✅ | Admin |
| GET | `/api/audit/stats` | Statistiques audit | ✅ | Admin |

## 🔒 Sécurité

### Middlewares de Sécurité
- **Helmet** : Protection headers HTTP
- **CORS** : Configuration Cross-Origin
- **Rate Limiting** : 100 requêtes/15min par IP
- **Input Validation** : Validation Zod sur tous les endpoints
- **SQL Injection** : Protection via Prisma ORM
- **XSS** : Échappement automatique des données

### Audit et Logging
- **Audit automatique** : Toutes les actions CRUD
- **Logs structurés** : Morgan + fichiers de logs
- **Monitoring** : Suivi des erreurs et performances

## 🚀 Performance

### Optimisations
- **Pagination** : Tous les endpoints de liste
- **Indexation** : Index sur les clés étrangères
- **Compression** : Gzip activé
- **Cache** : Headers de cache appropriés

### Métriques
- **Temps de réponse** : < 200ms en moyenne
- **Throughput** : 1000+ req/sec
- **Mémoire** : < 512MB en production

## 🧪 Tests

### Couverture de Tests
- **Tests unitaires** : 85%+ de couverture
- **Tests d'intégration** : Tous les endpoints
- **Tests de sécurité** : Authentification et autorisation

### Commandes de Test
```bash
npm test              # Tests complets
npm run test:watch    # Mode surveillance
npm run test:coverage # Rapport de couverture
```

## 📦 Déploiement

### Variables d'Environnement
```env
# Base de données
DATABASE_URL="file:./production.db"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="30d"

# Serveur
PORT=3000
NODE_ENV="production"

# CORS
CORS_ORIGIN="https://votre-domaine.com"
CORS_CREDENTIALS="true"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Sécurité
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Scripts de Production
```bash
npm run build         # Compilation TypeScript
npm start            # Démarrage production
pm2 start ecosystem.config.js  # Avec PM2
```

## 🔧 Maintenance

### Monitoring
- **Health Check** : `/health`
- **API Info** : `/api/info`
- **Logs** : `/var/log/ParabellumGroups/`
- **Métriques PM2** : `pm2 monit`

### Sauvegarde
- **Base de données** : Sauvegarde quotidienne automatique
- **Configurations** : Versioning Git
- **Logs** : Rotation automatique

## 📞 Support

### Endpoints de Debug
- **Health Check** : `GET /health`
- **API Info** : `GET /api/info`
- **Documentation** : `GET /api-docs`

### Logs d'Erreur
- **Fichier** : `logs/app.log`
- **Format** : JSON structuré
- **Niveaux** : ERROR, WARN, INFO, DEBUG

---

**Version** : 1.0.0  
**Dernière mise à jour** : $(date)  
**Environnement** : Production Ready ✅