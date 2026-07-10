# Settings

**What is this?** Vita's profile and preferences area (canonical module name: `settings`). Part of the primary navigation per founder direction.

**Why does it exist?** Health is personal — Settings is where users control their experience and their data. Trust ([[Core Principles]] #5) is largely won or lost here.

---

## Current state (verified in repo, Sprint 0 — shell only)

Built in Slice 0.9 as a **settings shell**: `src/app/(vita)/settings/index.tsx`, opened from the header gear (not the dock). `src/features/settings/` exists but is empty — no real preference logic yet.

## Navigation placement (resolved, 2026-07-09)

Settings' placement is **permanently locked**: top-right corner icon, present on every screen, not a dock tab ([[Navigation & Floating Dock]], [[Decision Log]]). This was the last open piece of the 2026-07-06 five-item navigation decision — it's now fully settled.

## Target state

**⚠️ Still no sprint — the remaining concerning gap in the roadmap.** The official roadmap issued 2026-07-09 replaced the old sprint structure (which had Settings as Sprint 7) and doesn't name Settings anywhere in the new eight-sprint plan (Sprint 7 is now "Beta" — QA/launch prep, not feature work — see [[Roadmap]]). Settings today is only an empty shell, with no scheduled path to completion — this part of the gap is unresolved and separate from the (now-settled) navigation-placement question above. Target state — profile, notifications, preferences, units, appearance, privacy — is still the intended direction. Flagged prominently on [[Roadmap]] as a gap needing founder attention.

## Future ideas

- Appearance controls for the Light/Dark theme system (now decided — see [[Design Bible]])
- Data export and deletion — trust features worth shipping before anyone asks
- Apple Health permissions once integration lands ([[Future Features]])

## Dependencies

- Real [[Authentication]] (profile is mock until then)
- A theme toggle control depends on the semantic token / Design System work landing first

## Open questions

- What units/preferences matter for V1? (Weight units at minimum — journey charts depend on it.)

**Related:** [[Product Overview]] · [[Authentication]] · [[Navigation & Floating Dock]]
