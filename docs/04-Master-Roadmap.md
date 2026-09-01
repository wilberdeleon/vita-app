# VITA — Master Roadmap

The Master Roadmap defines the long-term development plan for VITA.

It outlines the major phases, sprints, and milestones that move the product from concept to release.

It intentionally avoids implementation details. Those belong in the Slice Tracker and Technical Documentation.

**Source of truth:** this file mirrors the founders' official Sprint Roadmap. **Reordered 2026-09-01 (founder decision): Settings + Tools & Reference moves ahead of Journey.** The order is now Fuel → Water + Peptides → **Settings + Tools & Reference** → Journey / Weight → Journey / Photos → Atlas → Final Polish. Journey is deferred, not cancelled or reduced — see "What changed in the 2026-09-01 reorder" below. *(This supersedes the 2026-08-21 reorder, which had put Water + Peptides ahead of Journey and left Journey / Weight at Sprint 4 — that reorder's own record is preserved further down.)* **Restructured 2026-08-17 (founder authorization, Sprint 2 approval)** — this supersedes the 8-sprint structure issued 2026-07-09 (Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta) that previously lived here. See "What changed in the 2026-08-17 restructure" below for what moved and what is no longer scheduled. Vita HQ (`docs/Vita HQ/01 Vision/Roadmap.md`) mirrors this page; update both together if the plan changes again.

---

# Current Stage

**Sprint 3 — Water + Peptides** · Status: 🟡 Feature-complete, closeout audit built and pending founder review (opened 2026-08-22, branch `sprint-3-water-peptides`)

Objective: turn Water and Peptides from the Sprint 0 placeholder logs they still are into real, persisted, date-aware features at the quality bar Sprint 2 set for Fuel.

Everything before it is complete: Sprint 0, Sprint 0.1, Sprint 1, the App-Wide Visual Consistency Pass, and **Sprint 2 — Fuel** (audited and merged into `main` 2026-08-21, merge commit `44eeae6`, closed by `473cb59`).

Sprint 3's planning and architecture audit is founder-approved and all three entry conditions were met. **All implementation slices, 3.1 through 3.9B, are built; 3.9B is founder-approved on device.** Slice 3.10 — the closeout audit — is built and pending founder review; it fixed nine defects, referred four findings back to the founder as product decisions, and recorded one release gate (peptide reference content requires expert medical/legal review before public release). Slice-by-slice detail is in `docs/06-Slice-Tracker.md`; findings are in `docs/07-Audit-Log.md`.

**Sprint 3 is not marked complete here.** Closure waits on founder review of the 3.10 audit and an explicit closeout approval, per the sprint workflow. Sprint 3 is **feature-complete with its final audit/closeout underway** — not merged, not closed.

**The next sprint is Sprint 4 — Settings + Tools & Reference**, per the founder reorder of 2026-09-01 recorded below. **No Sprint 4 work has started**, and none starts until the founders close Sprint 3 and separately authorize Sprint 4.

---

# Development Philosophy

We build in three levels.

Project → Sprint → Slice

Projects define the product. Sprints define major milestones. Slices define individual features.

---

# Sprint Plan (official — founders 2026-08-17, reordered 2026-08-21 and again 2026-09-01)

| Sprint | Objective | Status |
|---|---|---|
| 0 — Visual Foundation | Establish identity, vision, architecture, and the application shell | ✅ Complete |
| 0.1 — Polish | Global design polish over the Sprint 0 shell | ✅ Complete |
| 1 — Dashboard / Home | Build the Home experience that defines the quality standard for the app | ✅ Complete |
| — App-Wide Visual Consistency Pass | Migrate every screen onto the theme system Sprint 1 established | ✅ Complete |
| 2 — Fuel | Build the smartest nutrition experience possible | ✅ Complete |
| **3 — Water + Peptides** | **Bring both daily logs to real, persisted functionality — VITA's daily health-tracking infrastructure** | **🟡 Current** |
| **4 — Settings + Tools & Reference** | Settings architecture, a coherent Tools destination, and the reference layer | ⬜ **Next** |
| 5 — Journey / Weight | The weight half of the Journey experience, and the core Journey data architecture | ⬜ Planned |
| 6 — Journey / Photos | The transformation-photo half of the Journey experience | ⬜ Planned |
| 7 — Atlas | Transform Atlas into a true AI health coach | ⬜ Planned |
| 8 — Final Polish & Animations | Motion, micro-interactions, and final quality pass | ⬜ Planned |

---

# Sprint 0 — Visual Foundation ✅

Objective: create the application's foundation.

Deliverables: Brand Identity · Product Vision · Atlas Identity · Navigation Architecture · Design Language · UI Direction · Product Documentation · Design Bible · Development Workflow · Innovation Lab · Core Planning. On the application-code side: the repository scaffold, theme + UI kit, floating dock, auth/Supabase architecture, and the Dashboard/Fuel/Water/Peptides/My Journey/Atlas/Settings screens — tracked slice-by-slice in `docs/06-Slice-Tracker.md` as slices 0.1–0.12.

Status: ✅ Complete

---

