# Deployment & Builds

**What is this?** How Vita gets onto devices — development testing today, store builds later.

**Why does it exist?** So the path from code to a founder's iPhone (and eventually the App Store) is documented once.

*Verified 2026-07-06 from `eas.json`, `app.json`, and the repo Changelog.*

---

## Current state

- **Founder testing happens in Expo Go** on real iPhones (and the iOS Simulator) — this is why the SDK is pinned to 54 ([[Tech Stack]]).
- **EAS is configured** with three profiles in `eas.json`: `development`, `preview`, `production`. No EAS build has been documented as run yet — **Needs Verification** whether any build exists on Expo's servers.
- **Git:** GitHub is the single source of truth for code; permanent repo `wilberdeleon/vita-app` (remote `origin/main` verified). Every meaningful change is committed with a meaningful message; avoid committing unfinished work.
- App identity for stores is set in `app.json`: name VITA, portrait, iOS tablet-supported, Android adaptive icons generated from the brand mark.

## Target state

- **Development builds** via EAS when the app outgrows Expo Go (first forcing function: the real barcode scanner in **Sprint 3** — [[Fuel]], renumbered from Sprint 2 under the old structure — may need camera modules beyond Expo Go's defaults — verify at planning).
- **TestFlight** distribution for founder/beta testing.
- **App Store release** at Version 1 ([[Roadmap]]) — requires an Apple Developer account, bundle identifier decision, privacy nutrition labels (health data!), and account-deletion support ([[Authentication]]).

## Not yet decided / Needs Verification

- Apple Developer account status; Google Play intentions and timing
- Bundle identifier (none set in `app.json` yet)
- CI (automated checks on push) — nothing configured; worth considering once tests exist ([[Development Standards]])

**Related:** [[Tech Stack]] · [[Launch Plan]] · [[Claude Workflow]]
