# Project Status

**What is this?** A snapshot of where Vita stands. Updated whenever the state of the project meaningfully changes.

**Why does it exist?** So anyone — founder, engineer, or future teammate — can understand the project in two minutes without reading the whole vault.

---

## Snapshot — 2026-07-09

**Sprint 0 — Foundation is ✅ Completed** per the official roadmap issued 2026-07-09 (see [[Roadmap]]). **Sprint 1 — Dashboard is next.**

The entire application shell exists and runs in the iOS Simulator via Expo Go — this is the code-level substrate Sprint 0 completed on top of:

- ✅ Repository scaffolded with approved architecture (`wilberdeleon/vita-app`)
- ✅ Theme tokens + reusable UI kit (15 primitives)
- ✅ Floating dock, routing shell, auth gate (mock), Supabase client architecture
- ✅ Dashboard, Fuel + full Food Log flow (8 screens), Water, Peptides, My Journey (3 tabs, hand-drawn SVG charts), Atlas work-in-progress screen, Settings shell
- ✅ Official Vita branding: brand palette, VITA mark, app icon + splash, time-of-day greeting
- ✅ Sprint 0.1 global polish: permanent domain color hierarchy, refined dock, softer shadows, subtle motion
- ✅ Vita HQ, the [[Innovation Lab]], and the [[Claude Workflow|sprint workflow]] itself — the vision/documentation half of Sprint 0

**What is real vs. mock right now:**

| Layer | State |
|---|---|
| UI / navigation | Real, complete for Sprint 0 scope |
| Data | Mock fixtures served through `api.ts` boundaries — no live data |
| Auth | Mock signed-in user; gate logic real, provider internals fake |
| Supabase | Client architecture in place; **not connected** (no migrations, no edge functions) |
| Barcode scanner | Static visual mock; real camera ships in Sprint 3 (was "Sprint 2" under the old numbering) |

## What's next

Per the [[Roadmap]]: **Sprint 1 — Dashboard**, built slice by slice (Layout → Greeting Card → Today's Summary → Health Metrics → Journey Preview → Meals Preview → Floating Navigation → Dashboard Polish) to full production quality before Sprint 2 begins. This replaces the previous "polish all five core experiences at once" framing with a strictly sequential, one-sprint-at-a-time build.

## Resolved 2026-07-09

Two decisions that were previously open tensions are now locked, following a full project review and documentation audit:
1. **Theme:** VITA supports both Light Mode and Dark Mode, built on semantic design tokens rather than hardcoded colors — not a dark-only product, not a future retheme. See [[Design Bible]], [[Decision Log]].
2. **Navigation:** Settings stays permanently in the top-right corner and is never part of the floating dock, which stays a fixed 4 items. See [[Navigation & Floating Dock]], [[Decision Log]].

Also resolved in the same audit: the repo Slice Tracker's internal contradiction (all Sprint 0 slices now consistently ✅ Approved), and `docs/04-Master-Roadmap.md` synced to this vault's roadmap.

## Known tensions still open

Tracked in [[Open Questions]]:
1. Where Water and Peptides live in the product hierarchy going forward (#4).
2. **[[Water]], [[Peptides]], and [[Settings]] still have no sprint anywhere in the official roadmap.** Settings' navigation placement is resolved (above), but its actual feature work (profile, notifications, preferences, privacy) has no scheduled path to completion. See [[Roadmap]] "Gaps worth founder attention" and [[Open Questions]] #11.

## Major reversal

**Atlas is no longer scoped as a placeholder-only V1 feature.** The new roadmap's Sprint 4 commits to a full AI coach (chat, meal planning, workout planning, health guidance, memory, recommendations) — superseding the prior "Atlas V1 is a polished placeholder only" decision. See [[Atlas]] and the [[Decision Log]].

## Sources

- Verified from code: repository `docs/06-Slice-Tracker.md`, `docs/08-Changelog.md`, git history (13 commits, latest: "Slice 0.12: Sprint 0.1 global design polish"), and direct code inspection.
- Roadmap structure: the founders' official Sprint Roadmap, issued 2026-07-09 — see [[Roadmap]]'s note that the repo's own Master Roadmap doc hasn't been updated to match yet.
- The live Slice Tracker and Changelog remain in the repo — HQ does not duplicate them.

**Related:** [[Current Sprint]] · [[Roadmap]] · [[Decision Log]] · [[Open Questions]]
