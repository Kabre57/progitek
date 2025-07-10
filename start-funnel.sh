#!/bin/bash

echo "📦 Lancement de Nginx sur le port 8080..."
sudo systemctl start nginx

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx est démarré avec succès."
else
    echo "❌ Échec du démarrage de Nginx. Vérifiez la configuration."
    exit 1
fi

echo "🌐 Activation de Tailscale Funnel..."
tailscale funnel 8080

echo "🔗 Ton app est accessible ici (si Tailscale est actif) :"
tailscale status | grep 'ts.net'

