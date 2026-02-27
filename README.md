# Vitamind

Blog + admin dashboard built with Next.js (App Router) and PostgreSQL.

## Prerequisites

- Node.js 20 LTS
- npm 9+
- Docker Desktop (optional, for local Postgres)

The repo includes `.nvmrc` so both Windows and macOS can use the same Node version.

## Local Development (Windows/macOS)

1. Install dependencies:

```bash
npm install
```

2. Start Postgres (optional, recommended):

```bash
docker compose up -d db
```

3. Create `.env.local` from `.env.example` and set:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`

4. Run dev server:

```bash
npm run dev
```

App will be available at `http://localhost:3333`.

## Production (Synology Docker)

1. Update `.env.docker` with production values.
2. Build and run:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Postgres is not exposed publicly in production; only the app container can reach it.

## Clerk Webhook

Configure Clerk webhooks to point at:

- `POST /api/webhooks/clerk`

Events:

- `user.created`
- `user.updated`
- `user.deleted`

## Notes

- `.env.local` and `.env` are ignored by git.
- If you change Node version, update `.nvmrc` and `package.json` engines.
