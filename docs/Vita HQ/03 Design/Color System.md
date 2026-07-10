# Color System

**What is this?** Every color in Vita, what owns it, and where it's defined. Code source of truth: `src/theme/tokens.ts` (verified 2026-07-06; theme architecture decision 2026-07-09).

**Why does it exist?** Color carries meaning in Vita — each domain owns a hue permanently. This page keeps that contract explicit.

---

## Theme architecture (founder decision, 2026-07-09)

VITA supports **Light Mode and Dark Mode**, both first-class — see [[Design Bible]] and [[Decision Log]]. Colors are defined as **semantic tokens** (e.g. `color.background`, `color.surface`, `color.textPrimary`, `color.textSecondary`, `color.hairline`) each carrying a light value and a dark value, rather than screens referencing raw hex codes directly. Domain colors (orange/blue/purple/green below) are tokens too, and may need distinct light/dark variants where contrast requires it — a Design System authoring detail, not a re-opened decision.

**This is a decision, not yet an implementation.** `src/theme/tokens.ts` today exports one flat light palette with hardcoded hex values (see "Currently implemented" below) — no semantic pairs, no dark values, no theme switcher. Building that is Design System / Sprint 1 work.

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

Protein `#E4572E` · Carbs `#F5A623` · Fat `#E5484D`

## Surfaces & text — currently implemented (light values only)

- Background `#F6F5F2` · Card `#FFFFFF` · Warm card `#5C3A21` ("Visual Progress" brown card) · Track `#EFEDE9` · Hairline `#ECEAE6`
- Text `#1B1B1B` · Secondary `#6E6B66` · Tertiary `#A3A099` · On-color `#FFFFFF`
- These become the **light values** of the semantic surface/text tokens once the token architecture is built. No dark equivalents exist in code yet.

## Target state

Both **Light Mode and Dark Mode**, built on semantic tokens (decided 2026-07-09, see above) — expressing the [[Design Bible]] direction of **graphite/glass with khaki/gray/tan accents** across both themes. Defining the actual dark values, and how the domain hierarchy and brand palette map onto both themes, is the Design System's job.

## Open questions

- Purple double-duty (Atlas + peptides) — revisit if either area grows.
- Tan/gold relationship: brand gold `#D4B27A` is close to the stated tan accents — same token or different? *Decide during Design System authoring.*
- Dark-theme values for every semantic token (surfaces, text, domain colors) — none defined yet. *Design System authoring, Sprint 1.*

**Related:** [[Design Bible]] · [[Brand Identity & Icons]] · [[Typography]] · [[Component Library]]
