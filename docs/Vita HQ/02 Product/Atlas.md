# Atlas

**What is this?** Atlas is Vita's AI coach — an **intelligent health strategist** with its own tab in the primary navigation (canonical module name: `atlas`).

**Why does it exist?** Information doesn't keep people healthy; guidance and accountability do. Atlas is Vita's long-term answer to "why do people stay?" — the layer that turns tracked data into coaching.

> This page covers Atlas **as a product area**. Atlas's character lives in [[Atlas Personality]]; what it will be able to do lives in [[Atlas Capabilities]]; how it coaches lives in [[Coaching Strategy]].

---

## Current state (verified in repo, Sprint 0)

**Still a placeholder today** — this hasn't changed with the roadmap update below, only the *plan* for what comes next has. Built in Slice 0.9 (`src/app/(vita)/(tabs)/atlas.tsx`):

- Purple orb with a sparkles icon, "WORK IN PROGRESS" label
- Copy: *"Atlas is being built to be your ultimate AI Health Coach."* — "Coming soon."
- Domain color: **purple `#7C3AED`** (shared with peptides per the approved UI reference); dock icon: planet
- `src/features/atlas/` exists but is empty — no AI code anywhere in the repo

## Target state — ⚠️ scope reversed 2026-07-09

**Sprint 4** of the [[Roadmap]] (renumbered from Sprint 6 under the old structure): Atlas Home, Chat Experience, **Meal Planning** ([[Meal Planning]], promoted to 📋 Planned), **Workout Planning** ([[Workout Generation]], promoted to 📋 Planned), Health Guidance, Memory & Context, Recommendations, Atlas Polish.

This **directly reverses** the prior locked decision — "Atlas V1 is a polished placeholder only. Do not implement AI coaching yet" (repo Master Roadmap Sprint 6 scope decision, logged in the [[Decision Log]]). The new official roadmap commits to a full AI health coach as part of the core Sprint plan, not a post-V1 stretch goal. See the [[Decision Log]] for the superseding entry.

**Voice Atlas** ([[Voice Atlas]], promoted to 📋 Planned) lands later, in **Sprint 6 — Premium**, consistent with it being sequenced last in [[Atlas Capabilities]]'s recommendation (voice amplifies whatever coaching quality already exists, so text has to be proven first).

## Future ideas

- Atlas presence across the app (Dashboard nudges, Journey milestone commentary) rather than only a tab
- [[Advanced Coaching (Proactive Check-Ins)]] — not explicitly named in Sprint 4, but adjacent to its Recommendations slice and Sprint 6's Smart Notifications slice

## Dependencies

- Model/provider selection, prompt architecture, and cost model — **Needs Verification**, nothing chosen yet ([[Future AI]])
- Real user data (Sprints 1–3 now, under the new numbering) — Atlas without data is a chatbot, not a strategist

## Open questions

- Does the `planet` dock icon survive the space-aesthetic removal decision? ([[Open Questions]] #8)
- The scope reversal itself is now committed at the roadmap level, but the underlying [[Future AI]] engineering decisions (model, cost, privacy) remain entirely unresolved — the roadmap names *what* ships in Sprint 4, not *how*.

**Related:** [[Atlas Personality]] · [[Atlas Capabilities]] · [[Coaching Strategy]] · [[Prompt Library]]
