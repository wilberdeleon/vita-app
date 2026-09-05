# VITA — Master Roadmap

The Master Roadmap defines the long-term development plan for VITA.

It outlines the major phases, sprints, and milestones that move the product from concept to release.

It intentionally avoids implementation details. Those belong in the Slice Tracker and Technical Documentation.

**Source of truth:** this file mirrors the founders' official Sprint Roadmap. **Sprint 5 — VITA Identity & Interaction inserted 2026-09-01 (founder decision), ahead of Journey.** The order is now Fuel → Water + Peptides → Settings + Tools Foundation → **VITA Identity & Interaction** → Journey / Weight → Journey / Photos → Atlas → Final Polish / Motion / Launch Experience. Journey / Weight becomes Sprint 6, Journey / Photos Sprint 7, Atlas Sprint 8, and the final polish sprint Sprint 9 — see "What changed in the 2026-09-01 identity insertion" below. *(This supersedes the sprint numbering of the earlier 2026-09-01 reorder recorded below, which moved Settings ahead of Journey; that decision itself stands.)* **Reordered earlier on 2026-09-01 (founder decision): Settings + Tools & Reference moves ahead of Journey.** The order was then Fuel → Water + Peptides → **Settings + Tools & Reference** → Journey / Weight → Journey / Photos → Atlas → Final Polish. Journey is deferred, not cancelled or reduced — see "What changed in the 2026-09-01 reorder" below. *(This supersedes the 2026-08-21 reorder, which had put Water + Peptides ahead of Journey and left Journey / Weight at Sprint 4 — that reorder's own record is preserved further down.)* **Restructured 2026-08-17 (founder authorization, Sprint 2 approval)** — this supersedes the 8-sprint structure issued 2026-07-09 (Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta) that previously lived here. See "What changed in the 2026-08-17 restructure" below for what moved and what is no longer scheduled. Vita HQ (`docs/Vita HQ/01 Vision/Roadmap.md`) mirrors this page; update both together if the plan changes again.

---

# Current Stage

**Sprint 4 — Settings + Tools Foundation** · Status: ✅ **COMPLETE** — opened and closed 2026-09-01. Both slices are founder-approved on device: 4.1 Settings Foundation and 4.2 Tools & Reference Hub + Route Architecture.

**Complete means the founder-approved engineering foundation is done — not that every Tool is built.** BMI, the Research Library, Food Scanner evolution and Dashboard discoverability are **deferred, not cancelled**: they are presentation-heavy, and the founders are defining a new VITA visual / interaction language next. Building them now would mean designing them twice. Detail in `docs/06-Slice-Tracker.md` → Sprint 4 Closeout.

**That alignment session happened on 2026-09-01, and this is its result.** The founder-directed identity sprint is now formally on the roadmap as **Sprint 5 — VITA Identity & Interaction**, inserted ahead of Journey. Journey / Weight moves to Sprint 6, Journey / Photos to Sprint 7, Atlas to Sprint 8, and the final polish sprint to Sprint 9 — renamed **Final Polish / Motion / Launch Experience**. See the Sprint 5 section below and "What changed in the 2026-09-01 identity insertion".

**Sprint 5 — VITA Identity & Interaction** · Status: 🟡 **IN PROGRESS** — opened 2026-09-02 on branch `sprint-5-identity-interaction`, cut from `main` at `8dce19c` (Sprint 4 merged the same day). Founder-authorized against the approved **Sprint 5 Planning & Architecture Audit** (`docs/Sprint-5-Planning-Audit.md`).

**Three slices are founder-approved on device and locked:** **5.1 VITA Design Language + Identity Prototype** (with 5.1A) · **5.2 Interactive Water Experience** (with 5.2A) · **5.3 Dashboard Identity Redesign** (with subpasses 5.3A–5.3D, approved 2026-09-04). **5.4 — Peptides Home Redesign is next** and requires its own founder authorization to begin.

**⚠️ Scope expanded 2026-09-04 by founder ruling.** After reviewing production Water and Dashboard, the founders ruled that **Sprint 5 must apply the new VITA Identity & Interaction language across every already-built current product area before Journey begins.** Two consequences: **Fuel gets a dedicated identity slice (5.6)** it never had, and Tools + Settings becomes an explicit identity slice (5.7) rather than a generic "Tools Integration". Motion, BMI and the founder audit each shift one number. **The sprint is now ten slices, 5.1–5.10**, and **Sprint 6 — Journey / Weight begins only after 5.10 passes founder real-device review.**

**The identity system is now the baseline for future VITA feature work, Journey included.** Journey inherits the Sprint 5 language rather than inventing a new one.

Slice-by-slice detail: `docs/06-Slice-Tracker.md` → Sprint 5. Design language: `docs/05-Design-System.md` → *The VITA Design Language*. Screen-by-screen map: `docs/Sprint-5-Migration-Guide.md`.

**Sprint 3 — Water + Peptides** · Status: ✅ **COMPLETE** — founder-reviewed, approved, and merged into `main` on 2026-09-01 (merge commit `2bac43b`, from branch `sprint-3-water-peptides`)

Objective: turn Water and Peptides from the Sprint 0 placeholder logs they were into real, persisted, date-aware features at the quality bar Sprint 2 set for Fuel. Delivered.

Everything before it is complete: Sprint 0, Sprint 0.1, Sprint 1, the App-Wide Visual Consistency Pass, and **Sprint 2 — Fuel** (audited and merged into `main` 2026-08-21, merge commit `44eeae6`, closed by `473cb59`).

Sprint 3's planning and architecture audit is founder-approved and all three entry conditions were met. **Every implementation slice, 3.1 through 3.9B, is founder-approved on device.** Slice 3.10 — the closeout audit — fixed nine defects and referred four findings back to the founders; slice 3.10A implemented all four rulings. **Every slice is founder-approved.** Slice-by-slice detail is in `docs/06-Slice-Tracker.md`; findings are in `docs/07-Audit-Log.md`.

