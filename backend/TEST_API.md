# 🧪 Guide de Test de l'API ParabellumGroups System

## 🚀 Étapes préliminaires

### 1. Démarrer l'API
```bash
# Dans le terminal, dans le dossier du projet
npm run dev
```

Vous devriez voir :
```
🚀 ================================
🚀 ParabellumGroups System API démarré
🚀 Port: 3000
🚀 Environnement: development
🚀 Documentation: http://localhost:3000/api-docs
🚀 Health Check: http://localhost:3000/health
🚀 ================================
```

### 2. Vérifier que l'API fonctionne
Ouvrez votre navigateur et allez sur : http://localhost:3000/health

Vous devriez voir :
```json
{
  "status": "OK",
  "message": "Serveur en fonctionnement",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

## 🔐 Test de Connexion

### Méthode 1 : PowerShell (Windows)
```powershell
$body = @{
    email = "theogoeffroy5@gmail.com"
    motDePasse = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $body

# Afficher la réponse
$response

# Sauvegarder le token pour les prochaines requêtes
$token = $response.data.tokens.accessToken
Write-Host "Token: $token"
```

### Méthode 2 : curl (Linux/macOS/Git Bash)
```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "theogoeffroy5@gmail.com", "motDePasse": "admin123"}' \
  | jq '.'

# Si vous n'avez pas jq, sans formatage :
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "theogoeffroy5@gmail.com", "motDePasse": "admin123"}'
```

### Méthode 3 : Navigateur (Console JavaScript)
```javascript
// Ouvrir la console (F12) sur n'importe quelle page et exécuter :
async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'theogoeffroy5@gmail.com',
        motDePasse: 'admin123'
      })
    });
    
    const data = await response.json();
    console.log('Réponse:', data);
    
    if (data.success) {
      console.log('✅ Connexion réussie !');
      console.log('Token:', data.data.tokens.accessToken);
      
      // Sauvegarder le token dans le localStorage pour les prochains tests
      localStorage.setItem('authToken', data.data.tokens.accessToken);
    } else {
      console.log('❌ Erreur:', data.message);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  }
}

testLogin();
```

## 📊 Réponse attendue

Si tout fonctionne, vous devriez recevoir :

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
      "phone": "+225 01 02 03 04 05",
      "status": "active",
      "lastLogin": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "role": {
        "libelle": "admin"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

## 🔑 Utiliser le token pour d'autres requêtes

### PowerShell
```powershell
# Utiliser le token sauvegardé précédemment
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Obtenir le profil utilisateur
$profile = Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Method GET -Headers $headers
$profile
```

### curl
```bash
# Remplacez YOUR_TOKEN par le token reçu
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript (Console)
```javascript
// Utiliser le token sauvegardé
async function testProfile() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('❌ Pas de token. Connectez-vous d\'abord.');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Profil utilisateur:', data);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testProfile();
```

## 🧪 Tests supplémentaires

### 1. Lister les clients
```bash
curl -X GET http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Créer un nouveau client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nom": "Nouveau Client Test",
    "email": "test@example.com",
    "telephone": "+225 07 08 09 10 11",
    "entreprise": "Entreprise Test",
    "statut": "active",
    "localisation": "Abidjan"
  }'
```

### 3. Lister les techniciens
```bash
curl -X GET http://localhost:3000/api/techniciens \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Dépannage

### Erreur "Connection refused"
- Vérifiez que l'API est démarrée (`npm run dev`)
- Vérifiez le port (par défaut 3000)

### Erreur 401 "Token manquant"
- Vérifiez que vous incluez le header `Authorization: Bearer TOKEN`
- Vérifiez que le token n'est pas expiré

### Erreur CORS
- Vérifiez la configuration CORS dans `.env`
- Utilisez curl ou Postman au lieu du navigateur

### Erreur 500 "Internal Server Error"
- Vérifiez les logs dans `logs/app.log`
- Vérifiez que la base de données est initialisée

## 📱 Utiliser Postman (Recommandé pour les débutants)

1. **Télécharger Postman** : https://www.postman.com/downloads/
2. **Créer une nouvelle collection** "ParabellumGroups API"
3. **Ajouter la requête de connexion** :
   - Méthode : POST
   - URL : `http://localhost:3000/api/auth/login`
   - Headers : `Content-Type: application/json`
   - Body (raw JSON) :
   ```json
   {
     "email": "theogoeffroy5@gmail.com",
     "motDePasse": "admin123"
   }
   ```
4. **Sauvegarder le token** dans les variables d'environnement Postman
5. **Créer d'autres requêtes** en utilisant `{{token}}` dans le header Authorization

## ✅ Checklist de test

- [ ] API démarrée (`npm run dev`)
- [ ] Health check fonctionne (http://localhost:3000/health)
- [ ] Connexion admin réussie
- [ ] Token reçu et valide
- [ ] Profil utilisateur accessible
- [ ] Endpoints protégés fonctionnent avec le token
- [ ] Documentation Swagger accessible (http://localhost:3000/api-docs)

**🎉 Si tous ces tests passent, votre API fonctionne parfaitement !**