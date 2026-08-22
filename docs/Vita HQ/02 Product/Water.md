# Water

**What is this?** Vita's hydration tracking flow (canonical module name: `water`). A supporting flow, not a dock tab.

**Why does it exist?** Hydration is one of the simplest daily health decisions — a perfect fit for "one decision at a time." Its job is effortless logging, not analysis.

---

## Current state (verified in repo, Sprint 3 slice 3.2 — real persistence)

**Water became a real feature on 2026-08-22.** Entries persist across restarts, keyed to the local calendar day with automatic rollover; millilitres are the canonical unit with exact US customary conversion (fl oz · cups · mL · L); each entry keeps both the canonical amount and a snapshot of what the user typed, so changing display units never rewrites history; persistence sits behind a `WaterRepository` interface ready for Supabase. [[Fuel]]'s Hydration card reads the same state, so the two cannot disagree.

**No default goal exists.** A goal is unset until the user sets one, and the UI says so rather than showing progress toward a number VITA invented. The first-run goal experience is **slice 3.3**; the progress visualization and [[Dashboard]] wiring are **slice 3.4**.

Engineering detail: repo `docs/09-Technical-Documentation.md` → "Water architecture", and `docs/06-Slice-Tracker.md` → slice 3.2.

## What it was before (Sprint 0 — mock data, superseded)

Built in Slice 0.6 under `src/app/(vita)/water/`:

- **Summary** (`index.tsx`) — daily hydration log and progress
- **Add** (`add.tsx`) — quick logging in cups or ounces. *Neither screen saved anything: the unit toggle performed no conversion, and the Add button discarded what the user entered. `CupsRow` and the whole `src/features/water/` fixture layer were deleted in slice 3.2.*
- **Reached from [[Fuel]]'s Hydration card — the only entry point in the app today.** Not in the dock. *Corrected 2026-08-21:* this page previously said Water was reached from the Dashboard quick stats. It is not — Home's water tile is a read-only metric with no press handler (`QuickStatsRow`/`MetricTile` carry no `onPress`). Home currently *displays* a hydration figure from a fixture and does not navigate anywhere. Wiring Home's water tile and water goal pillar to real hydration state is **Sprint 3 slice 3.4**
- Domain color: **blue `#2F80ED`** ([[Color System]])

## Target state

**Sprint 3 — Water + Peptides** ([[Roadmap]]) — **the next sprint after Fuel.** *Moved forward by the founder roadmap reorder of 2026-08-21 (it was Sprint 5, behind both Journey sprints); the 2026-08-17 restructure had already given Water its first sprint anywhere, closing [[Open Questions]] #11.* Scope is unchanged by the move — only its position.

Water currently exists conceptually inside [[Fuel]] and is **deliberately not a Sprint 2 focus**: Sprint 2 preserves its entry points and necessary integration only, and does **not** remove it. The deep hydration work belongs to Sprint 3.

### Founder direction, 2026-08-18

The goal is to turn Water from a static counter — `5 of 8 cups` — into a small, useful, interactive hydration system. Recorded as **planned direction, not finalized specification**; details may change after design and UX review.

- **User-defined daily goal.** Users set their own target in cups, ounces, millilitres, or litres. VITA does not assume everyone wants exactly 8 cups. The goal persists until changed. Flow: *set goal → log throughout the day → see progress toward goal.*
- **Fast logging.** Quick amounts (e.g. +8 / +12 / +16 / +24 oz) plus a custom amount, following the user's own unit system. Logging should be extremely fast — this is a supporting flow, not a destination.
- **A more satisfying progress visual.** Candidates: fill level · bottle/glass visualization · circular progress · fluid animation · a clean progress bar · a daily hydration card. **Do not assume a literal animated water bottle is automatically best** — design it inside VITA's premium visual system ([[Design Bible]]).
- **Editing and removing** a logged amount where appropriate — a mis-tap should not be permanent.
- **Synchronization with [[Fuel]].** The compact Hydration module on the redesigned Fuel screen reads the same state, so the two never disagree. Sprint 3 backs that module with real data; it does **not** redesign Fuel.
- **Date-aware daily behavior.** Today's intake, daily reset / date rollover, the user's goal, progress, and history later. Full hydration analytics are **not** in scope unless explicitly planned.

Architecture note: hydration should reuse the local-calendar date model and repository boundary that Sprint 2's nutrition engine established, rather than inventing a second date model — repo `docs/09-Technical-Documentation.md` → "Future architecture considerations".

## Future ideas

- Smart daily goals (weight/activity-adjusted) — candidate Atlas insight ([[Atlas Capabilities]])
- Apple Health sync for hydration ([[Future Features]])

## Dependencies / open questions

- **Product placement:** Water is a core product area in the repo Product Bible but absent from the founder-stated primary navigation. Where it lives long-term is [[Open Questions]] #4 — narrowed by the sprint existing, but not closed, and now due sooner since it is Sprint 3.
- **Goal preference ownership.** The unit preference and the long-term daily goal plausibly belong to [[Settings]] — which is **Sprint 7, still after** Sprint 3. Whether Water owns the goal initially and Settings absorbs it later is [[Open Questions]] #16.

**Related:** [[Dashboard]] · [[Fuel]] · [[Product Overview]]