**Sprint 3 is complete from an engineering standpoint.** No engineering blockers remain: 1093 tests pass, typecheck and no-unused are clean, the iOS export succeeds, and the diff boundary held on nutrition, Fuel, Home, Atlas and Journey throughout.

**That is not the same as being ready to ship.** One **release gate** is open and is deliberately not counted as an engineering blocker: the 96 peptide reference entries require qualified medical, content and legal review before public release. The automated tests enforce structure and internal consistency — unique ids and aliases, no shared prose between similar compounds, no dosing or protocol language, every time-sensitive development stage dated and sourced — and **none of that is a check on whether a sentence is medically accurate.**

**Sprint 3 is merged and closed.** Founder-approved 2026-09-01 and merged into `main` as `2bac43b`, an explicit `--no-ff` merge preserving the full slice history.

**Sprint 4 was opened as Settings + Tools & Reference**, per the founder reorder of 2026-09-01 recorded below, on branch `sprint-4-settings-tools-reference` cut from the merged `main`. *(It is complete and was renamed at closeout; the paragraph is preserved as the record of how the sprint was authorized.)* It was authorized on 2026-09-01 against its approved planning audit. Of its candidate Tools, **BMI is committed**, the **Research Library is committed as architecture only**, the **Food / Product Scanner's scoring is not authorized**, and the **Dashboard shortcut is deferred**.

**Sprint 4 is closed.** Its planning and architecture audit was founder-reviewed and approved on 2026-09-01, both slices are founder-approved and the sprint closed as **Sprint 4 — Settings + Tools Foundation**. **Tools now live at a top-level `/tools` route rather than under Settings** — Settings remains the discovery entry point but no longer owns the tools' identity. The canonical routes are `/tools`, `/tools/peptide-calculator` and `/tools/injection-sites`; the old `/settings/tools/…` tree was removed, not redirected, and is not restored. Slice-by-slice detail, and the founder rulings recorded at approval, are in `docs/06-Slice-Tracker.md` → Sprint 4.

The audit itself — existing Settings and Tools inventory, recommended information architecture, a BMI / Food Scanner / Research Library assessment, a ranked risk register, and the proposed 4.x slice sequence — is preserved as authored in `docs/Sprint-4-Planning-Audit.md`. Two of its recommendations the founders acted on directly: **the Food Scanner's scoring left the sprint** (no VITA Score is to be invented without an approved methodology), and **the Research Library ships as architecture without content** while Open Question #17 stays open. **Slice 4.6 is explicitly not committed** and is reassessed after 4.5.

---

# Development Philosophy

We build in three levels.

Project → Sprint → Slice

Projects define the product. Sprints define major milestones. Slices define individual features.

---

# Sprint Plan (official — founders 2026-08-17, reordered 2026-08-21, reordered 2026-09-01, and Sprint 5 inserted 2026-09-01)

| Sprint | Objective | Status |
|---|---|---|
| 0 — Visual Foundation | Establish identity, vision, architecture, and the application shell | ✅ Complete |
| 0.1 — Polish | Global design polish over the Sprint 0 shell | ✅ Complete |
| 1 — Dashboard / Home | Build the Home experience that defines the quality standard for the app | ✅ Complete |
| — App-Wide Visual Consistency Pass | Migrate every screen onto the theme system Sprint 1 established | ✅ Complete |
| 2 — Fuel | Build the smartest nutrition experience possible | ✅ Complete |
| **3 — Water + Peptides** | **Bring both daily logs to real, persisted functionality — VITA's daily health-tracking infrastructure** | ✅ Complete |
| **4 — Settings + Tools Foundation** | Settings architecture and a top-level Tools destination — the foundation later Tools are built into | ✅ Complete |
| **5 — VITA Identity & Interaction** | **Establish the VITA visual and interaction language and apply it across every already-built product area — the language Journey is built in** | 🟡 **In progress** — 5.1, 5.2, 5.3 approved |
| 6 — Journey / Weight | The weight half of the Journey experience, and the core Journey data architecture — **gated on slice 5.10** | ⬜ Planned |
| 7 — Journey / Photos | The transformation-photo half of the Journey experience | ⬜ Planned |
| 8 — Atlas | Transform Atlas into a true AI health coach | ⬜ Planned |
| 9 — Final Polish / Motion / Launch Experience | App-wide finishing motion, consistency, edge cases, and the launch experience | ⬜ Planned |

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

Fuel-specific micro-interactions may be introduced here rather than deferred wholesale to the final polish sprint — see **Sprint 9 — Final Polish / Motion / Launch Experience** below for the division (this read "Sprint 8" before the 2026-09-01 identity insertion renumbered it). Design direction detail lives in `docs/05-Design-System.md` → "Future direction (founder direction, 2026-08-18)". **Contextual food visuals** (small food illustrations/icons) are a related but separate, currently unscheduled concept — parked in `docs/10-Ideas-Parking-Lot.md`, not part of this slice unless the founders scope it in.

*Recorded ahead of time as founder-stated direction; it shipped as slice 2.9 and is founder-approved. See `docs/06-Slice-Tracker.md`.*

Status: ✅ Complete — audited 2026-08-21, merged into `main` as `44eeae6`

---

# Sprint 3 — Water + Peptides ✅

**Complete (engineering), 2026-09-01.** Pending founder sign-off on slice 3.10A and not yet merged. One release gate remains open and is not an engineering blocker: qualified medical, content and legal review of the 96 peptide reference entries.

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

Status: ✅ **Complete and merged.** Opened 2026-08-22 on branch `sprint-3-water-peptides`, closed out by slices 3.10 and 3.10A, and merged into `main` on 2026-09-01 as `2bac43b`. Tracked in `docs/06-Slice-Tracker.md`. One release gate stays open and is not an engineering blocker: qualified medical, content and legal review of the 96 peptide reference entries.

