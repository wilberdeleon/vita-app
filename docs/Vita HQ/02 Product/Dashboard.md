# Dashboard

**What is this?** Vita's home screen — the first thing users see, displayed as "Home" in the dock (canonical module name: `dashboard`).

**Why does it exist?** To answer "how is today going?" in five seconds and route users into their next healthy decision. It is where the [[Product Philosophy|three pillars]] meet: awareness (today's numbers), consistency (quick actions), transformation (Journey Stage).

---

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.4, refined in 0.11–0.12. Components live in `src/features/dashboard/`:

- **Greeting card** with the VITA mark and a time-of-day greeting (`greeting.ts` — added in Slice 0.11).
- **Daily summary / progress** (`DailyProgressCard` primitive) — calories and macros for today.
- **Quick stats row** (`QuickStatsRow`) — at-a-glance stats including water (entry point to the [[Water]] flow).
- **Journey card** (`JourneyCard`) — current [[Journey Stages|Journey Stage]] surface.
- **Meals** with per-meal icons (`mealIcons.ts`).
- Data is mock: fixtures in `mock.ts` served through `api.ts`.

## Target state

**Sprint 1** of the [[Roadmap]] (next up, per the official 2026-07-09 roadmap) — eight slices: Layout, Greeting Card, Today's Summary, Health Metrics, Journey Preview, Meals Preview, Floating Navigation, Dashboard Polish. This elevates the existing mock components above (GreetingCard, DailyProgressCard, QuickStatsRow, JourneyCard) to production quality rather than building from zero — live data once [[Supabase & Database|Supabase]] connects. Founder priority right now: **Dashboard polish** under the [[Design Bible|premium glass direction]].

## Future ideas

- Longevity signals on the dashboard (Health Age at a glance) — see [[Future Features]]
- Atlas nudges/insights surfaced contextually — see [[Coaching Strategy]]
- A Home Screen widget suite extending Dashboard's glanceability outside the app entirely — [[Apple Home Screen Widgets]]

## Dependencies

- Semantic token / Design System authoring so the decided Light + Dark theme (resolved 2026-07-09, see [[Design Bible]]) can be implemented, before deep visual polish
- Live data model for daily summaries ([[Supabase & Database]])

## Open questions

- Which quick actions earn a place on Home? (Water and Peptides currently depend on it for discovery — [[Open Questions]] #4.)

**Related:** [[Product Overview]] · [[Fuel]] · [[My Journey]] · [[Navigation & Floating Dock]]
