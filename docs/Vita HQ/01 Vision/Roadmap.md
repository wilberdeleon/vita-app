# Roadmap

**What is this?** The official development plan — sprint sequence, slices, and what's deliberately deferred.

**Why does it exist?** So everyone knows what we're building now, what comes next, and what is out of scope until later.

*Sources: the founders' official Sprint Roadmap. **Sprint 5 — VITA Identity & Interaction inserted 2026-09-01 (founder decision), ahead of [[My Journey|Journey]].** The order is now Fuel → Water + Peptides → Settings + Tools Foundation → **VITA Identity & Interaction** → Journey / Weight → Journey / Photos → Atlas → Final Polish / Motion / Launch Experience. Journey / Weight is **Sprint 6**, Journey / Photos **Sprint 7**, [[Atlas]] **Sprint 8**, and the final polish sprint **Sprint 9**. Journey is **deferred, not cancelled or reduced**. This supersedes the sprint numbering of the earlier 2026-09-01 reorder — whose own decision stands. **Reordered earlier on 2026-09-01 (founder decision): Settings + Tools & Reference moves ahead of Journey.** The order was then Fuel → Water + Peptides → **Settings + Tools & Reference** → Journey / Weight → Journey / Photos → Atlas → Final Polish. The 2026-08-21 reorder (which put Water + Peptides ahead of Journey) still stands for Sprint 3; its numbering for Sprints 4–7 is superseded. **Restructured 2026-08-17** (founder authorization, issued alongside Sprint 2 approval) — that restructure superseded the 8-sprint structure issued 2026-07-09 that the per-sprint sections further down were originally written against.*

---

## Repository roadmap is synced

The repository's own roadmap doc (`vita-app/docs/04-Master-Roadmap.md`) mirrors this page's sprint structure, resynced 2026-09-01 to the reordered plan below. Both describe the same official roadmap; update both together if the plan changes again.

## How development is structured

**Project → Sprint → Slice.** Sprints define major milestones; slices define individual features within a sprint. Founder approval gates every slice ([[Claude Workflow]]).

## Current stage

**Sprint 3 — Water + Peptides is ✅ complete and merged** (opened 2026-08-22 on branch `sprint-3-water-peptides`, closed out by slices 3.10 and 3.10A, merged into `main` 2026-09-01 as `2bac43b`). Everything before it is complete: Sprint 0 — Visual Foundation, Sprint 0.1 — Polish, Sprint 1 — Dashboard/Home (2026-08-02), the App-Wide Visual Consistency Pass (2026-08-16), and Sprint 2 — Fuel (merged to `main` 2026-08-21). See [[Current Sprint]] and repo `docs/06-Slice-Tracker.md` for what shipped in each.

**Sprint 4 — Settings + Tools Foundation: ✅ complete**, opened and closed 2026-09-01 on branch `sprint-4-settings-tools-reference`. Two founder-approved slices — 4.1 Settings Foundation and 4.2 Tools & Reference Hub + Route Architecture. The sprint was **redefined and closed after the foundation landed**, by founder decision: [[BMI Calculator|BMI]], [[Research Library]], [[Food & Product Scanner]] evolution and Dashboard discoverability are all presentation-heavy and are **deferred, not cancelled**, until the new VITA visual / interaction language exists.

**That alignment session happened on 2026-09-01 and this page now reflects it.** The founder-directed identity sprint is on the roadmap as **Sprint 5 — VITA Identity & Interaction**, inserted ahead of Journey; Journey / Weight moves to Sprint 6, Journey / Photos to Sprint 7, Atlas to Sprint 8, and the final polish sprint to **Sprint 9 — Final Polish / Motion / Launch Experience**.

**Sprint 5 is 🟡 in progress**, opened 2026-09-02 on branch `sprint-5-identity-interaction`, founder-authorized against the approved **Sprint 5 Planning & Architecture Audit** (repo `docs/Sprint-5-Planning-Audit.md`). **Slices 5.1 (VITA Design Language + Identity Prototype), 5.2 (Interactive [[Water]] Experience) and 5.3 ([[Dashboard]] Identity Redesign) are founder-approved on device and locked.** 5.4 — [[Peptides]] Home Redesign is next and needs its own authorization.

**⚠️ Scope amended 2026-09-04.** The founders ruled that **Sprint 5 must apply the identity language across every already-built product area before [[My Journey|Journey]] begins**, and that the resulting system is the **baseline for all future VITA feature work**, Journey included. **[[Fuel]] gains a dedicated identity slice (5.6)**; Tools becomes **Tools + [[Settings]] (5.7)**; Motion, [[BMI Calculator|BMI]] and the founder audit each shift one number. **Ten slices, 5.1–5.10** — nothing cut. **Sprint 6 begins only after 5.10 passes founder real-device review.** The amendment is recorded in the audit's §S.3.

*The prior sequencing warning here — that Fuel and Journey were swapped in build order but not renumbered — is resolved. The 2026-08-17 restructure renumbered them properly; the 2026-08-21 reorder moved Water + Peptides ahead of Journey; the 2026-09-01 reorder then moved Settings + Tools & Reference ahead of Journey too.*

