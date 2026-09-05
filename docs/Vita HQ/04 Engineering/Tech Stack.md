# Tech Stack

**What is this?** Every technology Vita is built on, with versions and the reasoning that chose them.

**Why does it exist?** So stack questions have one answer, and so the deliberate *non*-choices stay visible.

*Verified 2026-09-05 from `package.json`, `app.json`, and repo Technical Documentation.*

---

## The stack (founder-approved, July 2026)

| Layer | Choice | Version |
|---|---|---|
| Platform | **Expo (React Native), managed workflow** — native-first | Expo SDK **57** (pinned) |
| Runtime | React / React Native | 19.2.3 / 0.86.3 |
| Language | **TypeScript, strict mode** | ~6.0.3 |
| Navigation | **Expo Router** (file-based, in `src/app/`) | ~57.0.19 |
| Backend | **Supabase** — auth, database, storage | `@supabase/supabase-js` ^2.110.0 |
| Graphics | `react-native-svg` (hand-drawn charts) | 15.15.4 |
| Icons | `@expo/vector-icons` (Ionicons) | ^15.0.2 |
| Builds | **EAS** — development / preview / production profiles | `eas.json` |

## ⚠️ The SDK pin (important)

Expo SDK is **pinned to 57** to match the current App Store **Expo Go** client so the founders can test on real iPhones. **Do not upgrade the SDK without first checking the App Store Expo Go version.** Always consult the versioned docs: `https://docs.expo.dev/versions/v57.0.0/`.

The rule has not changed, only the number. The project sat on **54** from 2026-07-05 until 2026-09-05, when the App Store Expo Go client moved to SDK 57 and refused to open an SDK 54 project at all — see the Changelog entry for that date.

SDK-57 specifics worth knowing:
- Tab-bar props come from Expo Router's own `Tabs` component. Expo Router 56+ vendors React Navigation internally and no longer depends on `@react-navigation/*`, so **do not install `@react-navigation/bottom-tabs`** — it would describe a different navigator than the one Expo Router runs.
- `expo-status-bar` **is** a config plugin from SDK 55 on, but Expo resolves it implicitly; it does not need a `plugins` entry.
- The splash screen is configured through the **`expo-splash-screen` config plugin**. The top-level `splash` key was removed from the Expo config schema and is now a hard validation error.
- **TypeScript 6 no longer auto-includes `@types/*`**, which is why `tsconfig.json` declares `types: ["jest"]`. Removing it breaks Jest's globals in every test file.
- `StyleSheet.absoluteFillObject` no longer exists (removed in React Native 0.85); `StyleSheet.absoluteFill` is the same plain object.
- `@react-native/jest-preset` is a required `jest-expo` peer and must track the React Native version.
- `.npmrc` keeps `legacy-peer-deps=true`

## Deliberately not chosen (per-slice decisions)

**State-management library · component library.** These are decided when a slice actually needs them — an explicit founder-approved position, not an oversight.

**Testing framework — decided 2026-08-22 (Sprint 3, slice 3.1).** `jest` with Expo's own `jest-expo` preset, pinned to SDK 54, plus `@types/jest`. **Dev dependencies only** — no native module, nothing in the app bundle, Expo Go unaffected. Tests live in co-located `__tests__` folders; `npm test` runs them. Chosen over Vitest because it is Expo's supported preset and leaves component testing available later without a second migration. The deferral ended here because Sprint 3 contains safety-adjacent dose arithmetic that must not ship on ad-hoc verification. Standing rule: **tests must be timezone-independent** — build dates from local components, and express timezone-sensitive behavior as a property rather than a comparison that only fails at some UTC offsets.

## Running the app

```bash
npm install
cp .env.example .env    # fill in values
npx expo start          # press i for iOS simulator, or scan QR with Expo Go
```

**Related:** [[Architecture]] · [[Deployment & Builds]] · [[Supabase & Database]] · [[Development Standards]]
