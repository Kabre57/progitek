# ProgiTek Backend API

Backend API pour le système de gestion des interventions techniques ProgiTek.

## 🚀 Technologies

- **Node.js** avec **Express.js**
- **TypeScript** pour la développeur web des types
- **PostgreSQL** comme base de données
- **JWT** pour l'authentification
- **Zod** pour la validation des données
- **Swagger** pour la documentation API
- **Nodemailer** pour l'envoi d'emails
- **bcryptjs** pour le hashage des mots de passe

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Swagger)
│   ├── controllers/     # Contrôleurs des routes
│   ├── middleware/      # Middleware (auth, validation, erreurs)
│   ├── models/          # Interfaces TypeScript
│   ├── routes/          # Définition des routes
│   ├── services/        # Services (email, audit)
│   ├── validations/     # Schémas de validation Zod
│   └── server.ts        # Point d'entrée de l'application
├── dist/                # Code compilé
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos configurations :
- Base de données PostgreSQL
- Secrets JWT
- Configuration SMTP
- etc.

4. **Préparer la base de données**

Créer la base de données PostgreSQL et exécuter le script SQL fourni pour créer les tables.

5. **Démarrer en mode développement**
```bash
npm run dev
```

6. **Build pour la production**
```bash
npm run build
npm start
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
# Base de données
DATABASE_URL=postgresql://username:password@localhost:5432/progitek_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=progitek_db
DB_USER=username
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Serveur
PORT=3000
NODE_ENV=development
```

### Base de données

1. Créer une base de données PostgreSQL
2. Exécuter le script SQL fourni dans le projet principal
3. Configurer les variables d'environnement

## 📚 Documentation API

Une fois le serveur démarré, la documentation Swagger est disponible à :
- **Développement** : http://localhost:3000/api-docs
- **Production** : https://your-domain.com/api-docs

## 🛡️ développeur web

- **Authentification JWT** avec tokens sécurisés
- **Hashage des mots de passe** avec bcrypt
- **Validation des données** avec Zod
- **Rate limiting** pour prévenir les attaques
- **CORS** configuré
- **Helmet** pour les en-têtes de développeur web
- **Audit logging** pour traçabilité

## 🔗 Endpoints principaux

### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription (admin)
- `GET /api/v1/auth/me` - Profil utilisateur
- `POST /api/v1/auth/forgot-password` - Mot de passe oublié
- `POST /api/v1/auth/reset-password` - Réinitialiser mot de passe

### Utilisateurs
- `GET /api/v1/users` - Liste des utilisateurs
- `POST /api/v1/users` - Créer un utilisateur
- `GET /api/v1/users/:id` - Détails utilisateur
- `PUT /api/v1/users/:id` - Modifier utilisateur
- `DELETE /api/v1/users/:id` - Supprimer utilisateur

### Clients
- `GET /api/v1/clients` - Liste des clients
- `POST /api/v1/clients` - Créer un client
- `GET /api/v1/clients/:id` - Détails client
- `PUT /api/v1/clients/:id` - Modifier client
- `DELETE /api/v1/clients/:id` - Supprimer client

### Techniciens
- `GET /api/v1/technicians` - Liste des techniciens
- `POST /api/v1/technicians` - Créer un technicien
- `GET /api/v1/technicians/:id` - Détails technicien
- `PUT /api/v1/technicians/:id` - Modifier technicien
- `DELETE /api/v1/technicians/:id` - Supprimer technicien

### Missions
- `GET /api/v1/missions` - Liste des missions
- `POST /api/v1/missions` - Créer une mission
- `GET /api/v1/missions/:id` - Détails mission
- `PUT /api/v1/missions/:id` - Modifier mission
- `DELETE /api/v1/missions/:id` - Supprimer mission

### Interventions
- `GET /api/v1/interventions` - Liste des interventions
- `POST /api/v1/interventions` - Créer une intervention
- `GET /api/v1/interventions/:id` - Détails intervention
- `PUT /api/v1/interventions/:id` - Modifier intervention
- `DELETE /api/v1/interventions/:id` - Supprimer intervention

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch
```

## 📊 Monitoring

- **Health check** : `GET /health`
- **Logs d'audit** : Toutes les actions sont loggées
- **Logs d'activité** : Connexions et actions utilisateurs

## 🚀 Déploiement

### Avec Docker (recommandé)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Déploiement manuel

1. Build du projet : `npm run build`
2. Copier les fichiers `dist/` sur le serveur
3. Installer les dépendances : `npm ci --only=production`
4. Configurer les variables d'environnement
5. Démarrer : `npm start`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Email : support@progitek.com
- Documentation : http://localhost:3000/api-docs
- Issues : GitHub Issues

---

**ProgiTek Backend API** - Système de gestion des interventions techniques