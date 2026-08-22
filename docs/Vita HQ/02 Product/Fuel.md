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

**Fuel's Hydration and Peptides modules belong to Sprint 3.** The redesigned Fuel landing screen is approved and finished; **it is not redesigned again.** [[Water]] + [[Peptides]] — moved ahead of Journey to **Sprint 3** by the founder reorder of 2026-08-21 — turns those two compact modules into real entry points and daily summaries backed by real, persisted data, without re-opening Fuel's layout, hierarchy, or visual system.

### Fuel Visual Refinement — founder direction, 2026-08-18

Functionality stays the priority for the rest of Sprint 2, but **before Sprint 2 counts as polished, Fuel gets a dedicated visual/interaction refinement slice** — added to [[Roadmap]] after the functional slices and before Final Verification.

The founders' read on Fuel as built today: **too basic, too bulky, overusing large numbers, and filling space simply because space exists.** Calorie and nutrition values are the named example — they grow disproportionately large and dominate entire screens. It currently reads as a functional prototype rather than a refined production health app.

**Same feature architecture, significantly more refined presentation** — this is explicitly *not* a functional redesign. The slice evaluates: information density · typography scale · number sizing · spacing · card sizing · empty space · hierarchy · search-result density · Food Detail density · logging confirmation · meal rows · Food Log presentation. The governing principle, recorded on [[Design Bible]]: **size communicates importance, not availability.**

**Built for the Fuel landing screen 2026-08-21 — pending founder review** (slice 2.9; the other Fuel surfaces still to come). Fuel now opens as a daily nutrition command centre rather than a menu of cards: a calorie ring beside the Calories-remaining headline with macro bars below · a prominent **Log Food** action beside **Scan Barcode** · **Today's Meals** as four rows in one panel, where a logged meal shows its actual foods (serving, calories, favorite heart) and an untouched meal is a single compact row · a `+ Add food` per meal that opens the existing logging flow with that meal already selected · Hydration and Peptides reduced to half-width secondary modules. Two things a person previously had to leave Fuel to see — what they ate, and how to log something — are now on the screen itself.

Two decisions worth carrying: **Snacks is neutral sage, not the reference's purple** (purple is the locked Atlas/peptide domain color and the Peptides module sits just below), and **`kcal` is gone from user-facing copy** in favor of *Calories* / *cal* app-wide. Both flagged for founder confirmation. Detail: repo `docs/06-Slice-Tracker.md`, `docs/05-Design-System.md`.

**Approved and locked 2026-08-21.** The layout, density, meal structure, quick actions, and hydration/peptide placement are settled; Fuel is not to be restructured again. A polish pass the same day refined the copy (*Calories consumed* / *Calories remaining*; macros as progress toward the user's own configured targets, with no warning state and no invented dietary rules), fixed a persistence bug that was **permanently erasing product images from favorites**, and introduced the shared three-tier food visual resolver — see [[Contextual Food Visuals]], which is now *in development*, not released: the plumbing ships, the artwork does not.

**Final polish pass 2026-08-21 (post-approval).** Three device-QA findings closed: contextual food visuals were confidently *wrong* (the icon font's generic food glyph is a burger, so every unclassified food was drawn as one) and are now 14 hand-drawn VITA illustrations with a neutral fork-and-knife fallback — see [[Contextual Food Visuals]]; the calorie ring puts its number and unit back inside the circle and now **states an over-target day** (`326 · Calories over`, amber not red) instead of flattening it to `0 remaining`; and a barcode result that is wrong now has a way out — `Not the right product?` on scanner-originated Food Detail, offering search, rescan, manual entry, and an honestly-incomplete report. **Incorrect-product report submission has no backend and says so — deferred.**

**Restaurant coverage stays a gap, on purpose (founders, 2026-08-21).** FatSecret was researched as the restaurant/branded source and **deferred to pre-launch provider selection**: its terms let us keep identifiers but not the nutrition, names, brands, servings or images that VITA's permanent food-log snapshots depend on. Those snapshots are why history works offline and why Fuel and Home render instantly, so they were not traded away for one provider. Nothing was built and nothing was worked around. See [[Decision Log]] and repo `docs/04-Master-Roadmap.md` → Launch readiness follow-ups.

**Barcode remains the one open defect.** A Kroger water bottle still resolves to Hillshire Farm sausage, and the cause is now traced upstream: Open Food Facts record `0011110816405` sits under Kroger's own GS1 company prefix but carries Hillshire Farm name, brand, imagery, and nutrition. VITA's identity checks correctly confirm it, because the code returned genuinely is the code requested — **no client-side check can catch a database that is wrong about itself.** Not fixed, nothing hardcoded; awaiting one physical scan to confirm the bottle's actual code against that record.

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

**Related:** [[Product Overview]] · [[Dashboard]] · [[Water]] · [[Peptides]] · [[Atlas Capabilities]]
