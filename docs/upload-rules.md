# Upload Rules

Tat ca upload cua du an di qua cung mot bo quy tac trong `lib/uploads/rules.ts`.

## Muc tieu

- Chuan hoa noi luu tru duoi `public/uploads`
- Tach scope theo loai tai nguyen
- Tu dong tao thu muc neu scope moi chua ton tai
- Giu mot helper chung de API moi khong can tu viet logic upload

## Rule mac dinh

- `avatars`: `public/uploads/avatars`, toi da 2MB, chi nhan anh, khong ghi vao bang `media`
- `media`: `public/uploads/media`, toi da 10MB, nhan anh va tai lieu pho bien, co ghi vao bang `media`
- `posts`: `public/uploads/posts`, toi da 10MB, chi nhan anh, co ghi vao bang `media`
- `products`: `public/uploads/products`, toi da 10MB, chi nhan anh, co ghi vao bang `media`
- `documents`: `public/uploads/documents`, toi da 25MB, nhan PDF/CSV/TXT/JSON/Office/ZIP, co ghi vao bang `media`

## Mo rong trong tuong lai

Neu mot API moi goi `saveProjectUpload({ scope: "ten-moi", file })` ma `ten-moi` chua co trong preset:

- He thong se tu chuan hoa scope thanh ten thu muc hop le
- Tu tao `public/uploads/ten-moi`
- Tu suy luan rule co ban theo MIME:
  - anh: gioi han 10MB
  - tai lieu pho bien: gioi han 25MB
  - mime chua duoc dinh nghia: cho phep dung exact MIME cua file do va luu vao scope moi

## Cach dung

```ts
import { saveProjectUpload } from "@/lib/uploads/rules";

const saved = await saveProjectUpload({
  scope: "posts",
  file,
  trackInMedia: true,
  meta: { owner: "admin" },
});
```

Gia tri tra ve gom:

- `url`: duong dan public de luu vao DB
- `absolutePath`: duong dan file tren may chu
- `rule`: rule da duoc ap dung
- `media`: ban ghi `media` neu scope co `trackInMedia`

## Luu y

- Khong luu file nguoi dung vao `public/assets/imgs`
- Chi dung `public/uploads/...`
- Avatar user nen dung scope `avatars`
- Anh blog dung scope `posts`
- Anh san pham dung scope `products`
- Tai lieu tong hop hoac file khac dung `media` hoac `documents`

## Quy tac dong bo Synology

- Moi file moi tao trong `public/uploads` o local phai duoc xem la du lieu can dong bo sang Synology neu DB production co tham chieu toi file do.
- `git pull` khong dong bo noi dung `public/uploads`, vi vay phai dung script sync upload rieng.
- Quy trinh uu tien:
  - sync file upload len Synology truoc
  - sau do moi cap nhat `avatar_url` hoac cac URL `/uploads/...` trong DB Synology
- Script tham chieu:
  - `scripts/sync-uploads-to-synology.sh`
  - `scripts/sync-avatar-to-synology.sh`