---

# Sprint 4 — Settings + Tools Foundation ✅

**Final name: Settings + Tools Foundation.** The sprint opened as *Settings + Tools & Reference* and was renamed at closeout by founder decision. **This was an intentional scope decision, not a failure, an abandonment, or a sprint cut short** — the foundation it set out to prove is what it delivered, and it stopped deliberately before the presentation-heavy work that follows the new visual language.

Objective: organize VITA's utility layer — build the Settings architecture and give the Tools that already exist a coherent home and a route identity of their own.

Deliverable, as shipped: a real Settings experience replacing the Sprint 0 shell, a top-level **Tools** destination gathering VITA's calculators, and the navigation architecture later Tools are built into.

## What Sprint 4 delivered — preserved, and not rebuilt

The identity sprint that follows is **presentation and interaction work**. None of the following is reopened, rewritten, or rebuilt from scratch by it:

**Settings foundation** — the Settings architecture · persistent Appearance (System / Light / Dark, surviving relaunch) · a real Units destination reading and writing Water's own `vita:v1:water:prefs` · honest Settings rows, where a row that draws a chevron opens something · an accurate version display read from configuration · the app-level preference store at `src/lib/preferences/`.

**Tools foundation** — the top-level `/tools` route · the Tools & Reference hub · the Peptide Calculator at `/tools/peptide-calculator` · Injection Sites at `/tools/injection-sites` · Settings retained as the discovery entry point without owning Tools' identity · a structure that accepts a new tool as a row and a route.

**Everything underneath both** — the Body Map and injection-site primitives, navigation foundations, domain logic, utilities, persistence, and repositories — is working, tested, and stays. Sprint 5 changes how VITA presents and responds, not what it knows.

**Remaining Tools work is not cancelled.** BMI, the Research Library, Food Scanner evolution and Dashboard Tools discoverability resume under the new VITA visual and interaction language — see Sprint 5 below.

---

## The sprint as originally planned

*Preserved as authored, for the record. Slices 4.3–4.8 were deferred at closeout, not cancelled.*

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

**⚠️ Product boundary — binding (restated 2026-09-01, Sprint 4 closeout).** VITA does **not** provide recommended dosages, dose ranges, or treatment-style protocols — for research compounds or for approved medications. **This is not a gated future feature. It is not a product direction.** Earlier wording framed such content as available with founder authorisation plus medical and legal review; that framing is withdrawn, because it described a direction the founders do not want. What VITA does is unchanged: **it helps users understand, calculate, organise and track information they enter.** Factual reference material — storage, handling, reconstitution concepts, stability, and development/approval status — remains a valid direction, still subject to the review gate in Vita HQ `00 HQ/Open Questions.md` #17. The Sprint 3 release gate on existing peptide reference content is unchanged — see `docs/07-Audit-Log.md`.

## Discoverability

- **Settings → Tools & Reference** as the primary path.
- A future Dashboard/Home shortcut into Tools, **if product design supports it.** Exact placement is deliberately undecided, and no Dashboard card is authorized by this document.

## BMI Calculator direction

Planned Tools item. Potential UX: a height input, a weight input, the calculated BMI, its category/range, and a polished visual representation of where the value sits on the scale.

**Future opportunity, not this sprint:** once Journey / Weight exists (**Sprint 6** since the 2026-09-01 identity insertion; Sprint 5 when this was written), BMI could read the user's stored height and latest weight instead of asking for them again. That integration is explicitly **not** built now — Journey owns that data and does not exist yet.

## Food / Product Scanner direction

Documented as a **future Sprint 4 candidate**, not a trivial add. The concept is a Yuka-style food/product scanner: scan a barcode or product and get an easy-to-understand evaluation.

Potential future components: barcode scanning · ingredient and nutrition information · an understandable score or evaluation · an explanation of *why* the product scored the way it did · suggested alternatives, later.

**This is likely the largest single Tools item and may require its own slice or planning pass.** VITA already has real barcode scanning and the Open Food Facts / USDA provider layer from Sprint 2, which is a starting point and not a solution — scoring methodology, its defensibility, and how a score is explained are unresolved product questions. Nothing here is scoped or approved.

## Reminder delivery — carried forward from Sprint 3

Sprint 3 shipped **reminder preferences and a reminder time that persist** on a peptide routine (slice 3.9B). **OS notification delivery is not implemented** — a test asserts no notification dependency exists in the app.

Future reminder work, unscheduled and not authorized here: scheduled routine notifications · Taken / Skipped actions from a notification · delivery on the configured schedule days. Notification infrastructure is not built in this document and is not automatically Sprint 4 scope.

Status: ✅ **Complete** — opened and closed 2026-09-01, on branch `sprint-4-settings-tools-reference`. Two founder-approved slices: 4.1 Settings Foundation and 4.2 Tools & Reference Hub + Route Architecture. *(This line previously read "Planned — next, not opened"; it was stale from before the sprint opened.)*

---

# Sprint 5 — VITA Identity & Interaction

**Status: 🟡 IN PROGRESS** — opened 2026-09-02, branch `sprint-5-identity-interaction`. **5.1, 5.2 and 5.3 are founder-approved on device and locked. 5.4 is next** and requires its own founder authorization. Slices 5.4–5.10 are planned, not authorized.

Objective: **make VITA feel unmistakably like VITA.** Establish the visual and interaction language — how the product looks, behaves, responds, and communicates interaction — **and apply it across every already-built current product area** before Journey is built in it.

Deliverable: a reusable VITA design and interaction language, adopted by Dashboard, Water, Peptides, Routine, Injection Sites, Fuel, Tools and Settings, and proven on a real device at a terminal founder audit.

## The identity rollout ruling — founder, 2026-09-04

**Sprint 5 must apply the new VITA Identity & Interaction language across all already-built current product areas before Journey begins.** The system established here is the **baseline for all future VITA feature work**, Journey / Weight included.

