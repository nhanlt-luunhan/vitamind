#!/bin/sh
set -eu

SYNOLOGY_SSH_TARGET="${SYNOLOGY_SSH_TARGET:-}"
SYNOLOGY_REMOTE_PROJECT_DIR="${SYNOLOGY_REMOTE_PROJECT_DIR:-}"
SYNOLOGY_SSH_PORT="${SYNOLOGY_SSH_PORT:-22}"
LOCAL_UPLOADS_DIR="${LOCAL_UPLOADS_DIR:-public/uploads}"
SYNC_DELETE="${SYNC_DELETE:-false}"

if [ -z "$SYNOLOGY_SSH_TARGET" ]; then
  echo "Missing SYNOLOGY_SSH_TARGET, example: root@PalletHub" >&2
  exit 1
fi

if [ -z "$SYNOLOGY_REMOTE_PROJECT_DIR" ]; then
  echo "Missing SYNOLOGY_REMOTE_PROJECT_DIR, example: /volume1/docker/vitamind" >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required on local machine." >&2
  exit 1
fi

if [ ! -d "$LOCAL_UPLOADS_DIR" ]; then
  echo "Local uploads directory not found: $LOCAL_UPLOADS_DIR" >&2
  exit 1
fi

REMOTE_UPLOADS_DIR="$SYNOLOGY_REMOTE_PROJECT_DIR/public/uploads"
SSH_CMD="ssh -p $SYNOLOGY_SSH_PORT"
DELETE_FLAG=""

if [ "$SYNC_DELETE" = "true" ]; then
  DELETE_FLAG="--delete"
fi

echo "Ensuring remote uploads directory exists: $REMOTE_UPLOADS_DIR"
$SSH_CMD "$SYNOLOGY_SSH_TARGET" "mkdir -p '$REMOTE_UPLOADS_DIR'"

echo "Syncing uploads from $LOCAL_UPLOADS_DIR to $SYNOLOGY_SSH_TARGET:$REMOTE_UPLOADS_DIR"
rsync -av $DELETE_FLAG -e "$SSH_CMD" "$LOCAL_UPLOADS_DIR/" "$SYNOLOGY_SSH_TARGET:$REMOTE_UPLOADS_DIR/"

echo "Uploads sync completed."
