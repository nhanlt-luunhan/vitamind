#!/bin/sh
set -eu

PROJECT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.synology.yml}"
ENV_FILE="${ENV_FILE:-.env.docker}"

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

SITE_URL="$(sed -n 's/^SITE_URL=//p' "$ENV_FILE" | tail -n 1)"
INTERNAL_API_BASE_URL="$(sed -n 's/^INTERNAL_API_BASE_URL=//p' "$ENV_FILE" | tail -n 1)"
INTERNAL_API_SECRET="$(sed -n 's/^INTERNAL_API_SECRET=//p' "$ENV_FILE" | tail -n 1)"
POSTGRES_USER="$(sed -n 's/^POSTGRES_USER=//p' "$ENV_FILE" | tail -n 1)"
POSTGRES_DB="$(sed -n 's/^POSTGRES_DB=//p' "$ENV_FILE" | tail -n 1)"

SITE_URL="${SITE_URL:-https://vitamind.com.vn}"
INTERNAL_API_BASE_URL="${INTERNAL_API_BASE_URL:-http://127.0.0.1:3333}"
INTERNAL_API_SECRET="${INTERNAL_API_SECRET:-change-me-now}"
POSTGRES_USER="${POSTGRES_USER:-vitamind}"
POSTGRES_DB="${POSTGRES_DB:-vitamind}"
SYNC_BASE_URL="$INTERNAL_API_BASE_URL"

echo "Deploying stack with DB sync enabled"
RUN_DB_SYNC=true sh ./scripts/deploy-synology-safe.sh

if ! curl -fsS "$SYNC_BASE_URL/api/health" >/dev/null 2>&1; then
  SYNC_BASE_URL="http://127.0.0.1:3333"
fi

if ! curl -fsS "$SYNC_BASE_URL/api/health" >/dev/null 2>&1; then
  SYNC_BASE_URL="$SITE_URL"
fi

echo "Syncing all Clerk users into Postgres"
curl -fsS -X POST "$SYNC_BASE_URL/api/internal/clerk-sync" \
  -H "x-internal-secret: $INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'

echo
echo "Current users in Postgres"
docker compose -f "$COMPOSE_FILE" exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "select email, role, status, clerk_user_id, avatar_url from users order by created_at desc;"
