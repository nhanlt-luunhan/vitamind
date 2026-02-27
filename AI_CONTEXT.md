# Project Overview
- Framework: Next.js 16.1.6 (App Router)
- Language: TypeScript
- UI: Tailwind + Shadcn
- State: Server Actions
- Auth: Clerk (session) + Postgres RBAC/profile

# Coding Rules
- Prefer server components
- No default export for components
- Use async/await

# Folder Roles
- app/: routes + layouts only
- components/: UI only
- server/: server logic (actions, queries)
- lib/: helpers, adapters
- content/: blog data
- prisma/: DB schema

# Blog Design Rules
- Keep typography consistent across blog list and detail pages.
- Use a compact meta bar at the top of category/detail pages: category chip + count, title on the next line.
- Images must not stretch: always preserve aspect ratio and center alignment on all breakpoints.
- Prefer clean, modern layout: clear hierarchy, generous spacing, subtle borders, minimal clutter.
- Category pages: show a featured post, then a grid for remaining posts.
- Summary box (Tóm tắt AI): static gradient border (no animation), rounded corners, bullet list with dots, no toggle icon.
- Cursor effect on blog routes: single outer ring following cursor with slight delay (no inner dot).
