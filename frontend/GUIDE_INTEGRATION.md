# 🚀 Guide d'Intégration Frontend - Progitek System

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- **Node.js** 18+ installé
- **npm** ou **yarn**
- **Backend API** Progitek System en cours d'exécution sur `http://localhost:3000`

## 🔧 Installation

### 1. Installer les dépendances
```bash
cd frontend
npm install
```

### 2. Configuration des variables d'environnement
```bash
# Créer le fichier .env
cp .env.example .env
```

**Contenu du fichier `.env` :**
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_VERSION=v1
VITE_APP_NAME=Progitek System
VITE_APP_VERSION=1.0.0
```

### 3. Démarrer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Architecture Frontend

### Structure des fichiers créés
```
frontend/src/
├── components/           # Composants React
│   ├── Dashboard.tsx    # Tableau de bord
│   ├── LoginForm.tsx    # Formulaire de connexion
│   ├── ClientList.tsx   # Liste des clients
│   ├── Layout.tsx       # Layout principal
│   └── ProtectedRoute.tsx # Protection des routes
├── services/            # Services API
│   ├── api.ts          # Configuration Axios
│   ├── authService.ts  # Service d'authentification
│   ├── clientService.ts # Service clients
│   ├── technicianService.ts # Service techniciens
│   └── dashboardService.ts # Service dashboard
├── hooks/               # Hooks personnalisés
│   ├── useAuth.ts      # Hook d'authentification
│   └── useApi.ts       # Hook pour les appels API
├── types/               # Types TypeScript
│   └── api.ts          # Types de l'API
├── App.tsx             # Composant principal
├── main.tsx            # Point d'entrée
└── index.css           # Styles globaux
```

## 🔐 Authentification

### Connexion automatique
L'application gère automatiquement :
- **Stockage des tokens** dans localStorage
- **Refresh automatique** des tokens expirés
- **Redirection** vers login si non authentifié
- **Protection des routes** par rôle

### Utilisation
```typescript
import { useAuth } from './hooks/useAuth';

const { user, login, logout, isAuthenticated, hasRole } = useAuth();

// Connexion
await login('admin@example.com', 'admin123');

// Vérifier le rôle
if (hasRole('admin')) {
  // Actions admin
}
```

## 📡 Services API

### Configuration automatique
Tous les services sont préconfigurés avec :
- **Base URL** depuis les variables d'environnement
- **Headers Authorization** automatiques
- **Gestion des erreurs** centralisée
- **Refresh token** automatique

### Exemple d'utilisation
```typescript
import { clientService } from './services/clientService';

// Récupérer les clients
const clients = await clientService.getClients(1, 10, 'search');

// Créer un client
const newClient = await clientService.createClient({
  nom: 'ACME Corp',
  email: 'contact@acme.com',
  statut: 'active'
});
```

## 🎣 Hooks Personnalisés

### useApi Hook
Simplifie les appels API avec gestion automatique du loading et des erreurs :

```typescript
import { useApi } from './hooks/useApi';
import { clientService } from './services/clientService';

const { data, loading, error, refetch } = useApi(
  () => clientService.getClients(),
  [] // dépendances
);
```

### useAuth Hook
Gère l'état d'authentification global :

```typescript
const { user, loading, login, logout, isAuthenticated } = useAuth();
```

## 🛡️ Protection des Routes

### Utilisation
```typescript
import { ProtectedRoute } from './components/ProtectedRoute';

// Route protégée simple
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Route protégée par rôle
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

## 🎨 Interface Utilisateur

### Composants créés
- **LoginForm** : Formulaire de connexion avec validation
- **Dashboard** : Tableau de bord avec statistiques
- **ClientList** : Liste des clients avec pagination
- **Layout** : Layout principal avec sidebar responsive

### Design System
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **React Hot Toast** pour les notifications
- **Design responsive** mobile-first

## 📊 Fonctionnalités Implémentées

### ✅ Authentification
- Connexion/Déconnexion
- Gestion automatique des tokens
- Protection des routes
- Gestion des rôles

### ✅ Dashboard
- Statistiques en temps réel
- Activité récente
- Top techniciens
- Cartes de métriques

### ✅ Gestion des Clients
- Liste avec pagination
- Recherche en temps réel
- Actions CRUD
- Statuts visuels

### ✅ Layout Responsive
- Sidebar responsive
- Navigation mobile
- Profil utilisateur
- Déconnexion

## 🚀 Prochaines Étapes

### Pages à implémenter
1. **Techniciens** : Liste, création, modification
2. **Missions** : Gestion complète des missions
3. **Interventions** : Suivi des interventions
4. **Spécialités** : Gestion des spécialités
5. **Rôles** : Administration des rôles (admin)
6. **Rapports** : Génération de rapports
7. **Notifications** : Centre de notifications

### Fonctionnalités avancées
- **Temps réel** avec WebSockets
- **Notifications push**
- **Export de données**
- **Thème sombre**
- **Internationalisation**

## 🔧 Développement

### Commandes utiles
```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Linting
npm run lint
```

### Structure recommandée pour nouvelles pages
```typescript
// src/components/NewPage.tsx
import React from 'react';
import { useApi } from '../hooks/useApi';
import { newService } from '../services/newService';

export const NewPage: React.FC = () => {
  const { data, loading, error } = useApi(() => newService.getData(), []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {/* Votre contenu */}
    </div>
  );
};
```

## 🐛 Dépannage

### Erreurs courantes

1. **Erreur CORS**
   - Vérifiez que le backend autorise `http://localhost:5173`
   - Configurez CORS dans le backend

2. **Token expiré**
   - Le refresh automatique gère cela
   - Vérifiez les logs de la console

3. **API non accessible**
   - Vérifiez que le backend est démarré
   - Vérifiez l'URL dans `.env`

### Logs utiles
```typescript
// Activer les logs Axios
apiClient.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

## 📞 Support

### Endpoints de test
- **Backend** : http://localhost:3000/health
- **Frontend** : http://localhost:5173
- **API Docs** : http://localhost:3000/api-docs

### Identifiants de test
- **Email** : admin@example.com
- **Mot de passe** : admin123

---

**🎉 Votre frontend React est maintenant intégré avec l'API Progitek System !**

L'application offre :
- ✅ Authentification complète avec JWT
- ✅ Interface moderne et responsive
- ✅ Gestion automatique des erreurs
- ✅ Protection des routes par rôle
- ✅ Services API typés
- ✅ Hooks réutilisables
- ✅ Design system cohérent

Pour continuer le développement, implémentez les pages manquantes en suivant les patterns établis.