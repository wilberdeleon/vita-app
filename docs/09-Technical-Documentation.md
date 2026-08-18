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

## Environment & secrets

- Copy `.env.example` to `.env` (git-ignored) and fill in values.
- Only publishable keys use the `EXPO_PUBLIC_` prefix (they ship inside the app bundle). Real secrets live server-side in Supabase edge functions.

## Known mocks (as of Sprint 2, slice 2.5)

Recorded explicitly so a screen showing real data next to a screen showing fixtures is never mistaken for a bug — or for working functionality.

| Area | State |
|---|---|
| Food entries, daily totals, meal grouping, targets | **Real.** Persisted via `src/lib/nutrition`; verified across a full app restart. |
| Food Detail (serving/quantity/meal → log) | **Real**, and provider-agnostic — consumes the normalized model only. |
| Editing a logged entry (serving/quantity/meal) | **Real.** Updates in place; never mutates the food definition. |
| Food Search, Recent, Favorites | Fixture catalog, normalized through `features/fuel/fixtureCatalog.ts` and labelled `source: 'vita-fixture'`. Replaced by the provider layer in slice 2.6. |
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
