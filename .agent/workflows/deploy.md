---
description: Deploy Vitamind bang Docker compose thong nhat giua local Mac/Win va Synology.
---

# Quy trinh Deploy Vitamind: Local -> Git -> Synology Docker

## Tong quan luong
```
Local Docker (:3333)
  -> Test thu cong tren browser
  -> git commit + git push origin main
  -> Synology: git pull + docker compose --env-file .env.synology -f compose.yml up -d --build
```

## Buoc 1: Kiem tra local truoc khi push

1. Dam bao stack Docker local dang chay:
```powershell
docker compose --env-file .env.local -f compose.yml up --build
```

2. Kiem tra TypeScript:
```powershell
npm run typecheck
```

3. Kiem tra thu cong cac route bi anh huong tren browser tai `http://localhost:3333`.

## Buoc 2: Commit va push len Git

4. Stage va commit thay doi:
```powershell
git add .
git commit -m "feat: mo ta thay doi ngan gon"
```

5. Push len `main`:
```powershell
git push origin main
```

## Buoc 3: Deploy tren Synology

6. SSH vao Synology va chay:
```bash
git pull origin main
docker compose --env-file .env.synology -f compose.yml up -d --build
```

7. Kiem tra 3 buoc bat buoc:
```bash
docker compose --env-file .env.synology -f compose.yml config
docker compose --env-file .env.synology -f compose.yml build
docker compose --env-file .env.synology -f compose.yml logs --tail=200 app
```

## Loi thuong gap

| Loi | Nguyen nhan | Cach xu ly |
|---|---|---|
| `Missing publishableKey` | `.env.local` hoac `.env.synology` thieu `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Them key vao file env dang dung |
| `buildx: failed to read commit` | Warning tu buildx, khong phai loi that | Bo qua, doc loi o phan `npm run build` |
| `EADDRINUSE :3333` | Port dang bi chiem | Tat stack cu hoac doi bind port trong env |
| Build thanh cong nhung app loi runtime | Bien env thieu hoac sai | Kiem tra `docker compose logs --tail=200 app` |

## Luu y quan trong

- Chi dung `compose.yml` lam compose file chuan cho ca local va Synology.
- Synology dung `.env.synology`; local dung `.env.local`.
- Khong push `CLERK_SECRET_KEY` hay `INTERNAL_API_SECRET` len git.
- Healthcheck dung `node fetch(...)`, khong dung `wget`.
