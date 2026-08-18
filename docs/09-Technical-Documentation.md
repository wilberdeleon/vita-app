# VITA — Technical Documentation

Single source of truth for implementation details: stack, architecture rules, and how to work in this repository.

---

## Stack (founder-approved, July 2026)

- **Platform:** Native-first — Expo SDK 54 / React Native, managed workflow, EAS builds. TypeScript throughout (strict mode). SDK 54 is pinned to match the current App Store Expo Go client (54.x) so founders can test on real iPhones; upgrade the SDK only when the App Store Expo Go supports it.
- **Navigation:** Expo Router (file-based) in `src/app/`.
- **Backend:** Supabase (auth, database, storage). Schema changes via numbered migrations in `supabase/migrations/`.
- **Deliberately not pre-committed:** state-management library, component library, testing framework. These are per-slice decisions made when a slice needs them.

## Repository layout

- `docs/` — governing documents (numbered 00–10)
- `src/app/` — Expo Router routes only; screens stay thin and compose feature modules
- `src/features/<name>/` — one module per canonical area: `dashboard`, `fuel`, `journey`, `water`, `peptides`, `atlas`, `settings` (+ `auth`)
- `src/components/ui/` — Design System primitives only, no business logic
- `src/components/shell/` — floating dock, headers, app frame
- `src/theme/` — design tokens and theme system
- `src/lib/` — cross-cutting domain and infrastructure shared by more than one feature (Supabase client, `journeyStages`, `nutrition/`)
- `supabase/` — migrations and edge functions
- `assets/` — icon, splash, fonts, images

## Architecture rules

1. **Features never import from each other.** Anything shared is promoted to `src/lib/`, `src/theme/`, or `src/components/`.
2. **`src/components/ui/` contains zero business logic.** Primitives know nothing about features.
3. **Routes stay thin.** Logic lives in `src/features/`, not in `src/app/` screens.
4. **One home per concern.** Supabase client only in `src/lib/supabase/`; tokens only in `src/theme/`; every schema change is a migration file.
5. **Appearance resolves through the theme, never through raw palette surfaces.** Backgrounds, text, and borders come from `useTheme().surfaces`; `palette` supplies theme-invariant values only (brand, domain, macro, semantic colors). Importing `palette.text`/`palette.card`/`palette.background`/`palette.track` into a component pins it to light mode permanently. See [Design System](05-Design-System.md) for the full split and the documented exceptions.

## Nutrition architecture (Sprint 2)

`src/lib/nutrition/` is the single source of truth for food entries, daily totals, and nutrition targets. It lives in `src/lib/` rather than `features/fuel/` because **both** Fuel and Dashboard consume nutrition, and features never import each other (rule 1 above) — the same promotion `src/lib/journeyStages.ts` received.

```
FoodEntry[]  →  DailyNutritionState  →  pure selectors  →  Fuel + Home
```

- **`model/`** — the provider-independent types (`VitaFood`, `ServingOption`, `NutritionFacts`, `FoodEntry`, `NutritionTargets`), pure calculation functions, log-date helpers, the canonical meal vocabulary, and the macro list. No I/O, no React.
- **`data/`** — `FoodLogRepository` (the interface) and its AsyncStorage implementation. **This is the swap point:** Supabase later arrives as a second implementation, and no screen, hook, or calculation learns where data lives. Everything read back from storage is validated before use; malformed records are dropped rather than repaired, because a guessed value in a food log is worse than a missing one.
- **`state/`** — `NutritionProvider` (Context + `useReducer`, mirroring `ThemeProvider`; no state library) and `useDailyNutrition()`, which derives totals, per-meal groups, and progress on each render. Mounted at the root in `src/app/_layout.tsx`, above the router, because Home and Fuel read the same day.

**Entry nutrition is a snapshot, not a reference.** `FoodEntry.nutrition` is already multiplied by quantity and stored with the entry. Three reasons: history stays truthful when a provider revises a food; deleting a custom food or losing network cannot corrupt past days; and daily totals become a pure sum with no lookups and no loading state on Fuel or Home. The cost is denormalization, which is the right trade for a log.

**Log dates are local, not UTC.** `FoodEntry.logDate` is `YYYY-MM-DD` derived from the device's local calendar, so an 11pm entry counts as that day. `loggedAt` keeps the precise instant separately. `NutritionProvider` re-derives today on `AppState` → `active`, so a backgrounded app rolls over instead of showing yesterday's totals under "Today".

**Storage keys** are namespaced and versioned (`vita:v1:…`), one key per day, so reads and writes stay small regardless of how much history accumulates. See `src/lib/nutrition/data/keys.ts`.

