# VITA — Master Roadmap

The Master Roadmap defines the long-term development plan for VITA.

It outlines the major phases, sprints, and milestones that move the product from concept to release.

It intentionally avoids implementation details. Those belong in the Slice Tracker and Technical Documentation.

**Source of truth:** this file mirrors the founders' official Sprint Roadmap. **Restructured 2026-08-17 (founder authorization, Sprint 2 approval)** — this supersedes the 8-sprint structure issued 2026-07-09 (Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta) that previously lived here. See "What changed in the 2026-08-17 restructure" below for what moved and what is no longer scheduled. Vita HQ (`docs/Vita HQ/01 Vision/Roadmap.md`) mirrors this page; update both together if the plan changes again.

---

# Current Stage

**Sprint 2 — Fuel** · Status: 🟡 In Progress (started 2026-08-17, branch `sprint-2-fuel`)

Objective: turn Fuel from a set of presentation-only screens into a real nutrition tracking system — one shared nutrition domain driving both Fuel and Home, real food providers, real barcode scanning, and food logging that survives a restart.

Everything before it is complete: Sprint 0, Sprint 0.1, Sprint 1, and the App-Wide Visual Consistency Pass.

---

# Development Philosophy

We build in three levels.

Project → Sprint → Slice

Projects define the product. Sprints define major milestones. Slices define individual features.

---

# Sprint Plan (official, founders 2026-08-17)

| Sprint | Objective | Status |
|---|---|---|
| 0 — Visual Foundation | Establish identity, vision, architecture, and the application shell | ✅ Complete |
| 0.1 — Polish | Global design polish over the Sprint 0 shell | ✅ Complete |
| 1 — Dashboard / Home | Build the Home experience that defines the quality standard for the app | ✅ Complete |
| — App-Wide Visual Consistency Pass | Migrate every screen onto the theme system Sprint 1 established | ✅ Complete |
| **2 — Fuel** | **Build the smartest nutrition experience possible** | **🟡 Current** |
| 3 — Journey / Weight | The weight half of the Journey experience | ⬜ Planned |
| 4 — Journey / Photos | The transformation-photo half of the Journey experience | ⬜ Planned |
| 5 — Water & Peptides | Bring both existing logs to real, persisted functionality | ⬜ Planned |
| 6 — Atlas | Transform Atlas into a true AI health coach | ⬜ Planned |
| 7 — Settings / Account | Profile, notifications, preferences, units, appearance, privacy | ⬜ Planned |
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

# Sprint 2 — Fuel 🟡

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

*This is founder-stated direction recorded ahead of time. The slice is not yet formally opened, scoped, or approved — that happens under the normal slice workflow when the preceding slices complete.*

Status: 🟡 In Progress

---

# Sprint 3 — Journey / Weight

Objective: build the weight half of Vita's emotional core.

Deliverable: a Journey experience that motivates through progress, not just data display.

**⚠️ Design-risk flag (Streak System), carried forward from the 2026-07-09 roadmap:** a literal streak that resets to zero on a missed day conflicts with the "Progress over Perfection" principle and the "no guilt mechanics — ever" rule that Journey Stages was explicitly built to satisfy. Resolve the design approach (grace days, a non-punishing "current run" reframing, etc.) before that slice starts.

Status: ⬜ Planned

---

# Sprint 4 — Journey / Photos

Objective: build the transformation-photo half of the Journey experience.

Deliverable: photo capture, comparison, and progress storytelling that makes change visible.

Status: ⬜ Planned

---

# Sprint 5 — Water & Peptides

Objective: bring both existing logs to real, persisted functionality.

Deliverable: Water and Peptides as genuinely functional features rather than the visual mocks they are today.

**Resolves a previously flagged gap.** Water and Peptides had no sprint anywhere in the 2026-07-09 roadmap — logged as Gap #1 and #2 there and as Open Question #11. This sprint closes both.

## Proposed slices — founder direction, 2026-08-18

Recorded ahead of the sprint so the scope is not rediscovered later. **Slice names and boundaries are illustrative and not yet approved**; the sprint is planned and opened under the normal workflow when Sprint 4 completes.

