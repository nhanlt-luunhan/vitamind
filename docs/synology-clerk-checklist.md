# Synology Clerk Checklist

Checklist nay dung cho deployment production tren Synology voi Clerk la nguon su that cho identity.

## 1. `.env` tren Synology

Toi thieu can co:

```dotenv
NEXT_PUBLIC_APP_URL=https://app.vitamind.com.vn
SITE_URL=https://app.vitamind.com.vn

APP_BIND_IP=0.0.0.0
APP_PORT=3333

POSTGRES_BIND_IP=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=vitamind
POSTGRES_USER=vitamind
POSTGRES_PASSWORD=change-me-postgres

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/auth/continue
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/auth/continue

INTERNAL_API_SECRET=change-me
INTERNAL_API_BASE_URL=https://app.vitamind.com.vn

SHARED_CLERK_MODE=false
PROTECT_SHARED_IDENTITY_FIELDS=true
```

## 2. Clerk Dashboard

### Redirect URLs

- `https://app.vitamind.com.vn/sign-in`
- `https://app.vitamind.com.vn/sign-up`
- `https://app.vitamind.com.vn/auth/continue`
- `https://app.vitamind.com.vn/sign-in/sso-callback`
- `https://app.vitamind.com.vn/sign-up/sso-callback`

### Allowed origins / domains

- `https://app.vitamind.com.vn`
- domain `vitamind.com.vn` da duoc verify neu Clerk yeu cau

### Webhook

- Endpoint: `https://app.vitamind.com.vn/api/webhooks/clerk`
- Events khuyen nghi:
  - `user.created`
  - `user.updated`
  - `user.deleted`

`Signing Secret` cua webhook phai giong `CLERK_WEBHOOK_SIGNING_SECRET` trong `.env`.

## 3. Deploy

```bash
git pull origin main
docker compose up -d --build
```

## 4. Kiem tra sau deploy

### App health

```bash
curl -fsS https://app.vitamind.com.vn/api/health
```

### Sync user thu cong

```bash
docker compose exec -T app node ./scripts/clerk-sync.mjs
```

Hoac tu host:

```bash
curl -X POST https://app.vitamind.com.vn/api/internal/clerk-sync \
  -H "x-internal-secret: <INTERNAL_API_SECRET>"
```

### Kiem tra user da mirror vao DB

```bash
docker compose exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "select email, role, status, clerk_user_id from users order by updated_at desc limit 20;"
```

## 5. Neu login Clerk xong nhung khong vao app

Kiem tra lan luot:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` dung project production
- `CLERK_SECRET_KEY` dung cung project do
- `NEXT_PUBLIC_APP_URL` dung domain public that
- `INTERNAL_API_BASE_URL` dung `https://app.vitamind.com.vn`
- redirect URLs trong Clerk da khai bao du
- webhook secret dung nhau giua Clerk va Synology

## 6. Neu user co tren Clerk nhung chua co trong Postgres

- chay `docker compose exec -T app node ./scripts/clerk-sync.mjs`
- hoac kiem tra webhook `POST /api/webhooks/clerk`
- kiem tra `INTERNAL_API_SECRET` neu dung sync endpoint noi bo
