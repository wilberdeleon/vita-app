# Product Overview

**What is this?** The map of Vita's product surface — the core experiences, how users move between them, and what exists today versus where each is headed.

**Why does it exist?** So the product's shape is understandable at a glance, and each area's page can stay focused on its own details.

---

## The core experiences

Primary navigation (founder decision, 2026-07-06): **Dashboard · Fuel · My Journey · Atlas · Settings**. Lab does not exist as a primary section.

| Area | One-line job | Page |
|---|---|---|
| Dashboard | Today at a glance: greeting, daily summary, quick actions | [[Dashboard]] |
| Fuel | Nutrition — logging food without friction | [[Fuel]] |
| My Journey | Transformation — weight, photos, stages; the emotional heart | [[My Journey]] |
| Atlas | The AI health strategist (V1: polished placeholder) | [[Atlas]] |
| Settings | Profile, preferences, privacy | [[Settings]] |

Supporting flows (built, reached from Dashboard/quick actions rather than the dock): [[Water]] and [[Peptides]]. Their long-term placement is an [[Open Questions|open question]].

## Navigation as implemented (verified 2026-07-06; Settings placement locked 2026-07-09)

- Auth gate at the root: signed-out → sign-in screen; signed-in → the app (auth is mock today — [[Authentication]]).
- **Floating dock** with four tabs, permanently: Home (dashboard), Fuel, Journey, Atlas — [[Navigation & Floating Dock]].
- **Settings is permanently in the top-right corner** (header icon on every screen), by design — not a dock tab, not a temporary gap ([[Decision Log]]).
- Water, Peptides, and the Food Log flow are stack screens above the tabs, reached from Dashboard/quick actions.
- Canonical module names in code and docs: `dashboard`, `fuel`, `journey`, `water`, `peptides`, `atlas`, `settings`. UI labels may differ — dashboard displays as "Home."

## Current state (Sprint 0)

Every screen exists and runs with **realistic mock data** served through each feature's `api.ts` boundary. No live data, no real auth, Supabase not yet connected. See [[Project Status]] for the full real-vs-mock table.

## Target state

Each core experience becomes live and polished sprint by sprint per the [[Roadmap]], under the premium design direction in the [[Design Bible]]. Beyond V1, the product grows toward longevity: [[Future Features|Health Age, Biomarker Age, Longevity Dashboard]].

## Dependencies

- Semantic token / Design System authoring so the decided Light + Dark theme model ([[Design Bible]]) can actually be built
- Supabase provisioning before any live-data sprint — [[Supabase & Database]]

**Related:** [[Product Philosophy]] · [[Journey Stages]] · [[Roadmap]]
