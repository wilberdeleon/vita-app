# Journey Stages

**What is this?** The canonical 8-stage system that turns progress into a narrative. Each stage represents personal growth — not perfection.

**Why does it exist?** Stages are Vita's answer to streaks and guilt mechanics. Progress is defined by **consistency, not weight alone**, so a setback never erases who the user is becoming. This is the retention engine that aligns with the mission instead of fighting it.

*Source: verified from `src/features/journey/stages.ts` (the code is the source of truth for stage names and taglines).*

---

## The eight stages

| # | Stage | Tagline | Icon |
|---|---|---|---|
| 1 | **Foundation** | "You've decided to start something better." | layers |
| 2 | **Focus** | "You're directing your energy with intention." | aperture |
| 3 | **Growth** | "Small actions today create real change." | leaf |
| 4 | **Momentum** | "You're building consistency and seeing results." | play-forward |
| 5 | **Balance** | "You're aligning your body, mind, and lifestyle." | infinite |
| 6 | **Thrive** | "You're thriving—energy, confidence, clarity." | sunny |
| 7 | **Mastery** | "Discipline is your default. Excellence is your standard." | flag |
| 8 | **Legacy** | "You've built a life that inspires and lasts." | trophy |

## Current state

Stages are implemented as static data and displayed on the [[Dashboard]] (JourneyCard) and in [[My Journey]]. No progression logic exists yet — the user's stage is mock.

## Target state

Stage progression driven by real consistency data (**Sprint 2** of the [[Roadmap]], renumbered from Sprint 3 under the old structure — per the official 2026-07-09 roadmap). The rules must embody the promise: advancing feels earned, and missing days never feels punished.

**⚠️ Direct tension with the new Streak System slice.** Sprint 2 also includes a "Streak System" slice (see [[Roadmap]]). This page's own opening line calls Stages "Vita's answer to streaks and guilt mechanics" — the two need to be designed as complements (e.g., a streak that measures the same forgiving, non-punishing consistency Stages already track), not as a second, competing progress metric that reintroduces the guilt mechanic Stages were built to avoid.

## Open questions

- **The progression algorithm is undefined.** What combination of logging consistency, check-ins, and milestones advances a stage? Can users move backward? (Recommendation: no — regression contradicts "progress over perfection.") *Owner: founders + Claude at Sprint 2.*
- Are names/taglines final for V1? ([[Open Questions]] #5)
- How does the new Streak System slice relate to stage progression — one signal or two? *Owner: founders, before Sprint 2 starts.*

**Related:** [[My Journey]] · [[Product Philosophy]] · [[Coaching Strategy]]
