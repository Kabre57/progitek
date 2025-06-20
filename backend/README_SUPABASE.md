# 🚀 Guide de Configuration Backend ProgiTek avec Supabase

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **Compte Supabase** (gratuit)
- **npm** ou **yarn**

## 🛠️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Donnez un nom à votre projet : `progitek-db`
6. Créez un mot de passe sécurisé pour la base de données
7. Choisissez une région proche de vous
8. Cliquez sur "Create new project"

### 2. Récupérer les clés de configuration

Une fois votre projet créé :

1. Allez dans **Settings** > **API**
2. Notez les informations suivantes :
   - **Project URL** : `https://your-project-ref.supabase.co`
   - **anon public** : Clé publique anonyme
   - **service_role** : Clé de service (gardez-la secrète !)

### 3. Configurer les variables d'environnement

Modifiez le fichier `.env` avec vos informations Supabase :

```env
# Configuration Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration (récupéré depuis Supabase Settings > API)
JWT_SECRET=your_jwt_secret_from_supabase

# Le reste reste identique...
```

### 4. Créer les tables dans Supabase

1. Allez dans **SQL Editor** dans votre dashboard Supabase
2. Créez un nouveau query
3. Copiez-collez le contenu du fichier `supabase/migrations/20250618155410_floral_breeze.sql`
4. Exécutez le script

Ou utilisez l'éditeur de tables :
1. Allez dans **Table Editor**
2. Créez les tables manuellement selon le schéma

## 🚀 Installation et démarrage

### 1. Installation des dépendances

```bash
cd backend
npm install
```

### 2. Démarrage du serveur

```bash
# Mode développement
npm run dev

# Mode production
npm run build && npm start
```

## 🔐 Authentification avec Supabase

### Avantages de Supabase Auth

- **développeur web renforcée** : Gestion automatique des tokens JWT
- **Fonctionnalités avancées** : 
  - Réinitialisation de mot de passe par email
  - Confirmation d'email
  - Authentification sociale (Google, GitHub, etc.)
  - Sessions sécurisées
- **Pas de gestion manuelle** des mots de passe hashés

### Configuration de l'authentification

1. Dans votre dashboard Supabase, allez dans **Authentication** > **Settings**
2. Configurez l'URL de votre site : `http://localhost:5173`
3. Activez la confirmation d'email si souhaité
4. Configurez les templates d'email

## 📊 Gestion des données

### Avantages de Supabase Database

- **PostgreSQL complet** avec toutes les fonctionnalités
- **Interface graphique** pour gérer les données
- **API REST automatique** générée
- **Subscriptions en temps réel**
- **Row Level Security (RLS)** pour la développeur web

### Accès aux données

```typescript
// Exemple d'utilisation du client Supabase
import { supabase } from './config/supabase';

// Récupérer des utilisateurs
const { data, error } = await supabase
  .from('utilisateur')
  .select('*')
  .eq('status', 'active');

// Créer un utilisateur
const { data, error } = await supabase
  .from('utilisateur')
  .insert({
    nom: 'Dupont',
    prenom: 'Konan',
    email: 'Konan@example.com'
  });
```

## 🔧 Configuration avancée

### Row Level Security (RLS)

Activez RLS pour sécuriser vos tables :

```sql
-- Activer RLS sur la table utilisateur
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs données
CREATE POLICY "Users can view own data" ON utilisateur
  FOR SELECT USING (auth.uid() = id);
```

### Triggers et fonctions

Supabase supporte les triggers PostgreSQL :

```sql
-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_utilisateur_updated_at 
  BEFORE UPDATE ON utilisateur 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 📧 Configuration Email

### Avec Supabase (recommandé)

Supabase peut gérer l'envoi d'emails :

1. Allez dans **Authentication** > **Settings** > **SMTP Settings**
2. Configurez votre serveur SMTP
3. Testez l'envoi d'emails

### Avec Nodemailer (actuel)

Gardez la configuration Gmail actuelle dans `.env` pour les emails personnalisés.

## 🔍 Monitoring et logs

### Dashboard Supabase

- **Logs** : Consultez les logs en temps réel
- **Métriques** : Surveillez l'utilisation de votre base
- **API** : Testez vos endpoints directement

### Logs de l'application

Les logs sont toujours disponibles dans `logs/app.log`.

## 🚀 Déploiement

### Variables d'environnement de production

```env
NODE_ENV=production
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
JWT_SECRET=your_production_jwt_secret
```

### développeur web

1. **Jamais exposer** la clé `service_role` côté client
2. **Utiliser RLS** pour sécuriser l'accès aux données
3. **Configurer CORS** correctement
4. **Activer l'authentification** sur toutes les routes sensibles

## 🆘 Dépannage

### Erreurs courantes

1. **"Invalid JWT"** : Vérifiez que `JWT_SECRET` correspond à celui de Supabase
2. **"Table doesn't exist"** : Exécutez le script SQL de création des tables
3. **"Unauthorized"** : Vérifiez les politiques RLS

### Tests de connexion

```bash
# Test de l'API
curl http://localhost:3000/health

# Test de connexion Supabase
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progitek.com","mot_de_passe":"admin123"}'
```

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**ProgiTek Backend avec Supabase** - Solution moderne et scalable