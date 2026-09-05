# Project Status

**What is this?** A snapshot of where Vita stands. Updated whenever the state of the project meaningfully changes.

**Why does it exist?** So anyone — founder, engineer, or future teammate — can understand the project in two minutes without reading the whole vault.

---

## Snapshot — 2026-09-04

**Sprint 3 — Water + Peptides is ✅ complete and merged** (opened 2026-08-22 on branch `sprint-3-water-peptides`, closed out by slices 3.10 and 3.10A, merged into `main` 2026-09-01 as `2bac43b`). One release gate remains open and is not an engineering blocker: the 96 peptide reference entries need qualified medical, content and legal review before public release. **Sprint 2 — Fuel is ✅ complete** (founder-authorized 2026-08-17, branch `sprint-2-fuel`; closeout audit 2026-08-21, founder device QA passed, **merged into `main` 2026-08-21** as `44eeae6` with full slice history preserved; see [[Current Sprint]]). Everything before it is complete: Sprint 0 — Visual Foundation, Sprint 0.1 — Polish, Sprint 1 — Dashboard/Home (2026-08-02), and the App-Wide Visual Consistency Pass (2026-08-16). **The roadmap was updated twice on 2026-09-01** — first [[Settings]] + Tools & Reference became Sprint 4, ahead of Journey; then **Sprint 5 — VITA Identity & Interaction was inserted**, pushing Journey / Weight to 6, Journey / Photos to 7, [[Atlas]] to 8 and the final polish sprint to 9. See [[Roadmap]] and [[Decision Log]].

**Theming is app-wide.** Light, Dark, and System work across every existing screen; System follows the device appearance live. Home/Dashboard is the documented visual source of truth — see [[Design Bible]], [[Color System]], [[Decision Log]]. The pass was a design-system migration, **not** a feature sprint: no routes, tabs, sections, data, navigation, interactions, or copy changed. Detail lives in the repo's `docs/06-Slice-Tracker.md`; this page does not duplicate it.

The entire application shell exists and runs in the iOS Simulator via Expo Go — this is the code-level substrate Sprint 0 completed on top of:

- ✅ Repository scaffolded with approved architecture (`wilberdeleon/vita-app`)
- ✅ Theme tokens + reusable UI kit (18 primitives, all theme-aware)
- ✅ Floating dock, routing shell, auth gate (mock), Supabase client architecture
- ✅ Dashboard, Fuel + full Food Log flow (8 screens), Water, Peptides, My Journey (3 tabs, hand-drawn SVG charts), Atlas work-in-progress screen, Settings shell
- ✅ Official Vita branding: brand palette, VITA mark, app icon + splash, time-of-day greeting
- ✅ Sprint 0.1 global polish: permanent domain color hierarchy, refined dock, softer shadows, subtle motion
- ✅ Vita HQ, the [[Innovation Lab]], and the [[Claude Workflow|sprint workflow]] itself — the vision/documentation half of Sprint 0

**What is real vs. mock right now:**

| Layer | State |
|---|---|
| UI / navigation | Real, complete for Sprint 0 scope; Light/Dark/System theming live app-wide |
| Theme preference | Resolves correctly, but held in memory — **resets on cold restart**; persistence not implemented |
| Data | Mock fixtures served through `api.ts` boundaries — no live data |
| Auth | Mock signed-in user; gate logic real, provider internals fake |
| Supabase | Client architecture in place; **not connected** (no migrations, no edge functions) |
| Barcode scanner | ✅ Real camera scanning shipped in Sprint 2. One open upstream defect: an Open Food Facts record filed under Kroger's barcode prefix carries Hillshire Farm's product — `Not the right product?` recovery ships as the answer |

## What's next

**After Sprint 4: Sprint 5 — VITA Identity & Interaction.** The roadmap was **updated twice on 2026-09-01 by founder decision** — Settings + Tools & Reference first moved ahead of [[My Journey|Journey]], and the identity sprint was then inserted ahead of Journey too. The order is now Fuel → Water + Peptides → **Settings + Tools Foundation** → **VITA Identity & Interaction** → Journey / Weight (Sprint 6) → Journey / Photos (Sprint 7) → [[Atlas]] (Sprint 8) → **Final Polish / Motion / Launch Experience** (Sprint 9). *(The paragraph below records the first of the two decisions, as written at the time.)* **Reason:** Journey / Weight is expected to be one of VITA's more complex feature areas, so the utility/settings architecture, the existing Tools, and the reference/navigation structure are organized first. **Journey is deferred, not cancelled or reduced** — every documented Journey requirement stands, and Weight still precedes Photos. *(Journey / Weight was Sprint 5 at the time of that decision; it is **Sprint 6** since the identity insertion later the same day.)*

