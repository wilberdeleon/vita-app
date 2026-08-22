# Project Status

**What is this?** A snapshot of where Vita stands. Updated whenever the state of the project meaningfully changes.

**Why does it exist?** So anyone — founder, engineer, or future teammate — can understand the project in two minutes without reading the whole vault.

---

## Snapshot — 2026-08-17

**Sprint 2 — Fuel is 🟢 feature-complete and in closeout** (founder-authorized 2026-08-17, branch `sprint-2-fuel`; closeout audit 2026-08-21 — CONDITIONAL PASS, merge gated on founder device QA; see [[Current Sprint]]). Everything before it is complete: Sprint 0 — Visual Foundation, Sprint 0.1 — Polish, Sprint 1 — Dashboard/Home (2026-08-02), and the App-Wide Visual Consistency Pass (2026-08-16). **The official roadmap was restructured 2026-08-17** — Fuel is now formally Sprint 2 (was 3), Journey splits into Sprints 3 and 4, and Water/Peptides and Settings finally get sprints of their own. See [[Roadmap]] and [[Decision Log]].

**Theming is app-wide.** Light, Dark, and System work across every existing screen; System follows the device appearance live. Home/Dashboard is the documented visual source of truth — see [[Design Bible]], [[Color System]], [[Decision Log]]. The pass was a design-system migration, **not** a feature sprint: no routes, tabs, sections, data, navigation, interactions, or copy changed. Detail lives in the repo's `docs/06-Slice-Tracker.md`; this page does not duplicate it.

The entire application shell exists and runs in the iOS Simulator via Expo Go — this is the code-level substrate Sprint 0 completed on top of:

- ✅ Repository scaffolded with approved architecture (`wilberdeleon/vita-app`)
- ✅ Theme tokens + reusable UI kit (18 primitives, all theme-aware)
- ✅ Floating dock, routing shell, auth gate (mock), Supabase client architecture
- ✅ Dashboard, Fuel + full Food Log flow (8 screens), Water, Peptides, My Journey (3 tabs, hand-drawn SVG charts), Atlas work-in-progress screen, Settings shell
- ✅ Official Vita branding: brand palette, VITA mark, app icon + splash, time-of-day greeting
- ✅ Sprint 0.1 global polish: permanent domain color hierarchy, refined dock, softer shadows, subtle motion
- ✅ Vita HQ, the [[Innovation Lab]], and the [[Claude Workflow|sprint workflow]] itself — the vision/documentation half of Sprint 0

**What is real vs. mock right now:**

| Layer | State |
|---|---|
| UI / navigation | Real, complete for Sprint 0 scope; Light/Dark/System theming live app-wide |
| Theme preference | Resolves correctly, but held in memory — **resets on cold restart**; persistence not implemented |
| Data | Mock fixtures served through `api.ts` boundaries — no live data |
| Auth | Mock signed-in user; gate logic real, provider internals fake |
| Supabase | Client architecture in place; **not connected** (no migrations, no edge functions) |
| Barcode scanner | ✅ Real camera scanning shipped in Sprint 2. One open upstream defect: an Open Food Facts record filed under Kroger's barcode prefix carries Hillshire Farm's product — `Not the right product?` recovery ships as the answer |

## What's next

**Sprint 2 — Fuel**, in progress. The approved architecture proves the nutrition engine — food entries, daily state, calculated totals, persistence, and one shared domain in `src/lib/nutrition/` driving both [[Fuel]] and [[Dashboard]] — before external food providers (FatSecret, USDA FoodData Central, Open Food Facts) are introduced. Real barcode scanning ships in this sprint too, on the existing Expo Go + physical iPhone workflow. Slice-level detail: [[Current Sprint]] and repo `docs/06-Slice-Tracker.md`.

## Recorded 2026-08-18 — future product direction

Founder direction captured ahead of implementation, so it survives the sprints between now and when it is built. **Nothing was implemented and no slice was opened.** Summary: a dedicated **Fuel Visual Refinement** slice late in Sprint 2 (Fuel is currently too bulky and over-reliant on large numbers — presentation only, no functional redesign) · **Sprint 5 — Water & Peptides** given a proposed six-slice breakdown, turning Water into a user-defined-goal hydration system and Peptides into an interactive tracker with a catalog, saved vial/reconstitution setup, a bidirectional units ⇄ dose calculator, injection-site logging with rotation, and history · **Sprint 8** clarified as owning the *global* motion/haptics layer, not every feature's visual debt.

Carried with it: a **binding safety boundary** for Peptides (approved medications vs. research compounds must stay clearly distinguished; not-medical-advice disclaimer required) — [[Open Questions]] #17 must resolve before that sprint. Full detail on [[Roadmap]], [[Fuel]], [[Water]], [[Peptides]], [[Design Bible]], [[Motion & Animation]] and the [[Decision Log]].

## Resolved 2026-07-09

Two decisions that were previously open tensions are now locked, following a full project review and documentation audit:
1. **Theme:** VITA supports both Light Mode and Dark Mode, built on semantic design tokens rather than hardcoded colors — not a dark-only product, not a future retheme. **Implemented app-wide as of 2026-08-16.** See [[Design Bible]], [[Decision Log]].
2. **Navigation:** Settings stays permanently in the top-right corner and is never part of the floating dock, which stays a fixed 4 items. See [[Navigation & Floating Dock]], [[Decision Log]].

Also resolved in the same audit: the repo Slice Tracker's internal contradiction (all Sprint 0 slices now consistently ✅ Approved), and `docs/04-Master-Roadmap.md` synced to this vault's roadmap.

## Known tensions still open

Tracked in [[Open Questions]]:
1. Where Water and Peptides live in the product hierarchy going forward (#4) — narrowed, not closed: both now have a sprint (Sprint 5), but their place in the primary navigation is still undecided.
2. **⚠️ New (2026-08-17): Health and Premium are no longer scheduled**, orphaning five Innovation Lab ideas that had been promoted to 📋 Planned — [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], [[Voice Atlas]] — plus [[Mobile Order Screenshot Import]]. Their status has deliberately not been reverted. See #14.
3. Release-readiness work (analytics, crash reporting, App Store prep, launch QA) has no home now that Sprint 7 — Beta is replaced by the narrower Sprint 8 — Final Polish & Animations. See #15.

**✅ Closed 2026-08-17:** Water, Peptides, and Settings having no sprint anywhere (#11) — resolved by the roadmap restructure.

## Major reversal

**Atlas is no longer scoped as a placeholder-only V1 feature.** The roadmap's Atlas sprint (Sprint 6 as of the 2026-08-17 restructure; was Sprint 4) commits to a full AI coach (chat, meal planning, workout planning, health guidance, memory, recommendations) — superseding the prior "Atlas V1 is a polished placeholder only" decision. See [[Atlas]] and the [[Decision Log]].

## Sources

- Verified from code: repository `docs/06-Slice-Tracker.md`, `docs/08-Changelog.md`, git history, and direct code inspection.
- Roadmap structure: the founders' official Sprint Roadmap as restructured 2026-08-17. The repo's own `docs/04-Master-Roadmap.md` was resynced to match the same day — both now describe the same plan.
- The live Slice Tracker and Changelog remain in the repo — HQ does not duplicate them.

**Related:** [[Current Sprint]] · [[Roadmap]] · [[Decision Log]] · [[Open Questions]]
