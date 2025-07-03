#!/bin/bash

# Script de déploiement automatique pour Progitek System

set -e

APP_DIR="/var/www/progitek"
BACKUP_SCRIPT="$APP_DIR/backup.sh"
REPORT="$APP_DIR/deploy-report-$(date +'%Y-%m-%d_%H-%M-%S').log"

echo "?? [$(date)] Déploiement du projet Progitek System..." | tee "$REPORT"

# Étape 1 : Aller dans le dossier du projet
cd "$APP_DIR" || exit 1

# Étape 2 : Faire un pull Git
echo "?? Mise à jour du code source depuis Git..." | tee -a "$REPORT"
git pull origin main >> "$REPORT" 2>&1

# Étape 3 : Sauvegarde
echo "???  Exécution du script de sauvegarde..." | tee -a "$REPORT"
sudo "$BACKUP_SCRIPT" >> "$REPORT" 2>&1

# Étape 4 : Rebuild backend
echo "?? Compilation du backend..." | tee -a "$REPORT"
cd backend
npm install >> "$REPORT" 2>&1
npm run build >> "$REPORT" 2>&1

# Étape 5 : Redémarrage PM2
echo "?? Redémarrage via PM2..." | tee -a "$REPORT"
if pm2 list | grep -q "progitek-backend"; then
  pm2 restart ecosystem.config.cjs >> "$REPORT" 2>&1
else
  pm2 start ecosystem.config.cjs --name progitek-backend >> "$REPORT" 2>&1
fi

# Étape 6 : Succès
echo "? [$(date)] Déploiement terminé avec succès !" | tee -a "$REPORT"
