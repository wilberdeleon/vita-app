# Typography

**What is this?** Vita's type system. Code source of truth: `typography` in `src/theme/tokens.ts` (verified 2026-07-06).

**Why does it exist?** A disciplined scale is most of what "premium" means in text. Every text style comes from this scale — no ad-hoc font sizes.

---

## Current scale (implemented)

System font (San Francisco on iOS). Strengthened in Slice 0.12 ("stronger title typography"):

| Token | Size | Weight | Notes |
|---|---|---|---|
| `display` | 32 | 700 | letter-spacing +0.2 |
| `title` | 24 | 700 | letter-spacing −0.3 (tight, Apple-like) |
| `heading` | 17 | 600 | |
| `body` | 15 | 400 | `bodyMedium` at 500 |
| `caption` | 13 | 400 | `captionMedium` at 500 |
| `micro` | 11 | 500 | dock labels |

> The repo Design System doc lists an earlier snapshot (display 30 / title 22); **tokens.ts is current** — the doc lagged one polish pass. Flagged for repo cleanup.

## Target state

The full Design System will confirm whether Vita stays on the system font or adopts a brand typeface (`expo-font` is already installed and configured as a plugin — capability exists, no custom font shipped). Dark-theme contrast rules arrive with the theme decision ([[Design Bible]]).

## Rules

- Use scale tokens only; never hard-code a font size in a screen.
- Text colors come from the [[Color System]] text tokens.

## Open questions

- Custom brand typeface, or system font forever? *Needs founder decision during Design System authoring — system font is a legitimate premium choice (Apple's own).*

**Related:** [[Design Bible]] · [[Spacing & Layout]] · [[Component Library]]
