#!/bin/bash

# Variables
BACKEND_DIR="/var/www/progitek/backend"
FRONTEND_DIR="/var/www/progitek/frontend"

echo "?? Build backend..."
cd "$BACKEND_DIR" || exit 1
npm install
npm run build
pm2 start ecosystem.config.js || pm2 restart progitek-backend

echo "?? Build frontend..."
cd "$FRONTEND_DIR" || exit 1
npm install
npm run build
pm2 restart progitek-frontend || pm2 start "npm run preview" --name progitek-frontend

echo "?? Activation de Tailscale Funnel sur les ports 3000 (backend) et 5173 (frontend)..."
sudo tailscale funnel 3000
sudo tailscale funnel 5173

echo "? Déploiement terminé !"
echo "?? Frontend : https://pblserver.taile0fd44.ts.net/"
echo "?? API Docs : https://pblserver.taile0fd44.ts.net/api-docs"
