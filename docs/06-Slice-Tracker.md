# VITA — Slice Tracker

Single source of truth for current development progress.

Every slice moves through the ten-step lifecycle defined in the Build Handbook:
objective → scope → build → self-review → audit → fix → founder review → approval → docs → merge/deploy.

---

## Sprint 0 — Visual Foundation — ✅ Complete

Scope amended by founders (July 2026): build the real application layouts from
the approved VITA UI reference with realistic placeholder data — not empty
placeholders. Auth + Supabase stay as architecture only; business logic and
live data connect in later sprints.

**Corrected 2026-07-09:** this table previously showed 0.2–0.12 as still "Founder review" while the "Completed Slices" section below claimed 0.2–0.10 were approved and the Changelog described 0.11–0.12 as already shipped — three inconsistent sources. Resolved per the founders' Sprint 0 completion decision (Vita HQ Roadmap, 2026-07-09): all of Sprint 0 is approved.

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 0.1 | Repository scaffolding | Approved architecture created in `wilberdeleon/vita-app` | ✅ Approved |
| 0.2 | Theme + UI primitives | Tokens from UI reference; core component kit | ✅ Approved |
| 0.3 | Shell + navigation | Floating dock, route groups, auth gate, Supabase client architecture | ✅ Approved |
| 0.4 | Dashboard (Home) | Greeting, summary, quick stats, journey, meals | ✅ Approved |
| 0.5 | Fuel + Food Log flow | Hub + 8 flow screens incl. static barcode mock | ✅ Approved |
| 0.6 | Water flow | Log summary + add (cups/ounces) | ✅ Approved |
| 0.7 | Peptide flow | Log summary + add + examples | ✅ Approved |
| 0.8 | My Journey | Overview / Weight / Photos tabs, charts, 8-stage system | ✅ Approved |
| 0.9 | Atlas + Settings | Purple WIP experience; settings shell | ✅ Approved |
| 0.10 | Verification + docs | Simulator verification, documentation updates | ✅ Approved |
| 0.11 | Official branding + greeting | Brand palette, VITA mark on Home/sign-in, app icon + splash, time-of-day greeting | ✅ Approved |
| 0.12 | Sprint 0.1 global polish | Domain color hierarchy, dock refinement, logo scale, shadows/type, subtle motion | ✅ Approved |

Status legend: ⬜ Planned · 🟡 In Progress / In Review · ✅ Complete

---

## Completed Slices

- 0.1–0.12 — Sprint 0 Foundation, full application shell (approved July 2026)

---

## Sprint 1 — Dashboard (in progress)

Two prerequisite decisions are resolved (founders, 2026-07-09): VITA supports Light + Dark via semantic design tokens, and Settings stays permanently in the top-right corner, never the dock.

**Restructured 2026-07-09 (founders):** Slice 1 (Dashboard Layout) was scoped as page structure only — hierarchy, spacing, scroll — not component styling. Founders split the original "Dashboard Layout" slice's card-positioning work out into its own dedicated slice, **Dashboard Components**, inserted as Slice 2: reusable card/container primitives (shadows, radius, press feedback) built once, before any section's actual content. Remaining slices renumbered accordingly (9 slices total, was 8).

**Health Metrics content locked (founders, 2026-07-09):** Steps, Water, Meals Logged, Sleep. **Peptides is explicitly excluded** from the primary Dashboard metrics — the current mock data (`features/dashboard/mock.ts`) still shows Peptides in that slot and needs updating when the Health Metrics slice is built.

**Slice 1.3 design revision (founders, 2026-07-10):** after initial build, founders replaced the generic Ionicons sun/moon badge with a bespoke **`TimeOfDayIllustration`** component — a circular-cropped landscape mark (layered mountains, small reflective lake) with one fixed composition, recolored across four states (morning/afternoon/evening/night) and ready for both light/dark color schemes. Existing greeting time-detection logic, minute re-evaluation, greeting copy, and card layout/dimensions were explicitly preserved — only the icon badge was replaced. New files: `src/components/ui/TimeOfDayIllustration.tsx`. Additive-only change to `src/features/dashboard/greeting.ts` (new `illustration` field; the three original fields' computation is untouched). **Not yet founder-tested in Expo Go — do not treat as fully approved until visually confirmed.** Artwork corrected 2026-07-10 against the founders' actual concept reference (sun nestled into a soft rolling ridge, moon floating free with a few stars, foreground pine silhouettes, gradient sky/lake) — the first pass was built from the written brief alone before the reference image was received. Same file only (`TimeOfDayIllustration.tsx`); geometry still identical across all four states, still no dark-mode-specific composition.

**Slice 1.3 final artwork swap (founders, 2026-07-11):** the procedural SVG (both the written-brief version and the corrected-against-reference version) was rejected as "a crude placeholder" not matching the approved illustration's premium quality. Replaced with the four founder-approved PNG assets directly — `TimeOfDayIllustration` now renders a static `Image` per period instead of drawing anything. New assets: `assets/illustrations/time-of-day/time-of-day-{morning,afternoon,evening,night}.png` (1254×1254, verified valid PNGs). `TimeOfDayIllustration.tsx` rewritten: all SVG/palette/gradient/star code removed, `period`-based API unchanged, 56px circular crop unchanged (still via wrapping `View` + `overflow: hidden`, since the source PNGs are opaque squares, not pre-cropped). **The `scheme` prop was dropped** — only one approved asset per period exists (no separate dark-mode artwork), so a non-functional prop would have been misleading; re-add it if/when dark-specific assets are ever approved. `greeting.ts`, `GreetingCard.tsx`, `dashboard.tsx` untouched — no consumer passed `scheme`, so this is not a breaking change to any call site. **Still not founder-tested in Expo Go.**

| # | Slice | Objective | Status |
|---|-------|-----------|--------|
| 1.1 | Dashboard Layout | Overall layout, content hierarchy, section spacing, responsive behavior, scroll | ✅ Approved |
| 1.2 | Dashboard Components | Reusable card/container primitives — shadows, radius, press feedback — for all sections to build on | ✅ Approved |
| 1.3 | Greeting Card | Dynamic greeting, motivational message, time-of-day behavior, polish | 🟡 Founder review (Expo Go visual test pending) |
| 1.4 | Today's Summary | Calories, macro progress (protein/carbs/fat), progress calculations | ⬜ Planned |
| 1.5 | Health Metrics | Steps, Water, Meals Logged, Sleep (not Peptides), reusable metric cards | ⬜ Planned |
| 1.6 | Journey Preview | Current Journey card, progress bar, current week, CTA into Journey | ⬜ Planned |
| 1.7 | Meals Preview | Meal cards, icons, calories, empty states, tap interactions | ⬜ Planned |
| 1.8 | Floating Navigation | Existing 4-tab dock only (Home/Fuel/Journey/Atlas) — active states, blur/material, animations, polish. Settings excluded per placement decision. | ⬜ Planned |
| 1.9 | Dashboard Polish | Loading states, animations, micro-interactions, accessibility, performance, Light + Dark verification | ⬜ Planned |
