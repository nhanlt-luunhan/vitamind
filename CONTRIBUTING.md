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

## Workflow
- Write a UI spec before implementation.
- Commit a snapshot before major changes.
- Generate or update components following these rules.
- Review and adjust.
- Commit again.
- Do not design outside the token system.
