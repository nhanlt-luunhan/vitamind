# Contributing

## Naming
- Components: `PascalCase` filenames and exports.
- Hooks: `useThing` naming.
- Utilities: `camelCase`.
- Types: `PascalCase`, keep shared types in `types.ts`.

## Architecture Rules
- `app/`: routes + layouts only.
- `components/`: UI only.
- `server/`: server logic (actions, queries) only.
- `lib/`: helpers, adapters.
- `content/`: blog data.
- `prisma/`: DB schema.

## Design Tokens
- Colors, gradients, radius, shadows, glow must come from `styles/tokens.css`.
- No hardcoded colors in components. If truly required, document it in the component comment.
- Spacing should use tokens or Tailwind spacing utilities.

## Motion Policy
- Primary motion lives in `components/layout/AnimatedBackground.tsx`.
- New motion must be subtle, purposeful, and based on existing tokens.

## Coding Rules
- Prefer server components; add `"use client"` only when required.
- No default exports for components.
- Use async/await.
- Before changing App Router/auth/cache behavior, read `docs/NEXTJS_RULES.md`.

## Data Language Rule
- New seeded data, demo data, sample content, admin-created defaults, and newly authored user-facing records must be written in Vietnamese by default.
- Only use non-Vietnamese content when the feature explicitly requires another language, and document that reason in the related PR or implementation note.

## Clerk Config Rule
- Repo nay cho phep commit `.env` cung voi API key/secret de local va Synology chay cung mot cau hinh.
- Khi thay doi domain production, phai cap nhat dong thoi `NEXT_PUBLIC_APP_URL`, `SITE_URL`, `INTERNAL_API_BASE_URL`, callback URL va cac bien Clerk lien quan trong `.env`.

## Upload Sync Rule
- Tất cả file mới phát sinh trong `public/uploads` ở local được xem là dữ liệu vận hành, không phải dữ liệu tạm.
- Khi deploy hoặc đồng bộ từ local lên Synology, phải sync `public/uploads` sang Synology nếu dữ liệu DB có tham chiếu tới các file đó.
- Không giả định `git pull` sẽ mang theo file upload; upload nội bộ phải đi qua script sync riêng của dự án.
- Khi avatar, media, ảnh bài viết hoặc ảnh sản phẩm dùng đường dẫn `/uploads/...`, phải ưu tiên đồng bộ file upload trước khi cập nhật DB trên Synology.

## Workflow
- Write a UI spec before implementation.
- Commit a snapshot before major changes.
- Generate or update components following these rules.
- Review and adjust.
- Commit again.
- Do not design outside the token system.
