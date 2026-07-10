# Spacing & Layout

**What is this?** Vita's spacing scale, radii, shadows, and layout constants. Code source of truth: `src/theme/tokens.ts` (verified 2026-07-06).

**Why does it exist?** "Premium spacing" is a founder requirement — generous, consistent breathing room is a design feature, not leftover pixels.

---

## Spacing scale (4-based)

| Token | Value |
|---|---|
| `xs` | 4 |
| `s` | 8 |
| `m` | 12 |
| `l` | 16 |
| `xl` | 20 |
| `xxl` | 24 |
| `xxxl` | 32 |

## Radii

Card `20` · Control `16` · Chip `12` · Pill `999` (dock, pills)

## Shadows (softened in Slice 0.12 — "Apple-style diffuse")

- **Card:** opacity 0.045, radius 16, offset (0, 6), elevation 2
- **Dock:** opacity 0.10, radius 26, offset (0, 10), elevation 8

Lower opacity + larger blur = soft, expensive-feeling depth. Never add a harsh shadow.

## Layout constants

- **`DOCK_CLEARANCE = 120`** — height reserved at the bottom of every scrollable screen so content clears the floating dock. Any new scrollable screen must respect it (the `Screen` primitive handles this via its `dockClearance` prop).
- Screens compose from the `Screen` / `ScreenHeader` primitives — [[Component Library]].

## Target state

Glass surfaces ([[Design Bible]]) will add blur/translucency tokens alongside shadows; spacing scale is expected to survive the retheme unchanged.

**Related:** [[Component Library]] · [[Navigation & Floating Dock]] · [[Design Bible]]
