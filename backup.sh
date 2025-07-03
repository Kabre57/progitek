#!/bin/bash

# === CONFIGURATION ===
BACKUP_DIR="/var/backups/progitek"
PROJECT_DIR="/var/www/progitek"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
ARCHIVE_NAME="progitek-backup-$DATE.tar.gz"
TMP_LOG="/tmp/progitek_backup_$DATE.log"
REPORT_FILE="$BACKUP_DIR/rapport-backup-$DATE.txt"
EMAIL="theogeoffroy5@gmail.com"

# === CRÉATION DU DOSSIER DE SAUVEGARDE ===
mkdir -p "$BACKUP_DIR"

echo "[?? $(date)] ?? Début de la sauvegarde..." | tee "$TMP_LOG"

# === CRÉATION DE L'ARCHIVE ===
tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" \
  "$PROJECT_DIR/backend" \
  "$PROJECT_DIR/frontend" \
  "$PROJECT_DIR/docker-compose.yml" \
  "$PROJECT_DIR/backend/.env" \
  "$PROJECT_DIR/ecosystem.config.cjs" \
  "$PROJECT_DIR/backend/prisma/dev.db" \
  "$PROJECT_DIR/backend/prisma/production.db" 2>> "$TMP_LOG"

# Vérification de l'archive
if [[ $? -eq 0 ]]; then
  echo "[? $(date)] Sauvegarde réussie : $BACKUP_DIR/$ARCHIVE_NAME" | tee -a "$TMP_LOG"
else
  echo "[? $(date)] Erreur lors de la création de l'archive." | tee -a "$TMP_LOG"
fi

# === LOGS PM2 + APACHE ===
echo -e "\n[??? LOGS]" >> "$TMP_LOG"
echo "Derniers logs PM2 :" >> "$TMP_LOG"
pm2 logs --lines 20 --nostream >> "$TMP_LOG" 2>&1

echo -e "\nDerniers logs Apache :" >> "$TMP_LOG"
tail -n 20 /var/log/apache2/error.log >> "$TMP_LOG" 2>/dev/null
tail -n 20 /var/log/apache2/access.log >> "$TMP_LOG" 2>/dev/null

# === NETTOYAGE DES SAUVEGARDES DE PLUS DE 30 JOURS ===
find "$BACKUP_DIR" -type f -name "progitek-backup-*.tar.gz" -mtime +30 -exec rm {} \; >> "$TMP_LOG"

# === ENREGISTRER LE RAPPORT ===
cp "$TMP_LOG" "$REPORT_FILE"
echo "[?? $(date)] Rapport de sauvegarde complet enregistré : $REPORT_FILE" | tee -a "$TMP_LOG"

# === ENVOI EMAIL ===
if grep -q "Sauvegarde réussie" "$TMP_LOG"; then
  SUBJECT="? Sauvegarde réussie - Progitek"
else
  SUBJECT="? Échec de la sauvegarde - Progitek"
fi

mail -s "$SUBJECT" "$EMAIL" < "$TMP_LOG"

# === FIN ===
echo "[?? $(date)] Fin du script de sauvegarde." >> "$TMP_LOG"
