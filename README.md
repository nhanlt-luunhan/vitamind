# Vitamind

Blog và trang quản trị được xây dựng bằng Next.js (App Router) và PostgreSQL.

## Yêu cầu môi trường

- Node.js 20 LTS
- npm 9+
- Docker Desktop (không bắt buộc, dùng cho Postgres local)

Repo đã có `.nvmrc` để Windows và macOS dùng cùng một phiên bản Node.

## Chạy local (Windows/macOS)

1. Cài dependency:

```bash
npm install
```

2. Khởi động Postgres local (khuyến nghị):

```bash
docker compose up -d db
```

3. Nếu chạy app bằng `npm run dev`, tạo `.env.local` từ `.env.example` rồi điền các giá trị local:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_test_...`)
- `CLERK_SECRET_KEY` (`sk_test_...`)
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`
- `INTERNAL_API_BASE_URL=http://127.0.0.1:3333`

4. Chạy server local:

```bash
npm run dev
```

App sẽ chạy tại `http://localhost:3333`.

Clerk cho local phải dùng instance kiểm thử riêng, tách biệt với môi trường chạy thật.
Không dùng lại `pk_live` / `sk_live` trong `.env.local`.

Nếu chạy app bằng Docker ở môi trường development, tạo `.env.dev.docker` từ `.env.dev.docker.example`.
Không cho `docker-compose.dev.yml` dùng `.env.docker`, vì file đó dành cho production.
Nếu muốn dùng màn hình Adminer chỉ dành cho admin bên trong app, hãy cấu hình `ADMINER_INTERNAL_URL` đúng với môi trường đang chạy.

## Triển khai trên Synology Docker

1. Giữ các cấu hình production không nhạy cảm trong `.env.docker`.

2. Trên Synology, tạo `.env.docker.local` từ `.env.docker.local.example` rồi đặt các secret thật vào file đó:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_...`)
- `CLERK_SECRET_KEY` (`sk_live_...`)
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`

File `.env.docker.local` phải luôn tồn tại trên Synology, kể cả khi bạn tạm thời chưa điền biến nào.

3. Nếu Synology của bạn đang có `.env.docker` cũ chứa secret và file đó từng được track trong git, hãy chạy một lần quy trình chuyển đổi sau trước khi `git pull`:

```bash
cp .env.docker .env.docker.local
git checkout -- .env.docker
git pull origin main
```

4. Build và chạy:

```bash
docker compose up -d --build
```

Ở production, Postgres không mở ra Internet; chỉ container app mới truy cập được.

## Webhook Clerk

Cấu hình Clerk webhook trỏ vào:

- `POST /api/webhooks/clerk`

Các event cần bật:

- `user.created`
- `user.updated`
- `user.deleted`

## Ghi chú

- `.env.local` và `.env` được bỏ khỏi git.
- Nếu đổi phiên bản Node, hãy cập nhật `.nvmrc` và `package.json` phần `engines`.
- `references/lahomes/` giữ lại bộ file tham chiếu gọn từ Lahomes. Thư mục gốc `Lahomes-Nextjs_v2.0/` chỉ dùng local và không còn được đưa lên git.
