# VITA — Master Roadmap

The Master Roadmap defines the long-term development plan for VITA.

It outlines the major phases, sprints, and milestones that move the product from concept to release.

It intentionally avoids implementation details. Those belong in the Slice Tracker and Technical Documentation.

**Source of truth:** this file mirrors the founders' official Sprint Roadmap, issued 2026-07-09, maintained in the Vita HQ vault (`01 Vision/Roadmap.md`). It supersedes the prior 9-sprint structure (Foundation → Dashboard → Fuel → My Journey → Water → Peptides → Atlas placeholder-only → Settings → Polish) that previously lived in this file. Synced 2026-07-09.

---

# Current Stage

**Sprint 0 — Foundation** · Status: ✅ Completed

Goal: build a complete blueprint for the application — brand identity, product vision, navigation architecture, design language, product documentation, the Design Bible, the development workflow, and core planning.

**Sprint 1 — Dashboard is in progress.** Slice 1.1 (Dashboard Layout) approved; Slice 1.2 (Dashboard Components) approved; Slice 1.3 (Greeting Card) built and pending founder Expo Go visual approval.

---

# Development Philosophy

We build in three levels.

Project → Sprint → Slice

Projects define the product. Sprints define major milestones. Slices define individual features.

---

# Sprint 0 — Foundation ✅

Objective: create the application's foundation.

Deliverables: Brand Identity · Product Vision · Atlas Identity · Navigation Architecture · Design Language · UI Direction · Product Documentation · Design Bible · Development Workflow · Innovation Lab · Core Planning. On the application-code side, this includes the repository scaffold, theme + UI kit, floating dock, auth/Supabase architecture, and the Dashboard/Fuel/Water/Peptides/My Journey/Atlas/Settings screens — tracked slice-by-slice in `docs/06-Slice-Tracker.md`.

Status: ✅ Completed

---

# Sprint 1 — Dashboard

Objective: build the Dashboard experience that defines the quality standard for the entire application.

Deliverable: a polished Home Dashboard that users could realistically experience as a production-quality feature.

**Two prerequisite decisions, founders, 2026-07-09:**
- **Theme:** VITA supports both Light Mode and Dark Mode, built on reusable semantic design tokens from the start — not hardcoded colors. Every component touched this sprint should be built against semantic token names.
- **Navigation:** Settings remains permanently in the top-right corner and is never part of the floating dock. The dock stays a fixed 4 items (Home, Fuel, Journey, Atlas).

Slices: Dashboard Layout ✅ · Dashboard Components ✅ (reusable card/container primitives, inserted 2026-07-09) · Greeting Card 🟡 (built, pending founder Expo Go visual approval) · Today's Summary · Health Metrics (Steps, Water, Meals Logged, Sleep — not Peptides) · Journey Preview · Meals Preview · Floating Navigation (existing 4-tab dock only, no Settings) · Dashboard Polish (incl. verifying both Light and Dark render correctly).

Status: 🟡 In Progress

---

# Sprint 2 — Journey

Objective: build the emotional core of Vita.

Deliverable: a complete Journey experience that motivates through progress, not just data display.

Slices: Journey Overview · Journey Timeline · Milestones · Achievements · Streak System · Rewards & Celebrations · Journey Detail Screen · Journey Polish.

**⚠️ Design-risk flag (Streak System):** a literal streak that resets to zero on a missed day conflicts with the "Progress over Perfection" principle and the "no guilt mechanics — ever" rule that Journey Stages was explicitly built to satisfy. Resolve the design approach (grace days, a non-punishing "current run" reframing, etc.) before this slice starts.

Status: ⬜ Planned

---

# Sprint 3 — Fuel

Objective: build the smartest nutrition experience possible.

Deliverable: a complete food logging experience centered on simplicity, speed, and intelligent recommendations.

Slices: Food Logging · Food Search · Barcode Scanner (real camera implementation, replacing the current static mock) · Daily Nutrition · Meal History · Restaurant Support · Screenshot Food Analysis (promoted Innovation Lab idea) · Fuel Polish.

Status: ⬜ Planned

---

# Sprint 4 — Atlas

Objective: transform Atlas into a true AI health coach.

Deliverable: an AI experience that feels proactive, intelligent, and deeply integrated throughout Vita.

**⚠️ Scope reversal (2026-07-09):** this supersedes the prior "Atlas V1 is a polished placeholder only — do not implement AI coaching yet" decision that previously lived in this file's Sprint 6. Current app code is unchanged (still a placeholder); only the plan changed.

Slices: Atlas Home · Chat Experience · Meal Planning (promoted Innovation Lab idea) · Workout Planning (promoted Innovation Lab idea) · Health Guidance · Memory & Context · Recommendations · Atlas Polish.

Status: ⬜ Planned

---

# Sprint 5 — Health

Objective: build Vita's health intelligence platform.

Deliverable: meaningful health insights powered by wearable integrations and biomarker analysis.

Slices: Health Dashboard · Weight Trends · Health Age (promoted Innovation Lab idea) · Biomarker Age (promoted Innovation Lab idea) · Apple Health Integration (promoted Innovation Lab idea) · Oura Integration · WHOOP Integration · Health Polish.

Status: ⬜ Planned

---

# Sprint 6 — Premium

Objective: deliver the premium Vita experience.

Deliverable: premium features that elevate the product beyond traditional health apps.

Slices: Widgets (promoted Innovation Lab idea) · Live Activities · Smart Notifications · Themes & Personalization · Voice Atlas (promoted Innovation Lab idea) · Premium Features · Subscription Experience · Premium Polish.

Status: ⬜ Planned

---

# Sprint 7 — Beta

Objective: prepare Vita for public release.

Deliverable: a stable, production-ready beta.

Slices: Bug Fixes · Performance · Accessibility · Offline Improvements · Analytics · Crash Reporting · App Store Preparation · Final QA & Launch Checklist.

Status: ⬜ Planned

---

# Gaps requiring founder attention

**Water, Peptides, and Settings — all existing, already-built (or shell-built) product areas — have no sprint anywhere in this roadmap.** This is a known, flagged gap, not an oversight silently filled in:

- **Water** and **Peptides** had sprints in the prior roadmap structure (Sprint 4 and 5 respectively); those sprint numbers now belong to different content (Health and — no equivalent). Their long-term scheduling is undecided.
- **Settings'** navigation placement is resolved (permanently top-right corner, not the dock — founders, 2026-07-09), but its actual feature work (profile, notifications, preferences, units, appearance, privacy) still has no scheduled sprint. This is the most concerning of the three since Settings is part of the five-item primary navigation.

See the Vita HQ vault (`01 Vision/Roadmap.md`, "Gaps worth founder attention") for full detail.

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

Version 1 is complete when Sprint 7 — Beta finishes.

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
