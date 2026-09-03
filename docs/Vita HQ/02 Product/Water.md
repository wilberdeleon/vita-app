# Water

**What is this?** Vita's hydration tracking flow (canonical module name: `water`). A supporting flow, not a dock tab.

**Why does it exist?** Hydration is one of the simplest daily health decisions — a perfect fit for "one decision at a time." Its job is effortless logging, not analysis.

---

## Current state (verified in repo, Sprint 3 slice 3.2 — real persistence)

**Water became a real feature on 2026-08-22.** Entries persist across restarts, keyed to the local calendar day with automatic rollover; millilitres are the canonical unit with exact US customary conversion (fl oz · cups · mL · L); each entry keeps both the canonical amount and a snapshot of what the user typed, so changing display units never rewrites history; persistence sits behind a `WaterRepository` interface ready for Supabase. [[Fuel]]'s Hydration card reads the same state, so the two cannot disagree.

**No default goal exists.** A goal is unset until the user sets one, and the UI says so rather than showing progress toward a number VITA invented. **Logging is never gated on the goal** — a user may log for a week and decide their target afterwards.

**Slice 3.3 (2026-08-23) completed the workflow:** set a goal, change it, pick a display unit, quick-add or enter a custom amount, edit a logged drink, delete one with Undo. **A display preference and an entry's unit are separate concepts** (founder decision, 2026-08-22) — logging 500 mL while your preference is fl oz records 500 mL and leaves the preference alone, and changing the preference never rewrites what a past entry says. Today's log shows each drink in the unit it was entered in.

**Slice 3.4 (2026-08-23) finished the Water experience for this sprint.** Today's hydration is shown as a **water level** — the summary panel fills from the bottom as the day progresses, an abstract surface rather than a drawn container, because a bottle or eight cups imply a fixed capacity when the user's goal is whatever they set. One number, one line of context, one restrained goal control. Motion is a short ease on the fill, and **Reduced Motion lands on the value directly**.

A compact **seven-day strip** gives light context. It shows **daily volume, not goal attainment** — VITA stores one *current* goal and does not snapshot what it was on any past day, so marking a past day met or missed would be inventing history it never recorded. No averages, streaks, trends, or interpretation.

**[[Dashboard|Home]] now reads the same state**: the Health Metrics Water tile shows the day's real total in the user's unit and opens Water when tapped, and the Water goal pillar completes only when a real goal is actually reached. **No Water fixture data remains anywhere in VITA** — the `5 / 8` Home displayed to every user forever is gone, along with the whole Sprint 0 mock layer.

[[Water]], [[Fuel]], and [[Dashboard]] now read one source of truth. Water is **feature-complete for Sprint 3**, pending the sprint audit in slice 3.10 — which is a statement about this sprint's scope, not a promise that Water never gets refined again.

Engineering detail: repo `docs/09-Technical-Documentation.md` → "Water architecture", and `docs/06-Slice-Tracker.md` → slice 3.2.

## Sprint 5 slice 5.2 — the interactive Water experience (2026-09-03, awaiting founder device review)

**Water is the first production feature rebuilt in the Sprint 5 identity.** The presentation and the logging interaction changed; the hydration engine did not. Millilitres are still canonical, entries still snapshot what the user typed, the goal is still stored as the pair they authored, and there is still no default goal.

**The screen.** A hydration vessel holds the top of the screen, direct on the background — no card anywhere. It shows **percentage of the user's chosen goal**, never a literal container capacity, and carries no measurement markings. One display-size figure: the percentage, or the day's total when no goal exists. Below it a neutral *Add Water* action, seven days of context, and today's drinks collapsed behind a one-line summary.

**Logging is a sheet, not a screen.** Tap *Add Water* → four quick amounts → the drink is recorded → the vessel rises → a confirmation haptic. The old `/water/add` route is gone. Editing an existing drink still opens its own screen: adding should be fast, amending deliberate.

**Quick amounts adapt to the unit you are logging in** — 8/12/16/24 oz · ½/1/1½/2 cups · 250/500/750/1000 mL · ¼/½/1/1½ L. Amounts people actually say, rather than one set converted into awkward decimals.