# Sprint 0.1 — Polish ✅

Objective: a global design polish pass over the Sprint 0 shell.

Delivered: the permanent domain color hierarchy, refined floating dock, softer Apple-style shadows, subtle motion. Tracked as slice 0.12.

Status: ✅ Complete

---

# Sprint 1 — Dashboard / Home ✅

Objective: build the Home experience that defines the quality standard for the entire application.

**Two prerequisite decisions, founders, 2026-07-09** — both shipped in this sprint:
- **Theme:** VITA supports both Light Mode and Dark Mode, built on reusable semantic design tokens from the start, not hardcoded colors.
- **Navigation:** Settings remains permanently in the top-right corner and is never part of the floating dock. The dock stays a fixed 4 items (Home, Fuel, Journey, Atlas).

The original nine-slice plan was superseded mid-sprint by a full design pivot — the "Mountain World" photo-background concept was abandoned once the founders supplied real Light + Dark mockups declared "the new foundation, not another iteration." What shipped: a real Light/Dark/System theme system and a rebuilt Home dashboard. Full detail in `docs/06-Slice-Tracker.md`.

Status: ✅ Complete (2026-08-02)

---

# App-Wide Visual Consistency Pass ✅

Not a sprint and not a feature pass — a design-system migration run between Sprint 1 and Sprint 2. Sprint 1 built the theme system but scoped it to Home; every other screen still imported the flat, light-only palette directly and was structurally incapable of rendering dark. This migrated all of them onto `useTheme().surfaces`.

No routes, tabs, sections, data, navigation, interactions, or copy changed. Full detail in `docs/06-Slice-Tracker.md`.

Status: ✅ Complete (2026-08-16), founder-approved on a physical iPhone

---

# Sprint 2 — Fuel ✅

Objective: build the smartest nutrition experience possible.

Deliverable: a complete food logging experience centered on simplicity, speed, and correct data — where the same nutrition state drives both Fuel and Home.

**Founder-approved architecture (2026-08-17):** prove the nutrition engine before introducing external providers. Full blueprint in the Sprint 2 Fuel plan; slice-by-slice progress in `docs/06-Slice-Tracker.md`.

Slices: Nutrition Foundation · Core Logging (manual food → log → meal → totals → edit/delete) · Home Integration · Recents / Favorites / Custom Foods · Provider Layer · Food Search · Barcode Scanner · Edge Cases & Polish · **Fuel Visual Refinement** · Final Verification.

**Binding constraints for this sprint:**
- **Do not upgrade the Expo SDK.** The App Store Expo Go build is still SDK 54; SDK 55–57 builds remain in Apple review. If a dependency requires an upgrade, stop and report before proceeding.
- **No provider secrets in the client.** Any provider requiring server-side credentials goes behind a minimal Supabase Edge Function, narrowly scoped to provider access — not a broad Supabase or auth migration.
- **Provider licensing is a hard constraint.** Verify current licensing, attribution, storage, and caching terms before caching or persisting any third-party nutrition data.
- **The approved visual design is locked.** Fuel is not redesigned; new functional states follow the established system with Home as the visual source of truth.

## Fuel Visual Refinement — added 2026-08-18 (founder direction)

A dedicated late slice, scheduled **after the functional slices are stable and before Final Verification**. Sprint 2 continues to prioritize functionality first; this is where presentation catches up before Fuel is called finished.

The founders' assessment of Fuel as built today: too basic, too bulky, over-reliant on large numbers, and filling space simply because space exists — calorie and nutrition values in particular grow disproportionately large and dominate whole screens. It reads as a functional prototype rather than a refined production health app.

**Scope is presentation only. The feature architecture does not change** — same screens, same flows, same data model, significantly more refined presentation. What the slice evaluates: information density · typography scale · number sizing · spacing · card sizing · empty space · hierarchy · search-result density · Food Detail density · logging confirmation · meal rows · Food Log presentation.

Fuel-specific micro-interactions may be introduced here rather than deferred wholesale to Sprint 8 — see Sprint 8 below for the division. Design direction detail lives in `docs/05-Design-System.md` → "Future direction (founder direction, 2026-08-18)". **Contextual food visuals** (small food illustrations/icons) are a related but separate, currently unscheduled concept — parked in `docs/10-Ideas-Parking-Lot.md`, not part of this slice unless the founders scope it in.

*Recorded ahead of time as founder-stated direction; it shipped as slice 2.9 and is founder-approved. See `docs/06-Slice-Tracker.md`.*

Status: ✅ Complete — audited 2026-08-21, merged into `main` as `44eeae6`

---

# Sprint 3 — Water + Peptides

Objective: build out VITA's daily health-tracking infrastructure beyond food — turn Water and Peptides from the lightweight logs they are today into real, persisted, date-aware features.

Deliverable: Water and Peptides as genuinely functional health-tracking experiences, at the quality bar Sprint 2 set for Fuel, feeding the compact Hydration and Peptides modules on the redesigned Fuel screen.

