#!/bin/bash

echo "?? Démarrage du déploiement Progitek..."

cd /var/www/progitek || exit 1

echo "?? Reconstruction des conteneurs Docker..."
docker compose down
docker compose build
docker compose up -d

echo "?? Activation de Tailscale Funnel sur les ports 3000 et 5173..."
tailscale funnel 3000 &
tailscale funnel 5173 &

echo "? Déploiement terminé avec succès !"
echo "?? Backend disponible sur : https://pblserver.taile0fd44.ts.net/progitek-api/"
echo "?? Frontend disponible sur : https://pblserver.taile0fd44.ts.net/progitek/"
