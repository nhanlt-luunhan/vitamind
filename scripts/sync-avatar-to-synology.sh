#!/bin/sh
set -eu

EMAIL="${1:-}"
SYNOLOGY_SSH_TARGET="${SYNOLOGY_SSH_TARGET:-}"
SYNOLOGY_REMOTE_PROJECT_DIR="${SYNOLOGY_REMOTE_PROJECT_DIR:-}"
SYNOLOGY_SSH_PORT="${SYNOLOGY_SSH_PORT:-22}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.synology.yml}"
POSTGRES_USER="${POSTGRES_USER:-vitamind}"
POSTGRES_DB="${POSTGRES_DB:-vitamind}"

if [ -z "$EMAIL" ]; then
  echo "Usage: sh ./scripts/sync-avatar-to-synology.sh user@example.com" >&2
  exit 1
fi

if [ -z "$SYNOLOGY_SSH_TARGET" ]; then
  echo "Missing SYNOLOGY_SSH_TARGET, example: root@PalletHub" >&2
  exit 1
fi

if [ -z "$SYNOLOGY_REMOTE_PROJECT_DIR" ]; then
  echo "Missing SYNOLOGY_REMOTE_PROJECT_DIR, example: /volume1/docker/vitamind" >&2
  exit 1
fi

sql_quote() {
  printf "%s" "$1" | sed "s/'/''/g"
}

run_local_query() {
  if [ -n "${DATABASE_URL:-}" ] && command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -At -F $'\t' -c "$1"
    return
  fi

  docker compose exec -T db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -At -F $'\t' -c "$1"
}

LOCAL_SQL="select coalesce(avatar_url, '') from users where lower(email) = lower('$(sql_quote "$EMAIL")') limit 1;"
AVATAR_URL="$(run_local_query "$LOCAL_SQL" | tail -n 1)"

if [ -z "$AVATAR_URL" ]; then
  echo "No avatar_url found in local DB for $EMAIL" >&2
  exit 1
fi

case "$AVATAR_URL" in
  /uploads/*)
    echo "Avatar points to internal upload path. Sync uploads first."
    ;;
esac

REMOTE_SQL="update users set avatar_url = '$(sql_quote "$AVATAR_URL")', updated_at = now() where lower(email) = lower('$(sql_quote "$EMAIL")');"

echo "Applying avatar_url for $EMAIL on Synology DB"
printf "%s\n" "$REMOTE_SQL" | ssh -p "$SYNOLOGY_SSH_PORT" "$SYNOLOGY_SSH_TARGET" \
  "cd '$SYNOLOGY_REMOTE_PROJECT_DIR' && docker compose -f '$COMPOSE_FILE' exec -T db psql -U '$POSTGRES_USER' -d '$POSTGRES_DB'"

echo "Verifying remote avatar_url"
VERIFY_SQL="select email, avatar_url from users where lower(email) = lower('$(sql_quote "$EMAIL")');"
printf "%s\n" "$VERIFY_SQL" | ssh -p "$SYNOLOGY_SSH_PORT" "$SYNOLOGY_SSH_TARGET" \
  "cd '$SYNOLOGY_REMOTE_PROJECT_DIR' && docker compose -f '$COMPOSE_FILE' exec -T db psql -U '$POSTGRES_USER' -d '$POSTGRES_DB'"

echo "Avatar sync completed."