The ruling followed founder review of production Water (5.2) and Dashboard (5.3). With two features in the new language and the rest still in the old one, the app reads as two products rather than one — and shipping Journey into that state would add a third. Two structural consequences:

- **Fuel gets a dedicated identity slice (5.6)** it never had. Sprint 2 built Fuel's functionality; its presentation predates the current identity.
- **Tools + Settings becomes an explicit identity slice (5.7)**, replacing the earlier generic "Tools Integration" framing, because Settings is a built product surface too.

Motion, BMI and the founder audit each shift one number. The sprint is now **ten slices**.

## Identity rollout principle — one product language, not one identical layout

**Sprint 5 applies one coherent VITA product language. It does not standardize every screen into the same layout.**

**Shared across every feature:** the premium dark foundation · direct-content hierarchy · restrained surfaces · feature colors · purposeful motion · tactile interaction · accessibility · real-data-only presentation.

**Deliberately not shared:** Water can look like Water · Peptides can look like Peptides · Fuel can look like Fuel · Journey can look like Journey. Feature-specific visual objects are the point of the language, not an exception to it. **Do not standardize features into identical cards or widgets** — that would reproduce, in a new palette, exactly the template sameness this sprint exists to remove.

**Dashboard customization is Dashboard's, not a global pattern.** The Apple-widget-style model approved in 5.3 — square/wide widgets, visibility, order, sizing, on-Home edit mode, drag reorder — **belongs to Home.** It does **not** imply that every screen gets draggable widgets, or that Fuel, Peptides or Settings need square/wide page-builder layouts. It is a Dashboard-specific interaction pattern built on the broader VITA identity.

## Dynamic Type policy — founder-approved

**VITA respects the platform's text-size accessibility setting by default.** No custom VITA text-size setting is created unless a future product need emerges.

Every feature identity slice must: respect Dynamic Type where practical · avoid clipping · preserve accessibility labels · **never disable font scaling globally.** The mechanisms proved on Dashboard in 5.3D are documented in `docs/09-Technical-Documentation.md` → Dynamic Type.

**This sprint is broader than styling.** It is not a redesign sprint, a UI refresh, a visual-polish pass, or a design-token exercise. It covers hierarchy, disclosure, feature-specific visual objects, motion, haptics, completion states, and what a VITA interaction feels like.

## Why it was inserted here

VITA has substantial working functionality, and real-device review showed the presentation layer has become **too visually generic**. Many screens rely on the same pattern — dark background, large rounded card, text, icon, another rounded card. Features that behave very differently end up looking like variations of one template, so the app reads as a set of well-built screens rather than as a recognizable product.

The founders want VITA's visual and interaction identity established **before** Journey, because Journey is expected to be one of the app's most important and visually significant areas. Building it first would mean:

- building Journey in a visual language already targeted for replacement,
- redesigning a major new feature immediately after implementing it,
- and accumulating presentation-layer debt across the rest of the app.

**This is not a product restart.** Working domain logic, persistence, repositories and architecture are not reopened.

## What is preserved

The foundation stays recognizable: the black / near-black premium foundation · VITA branding and the VITA mark · **gold as the primary brand color** · premium typography · mature spacing · restrained feature colors · the current product maturity.

Feature colors become more **functional** than decorative:

| Color | Meaning |
|---|---|
| Gold | VITA / Journey / brand |
| Blue | Water |
| Purple / violet | Peptides |
| Orange | Fuel |
| Green | Movement / activity |

They should support indicators, interaction states, illustrations, visual objects, progress and motion — rather than simply recoloring whole buttons or whole cards. This refines the permanent domain color hierarchy in `docs/05-Design-System.md`; it does not replace it.

## Target identity

Premium · dark · modern · tactile · interactive · visually recognizable · simple to understand · restrained rather than flashy · mature · useful · personality without becoming childish · purposeful visual feedback · stronger hierarchy · progressive disclosure · feature-specific visual objects · fewer generic full-width cards.

## Explicit non-goals

Sprint 5 does **not** become: bright cartoon gamification · random glassmorphism · gradient overload · animation for decoration · a completely different aesthetic · a total architecture rewrite · a business-logic rewrite · a persistence rewrite · a repository rewrite · a generic motivational wellness-app redesign.

**Working domain logic is untouched unless a concrete issue requires the change.**

## The primary presentation problem

VITA currently overuses large rounded surfaces and card containers, so unrelated content arrives at the same visual weight. The design-language work must define:

- when content deserves a card,
- when content lives directly on the page,
- when a visual object replaces a summary card,
- when information is progressively disclosed,
- how mixed module sizes work together,
- how actions are surfaced,
- how completion is represented,
- how secondary information is de-emphasized.

This extends the Sprint 2 finding already recorded in `docs/05-Design-System.md` — *rows in a panel, not a grid of cards*, and *size communicates importance, not availability* — from one screen to the whole product.

## Screen directions (founder-approved direction, not implementation authorization)

*Dashboard (5.3) and Water (5.2) have since shipped and are **locked** — the shipped state, not the direction below, is now authoritative for those two. See `docs/06-Slice-Tracker.md` and `docs/Sprint-5-Migration-Guide.md`. The direction is preserved as the record of what was asked for.*

### Dashboard — ✅ delivered in 5.3, locked

**Keep** the time-aware greeting: *Good morning, Wilber* · *Good afternoon, Wilber* · *Good evening, Wilber* · *Good night, Wilber*.

**Remove future reliance on** the generic wellness-marketing copy — *"Build with intention."* and *"Your day, your direction."* — and **do not automatically replace them with another slogan.** Prefer useful contextual information: the date, doses due, hydration state, goals remaining, meaningful current-day state.