**Moved here 2026-08-21 by founder decision** — was Sprint 5 under the 2026-08-17 structure. Nothing in its scope was cut; only its position changed. The reasoning: establish more of VITA's daily health-tracking infrastructure before starting the larger Journey experience. See "What changed in the 2026-08-21 reorder" below.

**Resolves a previously flagged gap.** Water and Peptides had no sprint anywhere in the 2026-07-09 roadmap — logged as Gap #1 and #2 there and as Open Question #11. The 2026-08-17 restructure closed that gap; this reorder moves the sprint earlier.

## Entry conditions

Sprint 3 opens only after all three are true:

1. Sprint 2 final physical-device QA is accepted by the founders. ✅ Done 2026-08-21.
2. Sprint 2 is merged into `main`. ✅ Done 2026-08-21 (merge commit `44eeae6`).
3. A fresh sprint branch is created off `main` — expected name `sprint-3-water-peptides`. ✅ Done 2026-08-22 (cut from `main` at `4ab32c5`).

All three met. Sprint 3 is open; slice-by-slice progress is tracked in `docs/06-Slice-Tracker.md`.

## Why Water and Peptides are one sprint

Both already live inside the Fuel / daily-health-tracking ecosystem, and both need the same class of machinery: daily logging, a user goal or saved setup, history, editing, persistence, date awareness, daily rollover, and a compact summary surfaced on Fuel. Building them together means that machinery is designed once, with two real consumers proving it, rather than being invented twice.

**This is not an instruction to force one universal data model.** Shared infrastructure exists only where it is genuinely reusable — date-keyed daily logs, persistent repositories, add/edit/delete flows, daily summaries, history, Fuel landing summaries, and app-lifecycle date rollover are the plausible candidates. A hydration entry (an amount and a unit) and a peptide administration (a compound, a reconstitution-derived dose, a site, a time) have genuinely different domain shapes; where they differ, they stay separate. Sprint 2's Food Definition ≠ Food Entry separation is the precedent for keeping distinct concerns distinct.

## Fuel ownership — Sprint 3 extends Fuel, it does not redesign it

The redesigned Fuel screen is approved and finished. Its compact **Hydration** and **Peptides** modules are the entry points and daily summaries for this sprint's work — Sprint 3 backs them with real functionality and real numbers instead of mock values.

**No second Fuel landing redesign is planned or authorized.** Sprint 3 changes what those modules display and where tapping them leads; it does not re-open Fuel's layout, hierarchy, or visual system.

## Proposed slices — reconciled 2026-08-21

Sprint 3 is substantial enough that it must not be treated as one implementation task. The six-slice plan recorded 2026-08-18 is preserved below and expanded into ten controlled slices; every original slice survives, and the additions are a shared-foundation slice at the front, finer splits inside Water and Peptides, and an audit slice at the end — matching how Sprint 2 was actually run.

**Slice names and boundaries remain illustrative and are not yet approved.** The sprint is planned and opened properly under the normal slice workflow once the entry conditions above are met.

| # | Slice | Scope | 2026-08-18 slice it derives from |
|---|---|---|---|
| 3.1 | Sprint Foundation / Shared Daily Tracking Architecture | The genuinely shared pieces only: date-keyed daily log patterns, persistence layer, daily rollover on app lifecycle, and the Fuel-summary contract | new — extracted from slices 1 and 3 |
| 3.2 | Water Data Model + Persistence | Hydration entry model, unit model (cups · oz · mL · L), goal storage, date-aware daily state | Water Foundation |
| 3.3 | Water Logging + Goal Experience | User-defined goal flow, quick-add amounts, custom amount, edit/remove a logged entry | Water Foundation |
| 3.4 | Water Visual Polish / Fuel Integration | Progress visualization, the Fuel Hydration module backed by real data, motion and refinement | Water Experience |
| 3.5 | Peptide Definition + User Setup Architecture | Catalog + Custom, the three-part model, vial amount, reconstitution volume, start date, saved setup | Peptide Data Foundation |
| 3.6 | Peptide Logging + History | Log entry flow, history list, editing, deletion, date awareness | Peptide History & Polish |
| 3.7 | Dose / Unit Calculator | The reconstitution model and bidirectional syringe units ⇄ mg/mcg conversion, with tests | Peptide Calculator |
| 3.8 | Injection Site Tracking | Site picker, simple body visual, recent-site history, rotation information | Injection Site Tracking |
| 3.9 | Peptide UX / Fuel Integration | The Fuel Peptides module backed by real data, disclaimer placement, interaction refinement | Peptide History & Polish |
| 3.10 | Sprint Audit / Polish | Integrated-system audit, calculator test coverage, edge cases, final verification | new — mirrors Sprint 2's closeout |

**Carried forward from the Sprint 2 closeout audit:** Sprint 2 shipped without a committed test suite, and that audit recommended adding one as the first task of the next sprint. That recommendation now lands on Sprint 3 — which is a good fit, since the dose/unit calculator (3.7) requires thorough tests regardless. See `docs/07-Audit-Log.md` (2026-08-21).

### Water — direction

*Preserved from the founder direction recorded 2026-08-18. Unchanged by the reorder.*

