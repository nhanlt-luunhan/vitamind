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

3. If you run the app with `npm run dev`, create `.env.local` from `.env.example` and set local development values:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_test_...`)
- `CLERK_SECRET_KEY` (`sk_test_...`)
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`
- `INTERNAL_API_BASE_URL=http://127.0.0.1:3333`

4. Run dev server:

```bash
npm run dev
```

App will be available at `http://localhost:3333`.

Clerk local development should use a separate development/test instance from production.
Do not reuse `pk_live` / `sk_live` in `.env.local`.

If you run the app with Docker in development, create `.env.dev.docker` from `.env.dev.docker.example`.
Do not point `docker-compose.dev.yml` at `.env.docker`, because that file is for production.
If you want the admin-only Adminer dashboard inside the app, set `ADMINER_INTERNAL_URL` for the current runtime.

## Production (Synology Docker)

1. Update `.env.docker` with production values:

- `SITE_URL=https://app.vitamind.com.vn`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_...`)
- `CLERK_SECRET_KEY` (`sk_live_...`)
- `INTERNAL_API_BASE_URL=http://127.0.0.1:3333`
- `ADMINER_INTERNAL_URL=http://adminer:8080`
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
- `references/lahomes/` giu cac file tham chieu gon tu template Lahomes. Thu muc goc `Lahomes-Nextjs_v2.0/` chi dung local va khong con duoc dua len git.