Dashboard should become more action-oriented and less analytics-report-like; visually recognizable; modular without becoming a generic symmetrical grid. Potential primary modules: Fuel · Water · Peptides · Journey · Tools. Potential smaller utility modules: Peptide Calculator · Injection Sites · Food Scanner · Reference.

**The historical lesson, recorded deliberately.** The founder's older Dashboard concept is **not** the visual target, but it succeeded at one thing this sprint must recover: different destinations were **immediately recognizable**. Recover that recognizability while keeping VITA's current sophistication. This is not an instruction to recreate the old grid.

### Water — ✅ delivered in 5.2, locked

The existing Water summary and Add Water flow are functionally correct but visually form-like and space-heavy.

A premium stylized **VITA hydration vessel** may become the hero interaction object: a visible fill level mapped to hydration progress · logging visibly raising the liquid level · subtle ripple / splash feedback · an appropriate haptic · animated progress · a non-cartoon treatment. Potential logging flow: tap Add Water → compact bottom sheet or overlay → quick amounts → custom amount → log → the vessel responds → the sheet closes.

**Water's correctness is preserved exactly as built:** canonical storage, units, goal, entries, persistence, rollover, history. Note the standing Sprint 3 caution in this document — *do not assume a literal animated water bottle is automatically right* — which this direction refines rather than overrules: the vessel is a candidate, designed inside VITA's premium system, not a foregone conclusion.

**7-day history remains valuable** and may simply be presented more elegantly — individual daily entries can become compact, secondary, or progressively disclosed rather than permanent large cards. **No data loss and no history simplification for visual reasons.**

### Peptides home

Peptide tracking works; the presentation is administrative and information-heavy. The redesigned hierarchy should answer one question immediately: **what do I need to do today?** Peptides Home should distinguish *due* · *completed* · *upcoming* · *routine management* rather than giving everything equal visual priority. **No business-logic rewrite is implied.**

### Routine

The principle is **immediate action first, administrative detail second**. A possible top state: the peptide name, then *Routine amount · Today*, then a primary **Mark as Taken** and a secondary **Skip** — with Routine Details, History, Preparation and Edit Routine behind progressive disclosure. The exact literal layout is not yet required.

### Injection site logging

When a user marks a peptide as Taken, VITA should explore **optional** injection-site logging: Mark as Taken → optional site selection → body map / quick site interaction → confirm. The log can retain date, time, dose, units and injection site. **The existing logging and history architecture is reused, not replaced.**

### Injection rotation visualization

Explore a body visualization showing injection locations over a selected week — for example Monday right abdomen, Tuesday left thigh, Wednesday right thigh, Friday left abdomen — with markers on the body representation and a tap opening the corresponding log or day detail.

Open planning questions: front / back · multiple injections at one site · multiple peptides · week filtering · historical filtering · marker overlap · accessibility · and where it lives (Routine, History, or Tools). **An exploration target, not guaranteed final UX.**

**Shared body-map principle.** Peptide logging and the standalone Injection Sites tool should share the same body-map / injection-site primitive. Do not create a duplicate implementation — the existing `BodyMap` work is inspected and evolved.

### Fuel — slice 5.6

**Sprint 2 built Fuel's functionality; its presentation predates the current VITA identity.** 5.6 brings the existing Fuel screens into the same product family. **This is not a Fuel architecture rewrite.**

**Preserved, and not reopened:** the nutrition model · logging · meal editing · the Open Food Facts integration · barcode lookup and the log scanner · persistence · every existing real behaviour · current calorie and macro semantics.

**Potential visual / interaction scope:** Fuel Home · meal and log presentation · food detail surfaces · scanner presentation where appropriate · the logging flow · empty states · direct-content hierarchy · **orange feature identity** · tactile sheets and progressive disclosure where they genuinely help.

**Fuel should look like Fuel.** It adopts the shared language, not Dashboard's or Water's layout — and it does not acquire Home's widget-customization model.

### Tools + Settings — slice 5.7

Tools remain part of VITA, and **Settings is a built product surface too** — which is why this slice names it. Sprint 4 created the functional foundation; 5.7 aligns the presentation with the identity: **Settings · the Tools hub · the Peptide Calculator's presentation · any Injection Sites presentation not already handled by 5.5 · the Units and Appearance surfaces · the utility navigation hierarchy.**

**Preserved, and not reopened:** current routes · current functionality · current preference persistence · **no fake rows** — the honesty rule from slice 4.1 stands.

The Sprint 4 foundation — the hub, the Peptide Calculator, Injection Sites — is integrated into the new identity. Future candidates: **BMI Calculator**, Food / Product Scanner evolution, Reference. Tools should eventually be discoverable from Dashboard/Home rather than only from Settings; no Dashboard affordance is authorized here.

## BMI Calculator — still planned, now slice 5.9

**BMI remains planned. It is not cancelled. The founders want it.** It is built in slice **5.9**, from scratch in the established VITA design language — which is why it was deferred out of Sprint 4 in the first place.

The direction is unchanged: height · weight · BMI result · category/range · a premium visual representation · **no BMI history that shadows Journey** · **no fake health-insight or recommendation engine** · future Journey integration where appropriate, once Journey / Weight (Sprint 6) owns stored height and latest weight.

## Peptide recommendation boundary — restated

**VITA does not become a peptide dosage recommendation or protocol engine.** No recommended research-peptide doses, no treatment protocols, no prescriptive cycles, no individualized dosage recommendations. This is not a gated future feature and not a product direction.

Factual reference material remains valid — storage, handling, reconstitution concepts, general stability, development / approval status, factual compound information — still behind the review gate in Vita HQ `00 HQ/Open Questions.md` #17. Any treatment-style material would require separate explicit authorization and appropriate review, and is **not** a current desired product direction.

## Food Scanner — two different things, and they must not be conflated

**What exists today:** `/fuel/scan` is the **barcode lookup and logging flow** shipped in Sprint 2. It scans a product, looks it up, and lets the user log it. It works, it is untouched, and 5.6 may refresh its presentation.

