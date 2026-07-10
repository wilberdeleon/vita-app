# Peptides

**What is this?** Vita's optional peptide/medication tracking flow (canonical module name: `peptides`). Explicitly **optional** — most users will never open it, and that's by design.

**Why does it exist?** The Product Bible names GLP-1 users and peptide trackers among Vita's users. For them, dose tracking is a real, underserved need — and serving it well signals that Vita meets people where their health journey actually is, without cluttering everyone else's experience.

---

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.7 under `src/app/(vita)/peptides/`:

- **Summary** (`index.tsx`) — log overview
- **Add** (`add.tsx`) — dose logging
- **Examples** (`examples.tsx`) — reference examples
- Feature module `src/features/peptides/` (types, mock, api boundary)
- Domain color: **purple `#7C3AED`** — shared with Atlas per the approved UI reference
- Stack screens above the tabs; not in the dock

## Target state

**⚠️ No sprint currently.** The official roadmap issued 2026-07-09 replaced the old sprint structure (which had Peptides as Sprint 5) and doesn't name Peptides anywhere in the new eight-sprint plan (Sprint 5 is now "Health," with different content — see [[Roadmap]]). Target state — medication logging, dose history, scheduling, reminders — is still the intended direction, just without a scheduled home. Flagged on [[Roadmap]] as a gap needing founder attention.

## Future ideas

- Reminders tied to schedules (Sprint 5 scope)
- Correlating doses with weight/journey trends — sensitive; needs a careful, trust-first design

## Dependencies / open questions

- **Placement:** same question as [[Water]] — core area in the Product Bible, absent from primary navigation ([[Open Questions]] #4).
- **Purple is shared with Atlas.** Fine while peptides is a quiet flow; revisit if either grows ([[Color System]]).
- **Health-data sensitivity:** medication data is among the most sensitive data Vita will hold. Storage, encryption, and disclosure posture must be decided before live data ships ([[Supabase & Database]]).

**Related:** [[Product Overview]] · [[Settings]] · [[Future Features]]
