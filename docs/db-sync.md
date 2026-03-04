# DB Sync

Repo nay dung PostgreSQL truc tiep qua `pg` va bo schema SQL nam trong `docker/db-init`.

## Phan biet ro 3 viec

- `db:sync` chi sync schema/seed migration SQL.
- `db:sync` khong dong bo du lieu hai chieu giua local va production.
- Clerk co the la source of truth chung cho user, nhung Clerk sync khong dong nghia voi dung chung Postgres.

## Nguon schema hien tai

- `docker/db-init/001_blog.sql`
- `docker/db-init/002_users.sql`
- `docker/db-init/004_profile.sql`
- `docker/db-init/006_admin_schema.sql`
- `docker/db-init/007_user_gid.sql`
- `docker/db-init/008_contact_email.sql`
- `docker/db-init/009_clerk_auth_nullable_password.sql`
- `docker/db-init/010_clerk_deletion_queue.sql`

## Van de can tranh

Mount `docker/db-init` vao `docker-entrypoint-initdb.d` chi co tac dung khi Postgres khoi tao volume moi.

Neu volume `db_data` da ton tai, `docker compose up -d db` se khong tu dong chay lai cac file SQL ben tren.

## Cach sync schema nen dung

Chay:

```bash
npm run db:sync
```

Script se:

- Doc tat ca file `*.sql` trong `docker/db-init`
- Chay theo thu tu ten file
- Tu dong chon mode `url` neu co `DATABASE_URL`, neu khong thi dung `docker compose exec -T db`
- Dung ngay khi gap loi (`ON_ERROR_STOP=1`)
- Chay duoc qua `npm run ...` tren Windows/macOS vi script sync dung Node
- Khong tu dong chay trong production/Synology neu ban khong chu dong bat `AUTO_DB_SYNC=true`

## Cac mode ho tro

Mac dinh:

```bash
npm run db:sync
```

Ep chay qua container Postgres trong Docker Compose:

```bash
npm run db:sync:docker
```

Ep chay qua `psql` local va `DATABASE_URL`:

```bash
DATABASE_URL=postgresql://vitamind:vitamind@127.0.0.1:33542/vitamind npm run db:sync:url
```

## Topology khuyen nghi

### Cach 1: Clerk chung, DB rieng

Khuyen dung cho bai toan "dev va production cung dung cung tap user".

- Clerk la source of truth cho identity
- production co Postgres production rieng
- local/dev co Postgres local/dev rieng
- bang `users` trong moi DB la mirror tu Clerk

Can lam:

1. Dat `DATABASE_URL` local tro vao DB local/dev.
2. Dat cung `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` va `CLERK_SECRET_KEY` neu muon dev/prod dung chung tap user.
3. Bat webhook Clerk vao tung app host can sync.
4. Khi can backfill toan bo user vao DB local, goi:

```bash
curl -X POST http://app.vitamind.com.vn:3333/api/internal/clerk-sync \
  -H "x-internal-secret: <INTERNAL_API_SECRET>"
```

Luu y:

- local sua profile/auth tren Clerk thi co the anh huong production neu dung chung Clerk
- role/status/gid la du lieu app-specific, can quy dinh moi truong nao duoc phep sua
- khong tro local thang vao DB production

### Cach 2: Hai DB rieng, chi sync schema

Neu local va production moi noi co mot DB rieng:

- dung `npm run db:sync` de ap dung cung mot bo SQL migration
- du lieu user/order/profile khong tu dong chay qua lai

Muon dong bo du lieu hai chieu trong mo hinh nay, ban phai dung replication/logical sync ben ngoai repo.

### Cach 3: Mot DB dung chung

Khong khuyen dung cho local dev.

- local va production cung ghi vao cung mot Postgres
- de gay ban du lieu production
- khi mat ket noi mang, local dang nhap va user flow de hong
- khi schema local dang lech, auth va profile flow de vo

## Quy tac cap nhat schema

Khi thay doi schema:

1. Them file SQL moi vao `docker/db-init` theo thu tu tang dan, vi du `011_xxx.sql`
2. Giu file cu de moi moi truong moi co the bootstrap day du
3. Chay `npm run db:sync` de ap dung tren DB da ton tai
4. Sau do moi kiem tra lai bang pgAdmin hoac `/admin/database`

## Reset toan bo DB local

Chi dung khi chap nhan mat du lieu local:

```bash
docker compose down -v
docker compose up -d db
```

Lenh tren tao volume moi, khi do Postgres se bootstrap lai tu `docker/db-init`.
