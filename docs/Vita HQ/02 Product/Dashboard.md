# Dashboard

**What is this?** Vita's home screen — the first thing users see, displayed as "Home" in the dock (canonical module name: `dashboard`).

**Why does it exist?** To answer "how is today going?" in five seconds and route users into their next healthy decision. It is where the [[Product Philosophy|three pillars]] meet: awareness (today's numbers), consistency (quick actions), transformation (Journey Stage).

---

## Sprint 5 slice 5.3 — the Dashboard identity redesign (2026-09-03, awaiting founder device review)

**Home became a daily control surface rather than a report.** It opens with a time-aware greeting and the date, then three domains you can act on, then a quiet route to Tools.

**Everything shown is real.** The old Home displayed steps, sleep, workouts, a streak, a Journey stage and two of its four "goal pillars" from a fixture file — plausible numbers rendered to every user forever. All of it is gone. Water, Fuel and Peptides now read the features' own engines, so Home cannot disagree with them and updates the moment you come back from logging something. Where a domain has nothing real to say, Home says so plainly instead of filling the space.

**Both slogans are gone.** *Build with intention.* was the largest type in the app and said nothing about anyone's day; *Your day, your direction.* sat under it. Neither was replaced. The greeting stays, and stays time-aware.

**Three domains, three shapes** — Water a ring, Peptides a tally of today's marks, Fuel a bar. A person should be able to tell them apart without reading a word, which five identical metric tiles made impossible.

**Tools is discoverable from Home for the first time**, as one quiet row naming the two tools that exist. Home is not a launcher and did not become one.

**Peptides wording on Home follows the feature's own rules**: scheduled rather than due, an unanswered day stays unanswered, and nothing is scored.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.3.

## Current state (verified in repo, Sprint 0 — mock data)

Built in Slice 0.4, refined in 0.11–0.12. Components live in `src/features/dashboard/`:

- **Greeting card** with the VITA mark and a time-of-day greeting (`greeting.ts` — added in Slice 0.11).
- **Daily summary / progress** (`DailyProgressCard` primitive) — calories and macros for today.
- **Quick stats row** (`QuickStatsRow`) — at-a-glance stats including water (entry point to the [[Water]] flow).
- **Journey card** (`JourneyCard`) — current [[Journey Stages|Journey Stage]] surface.
- **Meals** with per-meal icons (`mealIcons.ts`).
- Data is mock: fixtures in `mock.ts` served through `api.ts`.

## Target state

**Sprint 1** of the [[Roadmap]] — ✅ **complete (2026-08-02)**; see [[Current Sprint]] and repo `docs/06-Slice-Tracker.md` for what actually shipped. As originally planned, eight slices: Layout, Greeting Card, Today's Summary, Health Metrics, Journey Preview, Meals Preview, Floating Navigation, Dashboard Polish. This elevates the existing mock components above (GreetingCard, DailyProgressCard, QuickStatsRow, JourneyCard) to production quality rather than building from zero — live data once [[Supabase & Database|Supabase]] connects. Founder priority right now: **Dashboard polish** under the [[Design Bible|premium glass direction]].

## Sprint 5 direction — VITA Identity & Interaction (founder direction, 2026-09-01)

**⚠️ Direction, not implementation authorization.** Slice 5.2 — Dashboard Identity Redesign is **draft** and needs founder approval plus a Sprint 5 architecture audit. Nothing below is built. Full brief: repo `docs/Sprint-5-Identity-Brief.md`.

**Keep:** the time-aware greeting — *Good morning, Wilber* · *Good afternoon, Wilber* · *Good evening, Wilber* · *Good night, Wilber*.

**Remove future reliance on:** *"Build with intention."* and *"Your day, your direction."* Both are considered generic wellness-marketing filler. **Do not automatically replace them with another slogan.** Prefer useful contextual information — the date · doses due · hydration state · goals remaining · meaningful current-day state.

**Dashboard should become** more action-oriented and less analytics-report-like; visually recognizable; **modular without becoming a generic symmetrical grid.**

- Potential primary modules: [[Fuel]] · [[Water]] · [[Peptides]] · [[My Journey|Journey]] · Tools
- Potential smaller utility modules: [[Peptide Dose Calculator|Peptide Calculator]] · [[Injection Site Tracking|Injection Sites]] · [[Food & Product Scanner|Food Scanner]] · [[Research Library|Reference]]

**Historical design note, recorded deliberately.** The founder's older Dashboard concept is **not** the visual target. It did succeed at one thing this sprint must recover: different destinations were **immediately recognizable**. Sprint 5 should recover that recognizability while keeping VITA's current sophistication. **This is not an instruction to recreate the old grid.**

**Tools discoverability from Home** ([[Tools Discoverability from Dashboard]]) is live again as a question and is still not decided; no Dashboard card is authorized. Home is not a launcher.

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