## Food providers (Sprint 2, slice 2.6)

```
USDA adapter    Open Food Facts adapter        ← the only files that know a provider's shape
        └───────────────┴───────────┐
                                    ▼
                          Normalized VitaFood
                                    ▼
                    parallel fan-out → score → dedupe → rank
                                    ▼
                            Search / Food Detail
```

**Adapters** live in `src/lib/nutrition/providers/`. Raw provider payloads never leave them — verified by grep: no `fetch(` outside that directory and no `source === 'usda'` style branching anywhere in `src/app`, `src/features`, or `src/components`.

**USDA FoodData Central** — free, **CC0 public domain**, no commercial restrictions, attribution requested but not required. Key from `api.data.gov`, 1,000 requests/hour. Nutrients are read by numeric id (names vary by data type) and are always per 100 g, so a label serving is derived by scaling and the 100 g baseline is always offered too. Data types are limited to Foundation, SR Legacy, Branded, and Survey (FNDDS).

**Open Food Facts** — free, no key, **ODbL** data and **CC-BY-SA** images; attribution is required wherever the data is shown. A contact email in the `User-Agent` is mandatory (`EXPO_PUBLIC_OFF_CONTACT`); without it the provider reports itself unconfigured rather than sending an anonymous identifier. Two conversions matter: sodium arrives in **grams** and is stored as mg, and energy is read only from the explicit `energy-kcal` field because the generic `energy` field is kilojoules on most records.

**Search endpoint choice.** Full-text search uses **Search-a-licious** (`search.openfoodfacts.org`), which OFF's current documentation points to. The legacy `cgi/search.pl` returns richer records — it carries `serving_size`/`serving_quantity`, which Search-a-licious does not index at all — but it returned HTTP 503 during verification. Reliability won: OFF search results therefore offer only the honest 100 g baseline. Label servings remain available from the product endpoint, which `lookupBarcode` uses and the barcode slice inherits. **Recommended follow-up:** enrich a food from the product endpoint when the user opens it — one request per opened food, not per result.

**Loggability rule.** A result is only surfaced if calories, protein, carbs, and fat can all be derived. Records missing any of them are dropped rather than shown disabled, because a result you cannot log is noise in a list being scanned fast — and zero-filling would be indistinguishable from a measured zero.

**Deduplication** — three passes, cheapest first: normalized GTIN identity, then brand + normalized name, then near-duplicate generics (token-set similarity ≥ 0.9 **and** calories within 5% **and** both unbranded). The third pass is deliberately the narrowest: collapsing a 12 oz can into a 20 oz bottle would hide a real choice and log the wrong calories.

**GTIN normalization** (`providers/gtin.ts`) pads every barcode to 14 digits, so UPC-A, EAN-13, and leading-zero-stripped numeric forms of the same product compare equal. Any 8–14 digit run is accepted and padded, because a barcode passed through a JSON number loses its leading zero — the exact mismatch the module exists to prevent. Check-digit validation is exposed but deliberately **not** enforced, since real catalogues carry codes that fail it.

**Ranking** is a pure deterministic scoring function with named weights — no learning, and a name tiebreak so identical searches never reorder based on which provider answered first.

**Failure isolation.** Providers are queried in parallel and settled independently; one failing, timing out (6 s), or being unconfigured degrades the result set but never fails the search. Only an all-providers-failed outcome shows the error state.

**Caching.** Query results are in-memory with a 5-minute TTL (queries are too varied to persist, and search should feel live). Individual foods are persisted with a 30-day TTL under `vita:v1:cache:food:{vitaId}` — this one is load-bearing, because Food Detail resolves a provider food that is not in My Foods. Neither cache bulk-downloads or accumulates a redistributable copy of a provider database; ODbL's share-alike obligation attaches to publishing a derived database, which this is not.

**Key handling.** The USDA key is a rate-limiting identifier rather than a true secret, which is why `EXPO_PUBLIC_` is acceptable for development. USDA does deactivate keys found published publicly, so **a public release should move these calls behind a proxy.** FatSecret is a different case entirely — its client secret must stay server-side, which is why it is deferred to a slice that can add a Supabase Edge Function.

### Recents and Favorites (slice 2.7)

**Recents are derived, not stored.** The food log already holds the truth, so there is no `recents` key — a parallel list would only be a second thing that can disagree with the first. `useRecentFoods` enumerates log keys, reads the newest 30 days, collapses to one row per `vitaId`, and caps at 25.

