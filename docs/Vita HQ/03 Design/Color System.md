# Color System

**What is this?** Every color in Vita, what owns it, and where it's defined. Code source of truth: `src/theme/tokens.ts` (values verified 2026-08-16; theme architecture decision 2026-07-09, implemented app-wide 2026-08-16).

**Why does it exist?** Color carries meaning in Vita — each domain owns a hue permanently. This page keeps that contract explicit.

---

## Theme architecture (founder decision, 2026-07-09)

VITA supports **Light Mode and Dark Mode**, both first-class — see [[Design Bible]] and [[Decision Log]]. Colors are defined as **semantic tokens** (e.g. `color.background`, `color.surface`, `color.textPrimary`, `color.textSecondary`, `color.hairline`) each carrying a light value and a dark value, rather than screens referencing raw hex codes directly. Domain colors (orange/blue/purple/green below) are tokens too, and may need distinct light/dark variants where contrast requires it — a Design System authoring detail, not a re-opened decision.

**✅ Implemented and app-wide** (Sprint 1 built it for Home; the visual consistency pass, 2026-08-16, extended it to every screen). Light, Dark, and System all work across the whole app; System follows the device appearance live. The split to respect:

- **`useTheme().surfaces`** — `background`, `card`, `border`, `text`, `textSecondary`, `textTertiary`, `track`. Every background, text, and border color.
- **`palette`** — theme-invariant only: brand, domain, macro, semantic colors. Orange is orange in both themes.

Reading a surface value off `palette` pins the component to light mode permanently — that was exactly the drift this pass removed. Full rules and the documented exceptions live in the repo's `docs/05-Design-System.md`; this page is not a second copy of them.

## Permanent domain color hierarchy

**Founder decision, Sprint 0.1 — "part of the permanent design language moving forward."** These survive any retheme:

| Color | Hex | Soft variant | Owns |
|---|---|---|---|
| Orange | `#F2670F` | `#FDEBDD` | **Nutrition / [[Fuel]]** |
| Blue | `#2F80ED` | `#E3EEFD` | **[[Water]]** |
| Purple | `#7C3AED` | `#EFE7FD` | **[[Atlas]]** (and [[Peptides]], per the approved UI reference) |
| Green | `#2E9E5B` | `#E4F4EA` | **[[My Journey|Journey]] progression** (also semantic success) |
| Neutrals | — | — | Navigation, structure, general UI |

Structural components (SegmentedTabs, Chip, section actions, the Home dock item) default to neutral ink; domain flows pass their domain color explicitly.

## Brand palette (branding surfaces only)

Founder-approved brand sheet, July 2026. Owns icon, splash, logo, sign-in — **not** general screens:

| Name | Hex |
|---|---|
| Ink | `#1C1F1A` |
| Sage | `#7C846B` |
| Cream | `#E6DFD2` |
| Paper | `#F7F5F1` |
| Gold | `#D4B27A` |

## Macro colors (Fuel)

Protein `#2E9E5B` (corrected to green 2026-07-18 to match the approved reference — reuses the Journey green rather than inventing a hex) · Carbs `#F5A623` · Fat `#E5484D`

## Surfaces & text — both themes implemented

| Token | Light | Dark |
|---|---|---|
| `background` | `#F8F6F2` | `#000000` |
| `card` | `#FFFFFF` | `#1A1B1D` |
| `border` | `rgba(28,31,26,0.08)` | `rgba(255,255,255,0.08)` |
| `text` | `#1B1B1B` | `#FFFFFF` |
| `textSecondary` | `#6E6B66` | `rgba(255,255,255,0.65)` |
| `textTertiary` | `#A3A099` | `rgba(255,255,255,0.45)` |
| `track` | `#EFEDE9` | `rgba(255,255,255,0.12)` |

Theme-invariant surfaces: warm card `#5C3A21` (the "Visual Progress" brown card) and on-color `#FFFFFF`.

**Three approved implementation decisions** (founder-approved on device, 2026-08-16) — cards carry a hairline border in both themes; domain "soft" fills use low-opacity tints of their domain color rather than the fixed pastels; and `ProgressBar`'s pale track is deliberately theme-invariant because it is the approved Home treatment. Rationale for each is in `docs/05-Design-System.md` — do not reverse them casually.

## Target state

Both **Light Mode and Dark Mode**, built on semantic tokens (decided 2026-07-09, see above) — expressing the [[Design Bible]] direction of **graphite/glass with khaki/gray/tan accents** across both themes. Defining the actual dark values, and how the domain hierarchy and brand palette map onto both themes, is the Design System's job.

## Open questions

- Purple double-duty (Atlas + peptides) — revisit if either area grows.
- Tan/gold relationship: brand gold `#D4B27A` is close to the stated tan accents — same token or different? *Decide during Design System authoring.*
- Dark-theme values for every semantic token (surfaces, text, domain colors) — none defined yet. *Design System authoring, Sprint 1.*

**Related:** [[Design Bible]] · [[Brand Identity & Icons]] · [[Typography]] · [[Component Library]]
