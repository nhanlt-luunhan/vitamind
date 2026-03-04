#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

echo "Waiting for PostgreSQL..."
until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
  sleep 2
done

echo "Running database sync..."
node /app/scripts/sync-db.mjs --mode url

echo "Starting Next..."
exec npm run start