**Dashboard Quick Tools may include a `Food Scanner` shortcut** — and as of 5.3 it does. **That shortcut opens the existing Fuel barcode scanner for simple food scanning and logging. It does not mean food scoring is implemented.**

**What does not exist:** any product-evaluation score. **No VITA Score exists and none is authorized.** The richer scoring scanner — ingredient evaluation, an understandable score, an explanation of why a product scored the way it did, suggested alternatives — is a **separate deferred feature evolution** whose scoring methodology remains an unresolved founder/product decision. Sprint 5 is not committed to inventing it.

**Documentation must keep these two apart.** A shortcut named *Food Scanner* that opens a barcode logger is not a claim that VITA scores food.

## Questions slice 5.1 must answer

When does VITA use a card? · When does content sit directly on the background? · What module sizes exist? · How are feature colors used? · What is a VITA primary action? · How do secondary actions work? · How do bottom sheets behave? · How does a completed state behave? · How does progressive disclosure work? · How does VITA use motion? · How does VITA use haptics? · What visual objects represent each feature? · How does VITA avoid over-design? · What should a VITA interaction feel like?

These are foundational sprint questions, not styling preferences.

## Slice structure — amended 2026-09-04 (founder ruling)

**This is the authoritative Sprint 5 slice structure.** It supersedes the approved nine-slice structure in `docs/Sprint-5-Planning-Audit.md` §S.2, which itself superseded the eight-slice draft in `docs/Sprint-5-Identity-Brief.md` §8. Both are preserved as history and marked. **Each unstarted slice still requires its own founder authorization to begin.**

| # | Slice | Scope | Status |
|---|---|---|---|
| **5.1** | **VITA Design Language + Identity Prototype** | Surface roles · hierarchy · feature colour · typography · spacing · interaction / motion / haptic rules · completion · disclosure · empty states · the minimal primitives the language requires (`VitaSheet`, `PressableScale` evolution, `expo-haptics`) · a coded identity prototype. **No production screen redesigned** | ✅ Approved (with 5.1A) |
| **5.2** | **Interactive Water Experience** | First complete feature in the new language: the hydration vessel as percentage of goal · direct-content hierarchy · tactile Add Water sheet · unit flexibility · history/log presentation. **Water domain, units, storage, goals and entries frozen** | ✅ Approved (with 5.2A) |
| **5.3** | **Dashboard Identity Redesign** | Compact VITA header · time-aware daypart greeting · classical quote treatment · date chip · **real-data-only** widgets · Fuel/Water/Peptides widgets · square/wide layout · Quick Tools · Today's Schedule · Home customization with direct edit mode and drag reorder · Dynamic Type · Dark/Light · Reduce Motion | ✅ Approved (with 5.3A–5.3D) |
| **5.4** | **Peptides Home Redesign** | Apply the identity to Peptides Home. *What do I need to do today?* · due / taken / upcoming state · immediate action · progressive disclosure · feature-specific visual identity. **Sprint 3 domain semantics preserved** | ⬜ **NEXT** |
| **5.5** | **Routine + Injection Site Experience** | Routine hierarchy · faster daily action · Taken/Skipped flows · `BodyMap` evolution · weekly site context · richer Injection Sites interaction. **Shared BodyMap, historical snapshots, no recommendation engine, no automatic rotation recommendations** | ⬜ Planned |
| **5.6** | **Fuel Identity Refresh** | **New slice.** Bring the existing Fuel screens into the same product family — Fuel Home · meal/log presentation · food detail surfaces · scanner presentation where appropriate · logging flow · empty states · direct-content hierarchy · orange feature identity · tactile sheets and progressive disclosure where useful. **Not a Fuel architecture rewrite** | ⬜ Planned |
| **5.7** | **Tools + Settings Identity Integration** | Align the existing Tools and Settings presentation with the identity — Settings · the Tools hub · Peptide Calculator presentation · any Injection Sites presentation not handled by 5.5 · Units / Appearance surfaces · utility navigation hierarchy. **Routes, functionality, preference persistence unchanged; no fake rows** | ⬜ Planned |
| **5.8** | **Motion + Microinteraction Unification** | Once Dashboard, Water, Peptides, Fuel, Tools and Settings have adopted the identity, unify interaction behaviour app-wide: press behaviour · shared haptic vocabulary · sheet transitions · motion timing · Reduce Motion compliance · the `PressableScale` flex issue · inconsistent numeric keyboard accessory tones · cross-feature interaction polish. **Not a slice for redesigning feature layouts** | ⬜ Planned |
| **5.9** | **BMI Calculator** | Built from scratch in the established language. New `src/lib/bmi/`, premium visual representation, **no BMI history that shadows Journey**, **no fake health-insight or recommendation engine** | ⬜ Planned |
| **5.10** | **Founder Identity Audit** | Feature work stops. Terminal real-device review — see below | ⬜ Planned |

### What changed in the 2026-09-04 amendment

| # | Was (audit §S.2, approved 2026-09-02) | Now |
|---|---|---|
| 5.4 | Peptides Home Redesign | Peptides Home Redesign — unchanged |
| 5.5 | Routine + Injection Site Experience | Routine + Injection Site Experience — unchanged |
| 5.6 | Tools Integration | **Fuel Identity Refresh** (new) |
| 5.7 | Motion + Microinteraction Unification | **Tools + Settings Identity Integration** (was 5.6, broadened to name Settings) |
| 5.8 | BMI Calculator | **Motion + Microinteraction Unification** (was 5.7) |
| 5.9 | Founder Identity Audit | **BMI Calculator** (was 5.8) |
| — | — | **5.10 Founder Identity Audit** (was 5.9) |

**Nothing was cut.** One slice was added, one was broadened, and four shifted by one number.

### Slice 5.10 — the terminal gate

