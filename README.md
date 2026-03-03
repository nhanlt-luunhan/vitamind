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

Nếu muốn giao diện quản trị PostgreSQL bằng `pgAdmin 4`:

```bash
docker compose --profile tools up -d pgadmin
```

`pgAdmin` sẽ chạy tại `http://127.0.0.1:35050`.
Thông tin đăng nhập mặc định:

- Email: `admin@vitamind.com.vn`
- Password: `change-me-pgadmin`

Server `vitamind` sẽ được nạp sẵn khi container khởi động. Nếu cần tự kiểm tra thủ công, dùng:

- Host: `db` nếu app chạy trong Docker, hoặc `127.0.0.1` nếu bạn dùng Postgres local map port ra máy
- Port: `5432` trong mạng Docker, hoặc `33542` trên máy host
- Username: `vitamind`
- Password: `vitamind`
- Database: `vitamind`

3. Nếu chạy app bằng `npm run dev`, tạo `.env.local` từ `.env.example` rồi điền các giá trị local:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_test_...`)
- `CLERK_SECRET_KEY` (`sk_test_...`)
- `CLERK_WEBHOOK_SIGNING_SECRET`
- `INTERNAL_API_SECRET`
- `INTERNAL_API_BASE_URL=http://127.0.0.1:3333`
- nếu muốn mở giao diện DB từ máy khác qua IP, đặt:
  - `PGADMIN_BIND_IP=0.0.0.0`

4. Chạy server local:

```bash
npm run dev
```

App sẽ chạy tại `http://localhost:3333`.

Clerk cho local phải dùng instance kiểm thử riêng, tách biệt với môi trường chạy thật.
Không dùng lại `pk_live` / `sk_live` trong `.env.local`.

Nếu chạy app bằng Docker ở môi trường development, tạo `.env.dev.docker` từ `.env.dev.docker.example`.
Không cho `docker-compose.dev.yml` dùng `.env.docker`, vì file đó dành cho production.
Nếu muốn đổi tài khoản `pgAdmin`, sửa `PGADMIN_DEFAULT_EMAIL` và `PGADMIN_DEFAULT_PASSWORD`.
Nếu chạy sau reverse proxy hoặc trong Portainer/Synology, không dùng `INTERNAL_API_BASE_URL=http://127.0.0.1:3333` cho middleware admin.
Hãy để app tự dùng origin của request, hoặc đặt `INTERNAL_API_BASE_URL` thành domain/public origin thực tế của app.

## Triển khai trên Synology Docker

1. Giữ toàn bộ cấu hình production trong `.env.docker` và dùng file stack riêng cho Synology là `docker-compose.synology.yml`.

2. Trên Synology, cập nhật code rồi chạy deploy an toàn:

```bash
git pull origin main
sh ./scripts/deploy-synology-safe.sh
```

Nếu muốn đồng bộ trạng thái Synology sát với local nhất có thể sau khi pull code, dùng:

```bash
git pull origin main
sh ./scripts/synology-full-sync.sh
```

Script trên sẽ:

- backup PostgreSQL hiện tại vào thư mục `backups/` nếu container DB đang chạy
- build lại stack bằng `docker-compose.synology.yml`
- không tự chạy DB sync trừ khi bạn chủ động bật `RUN_DB_SYNC=true`

Script `synology-full-sync.sh` sẽ:

- deploy lại stack
- chạy DB sync có chủ đích
- ép sync toàn bộ user từ Clerk về Postgres
- in ra danh sách user hiện có trong DB để đối chiếu với local

Ở production, Postgres không mở ra Internet; chỉ container app mới truy cập được.
`pgAdmin` được map ra `127.0.0.1:35050`, nên nếu cần truy cập từ máy khác phải tự cấu hình reverse proxy hoặc đổi publish rule.
Repo hiện hỗ trợ đổi trực tiếp bind IP qua env:

- `PGADMIN_BIND_IP=0.0.0.0` để truy cập `http://<server-ip>:35050`
- nếu muốn đổi cổng, dùng thêm `PGADMIN_PORT`

Trên Synology, `pgAdmin` giờ chạy mặc định cùng stack `app + db`, nên chỉ cần:

```bash
sh ./scripts/deploy-synology-safe.sh
```

Nếu vừa thêm file SQL mới trong `docker/db-init`, chạy sync có chủ đích:

```bash
RUN_DB_SYNC=true sh ./scripts/deploy-synology-safe.sh
```

Hoặc:

```bash
docker compose -f docker-compose.synology.yml exec -T app sh -lc 'node /app/scripts/sync-db.mjs --mode url'
```

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
- Production hiện không auto sync DB khi container khởi động. Đây là chủ đích để giảm rủi ro trên Synology.
- Không đổi tên `docker-compose.yml`, vì Synology đang đọc đúng file này.

## Webhook Clerk

Cấu hình Clerk webhook trỏ vào:

- `POST /api/webhooks/clerk`

Các event cần bật:

- `user.created`
- `user.updated`
- `user.deleted`

Nếu cần đồng bộ toàn bộ user Clerk về Postgres sau khi deploy hoặc sau khi thiếu webhook cũ, gọi endpoint nội bộ:

```bash
curl -X POST https://vitamind.com.vn/api/internal/clerk-sync \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Nếu chỉ muốn sync một user Clerk cụ thể:

```bash
curl -X POST https://vitamind.com.vn/api/internal/clerk-sync \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"clerkUserId":"user_xxx"}'
```

## Ghi chú

- `.env.local` và `.env` được bỏ khỏi git.
- Nếu đổi phiên bản Node, hãy cập nhật `.nvmrc` và `package.json` phần `engines`.
- `references/lahomes/` giữ lại bộ file tham chiếu gọn từ Lahomes. Thư mục gốc `Lahomes-Nextjs_v2.0/` chỉ dùng local và không còn được đưa lên git.
