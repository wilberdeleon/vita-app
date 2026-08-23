# Current Sprint

**What is this?** A pointer to the sprint in progress and its scope. Roadmap-sprint detail lives on [[Roadmap]]; the code-level slice tracking for finished work stays in the repo's `docs/06-Slice-Tracker.md`. This page summarizes, never duplicates.

---

## Sprint 0 — Foundation ✅ Completed

Per the official roadmap issued 2026-07-09, Sprint 0 is done. This folds together two things that happened separately in practice:

- The **application shell** (old Slice 0.1–0.12: repo scaffolding, theme + UI kit, floating dock, auth/Supabase architecture, Dashboard, Fuel, Water, Peptides, My Journey, Atlas WIP, Settings shell, branding, polish) — individually tracked in the repo Slice Tracker, corrected 2026-07-09 to consistently show all of 0.1–0.12 as ✅ Approved (was previously internally inconsistent — [[Open Questions]] #6, now resolved).
- The **vision/design/documentation foundation** built across recent HQ sessions: this vault, the [[Innovation Lab]], the [[Design Bible]], the [[Claude Workflow|sprint workflow]] itself.

Both are now considered part of "Sprint 0 — Foundation," complete. Full detail: [[Roadmap]].

## Sprint 1 — Dashboard — ✅ Completed (2026-08-02)

The nine-slice plan originally defined on [[Roadmap]] was superseded mid-sprint by a full design pivot: the founders supplied real Light + Dark mockups and declared them "the new foundation, not another iteration," which replaced the earlier "Mountain World" photo-background concept entirely. What shipped instead: a real Light/Dark/System theme system (`ThemeProvider`, theme-aware `GlassSurface`/`Screen`/dock, a functional Settings Appearance picker), and a rebuilt Home dashboard — header, Today's Summary (simplified to a goals row + one primary metric), Current Journey and Macros as two separate cards, Health Metrics with a centered Streak tile, Today's Meals. A final cleanup/audit pass on 2026-08-02 removed dead code accumulated across the redesign's many iterations. Full detail: repo `docs/06-Slice-Tracker.md`.

The two prerequisite decisions that gated this sprint's UI work resolved 2026-07-09 (VITA supports Light + Dark via semantic tokens; Settings stays permanently in the top-right corner, never the dock — see [[Decision Log]]) both shipped as part of the theme system above.

## Sprint 3 — Water + Peptides — 🟡 In Progress (opened 2026-08-22)

**Founder-authorized 2026-08-22** against the approved Sprint 3 Planning & Architecture Audit. Branch: `sprint-3-water-peptides`, cut from `main`. All three entry conditions met — device QA accepted, Sprint 2 merged, branch cut.

**Objective:** turn [[Water]] and [[Peptides]] from the Sprint 0 placeholder logs they still are into real, persisted, date-aware features at the quality bar Sprint 2 set for [[Fuel]]. Both are genuinely placeholders today: neither saves anything, and both "Add" buttons discard what the user entered.

**Ten approved slices:** Shared Daily Foundation + Test Harness → Water Domain + Persistence → Water Goal + Logging → Water Visual Refinement + Fuel/Home Integration → Peptide Definitions, Catalog + Setup → Dose / Unit Calculator → Peptide Logging + History → Injection Site Tracking → Peptides UX Polish + Safety Copy → Sprint Audit. Live progress: repo `docs/06-Slice-Tracker.md`.

**The calculator comes before logging** — a log entry records a dose, so building logging first would mean building it twice.

**Safety framing the founders set for this sprint.** No field named *typical dose* or anything else implying VITA supplies a medically appropriate amount; if repeat-logging convenience is ever needed it uses neutral user-owned framing such as *last logged amount*. Schedules read **"Scheduled today"**, never "Due today" — VITA reflects what the user entered. No missed-dose language, no adherence percentages, no streak punishment, no treatment recommendations. The Sprint 3 catalog carries name, classification, and broad category only; **no educational prose ships until [[Open Questions]] #17 is resolved**.

**Slice 3.1 built (2026-08-22)** — an enabling slice with no user-visible change: the shared daily/date foundation promoted to `src/lib/daily/`, and VITA's **first committed test suite** (`jest` + `jest-expo`, dev-only, 62 tests). Closes the no-tests finding carried out of the Sprint 2 closeout audit.

**Slice 3.2 built (2026-08-22) — [[Water]] is real.** Water was not "basic", it was non-functional: a frozen `5 of 8 cups`, a unit toggle that converted nothing, and an Add button that discarded what the user typed. It now has a persisted, date-aware domain in `src/lib/water/` — millilitres canonical, exact US customary conversion, every entry storing both the canonical amount and a snapshot of what the user actually typed, and a repository boundary ready for Supabase. **No default goal is invented**: a goal is `null` until the user sets one and the screens say so, because VITA does not issue a hydration recommendation. [[Fuel]]'s Hydration card now reads the same state, and drops its percentage entirely when there is no goal. 166 tests. **Home hydration wiring landed in slice 3.4 — see below.**

**Slice 3.3 built (2026-08-23) — [[Water]] is a complete workflow.** Set your own daily goal, change it, choose your display unit, log fast, edit a drink, delete one, Undo. **VITA still suggests no goal** — no default, no presets, no placeholder amount — and **logging is never gated on setting one**. Founder correction from 3.2 implemented: the unit a drink is logged in and the unit the app displays are separate concepts, so logging 500 mL while your preference is fl oz leaves the preference alone. Today's log shows what the user actually typed, side by side across units. Two real defects found and fixed along the way — one by the test suite when the date rolled over, one in device QA. Accessibility pass across the Water surfaces. 198 tests. **Slice 3.4 built (2026-08-23) — Water refined, and [[Dashboard|Home]] now tells the truth about hydration.** The summary is a **water level**: the panel fills from the bottom as the day goes on — not a bottle or eight cup icons, which imply a vessel of fixed size when the user's goal is whatever they chose. One number, one line of context, one small control. A compact **seven-day strip shows daily volume, deliberately not goal attainment** — VITA stores one current goal and never snapshots what it was on a past day, so judging a past day would be a claim it cannot support. Home's Water tile and goal pillar are on real state and the tile opens Water; **no Water fixture data remains anywhere** — the `5 / 8` Home claimed to every user forever is gone. Reduced Motion respected. 241 tests. **[[Water]] is feature-complete for Sprint 3**, pending the sprint audit in 3.10.

**Slice 3.5 built (2026-08-23) — [[Peptides]] becomes a real setup system.** The Sprint 0 placeholder is gone (`1 / 3 logged`, the invented goal, the Morning/Midday/Evening slots, an add screen that discarded what you typed). In its place: the first two layers of the three-part model — **Definition ≠ Setup** — with an **18-entry built-in catalog**, Custom entries, a persisted setup lifecycle, and active/inactive with reactivation. **Classification is conservative by rule:** approved only where there is an FDA-approved US product, and **compounds whose US status could not be stated with confidence were omitted rather than guessed** (Sermorelin, Bremelanotide/PT-141, Thymosin Alpha-1 — all still addable via Custom). Entries carry a name, a classification, and a compound-class label only — no effects, mechanisms, protocols, or dosing. **No `typicalDose` field exists**, and schedule labels can never say "due". 360 tests. **Peptides is not feature-complete**: 3.6 calculator, 3.7 logging, 3.8 injection sites, 3.9 polish + safety copy + Fuel integration all remain.

**Partial progress on [[Open Questions]] #17.** Engineering shipped the *container* — classification as a typed field, a conservative sourcing rule, and a place for educational text that is deliberately empty. **The founders still owe (a) whether the 18-entry list and its class labels are approved, (b) whether any educational content ships at all, and (c) the exact disclaimer copy and placement** — the last of which slice 3.9 needs.

**Slice 3.5A built (2026-08-23) — expanded library + research detail pages.** Founder review of 3.5 asked for a substantially bigger catalog and real information in the app. The catalog goes **18 → 71 entries**; a new *compound type* field lets VITA list peptide-adjacent compounds (MK-677, NAD+, 5-Amino-1MQ) **without calling them peptides**; aliases make brand and code names searchable; and **blends are first-class** — GLOW, KLOW, BPC-157 + TB-500, Semax + Selank, CagriSema — with **no vendor blend asserting amounts**, because formulations vary and the user's own setup owns what's in their vial. **"CLOW" was researched and deliberately not added** — no established meaning could be verified. New **research detail pages** carry About, *Studied for*, Targets, an evidence level, plain status, and sources; regulatory status is one line, not the whole page. Sources are **pointers into PubMed / ClinicalTrials.gov / Drugs@FDA**, never hand-written citations. Recommendation language is blocked mechanically by a content test. 405 tests.

**⚠️ [[Open Questions]] #17 (b) and (c) are now the live blockers.** All 71 entries and every research summary are **engineering-authored and have not had medical or legal review**, and the disclaimer copy slice 3.9 needs is still unwritten. The founders owe: approval of the catalog and its research content, and the final disclaimer wording.

**Next: slice 3.6 — Dose / Unit Calculator.** Terminology recorded: the user-supplied field is **"Amount to convert"**, never a recommended dose.

## Sprint 2 — Fuel — ✅ Complete (started 2026-08-17 · audited 2026-08-21 · merged to `main` 2026-08-21)

**Founder-authorized 2026-08-17.** Branch: `sprint-2-fuel`. The 2026-08-17 roadmap restructure makes Fuel officially Sprint 2 (it was Sprint 3 under the 2026-07-09 plan) — see [[Roadmap]] and [[Decision Log]].

**Objective:** turn Fuel from presentation-only screens into a real nutrition tracking system. Fuel inherits the theme system, card language, and spacing/typography patterns established in Sprint 1 rather than building its own — the approved visual design is locked, and Fuel is not redesigned.

**Approved architecture — prove the engine before the network.** The nutrition foundation (food entries → daily state → calculated totals → persistence) is built and proven *before* external food providers are introduced. The shared nutrition domain is promoted to `src/lib/nutrition/` so neither [[Fuel]] nor [[Dashboard]] imports the other's internals, per CLAUDE.md rule 4 — the same promotion [[Journey Stages]] received.

**Slice sequence:** Nutrition Foundation → Core Logging → Home Integration → Recents/Favorites/Custom Foods → Provider Layer → Food Search → Barcode Scanner → Edge Cases & Polish → **Fuel Visual Refinement** → Final Verification. Live progress: repo `docs/06-Slice-Tracker.md`.

**Fuel Visual Refinement added 2026-08-18 (founder direction).** Functionality stays the priority for the rest of the sprint, but Fuel is not considered polished until a dedicated visual/interaction pass runs — the current screens read as *too basic, too bulky, overusing large numbers, filling space because space exists.* Presentation only; the feature architecture does not change. The slice is recorded, **not yet opened or approved** — it enters the normal slice workflow when the preceding slices complete. See [[Roadmap]], [[Fuel]], [[Design Bible]].

**Closeout audit 2026-08-21 — CONDITIONAL PASS.** Fuel is feature-complete for this development phase: logging, Food Detail, edit/delete/undo, Home synchronization, USDA, Open Food Facts, search aggregation, recents, favorites, barcode scanning and its incorrect-product recovery, the approved visual redesign, food-image persistence, and the VITA food illustrations. Both typechecks clean, iOS export succeeds, 67 executed assertions pass, and a live provider run returns the right foods for real queries. One defect found and fixed (Favorites showed an empty state before storage hydrated). **Merge is gated on founder physical-device QA only** — the tooling here can render and screenshot screens but cannot tap them, so every touch-dependent path is reasoned rather than exercised. Two things are carried forward deliberately: Sprint 2 has **no committed test suite** (recommended as Sprint 3's first task), and the Kroger barcode remains an upstream Open Food Facts data error that no client change can fix. Detail: repo `docs/06-Slice-Tracker.md` → Sprint 2 closeout audit, and `docs/07-Audit-Log.md`.

**Opened and built 2026-08-21 as slice 2.9 — since approved.** The founders opened it directly after the Barcode Scanner rather than after Edge Cases & Polish, so the three remaining unstarted slices (Restaurant Coverage, Water Wiring, Polish & Audit) shifted to 2.10–2.12. Scope was the **Fuel landing screen only**; the remaining Fuel surfaces keep their current presentation. Nothing functional changed. Founder review is on a physical iPhone before any further Sprint 2 work starts. Detail: [[Fuel]], repo `docs/06-Slice-Tracker.md`.

**Binding constraints:** do not upgrade the Expo SDK · no provider secrets in the client · verify provider licensing before caching third-party data · [[Water]] and [[Peptides]] preserved but not expanded · the approved visual design stays locked.

## Sprint 3 — Water + Peptides — ⬜ Next, not opened

**Roadmap reorder, founder decision 2026-08-21.** Water + Peptides moves ahead of [[My Journey|Journey]] and becomes Sprint 3; Journey / Weight becomes Sprint 4 and Journey / Photos Sprint 5. Reason: establish more of VITA's daily health-tracking infrastructure before beginning the larger Journey experience. **Journey is deferred, not cancelled or reduced.** See [[Roadmap]] and [[Decision Log]].

**Objective:** bring both daily logs to real, persisted functionality — [[Water]] and [[Peptides]] as genuinely functional health-tracking features rather than the visual mocks they are today, backing the compact Hydration and Peptides modules on the redesigned [[Fuel]] screen. **Fuel is not redesigned again.**

**Proposed slices (illustrative, not yet approved):** Sprint Foundation / Shared Daily Tracking Architecture → Water Data Model + Persistence → Water Logging + Goal Experience → Water Visual Polish / Fuel Integration → Peptide Definition + User Setup Architecture → Peptide Logging + History → Dose / Unit Calculator → Injection Site Tracking → Peptide UX / Fuel Integration → Sprint Audit / Polish. Full scope on [[Roadmap]].

**Entry conditions — two of three met.** Sprint 2's final physical-device QA is accepted and Sprint 2 is merged into `main` (2026-08-21, merge commit `44eeae6`). Remaining: cut a fresh branch (expected `sprint-3-water-peptides`) from `main`. No slice is scoped or approved and no branch exists.

**Open before implementation:** peptide catalog sourcing and the medical/legal boundary ([[Open Questions]] #17) · who owns the hydration goal preference, Water or [[Settings]] ([[Open Questions]] #16) · Peptides sharing purple with [[Atlas]] ([[Color System]]).

### Definition of done (from the Build Handbook)

Functionality works · UI matches the Design System · no known critical bugs · documentation updated · audit completed · founder approval.

**Related:** [[Project Status]] · [[Roadmap]] · [[Claude Workflow]] · [[Sprint Retrospectives]]
