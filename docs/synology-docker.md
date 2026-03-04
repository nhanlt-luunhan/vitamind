# Synology Docker

Muc tieu moi cua repo la:

- Mac/Win local chay cung mot stack Docker Compose
- Synology chay cung chinh stack do
- Cung dung mot mau env, nhung `.env` runtime tren Synology khong commit

## File dung tren Synology

- Compose: `compose.yml`
- Env: `.env` tao tu `.env.synology.example`

## Lenh deploy

```bash
cp .env.synology.example .env
```

Cap nhat domain, secret, SMTP, OAuth trong `.env`, roi moi deploy:

```bash
git pull origin main
docker compose up -d --build
```

## Nhung gi xay ra khi app boot

Container `app` se:

1. doi Postgres san sang
2. chay `node /app/scripts/sync-db.mjs --mode url`
3. chay `npm run start`

Day la co che migration production-like cua repo nay.

## Bao toan du lieu DB

DB duoc giu neu:

- khong xoa volume Postgres
- van dung lai cung stack volume
- chi `up -d --build` hoac recreate container

DB se mat neu:

- `docker compose down -v`
- xoa volume trong DSM Container Manager

## Bien env quan trong

- `NEXT_PUBLIC_APP_URL=https://app.vitamind.com.vn`
- `INTERNAL_API_BASE_URL=https://app.vitamind.com.vn`
- `INTERNAL_CONTAINER_API_BASE_URL=http://127.0.0.1:3000`
- `POSTGRES_PASSWORD=...`
- `AUTH_SESSION_SECRET=...`
- `INTERNAL_API_SECRET=...`

## pgAdmin

Stack cung chay `pgadmin`, mac dinh bind:

- `127.0.0.1:5050`

Neu can expose qua reverse proxy, cau hinh o DSM/Nginx, khong sua code app.

## Shared Postgres cho local dev

Neu muon Mac/Windows chay `npm run dev` nhung dung DB tren cung NAS, khong cho local dung chung DB production.

Dung mo hinh:

- production app tren Synology -> DB `vitamind`
- local dev Mac/Windows -> DB `vitamind_dev`

Xem them:

- `docs/shared-postgres-dev.md`
- `docs/create-vitamind-dev.sql.example`
