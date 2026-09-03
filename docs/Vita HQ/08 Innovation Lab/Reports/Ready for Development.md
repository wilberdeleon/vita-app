# Report: Ready for Development

**Snapshot as of:** 2026-07-09 · **Sprint column reconciled 2026-08-21** to the current roadmap (2026-08-17 restructure + 2026-08-21 reorder) · **Regenerate:** ask Claude to refresh whenever an idea's status or dependencies change.

**Method:** ideas at 📋 Planned or later, OR at 📝 Defined with no blocking dependency left unresolved. This is the report to check before starting a new [[Roadmap]] sprint or session-sprint ([[Claude Workflow]]).

---

## Currently 📋 Planned — 8 ideas, promoted 2026-07-09

The official [[Roadmap]] issued 2026-07-09 named these directly, promoting them from the Innovation Lab:

| Idea | Sprint (current numbering) | Readiness | Confidence |
|---|---|---|---|
| [[Meal Planning]] | **Sprint 8 — Atlas**, Slice 3 | 🟢 Concept Complete | 7.5/10 |
| [[Workout Generation]] | **Sprint 8 — Atlas**, Slice 4 | 🟡 Needs Refinement (tracking-module scope open) | 6/10 |
| [[Apple Health Integration]] | ⚠️ none — was Health, Slice 5 | 🟢 Concept Complete | 8.5/10 |
| [[Mobile Order Screenshot Import]] | ⚠️ none — deferred out of Sprint 2 — Fuel | 🟢 Concept Complete | 8.5/10 |
| [[Apple Home Screen Widgets]] | ⚠️ none — was Premium, Slices 1–2 | 🟢 Concept Complete | 8/10 |
| [[Health Age]] | ⚠️ none — was Health, Slice 3 | 🟡 Needs Refinement (scoring model undefined) | 6.5/10 |
| [[Biomarker Age]] | ⚠️ none — was Health, Slice 4 | 🟡 Needs Refinement (sequenced after Health Age) | 5.5/10 |
| [[Voice Atlas]] | ⚠️ none — was Premium, Slice 5 | 🟡 Needs Refinement (voice infra unexplored) | 5/10 |

**⚠️ Six of these eight have no scheduled sprint.** The 2026-08-17 restructure dropped Health and Premium, and Screenshot Food Analysis was deferred out of Sprint 2's approved scope. Their 📋 Planned status is deliberately preserved rather than reverted — [[Open Questions]] #14, awaiting founder direction.

**Named in the current roadmap but living outside this table:** [[Peptide Dose Calculator]] (proposed slice 3.7) and [[Injection Site Tracking]] (proposed slice 3.8) were both scoped into **Sprint 3 — Water + Peptides** and are built there (slices 3.6 and 3.8–3.8C). **Sprint 4 — Settings + Tools & Reference** carries them forward into a coherent Tools destination rather than rebuilding them.

**Honest read:** "Planned" means the roadmap named it, not that it's implementation-ready today — every one of these still depends on live data (Vita is still on mock data per [[Project Status]]), and four of the eight (marked 🟡) have real unresolved gaps even after promotion. Apple Health Integration and Mobile Order Screenshot Import are the closest to genuinely ready.

## 📝 Defined with dependencies not yet met

Everything else in the Lab, still blocked on live data, an unresolved open question, or a preceding idea shipping first:

| Idea | Blocking dependency |
|---|---|
| [[Longevity Dashboard]] | Needs both Health Age and Biomarker Age to ship first |
| [[Advanced Coaching (Proactive Check-Ins)]] | Needs live usage data + push notification infrastructure; not yet named in a sprint |
| [[AI Meal Photo Recognition]] | Portion-estimation accuracy ceiling; not yet named in a sprint |
| [[Smart Fridge Scanner]] | No app placement decided; not yet named in a sprint |

**Related:** [[Innovation Lab]] · [[Open Questions]] · [[Roadmap]] · [[Decision Log]]
