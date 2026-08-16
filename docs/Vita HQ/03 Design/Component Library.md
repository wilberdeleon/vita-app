# Component Library

**What is this?** The inventory of Vita's reusable UI primitives and shell components — what exists, where it lives, and the rules that keep it clean.

**Why does it exist?** Screens are composed, not hand-built. Knowing what already exists prevents duplicate one-off components — the primitives are the design system made executable.

*Verified 2026-07-06 from `src/components/`.*

---

## The rules (from the repo architecture rules — non-negotiable)

1. `src/components/ui/` contains **zero business logic**. Primitives know nothing about features.
2. Structural components default to **neutral ink**; domain flows pass their domain color explicitly ([[Color System]]).
3. No new custom styling without approval — compose from primitives and tokens.

## UI primitives — `src/components/ui/` (18)

| Primitive | Job |
|---|---|
| `Screen` | Screen container; `dockClearance` and `scroll` props |
| `ScreenHeader` | Title row; optional settings gear |
| `SectionHeader` | Section titles with optional actions |
| `Card` | Card surface, radius 20, hairline border + soft shadow; theme-aware via `useCardSurfaceStyle()` |
| `PressableCard` | `Card` with press feedback — shares its surface style exactly |
| `GlassSurface` | Frosted-glass surface (real blur) for Home cards and the dock; theme-aware |
| `Section` | Groups a header + content into one rhythm unit |
| `DailyProgressCard` | Dashboard daily summary card |
| `ProgressBar` | Animated progress (650ms ease-out cubic) |
| `StatBar` | Labeled stat bar |
| `SegmentedTabs` | Segmented control; resolves its own neutral fill per theme |
| `Chip` | Small selectable pill |
| `ListRow` | Standard list row |
| `IconBadge` | Icon in a soft-tinted circle |
| `Button` | Primary action |
| `TextField` | Text input |
| `Stepper` | Increment/decrement control |
| `PressableScale` | Press feedback wrapper (spring scale 0.97–0.98) |

All exported through `src/components/ui/index.ts`.

## Shell components — `src/components/shell/`

- **`FloatingDock`** — the custom tab bar ([[Navigation & Floating Dock]])
- **`VitaMark`** — the brand mark in code ([[Brand Identity & Icons]])

## Feature components (not primitives — live with their features)

Dashboard: `HomeHeader`, `HomeSummaryCard`, `JourneyCard`, `JourneySection`, `MacrosCard`, `MacroRow`, `MealRow`, `MetricTile`, `QuickStatsRow` · Fuel: `FoodRow` · Journey: `LineChart`, `WeightBars`, `OverviewTab`, `WeightTab`, `PhotosTab` · Water: `CupsRow`. Charts are hand-drawn with `react-native-svg` — **no chart library** (deliberate).

## Target state

**Theme-aware as of 2026-08-16** — every primitive that renders a surface, text, or border resolves it through `useTheme().surfaces`, so all of them work in Light and Dark. Still to come in the authored Design System: formally documented states (default/pressed/disabled/loading). A component library package (e.g., adopting a third-party kit) was **deliberately not chosen** — per-slice decision if ever.

**Related:** [[Design Bible]] · [[Spacing & Layout]] · [[Motion & Animation]] · [[Architecture]]
