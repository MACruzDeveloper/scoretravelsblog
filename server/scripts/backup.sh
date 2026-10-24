#!/usr/bin/env bash
# Backs up the database (mongodump) and the uploaded images, keeping the last KEEP_DAYS days.
# Needs mongodb-database-tools. Reads ATLAS_URL and UPLOADS_DIR from server/.env.
#
# Usage:  scripts/backup.sh [backup-folder]          (default: ~/backups/scoretravelsblog)
# Cron:   0 3 * * * /home/<user>/scoretravelsblog/server/scripts/backup.sh >> /home/<user>/backups/backup.log 2>&1
set -euo pipefail

SERVER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${1:-$HOME/backups/scoretravelsblog}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%F_%H%M)"

# Only the two variables needed, without running the rest of .env as shell code
read_env() { grep -E "^$1=" "$SERVER_DIR/.env" | tail -1 | cut -d= -f2- | sed -E 's/[[:space:]]+#.*$//; s/^["'\'']|["'\'']$//g'; }
ATLAS_URL="${ATLAS_URL:-$(read_env ATLAS_URL)}"
UPLOADS_DIR="${UPLOADS_DIR:-$(read_env UPLOADS_DIR)}"
UPLOADS_DIR="${UPLOADS_DIR:-$SERVER_DIR/uploads/images}"

if [ -z "$ATLAS_URL" ]; then
  echo "ATLAS_URL is not set" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
echo "[$STAMP] Backing up to $BACKUP_DIR"

mongodump --uri "$ATLAS_URL" --gzip --archive="$BACKUP_DIR/db-$STAMP.gz" --quiet
if [ -d "$UPLOADS_DIR" ]; then
  tar czf "$BACKUP_DIR/uploads-$STAMP.tgz" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
fi

# Rotation: remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -maxdepth 1 \( -name 'db-*.gz' -o -name 'uploads-*.tgz' \) -mtime +"$KEEP_DAYS" -delete

echo "[$STAMP] Done: $(ls -1 "$BACKUP_DIR" | wc -l | tr -d ' ') files kept"
