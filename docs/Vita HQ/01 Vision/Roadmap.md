# Roadmap

**What is this?** The official development plan — sprint sequence, slices, and what's deliberately deferred.

**Why does it exist?** So everyone knows what we're building now, what comes next, and what is out of scope until later.

*Sources: the founders' official Sprint Roadmap. **Restructured 2026-08-17** (founder authorization, issued alongside Sprint 2 approval) — this supersedes the 8-sprint structure issued 2026-07-09 that the per-sprint sections further down were originally written against.*

---

## Repository roadmap is synced

The repository's own roadmap doc (`vita-app/docs/04-Master-Roadmap.md`) mirrors this page's sprint structure, resynced 2026-08-17 to the restructured plan below. Both describe the same official roadmap; update both together if the plan changes again.

## How development is structured

**Project → Sprint → Slice.** Sprints define major milestones; slices define individual features within a sprint. Founder approval gates every slice ([[Claude Workflow]]).

## Current stage

**Sprint 2 — Fuel is 🟡 in progress** (started 2026-08-17, branch `sprint-2-fuel`). Everything before it is complete: Sprint 0 — Visual Foundation, Sprint 0.1 — Polish, Sprint 1 — Dashboard/Home (2026-08-02), and the App-Wide Visual Consistency Pass (2026-08-16). See [[Current Sprint]] and repo `docs/06-Slice-Tracker.md` for what shipped in each.

*The prior sequencing warning here — that Fuel and Journey were swapped in build order but not renumbered — is resolved. The 2026-08-17 restructure below renumbers them properly.*

**A note on what "Sprint 0 complete" means.** The new roadmap's Sprint 0 deliverable — brand identity, product vision, Atlas identity, navigation architecture, design language, product documentation, the Design Bible, the development workflow, the Innovation Lab, core planning — describes vision/design/documentation work, not application code. This reads as the founders folding together two things that happened separately in practice: the application shell already built in the repo (the old Slice 0.1–0.12, still tracked in `docs/06-Slice-Tracker.md`, still showing 🟡 founder review there) **and** the vision/design/documentation foundation built across recent HQ sessions (this vault, the [[Innovation Lab]], the [[Design Bible]], the [[Claude Workflow|sprint workflow]]). Both are now considered done as "Sprint 0 — Foundation." This is Claude's synthesis of the two, not something the roadmap text states explicitly — flagged as an interpretation, not a verified fact.

## Sprint plan (official, founders 2026-08-17)

| Sprint | Objective | Status |
|---|---|---|
| 0 — Visual Foundation | Establish identity, vision, architecture, and the application shell | ✅ Complete |
| 0.1 — Polish | Global design polish over the Sprint 0 shell | ✅ Complete |
| 1 — [[Dashboard]] / Home | Build the Home experience that defines the quality standard for the app | ✅ Complete |
| — App-Wide Visual Consistency Pass | Migrate every screen onto the theme system Sprint 1 established | ✅ Complete |
| **2 — [[Fuel]]** | **Build the smartest nutrition experience possible** | **🟡 Current** |
| 3 — [[My Journey\|Journey]] / Weight | The weight half of the Journey experience | ⬜ Planned |
| 4 — [[My Journey\|Journey]] / Photos | The transformation-photo half of the Journey experience | ⬜ Planned |
| 5 — [[Water]] & [[Peptides]] | Bring both existing logs to real, persisted functionality | ⬜ Planned |
| 6 — [[Atlas]] | Transform Atlas into a true AI health coach | ⬜ Planned |
| 7 — [[Settings]] / Account | Profile, notifications, preferences, units, appearance, privacy | ⬜ Planned |
| 8 — Final Polish & Animations | Motion, micro-interactions, and the final quality pass | ⬜ Planned |

**Two long-flagged gaps are now closed.** [[Water]] and [[Peptides]] get Sprint 5; [[Settings]] gets Sprint 7. All three previously had no sprint anywhere — tracked as Gaps #1–#3 below and [[Open Questions]] #11. **A new gap opens in their place** — see "What changed in the 2026-08-17 restructure."

## What changed in the 2026-08-17 restructure

Recorded so nothing is silently dropped. Prior structure (2026-07-09): Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta.

