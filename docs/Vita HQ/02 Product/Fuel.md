# Fuel

**What is this?** Vita's nutrition experience (canonical module name: `fuel`). Fuel is how users log what they eat — but framed as fueling a transformation, not counting calories.

**Why does it exist?** Nutrition is the highest-frequency health decision people make. Fuel's job is to make logging so frictionless that consistency becomes possible ([[Product Philosophy]]: reduce friction, reinforce consistency).

---

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.5: the Fuel hub tab plus a complete eight-screen Food Log flow under `src/app/(vita)/fuel/`:

- **Hub** (`fuel.tsx` tab) — daily nutrition overview
- **Flow screens:** `log`, `add`, `search`, `scan` (barcode — **static visual mock**, no camera yet), `manual`, `recent`, `favorites`, `food/[id]` (food detail)
- Feature module `src/features/fuel/` with `FoodRow` component, types, and mock fixtures behind the `api.ts` boundary
- Domain color: **orange `#F2670F`** ([[Color System]]); dock icon: flame
- Macro colors: protein `#E4572E` · carbs `#F5A623` · fat `#E5484D`

## Target state

**Sprint 3** of the [[Roadmap]] (renumbered from Sprint 2 under the old structure, per the official 2026-07-09 roadmap): Food Logging, Food Search, **real barcode scanning** (camera permission ships here), Daily Nutrition, Meal History, Restaurant Support, **Screenshot Food Analysis** — which is [[Mobile Order Screenshot Import]], promoted from the Innovation Lab to 📋 Planned — and Fuel Polish.

## Future ideas

- AI meal planning via Atlas — [[Atlas Capabilities]]
- Nutrition insights connected to Health Age — [[Future Features]]
- Mobile order screenshot import — Atlas reads a restaurant/delivery order screenshot and drafts the log for review — [[Mobile Order Screenshot Import]]
- AI meal photo recognition — Atlas estimates foods, portions, and macros from a photo of the plate and drafts the log for review — [[AI Meal Photo Recognition]]
- Smart fridge scanner — Atlas reads what's in the fridge and suggests meals, swaps, and groceries (advisory, not a logging action — placement in the app is still open) — [[Smart Fridge Scanner]]

## Dependencies

- Food database / nutrition data source decision — **Needs Verification** (no provider chosen or documented in the repo)
- Camera + barcode scanning implementation (Sprint 2)
- [[Supabase & Database]] for logging persistence

## Open questions

- Which food-data provider (and licensing cost) powers search and barcodes? Should be resolved before Sprint 2 planning.

**Related:** [[Product Overview]] · [[Dashboard]] · [[Water]] · [[Atlas Capabilities]]
