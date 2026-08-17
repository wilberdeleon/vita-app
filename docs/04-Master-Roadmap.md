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

Slices: Nutrition Foundation · Core Logging (manual food → log → meal → totals → edit/delete) · Home Integration · Recents / Favorites / Custom Foods · Provider Layer · Food Search · Barcode Scanner · Edge Cases & Polish · Final Verification.

**Binding constraints for this sprint:**
- **Do not upgrade the Expo SDK.** The App Store Expo Go build is still SDK 54; SDK 55–57 builds remain in Apple review. If a dependency requires an upgrade, stop and report before proceeding.
- **No provider secrets in the client.** Any provider requiring server-side credentials goes behind a minimal Supabase Edge Function, narrowly scoped to provider access — not a broad Supabase or auth migration.
- **Provider licensing is a hard constraint.** Verify current licensing, attribution, storage, and caching terms before caching or persisting any third-party nutrition data.
- **The approved visual design is locked.** Fuel is not redesigned; new functional states follow the established system with Home as the visual source of truth.

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
