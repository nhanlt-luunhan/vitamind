# Shared Postgres tren Synology: tach `vitamind` va `vitamind_dev`

Muc tieu:

- Synology production app van dung DB `vitamind`
- Mac/Windows chay `npm run dev` dung DB rieng `vitamind_dev`
- Ca hai may local cung dung chung mot endpoint DB de tranh lech cau hinh

## Topology khuyen nghi

- Domain app production: `https://app.vitamind.com.vn`
- Postgres production trong compose: DB `vitamind`
- Postgres dev trong cung instance: DB `vitamind_dev`
- Endpoint cho local dev: `192.168.1.143:35432`

Ly do chon Tailscale IP lam endpoint local chung:

- Mac va Windows dung cung mot `DATABASE_URL`
- khong phu thuoc may local dang o cung LAN hay khong
- khong can mo Postgres ra Internet

## Env tren Synology

Trong `.env` runtime cua Synology:

```dotenv
NEXT_PUBLIC_APP_URL=https://app.vitamind.com.vn
SITE_URL=https://app.vitamind.com.vn

POSTGRES_BIND_IP=192.168.1.143
POSTGRES_PORT=35432
POSTGRES_DB=vitamind
POSTGRES_USER=vitamind
POSTGRES_PASSWORD=change-me-prod-password
```

Ghi chu:

- `POSTGRES_BIND_IP` va `POSTGRES_PORT` chi anh huong ket noi tu ben ngoai vao NAS
- container `app` tren Synology van noi DB noi bo qua `db:5432` trong `compose.yml`
- khong doi `POSTGRES_DB` cua stack production sang `vitamind_dev`

## Tao DB dev rieng

Sau khi stack DB tren Synology da chay, thuc thi file mau:

```bash
docker compose exec -T db psql -U "$POSTGRES_USER" -d postgres -f docs/create-vitamind-dev.sql.example
```

Truoc khi chay:

- doi password placeholder trong `docs/create-vitamind-dev.sql.example`
- neu role `vitamind_dev` da ton tai, sua file SQL theo trang thai thuc te hoac bo cac lenh create da ton tai

## Env local Mac va Windows

Dung cung mot `DATABASE_URL` tren ca hai may:

```dotenv
DATABASE_URL=postgresql://vitamind_dev:change-me-vitamind-dev-password@192.168.1.143:35432/vitamind_dev
```

Khuyen nghi cho `.env` local:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3333
SITE_URL=http://localhost:3333
DATABASE_URL=postgresql://vitamind_dev:change-me-vitamind-dev-password@192.168.1.143:35432/vitamind_dev
INTERNAL_API_BASE_URL=http://localhost:3333
```

Khong can chay `npm run dev:services` neu local da dung DB tren NAS.

Lenh local:

```bash
npm run db:sync
npm run dev
```

## Quy tac van hanh

- `npm run db:sync` tren local chi duoc tro vao `vitamind_dev`
- production tren Synology van boot build/start voi DB `vitamind`
- khong dung `DATABASE_URL` local tro thang vao DB `vitamind`
- backup va restore can tach rieng cho `vitamind` va `vitamind_dev`

## Kiem tra nhanh

Tu Mac/Windows:

```bash
psql "postgresql://vitamind_dev:change-me-vitamind-dev-password@192.168.1.143:35432/vitamind_dev" -c "select current_database(), current_user;"
```

Ky vong:

- current_database = `vitamind_dev`
- current_user = `vitamind_dev`
