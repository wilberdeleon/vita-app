# My Journey

**What is this?** Vita's transformation experience (canonical module name: `journey`; dock label "Journey"). Weight, progress photos, and the [[Journey Stages]] system in one place. **"My Journey" was also the product's previous name** — the concept was strong enough to name the app before Vita, and it remains the emotional heart of the product.

**Why does it exist?** This is where "transformation over tracking" becomes literal — the screen where users *see* themselves changing. If Vita has one differentiator, it lives here.

---

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.8 as `src/features/journey/` with three tabs:

- **Overview** (`OverviewTab`) — journey summary and current stage
- **Weight** (`WeightTab`) — weight tracking with **hand-drawn SVG charts** (`LineChart`, `WeightBars` — built with `react-native-svg`, deliberately no chart library)
- **Photos** (`PhotosTab`) — progress photo history
- The canonical **8-stage system** lives in `stages.ts` — see [[Journey Stages]]
- Domain color: **green `#2E9E5B`** (journey progression); dock icon: trending-up

## Target state

**Sprint 2** of the [[Roadmap]] (renumbered from Sprint 3 under the old structure, per the official 2026-07-09 roadmap): Journey Overview, Timeline, Milestones, Achievements, Streak System, Rewards & Celebrations, Journey Detail Screen, Journey Polish — real weight tracking, weekly photos, a progress timeline, Journey Stages driven by actual consistency.

**⚠️ Streak System design note:** the Streak System slice needs deliberate design to avoid contradicting [[Core Principles]] #6 (no punishment for missing a day) and [[UX Principles]] #1 (no guilt mechanics, ever) — a naive reset-to-zero streak would violate both. Flagged in detail on [[Roadmap]].

## Future ideas

- Photo comparison / side-by-side transformation views
- Journey milestones celebrated by Atlas ([[Coaching Strategy]])
- Longevity metrics joining weight as transformation measures ([[Future Features]])

## Dependencies

- Photo storage requires [[Supabase & Database|Supabase storage]] and a privacy stance ([[Open Questions]]; trust is principle #5)
- Stage-progression logic needs a definition of "consistency" — currently mock

## Open questions

- Are the eight stages final for V1? The Product Bible says stages "will be maintained in a separate document as they evolve" — [[Journey Stages]] is that document's HQ home.
- What exactly advances a stage? (Consistency-based, per the Product Bible — but the algorithm is undefined.) **Needs Verification / founder definition.**

**Related:** [[Journey Stages]] · [[Product Philosophy]] · [[Dashboard]] · [[Future Features]]