Feature development stops. The audit reviews, explicitly: **Dashboard · Water · Peptides Home · Routine · Injection Sites · Fuel · Tools · Settings · shared motion / microinteraction behaviour · BMI · Light / Dark · Dynamic Type · Reduce Motion · accessibility · visual coherence · feature distinctiveness · card/surface discipline.**

**Primary founder question:**

> **"Does current VITA now feel like one coherent product?"**

**Sprint 6 — Journey / Weight does not begin until 5.10 passes founder real-device review.**

## Relationship to Sprint 9

Sprint 5 **establishes the interaction vocabulary and rolls it out across every already-built product area**. Slice 5.8 unifies it once several real features use it. Sprint 9 — Final Polish / Motion / Launch Experience performs the final app-wide pass: finishing motion, consistency across every screen, edge cases, accessibility and performance sweeps, and the launch experience. **Sprint 5 does not replace Sprint 9, and Sprint 9 is not where Sprint 5's debt is parked.**

**Governing Sprint 5 documents:** `docs/Sprint-5-Planning-Audit.md` — the founder-approved planning and architecture audit, amended 2026-09-04 · `docs/Sprint-5-Migration-Guide.md` — the screen-by-screen map · `docs/05-Design-System.md` → *The VITA Design Language* — the authored language itself · `docs/06-Slice-Tracker.md` → Sprint 5 — slice-by-slice progress. The original brief, `docs/Sprint-5-Identity-Brief.md`, is preserved as the pre-audit statement of intent; **its §8 slice plan is superseded** by the table above.

---

# Sprint 6 — Journey / Weight

**⚠️ Gated. Sprint 6 does not begin until slice 5.10 — the Founder Identity Audit — passes founder real-device review.**

## Journey inherits the Sprint 5 system

**The VITA Identity & Interaction language established in Sprint 5 is the baseline for Journey. Journey does not invent a new visual language.**

Where appropriate, Journey uses: direct-content hierarchy · premium VITA typography · feature-specific visual objects · a restrained gold / Journey identity · tactile interaction · `VitaSheet` patterns · progressive disclosure · the shared motion and haptic vocabulary · Dynamic Type · Reduce Motion · Light/Dark · the accessibility floor · **real-data-only presentation**.

**This does not mean Journey copies Water's vessel or Home's widget grid.** Feature identity remains distinct — Journey can look like Journey, exactly as Water looks like Water and Fuel looks like Fuel. Home's widget-customization model is Dashboard's own pattern and is not inherited by default. What is shared is the language, not the layout.

Objective: build the weight half of Vita's emotional core.

Deliverable: a Journey experience that motivates through progress, not just data display — weight logging, weight history, and the foundational Journey data architecture everything later builds on.

**Deferred, not reduced (founder decisions 2026-08-21 and 2026-09-01).** This was Sprint 3 under the 2026-08-17 structure, Sprint 4 after the 2026-08-21 reorder, Sprint 5 after the first 2026-09-01 reorder, and is now **Sprint 6**. Journey remains a major pillar of VITA and its next major *feature* experience. **Every previously documented requirement, slice, and decision stands unchanged** — only its position in the sequence moved, twice, for the same kind of reason. The founders moved Settings + Tools Foundation ahead of it because Journey / Weight is expected to be complex, and then inserted **Sprint 5 — VITA Identity & Interaction** ahead of it so Journey is built in VITA's established visual and interaction language rather than in one already targeted for replacement. **Journey is intentionally delayed until the identity sprint is approved; it is not cancelled, and its scope is not reduced.**

The eight slices written for Journey under the earlier structure (Journey Overview · Journey Timeline · Milestones · Achievements · Streak System · Rewards & Celebrations · Journey Detail Screen · Journey Polish) were authored as one sprint and have still not been divided between Weight and Photos. That split is a planning task for whenever this sprint opens. See Vita HQ `01 Vision/Roadmap.md`.

**⚠️ Design-risk flag (Streak System), carried forward from the 2026-07-09 roadmap:** a literal streak that resets to zero on a missed day conflicts with the "Progress over Perfection" principle and the "no guilt mechanics — ever" rule that Journey Stages was explicitly built to satisfy. Resolve the design approach (grace days, a non-punishing "current run" reframing, etc.) before that slice starts.

**Downstream opportunity:** once weight and height are stored here, the BMI Calculator (still planned, deferred into the Sprint 5 identity work) could read them instead of asking again. Recorded as an opportunity, not a commitment.

Status: ⬜ Planned

---

# Sprint 7 — Journey / Photos

Objective: build the transformation-photo half of the Journey experience.

Deliverable: photo capture, comparison, and progress storytelling that makes change visible.

**Deferred, not reduced.** This was Sprint 4 under the 2026-08-17 structure, Sprint 5 after the 2026-08-21 reorder, Sprint 6 after the first 2026-09-01 reorder, and is now **Sprint 7**. Progress photos, photo comparison, and the existing visual concepts are all preserved exactly as documented; only the sprint number changed. It stays immediately after Journey / Weight, which owns the core Journey data architecture it depends on.

Status: ⬜ Planned

---

# Sprint 8 — Atlas

Objective: transform Atlas into a true AI health coach.

Deliverable: an AI experience that feels proactive, intelligent, and deeply integrated throughout Vita.

**⚠️ Scope reversal, carried forward:** this supersedes the original "Atlas V1 is a polished placeholder only — do not implement AI coaching yet" decision. Current app code is still a placeholder; only the plan changed.

**Renumbered twice on 2026-09-01** — Atlas was Sprint 6 under the 2026-08-17 restructure, became Sprint 7 when Settings moved ahead of Journey, and is now **Sprint 8** with the insertion of Sprint 5. Its scope and slice list are unchanged; it remains the last feature sprint before the final polish pass.

Slices: Atlas Home · Chat Experience · Meal Planning (promoted Innovation Lab idea) · Workout Planning (promoted Innovation Lab idea) · Health Guidance · Memory & Context · Recommendations · Atlas Polish.

