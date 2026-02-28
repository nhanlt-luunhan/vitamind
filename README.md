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
Nếu chạy sau reverse proxy hoặc trong Portainer/Synology, không dùng `INTERNAL_API_BASE_URL=http://127.0.0.1:3333` cho middleware admin.
Hãy để app tự dùng origin của request, hoặc đặt `INTERNAL_API_BASE_URL` thành domain/public origin thực tế của app.

## Triển khai trên Synology Docker

1. Giữ toàn bộ cấu hình production, bao gồm cả secret nếu bạn chấp nhận đồng bộ từ Mac sang Synology, trong `.env.docker`.

2. Trên Synology, chỉ cần `git pull` để nhận `.env.docker` mới rồi build và chạy:

```bash
git pull origin main
docker compose up -d --build
```

Ở production, Postgres không mở ra Internet; chỉ container app mới truy cập được.

### Quy tắc xử lý lỗi build trên Synology

- Nếu thấy warning:
  - `buildx: failed to read current commit information with git rev-parse --is-inside-work-tree`
  thì không kết luận ngay đây là lỗi chính. Đây thường chỉ là warning từ buildx.
- Luôn đọc tiếp phần lỗi thật ở bước:
  - `npm run build`
- Nếu build báo:
  - `@clerk/clerk-react: Missing publishableKey`
  thì kiểm tra ngay `.env.docker` trên Synology có đủ:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SIGNING_SECRET`
  - `INTERNAL_API_SECRET`
- Dockerfile của dự án đã chuẩn hóa theo quy tắc:
  - copy `.env.docker` sang `.env.production`
  - rồi mới chạy `next build`
- Không đổi tên `docker-compose.yml`, vì Synology đang đọc đúng file này.

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
