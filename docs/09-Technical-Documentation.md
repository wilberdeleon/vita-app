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

**USDA FoodData Central** — free, **CC0 public domain**, no commercial restrictions, attribution requested but not required. Key from `api.data.gov`, 1,000 requests/hour.

**Do not add a `dataType` query parameter.** It was measured at **5/10 success** versus **10/10** for the identical query without it — api.data.gov's edge intermittently answers the filtered form with a bare nginx `400`, silently costing USDA results on about half of all searches. Data types are filtered client-side in `toVitaFood` against the `DATA_TYPE_QUALITY` allowlist instead. Nutrients are read by numeric id (names vary by data type) and are always per 100 g, so a label serving is derived by scaling and the 100 g baseline is always offered too. Data types are limited to Foundation, SR Legacy, Branded, and Survey (FNDDS).

**Open Food Facts** — free, no key, **ODbL** data and **CC-BY-SA** images; attribution is required wherever the data is shown. A contact email in the `User-Agent` is mandatory (`EXPO_PUBLIC_OFF_CONTACT`); without it the provider reports itself unconfigured rather than sending an anonymous identifier. Two conversions matter: sodium arrives in **grams** and is stored as mg, and energy is read only from the explicit `energy-kcal` field because the generic `energy` field is kilojoules on most records.

**Search endpoint choice.** Full-text search uses **Search-a-licious** (`search.openfoodfacts.org`), which OFF's current documentation points to. The legacy `cgi/search.pl` returns richer records — it carries `serving_size`/`serving_quantity`, which Search-a-licious does not index at all — but it returned HTTP 503 during verification. Reliability won: OFF search results therefore offer only the honest 100 g baseline. Label servings remain available from the product endpoint, which `lookupBarcode` uses and the barcode slice inherits. **Recommended follow-up:** enrich a food from the product endpoint when the user opens it — one request per opened food, not per result.

**Loggability rule.** A result is only surfaced if calories, protein, carbs, and fat can all be derived. Records missing any of them are dropped rather than shown disabled, because a result you cannot log is noise in a list being scanned fast — and zero-filling would be indistinguishable from a measured zero.

**Deduplication** — three passes, cheapest first: normalized GTIN identity, then brand + normalized name, then near-duplicate generics (token-set similarity ≥ 0.9 **and** calories within 5% **and** both unbranded). The third pass is deliberately the narrowest: collapsing a 12 oz can into a 20 oz bottle would hide a real choice and log the wrong calories.

**GTIN normalization** (`providers/gtin.ts`) pads every barcode to 14 digits, so UPC-A, EAN-13, and leading-zero-stripped numeric forms of the same product compare equal. Any 8–14 digit run is accepted and padded, because a barcode passed through a JSON number loses its leading zero — the exact mismatch the module exists to prevent. Check-digit validation is exposed but deliberately **not** enforced, since real catalogues carry codes that fail it.

**Ranking** is a pure deterministic scoring function with named weights — no learning, and a name tiebreak so identical searches never reorder based on which provider answered first.

Records carry an optional **`dataQuality`** (0–100): a provider-independent trust signal that adapters populate from whatever their source knows, and the only quality input ranking reads. It exists because a flat per-provider score is too coarse — USDA serves laboratory composition data and manufacturer-submitted branded labels from the *same* endpoint, and searching "banana" returned a branded peanut butter spread named "BANANA" ahead of "Bananas, raw". USDA maps FDC data types (Foundation/SR Legacy 95, Survey (FNDDS) 82, Branded 78); Open Food Facts uses a flat 70. Two supporting rules: an exact name match on a branded product whose brand the query never mentioned is worth +15 rather than +45, and a capped (−8 max) per-extra-word penalty acts as a tiebreak without being able to invert a quality tier.

**Failure isolation.** Providers are queried in parallel and settled independently; one failing, timing out (6 s), or being unconfigured degrades the result set but never fails the search. Only an all-providers-failed outcome shows the error state.

**Caching.** Query results are in-memory with a 5-minute TTL (queries are too varied to persist, and search should feel live). Individual foods are persisted with a 30-day TTL under `vita:v1:cache:food:{vitaId}` — this one is load-bearing, because Food Detail resolves a provider food that is not in My Foods. Neither cache bulk-downloads or accumulates a redistributable copy of a provider database; ODbL's share-alike obligation attaches to publishing a derived database, which this is not.

**Key handling.** The USDA key is a rate-limiting identifier rather than a true secret, which is why `EXPO_PUBLIC_` is acceptable for development. USDA does deactivate keys found published publicly, so **a public release should move these calls behind a proxy.**

### Provider roster

**Current providers (development and Sprint 2):**