Status: ⬜ Planned

---

# Sprint 9 — Final Polish / Motion / Launch Experience

**Renumbered and renamed 2026-09-01** — was *Sprint 8 — Final Polish & Animations*. Scope is unchanged and, if anything, clearer: this is the app-wide finishing pass and the launch experience.

Objective: the final quality pass before release.

Deliverable: finishing motion, app-wide consistency, edge cases, accessibility, performance, overall polish, and the launch experience across the finished product.

**⚠️ This is distinct from Sprint 5's motion work, and neither replaces the other.** **Sprint 5 establishes the interaction vocabulary** — what a press, a completion, a sheet, a progress change and a successful log feel like in VITA. **Sprint 9 performs the final app-wide pass**: applying that vocabulary consistently everywhere, finishing motion, resolving edge cases, and building the launch experience. Sprint 5 does not make Sprint 9 redundant.

**Relationship to per-sprint polish (founder direction, 2026-08-18).** Sprint 9 owns the *global* layer: the shared motion system, haptics vocabulary, transition consistency, and app-wide micro-interaction standards. It is **not** a holding pen for every feature's visual debt — if Fuel still feels bulky once its functionality is finished, it gets its own refinement slice inside Sprint 2 (see above), and the same principle applies to later sprints. Feature-specific motion may land earlier where it genuinely belongs to that feature; Sprint 9 then reconciles it into one vocabulary.

Motion direction stays restrained: premium micro-interactions, not novelty animation. Candidates the founders have named — a small food-icon movement on successful logging, smooth macro/progress animation, gentle confirmation transitions, water fill animation, peptide injection-site selection feedback, card state transitions, progress changes. VITA does not become a cartoon or a game. See `docs/05-Design-System.md` → "Future direction" and Vita HQ `03 Design/Motion & Animation.md`.

Status: ⬜ Planned

---

# What changed in the 2026-09-01 identity insertion

**Founder decision: Sprint 5 — VITA Identity & Interaction is inserted ahead of Journey.**

**Why.** VITA has substantial working functionality, but real-device review showed the presentation layer has become too visually generic — the same dark background, large rounded card, text, icon, another rounded card, repeated across features that behave nothing alike. The founders want VITA's visual and interaction identity established **before** Journey, because Journey is expected to be one of the app's most important and visually significant areas. Building it first would mean building it in a visual language already targeted for replacement, redesigning it immediately afterwards, and accumulating presentation-layer debt.

**This is a sequencing change and a new sprint, not a restart and not a scope cut.** No sprint's scope was reduced or cancelled.

| Sprint | Was (earlier on 2026-09-01) | Now (2026-09-01, identity insertion) |
|---|---|---|
| 4 | Settings + Tools & Reference | **Settings + Tools Foundation** — complete, renamed at closeout |
| 5 | Journey / Weight | **VITA Identity & Interaction** (new) |
| 6 | Journey / Photos | **Journey / Weight** (was 5) |
| 7 | Atlas | **Journey / Photos** (was 6) |
| 8 | Final Polish & Animations | **Atlas** (was 7) |
| 9 | — | **Final Polish / Motion / Launch Experience** (was Sprint 8, renamed) |

**Preserved explicitly:**

- **Sprint 4 is complete and is described as an intentional scope decision** — Settings + Tools Foundation. Not failed, not abandoned, not cut short. Its Settings architecture, Appearance persistence, Units architecture, `/tools`, the Tools & Reference hub, the Peptide Calculator, Injection Sites, the Body Map / injection-site primitives, navigation foundations, domain logic, utilities, persistence and repositories all stand and are **not rebuilt** by Sprint 5.
- **Remaining Tools work is not cancelled** — it resumes under the new VITA visual / interaction language.
- **BMI is still planned.** Not cancelled. Deferred until the new design language exists so it is designed once, correctly.
- **Journey is deferred to Sprint 6, not cancelled or reduced.** Weight planning, weight logging and history, the Journey data architecture, progress views, progress photos, photo comparisons and every existing visual concept stand exactly as documented. **Journey / Weight still precedes Journey / Photos.**
- **Atlas's scope is unchanged** — only its number, 7 → 8.
- **Sprint 9 remains the final app-wide polish, motion and launch pass**, and is distinct from Sprint 5's interaction-vocabulary work.
- **VITA does not become a peptide dosage or protocol recommendation engine.** Active planning language framing that as a gated future feature is withdrawn; factual reference material remains valid behind Open Question #17.
- **Health and Premium remain unscheduled**, and the orphaned Innovation Lab ideas keep their 📋 Planned status. This insertion does not resolve that.

**Sprint 5's slice structure was DRAFT at the time of this entry.** It was refined to nine slices by the founder-approved planning audit (2026-09-02) and amended to ten on 2026-09-04 when the founders ruled that the identity must reach every already-built product area before Journey. The current structure is in the Sprint 5 section above.

---

# What changed in the earlier 2026-09-01 reorder

*Historical record — this decision stands, but **its sprint numbering for 5 onward is superseded by the identity insertion above.***

**Founder decision: Settings + Tools & Reference moves ahead of Journey.**

**Why.** Journey / Weight is expected to be one of VITA's more complex feature areas. The founders would rather organize VITA's utility and settings architecture first, build out the Tools that already exist into something coherent, and establish the reference/navigation structure — and then approach Journey / Weight with cleaner app architecture and a more focused scope.

**This is a sequencing change only.** No sprint's scope was cut, reduced, or cancelled. **Journey is deferred to Sprint 5, not cancelled.**

| Sprint | Was (2026-08-21) | Now (2026-09-01) |
|---|---|---|
| 3 | Water + Peptides | Water + Peptides — unchanged (complete, merged 2026-09-01) |
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

Version 1 is complete when Sprint 9 — Final Polish / Motion / Launch Experience finishes.

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