**Sprint 4 — Settings + Tools Foundation is ✅ complete**, opened and closed 2026-09-01. Two founder-approved slices: **4.1 Settings Foundation** (persistent Appearance, a real Units destination reading Water's own preference, every fake row removed, accurate version) and **4.2 Tools & Reference Hub + Route Architecture** (a top-level `/tools`, the hub, both Sprint 3 tools migrated, the old `/settings/tools/…` tree removed).

**Complete means the foundation is done, not that every Tool is built.** The founders closed the sprint deliberately after the architecture landed. [[BMI Calculator|BMI]], [[Research Library]], [[Food & Product Scanner]] evolution and Dashboard Tools discoverability are **deferred, not cancelled** — all four are presentation-heavy, and a new VITA visual / interaction language is being defined next; building them now would mean designing them twice.

**That close is described, permanently, as an intentional scope decision** — not a failure, not an abandonment, not a sprint cut short.

**Sprint 5 — VITA Identity & Interaction opened 2026-09-02.** The roadmap-alignment session ran on 2026-09-01 and inserted it ahead of Journey; the paragraph below is that session's framing, and the current state is directly after it. Its objective is to **make VITA feel unmistakably like VITA** — establishing the visual and interaction language before Journey is built in it, because real-device review found the presentation layer had become too visually generic: dark background, large rounded card, text, icon, another rounded card, repeated across features that behave nothing alike.

**Sprint 5 is 🟡 in progress**, opened 2026-09-02 on branch `sprint-5-identity-interaction` (cut from `main` at `8dce19c`), founder-authorized against the approved Sprint 5 Planning & Architecture Audit. **Three slices are founder-approved on device and locked: 5.1 VITA Design Language + Identity Prototype, 5.2 Interactive [[Water]] Experience, and 5.3 [[Dashboard]] Identity Redesign** (approved 2026-09-04, across subpasses 5.3A–5.3D). **5.4 — [[Peptides]] Home Redesign is next** and needs its own authorization.

**⚠️ Scope amended 2026-09-04 by founder ruling.** After reviewing production Water and Dashboard, the founders ruled that **Sprint 5 must apply the identity language across every already-built product area before [[My Journey|Journey]] begins** — with two features in the new language and the rest in the old one, VITA reads as two products. **[[Fuel]] gains a dedicated identity slice (5.6)** it never had, and Tools becomes **Tools + [[Settings]] (5.7)**. Motion, [[BMI Calculator|BMI]] and the founder audit each shift one number. **The sprint is now ten slices, 5.1–5.10**, nothing was cut, and **Sprint 6 — Journey / Weight begins only after 5.10 passes founder real-device review** — *"Does current VITA now feel like one coherent product?"*

**The identity system is the baseline for all future VITA feature work, Journey included.** Journey inherits the language rather than inventing a new one, while keeping its own distinct feature identity — the ruling is *one product language, not one identical layout*. Two companion rulings: **Dashboard's widget customization is Home's own pattern**, not a template for other screens; and **VITA respects the platform text-size setting by default**, with no custom text-size control.

**Still deferred, not cancelled:** the [[Food & Product Scanner]] **scoring** evolution — `/fuel/scan` is the barcode lookup and logging flow and the Dashboard *Food Scanner* Quick Tool opens it, so **no VITA Score exists or is authorised** · the [[Research Library]], gated on [[Open Questions]] #17 · the [[Atlas]] redesign, its own later sprint. **No Movement / Activity domain exists** and none is scheduled into Sprint 5.

*The prior reorder (2026-08-21) that moved Water + Peptides ahead of Journey still stands for Sprint 3; its numbering for Sprints 4–7 is superseded.*

**Sprint 2 — Fuel**, complete and merged. The approved architecture proves the nutrition engine — food entries, daily state, calculated totals, persistence, and one shared domain in `src/lib/nutrition/` driving both [[Fuel]] and [[Dashboard]] — before external food providers (FatSecret, USDA FoodData Central, Open Food Facts) are introduced. Real barcode scanning ships in this sprint too, on the existing Expo Go + physical iPhone workflow. Slice-level detail: [[Current Sprint]] and repo `docs/06-Slice-Tracker.md`.

## Recorded 2026-08-18 — future product direction

Founder direction captured ahead of implementation, so it survives the sprints between now and when it is built. **Nothing was implemented and no slice was opened.** Summary: a dedicated **Fuel Visual Refinement** slice late in Sprint 2 (Fuel is currently too bulky and over-reliant on large numbers — presentation only, no functional redesign) · **Water & Peptides** (Sprint 5 at the time; **Sprint 3** since the 2026-08-21 reorder) given a proposed six-slice breakdown, since expanded to ten, turning Water into a user-defined-goal hydration system and Peptides into an interactive tracker with a catalog, saved vial/reconstitution setup, a bidirectional units ⇄ dose calculator, injection-site logging with rotation, and history · **Sprint 8** clarified as owning the *global* motion/haptics layer, not every feature's visual debt.

Carried with it: a **binding safety boundary** for Peptides (approved medications vs. research compounds must stay clearly distinguished; not-medical-advice disclaimer required) — [[Open Questions]] #17 must resolve before that sprint. Full detail on [[Roadmap]], [[Fuel]], [[Water]], [[Peptides]], [[Design Bible]], [[Motion & Animation]] and the [[Decision Log]].

## Resolved 2026-07-09

Two decisions that were previously open tensions are now locked, following a full project review and documentation audit:
1. **Theme:** VITA supports both Light Mode and Dark Mode, built on semantic design tokens rather than hardcoded colors — not a dark-only product, not a future retheme. **Implemented app-wide as of 2026-08-16.** See [[Design Bible]], [[Decision Log]].
2. **Navigation:** Settings stays permanently in the top-right corner and is never part of the floating dock, which stays a fixed 4 items. See [[Navigation & Floating Dock]], [[Decision Log]].

Also resolved in the same audit: the repo Slice Tracker's internal contradiction (all Sprint 0 slices now consistently ✅ Approved), and `docs/04-Master-Roadmap.md` synced to this vault's roadmap.

## Known tensions still open

Tracked in [[Open Questions]]:
1. Where Water and Peptides live in the product hierarchy going forward (#4) — narrowed, not closed: both were built in **Sprint 3**, and Sprint 4 built the Tools destination, but their place in the primary navigation is still undecided. **Sprint 5 — VITA Identity & Interaction makes this live again**, since Dashboard modules and Tools discoverability are exactly that question.
2. **⚠️ New (2026-08-17): Health and Premium are no longer scheduled**, orphaning five Innovation Lab ideas that had been promoted to 📋 Planned — [[Health Age]], [[Biomarker Age]], [[Apple Health Integration]], [[Apple Home Screen Widgets]], [[Voice Atlas]] — plus [[Mobile Order Screenshot Import]]. Their status has deliberately not been reverted. See #14.
3. Release-readiness work (analytics, crash reporting, App Store prep, launch QA) has no home now that Sprint 7 — Beta is replaced by the narrower final polish sprint — **Sprint 9 — Final Polish / Motion / Launch Experience** since the 2026-09-01 identity insertion. See #15.

**✅ Closed 2026-08-17:** Water, Peptides, and Settings having no sprint anywhere (#11) — resolved by the roadmap restructure.

## Major reversal

**Atlas is no longer scoped as a placeholder-only V1 feature.** The roadmap's Atlas sprint (**Sprint 8** since the 2026-09-01 identity insertion; 7 after the earlier 2026-09-01 reorder, 6 under the 2026-08-17 restructure, 4 before that) commits to a full AI coach (chat, meal planning, workout planning, health guidance, memory, recommendations) — superseding the prior "Atlas V1 is a polished placeholder only" decision. See [[Atlas]] and the [[Decision Log]].

## Sources

- Verified from code: repository `docs/06-Slice-Tracker.md`, `docs/08-Changelog.md`, git history, and direct code inspection.
- Roadmap structure: the founders' official Sprint Roadmap as restructured 2026-08-17 and **reordered 2026-08-21** (Water + Peptides ahead of Journey). The repo's own `docs/04-Master-Roadmap.md` was resynced to match on both dates — both describe the same plan.
- The live Slice Tracker and Changelog remain in the repo — HQ does not duplicate them.

**Related:** [[Current Sprint]] · [[Roadmap]] · [[Decision Log]] · [[Open Questions]]