| Provider | Role | Licence / terms posture |
|---|---|---|
| **USDA FoodData Central** | Generic, foundational, and raw/basic US foods | CC0 public domain — no retention restriction |
| **Open Food Facts** | Packaged and branded products, product images, barcode lookup | ODbL data / CC-BY-SA images — attribution required; retaining individual user-chosen records on-device is ordinary API use |

**Deferred provider:**

| Provider | Intended role | Status |
|---|---|---|
| **FatSecret** | Restaurant and stronger branded food coverage | **Deferred** by founder decision, 2026-08-21 |

**Why FatSecret is deferred.** Its Developer Terms require removing or re-requesting any Content not explicitly *storable indefinitely* within **24 hours**. The indefinitely-storable list is identifiers only — `food_id`, `serving_id`, `food_category_id` and similar — and does **not** include nutrition values, food names, brand names, serving descriptions, or image URLs. VITA persists all of those permanently inside `FoodEntry`, by design: it is what lets Fuel and Home compute totals with no lookup, no async, and no loading state, and what keeps a logged day truthful after a provider revises a food. **The retention rules conflict with permanent `FoodLogEntry` snapshots, and the snapshots win.** Snapshots are not redesigned during Sprint 2.

A second blocker sits under the intended architecture: FatSecret binds OAuth 2.0 tokens to an IP allowlist, and Supabase Edge Functions cannot provide static egress IPs. FatSecret's client secret would still have to stay server-side whenever this is revisited — that part of the plan was sound.

**No workaround was built.** No ID-only favorites, no history re-fetching, no temporary shim, and `fatsecret` remains excluded from every persisted-definition allowlist. Full findings with quotes: `docs/07-Audit-Log.md` (2026-08-21). Launch-gated re-evaluation and the eight open questions: `docs/04-Master-Roadmap.md` → Launch readiness follow-ups.

### Recents and Favorites (slice 2.7)

**Recents are derived, not stored.** The food log already holds the truth, so there is no `recents` key — a parallel list would only be a second thing that can disagree with the first. `useRecentFoods` enumerates log keys, reads the newest 30 days, collapses to one row per `vitaId`, and caps at 25.

**`foodFromEntry()`** rebuilds a loggable `VitaFood` from an entry snapshot alone, which is what lets a recent survive an expired provider cache, a deleted custom food, or being offline. Opening Recents also re-seeds the food cache from history.

**Favorites** are keyed by `vitaId` and persisted at `vita:v1:favorites`, newest first. `PERSISTABLE_SOURCES` gates whether the food *definition* may be retained: USDA (CC0), Open Food Facts (ODbL — retaining individual user-chosen records on-device is ordinary API use; share-alike attaches to publishing a derived database), and custom foods. **FatSecret is excluded** — its caching/storage terms were verified on 2026-08-21 and permit only identifiers to be retained, so the provider is deferred entirely rather than partially accommodated. No ID-only favorite path was built; see Provider roster above. A stored definition is dropped on read if its source is no longer permitted, so a terms change needs no migration.

### Barcode scanning (slice 2.8)

`expo-camera@~17.0.10` (SDK 54-compatible; **no SDK upgrade**). Works in Expo Go — no development build, no Xcode. `app.json` carries the `expo-camera` plugin with a permission string for future dev builds; Expo Go supplies its own.

**Flow:** camera → `onBarcodeScanned` → `normalizeGtin()` → sequential lookup → Food Detail. Scan types are limited to `upc_a`, `upc_e`, `ean13`, `ean8`.

**Scan lock is a `ref`, not state.** The callback fires many times per second while a code is in frame; React batching lets several through before a `useState` flag re-renders, each firing its own lookup and navigation. The handler is also detached during lookup as a second guard. A non-GTIN value is ignored without locking.

**Sequential, not parallel.** A GTIN is an exact identity, so the first trustworthy match ends the search — no reason to spend rate-limited quota on the rest. Open Food Facts first (barcode-native product endpoint, and it carries serving data that Search-a-licious lacks); USDA optional and skipped silently when unconfigured.

**USDA has no barcode endpoint** — a GTIN query is fuzzy full-text, so every candidate is re-verified against its own `gtinUpc` and only an exact match is accepted.

**A barcode is an identifier, never a query.** Both adapters re-normalize the *returned* product's own barcode and accept it only on exact GTIN identity; USDA additionally skips any record without a `gtinUpc` rather than treating it as a near-miss. Showing an unrelated food is worse than admitting nothing was found.

**Route screens under `[id]` must not seed state with `useState` initializers.** `/fuel/food/[id]` and `/fuel/entry/[id]` are single screens: navigating between two ids updates `params` without remounting, so an initializer runs once and never again. This shipped a bug where a scanned barcode displayed an earlier product. Resolve async state together with the id it belongs to, and re-seed derived UI state on an identity change.