**A note on what "Sprint 0 complete" means.** The new roadmap's Sprint 0 deliverable — brand identity, product vision, Atlas identity, navigation architecture, design language, product documentation, the Design Bible, the development workflow, the Innovation Lab, core planning — describes vision/design/documentation work, not application code. This reads as the founders folding together two things that happened separately in practice: the application shell already built in the repo (the old Slice 0.1–0.12, still tracked in `docs/06-Slice-Tracker.md`, still showing 🟡 founder review there) **and** the vision/design/documentation foundation built across recent HQ sessions (this vault, the [[Innovation Lab]], the [[Design Bible]], the [[Claude Workflow|sprint workflow]]). Both are now considered done as "Sprint 0 — Foundation." This is Claude's synthesis of the two, not something the roadmap text states explicitly — flagged as an interpretation, not a verified fact.

## Sprint plan (official — founders 2026-08-17, reordered 2026-08-21, reordered 2026-09-01, and Sprint 5 inserted 2026-09-01)

| Sprint | Objective | Status |
|---|---|---|
| 0 — Visual Foundation | Establish identity, vision, architecture, and the application shell | ✅ Complete |
| 0.1 — Polish | Global design polish over the Sprint 0 shell | ✅ Complete |
| 1 — [[Dashboard]] / Home | Build the Home experience that defines the quality standard for the app | ✅ Complete |
| — App-Wide Visual Consistency Pass | Migrate every screen onto the theme system Sprint 1 established | ✅ Complete |
| 2 — [[Fuel]] | Build the smartest nutrition experience possible | ✅ Complete |
| 3 — [[Water]] + [[Peptides]] | Bring both daily logs to real, persisted functionality — VITA's daily health-tracking infrastructure | ✅ Complete |
| **4 — [[Settings]] + Tools Foundation** | Settings architecture and a top-level Tools destination — the foundation later Tools are built into | ✅ Complete |
| **5 — VITA Identity & Interaction** | **Establish the VITA visual and interaction language and apply it across every already-built product area — the language Journey is built in** | 🟡 **In progress** — 5.1, 5.2, 5.3 approved |
| 6 — [[My Journey\|Journey]] / Weight | The weight half of the Journey experience, and the core Journey data architecture — **gated on slice 5.10** | ⬜ Planned |
| 7 — [[My Journey\|Journey]] / Photos | The transformation-photo half of the Journey experience | ⬜ Planned |
| 8 — [[Atlas]] | Transform Atlas into a true AI health coach | ⬜ Planned |
| 9 — Final Polish / Motion / Launch Experience | App-wide finishing motion, consistency, edge cases, and the launch experience | ⬜ Planned |

**Two long-flagged gaps are now closed.** [[Water]] and [[Peptides]] get **Sprint 3** (Sprint 5 when the gap was closed on 2026-08-17; moved forward 2026-08-21); [[Settings]] gets **Sprint 4** (Sprint 7 when the gap was closed; moved forward and broadened to *Settings + Tools & Reference* on 2026-09-01). All three previously had no sprint anywhere — tracked as Gaps #1–#3 below and [[Open Questions]] #11. **A new gap opens in their place** — see "What changed in the 2026-08-17 restructure."

## What changed in the 2026-09-01 identity insertion

**Founder decision: Sprint 5 — VITA Identity & Interaction is inserted ahead of [[My Journey|Journey]].**

**Why.** VITA has substantial working functionality, but real-device review showed the presentation layer has become too visually generic — dark background, large rounded card, text, icon, another rounded card, repeated across features that behave nothing alike. The founders want VITA's visual and interaction identity established **before** Journey, because Journey is expected to be one of the app's most important and visually significant areas. Building it first would mean building it in a visual language already targeted for replacement, redesigning it immediately afterwards, and accumulating presentation-layer debt. **This is not a product restart.**

| Sprint | Was (earlier on 2026-09-01) | Now (identity insertion) |
|---|---|---|
| 4 | [[Settings]] + Tools & Reference | **Settings + Tools Foundation** — complete, renamed at closeout |
| 5 | Journey / Weight | **VITA Identity & Interaction** (new) |
| 6 | Journey / Photos | **Journey / Weight** (was 5) |
| 7 | [[Atlas]] | **Journey / Photos** (was 6) |
| 8 | Final Polish & Animations | **Atlas** (was 7) |
| 9 | — | **Final Polish / Motion / Launch Experience** (was Sprint 8, renamed) |

**Preserved explicitly:** Sprint 4 is complete and its close was an **intentional scope decision**, not a failure — its Settings architecture, Appearance persistence, Units architecture, `/tools`, the Tools & Reference hub, [[Peptide Dose Calculator|Peptide Calculator]], [[Injection Site Tracking|Injection Sites]], the Body Map primitives, navigation foundations, domain logic, utilities, persistence and repositories all stand and are **not rebuilt** by Sprint 5 · remaining Tools work **resumes** under the new language · **[[BMI Calculator|BMI]] is still planned, not cancelled** · **Journey is deferred to Sprint 6, not cancelled or reduced**, and Weight still precedes Photos · Atlas's scope is unchanged, number only · **Sprint 9 remains the final app-wide polish, motion and launch pass** and is distinct from Sprint 5's interaction-vocabulary work · **VITA does not become a peptide dosage or protocol recommendation engine**.

**Sprint 5's slices (5.1–5.8) are DRAFT and not implementation-authorized.**

## What changed in the earlier 2026-09-01 reorder

*Historical record — this decision stands, but **its numbering from Sprint 5 onward is superseded by the identity insertion above.***

**Founder decision: [[Settings]] + Tools & Reference moves ahead of [[My Journey|Journey]].**

**Why.** Journey / Weight is expected to be one of VITA's more complex feature areas. The founders would rather organize VITA's utility and settings architecture first, build out the [[Peptides|Tools]] that already exist into something coherent, and establish the reference/navigation structure — then approach Journey / Weight with cleaner app architecture and a more focused scope.