| # | Slice | Scope |
|---|---|---|
| 1 | Water Foundation | User-defined daily goal, quick logging, persistence, date-aware daily reset |
| 2 | Water Experience | Progress visualization, quick-add amounts, polish |
| 3 | Peptide Data Foundation | Peptide catalog + Custom entry, user vial/reconstitution setup, log entry model |
| 4 | Peptide Calculator | Reconstitution model and bidirectional syringe units ↔ dose conversion |
| 5 | Injection Site Tracking | Site picker, simple body visual, site-rotation history |
| 6 | Peptide History & Polish | Log review, editing, interaction refinement, disclaimer placement |

### Water — direction

Water exists conceptually inside Fuel today and is deliberately **not** a Sprint 2 focus: Sprint 2 preserves its entry points and necessary integration only, and does not remove it. The deep hydration work belongs here.

The target is a small, useful hydration system rather than a static `5 of 8 cups` counter:

- **User-defined daily goal** in cups, ounces, millilitres, or litres. VITA does not assume every user wants exactly 8 cups. The goal persists until changed. Flow: set goal → log throughout the day → see progress toward it. The long-term goal *preference* may end up owned by Settings (Sprint 7) — sequencing question, tracked in Vita HQ `00 HQ/Open Questions.md`.
- **Fast logging** via quick amounts (e.g. +8 / +12 / +16 / +24 oz) plus a custom amount, following the user's unit system.
- **A more satisfying progress visual** — fill level, bottle/glass, circular progress, fluid motion, or a clean bar. **Do not assume a literal animated water bottle is automatically right**; design it inside VITA's premium visual system.
- **Date-aware behavior:** today's intake, daily rollover, goal, progress, and history later. Full hydration analytics are out of scope unless explicitly planned.

### Peptides — direction

Peptides should become a genuinely interactive tracker rather than a basic logging form, while staying **informational and tracking-oriented**. Founder-stated scope: peptide/product being tracked · vial amount · reconstitution volume · dose · syringe units · injection site · date/time · history · site rotation.