**Not-found vs error are distinct**, and must stay so: Open Food Facts answers an unknown barcode with **HTTP 404**, which is a definitive "the database doesn't have this" and maps to not-found. Treating it as an error would send users to retry a lookup that can never succeed instead of offering manual entry.

## Environment & secrets

- Copy `.env.example` to `.env` (git-ignored) and fill in values.
- Only publishable keys use the `EXPO_PUBLIC_` prefix (they ship inside the app bundle). Real secrets live server-side in Supabase edge functions.

## Known mocks (as of Sprint 2, slice 2.8)

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
| Barcode scanner | **Real camera.** Live detection unverified pending a physical iPhone — the simulator has no camera. |
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

---

## Future architecture considerations (founder direction, 2026-08-18)

**None of this is built, scheduled at the code level, or approved as a specification.** It is recorded here so the constraints are known before the relevant sprint starts, and so nobody re-derives them. Product framing lives in `docs/04-Master-Roadmap.md` (Sprints 2 and 5) and `docs/05-Design-System.md`; this section covers only the architectural implications.

### Food visual classification (Fuel — unscheduled)

Contextual food visuals need a stable answer to "what does this food look like," which provider data does not reliably supply — provider categories are commercial/nutritional taxonomies, not visual ones.

The likely shape is a mapping layer: `Food → Category → VITA illustration`, with a candidate category vocabulary of fruit · vegetable · burger · sandwich · bowl · taco · pizza · breakfast · oatmeal · bakery · drink · coffee · dairy · protein · snack · dessert. **Do not over-engineer this yet** — it is recorded as a consideration, not a design.

Two constraints that do carry over regardless of implementation:

- **Provider independence.** Resolution must degrade cleanly: real product image → VITA category illustration → generic food fallback. No screen may depend on a provider having supplied an image. USDA, Open Food Facts, restaurant providers, and custom foods all have inconsistent coverage, and a custom food has none by definition.
- **Classification belongs with the normalized model, not the adapters.** `VitaFood` is already provider-independent; a visual category is a property of the normalized food, derived once, rather than something each provider adapter invents differently.

### Water (Sprint 5)

- The daily goal is **user-defined** with a unit (cups/oz/mL/L) — not a hardcoded 8 cups — and persists until changed. Where the preference is *stored* interacts with Settings (Sprint 7), which lands later; sequencing is an open question, not an assumption to make silently.
- Hydration is **date-aware in the same way food logging already is**: local-calendar day keys, daily rollover on `AppState` → `active`, today's intake separate from history. The `logDate` / `loggedAt` split and the versioned per-day storage keys in `src/lib/nutrition/data/keys.ts` are the working precedent — reuse the pattern rather than inventing a second date model.
- Persistence should sit behind a repository interface like `FoodLogRepository`, so Supabase later arrives as a second implementation without touching screens.

### Peptides (Sprint 5)

**Three separate concerns, not one record** — mirroring the Food Definition ≠ Food Entry separation already established in `src/lib/nutrition`:

| Concern | What it is |
|---|---|
| Peptide Definition | What the compound is — catalog entry or user-created Custom |
| User Peptide Setup | This user's configuration: vial strength, reconstitution volume, start date, typical dose, schedule |
| Peptide Log Entry | One recorded administration: dose, units, injection site, timestamp, notes |

Collapsing these would repeat exactly the mistake the nutrition model avoids: a log entry that mutates when a definition changes, and a definition that cannot be reused across entries.

**Dose math is safety-adjacent and must be treated as such.** The bidirectional calculator (vial amount + reconstitution volume ⇄ syringe units ⇄ mg/mcg) is the reason this feature exists for users who think in syringe units, so it has to be right and it has to be legible:

- **Normalize units internally.** mg · mcg · mL · syringe units, as typed values — never free-form strings for anything feeding a calculation.
- **Unit tests are a requirement, not a preference,** including rounding behavior and the round-trip property (units → dose → units). This is the first place in VITA where a testing-framework decision (deliberately deferred per the stack notes above) actually has to be made.
- **Show the derivation, not just the answer.** A calculated dose the user cannot sanity-check is worse than no calculator.
- The entry snapshot principle applies here too: a log entry records the dose that was actually administered, and later edits to a vial setup must not silently rewrite history.

**Medical-content boundary.** Educational peptide information and any approved-vs-research distinction are content and compliance concerns, not engineering ones — they must be sourced and reviewed before implementation. Engineering's job is to keep the distinction representable in the data model (approval status is a field, not prose) rather than to author the content. Peptide data is also among the most sensitive VITA will hold; storage and disclosure posture must be settled before live data ships (see Vita HQ `04 Engineering/Supabase & Database.md`).
