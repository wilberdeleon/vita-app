# Brand Identity & Icons

**What is this?** Vita's brand identity — the mark, the brand palette, where they may appear, and the iconography system.

**Why does it exist?** The brand is founder-approved and locked. This page prevents accidental "improvements."

---

## The VITA mark (verified — Slice 0.11)

**A mountain range in a circle.** Locked by founder decision: **do not redesign or create variations.**

- Lives in code as a component: `src/components/shell/VitaMark.tsx`
- Appears on the Home header and the sign-in screen (scaled +27% in Slice 0.12)
- Drives the generated app icon, splash, and Android adaptive assets via `scripts/generate-brand-assets.mjs` — assets are **generated from code**, never hand-edited ([[Asset Inventory]])

## Brand palette (founder-approved brand sheet, July 2026)

Ink `#1C1F1A` · Sage `#7C846B` · Cream `#E6DFD2` · Paper `#F7F5F1` · Gold `#D4B27A`

**Scope rule:** the brand palette owns *branding surfaces* — icon, splash, logo, sign-in. Screen accents come from the domain hierarchy ([[Color System]]). Reconciling the two across the decided Light + Dark theme system (2026-07-09) is Design System work ([[Open Questions]] #2, partially resolved — the theme model is decided, the exact mapping isn't).

- Splash and Android adaptive backgrounds use ink `#1C1F1A` (verified in `app.json`).

## App identity (verified in `app.json`)

Name **VITA** · slug `vita-app` · URL scheme `vita://` · portrait orientation · `userInterfaceStyle: automatic`.

## Iconography

- **Ionicons** (via `@expo/vector-icons`) everywhere — outline for idle, filled for active states (see the dock pattern in [[Navigation & Floating Dock]]).
- Journey stage icons defined in `stages.ts` ([[Journey Stages]]).
- A custom icon set is a possible future refinement — **not planned**; would need founder approval.

## Brand personality

Professional, encouraging, intelligent, supportive — never loud, gimmicky, or overwhelming ([[Product Philosophy]]). Atlas's voice is the brand personality speaking ([[Atlas Personality]]).

**Related:** [[Design Bible]] · [[Color System]] · [[Asset Inventory]]
