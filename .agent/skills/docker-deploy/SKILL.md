---
name: docker-deploy
description: Use this skill when the user asks to build Docker images, run docker compose, deploy to Synology, debug container/runtime errors, or update the Vitamind production environment.
---

# Docker Deploy - Vitamind

## Goal
Run Vitamind the same way on local Mac/Win and Synology: Docker Compose only, production-like runtime only.

## Key Files
| File | Purpose |
|---|---|
| `compose.yml` | Canonical compose for local Mac/Win and Synology |
| `.env.local` | Local Docker env vars |
| `.env.synology` | Synology env vars |
| `docker/Dockerfile` | Canonical production-like image |
| `docker/entrypoint.sh` | Wait DB -> sync schema -> start app |

## Local Run
```bash
docker compose --env-file .env.local -f compose.yml up --build
```

## Synology Deploy
```bash
git pull origin main
docker compose --env-file .env.synology -f compose.yml up -d --build
```

## Verify
```bash
docker compose --env-file .env.synology -f compose.yml config
docker compose --env-file .env.synology -f compose.yml build
docker compose --env-file .env.synology -f compose.yml logs --tail=200 app
```

## Active env file must contain
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

## Build Rules
- Use `docker compose --env-file ...` to inject env.
- Do NOT use `source .env.*` or `set -a && . ./.env.*`.
- Use `compose.yml` as the only compose file.
- Use `.env.local` for local and `.env.synology` for Synology.

## Common errors

| Error | Fix |
|---|---|
| `@clerk/clerk-react: Missing publishableKey` | Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to the active env file |
| `buildx: failed to read current commit...` | Warning only; inspect the real error in build output |
| `EADDRINUSE: 3333` | Stop the old stack or change the bind port in env |

## Constraints
- Production Postgres is not exposed to the internet; only the app container should reach it.
- Secrets do not belong in git.
