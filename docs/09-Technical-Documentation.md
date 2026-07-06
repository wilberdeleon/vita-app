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
- `src/lib/` — cross-cutting infrastructure (Supabase client, utils)
- `supabase/` — migrations and edge functions
- `assets/` — icon, splash, fonts, images

## Architecture rules

1. **Features never import from each other.** Anything shared is promoted to `src/lib/`, `src/theme/`, or `src/components/`.
2. **`src/components/ui/` contains zero business logic.** Primitives know nothing about features.
3. **Routes stay thin.** Logic lives in `src/features/`, not in `src/app/` screens.
4. **One home per concern.** Supabase client only in `src/lib/supabase/`; tokens only in `src/theme/`; every schema change is a migration file.

## Environment & secrets

- Copy `.env.example` to `.env` (git-ignored) and fill in values.
- Only publishable keys use the `EXPO_PUBLIC_` prefix (they ship inside the app bundle). Real secrets live server-side in Supabase edge functions.

## Sprint 0 implementation notes

- **Navigation shape:** the dock has four tabs (`(vita)/(tabs)/`: dashboard, fuel, journey, atlas). Water, Peptides, the Food Log flow, and Settings are stack screens above the tabs (no dock). Settings opens from the header gear.
- **Mock data:** every feature serves realistic fixtures from `mock.ts` through its `api.ts` boundary. Later sprints swap fixture bodies for Supabase queries without touching screens.
- **Auth:** `features/auth/AuthProvider` reports a mock signed-in user; the gate in `src/app/index.tsx` already routes by session status. Enabling real auth = replacing AuthProvider internals.
- **Charts** are hand-drawn with `react-native-svg` (LineChart, WeightBars in `features/journey`) — no chart library.
- **Barcode scanner** is a static visual mock; camera permission and real scanning ship in Sprint 2.
- **SDK notes:** tab-bar types import from `@react-navigation/bottom-tabs` (on SDK 55+ expo-router vendors react-navigation and they move to `expo-router/tabs`). `expo-status-bar` is not a config plugin on SDK 54 — do not add it to `plugins`. `.npmrc` keeps `legacy-peer-deps=true`.

## Running the app

```bash
npm install
npx expo start        # then press i for the iOS simulator, or scan the QR code with Expo Go
```

Development builds and store builds use EAS (`eas.json` profiles: development, preview, production).
