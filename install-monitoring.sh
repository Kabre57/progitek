#!/bin/bash

# Installe le script de monitoring et crée le cron/job systemd

cp monitor.sh /usr/local/bin/monitor.sh
chmod +x /usr/local/bin/monitor.sh

echo "[Unit]
Description=Surveillance automatique de Progitek

[Service]
Type=oneshot
ExecStart=/usr/local/bin/monitor.sh

[Install]
WantedBy=multi-user.target" | sudo tee /etc/systemd/system/progitek-monitor.service > /dev/null

echo "[Unit]
Description=Planification quotidienne du monitoring de Progitek
After=network.target

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target" | sudo tee /etc/systemd/system/progitek-monitor.timer > /dev/null

sudo systemctl daemon-reload
sudo systemctl enable progitek-monitor.timer
sudo systemctl start progitek-monitor.timer

echo "✅ Monitoring installé et planifié chaque nuit à 02h00."
