# Vitamind

Blog va trang quan tri duoc xay dung bang Next.js App Router, PostgreSQL va Clerk.

## Yeu cau

- Node.js 20 LTS
- npm 9+
- Docker Desktop neu muon chay Postgres local

## Chay local

1. Cai dependency:

```bash
npm install
```

2. Khoi dong Postgres local:

```bash
docker compose up -d db
```

Neu can pgAdmin:

```bash
docker compose --profile tools up -d pgadmin
```

- pgAdmin: `http://127.0.0.1:35050`
- Email mac dinh: `admin@vitamind.com.vn`
- Password mac dinh: `change-me-pgadmin`

3. Tao `.env.local` tu `.env.example`.

Mau topology khuyen nghi:

- local/dev dung `DATABASE_URL` rieng, vi du `postgresql://vitamind:vitamind@127.0.0.1:33542/vitamind`
- production dung `DATABASE_URL` rieng
- co the dung chung Clerk giua local va production neu muon cung tap user
- bang `users` cua moi DB la mirror tu Clerk, khong phai source of truth chung

4. Chay app:

```bash
npm run dev
```

App chay tai `http://127.0.0.1:3333`.

## Shared Clerk, Separate DB

Neu muon dev va production dung cung mot tap user:

- dung cung `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` va `CLERK_SECRET_KEY`
- khong tro local vao DB production
- bat webhook Clerk cho tung moi truong can sync
- backfill user tu Clerk xuong DB local bang:

```bash
npm run clerk:sync
```

Script nay goi:

- `POST /api/internal/clerk-sync`

Yeu cau:

- app local dang chay
- `INTERNAL_API_BASE_URL` dung
- `INTERNAL_API_SECRET` dung

## Guard cho local/dev

Repo co 2 env de bao ve khi local dung chung Clerk voi production:

- `SHARED_CLERK_MODE=true`
- `PROTECT_SHARED_IDENTITY_FIELDS=true`

Khi bat hai flag nay, local/dev se bi chan:

- sua `role`
- sua `status`
- import user co `gid`, `role`, `status`
- xoa user trong admin

Muc tieu la tranh local/dev vo tinh sua du lieu nhay cam anh huong moi truong khac.

## Sync schema DB

Schema SQL nam trong `docker/db-init`.

Chay:

```bash
npm run db:sync
```

Tham khao them:

- `docs/db-sync.md`
- `docs/auth-topology.md`

## Clerk webhook

Cau hinh Clerk webhook tro vao:

- `POST /api/webhooks/clerk`

Bat cac event:

- `user.created`
- `user.updated`
- `user.deleted`

Neu can dong bo toan bo user Clerk ve Postgres sau khi deploy hoac sau khi thieu webhook cu, goi endpoint noi bo:

```bash
curl -X POST https://vitamind.com.vn/api/internal/clerk-sync \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Neu chi muon sync mot user Clerk cu the:

```bash
curl -X POST https://vitamind.com.vn/api/internal/clerk-sync \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"clerkUserId":"user_xxx"}'
```

## Production

Production dung `.env.docker` va `docker compose up -d --build`.

Khong publish Postgres ra Internet. Chi app production moi nen truy cap DB production.

## Synology Docker

Co the chay tren Synology Docker/Container Manager, nhung can hieu dung muc do cam ket:

- tuong thich tot voi stack Compose hien tai
- khong co co so de khang dinh "100%" neu chua test tren dung model NAS, dung reverse proxy va dung Clerk env that
- DB duoc bao toan neu giu nguyen volume `db_data`

Chi tiet van hanh:

- `docs/synology-docker.md`
