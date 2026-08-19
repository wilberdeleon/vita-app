# Fuel

**What is this?** Vita's nutrition experience (canonical module name: `fuel`). Fuel is how users log what they eat — but framed as fueling a transformation, not counting calories.

**Why does it exist?** Nutrition is the highest-frequency health decision people make. Fuel's job is to make logging so frictionless that consistency becomes possible ([[Product Philosophy]]: reduce friction, reinforce consistency).

---

## Current state (verified in repo — Sprint 2 in progress)

**Slice 2.1 — Nutrition Foundation is built.** Fuel's daily calories, macros, meal grouping, and targets now come from **real logged food entries** through the shared nutrition domain at `src/lib/nutrition/`, not from a fixture. Fuel and the Food Log render an honest empty day when nothing is logged. The engine persists to AsyncStorage behind a `FoodLogRepository` interface, so Supabase later swaps in without touching a screen. Architecture detail: repo `docs/09-Technical-Documentation.md`.

Removed in the same slice: `FUEL_TODAY` (its meal breakdown contradicted its own headline total, and its water/peptide counts duplicated fixtures those features already owned) and `features/dashboard/mealIcons.ts` (a Fuel-only concern living inside the Dashboard feature). Canonical meal vocabulary is now `Breakfast · Lunch · Dinner · Snacks` — the codebase previously carried both `Snack` and `Snacks` for the same thing.

**Still fixture or mock, deliberately:** Food Search, Recent, Favorites, and Food Detail still read the interim catalog in `features/fuel/mock.ts` (replaced by the provider layer, slice 2.6) · Add Manually saves nothing (slice 2.2) · the barcode scanner is still a static drawing with no camera · Home's nutrition is still its own fixture until slice 2.5.

The eight-screen flow under `src/app/(vita)/fuel/` and the Fuel hub tab are otherwise unchanged from Sprint 0. Domain color: **orange `#F2670F`** ([[Color System]]); dock icon: flame. Macro colors: protein `#2E9E5B` · carbs `#F5A623` · fat `#E5484D`.

## Target state

**Sprint 2** of the [[Roadmap]] (renumbered 2026-08-17; was Sprint 3): Core Logging, Home Integration, Recents/Favorites/Custom Foods, the Provider Layer, Food Search, **real barcode scanning** (camera permission ships here), Edge Cases & Polish, Final Verification. Live slice progress: repo `docs/06-Slice-Tracker.md`.

**Screenshot Food Analysis** ([[Mobile Order Screenshot Import]]) is explicitly **deferred out of Sprint 2's approved scope** and currently has no scheduled sprint — see [[Open Questions]] #14.

### Fuel Visual Refinement — founder direction, 2026-08-18

Functionality stays the priority for the rest of Sprint 2, but **before Sprint 2 counts as polished, Fuel gets a dedicated visual/interaction refinement slice** — added to [[Roadmap]] after the functional slices and before Final Verification.

The founders' read on Fuel as built today: **too basic, too bulky, overusing large numbers, and filling space simply because space exists.** Calorie and nutrition values are the named example — they grow disproportionately large and dominate entire screens. It currently reads as a functional prototype rather than a refined production health app.

**Same feature architecture, significantly more refined presentation** — this is explicitly *not* a functional redesign. The slice evaluates: information density · typography scale · number sizing · spacing · card sizing · empty space · hierarchy · search-result density · Food Detail density · logging confirmation · meal rows · Food Log presentation. The governing principle, recorded on [[Design Bible]]: **size communicates importance, not availability.**

### Contextual food visuals — concept, unscheduled

Food tracking should eventually feel more alive and visually distinctive — a burger shows a small burger, a taco a taco, oatmeal a bowl, coffee a cup. **Small, delightful, tasteful, premium, and useful for quick recognition — never giant food photos dominating the interface.**

Two constraints already settled as direction: presentation must **not depend on any one provider** (real image → VITA category illustration → generic fallback, because USDA, Open Food Facts, restaurant providers, and custom foods all have inconsistent image coverage), and a `Food → Category → illustration` mapping will likely be needed since provider data rarely exposes a usable *visual* category. Deliberately not over-engineered yet.

Full proposal: [[Contextual Food Visuals]].

## Future ideas

- AI meal planning via Atlas — [[Atlas Capabilities]]
- Nutrition insights connected to Health Age — [[Future Features]]
- Mobile order screenshot import — Atlas reads a restaurant/delivery order screenshot and drafts the log for review — [[Mobile Order Screenshot Import]]
- AI meal photo recognition — Atlas estimates foods, portions, and macros from a photo of the plate and drafts the log for review — [[AI Meal Photo Recognition]]
- Smart fridge scanner — Atlas reads what's in the fridge and suggests meals, swaps, and groceries (advisory, not a logging action — placement in the app is still open) — [[Smart Fridge Scanner]]
- Contextual food visuals — small food illustrations/icons for quick recognition, provider-independent — [[Contextual Food Visuals]]

## Dependencies

- Food data providers — **decided 2026-08-17**: FatSecret (restaurant/branded), USDA FoodData Central (generic/foundational), Open Food Facts (packaged/barcode/images), behind provider adapters and a normalized VITA food model. Licensing, attribution, and caching terms must be verified per provider before any third-party data is cached. See [[Decision Log]].
- Camera + barcode scanning implementation (Sprint 2, later slice)
- [[Supabase & Database]] — **not** required for Sprint 2 logging; persistence is local behind a repository interface, and Supabase becomes a second implementation later

## Open questions

- FatSecret account registration and Premier Free eligibility are founder tasks — Claude stops at that dependency rather than inventing credentials.
- Whether nutrition targets become user-editable in Sprint 2, given [[Settings]] has no sprint until 7.

**Related:** [[Product Overview]] · [[Dashboard]] · [[Water]] · [[Atlas Capabilities]]
