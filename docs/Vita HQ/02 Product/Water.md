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

**⚠️ No sprint currently.** The official roadmap issued 2026-07-09 replaced the old sprint structure (which had Water as Sprint 4) and doesn't name Water anywhere in the new eight-sprint plan. Target state — daily goal, quick logging, history, progress, live via [[Supabase & Database|Supabase]] — is still the intended direction, just without a scheduled home. Flagged on [[Roadmap]] as a gap needing founder attention.

## Future ideas

- Smart daily goals (weight/activity-adjusted) — candidate Atlas insight ([[Atlas Capabilities]])
- Apple Health sync for hydration ([[Future Features]])

## Dependencies / open questions

- **Product placement:** Water is a core product area in the repo Product Bible but absent from the founder-stated primary navigation. Where it lives long-term is [[Open Questions]] #4.
- Unit preference (cups/oz/ml) belongs in [[Settings]].

**Related:** [[Dashboard]] · [[Fuel]] · [[Product Overview]]
