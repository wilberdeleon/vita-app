# Water

**What is this?** Vita's hydration tracking flow (canonical module name: `water`). A supporting flow, not a dock tab.

**Why does it exist?** Hydration is one of the simplest daily health decisions — a perfect fit for "one decision at a time." Its job is effortless logging, not analysis.

---

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.6 under `src/app/(vita)/water/`:

- **Summary** (`index.tsx`) — daily hydration log and progress
- **Add** (`add.tsx`) — quick logging in cups or ounces (`CupsRow` component in `src/features/water/`)
- Reached from the [[Dashboard]] quick stats, not the dock
- Domain color: **blue `#2F80ED`** ([[Color System]])

## Target state

**Sprint 5 — Water & Peptides** ([[Roadmap]]). *Corrects the earlier note here that Water had no sprint anywhere — that was true under the 2026-07-09 plan and was resolved by the 2026-08-17 restructure ([[Open Questions]] #11, closed).*

Water currently exists conceptually inside [[Fuel]] and is **deliberately not a Sprint 2 focus**: Sprint 2 preserves its entry points and necessary integration only, and does **not** remove it. The deep hydration work belongs to Sprint 5.

### Founder direction, 2026-08-18

The goal is to turn Water from a static counter — `5 of 8 cups` — into a small, useful, interactive hydration system. Recorded as **planned direction, not finalized specification**; details may change after design and UX review.

- **User-defined daily goal.** Users set their own target in cups, ounces, millilitres, or litres. VITA does not assume everyone wants exactly 8 cups. The goal persists until changed. Flow: *set goal → log throughout the day → see progress toward goal.*
- **Fast logging.** Quick amounts (e.g. +8 / +12 / +16 / +24 oz) plus a custom amount, following the user's own unit system. Logging should be extremely fast — this is a supporting flow, not a destination.
- **A more satisfying progress visual.** Candidates: fill level · bottle/glass visualization · circular progress · fluid animation · a clean progress bar · a daily hydration card. **Do not assume a literal animated water bottle is automatically best** — design it inside VITA's premium visual system ([[Design Bible]]).
- **Date-aware daily behavior.** Today's intake, daily reset / date rollover, the user's goal, progress, and history later. Full hydration analytics are **not** in scope unless explicitly planned.

Architecture note: hydration should reuse the local-calendar date model and repository boundary that Sprint 2's nutrition engine established, rather than inventing a second date model — repo `docs/09-Technical-Documentation.md` → "Future architecture considerations".

## Future ideas

- Smart daily goals (weight/activity-adjusted) — candidate Atlas insight ([[Atlas Capabilities]])
- Apple Health sync for hydration ([[Future Features]])

## Dependencies / open questions

- **Product placement:** Water is a core product area in the repo Product Bible but absent from the founder-stated primary navigation. Where it lives long-term is [[Open Questions]] #4 — narrowed by Sprint 5 existing, but not closed.
- **Goal preference ownership.** The unit preference and the long-term daily goal plausibly belong to [[Settings]] — which is **Sprint 7, after** Sprint 5. Whether Water owns the goal initially and Settings absorbs it later is [[Open Questions]] #16.

**Related:** [[Dashboard]] · [[Fuel]] · [[Product Overview]]
