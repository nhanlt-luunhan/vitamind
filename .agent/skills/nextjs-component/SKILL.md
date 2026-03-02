---
name: nextjs-component
description: Use this skill when the user asks to create a new React/Next.js component, page, section, or UI element for the Vitamind project. Applies project-specific rules for Server Components, CSS tokens, fonts, icons, and theme compatibility.
---

# Next.js Component – Vitamind

## Goal
Create a new component or page that follows the Vitamind project's coding and design conventions.

## Instructions

### 1. Determine component type
- Default to **React Server Component** (no `"use client"`) unless the component needs:
  - Browser APIs (`window`, `document`, `localStorage`)
  - React state (`useState`, `useEffect`, `useRef`)
  - Event handlers
- If client-side is needed, add `"use client"` at the top.

### 2. File placement
- **UI/reusable components** → `components/<category>/ComponentName.tsx`
  - Categories: `layout/`, `ui/`, `blog/`, `admin/`, `auth/`, `elements/`, `sections/`, `widgets/`
- **Page files** → `app/<route>/page.tsx`
- **Layout files** → `app/<route>/layout.tsx`

### 3. Styling rules
- Use CSS variables from `styles/tokens.css` and semantic tokens from `app/globals.css`
- **Never** hardcode hex colors or pixel values that have a token equivalent
- Token reference:
  - Colors: `var(--c-0)` to `var(--c-40)`, gradients: `var(--g-brand)`, `var(--g-brand-soft)`
  - Semantic: `var(--page-bg)`, `var(--page-text)`, `var(--surface-card)`, `var(--frame-border)`, etc.
  - Spacing: `var(--space-1)` to `var(--space-8)`
  - Radius: `var(--radius-1)` to `var(--radius-pill)`
  - Shadow: `var(--shadow-1)` to `var(--shadow-3)`
- Tailwind is used minimally — only use classes already mapped in `tailwind.config.ts`:
  - `bg-brand0/10`, `text-brand2`, `border-brand1/20`, `bg-brand`

### 4. Font rules
- Body/UI text → `var(--font-sans)` ("Be Vietnam Pro")
- Headings → `var(--font-display)` ("Noto Serif")
- Do NOT override fonts in child components without a clear design reason.

### 5. Theme compatibility
- All components must work in both `.theme-day` and `.theme-night`
- Always use semantic tokens (e.g., `var(--page-text)`) rather than raw color tokens for text and backgrounds

### 6. Icons
- Use one of the installed icon libraries:
  - `uicons-regular-rounded` (class: `fi fi-rr-*`)
  - `boxicons` (class: `bx bx-*`)
  - `remixicon` (class: `ri-*`)
- Do NOT import standalone SVGs or add new icon libraries without a reason.

### 7. Layout shell
- Public sections must respect `--site-shell-max` and `--site-shell-gutter`
- Do NOT use Bootstrap-style `max-width` or `container` classes directly

## Pre-flight checklist
Before finalizing a component:
- [ ] Correct font token used?
- [ ] Only CSS tokens for colors (no hardcoded hex)?
- [ ] Works in both light (`.theme-day`) and dark (`.theme-night`)?
- [ ] Desktop/iPad shell width respected?
- [ ] Icon from approved library?
- [ ] No demo/placeholder data hardcoded in runtime?
