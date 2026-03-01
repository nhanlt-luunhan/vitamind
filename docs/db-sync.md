# DB Sync

Repo nay dang dung PostgreSQL truc tiep qua `pg` va bo schema SQL nam trong `docker/db-init`.

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

## Cach sync schema va du lieu nen dung

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

## Quy tac cap nhat schema

Khi thay doi schema:

1. Them file SQL moi vao `docker/db-init` theo thu tu tang dan, vi du `011_xxx.sql`
2. Giữ file cu de moi moi truong moi co the bootstrap day du
3. Chay `npm run db:sync` de ap dung tren DB da ton tai
4. Sau do moi kiem tra lai bang pgAdmin hoac `/admin/database`

## Reset toan bo DB local

Chi dung khi chap nhan mat du lieu local:

```bash
docker compose down -v
docker compose up -d db
```

Lenh tren tao volume moi, khi do Postgres se bootstrap lai tu `docker/db-init`.
