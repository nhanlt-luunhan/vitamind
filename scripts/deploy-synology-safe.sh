#!/bin/sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
PROJECT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/postgres-$TIMESTAMP.sql.gz"
RUN_DB_SYNC="${RUN_DB_SYNC:-false}"

cd "$PROJECT_DIR"

mkdir -p "$BACKUP_DIR"

if docker compose -f "$COMPOSE_FILE" ps db >/dev/null 2>&1; then
  if [ -n "$(docker compose -f "$COMPOSE_FILE" ps -q db)" ]; then
    echo "Creating PostgreSQL backup at $BACKUP_FILE"
    docker compose -f "$COMPOSE_FILE" exec -T db sh -lc \
      'PGPASSWORD="${POSTGRES_PASSWORD:-vitamind}" pg_dump -U "${POSTGRES_USER:-vitamind}" -d "${POSTGRES_DB:-vitamind}"' \
      | gzip >"$BACKUP_FILE"
  else
    echo "Database container is not running yet. Skipping backup."
  fi
else
  echo "Compose stack is not up yet. Skipping backup."
fi

echo "Building and starting services with $COMPOSE_FILE"
docker compose -f "$COMPOSE_FILE" up -d --build

if [ "$RUN_DB_SYNC" = "true" ]; then
  echo "Running explicit database sync"
  docker compose -f "$COMPOSE_FILE" exec -T app sh -lc 'node /app/scripts/sync-db.mjs --mode url'
else
  echo "RUN_DB_SYNC is false. Database sync was not executed."
fi

echo "Deployment finished."
