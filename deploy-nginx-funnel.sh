#!/bin/bash

set -e

APP_DIR="/var/www/progitek"
BACKUP_SCRIPT="$APP_DIR/backup.sh"
REPORT="$APP_DIR/deploy-report-$(date +'%Y-%m-%d_%H-%M-%S').log"
FUNNEL_LOG="/var/log/tailscale-funnel.log"

echo "[$(date)] ?? D�marrage du d�ploiement Progitek" | tee "$REPORT"

cd "$APP_DIR"

# �tape 1 : Pull du d�p�t (optionnel si d�j� d�ploy� en local)
if [ -d .git ]; then
  echo ">> ?? Mise � jour du code depuis Git..." | tee -a "$REPORT"
  git pull origin main >> "$REPORT" 2>&1
fi

# �tape 2 : Sauvegarde
if [ -f "$BACKUP_SCRIPT" ]; then
  echo ">> ?? Sauvegarde..." | tee -a "$REPORT"
  sudo bash "$BACKUP_SCRIPT" >> "$REPORT" 2>&1
fi

# �tape 3 : Build Backend
cd "$APP_DIR/backend"
echo ">> ??? Build du backend..." | tee -a "$REPORT"
npm install >> "$REPORT" 2>&1
npm run build >> "$REPORT" 2>&1

# �tape 4 : Restart PM2
echo ">> ?? Red�marrage du backend via PM2..." | tee -a "$REPORT"
if pm2 list | grep -q "progitek-backend"; then
  pm2 restart progitek-backend >> "$REPORT" 2>&1
else
  pm2 start dist/server.js --name progitek-backend >> "$REPORT" 2>&1
fi

# �tape 5 : Red�marrer NGINX
echo ">> ?? Reload NGINX..." | tee -a "$REPORT"
sudo nginx -t >> "$REPORT" 2>&1
sudo systemctl reload nginx >> "$REPORT" 2>&1

# �tape 6 : Tailscale Funnel (React + API)
echo ">> ?? Lancement de Tailscale Funnel (443)..." | tee -a "$REPORT"
# Tuer l'ancien funnel si existant
pkill -f "tailscale funnel 443" || true
# D�marrer funnel en arri�re-plan
nohup tailscale funnel --bg 443 >> "$FUNNEL_LOG" 2>&1 &

echo "[$(date)] ? D�ploiement termin� avec succ�s !" | tee -a "$REPORT"
