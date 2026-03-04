# Shared Clerk, Separate DB

Muc tieu:

- dev va production dung cung mot tap user
- local khong ghi truc tiep vao DB production
- user co the duoc mirror xuong tung DB rieng ma van giu identity thong nhat

## Nguon su that

- Clerk la source of truth cho identity
- moi moi truong co Postgres rieng cho du lieu app
- bang `users` trong DB la snapshot/mirror tu Clerk

## Quy tac van hanh

1. Local/dev dung `DATABASE_URL` rieng.
2. Production dung `DATABASE_URL` rieng.
3. Ca hai moi truong co the dung cung `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` va `CLERK_SECRET_KEY`.
4. Webhook Clerk phai tro vao tung moi truong can sync.
5. Khi local can lay toan bo user hien co tu Clerk, goi:

```bash
curl -X POST http://127.0.0.1:3333/api/internal/clerk-sync \
  -H "x-internal-secret: <INTERNAL_API_SECRET>"
```

Endpoint:

- `POST /api/internal/clerk-sync`

## Nhung gi duoc dong bo

Tu Clerk xuong DB:

- `clerk_user_id`
- `email`
- `name`
- `display_name`
- `avatar_url`

## Nhung gi khong nen coi la du lieu chia se tu Clerk

- `role`
- `status`
- `gid`
- cac field profile nghiep vu chi co y nghia trong app

Neu can dong bo cac field nay, phai chot moi truong authoritative. Neu khong, local co the vo tinh de role/status khac production.

## Rui ro can biet

- Neu local dung chung Clerk, moi thay doi auth/profile ghi len Clerk tu local se anh huong production.
- Vi vay, chi nen dung chung Clerk khi ban can test cung tap user that.
- Neu can test destructive auth flow, dung Clerk test rieng.