Water exists conceptually inside Fuel today and was deliberately **not** a Sprint 2 focus: Sprint 2 preserved its entry points and necessary integration only, and did not remove it. The deep hydration work belongs here.

The target is a small, useful hydration system rather than a static `5 of 8 cups` counter:

- **User-defined daily goal** in cups, ounces, millilitres, or litres. VITA does not assume every user wants exactly 8 cups. The goal persists until changed. Flow: set goal → log throughout the day → see progress toward it. The long-term goal *preference* may end up owned by Settings (**Sprint 4**, moved up by the 2026-09-01 reorder) — sequencing question, tracked in Vita HQ `00 HQ/Open Questions.md`.
- **Fast logging** via quick amounts (e.g. +8 / +12 / +16 / +24 oz) plus a custom amount, following the user's unit system.
- **Editing and removing** a logged amount where appropriate — a mis-tap should not be permanent.
- **A more satisfying progress visual** — fill level, bottle/glass, circular progress, fluid motion, or a clean bar. **Do not assume a literal animated water bottle is automatically right**; design it inside VITA's premium visual system.
- **Date-aware behavior:** today's intake, daily rollover, goal, progress, and history later. Full hydration analytics are out of scope unless explicitly planned.
- **Synchronization with Fuel** — the Hydration module on the Fuel screen reads the same state, so the two never disagree.

### Peptides — direction

*Preserved from the founder direction recorded 2026-08-18. Unchanged by the reorder.*

Peptides should become a genuinely interactive tracker rather than a basic logging form, while staying **informational and tracking-oriented**. Founder-stated scope: peptide/product being tracked · vial amount · reconstitution volume · dose · syringe units · injection site · date/time · notes · history · site rotation.

