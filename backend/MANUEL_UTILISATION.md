# 📖 Manuel d'Utilisation - API ParabellumGroups System

## 🚀 Démarrage Rapide

### 1. Installation
```bash
# Cloner le projet
git clone <repository-url>
cd backend

# Installer les dépendances
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# Initialiser la base de données
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# Démarrer l'API
npm run dev
```

### 2. Vérification
- **API** : http://localhost:3000/health
- **Documentation** : http://localhost:3000/api-docs
- **Connexion test** : theogoeffroy5@gmail.com / admin123

## 🔐 Authentification

### Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "theogoeffroy5@gmail.com",
    "motDePasse": "admin123"
  }'
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "nom": "Admin",
      "prenom": "System",
      "email": "theogoeffroy5@gmail.com",
      "role": { "libelle": "admin" }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Utilisation du Token
```bash
# Ajouter le token dans les headers
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/users/profile
```

## 👥 Gestion des Utilisateurs

### Lister les Utilisateurs (Admin)
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/users?page=1&limit=10"
```

### Créer un Utilisateur (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "motDePasse": "password123",
    "phone": "+225 01 02 03 04 05",
    "roleId": 2
  }' \
  http://localhost:3000/api/users
```

### Modifier son Profil
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Nouveau Nom",
    "phone": "+225 07 08 09 10 11",
    "theme": "dark"
  }' \
  http://localhost:3000/api/users/profile
```

## 👑 Gestion des Rôles (Admin uniquement)

### Lister les Rôles
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/roles"
```

### Créer un Rôle
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "libelle": "manager",
    "description": "Gestionnaire de projet"
  }' \
  http://localhost:3000/api/roles
```

### Modifier un Rôle
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Nouvelle description"
  }' \
  http://localhost:3000/api/roles/3
```

## 🏢 Gestion des Clients

### Lister les Clients
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/clients?search=entreprise&page=1"
```

### Créer un Client
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "ACME Corp",
    "email": "contact@acme.com",
    "telephone": "+225 20 30 40 50",
    "entreprise": "ACME Corporation",
    "typeDeCart": "Premium",
    "statut": "active",
    "localisation": "Abidjan, Côte d'Ivoire"
  }' \
  http://localhost:3000/api/clients
```

### Modifier un Client
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+225 21 31 41 51",
    "statut": "inactive"
  }' \
  http://localhost:3000/api/clients/1
```

## ⚙️ Gestion des Spécialités

### Lister les Spécialités
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/specialites"
```

### Créer une Spécialité (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "libelle": "Électricité",
    "description": "Spécialiste en installations électriques"
  }' \
  http://localhost:3000/api/specialites
```

### Récupérer une Spécialité avec ses Techniciens
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/specialites/1"
```

## 🔧 Gestion des Techniciens

### Lister les Techniciens
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/technicians?page=1&limit=5"
```

### Créer un Technicien
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Pierre",
    "contact": "+225 05 06 07 08 09",
    "specialiteId": 1
  }' \
  http://localhost:3000/api/technicians
```

## 📋 Gestion des Missions

### Lister les Missions
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/missions"
```

### Créer une Mission
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "natureIntervention": "Installation réseau",
    "objectifDuContrat": "Mise en place infrastructure IT",
    "description": "Installation complète du réseau informatique",
    "clientId": 1
  }' \
  http://localhost:3000/api/missions
```

### Récupérer une Mission avec ses Interventions
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/missions/1"
```

## 🛠️ Gestion des Interventions

### Lister les Interventions
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/interventions"
```

### Créer une Intervention
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dateHeureDebut": "2024-01-15T09:00:00Z",
    "duree": 240,
    "missionId": 1,
    "technicienId": 1
  }' \
  http://localhost:3000/api/interventions
```

### Terminer une Intervention
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dateHeureFin": "2024-01-15T13:00:00Z",
    "duree": 240
  }' \
  http://localhost:3000/api/interventions/1
```

## 🔔 Gestion des Notifications

### Récupérer mes Notifications
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/notifications"
```

### Marquer une Notification comme Lue
```bash
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/notifications/1/read"
```

### Marquer Toutes les Notifications comme Lues
```bash
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/notifications/mark-all-read"
```

### Envoyer une Notification (Admin)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "type": "info",
    "message": "Nouvelle mission assignée",
    "data": {"missionId": 1}
  }' \
  http://localhost:3000/api/notifications/send
```

## 📊 Rapports et Dashboard

### Données du Dashboard
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/dashboard"
```

### Générer un Rapport
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "clients",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }' \
  http://localhost:3000/api/reports/generate
```

### Données Dashboard Rapports
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/reports/dashboard"
```

## 📝 Audit et Logs (Admin)

### Récupérer les Logs d'Audit
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/audit/logs?page=1&limit=20&actionType=CREATE"
```

### Statistiques d'Audit
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/audit/stats"
```

## 🔄 Gestion des Tokens

### Rafraîchir un Token
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }' \
  http://localhost:3000/api/auth/refresh
```

### Changer son Mot de Passe
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "ancien_mot_de_passe",
    "newPassword": "nouveau_mot_de_passe"
  }' \
  http://localhost:3000/api/auth/change-password
```

## 📄 Pagination et Filtrage

### Paramètres de Pagination
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 10)
- `search` : Recherche textuelle

### Exemple avec Filtres
```bash
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:3000/api/clients?page=2&limit=5&search=ACME"
```

## 🚨 Gestion des Erreurs

### Codes de Réponse HTTP
- **200** : Succès
- **201** : Créé avec succès
- **400** : Erreur de validation
- **401** : Non authentifié
- **403** : Non autorisé
- **404** : Ressource non trouvée
- **409** : Conflit (doublon)
- **500** : Erreur serveur

### Format des Erreurs
```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Format d'email invalide"
    }
  ]
}
```

## 🔧 Utilitaires

### Health Check
```bash
curl http://localhost:3000/health
```

### Informations API
```bash
curl http://localhost:3000/api/info
```

### Documentation Swagger
Accédez à : http://localhost:3000/api-docs

## 💡 Bonnes Pratiques

### 1. Authentification
- Toujours inclure le token Bearer
- Gérer l'expiration des tokens
- Utiliser le refresh token

### 2. Pagination
- Utiliser la pagination pour les listes
- Limiter le nombre d'éléments par page

### 3. Validation
- Respecter les schémas de validation
- Vérifier les types de données

### 4. Sécurité
- Ne jamais exposer les mots de passe
- Utiliser HTTPS en production
- Respecter les rôles et permissions

## 🐛 Dépannage

### Erreur 401 "Token manquant"
```bash
# Vérifiez le header Authorization
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

### Erreur 403 "Accès refusé"
```bash
# Vérifiez vos permissions/rôle
curl -H "Authorization: Bearer ADMIN_TOKEN" ...
```

### Erreur 500 "Erreur serveur"
```bash
# Vérifiez les logs
tail -f logs/app.log
```

---

**🎉 Votre API est maintenant prête à être utilisée !**

Pour plus d'informations, consultez :
- **Documentation Swagger** : http://localhost:3000/api-docs
- **Fiche technique** : `FICHE_TECHNIQUE.md`
- **Collection Postman** : `postman-collection-complete.json`