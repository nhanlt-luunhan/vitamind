---
name: docker-deploy
description: Use this skill when the user asks to build a Docker image, deploy to Synology, run docker compose, debug build errors, check container logs, or update the production environment for the Vitamind project.
---

# Docker Deploy – Vitamind (Synology)

## Goal
Build and deploy the Vitamind Next.js app to Synology NAS via Docker Compose, following the project's production rules.

## Key Files
| File | Purpose |
|---|---|
| `docker-compose.yml` | **Production** compose (must keep this exact filename for Synology) |
| `docker-compose.dev.yml` | Local Docker dev environment |
| `.env.docker` | Production env vars (used during `next build`) |
| `Dockerfile` | Production image |
| `Dockerfile.dev` | Dev image |

## Production Deploy (on Synology)

### Step 1: Pull latest code
```bash
git pull origin main
```

### Step 2: Build and start
```bash
docker compose up -d --build
```

### Step 3: Verify (3-step checklist)
```bash
# 1. Check compose config is valid
docker compose config

# 2. Check build output
docker compose build

# 3. Check app logs (tail 200 lines)
docker compose logs --tail=200 app
```

## Critical Rules

### .env.docker must contain ALL of:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`
- `DATABASE_URL`
- `SITE_URL`

### Build process (Dockerfile standard)
- `.env.docker` is copied to `.env.production` before `next build`
- Do NOT use `source .env.docker` or `set -a && . ./.env.docker` — Alpine shell can hide real errors

### Healthcheck
- Uses `node fetch('http://127.0.0.1:3333/api/health')` — NOT `wget`

### Common errors and fixes

| Error | Fix |
|---|---|
| `@clerk/clerk-react: Missing publishableKey` | Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` to `.env.docker` |
| `buildx: failed to read current commit...` | This is a warning only, ignore — read the real error in `npm run build` output |
| `EADDRINUSE: 3333` | Kill existing node process: `Get-Process -Name node \| Stop-Process -Force` |

## Local Docker Dev
```bash
# Start only the DB (recommended for local dev)
docker compose up -d db

# Start pgAdmin
docker compose --profile tools up -d pgadmin
```
pgAdmin: http://127.0.0.1:35050
- Email: `admin@vitamind.com.vn`
- Password: `change-me-pgadmin`

## Constraints
- Do NOT rename `docker-compose.yml` — Synology depends on this exact filename
- Do NOT use `.env.local` or `.env.docker.local` in production — Synology only reads `.env.docker`
- Production Postgres is NOT exposed to the internet — only the app container can reach it
