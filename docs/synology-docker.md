# Synology Docker

Muc tieu moi cua repo la:

- Mac/Win local chay cung mot stack Docker Compose
- Synology chay cung chinh stack do
- Cung dung file `.env` duoc commit, khong khac o Dockerfile hay entrypoint

## File dung tren Synology

- Compose: `compose.yml`
- Env: `.env`

## Lenh deploy

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
- `POSTGRES_PASSWORD=...`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`
- `CLERK_SECRET_KEY=...`
- `CLERK_WEBHOOK_SIGNING_SECRET=...`
- `INTERNAL_API_SECRET=...`

## pgAdmin

Stack cung chay `pgadmin`, mac dinh bind:

- `127.0.0.1:5050`

Neu can expose qua reverse proxy, cau hinh o DSM/Nginx, khong sua code app.
