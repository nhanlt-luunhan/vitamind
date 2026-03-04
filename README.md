# Vitamind

Vitamind ho tro 2 cach chay local:

- full Docker Compose cho flow production-like
- Docker chi chay dich vu phu tro (`db`, `pgadmin`), con app chay bang `npm run dev`

Mac dinh hien tai:

- Synology chay bang Docker Compose
- app production boot theo kieu `next build` -> `next start`
- DB schema duoc sync khi container `app` khoi dong
- `.env` la file env runtime local tren tung may va khong commit

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
- `.env.example`
- `.env.local.example`
- `.env.synology.example`
- `package-lock.json`

## File khong commit

- `.env`
- `.next/`
- `node_modules/`
- file override tuy chon nhu `.env.local` hoac `.env.synology` neu ban tu tao rieng

## Cach chay local Mac/Win

### Cach 1: Full Docker

```bash
docker compose up --build
```

Dung khi ban muon test gan voi production.

### Cach 2: Docker cho DB + `npm run dev` cho app

```bash
npm run dev:services
npm run dev
```

Mode nay phu hop khi ban code giao dien hoac API va can hot reload.

URL local:

- App: `http://localhost:3333`
- Postgres: `127.0.0.1:5432`
- pgAdmin: `http://127.0.0.1:5050`

Dung xong co the tat dich vu phu tro:

```bash
npm run dev:services:down
```

Luu y:

- `.env` hien dang dat `DATABASE_URL=postgresql://vitamind:vitamind@127.0.0.1:5432/vitamind`, nen `npm run dev` tren host se noi truc tiep vao Postgres trong Docker.
- o mode `npm run dev`, schema khong duoc auto-sync nhu container `app`. Neu ban vua doi SQL trong `docker/db-init`, hay chay them script sync phu hop truoc khi test.
- Auth local hien dung session cookie noi bo va bang `users` trong Postgres.
- Cloudflare Email Routing chi dung de nhan/forward email vao `support@vitamind.com.vn`; de gui ma quen mat khau, app can `SMTP_*` duoc cau hinh.
- Tao `.env` local tu `.env.example` hoac `.env.local.example` va giu file do o may ban.

Neu muon local giong domain production:

1. Them hosts entry tren may local:
```txt
127.0.0.1 app.vitamind.com.vn
```
2. Mo app bang:
```txt
http://app.vitamind.com.vn:3333
```
3. Neu muon `https://app.vitamind.com.vn` ngay tren local, ban can reverse proxy + TLS local; repo nay khong tu tao chung chi cho may local.

## Cach chay Synology

Tren NAS, tao `.env` tu file mau truoc:

```bash
cp .env.synology.example .env
```

Sau do dien domain, secret, SMTP, va OAuth that.

Lenh deploy:

```bash
git pull origin main
docker compose up -d --build
```

## Auth va nguoi dung

- Toan bo auth duoc quan ly noi bo trong Postgres.
- Session duoc ky bang `AUTH_SESSION_SECRET`.
- Dang ky va dang nhap dung cac route `db-sign-up` va `db-sign-in`.

## DB schema

Moi lan container `app` boot:

1. Cho Postgres san sang
2. Chay `node /app/scripts/sync-db.mjs --mode url`
3. Moi `npm run start`

Dieu nay giu local va Synology cung mot quy tac boot.

## Ghi chu

- `NEXT_PUBLIC_APP_URL` la bien URL canonical moi.
- `SITE_URL` van duoc giu lam fallback de tuong thich code cu.
- `INTERNAL_API_BASE_URL` la URL cong khai de script tu host goi vao app.
- `INTERNAL_CONTAINER_API_BASE_URL` la URL noi bo chi danh cho request ben trong container app.
- Neu can doi domain, key, secret hoac bind port, sua trong `.env` tren may dang chay app, khong dua secret vao git.

## Tai lieu lien quan

- `docs/db-sync.md`
- `docs/synology-docker.md`
