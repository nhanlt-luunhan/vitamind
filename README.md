# Vitamind

Vitamind duoc chuan hoa theo mot luong chay duy nhat:

- local Mac/Win chay bang Docker Compose
- Synology chay bang Docker Compose
- app luon boot theo kieu production-like: `next build` -> `next start`
- DB schema luon duoc sync khi container `app` khoi dong
- `.env` la file env canonical va duoc commit cung repo

Repo nay khong dung Prisma. Migration duoc quan ly bang cac file SQL trong `docker/db-init` va script `scripts/sync-db.mjs`.

## Runtime chung

- App ngoai host: `http://localhost:3333`
- App trong container: `http://app:3000`
- Postgres ngoai host: `127.0.0.1:5432`
- pgAdmin ngoai host: `http://127.0.0.1:5050`

## File can commit

- `compose.yml`
- `docker/Dockerfile`
- `docker/entrypoint.sh`
- `docker/db-init/*.sql`
- `.env`
- `package-lock.json`

## File khong commit

- `.next/`
- `node_modules/`
- file override tuy chon nhu `.env.local` hoac `.env.synology` neu ban tu tao rieng

## Cach chay local Mac/Win

```bash
docker compose up --build
```

Khong can `npm run dev`.

## Cach chay Synology

```bash
git pull origin main
docker compose up -d --build
```

## Clerk va dong bo user

- Clerk la source of truth cho identity.
- Bang `users` trong Postgres la mirror noi bo.
- Webhook Clerk:
  - `POST /api/webhooks/clerk`
- Backfill thu cong:

```bash
docker compose exec app node ./scripts/clerk-sync.mjs
```

Hoac tren host:

```bash
docker compose run --rm app node ./scripts/clerk-sync.mjs
```

## DB schema

Moi lan container `app` boot:

1. Cho Postgres san sang
2. Chay `node /app/scripts/sync-db.mjs --mode url`
3. Moi `npm run start`

Dieu nay giu local va Synology cung mot quy tac boot.

## Ghi chu

- `NEXT_PUBLIC_APP_URL` la bien URL canonical moi.
- `SITE_URL` van duoc giu lam fallback de tuong thich code cu.
- Neu can doi domain, key, secret hoac bind port, sua trong `.env` va commit cung code.

## Tai lieu lien quan

- `docs/db-sync.md`
- `docs/auth-topology.md`
- `docs/synology-docker.md`
