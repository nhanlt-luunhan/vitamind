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
- Theo quy ước vận hành hiện tại của dự án, cấu hình và API key Clerk dùng cho môi trường production được phép commit và đẩy lên git nếu cần cho quy trình deploy.
- Không tự ý chuyển `.env.docker` hoặc các giá trị Clerk production về placeholder như `CHANGE_ME` nếu chưa có yêu cầu rõ ràng từ chủ dự án.
- Khi thay đổi domain production, phải cập nhật đồng thời `SITE_URL`, `INTERNAL_API_BASE_URL`, callback URL và các biến Clerk liên quan trong file cấu hình được commit.

## Workflow
- Write a UI spec before implementation.
- Commit a snapshot before major changes.
- Generate or update components following these rules.
- Review and adjust.
- Commit again.
- Do not design outside the token system.
