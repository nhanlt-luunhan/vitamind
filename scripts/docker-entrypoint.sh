#!/bin/sh
set -eu

if [ "${AUTO_DB_SYNC:-false}" = "true" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "AUTO_DB_SYNC is enabled but DATABASE_URL is missing." >&2
    exit 1
  fi

  echo "Waiting for PostgreSQL..."
  until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
    sleep 2
  done

  echo "Running database sync..."
  node /app/scripts/sync-db.mjs --mode url
else
  echo "AUTO_DB_SYNC is disabled. Skipping database sync on boot."
fi

exec node server.js
