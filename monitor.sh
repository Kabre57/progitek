#!/bin/bash

LOG_DIR="/var/log/progitek"
LOG_FILE="$LOG_DIR/monitor.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")
HTML_REPORT="/tmp/monitor_report.html"
EMAIL="admin@example.com"  # <-- Modifie ici ton adresse email

# Initialisation
mkdir -p "$LOG_DIR"
echo "[$DATE] ?? Démarrage monitoring Progitek System..." > "$LOG_FILE"

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print 100 - $8}')
CPU_STATUS=$(echo "$CPU_USAGE > 90" | bc)
if [ "$CPU_STATUS" -eq 1 ]; then
    echo "[$DATE] ?? CPU élevé: ${CPU_USAGE}%." >> "$LOG_FILE"
else
    echo "[$DATE] ? CPU OK: ${CPU_USAGE}%." >> "$LOG_FILE"
fi

# Mémoire
FREE_MEM=$(free -m | awk '/Mem:/ {print $4}')
if [ "$FREE_MEM" -lt 200 ]; then
    echo "[$DATE] ??  Mémoire libre faible: ${FREE_MEM}MB." >> "$LOG_FILE"
else
    echo "[$DATE] ? Mémoire OK: ${FREE_MEM}MB." >> "$LOG_FILE"
fi

# Disque
DISK_USE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USE" -gt 85 ]; then
    echo "[$DATE] ?? Disque presque plein: ${DISK_USE}% utilisé." >> "$LOG_FILE"
else
    echo "[$DATE] ? Disque OK: ${DISK_USE}% utilisé." >> "$LOG_FILE"
fi

# Apache
if systemctl is-active apache2 > /dev/null 2>&1; then
    echo "[$DATE] ? Apache2 actif." >> "$LOG_FILE"
else
    echo "[$DATE] ? Apache2 inactif!" >> "$LOG_FILE"
fi

# PM2
if pm2 list | grep -q "online"; then
    echo "[$DATE] ? PM2 actif." >> "$LOG_FILE"
else
    echo "[$DATE] ? PM2 inactif!" >> "$LOG_FILE"
fi

# Base SQLite
DB_PATH="/var/www/progitek/backend/prisma/dev.db"
if [ -f "$DB_PATH" ]; then
    DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
    echo "[$DATE] ? Base SQLite présente ($DB_SIZE)." >> "$LOG_FILE"
else
    echo "[$DATE] ? Base SQLite absente!" >> "$LOG_FILE"
fi

# API check
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
if [ "$API_STATUS" = "200" ]; then
    echo "[$DATE] ? API OK (200)." >> "$LOG_FILE"
else
    echo "[$DATE] ? API non accessible ($API_STATUS)." >> "$LOG_FILE"
fi

# SSL Certificat
CERT_FILE="/etc/letsencrypt/live/progitek.com/fullchain.pem"
if [ -f "$CERT_FILE" ]; then
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
    echo "[$DATE] ? Certificat SSL valide jusqu'au: $EXPIRY_DATE." >> "$LOG_FILE"
else
    echo "[$DATE] ??  Certificat SSL non trouvé à $CERT_FILE." >> "$LOG_FILE"
fi

# Rapport HTML
{
echo "<html><body><h2>Rapport Monitoring - $DATE</h2><pre>"
cat "$LOG_FILE"
echo "</pre></body></html>"
} > "$HTML_REPORT"

# Envoi Email
SUBJECT="Rapport de surveillance Progitek System - $DATE"
mail -a "Content-Type: text/html" -s "$SUBJECT" "$EMAIL" < "$HTML_REPORT"
