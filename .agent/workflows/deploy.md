---
description: Deploy Vitamind – chạy local test rồi push git để Synology tự build Docker
---

# Quy trình Deploy Vitamind: Local → Git → Synology Docker

## Tổng quan luồng
```
Local dev (npm run dev :3333)
  → Test thủ công trên browser
  → git commit + git push origin main
  → Synology: git pull + docker compose up --build
```

---

## Bước 1: Kiểm tra local trước khi push

// turbo
1. Đảm bảo dev server đang chạy:
```powershell
npm run dev
```
Server phải sẵn sàng tại http://localhost:3333

2. Kiểm tra TypeScript (không có lỗi type):
```powershell
npm run typecheck
```
**Không push nếu còn lỗi TypeScript.**

3. Kiểm tra thủ công các route bị ảnh hưởng bởi thay đổi trên browser tại http://localhost:3333

---

## Bước 2: Commit và push lên Git

// turbo
4. Stage và commit thay đổi:
```powershell
git add .
git commit -m "feat: mô tả thay đổi ngắn gọn"
```

Quy ước commit message:
- `feat:` – tính năng mới
- `fix:` – sửa bug
- `style:` – thay đổi UI/CSS không ảnh hưởng logic
- `refactor:` – cải thiện code không thêm tính năng
- `chore:` – cập nhật config, deps, script

// turbo
5. Push lên main:
```powershell
git push origin main
```

---

## Bước 3: Deploy trên Synology

6. SSH vào Synology và vào thư mục dự án, sau đó chạy:
```bash
git pull origin main
docker compose up -d --build
```

7. Kiểm tra 3 bước bắt buộc:
```bash
# Bước 7a: Validate config
docker compose config

# Bước 7b: Xem output build
docker compose build

# Bước 7c: Xem log app (sau khi container khởi động)
docker compose logs --tail=200 app
```

---

## Checklist trước khi coi là xong

- [ ] `npm run typecheck` không có lỗi
- [ ] Test trên browser local pass
- [ ] Commit message đúng quy ước
- [ ] `docker compose logs` không có lỗi runtime
- [ ] App tại `https://vitamind.com.vn` (hoặc domain production) hoạt động đúng

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `Missing publishableKey` | `.env.docker` thiếu `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Thêm key vào `.env.docker` trên Synology |
| `buildx: failed to read commit` | Warning từ buildx, không phải lỗi thật | Bỏ qua, đọc lỗi ở phần `npm run build` |
| `EADDRINUSE :3333` | Port đang bị chiếm | `Get-Process -Name node \| Stop-Process -Force` |
| Build thành công nhưng app lỗi runtime | Biến env thiếu hoặc sai | Kiểm tra `docker compose logs --tail=200 app` |

---

## Lưu ý quan trọng

- **KHÔNG** đổi tên `docker-compose.yml` — Synology đọc đúng tên này
- **KHÔNG** dùng `.env.local` hay `.env.docker.local` ở production — chỉ `.env.docker`
- **KHÔNG** push `CLERK_SECRET_KEY` hay `INTERNAL_API_SECRET` lên git — giữ trong `.env.docker` trên Synology
- `.env.docker` được copy thành `.env.production` bên trong Dockerfile trước khi `next build`
- Healthcheck dùng `node fetch(...)`, không dùng `wget`
