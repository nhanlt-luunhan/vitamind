---
name: vitamind-design-token
description: Use this skill when the user asks about colors, fonts, spacing, borders, shadows, theme, dark mode, light mode, or any UI styling in the Vitamind project. Also use when checking if a CSS token exists, or when creating or reviewing styles.
---

# Vitamind Design Token System

## Goal
Ensure all UI styling uses the Vitamind token system correctly — no hardcoded values, full theme compatibility.

## Token Sources (source of truth)

| File | Contains |
|---|---|
| `styles/tokens.css` | Foundation tokens: `--c-*`, `--g-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--glow-*` |
| `app/globals.css` | Semantic tokens per theme: `--page-bg`, `--surface-card`, etc. |
| `tailwind.config.ts` | Tailwind class mappings |

## Color Tokens

### Foundation (`--c-*`)
| Token | Meaning |
|---|---|
| `--c-0` | Dark ink / dark text background |
| `--c-1` | Dark panel background |
| `--c-2` | Brand blue |
| `--c-3` | Brand cyan |
| `--c-4` | Light muted text |
| `--c-6` | White |
| `--c-7` | Darker muted text |
| `--c-9` | Main dark background |
| `--c-40` | Main light background |

### Gradients
- `var(--g-brand)` – main brand gradient
- `var(--g-brand-soft)` – soft brand gradient
- `var(--g-ink)` – ink/dark gradient

### Semantic (use these in components)
- `var(--page-bg)` – page background
- `var(--page-text)` – primary text
- `var(--page-text-muted)` – muted/secondary text
- `var(--page-heading)` – heading text
- `var(--page-border)` – border
- `var(--surface-elevated)` – elevated surface
- `var(--surface-panel)` – panel background
- `var(--surface-card)` – card background
- `var(--surface-input)` – input background
- `var(--frame-border)` – frame/container border
- `var(--frame-shadow)` – frame/container shadow

## Spacing Tokens
`var(--space-1)` through `var(--space-8)`

## Radius Tokens
`var(--radius-1)` · `var(--radius-2)` · `var(--radius-3)` · `var(--radius-4)` · `var(--radius-pill)`

## Shadow & Glow
- Shadows: `var(--shadow-1)` · `var(--shadow-2)` · `var(--shadow-3)`
- Glows: `var(--glow-1)` · `var(--glow-2)` · `var(--glow-3)`

## Tailwind Mapped Classes (only these are valid)
```
bg-brand0   bg-brand1   bg-brand2   bg-brand3   bg-brand4
text-brand0 text-brand2 text-brand4
border-brand1/20   bg-brand2/10
bg-brand   (gradient)
```

## Theme Classes
- Light: `.theme-day`
- Dark: `.theme-night`
- Controlled at the layout level — components must not hardcode a theme.

## Font Tokens
- `var(--font-sans)` → "Be Vietnam Pro" — use for body, UI, inputs, buttons, nav
- `var(--font-display)` → "Noto Serif" — use for headings

## Rules
1. **Never hardcode** hex colors or pixel values that have a token equivalent.
2. **Always check** `styles/tokens.css` and `app/globals.css` before adding a new token.
3. To add a new token:
   - Add foundation token to `styles/tokens.css`
   - Add semantic token to `app/globals.css` (if theme-aware)
   - Map to `tailwind.config.ts` (if needed in Tailwind)
4. Layout shell uses `--site-shell-max` and `--site-shell-gutter` — respect these in all public sections.
