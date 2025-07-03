#!/bin/bash

# Script de d�ploiement automatique pour Progitek System

set -e

APP_DIR="/var/www/progitek"
BACKUP_SCRIPT="$APP_DIR/backup.sh"
REPORT="$APP_DIR/deploy-report-$(date +'%Y-%m-%d_%H-%M-%S').log"

echo "?? [$(date)] D�ploiement du projet Progitek System..." | tee "$REPORT"

# �tape 1 : Aller dans le dossier du projet
cd "$APP_DIR" || exit 1

# �tape 2 : Faire un pull Git
echo "?? Mise � jour du code source depuis Git..." | tee -a "$REPORT"
git pull origin main >> "$REPORT" 2>&1

# �tape 3 : Sauvegarde
echo "???  Ex�cution du script de sauvegarde..." | tee -a "$REPORT"
sudo "$BACKUP_SCRIPT" >> "$REPORT" 2>&1

# �tape 4 : Rebuild backend
echo "?? Compilation du backend..." | tee -a "$REPORT"
cd backend
npm install >> "$REPORT" 2>&1
npm run build >> "$REPORT" 2>&1

# �tape 5 : Red�marrage PM2
echo "?? Red�marrage via PM2..." | tee -a "$REPORT"
if pm2 list | grep -q "progitek-backend"; then
  pm2 restart ecosystem.config.cjs >> "$REPORT" 2>&1
else
  pm2 start ecosystem.config.cjs --name progitek-backend >> "$REPORT" 2>&1
fi

# �tape 6 : Succ�s
echo "? [$(date)] D�ploiement termin� avec succ�s !" | tee -a "$REPORT"