**Moved:** Fuel 3 → **2** · Journey 2 → split across **3 (Weight)** and **4 (Photos)** · Atlas 4 → **6**.

**Added:** Sprint 0.1 and the Visual Consistency Pass as first-class completed entries · **Sprint 5 — Water & Peptides** · **Sprint 7 — Settings / Account**.

**Replaced:** Sprint 7 — Beta → **Sprint 8 — Final Polish & Animations**. Beta's non-polish slices (Analytics, Crash Reporting, App Store Preparation, Final QA & Launch Checklist) have no explicit home in the new structure.

**⚠️ No longer scheduled — flagged, not resolved.** **Sprint 5 — Health** and **Sprint 6 — Premium** are both absent from the new structure. Their detail sections are preserved further down, marked as unscheduled. Between them they carried **five [[Innovation Lab]] ideas promoted to 📋 Planned** precisely because the old roadmap named them directly: [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], and [[Voice Atlas]]. Those ideas now have no scheduled sprint. Per the Lab's standing rule an idea's *status* changes but it is never deleted — these are **not** being demoted here, and I have not silently reverted them to 💭/📝. Flagged for founder attention. Same situation for **Screenshot Food Analysis** ([[Mobile Order Screenshot Import]]), a slice of the old Sprint 3 — Fuel that is explicitly deferred out of the approved Sprint 2 scope. Tracked as [[Open Questions]] #14.

---

## Sprint 0 — Visual Foundation ✅

*Detail sections below appear in their original 2026-07-09 document order, retitled with their 2026-08-17 numbers. The table above is the authoritative sequence.*

**Status:** Completed. **Deliverable:** a complete blueprint for the application.

Completed work: Brand Identity · Product Vision · Atlas Identity · Navigation Architecture · Design Language · UI Direction · Product Documentation · [[Design Bible]] · [[Claude Workflow|Development Workflow]] · [[Innovation Lab]] · Core Planning.

## Sprint 1 — Dashboard / Home ✅

**Objective:** build the Dashboard experience that defines the quality standard for the entire application. **Deliverable:** a polished Home Dashboard that users could realistically experience as a production-quality feature.

**Two prerequisite decisions resolved 2026-07-09** (see [[Decision Log]]), both binding on this sprint:
- **Theme:** VITA supports Light + Dark, built on semantic design tokens, not hardcoded colors — [[Design Bible]]. Every new/touched component in this sprint should be built against semantic token names so the eventual dark palette is a value swap, not a rewrite.
- **Navigation:** Settings stays permanently in the top-right corner, never the dock. Slice 8 (Floating Navigation) below is scoped to the existing 4-tab dock only — it does not add Settings.

**Restructured 2026-07-09 (founders), during Slice 1 review:** Slice 1 (Dashboard Layout) was approved as page structure only — hierarchy, spacing, scroll — no component styling. Founders split the card/container work out into its own slice, **Dashboard Components**, inserted as Slice 2. Remaining slices renumbered; sprint is now 9 slices, was 8.

**Health Metrics content reconfirmed (founders, 2026-07-09):** Steps, Water, Meals Logged, Sleep. **Peptides is explicitly excluded** from the primary Dashboard metrics — this matches what this page already specified, but the current mock data in the repo (`features/dashboard/mock.ts`) still shows Peptides in that slot and needs correcting when Slice 5 is built.

| # | Slice | Covers |
|---|---|---|
| 1 | Dashboard Layout ✅ | Overall layout, content hierarchy, section spacing, responsive behavior, scroll experience — built on semantic tokens |
| 2 | Dashboard Components 🟡 | Reusable card/container primitives — shadows, radius, press feedback — for every remaining section to build on |
| 3 | Greeting Card | Dynamic greeting, motivational message, time-of-day behavior, polish |
| 4 | Today's Summary | Calories, macro progress, protein, carbs, fat, progress calculations |
| 5 | Health Metrics | Steps, Water, Meals Logged, Sleep (not Peptides), reusable metric cards |
| 6 | Journey Preview | Current Journey card, progress bar, current week, CTA into Journey |
| 7 | Meals Preview | Meal cards, icons, calories, empty states, tap interactions |
| 8 | Floating Navigation | The existing 4-item dock (Home, Fuel, Journey, Atlas) only — active states, blur/material, animations, polish. Settings is explicitly out of scope, per the 2026-07-09 placement decision. |
| 9 | Dashboard Polish | Loading states, animations, micro-interactions, accessibility, performance, final UI polish — includes verifying Dashboard renders correctly in both Light and Dark |

