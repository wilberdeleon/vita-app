# Navigation & Floating Dock

**What is this?** How users move through Vita — the floating dock, the route structure, and the navigation rules.

**Why does it exist?** The dock is Vita's signature navigation element (founder direction: "floating, Instagram-inspired"). Its behavior and contents are product decisions, not implementation details.

---

## The floating dock (verified: `src/components/shell/FloatingDock.tsx`)

A white pill-shaped bar floating above content (radius `pill`, dock shadow, safe-area aware), refined in Slice 0.12 to be "shorter, higher, with more margin."

**Current items (4):**

| Tab | Label | Icon (idle → active) | Active tint |
|---|---|---|---|
| `dashboard` | Home | home-outline → home | Neutral ink (navigation is structural) |
| `fuel` | Fuel | flame-outline → flame | Orange |
| `journey` | Journey | trending-up-outline → trending-up | Green |
| `atlas` | Atlas | planet-outline → planet | Purple |

Inactive items are tertiary gray; active items tint per the [[Color System|domain hierarchy]]. Tab transitions fade ([[Motion & Animation]]). Accessibility: proper `tab` roles and selected states.

## Route structure (verified: `src/app/`)

```
index.tsx            → auth gate (session? app : sign-in)
(auth)/sign-in       → sign-in screen
(vita)/(tabs)/       → dock tabs: dashboard, fuel, journey, atlas
(vita)/fuel/…        → Food Log flow (8 stack screens)
(vita)/water/…       → Water flow (stack)
(vita)/peptides/…    → Peptide flow (stack)
(vita)/settings/     → Settings (stack, opened from header gear)
```

Stack screens float above the tabs with no dock; scrollable tab screens reserve `DOCK_CLEARANCE` (120) so content never hides behind the dock ([[Spacing & Layout]]).

## Settings placement (founder decision, 2026-07-09 — resolves Open Questions #3)

**Settings remains permanently in the top-right corner (header icon) and is not part of the floating dock.** The dock stays a **fixed 4 items**: Home, Fuel, Journey, Atlas. This clarifies rather than contradicts the 2026-07-06 "five-item primary navigation" decision — Settings is still primary navigation, it's just surfaced through a persistent corner affordance instead of a dock tab. This is now locked, not an open question — see [[Decision Log]].

## Target state

- Primary navigation is **Dashboard, Fuel, My Journey, Atlas** (dock) **+ Settings** (top-right corner, always present, every screen) — five items total, permanently split across two navigation surfaces by design, not as an interim gap.
- **Lab must not exist** as a primary section (it doesn't).
- Dock evolves with the glass direction and the dual-theme system — a floating glass surface, theme-aware, is a natural fit ([[Design Bible]]).

## Open questions

- Atlas's `planet` icon vs. the space-aesthetic removal ([[Open Questions]] #8)

**Related:** [[Product Overview]] · [[Design Bible]] · [[Component Library]]
