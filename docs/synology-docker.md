# Synology Docker

Repo nay co the chay on tren Docker Synology, nhung khong nen goi la "100% tu dong an toan" neu chua dat dung env, volume va quy trinh update.

## Muc tuong thich thuc te

- `next build` dung `output: "standalone"`, phu hop cho container production.
- Base image `node:20-alpine` va `postgres:16-alpine` deu co multi-arch, nen chay duoc tren x86_64 va arm64 Synology neu NAS dang dung Docker engine tuong thich.
- Middleware hien tai co fallback `INTERNAL_API_BASE_URL` theo request origin, nen hop voi reverse proxy tren Synology.
- `docker compose config` parse duoc stack hien tai.

## Dieu kien de chay on

1. Dien dung Clerk keys va `INTERNAL_API_SECRET`.
2. Khong tro `DATABASE_URL` local/dev vao DB production.
3. Khong xoa volume Postgres khi deploy lai.
4. Chay DB sync co chu dich moi khi them file SQL moi trong `docker/db-init`.

Production tren Synology nen de `AUTO_DB_SYNC=false` theo mac dinh. Khong nen de app tu sync schema moi lan khoi dong.

## Bao toan du lieu DB

DB duoc giu lai neu:

- van dung cung volume `db_data`
- volume duoc gan ten co dinh `vitamind_db_data` tren file `docker-compose.synology.yml`
- chi `docker compose up -d --build` hoac recreate container
- khong chay `docker compose down -v`
- khong xoa volume trong Portainer / Synology Container Manager

DB se mat neu:

- xoa volume `db_data`
- doi ten stack hoac project name ma khong map lai volume cu
- restore stack bang mot volume khac rong

## Khuyen nghi cho Synology

- Dung reverse proxy cua Synology/Nginx va expose app qua HTTPS.
- Chi bind Postgres vao `127.0.0.1` hoac bo han port public neu khong can truy cap tu ngoai host.
- Backup volume Postgres dinh ky, hoac dung `pg_dump` ra shared folder.
- Neu can giu `public/uploads` va `content` ben ngoai stack folder, map sang shared folder cua NAS.

## Quy trinh update an toan

1. Pull code moi.
2. Kiem tra `.env.docker` tren NAS.
3. Chay `sh ./scripts/deploy-synology-safe.sh`
4. Neu co file SQL moi, chay `RUN_DB_SYNC=true sh ./scripts/deploy-synology-safe.sh`
5. Kiem tra `GET /api/health`.

## Cac gioi han con lai

- `mem_limit` co the bi Docker/Compose tren mot so ban Synology bo qua mot phan. Can theo doi RAM thuc te.
- Bind mount can dung permission tren shared folder, neu khong app co the doc duoc nhung khong ghi duoc uploads.
- `docker-entrypoint-initdb.d` chi chay khi volume DB moi duoc tao, khong phai co che migration cho DB da ton tai.