**Two unit ideas, kept apart.** Your **display preference** is what Water renders in and lives in Settings → Units. The **logging unit** belongs to one drink: switch it in the sheet to log 500 mL while your preference stays fluid ounces, and Water keeps showing fluid ounces afterwards. History keeps what you typed, forever.

**No goal is still an honest state.** The vessel goes latent, the day's real total shows, and there is no percentage and no empty-vessel-at-zero implying a target was missed.

**History still shows volume, not goal attainment** — VITA never snapshotted past goals, so marking a past day met or missed would be inventing history. No score, streak, average or judgement.

Engineering detail: repo `docs/06-Slice-Tracker.md` → slice 5.2.

## What it was before (Sprint 0 — mock data, superseded)

Built in Slice 0.6 under `src/app/(vita)/water/`:

- **Summary** (`index.tsx`) — daily hydration log and progress
- **Add** (`add.tsx`) — quick logging in cups or ounces. *Neither screen saved anything: the unit toggle performed no conversion, and the Add button discarded what the user entered. `CupsRow` and the whole `src/features/water/` fixture layer were deleted in slice 3.2.*
- **Reached from [[Fuel]]'s Hydration card — the only entry point in the app today.** Not in the dock. *Corrected 2026-08-21:* this page previously said Water was reached from the Dashboard quick stats. It is not — Home's water tile is a read-only metric with no press handler (`QuickStatsRow`/`MetricTile` carry no `onPress`). Home currently *displays* a hydration figure from a fixture and does not navigate anywhere. *Closed in slice 3.4 (2026-08-23):* Home's Water tile and goal pillar now read real hydration state, and the tile **does** open Water — so the original claim is true again, for the first time, by implementation rather than by documentation
- Domain color: **blue `#2F80ED`** ([[Color System]])

## Target state

**Sprint 3 — Water + Peptides** ([[Roadmap]]) — **✅ complete and merged into `main` 2026-09-01** (`2bac43b`). *(This line read "the current sprint, feature-complete and in final audit / closeout" until the 2026-09-01 roadmap alignment; it was stale.)* **Sprint 4 — Settings + Tools Foundation is also complete, and Sprint 5 — VITA Identity & Interaction is next** — see the Sprint 5 direction section below. *Moved forward by the founder roadmap reorder of 2026-08-21 (it was Sprint 5, behind both Journey sprints); the 2026-08-17 restructure had already given Water its first sprint anywhere, closing [[Open Questions]] #11.* Scope is unchanged by the move — only its position.

Water currently exists conceptually inside [[Fuel]] and is **deliberately not a Sprint 2 focus**: Sprint 2 preserves its entry points and necessary integration only, and does **not** remove it. The deep hydration work belongs to Sprint 3.

### Founder direction, 2026-08-18

The goal is to turn Water from a static counter — `5 of 8 cups` — into a small, useful, interactive hydration system. Recorded as **planned direction, not finalized specification**; details may change after design and UX review.

- **User-defined daily goal.** Users set their own target in cups, ounces, millilitres, or litres. VITA does not assume everyone wants exactly 8 cups. The goal persists until changed. Flow: *set goal → log throughout the day → see progress toward goal.*
- **Fast logging.** Quick amounts (e.g. +8 / +12 / +16 / +24 oz) plus a custom amount, following the user's own unit system. Logging should be extremely fast — this is a supporting flow, not a destination.
- **A more satisfying progress visual.** Candidates: fill level · bottle/glass visualization · circular progress · fluid animation · a clean progress bar · a daily hydration card. **Do not assume a literal animated water bottle is automatically best** — design it inside VITA's premium visual system ([[Design Bible]]).
- **Editing and removing** a logged amount where appropriate — a mis-tap should not be permanent.
- **Synchronization with [[Fuel]].** The compact Hydration module on the redesigned Fuel screen reads the same state, so the two never disagree. Sprint 3 backs that module with real data; it does **not** redesign Fuel.
- **Date-aware daily behavior.** Today's intake, daily reset / date rollover, the user's goal, progress, and history later. Full hydration analytics are **not** in scope unless explicitly planned.

