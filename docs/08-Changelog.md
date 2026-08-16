# VITA — Changelog

Single source of truth for release history and completed work.

---

## Unreleased

- 2026-08-16 — **App-Wide Visual Consistency Pass:** Light/Dark/System theming extended from Home to every existing screen (Fuel + sub-routes, Journey, Atlas, Settings, Water, Peptides, sign-in). Shared primitives now resolve surfaces through `useTheme()` instead of the light-only `palette`; added the `surfaces.track` token; cards gained a hairline border in both themes; fixed pastel domain fills became low-opacity tints of their domain color. Home/Dashboard established as the documented visual source of truth. **No functionality, routing, data, or copy changed** — a design-system migration, not a feature pass. Founder-approved in Expo Go on device.

- 2026-08-02 — Sprint 1 Dashboard/Home: real Light/Dark/System theme system (`ThemeProvider`, `useTheme()`) replacing the light-only stub, with Settings → Appearance as a working picker; clean card-based Home redesign replacing the abandoned "Mountain World" photo-background concept; 8-stage journey system shared via `src/lib/journeyStages.ts`; Today's Summary simplified to one primary metric; Journey and Macros split into separate cards; final audit removing dead code from the redesign's iterations. (Sprint 1, all slices)

- 2026-07-05 — Sprint 0.1 Global Design Polish: permanent domain color hierarchy (orange=Fuel, blue=Water, purple=Atlas, green=Journey, neutral=structure), sleeker floating dock (shorter, higher, more margin), VITA logo +27%, softer Apple-style shadows, stronger title typography, subtle motion (tab fade, press scale, animated progress bars). No functionality changes. (Slice 0.12)

- 2026-07-05 — Expo Go compatibility: project aligned from SDK 57 to SDK 54 (the version the current App Store Expo Go supports) so founders can test on real iPhones. No UI, branding, or architecture changes. Verified running in Expo Go 54 in the simulator.

- 2026-07-05 — Official VITA branding: brand palette (ink/sage/cream/paper/gold) in tokens, VITA mark on Home header and sign-in, app icon + splash + Android adaptive assets generated from the approved logo, time-of-day greeting on the Dashboard. (Slice 0.11)

- 2026-07-05 — Sprint 0 Visual Foundation: theme tokens + UI kit, floating dock and navigation shell, auth/Supabase architecture (mock, not connected), Dashboard, Fuel + full Food Log flow, Water flow, Peptide flow, My Journey (Overview/Weight/Photos with hand-drawn SVG charts), Atlas Work-in-Progress, Settings shell. All screens verified in the iOS Simulator. (Slices 0.2–0.10)
- 2026-07-05 — Repository scaffolded: approved architecture, Expo SDK 57 + TypeScript + Expo Router, documentation structure, Supabase folders. (Slice 0.1)