- **Catalog + Custom.** A searchable/selectable peptide list with a Custom option for anything not listed. Data sourcing and product/legal boundaries must be defined **before** implementation.
- **Short educational information** per peptide — name, category/class, general mechanism, target/receptor context, high-level research purpose. Content must come from reliable sources and be written carefully. No medical claims are authored in advance of that review.
- **⚠️ Safety/medical boundary.** The feature must clearly distinguish FDA-approved medications from investigational/research compounds, and must not present research compounds as approved treatments. An unobtrusive disclaimer — informational purposes, not medical advice, consult a healthcare professional, research compounds may not be approved for human use — with placement decided during implementation. Exact copy is reviewed then, not now. Do not make the app unusable with a giant disclaimer on every screen.
- **Vial / reconstitution model and a bidirectional calculator.** Given vial amount + reconstitution volume (e.g. 10 mg vial, 1 mL bacteriostatic water): entering syringe units shows the calculated mg/mcg dose, and entering a mg/mcg dose shows the equivalent syringe units. This exists specifically because many users think in syringe units and do not intuitively do the conversion. It must be implemented transparently, with **verified math, normalized internal units (mg · mcg · mL · syringe units — never free-form strings for dose math), and tests**.
- **Saved regimen/setup** — peptide, vial strength, reconstitution amount, start date, typical dose, schedule where appropriate — so daily logging is fast and vial math is not retyped per injection. Flow: Peptides → select active peptide → enter dose/units → select site → log.
- **Injection site logging and rotation.** Site taxonomy (abdomen/left/right, thigh/left/right, upper arm, other) researched at implementation. A simple body/model graphic to tap — a clean visual aid, **not** a complex 3D model unless later justified. Rotation support (remember recent sites, show last used, highlight recent areas, suggest another eligible area) is presented as **organizational guidance, not personalized medical advice**; any claim about injection technique or site selection must be sourced and reviewed.
- **History** — date, peptide, dose, units, site, notes, with editing. Frequency/consistency/site-rotation views are possible later; complex health analytics are not added automatically.
- **Data architecture:** keep **Peptide Definition** (what the compound is), **User Peptide Setup** (this user's vial/reconstitution configuration), and **Peptide Log Entry** (one recorded administration) as three separate concerns — mirroring the Food Definition ≠ Food Entry separation Sprint 2 established. Do not collapse them into one record. See `docs/09-Technical-Documentation.md` → "Future architecture considerations".

Standalone proposals for the calculator and site tracking live in the Vita HQ Innovation Lab; this section is the sprint-scope view, not the full proposal.

Status: ⬜ Planned

---

# Sprint 6 — Atlas

Objective: transform Atlas into a true AI health coach.

Deliverable: an AI experience that feels proactive, intelligent, and deeply integrated throughout Vita.

**⚠️ Scope reversal, carried forward:** this supersedes the original "Atlas V1 is a polished placeholder only — do not implement AI coaching yet" decision. Current app code is still a placeholder; only the plan changed.

Slices: Atlas Home · Chat Experience · Meal Planning (promoted Innovation Lab idea) · Workout Planning (promoted Innovation Lab idea) · Health Guidance · Memory & Context · Recommendations · Atlas Polish.

Status: ⬜ Planned

---

# Sprint 7 — Settings / Account

Objective: build the Settings and account experience.

Deliverable: profile, notifications, preferences, units, appearance, and privacy — replacing the current shell.

**Resolves a previously flagged gap.** Settings' navigation placement was locked 2026-07-09 (permanently top-right, never the dock), but its actual feature work had no scheduled sprint — the most concerning of the three gaps flagged in the prior roadmap. This sprint closes it.

Status: ⬜ Planned

---

# Sprint 8 — Final Polish & Animations

Objective: the final quality pass before release.

Deliverable: motion, micro-interactions, accessibility, performance, and overall polish across the finished product.

**Relationship to per-sprint polish (founder direction, 2026-08-18).** Sprint 8 owns the *global* layer: the shared motion system, haptics vocabulary, transition consistency, and app-wide micro-interaction standards. It is **not** a holding pen for every feature's visual debt — if Fuel still feels bulky once its functionality is finished, it gets its own refinement slice inside Sprint 2 (see above), and the same principle applies to later sprints. Feature-specific motion may land earlier where it genuinely belongs to that feature; Sprint 8 then reconciles it into one vocabulary.

Motion direction stays restrained: premium micro-interactions, not novelty animation. Candidates the founders have named — a small food-icon movement on successful logging, smooth macro/progress animation, gentle confirmation transitions, water fill animation, peptide injection-site selection feedback, card state transitions, progress changes. VITA does not become a cartoon or a game. See `docs/05-Design-System.md` → "Future direction" and Vita HQ `03 Design/Motion & Animation.md`.

Status: ⬜ Planned

---

# What changed in the 2026-08-17 restructure

Recorded so nothing is silently dropped. The prior structure (founders, 2026-07-09) was: Foundation → Dashboard → Journey → Fuel → Atlas → Health → Premium → Beta.

**Moved:**
- **Fuel** 3 → **2** (confirms the 2026-08-01/02 reprioritization ahead of Journey; the repo doc previously still read "Sprint 2 = Journey, Sprint 3 = Fuel", which is what this restructure corrects).
- **Journey** 2 → split across **3 (Weight)** and **4 (Photos)**.
- **Atlas** 4 → **6**.

**Added:** Sprint 0.1 and the Visual Consistency Pass recorded as first-class completed entries · **Sprint 5 — Water & Peptides** · **Sprint 7 — Settings / Account**.

**Replaced:** Sprint 7 — Beta → **Sprint 8 — Final Polish & Animations**. The Beta sprint's non-polish slices (Analytics, Crash Reporting, App Store Preparation, Final QA & Launch Checklist) have no explicit home in the new structure.

**⚠️ No longer scheduled — flagged, not resolved:**

- **Sprint 5 — Health** (Health Dashboard, Weight Trends, Health Age, Biomarker Age, Apple Health Integration, Oura, WHOOP).
- **Sprint 6 — Premium** (Widgets, Live Activities, Smart Notifications, Themes & Personalization, Voice Atlas, Premium Features, Subscription Experience).

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