Architecture note: hydration should reuse the local-calendar date model and repository boundary that Sprint 2's nutrition engine established, rather than inventing a second date model — repo `docs/09-Technical-Documentation.md` → "Future architecture considerations".

## Audited at Sprint 3 closeout (slice 3.10, 2026-08-31)

Water came through the closeout audit with **one defect and no functional problems.** On a phone with no goal set, a solid blue waterline was drawing across the bottom of the Water card — the panel's fill correctly animates to zero height, but its 2pt surface line is anchored to the top of that zero-height box, so it painted at the card's edge anyway. The panel is deliberately designed never to show an empty vessel, because *"you have not chosen a goal"* is not a statement about how much you have drunk. It was showing one to every first-time user. Fixed, and re-verified on device in both states.

**Everything else held.** The goal persists and suggests nothing. A drink logged in one unit never changes the display preference. Repeated adds record as separate drinks. A day with nothing logged reads as empty rather than broken. Yesterday's water does not survive into today, and logging today does not disturb yesterday. A storage failure surfaces rather than silently rendering an empty day. Light and Dark are equally finished, and nothing on the screen scores the day — no streak, no average, no judgement about drinking too little or too much.

**Water now has route-level tests.** Its units, totals, goals, entries, week and provider were all thoroughly covered — and no test had ever rendered a Water screen. That is the same gap that let PT-141 appear missing in Peptides: a correct function with passing tests behind a screen nobody had exercised. The new suite drives the real routes, and it is what caught the waterline.

**One consistency note, not a defect.** Water's strip is a *"Last 7 days"* rolling bar chart while the Peptides routine strip is a Monday-to-Sunday calendar. The two are different objects doing different jobs — a volume trend versus a week you can mark days on — and Water's label says exactly what it shows. Recorded so the difference reads as deliberate rather than as drift.

## Sprint 5 direction — Interactive Water Experience (founder direction, 2026-09-01)

**⚠️ Direction, not implementation authorization.** Slice 5.3 is **draft** and needs founder approval plus a Sprint 5 architecture audit. Full brief: repo `docs/Sprint-5-Identity-Brief.md`.

**The problem is presentation, not correctness.** The existing Water summary and Add Water flow are functionally correct but visually form-like and space-heavy.

**A premium stylized VITA hydration vessel may become the hero interaction object** — a visible fill level mapped to hydration progress · logging visibly raising the liquid level · subtle ripple / splash feedback · an appropriate haptic · progress updating with animation · a non-cartoon visual treatment.

**Potential logging flow:** tap Add Water → compact bottom sheet or overlay → quick amounts → custom amount → log → the vessel responds → the sheet closes.

*The standing caution from the 2026-08-18 direction below is **not** overruled: do not assume a literal animated water bottle is automatically right. The vessel is a strong candidate to be designed inside VITA's premium system, not a foregone conclusion.*

**Preserved exactly as built:** canonical storage · units · goal · entries · persistence · rollover · history.

**History.** The 7-day history remains valuable and may simply be presented more elegantly — individual daily entries can become compact, secondary, or progressively disclosed rather than permanent large cards. **No data loss, and no history simplification for visual reasons.**

## Future ideas

- Smart daily goals (weight/activity-adjusted) — candidate Atlas insight ([[Atlas Capabilities]])
- Apple Health sync for hydration ([[Future Features]])

## Dependencies / open questions

- **Product placement:** Water is a core product area in the repo Product Bible but absent from the founder-stated primary navigation. Where it lives long-term is [[Open Questions]] #4 — narrowed by the sprint existing, but not closed, and now due sooner since it is Sprint 3.
- **Goal preference ownership — resolved.** Water owns its goal and unit preference under `vita:v1:water:prefs`; [[Settings]] reads and writes that same source rather than creating a second one. Settings is now **Sprint 4**, immediately after Sprint 3 ([[Open Questions]] #16, closed 2026-08-21).

**Related:** [[Dashboard]] · [[Fuel]] · [[Product Overview]]