**Note:** a Dashboard already exists in mock form (old Slice 0.4, refined 0.11–0.12 — see [[Dashboard]]'s Current state), with a GreetingCard, DailyProgressCard, QuickStatsRow, and JourneyCard already built. This sprint's slices map closely onto those existing pieces (Slice 3 → GreetingCard, Slice 4–5 → DailyProgressCard/QuickStatsRow, Slice 6 → JourneyCard), which suggests Sprint 1 elevates the existing mock Dashboard to production quality rather than building from zero — a reasonable inference, not stated explicitly in the roadmap text.

**Progress:** Slice 1 (Dashboard Layout) approved — added a `Section` layout primitive and a configurable content-gap on `Screen` (scoped so only Dashboard's rhythm changed, not every other screen sharing `Screen`), establishing a 24/12/8px section rhythm from existing spacing tokens. Slice 2 (Dashboard Components) approved — added `PressableCard` (Card + standard press-scale feedback) and migrated `JourneyCard` to it. Slice 3 (Greeting Card) built and then design-revised by founders (2026-07-10): the generic sun/moon icon was replaced with a bespoke `TimeOfDayIllustration` — a fixed circular landscape composition (mountains + small lake) recolored across four states (morning/afternoon/evening/night), light/dark-ready. Existing greeting logic, minute re-evaluation, copy, and card layout preserved untouched. **Pending founder visual test in Expo Go before approval.**

## Sprints 3 & 4 — Journey / Weight and Journey / Photos

*Was Sprint 2 under the 2026-07-09 structure; the 2026-08-17 restructure splits it into two sprints — Weight (3) and Photos (4). The eight slices below were written as one sprint and have not yet been divided between them; that split is a planning task for whenever Sprint 3 begins.*

**Objective:** build the emotional core of Vita. **Deliverable:** a complete Journey experience that motivates through progress, not just data display.

| # | Slice |
|---|---|
| 1 | Journey Overview |
| 2 | Journey Timeline |
| 3 | Milestones |
| 4 | Achievements |
| 5 | Streak System |
| 6 | Rewards & Celebrations |
| 7 | Journey Detail Screen |
| 8 | Journey Polish |

**⚠️ Design-risk flag on Slice 5 (Streak System).** A literal streak mechanic (resets to zero on a missed day) is in direct tension with [[Core Principles]] #6 ("Progress over Perfection — users should never feel punished for missing a day") and [[UX Principles]] #1 ("no guilt mechanics — ever"), both already locked decisions. This isn't a reason to skip the slice — it's a reason to design it carefully: a streak system that doesn't punish a miss (grace days, "current streak" reframed as "current run" that continues rather than zeroing, etc.) can absolutely fit the no-guilt promise; a naive reset-to-zero streak cannot. Worth resolving the design approach before this slice starts, not after.

Full proposal: [[Journey Stages]] · [[Product Philosophy]].

## Sprint 2 — Fuel 🟡 Current

*Was Sprint 3 under the 2026-07-09 structure. The eight slices below are the original framing; the **approved Sprint 2 implementation plan** (founder-authorized 2026-08-17) supersedes them — it proves the nutrition engine before external providers, and defers Screenshot Food Analysis. Live slice progress: repo `docs/06-Slice-Tracker.md`.*

**Objective:** build the smartest nutrition experience possible. **Deliverable:** a complete food logging experience centered on simplicity, speed, and intelligent recommendations.

| # | Slice | Notes |
|---|---|---|
| 1 | Food Logging | |
| 2 | Food Search | |
| 3 | Barcode Scanner | Real camera implementation — currently a static mock, per [[Fuel]] |
| 4 | Daily Nutrition | |
| 5 | Meal History | |
| 6 | Restaurant Support | Likely relates to [[Nutrition Features]]'s "restaurant menu integration" example — **no Innovation Lab idea note exists for this yet** |
| 7 | **Screenshot Food Analysis** | **This is [[Mobile Order Screenshot Import]]** — promoted from the Innovation Lab to 📋 Planned as part of this update |
| 8 | Fuel Polish | |

## Sprint 6 — Atlas

*Was Sprint 4 under the 2026-07-09 structure.*

**Objective:** transform Atlas into a true AI health coach. **Deliverable:** an AI experience that feels proactive, intelligent, and deeply integrated throughout Vita.

**⚠️ This reverses a previously locked decision.** The repo Master Roadmap's Sprint 6 scope decision — "Atlas V1 is a polished placeholder only. Do not implement AI coaching yet" (logged in the [[Decision Log]]) — is directly superseded by this sprint. A new Decision Log entry records the reversal; see [[Atlas]] for how its Current/Target state framing was updated to match.

| # | Slice | Notes |
|---|---|---|
| 1 | Atlas Home | |
| 2 | Chat Experience | |
| 3 | **Meal Planning** | **This is [[Meal Planning]]** — promoted to 📋 Planned |
| 4 | **Workout Planning** | **This is [[Workout Generation]]** — promoted to 📋 Planned. Committing this slice at least confirms Atlas will generate workout plans; it doesn't explicitly confirm whether a full workout *tracking* module also ships, which was that idea's original blocking question — see the idea note for the nuance. |
| 5 | Health Guidance | |
| 6 | Memory & Context | |
| 7 | Recommendations | |
| 8 | Atlas Polish | |

## Health — ⚠️ no longer scheduled

*Was Sprint 5 under the 2026-07-09 structure. **Absent from the 2026-08-17 restructure.** Preserved here because it carried three promoted Innovation Lab ideas. See "What changed in the 2026-08-17 restructure" above and [[Open Questions]] #14.*

**Objective:** build Vita's health intelligence platform. **Deliverable:** meaningful health insights powered by wearable integrations and biomarker analysis.

| # | Slice | Notes |
|---|---|---|
| 1 | Health Dashboard | |
| 2 | Weight Trends | |
| 3 | **Health Age** | **This is [[Health Age]]** — promoted to 📋 Planned |
| 4 | **Biomarker Age** | **This is [[Biomarker Age]]** — promoted to 📋 Planned |
| 5 | **Apple Health Integration** | **This is [[Apple Health Integration]]** — promoted to 📋 Planned |
| 6 | Oura Integration | No Innovation Lab idea note exists for this yet — named directly in the roadmap |
| 7 | WHOOP Integration | Same — no Lab idea note yet |
| 8 | Health Polish | |

**Note:** [[Longevity Dashboard]] isn't explicitly named as its own slice here, even though both scores it depends on are. Worth a founder check on whether it's implicitly part of Slice 1 (Health Dashboard) or genuinely not yet scheduled.

## Premium — ⚠️ no longer scheduled

*Was Sprint 6 under the 2026-07-09 structure. **Absent from the 2026-08-17 restructure.** Preserved here because it carried two promoted Innovation Lab ideas. See "What changed in the 2026-08-17 restructure" above and [[Open Questions]] #14.*

**Objective:** deliver the premium Vita experience. **Deliverable:** premium features that elevate the product beyond traditional health apps.

| # | Slice | Notes |
|---|---|---|
| 1 | **Widgets** | **This is [[Apple Home Screen Widgets]]** — promoted to 📋 Planned |
| 2 | **Live Activities** | Listed as a *future enhancement* inside the Widgets idea note — now pulled forward into its own committed slice, ahead of the rest of that idea's future-enhancement list |
| 3 | Smart Notifications | Relates to [[Advanced Coaching (Proactive Check-Ins)]]'s notification dependency — no dedicated Lab idea note yet |
| 4 | Themes & Personalization | Relates to the [[Design Bible]] theme question and [[Settings]]' appearance controls — no dedicated Lab idea note |
| 5 | **Voice Atlas** | **This is [[Voice Atlas]]** — promoted to 📋 Planned |
| 6 | Premium Features | Generic — maps to the [[Premium Features]] Lab category rather than one specific idea |
| 7 | Subscription Experience | Relates to [[Monetization]] / [[Business Model & Pricing]] — no dedicated Lab idea note |
| 8 | Premium Polish | |

## Beta — superseded by Sprint 8 — Final Polish & Animations

*Was Sprint 7 under the 2026-07-09 structure. The 2026-08-17 restructure replaces it with Sprint 8 — Final Polish & Animations, which is narrower: the polish/performance/accessibility slices carry over, but Analytics, Crash Reporting, App Store Preparation, and Final QA & Launch Checklist have no explicit home in the new structure.*

**Objective:** prepare Vita for public release. **Deliverable:** a stable, production-ready beta.

| # | Slice |
|---|---|
| 1 | Bug Fixes |
| 2 | Performance |
| 3 | Accessibility |
| 4 | Offline Improvements |
| 5 | Analytics |
| 6 | Crash Reporting |
| 7 | App Store Preparation |
| 8 | Final QA & Launch Checklist |

Overlaps with [[Launch Plan]]'s pre-launch checklist — cross-reference when either page is next updated.

---

## Gaps worth founder attention

Flagging rather than silently resolving, per the vault's standing rule to never invent an answer.

**✅ Resolved by the 2026-08-17 restructure:**

1. ~~**[[Water]] has no sprint anywhere.**~~ Now **Sprint 5 — Water & Peptides**.
2. ~~**[[Peptides]] has no sprint anywhere.**~~ Same — **Sprint 5**.
3. ~~**[[Settings]] has no sprint anywhere.**~~ Now **Sprint 7 — Settings / Account**. This was the most concerning of the three: Settings is part of the founder-stated five-item primary navigation ([[Decision Log]]) and currently only exists as an empty shell. Its placement was locked 2026-07-09; its feature work now has a scheduled home too.

**Still open:**

4. **Several slices are named without a backing Innovation Lab idea note:** Restaurant Support (now inside Sprint 2 — Fuel), Oura and WHOOP Integration (Health, now unscheduled), Smart Notifications, Themes & Personalization, and Subscription Experience (Premium, now unscheduled). Not a problem, just an inconsistency with how the rest of the Lab→Roadmap flow has worked — worth backfilling idea notes if the founders want the Lab to stay the complete record.

5. **⚠️ New: Health and Premium are no longer scheduled, orphaning five promoted Lab ideas.** [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], and [[Voice Atlas]] were promoted to 📋 Planned because the 2026-07-09 roadmap named them directly. The 2026-08-17 restructure drops both sprints, so none of the five has a scheduled sprint now. [[Mobile Order Screenshot Import]] is in the same position after being deferred out of Sprint 2's approved scope. Their status has **not** been reverted — the founders should decide whether these get a future sprint, return to 📝 Defined, or stay 📋 Planned pending a post-V1 roadmap. Tracked as [[Open Questions]] #14.

## Version 1 goal

Updated against the 2026-08-17 sprint set: Version 1 is complete when **Sprint 8 — Final Polish & Animations** finishes — every primary screen at production quality, complete navigation, visual consistency in both themes, and Atlas functioning as a real AI coach (not a placeholder).

## Current priority

**Sprint 2 — Fuel**, built slice by slice to full production quality before Sprint 3 begins. Founder-authorized 2026-08-17; branch `sprint-2-fuel`. The approved architecture proves the nutrition engine — food entries, daily state, calculated totals, persistence, and one shared domain driving both [[Fuel]] and [[Dashboard]] — before external food providers are introduced. Strictly sequential, one sprint at a time, consistent with [[Core Principles]] #7 ("Build in Slices") applied at the sprint level.

## Remaining unscheduled ideas

What's still genuinely future/unscheduled after this roadmap's promotions — everything else, cross-check against [[Innovation Lab]] for the full list:

- [[Longevity Dashboard]] (see the Sprint 5 note above)
- [[Advanced Coaching (Proactive Check-Ins)]] (adjacent to Sprint 4 Recommendations and Sprint 6 Smart Notifications, not explicitly named)
- [[AI Meal Photo Recognition]] and [[Smart Fridge Scanner]] (neither named in this roadmap)

Nothing graduates from the Lab to a sprint without passing the VITA Promise ([[Product Philosophy]]) and the ten-year test ([[Core Principles]]) — the promotions logged in this update reflect the founders naming them directly in the official roadmap, which satisfies that bar by definition.

## Sprint completion criteria

All planned slices finished · all audits passed · documentation updated · founder approval received. Only then does the next sprint begin.

**Related:** [[Project Status]] · [[Current Sprint]] · [[Innovation Lab]] · [[Long-Term Vision]] · [[Decision Log]] · [[Open Questions]]
