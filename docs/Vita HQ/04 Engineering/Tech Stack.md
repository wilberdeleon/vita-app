# Tech Stack

**What is this?** Every technology Vita is built on, with versions and the reasoning that chose them.

**Why does it exist?** So stack questions have one answer, and so the deliberate *non*-choices stay visible.

*Verified 2026-07-06 from `package.json`, `app.json`, and repo Technical Documentation.*

---

## The stack (founder-approved, July 2026)

| Layer | Choice | Version |
|---|---|---|
| Platform | **Expo (React Native), managed workflow** — native-first | Expo SDK **54** (pinned) |
| Runtime | React / React Native | 19.1.0 / 0.81.5 |
| Language | **TypeScript, strict mode** | ~5.9.2 |
| Navigation | **Expo Router** (file-based, in `src/app/`) | ~6.0.24 |
| Backend | **Supabase** — auth, database, storage | `@supabase/supabase-js` ^2.110.0 |
| Graphics | `react-native-svg` (hand-drawn charts) | 15.12.1 |
| Icons | `@expo/vector-icons` (Ionicons) | ^15.0.2 |
| Builds | **EAS** — development / preview / production profiles | `eas.json` |

## ⚠️ The SDK 54 pin (important)

Expo SDK is **pinned to 54** to match the current App Store **Expo Go** client so the founders can test on real iPhones (project was aligned *down* from SDK 57 on 2026-07-05). **Do not upgrade the SDK without first checking the App Store Expo Go version.** Always consult the versioned docs: `https://docs.expo.dev/versions/v54.0.0/`.

SDK-54 specifics worth knowing (from repo Technical Documentation):
- Tab-bar types import from `@react-navigation/bottom-tabs` (moves to `expo-router/tabs` on SDK 55+)
- `expo-status-bar` is **not** a config plugin on SDK 54 — never add it to `plugins`
- `.npmrc` keeps `legacy-peer-deps=true`

## Deliberately not chosen (per-slice decisions)

**State-management library · component library · testing framework.** These are decided when a slice actually needs them — an explicit founder-approved position, not an oversight.

## Running the app

```bash
npm install
cp .env.example .env    # fill in values
npx expo start          # press i for iOS simulator, or scan QR with Expo Go
```

**Related:** [[Architecture]] · [[Deployment & Builds]] · [[Supabase & Database]] · [[Development Standards]]
