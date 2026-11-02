#!/usr/bin/env bash
# Copies the production database over the development one (docker compose up -d), replacing it.
# Production is only read. Needs mongodb-database-tools, ATLAS_URL (local) and ATLAS_URL_PROD in server/.env.
#
# Usage: npm run db:dev:copy
set -euo pipefail

SERVER_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Only the two variables needed, without running the rest of .env as shell code
read_env() { { grep -E "^$1=" "$SERVER_DIR/.env" || true; } | tail -1 | cut -d= -f2- | sed -E 's/[[:space:]]+#.*$//; s/^["'\'']|["'\'']$//g'; }
LOCAL_URL="${ATLAS_URL:-$(read_env ATLAS_URL)}"
PROD_URL="${ATLAS_URL_PROD:-$(read_env ATLAS_URL_PROD)}"

# The destination is replaced: never anything but this computer
if ! [[ "$LOCAL_URL" =~ ^mongodb://(localhost|127\.0\.0\.1)(:[0-9]+)?/[^/?]+ ]]; then
  echo "ATLAS_URL must be a local database with its name (mongodb://localhost:27017/project)" >&2
  exit 1
fi
if [ -z "$PROD_URL" ]; then
  echo "ATLAS_URL_PROD is not set" >&2
  exit 1
fi

database_of() { sed -E 's#^[^/]*//[^/]*/([^/?]*).*#\1#' <<<"$1"; }
SOURCE="$(database_of "$PROD_URL")"
TARGET="$(database_of "$LOCAL_URL")"
if [ -z "$SOURCE" ]; then
  echo "ATLAS_URL_PROD must include the database name (.../project?...)" >&2
  exit 1
fi

echo "Copying $SOURCE to the local $TARGET..."
mongodump --uri "$PROD_URL" --gzip --archive --quiet |
  mongorestore --uri "${LOCAL_URL%/*}" --gzip --archive --quiet --drop --nsInclude "$SOURCE.*" --nsFrom "$SOURCE.*" --nsTo "$TARGET.*"
echo "Done."