**`foodFromEntry()`** rebuilds a loggable `VitaFood` from an entry snapshot alone, which is what lets a recent survive an expired provider cache, a deleted custom food, or being offline. Opening Recents also re-seeds the food cache from history.

**Favorites** are keyed by `vitaId` and persisted at `vita:v1:favorites`, newest first. `PERSISTABLE_SOURCES` gates whether the food *definition* may be retained: USDA (CC0), Open Food Facts (ODbL — retaining individual user-chosen records on-device is ordinary API use; share-alike attaches to publishing a derived database), and custom foods. **FatSecret is excluded** until its caching/storage terms are verified; a favorite from it will store identity only and resolve live. A stored definition is dropped on read if its source is no longer permitted, so a terms change needs no migration.

## Environment & secrets

- Copy `.env.example` to `.env` (git-ignored) and fill in values.
- Only publishable keys use the `EXPO_PUBLIC_` prefix (they ship inside the app bundle). Real secrets live server-side in Supabase edge functions.

## Known mocks (as of Sprint 2, slice 2.7)

Recorded explicitly so a screen showing real data next to a screen showing fixtures is never mistaken for a bug — or for working functionality.

| Area | State |
|---|---|
| Food entries, daily totals, meal grouping, targets | **Real.** Persisted via `src/lib/nutrition`; verified across a full app restart. |
| Food Detail (serving/quantity/meal → log) | **Real**, and provider-agnostic — consumes the normalized model only. |
| Editing a logged entry (serving/quantity/meal) | **Real.** Updates in place; never mutates the food definition. |
| Food Search | **Real.** USDA + Open Food Facts through the provider layer. |
| Recent Foods | **Real.** Derived from logging history — no separate store. |
| Favorites | **Real.** Persisted, keyed by `vitaId`, working across every source. |
| Add Manually, custom foods (My Foods), delete + Undo | **Real.** Persisted. |
| Barcode scanner | Static drawing, no camera. Later in Sprint 2. |
| **Water Log** | **Mock.** `getWaterToday()` returns a fixed `5 / 8 cups`; "+ Add Water" discards the amount. Tier 3 of Sprint 2. |
| **Peptide Log** | **Mock.** `getPeptideToday()` returns a fixed `1 / 3 logged`; "Save Peptide" discards the entry. Preserved but deliberately not extended in Sprint 2 — deeper work is Sprint 5. |
| Home nutrition (calories, macros, meals, nutrition goal) | **Real.** Same engine as Fuel — one source of truth. |
| Home Journey, steps, sleep, workouts, streak, water tile, Water/Movement/Recovery goal pillars | Mock. Domains Sprint 2 does not cover; none competes with nutrition. |

## Sprint 0 implementation notes

- **Navigation shape:** the dock has four tabs (`(vita)/(tabs)/`: dashboard, fuel, journey, atlas). Water, Peptides, the Food Log flow, and Settings are stack screens above the tabs (no dock). Settings opens from the header gear.
- **Mock data:** every feature serves realistic fixtures from `mock.ts` through its `api.ts` boundary. Later sprints swap fixture bodies for Supabase queries without touching screens.
- **Auth:** `features/auth/AuthProvider` reports a mock signed-in user; the gate in `src/app/index.tsx` already routes by session status. Enabling real auth = replacing AuthProvider internals.
- **Charts** are hand-drawn with `react-native-svg` (LineChart, WeightBars in `features/journey`) — no chart library.
- **Barcode scanner** is still a static visual mock as of slice 2.1; camera permission and real scanning ship later in Sprint 2. It is also the one screen deliberately outside the theme system — a full-screen dark camera view that reads correctly in both themes.
- **Theming** (app-wide since the 2026-08-16 visual consistency pass): `ThemeProvider` holds the user's `mode` (light/dark/system) and resolves it to a `scheme`; on `system` it reads `Appearance.getColorScheme()` and subscribes to `Appearance.addChangeListener`, so switching iOS appearance updates the app live with no restart or navigation reset. **`mode` is in-memory `useState` — the preference does not survive a cold restart. Persistence is unimplemented deferred work.**
- **SDK notes:** tab-bar types import from `@react-navigation/bottom-tabs` (on SDK 55+ expo-router vendors react-navigation and they move to `expo-router/tabs`). `expo-status-bar` is not a config plugin on SDK 54 — do not add it to `plugins`. `.npmrc` keeps `legacy-peer-deps=true`.

## Running the app

```bash
npm install
npx expo start        # then press i for the iOS simulator, or scan the QR code with Expo Go
```

Development builds and store builds use EAS (`eas.json` profiles: development, preview, production).