**Sequencing only — nothing was cut, reduced, or cancelled. Journey is deferred to Sprint 5.**

| Sprint | Was (2026-08-21) | Now (2026-09-01) |
|---|---|---|
| 3 | [[Water]] + [[Peptides]] | Water + Peptides — unchanged (complete, merged 2026-09-01) |
| 4 | Journey / Weight | **[[Settings]] + Tools & Reference** (was Sprint 7, and broadened) |
| 5 | Journey / Photos | **Journey / Weight** (was Sprint 4) |
| 6 | [[Atlas]] | **Journey / Photos** (was Sprint 5) |
| 7 | Settings / Account | **Atlas** (was Sprint 6) |
| 8 | Final Polish & Animations | Final Polish & Animations — unchanged |

**Sprint 4 is renamed as well as renumbered.** The founder-approved identity is **Settings + Tools & Reference** — not "Settings & Miscellaneous", "Utilities", or "the Tools sprint". It is broader than the old Settings / Account sprint: it also owns the Tools destination and the reference layer.

**Preserved explicitly:** [[My Journey|Journey]] is **deferred, not cancelled or reduced** — weight planning, weight logging and history, the Journey data architecture, progress views, progress photos, photo comparisons and every existing visual concept stand exactly as documented · **Weight still precedes Photos** · [[Atlas]]'s scope is unchanged, only its number (6 → 7) · **Sprint 3's scope and status are unchanged** — feature-complete, in final audit/closeout, **not** marked complete by this reorder · Sprint 8 remains the final broad polish and animation pass · Health and Premium stay unscheduled and the orphaned Lab ideas keep their 📋 Planned status ([[Open Questions]] #14, still open).

## What changed in the 2026-08-21 reorder

*Historical record. **The sprint numbers below are superseded by the 2026-09-01 reorder above** — 4, 5, 6 and 7 have since moved. What still stands from this decision is that Water + Peptides is Sprint 3, ahead of Journey.*

**Founder decision: Water + Peptides moves ahead of Journey.** The reason: establish more of VITA's daily health-tracking infrastructure before beginning the larger Journey experience. Fuel, Water, and Peptides are the daily-logging core and share the same patterns; Journey is a bigger, separate experience that benefits from that foundation being real first.

**Sequencing only — no scope was cut, reduced, or cancelled.**

| Sprint | Was (2026-08-17) | Now (2026-08-21) |
|---|---|---|
| 2 | [[Fuel]] | Fuel — unchanged |
| 3 | Journey / Weight | **[[Water]] + [[Peptides]]** (was Sprint 5) |
| 4 | Journey / Photos | **Journey / Weight** (was Sprint 3) |
| 5 | Water & Peptides | **Journey / Photos** (was Sprint 4) |
| 6 | [[Atlas]] | Atlas — unchanged |
| 7 | [[Settings]] / Account | Settings / Account — unchanged |
| 8 | Final Polish & Animations | Final Polish & Animations — unchanged |

A rotation inside sprints 3–5; sprints 6, 7 and 8 kept their numbers at the time. *(The 2026-09-01 reorder has since moved Settings to 4 and pushed Journey / Weight, Journey / Photos and Atlas to 5, 6 and 7.)*

**Preserved explicitly:** [[My Journey|Journey]] is **deferred, not cancelled** — it stays a major pillar of VITA and the next major experience after Sprint 3, with weight planning, weight logging and history, the Journey data architecture, progress views, progress photos, photo comparisons, and every existing visual concept intact · **Weight still precedes Photos** · Sprint 2 — Fuel's scope is unchanged · Water and Peptides scope is unchanged, with the six proposed slices expanded to ten · FatSecret and restaurant provider selection stay deferred to launch readiness and do **not** move into Sprint 3 · Health and Premium remain unscheduled and the five orphaned Lab ideas keep their 📋 Planned status ([[Open Questions]] #14, still open).

## What changed in the 2026-08-17 restructure

*Historical record. **Sprint numbers here are twice superseded** — by the 2026-08-21 reorder and again by the 2026-09-01 reorder above.*

Recorded so nothing is silently dropped. Prior structure (2026-07-09): Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta.

**Moved:** Fuel 3 → **2** · Journey 2 → split across **3 (Weight)** and **4 (Photos)** *(renumbered 2026-08-21 to 4 and 5, and again 2026-09-01 to **5 and 6**)* · Atlas 4 → **6** *(now **7**)*.

**Added:** Sprint 0.1 and the Visual Consistency Pass as first-class completed entries · **Water & Peptides** as a sprint of its own, numbered 5 at the time *(moved to Sprint 3 on 2026-08-21)* · **Sprint 7 — Settings / Account** *(moved to **Sprint 4** and broadened to **Settings + Tools & Reference** on 2026-09-01)*.

**Replaced:** Sprint 7 — Beta → **Sprint 8 — Final Polish & Animations**. Beta's non-polish slices (Analytics, Crash Reporting, App Store Preparation, Final QA & Launch Checklist) have no explicit home in the new structure.

**⚠️ No longer scheduled — flagged, not resolved.** **Health** and **Premium** (Sprints 5 and 6 *under the old 2026-07-09 numbering* — those numbers now belong to Journey / Photos and Atlas) are both absent from the new structure. Their detail sections are preserved further down, marked as unscheduled. Between them they carried **five [[Innovation Lab]] ideas promoted to 📋 Planned** precisely because the old roadmap named them directly: [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], and [[Voice Atlas]]. Those ideas now have no scheduled sprint. Per the Lab's standing rule an idea's *status* changes but it is never deleted — these are **not** being demoted here, and I have not silently reverted them to 💭/📝. Flagged for founder attention. Same situation for **Screenshot Food Analysis** ([[Mobile Order Screenshot Import]]), a slice of the old Sprint 3 — Fuel that is explicitly deferred out of the approved Sprint 2 scope. Tracked as [[Open Questions]] #14.

---

## Sprint 0 — Visual Foundation ✅

*Detail sections below now run in sprint order and carry their 2026-08-21 numbers. The table above remains the authoritative sequence.*

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

## Sprint 2 — Fuel ✅ Complete

*Audited and merged into `main` 2026-08-21 (merge commit `44eeae6`). The heading previously read "🟡 Current" — corrected 2026-09-01.*

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

### Fuel Visual Refinement — added 2026-08-18 (founder direction)

A dedicated late slice, after the functional slices are stable and before Final Verification. Sprint 2 keeps prioritizing functionality first; this is where presentation catches up before Fuel is called finished.

The founders' assessment of Fuel as built today: **too basic, too bulky, overusing large numbers, and filling space simply because space exists** — calorie and nutrition values in particular grow disproportionately large and dominate entire screens. It reads as a functional prototype rather than a refined production health app.

**Presentation only — the feature architecture does not change.** Same screens, same flows, same data model. What it evaluates: information density · typography scale · number sizing · spacing · card sizing · empty space · hierarchy · search-result density · Food Detail density · logging confirmation · meal rows · Food Log presentation. Fuel-specific micro-interactions may be introduced here rather than deferred wholesale to Sprint 8 (see below).

Design direction: [[Design Bible]] → "Density and restraint". **Contextual food visuals** are a related but separate, unscheduled concept — [[Contextual Food Visuals]].

*Founder-stated direction recorded ahead of time. The slice is not yet opened, scoped, or approved — that happens under the normal slice workflow ([[Claude Workflow]]) when the preceding slices complete.*

## Sprint 3 — Water + Peptides ✅ Complete

*Moved here by **founder decision 2026-08-21** — this was Sprint 5 under the 2026-08-17 restructure. Nothing in its scope changed; only its position. Scope below is **founder direction recorded 2026-08-18**, preserved in full, with the slice plan expanded 2026-08-21 and approved 2026-08-22.*

**Status: complete and merged.** Every slice is founder-approved; slices 3.10 and 3.10A closed the sprint out, and it merged into `main` on 2026-09-01 as `2bac43b`. One release gate stays open and is not an engineering blocker: qualified medical, content and legal review of the 96 peptide reference entries. Live detail: [[Current Sprint]] and repo `docs/06-Slice-Tracker.md`.

**Objective:** build out VITA's daily health-tracking infrastructure beyond food — bring both existing logs to real, persisted functionality. **Deliverable:** [[Water]] and [[Peptides]] as genuinely functional health-tracking features rather than the visual mocks they are today, feeding the compact Hydration and Peptides modules on the redesigned [[Fuel]] screen.

**Why these two together.** Both already live inside the Fuel / daily-health-tracking ecosystem, and both need the same class of machinery: daily logging, a user goal or saved setup, history, editing, persistence, date awareness, daily rollover, and a compact summary on Fuel. Designing that once with two real consumers beats inventing it twice. **This is not a mandate for one universal data model** — shared infrastructure exists only where genuinely reusable (date-keyed daily logs, persistent repositories, add/edit/delete flows, daily summaries, history, Fuel landing summaries, app-lifecycle date rollover). A hydration entry and a peptide administration have different domain shapes; where they differ they stay separate, exactly as Sprint 2 kept Food Definition ≠ Food Entry.

**Entry conditions.** All three were met: Sprint 2's final physical-device QA accepted, Sprint 2 merged into `main` (2026-08-21), and the `sprint-3-water-peptides` branch cut from `main` (2026-08-22).

**Fuel is not redesigned again.** The redesigned Fuel screen is approved and finished. Its compact **Hydration** and **Peptides** modules become real entry points and summaries backed by this sprint's functionality — Sprint 3 changes what they display and where they lead, not Fuel's layout, hierarchy, or visual system. See [[Fuel]].

**Not a provider sprint.** FatSecret and restaurant provider selection stay deferred to launch readiness. Nothing from that list moves into Sprint 3.

### Proposed slices — reconciled 2026-08-21

The six-slice plan recorded 2026-08-18 is preserved and expanded into ten controlled slices, so a substantial sprint is not treated as one giant implementation task. Every original slice survives; the additions are a shared-foundation slice at the front, finer splits inside Water and Peptides, and a closeout audit — mirroring how Sprint 2 was actually run.

| # | Slice | Scope | Derives from (2026-08-18) |
|---|---|---|---|
| 3.1 | Sprint Foundation / Shared Daily Tracking Architecture | Date-keyed daily log patterns, persistence, daily rollover on app lifecycle, the Fuel-summary contract | new |
| 3.2 | Water Data Model + Persistence | Hydration entry model, unit model (cups · oz · mL · L), goal storage, date-aware daily state | Water Foundation |
| 3.3 | Water Logging + Goal Experience | User-defined goal flow, quick-add amounts, custom amount, edit/remove a logged entry | Water Foundation |
| 3.4 | Water Visual Polish / Fuel Integration | Progress visualization, the Fuel Hydration module on real data, refinement | Water Experience |
| 3.5 | Peptide Definition + User Setup Architecture | Catalog + Custom, the three-part model, vial amount, reconstitution volume, setup date | Peptide Data Foundation |
| 3.6 | Peptide Logging + History | Log entry flow, history, editing, deletion, date awareness | Peptide History & Polish |
| 3.7 | Dose / Unit Calculator | Reconstitution model, bidirectional syringe units ⇄ mg/mcg conversion, with tests — [[Peptide Dose Calculator]] |  Peptide Calculator |
| 3.8 | Injection Site Tracking | Site picker, simple body visual, recent-site history, rotation information — [[Injection Site Tracking]] | Injection Site Tracking |
| 3.9 | Peptide UX / Fuel Integration | The Fuel Peptides module on real data, disclaimer placement, interaction refinement | Peptide History & Polish |
| 3.10 | Sprint Audit / Polish | Integrated-system audit, calculator test coverage, edge cases, final verification | new |

**Water direction.** The target is a small, useful hydration system rather than a static `5 of 8 cups` counter: a **user-defined** daily goal in cups/oz/mL/L that persists until changed (VITA does not assume everyone wants 8 cups), fast quick-add logging plus a custom amount, editing and removing a logged amount, a more satisfying progress visual designed inside VITA's own system — **not automatically a literal animated water bottle** — date-aware daily behavior, and synchronization with the Fuel summary. Full scope on [[Water]].

**Peptide direction.** A genuinely interactive tracker rather than a basic logging form, staying informational and tracking-oriented: catalog + Custom, short educational information per peptide, a clear approved-vs-research distinction with an unobtrusive disclaimer, a saved vial/reconstitution setup so logging is fast, a bidirectional units ⇄ dose calculator (a tracking aid, **not** dosing advice, with verified math and tests), injection-site logging with a simple body visual and rotation guidance, and reviewable/editable history. Full scope and the safety boundary on [[Peptides]].

**Peptide content safety, preserved.** VITA does not present research compounds as approved treatments. Educational content stays brief, factual, appropriately sourced when implemented, explicit about research vs approved status, and never prescribing. Catalog sourcing and the legal boundary remain [[Open Questions]] #17, owned by the founders, **before** implementation.

**Sequencing note — resolved.** [[Water]] owns its own goal and unit preference under `vita:v1:water:prefs`; [[Settings]] reads and writes that same source rather than creating a second one. Settings is now **Sprint 4**, immediately after this sprint. [[Open Questions]] #16, closed 2026-08-21.

## Sprint 4 — Settings + Tools Foundation ✅ Complete

**Final name: Settings + Tools Foundation**, renamed at closeout. **An intentional scope decision — not failed, abandoned, or cut short.** The sprint delivered the Settings foundation (persistent Appearance, real Units, honest rows, accurate version, clean Settings architecture) and the Tools foundation (top-level `/tools`, the Tools & Reference hub, [[Peptide Dose Calculator|Peptide Calculator]] and [[Injection Site Tracking|Injection Sites]] on canonical routes, the route/navigation foundation later Tools are built into) — then stopped deliberately before the presentation-heavy work. **All of it is preserved and is not rebuilt by Sprint 5**, along with the Body Map / injection-site primitives, domain logic, utilities, persistence and repositories. Remaining Tools work is **not cancelled**; it resumes under the Sprint 5 language.

Detail: [[Current Sprint]] and repo `docs/06-Slice-Tracker.md` → Sprint 4.

---

## Sprint 5 — VITA Identity & Interaction 🟡 In progress

**Status: opened 2026-09-02, branch `sprint-5-identity-interaction`. Slices 5.1, 5.2 and 5.3 are founder-approved on device and locked; 5.4 is next. Slices 5.4–5.10 are planned and each needs its own authorization.**

### Amended 2026-09-04 — the identity must reach every built surface

**Sprint 5 must apply the new VITA Identity & Interaction language across all already-built current product areas before [[My Journey|Journey]] begins.** The system it establishes is the **baseline for all future VITA feature work**, Journey included.

The ruling followed founder review of production [[Water]] and [[Dashboard]] — the first two real features in the new language. With two surfaces migrated and the rest untouched, VITA reads as two products, and shipping Journey into that state would add a third. **[[Fuel]] gains a dedicated identity slice it never had**, and Tools becomes **Tools + [[Settings]]**, because Settings is an equally built product surface.

| # | Slice | Status |
|---|---|---|
| 5.1 | VITA Design Language + Identity Prototype | ✅ Approved and locked |
| 5.2 | Interactive [[Water]] Experience | ✅ Approved and locked |
| 5.3 | [[Dashboard]] Identity Redesign | ✅ Approved and locked |
| 5.4 | [[Peptides]] Home Redesign | ⬜ **Next** |
| 5.5 | Routine + [[Injection Site Tracking\|Injection Site]] Experience | ⬜ Planned |
| 5.6 | **[[Fuel]] Identity Refresh** *(new)* | ⬜ Planned |
| 5.7 | **Tools + [[Settings]] Identity Integration** | ⬜ Planned |
| 5.8 | Motion + Microinteraction Unification | ⬜ Planned |
| 5.9 | [[BMI Calculator|BMI]] Calculator | ⬜ Planned |
| 5.10 | Founder Identity Audit — **gates Sprint 6** | ⬜ Planned |

**Nothing was cut** — one slice added, one broadened, four renumbered by one.

**Slice 5.10 reviews** Dashboard · Water · Peptides Home · Routine · Injection Sites · Fuel · Tools · Settings · shared motion and microinteraction behaviour · BMI · Light/Dark · Dynamic Type · Reduce Motion · accessibility · visual coherence · feature distinctiveness · card/surface discipline. **Primary founder question: *"Does current VITA now feel like one coherent product?"***

**One product language, not one identical layout.** Features share the premium dark foundation, direct-content hierarchy, restrained surfaces, feature colors, purposeful motion, tactile interaction, accessibility and real-data-only presentation — **not each other's layouts.** Water looks like Water, Peptides like Peptides, Fuel like Fuel, Journey like Journey. **Dashboard's widget-customization model is Home's own pattern**, not a template for other screens. **Dynamic Type:** VITA respects the platform text-size setting by default and builds no custom control.

*The pre-opening framing follows, as written 2026-09-01.*

**Status: planned, not opened. No implementation is authorized.**

**Objective:** make VITA feel unmistakably like VITA — establish the visual and interaction language before [[My Journey|Journey]] is built in it. **Deliverable:** a reusable VITA design and interaction language, applied to the surfaces that most need it and proven on a real device at founder review.

**Broader than styling.** Not a redesign sprint, a UI refresh, a visual-polish pass, or a design-system token exercise: it establishes how VITA looks, behaves, responds, and communicates interaction.

**The problem.** Many screens rely on the same pattern — dark background, large rounded card, text, icon, another rounded card — so features that behave very differently look like variations of one template.

**Target identity:** premium · dark · modern · tactile · interactive · visually recognizable · simple to understand · restrained rather than flashy · mature · useful · personality without becoming childish · purposeful visual feedback · stronger hierarchy · progressive disclosure · feature-specific visual objects · fewer generic full-width cards.

**Preserved foundation:** the black / near-black premium base · VITA branding · **gold as primary brand color** · premium typography · mature spacing · restrained feature colors · current product maturity. Feature colors become **functional** — gold VITA/Journey/brand, blue [[Water]], purple/violet [[Peptides]], orange [[Fuel]], green movement/activity — supporting indicators, interaction states, illustrations, visual objects, progress and motion rather than recoloring whole cards. This refines the permanent domain hierarchy in [[Color System]]; it does not replace it.

**Non-goals:** bright cartoon gamification · random glassmorphism · gradient overload · animation for decoration · a completely different aesthetic · an architecture, business-logic, persistence or repository rewrite · a generic motivational wellness-app redesign. **Working domain logic is untouched unless a concrete issue requires the change.**

**Screen directions** (direction, not implementation authorization) — [[Dashboard]] keeps its time-aware greeting and drops the generic slogan copy in favour of useful contextual information; [[Water]] may gain a premium hydration vessel as its hero interaction object with its data architecture untouched; [[Peptides]] Home is reorganised around *what do I need to do today?*; Routine puts immediate action first and administrative detail behind progressive disclosure; optional injection-site logging and an injection-rotation visualization are explored on the **shared** body-map primitive; Tools are integrated into the new language and eventually discoverable from Home. Full detail: repo `docs/04-Master-Roadmap.md` → Sprint 5 and `docs/Sprint-5-Identity-Brief.md`.

**[[BMI Calculator|BMI]] remains planned and is not cancelled** — deferred until the new language exists so it is designed once, in the new VITA system.

**Proposed slices — the 2026-09-01 draft. Superseded** by the approved audit (§S.2, nine slices) and then by the 2026-09-04 amendment (§S.3, ten slices) — see the table above.

| # | Slice (draft) |
|---|---|
| 5.1 | VITA Design Language — hierarchy, card usage, modules, spacing, typography, color behavior, visual objects, bottom sheets, primary/secondary actions, motion, haptics, completion states, progressive disclosure, reusable primitives |
| 5.2 | [[Dashboard]] Identity Redesign |
| 5.3 | Interactive [[Water]] Experience |
| 5.4 | [[Peptides]] Home Redesign |
| 5.5 | Routine + Injection Site Experience |
| 5.6 | Tools Integration |
| 5.7 | Motion + Microinteraction Pass |
| 5.8 | Founder Review / Identity Audit — *"Would I genuinely want to use this app every day?"* |

**Journey does not begin without explicit founder approval after the terminal audit — slice 5.10 since the 2026-09-04 amendment, written here as 5.8.**

---

## Sprint 4 — as originally planned *(historical, superseded)*

*Preserved as authored. The sprint opened against this and closed after slices 4.1 and 4.2; slices 4.3–4.8 were deferred, not cancelled.*

*Moved here by **founder decision 2026-09-01** — [[Settings]] was Sprint 7 and now runs immediately after [[Water]] + [[Peptides]], ahead of Journey. It is also **broadened**: the old sprint was "Settings / Account"; the founder-approved identity is now **Settings + Tools & Reference**.*

**Why the founders moved it.** [[My Journey|Journey]] / Weight is expected to be one of VITA's more complex feature areas. Organizing the utility/settings architecture first, building out the Tools that already exist, and establishing the reference/navigation structure means Journey is approached with cleaner app architecture and a more focused scope.

**Objective:** organize VITA's utility layer. **Deliverable:** a real Settings experience replacing today's shell, a coherent **Tools & Reference** destination, and the navigation structure that makes both discoverable.

**Planning level only — no slices are defined or approved.** Slices are scoped and approved under the normal slice workflow ([[Claude Workflow]]) when the founders open the sprint. Nothing below authorizes implementation.

### Settings

Core Settings screen structure · preferences and settings organization (profile, notifications, preferences, units, appearance, privacy) · clean navigation · visual consistency with the established design system · completion of the existing Settings placeholders. Placement is unchanged and still locked: top-right corner icon, never the dock ([[Navigation & Floating Dock]]).

**[[Water]]'s preferences land here.** Water owns its goal and unit preference under `vita:v1:water:prefs`; Settings reads and writes that same source rather than creating a second one ([[Open Questions]] #16, closed).

### Tools that already exist

Sprint 3 built these — **Sprint 4 is not building them from zero**, it organizes, polishes and expands the Tools experience around them:

- **Peptide Calculator** — the bidirectional vial/reconstitution ⇄ syringe-units conversion (slice 3.6), surfaced inline and standalone. [[Peptide Dose Calculator]].
- **Injection Sites and the interactive Body Model** — site taxonomy, tappable body map, accessible list fallback (slices 3.8–3.8C). [[Injection Site Tracking]].

### Tools that are planned

- **[[BMI Calculator]]** — height in, weight in, calculated BMI, category/range, and a polished visual scale. *Future opportunity, explicitly not now:* once Journey / Weight exists (**Sprint 6** since the identity insertion; Sprint 5 when this was written), BMI could read the user's stored height and latest weight instead of asking again.
- **[[Food & Product Scanner]] (Food Score)** — a Yuka-style scan-a-product evaluation. A **candidate**, not a guaranteed inclusion, and **likely the largest single Tools item** — it may need its own slice or planning pass.

### Reference

A future **[[Research Library]] / Reference** layer at concept level only: research library structure · peptide and compound reference material · storage and handling · reconstitution basics · stability and general reference · research/development/approval-status reference.

**⚠️ Product boundary — binding (restated 2026-09-01, Sprint 4 closeout).** VITA does **not** provide recommended dosages, dose ranges, or treatment-style protocols — for research compounds or for approved medications. **This is not a gated future feature. It is not a product direction.** Earlier wording framed such content as available with founder authorisation plus medical and legal review; that framing is withdrawn, because it described a direction the founders do not want. What VITA does is unchanged: **it helps users understand, calculate, organise and track information they enter.** Factual reference material — storage, handling, reconstitution concepts, stability, and development/approval status — remains a valid direction, still subject to the review gate in [[Open Questions]] #17.

### Discoverability

**Settings → Tools & Reference** as the primary path, plus a possible future Dashboard/Home shortcut into Tools **if product design supports it**. Exact placement is deliberately undecided; no [[Dashboard]] card is authorized by this page.

### Reminder delivery — carried forward from Sprint 3

Sprint 3 shipped **reminder preferences and a reminder time that persist** on a peptide routine (slice 3.9B). **OS notification delivery is not implemented** — a test asserts no notification dependency exists. Future reminder work, unscheduled: scheduled routine notifications · Taken / Skipped actions from a notification · delivery on the configured schedule days. Notification infrastructure is not automatically Sprint 4 scope.

## Sprints 6 & 7 — Journey / Weight and Journey / Photos

*Was Sprint 2 under the 2026-07-09 structure; the 2026-08-17 restructure split it into two sprints — Weight and Photos — the **2026-08-21 reorder** moved both behind Water + Peptides (to 4 and 5), and the **2026-09-01 reorder** moved both one place later again, to **5 (Weight)** and **6 (Photos)**, behind [[Settings]] + Tools & Reference.*

**⚠️ Deferred, not cancelled or reduced.** Journey remains a major pillar of VITA and its next major *feature* experience. **Every previously documented Journey requirement, slice, and decision stands unchanged** — weight planning, weight logging and history, the Journey data architecture, progress views, progress photos, photo comparisons, and the existing visual concepts. Only the scheduling moved. Nothing here has been narrowed because the sprint number changed. The founders moved Settings + Tools & Reference ahead of it precisely *because* Journey / Weight is expected to be complex: it benefits from cleaner app architecture and a more focused scope.

**Weight still comes before Photos.** Sprint 6 owns the core Journey data architecture that Sprint 7's photo experience builds on.

**Intentionally delayed until the identity sprint is approved.** The 2026-09-01 identity insertion moved both one place later so Journey is built in VITA's established visual and interaction language rather than one already targeted for replacement. **Journey is not redesigned by that decision and its scope is not reduced** — Sprint 5's language is what Journey is built *in*.

*The eight slices below were written as one sprint and have still not been divided between them; that split is a planning task for whenever Sprint 6 opens.*

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

Full proposal: [[Journey Stages]] · [[Product Philosophy]] · [[My Journey]].

## Sprint 8 — Atlas

*Was Sprint 4 under the 2026-07-09 structure, **Sprint 6** from the 2026-08-17 restructure, **Sprint 7** after the first 2026-09-01 reorder, and **Sprint 8** since the 2026-09-01 identity insertion. Its scope and slice list are unchanged — only the number moved.*

**Objective:** transform Atlas into a true AI health coach. **Deliverable:** an AI experience that feels proactive, intelligent, and deeply integrated throughout Vita.

**⚠️ This reverses a previously locked decision.** The repo Master Roadmap's original Atlas scope decision — "Atlas V1 is a polished placeholder only. Do not implement AI coaching yet" (logged in the [[Decision Log]]) — is directly superseded by this sprint. A new Decision Log entry records the reversal; see [[Atlas]] for how its Current/Target state framing was updated to match.

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

*Sprint numbers in this section are the **old 2026-07-09 numbering** and no longer correspond to the current plan.*

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

*Sprint numbers in this section are the **old 2026-07-09 numbering** and no longer correspond to the current plan.*

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

## Beta — superseded by Sprint 9 — Final Polish / Motion / Launch Experience

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

### What Sprint 9 owns — and what it does not (founder direction, 2026-08-18)

*Renumbered and renamed 2026-09-01 — this was Sprint 8 — Final Polish & Animations. **It is distinct from Sprint 5's motion work and neither replaces the other:** Sprint 5 establishes the interaction vocabulary; Sprint 9 applies it app-wide and finishes the launch experience.*

Sprint 9 owns the **global** layer: the shared motion system, haptics vocabulary, transition consistency, and app-wide micro-interaction standards. It is **not a holding pen for every feature's visual debt.** If Fuel still feels bulky once its functionality is finished, it gets its own refinement slice inside Sprint 2 (above) — the same principle applies to later sprints. Feature-specific motion may land earlier where it genuinely belongs to that feature; Sprint 8 then reconciles it into one vocabulary.

Motion stays restrained — **premium micro-interactions, not novelty animation.** VITA does not become a cartoon or a game. Named candidates: small food-icon movement on a successful log · smooth macro/progress animation · gentle confirmation transitions · water fill animation · peptide injection-site selection feedback · card state transitions · progress changes. See [[Motion & Animation]].

---

## Gaps worth founder attention

Flagging rather than silently resolving, per the vault's standing rule to never invent an answer.

**✅ Resolved by the 2026-08-17 restructure:**

1. ~~**[[Water]] has no sprint anywhere.**~~ Now **Sprint 3 — Water + Peptides** (numbered 5 when the gap closed on 2026-08-17; moved ahead of Journey by the 2026-08-21 founder reorder).
2. ~~**[[Peptides]] has no sprint anywhere.**~~ Same — **Sprint 3**.
3. ~~**[[Settings]] has no sprint anywhere.**~~ Now **Sprint 4 — Settings + Tools Foundation**, complete (Sprint 7 when the gap closed on 2026-08-17; moved forward and broadened on 2026-09-01, then closed and renamed the same day). This was the most concerning of the three: Settings is part of the founder-stated five-item primary navigation ([[Decision Log]]) and currently only exists as an empty shell. Its placement was locked 2026-07-09; its feature work is now the **next** sprint.

**Still open:**

4. **Several slices are named without a backing Innovation Lab idea note:** Restaurant Support (now inside Sprint 2 — Fuel), Oura and WHOOP Integration (Health, now unscheduled), Smart Notifications, Themes & Personalization, and Subscription Experience (Premium, now unscheduled). Not a problem, just an inconsistency with how the rest of the Lab→Roadmap flow has worked — worth backfilling idea notes if the founders want the Lab to stay the complete record.

5. **⚠️ New: Health and Premium are no longer scheduled, orphaning five promoted Lab ideas.** [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], and [[Voice Atlas]] were promoted to 📋 Planned because the 2026-07-09 roadmap named them directly. The 2026-08-17 restructure drops both sprints, so none of the five has a scheduled sprint now. [[Mobile Order Screenshot Import]] is in the same position after being deferred out of Sprint 2's approved scope. Their status has **not** been reverted — the founders should decide whether these get a future sprint, return to 📝 Defined, or stay 📋 Planned pending a post-V1 roadmap. Tracked as [[Open Questions]] #14.

## Version 1 goal

Updated against the current sprint set (2026-08-17 restructure, reordered 2026-08-21 and 2026-09-01, Sprint 5 inserted 2026-09-01): Version 1 is complete when **Sprint 9 — Final Polish / Motion / Launch Experience** finishes — every primary screen at production quality, complete navigation, visual consistency in both themes, and Atlas functioning as a real AI coach (not a placeholder).

## Current priority

**Sprint 5 — VITA Identity & Interaction is in progress**, opened 2026-09-02 on `sprint-5-identity-interaction`. Slices 5.1, 5.2 and 5.3 are founder-approved and locked; **5.4 — Peptides Home Redesign is next** and needs its own authorization. Sprint 3 is merged into `main` (`2bac43b`) and Sprint 4 merged as `8dce19c`. **Sprint 6 — Journey / Weight does not begin until slice 5.10 passes founder real-device review.** *(Superseded text follows, from before Sprint 4 opened.)* Strictly sequential, one sprint at a time, consistent with [[Core Principles]] #7 ("Build in Slices") applied at the sprint level.

## Remaining unscheduled ideas

What's still genuinely future/unscheduled after this roadmap's promotions — everything else, cross-check against [[Innovation Lab]] for the full list:

- [[Longevity Dashboard]] (see the note in the unscheduled **Health** section above)
- [[Advanced Coaching (Proactive Check-Ins)]] (adjacent to the Recommendations slice of **Sprint 8 — Atlas** and to Smart Notifications in the unscheduled Premium set, not explicitly named)
- [[AI Meal Photo Recognition]] and [[Smart Fridge Scanner]] (neither named in this roadmap)

Nothing graduates from the Lab to a sprint without passing the VITA Promise ([[Product Philosophy]]) and the ten-year test ([[Core Principles]]) — the promotions logged in this update reflect the founders naming them directly in the official roadmap, which satisfies that bar by definition.

## Sprint completion criteria

All planned slices finished · all audits passed · documentation updated · founder approval received. Only then does the next sprint begin.

**Related:** [[Project Status]] · [[Current Sprint]] · [[Innovation Lab]] · [[Long-Term Vision]] · [[Decision Log]] · [[Open Questions]]