- **Catalog + Custom.** A searchable/selectable peptide list — approved peptide-based medications where appropriate, common research peptides, and a Custom option for anything not listed. Data sourcing and product/legal boundaries must be defined **before** implementation. No catalog data is authored during planning.
- **Short educational information** per peptide — name, category/class, general mechanism, target/receptor context, high-level research purpose. Brief, factual, and sourced when implemented. No medical claims are authored in advance of that review.
- **⚠️ Safety/medical boundary.** The feature must clearly distinguish FDA-approved medications from investigational/research compounds, and must not present research compounds as approved treatments. An unobtrusive disclaimer — informational purposes, not medical advice, consult a healthcare professional, research compounds may not be approved for human use — with placement decided during implementation. Exact copy is reviewed then, not now. Do not make the app unusable with a giant disclaimer on every screen. VITA does not prescribe.
- **Vial / reconstitution model and a bidirectional calculator.** Given vial amount + reconstitution volume (e.g. 10 mg vial, 1 mL bacteriostatic water): entering syringe units shows the calculated mg/mcg dose, and entering a mg/mcg dose shows the equivalent syringe units. This exists specifically because many users think in syringe units and do not intuitively do the conversion. It is a tracking and calculation aid, **not dosing advice**. It must be implemented transparently, with **verified math, normalized internal units (mg · mcg · mL · syringe units — never free-form strings for dose math), and thorough tests**.
- **Saved regimen/setup** — peptide, vial strength, reconstitution amount, start/setup date, typical dose, schedule where appropriate — so daily logging is fast and vial math is not retyped per injection. Flow: Peptides → select active peptide → enter dose/units → select site → log.
- **Injection site logging and rotation.** Site taxonomy (abdomen/left/right, thigh/left/right, upper arm, other) researched at implementation. A simple body/model graphic to tap — a clean visual aid, **not** a complex 3D model unless later justified. Rotation support (remember recent sites, show last used, highlight recent areas, suggest another eligible area) is presented as **organizational guidance, not personalized medical advice**; any claim about injection technique or site selection must be sourced and reviewed.
- **History** — date, peptide, dose, units, site, notes, with viewing, editing, and appropriate deletion, all date-aware. Frequency/consistency/site-rotation views are possible later; complex health analytics are not added automatically.
- **Data architecture:** keep **Peptide Definition** (what the compound is), **User Peptide Setup** (this user's vial/reconstitution configuration), and **Peptide Log Entry** (one recorded administration) as three separate concerns — mirroring the Food Definition ≠ Food Entry separation Sprint 2 established. Do not collapse them into one record. See `docs/09-Technical-Documentation.md` → "Future architecture considerations".

Standalone proposals for the calculator and site tracking live in the Vita HQ Innovation Lab; this section is the sprint-scope view, not the full proposal.

**Not a provider-integration sprint.** FatSecret and restaurant provider selection stay deferred to launch readiness — see "Launch readiness follow-ups" at the end of this document. Nothing from that list moves into Sprint 3.

Status: 🟡 Feature-complete — **final audit / closeout**. Opened 2026-08-22 on branch `sprint-3-water-peptides`; all implementation slices are built and slice 3.10 (closeout audit) is built and pending founder review. Tracked in `docs/06-Slice-Tracker.md`. **Not merged and not closed.**

---

# Sprint 4 — Settings + Tools & Reference

Objective: organize VITA's utility layer — build the Settings architecture, give the Tools that already exist a coherent home, and establish the reference/navigation structure the rest of the app can grow into.

Deliverable: a real Settings experience replacing today's shell, a **Tools & Reference** destination that gathers VITA's calculators and reference material, and the navigation structure that makes both discoverable.

**Moved here 2026-09-01 by founder decision** — Settings was Sprint 7 under the 2026-08-21 order and now runs immediately after Water + Peptides, ahead of Journey. The reasoning: Journey / Weight is expected to be one of VITA's more complex feature areas, and the founders would rather organize the utility/settings architecture, build out the Tools that already exist, and establish the reference/navigation structure first — so Journey is approached with cleaner app architecture and a more focused scope. See "What changed in the 2026-09-01 reorder" below.

**This sprint is documented at a planning level only.** Nothing below is an approved slice. Slices are defined, scoped, and approved under the normal slice workflow when the founders open the sprint.

## Settings

- Core Settings screen structure — the shell built in slice 0.9 becomes a real screen.
- Preferences and settings organization: profile, notifications, preferences, units, appearance, privacy.
- Clean navigation into and within Settings, consistent with the permanently locked top-right placement.
- Visual consistency with the established design system; Home remains the visual source of truth.
- Completion of existing Settings placeholders.

**Water's preferences land here.** Water owns its goal and unit preference under `vita:v1:water:prefs` (founder decision 2026-08-21). Settings reads and writes that same source rather than creating a second one that can disagree with it — see `docs/09-Technical-Documentation.md`.

## Tools — what already exists

Sprint 3 already built these. **Sprint 4 is not building them from zero** — it organizes, polishes, and expands the Tools experience around them:

- **Peptide Calculator** — the bidirectional vial/reconstitution ⇄ syringe-units conversion, shipped in slice 3.6 and surfaced both inline and standalone.
- **Injection Sites / interactive Body Model** — the site taxonomy, tappable body map, and accessible list fallback, shipped across slices 3.8–3.8C.

Bringing them into one coherent Tools destination is the work; their behavior is not reopened.

## Tools — planned

- **BMI Calculator** — see "BMI Calculator direction" below.
- **Food / Product Scanner (Food Score)** — a candidate for this sprint, not a guaranteed inclusion; see "Food / Product Scanner direction" below.

## Reference — potential scope

A **Research Library / Reference** layer, at concept level only:

- Research library structure
- Peptide and compound reference / educational material
- Storage and handling reference
- Reconstitution education
- Stability and general reference
- Research / development / approval-status reference

**Product boundary — binding.** VITA does **not** casually provide "recommended dosage" or prescriptive protocols for unapproved or research compounds. Dose-range or treatment-style content requires explicit founder authorization plus appropriate medical, legal, and content review. The standing boundary: **VITA helps users understand, calculate, organize, and track information they enter; it does not silently become a treatment recommendation engine.** This extends the Sprint 3 safety rules rather than relaxing them — see `docs/07-Audit-Log.md` for the Sprint 3 release gate on peptide reference content, and Vita HQ `00 HQ/Open Questions.md` #17.

## Discoverability

- **Settings → Tools & Reference** as the primary path.
- A future Dashboard/Home shortcut into Tools, **if product design supports it.** Exact placement is deliberately undecided, and no Dashboard card is authorized by this document.

## BMI Calculator direction

Planned Tools item. Potential UX: a height input, a weight input, the calculated BMI, its category/range, and a polished visual representation of where the value sits on the scale.

**Future opportunity, not this sprint:** once Journey / Weight exists (Sprint 5), BMI could read the user's stored height and latest weight instead of asking for them again. That integration is explicitly **not** built now — Journey owns that data and does not exist yet.

## Food / Product Scanner direction

Documented as a **future Sprint 4 candidate**, not a trivial add. The concept is a Yuka-style food/product scanner: scan a barcode or product and get an easy-to-understand evaluation.

Potential future components: barcode scanning · ingredient and nutrition information · an understandable score or evaluation · an explanation of *why* the product scored the way it did · suggested alternatives, later.

**This is likely the largest single Tools item and may require its own slice or planning pass.** VITA already has real barcode scanning and the Open Food Facts / USDA provider layer from Sprint 2, which is a starting point and not a solution — scoring methodology, its defensibility, and how a score is explained are unresolved product questions. Nothing here is scoped or approved.

## Reminder delivery — carried forward from Sprint 3

Sprint 3 shipped **reminder preferences and a reminder time that persist** on a peptide routine (slice 3.9B). **OS notification delivery is not implemented** — a test asserts no notification dependency exists in the app.

Future reminder work, unscheduled and not authorized here: scheduled routine notifications · Taken / Skipped actions from a notification · delivery on the configured schedule days. Notification infrastructure is not built in this document and is not automatically Sprint 4 scope.

Status: ⬜ Planned — **next**, not opened. No implementation has started.

---

# Sprint 5 — Journey / Weight

Objective: build the weight half of Vita's emotional core.

Deliverable: a Journey experience that motivates through progress, not just data display — weight logging, weight history, and the foundational Journey data architecture everything later builds on.

**Deferred, not reduced (founder decisions 2026-08-21 and 2026-09-01).** This was Sprint 3 under the 2026-08-17 structure, Sprint 4 after the 2026-08-21 reorder, and is now Sprint 5. Journey remains a major pillar of VITA and its next major *feature* experience. **Every previously documented requirement, slice, and decision stands unchanged** — only its position in the sequence moved. The founders moved Settings + Tools & Reference ahead of it precisely *because* Journey / Weight is expected to be complex: it gets cleaner app architecture and a more focused scope by going second.

The eight slices written for Journey under the earlier structure (Journey Overview · Journey Timeline · Milestones · Achievements · Streak System · Rewards & Celebrations · Journey Detail Screen · Journey Polish) were authored as one sprint and have still not been divided between Weight and Photos. That split is a planning task for whenever this sprint opens. See Vita HQ `01 Vision/Roadmap.md`.

**⚠️ Design-risk flag (Streak System), carried forward from the 2026-07-09 roadmap:** a literal streak that resets to zero on a missed day conflicts with the "Progress over Perfection" principle and the "no guilt mechanics — ever" rule that Journey Stages was explicitly built to satisfy. Resolve the design approach (grace days, a non-punishing "current run" reframing, etc.) before that slice starts.

**Downstream opportunity:** once weight and height are stored here, the Sprint 4 BMI Calculator could read them instead of asking again. Recorded as an opportunity, not a commitment.

Status: ⬜ Planned

---

# Sprint 6 — Journey / Photos

Objective: build the transformation-photo half of the Journey experience.

Deliverable: photo capture, comparison, and progress storytelling that makes change visible.

**Deferred, not reduced.** This was Sprint 4 under the 2026-08-17 structure, Sprint 5 after the 2026-08-21 reorder, and is now Sprint 6. Progress photos, photo comparison, and the existing visual concepts are all preserved exactly as documented; only the sprint number changed. It stays immediately after Journey / Weight, which owns the core Journey data architecture it depends on.

Status: ⬜ Planned

---

# Sprint 7 — Atlas

Objective: transform Atlas into a true AI health coach.

Deliverable: an AI experience that feels proactive, intelligent, and deeply integrated throughout Vita.

**⚠️ Scope reversal, carried forward:** this supersedes the original "Atlas V1 is a polished placeholder only — do not implement AI coaching yet" decision. Current app code is still a placeholder; only the plan changed.

**Renumbered 2026-09-01** — Atlas was Sprint 6 under the 2026-08-17 restructure and is now Sprint 7. Its scope and slice list are unchanged; it remains the last feature sprint before the final polish pass.

Slices: Atlas Home · Chat Experience · Meal Planning (promoted Innovation Lab idea) · Workout Planning (promoted Innovation Lab idea) · Health Guidance · Memory & Context · Recommendations · Atlas Polish.

Status: ⬜ Planned

---

# Sprint 8 — Final Polish & Animations

Objective: the final quality pass before release.

Deliverable: motion, micro-interactions, accessibility, performance, and overall polish across the finished product.

**Relationship to per-sprint polish (founder direction, 2026-08-18).** Sprint 8 owns the *global* layer: the shared motion system, haptics vocabulary, transition consistency, and app-wide micro-interaction standards. It is **not** a holding pen for every feature's visual debt — if Fuel still feels bulky once its functionality is finished, it gets its own refinement slice inside Sprint 2 (see above), and the same principle applies to later sprints. Feature-specific motion may land earlier where it genuinely belongs to that feature; Sprint 8 then reconciles it into one vocabulary.

Motion direction stays restrained: premium micro-interactions, not novelty animation. Candidates the founders have named — a small food-icon movement on successful logging, smooth macro/progress animation, gentle confirmation transitions, water fill animation, peptide injection-site selection feedback, card state transitions, progress changes. VITA does not become a cartoon or a game. See `docs/05-Design-System.md` → "Future direction" and Vita HQ `03 Design/Motion & Animation.md`.

Status: ⬜ Planned

---

# What changed in the 2026-09-01 reorder

**Founder decision: Settings + Tools & Reference moves ahead of Journey.**

**Why.** Journey / Weight is expected to be one of VITA's more complex feature areas. The founders would rather organize VITA's utility and settings architecture first, build out the Tools that already exist into something coherent, and establish the reference/navigation structure — and then approach Journey / Weight with cleaner app architecture and a more focused scope.

**This is a sequencing change only.** No sprint's scope was cut, reduced, or cancelled. **Journey is deferred to Sprint 5, not cancelled.**

| Sprint | Was (2026-08-21) | Now (2026-09-01) |
|---|---|---|
| 3 | Water + Peptides | Water + Peptides — unchanged (current, in closeout) |
| 4 | Journey / Weight | **Settings + Tools & Reference** (was Sprint 7, and expanded) |
| 5 | Journey / Photos | **Journey / Weight** (was Sprint 4) |
| 6 | Atlas | **Journey / Photos** (was Sprint 5) |
| 7 | Settings / Account | **Atlas** (was Sprint 6) |
| 8 | Final Polish & Animations | Final Polish & Animations — unchanged |

**Sprint 4 is renamed as well as renumbered.** The founder-approved identity is **Settings + Tools & Reference** — not "Settings & Miscellaneous", not "Utilities", not "the Tools sprint". It is broader than the old "Settings / Account" sprint: it also owns the Tools destination and the reference layer.

**Preserved explicitly:**

- **Journey is deferred, not cancelled or reduced.** Weight planning, weight logging and history, the Journey data architecture, progress views, progress photos, photo comparisons, and every existing visual concept stand exactly as documented. Only the scheduling changed.
- **Journey / Weight still comes before Journey / Photos.**
- **Atlas's scope is unchanged** — only its number, 6 → 7.
- **Sprint 3's scope and status are unchanged.** It is feature-complete and in final audit/closeout; it is not marked complete by this reorder.
- **Sprint 8 remains the final broad polish and animation pass.**
- **Health and Premium remain unscheduled**, and the orphaned Innovation Lab ideas keep their 📋 Planned status. This reorder does not resolve that.

---

# What changed in the 2026-08-21 reorder

*Historical record. **The sprint numbers in this section are superseded by the 2026-09-01 reorder above** — 4, 5, 6 and 7 have since moved. What stands from this decision is that Water + Peptides is Sprint 3, ahead of Journey.*

**Founder decision: Water + Peptides moves ahead of Journey.** The reason: establish more of VITA's daily health-tracking infrastructure before beginning the larger Journey experience. Fuel, Water, and Peptides are the daily-logging core of the app and share the same patterns; Journey is a bigger, separate experience that benefits from that foundation being real first.

**This is a sequencing change only.** No sprint's scope was cut, reduced, or cancelled, and no work was invented.

| Sprint | Was (2026-08-17) | Now (2026-08-21) |
|---|---|---|
| 2 | Fuel | Fuel — unchanged |
| 3 | Journey / Weight | **Water + Peptides** (was Sprint 5) |
| 4 | Journey / Photos | **Journey / Weight** (was Sprint 3) |
| 5 | Water & Peptides | **Journey / Photos** (was Sprint 4) |
| 6 | Atlas | Atlas — unchanged |
| 7 | Settings / Account | Settings / Account — unchanged |
| 8 | Final Polish & Animations | Final Polish & Animations — unchanged |

The reorder was a rotation inside sprints 3–5; sprints 6, 7 and 8 kept their numbers at the time. *(The 2026-09-01 reorder has since moved Settings to 4 and pushed Journey / Weight, Journey / Photos and Atlas to 5, 6 and 7 — see above.)*

**Preserved explicitly:**

- **Journey is deferred, not cancelled.** It remains a major pillar of VITA and the next major experience after Sprint 3. Weight planning, weight logging and history, the Journey data architecture, progress views, progress photos, photo comparisons, and every existing visual concept stay exactly as documented. Only their scheduling changed.
- **Journey / Weight still comes before Journey / Photos** — Weight owns the core Journey data architecture that Photos builds on.
- **Sprint 2 — Fuel's scope is unchanged.** Nothing is added to it retroactively.
- **Water and Peptides scope is unchanged** — the founder direction recorded 2026-08-18 is preserved in full under Sprint 3 above, expanded from six proposed slices to ten so the sprint is implementable in controlled chunks.
- **FatSecret and restaurant provider selection remain deferred to launch readiness.** They do not move into Sprint 3. Sprint 3 is not a provider-integration sprint.
- **Health and Premium remain unscheduled**, and the five orphaned Innovation Lab ideas keep their 📋 Planned status. This reorder does not resolve that — it is still flagged for founder attention below.

---

# What changed in the 2026-08-17 restructure

*Historical record. **Sprint numbers in this section are twice superseded** — by the 2026-08-21 reorder and again by the 2026-09-01 reorder above.*

Recorded so nothing is silently dropped. The prior structure (founders, 2026-07-09) was: Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta.

**Moved:**
- **Fuel** 3 → **2** (confirms the 2026-08-01/02 reprioritization ahead of Journey; the repo doc previously still read "Sprint 2 = Journey, Sprint 3 = Fuel", which is what this restructure corrects).
- **Journey** 2 → split across **3 (Weight)** and **4 (Photos)** *(renumbered on 2026-08-21 to 4 and 5, and again on 2026-09-01 — now **5 and 6**)*.
- **Atlas** 4 → **6** *(now **7**, per the 2026-09-01 reorder)*.

**Added:** Sprint 0.1 and the Visual Consistency Pass recorded as first-class completed entries · **Water & Peptides** as a sprint of its own, numbered 5 at the time *(moved to Sprint 3 on 2026-08-21)* · **Sprint 7 — Settings / Account** *(moved to **Sprint 4** and broadened to **Settings + Tools & Reference** on 2026-09-01)*.

**Replaced:** Sprint 7 — Beta → **Sprint 8 — Final Polish & Animations**. The Beta sprint's non-polish slices (Analytics, Crash Reporting, App Store Preparation, Final QA & Launch Checklist) have no explicit home in the new structure.

**⚠️ No longer scheduled — flagged, not resolved:**

- **Sprint 5 — Health** *(old 2026-07-09 numbering)* (Health Dashboard, Weight Trends, Health Age, Biomarker Age, Apple Health Integration, Oura, WHOOP).
- **Sprint 6 — Premium** *(old 2026-07-09 numbering)* (Widgets, Live Activities, Smart Notifications, Themes & Personalization, Voice Atlas, Premium Features, Subscription Experience).

Between them these carried **five Innovation Lab ideas that had been promoted to 📋 Planned** precisely because the old roadmap named them: Health Age, Biomarker Age, Apple Health Integration, Apple Home Screen Widgets, and Voice Atlas. They now have no scheduled sprint. Per the Innovation Lab's standing rule, an idea's status changes but it is never deleted — these are **not** being demoted or discarded here. This is flagged for founder attention rather than silently reconciled.

**Also newly unscheduled:** **Screenshot Food Analysis** ([[Mobile Order Screenshot Import]]) was a slice of the old Sprint 3 — Fuel and is explicitly deferred out of the approved Sprint 2 scope, so it too currently has no sprint.

See Vita HQ `00 HQ/Open Questions.md` for the tracked question.

---

# Version 1 Goal

Before Version 1 is considered complete, VITA should:

- ✓ Have every primary screen implemented at production quality.
- ✓ Have complete navigation.
- ✓ Be visually consistent, in both Light and Dark.
- ✓ Follow the Product Bible.
- ✓ Follow the Design System.
- ✓ Meet quality standards defined in the Build Handbook.
- ✓ Have Atlas functioning as a real AI coach, not a placeholder.

Version 1 is complete when Sprint 8 — Final Polish & Animations finishes.

---

# Long-Term Vision

After Version 1, development shifts from building features to refining experiences.

Future releases may include:

- Apple Health integration
- Wearable integrations (Oura, WHOOP)
- AI-powered health insights
- Advanced analytics
- Community features
- Additional health tracking

Future work will only be added if it aligns with the Product Bible and Founder's Principles.

---

# Success Criteria

A sprint is complete when:

- All planned slices are finished.
- All audits have passed.
- Documentation has been updated.
- Founder approval has been received.

Only then does development move to the next sprint.


---

## Launch readiness follow-ups

Work that is deliberately **not** done during feature sprints because its inputs — pricing, licensing, terms, provider landscape — will have changed by the time VITA is close to shipping. Revisit each of these in the launch-readiness phase, not before.

### Restaurant provider selection

**Status: open. FatSecret research complete 2026-08-21; integration deferred by founder decision.**

VITA's current providers cover generic foods (USDA FoodData Central) and packaged/barcoded products (Open Food Facts) well. The gap is restaurant menu items — McDonald's, Chick-fil-A, Chipotle, Starbucks, Taco Bell, Wendy's, Burger King, Subway — where a user searching `Big Mac` should get *Big Mac — McDonald's*, not a generic hamburger.

Before public launch, evaluate the field again from scratch:

- **FatSecret** — re-open with the questions below answered
- **Any other viable restaurant/branded provider available at that time**
- Current **pricing** · **licensing** · **persistence rights** · **coverage** · **API reliability** · **attribution** · **quota** · **authentication requirements**

**Do not assume today's provider landscape will still be the best option at launch.** The 2026 evaluation is a snapshot, not a conclusion.

**Premier Free** may be worth applying for if VITA still qualifies (start-ups under $1M revenue and funding). It removes the 5,000/day quota but is **not known** to change Content storage rights — question 3 below exists to settle that. **Do not apply, create accounts, or obtain credentials without separate authorization.**

### FatSecret — unresolved questions to put to them

Preserved verbatim so they are asked as written rather than paraphrased into something weaker:

1. May FatSecret-derived nutrition values be stored indefinitely once a user explicitly logs that food into their own personal diary/history?
2. Are food name, restaurant/brand, serving description, and nutrient values considered permanently storable when incorporated into a user-generated food diary entry?
3. Does Premier Free change any Content storage rights, or only quota/features?
4. Are OAuth 1.0 two-legged requests subject to the same IP restrictions as OAuth 2.0 token requests?
5. Is a dynamic serverless egress environment officially supported?
6. What attribution is required inside a native mobile application?
7. What exact attribution must appear in App Store / Google Play listings?
8. Are restaurant menu items fully available under Basic/Premier Free for the U.S. dataset?

Questions 1 and 2 are the decisive ones: a "yes" makes FatSecret straightforward, and a "no" means any integration must be designed around re-fetching rather than snapshots. Evidence and quotes behind all of this: `docs/07-Audit-Log.md` (2026-08-21) and `docs/09-Technical-Documentation.md` → Food providers.

### Also launch-gated

- **Move the USDA key behind a proxy.** It is a rate-limiting identifier rather than a true secret, which is why `EXPO_PUBLIC_` is acceptable in development — but USDA deactivates keys found published publicly.
- **Open Food Facts attribution sweep.** ODbL data and CC-BY-SA images require attribution wherever shown; today only the barcode-originated Food Detail carries a source line.
