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

## Sprint 2 — Fuel — 🟢 Feature-complete, in closeout (started 2026-08-17 · audited 2026-08-21)

**Founder-authorized 2026-08-17.** Branch: `sprint-2-fuel`. The 2026-08-17 roadmap restructure makes Fuel officially Sprint 2 (it was Sprint 3 under the 2026-07-09 plan) — see [[Roadmap]] and [[Decision Log]].

**Objective:** turn Fuel from presentation-only screens into a real nutrition tracking system. Fuel inherits the theme system, card language, and spacing/typography patterns established in Sprint 1 rather than building its own — the approved visual design is locked, and Fuel is not redesigned.

**Approved architecture — prove the engine before the network.** The nutrition foundation (food entries → daily state → calculated totals → persistence) is built and proven *before* external food providers are introduced. The shared nutrition domain is promoted to `src/lib/nutrition/` so neither [[Fuel]] nor [[Dashboard]] imports the other's internals, per CLAUDE.md rule 4 — the same promotion [[Journey Stages]] received.

**Slice sequence:** Nutrition Foundation → Core Logging → Home Integration → Recents/Favorites/Custom Foods → Provider Layer → Food Search → Barcode Scanner → Edge Cases & Polish → **Fuel Visual Refinement** → Final Verification. Live progress: repo `docs/06-Slice-Tracker.md`.

**Fuel Visual Refinement added 2026-08-18 (founder direction).** Functionality stays the priority for the rest of the sprint, but Fuel is not considered polished until a dedicated visual/interaction pass runs — the current screens read as *too basic, too bulky, overusing large numbers, filling space because space exists.* Presentation only; the feature architecture does not change. The slice is recorded, **not yet opened or approved** — it enters the normal slice workflow when the preceding slices complete. See [[Roadmap]], [[Fuel]], [[Design Bible]].

**Closeout audit 2026-08-21 — CONDITIONAL PASS.** Fuel is feature-complete for this development phase: logging, Food Detail, edit/delete/undo, Home synchronization, USDA, Open Food Facts, search aggregation, recents, favorites, barcode scanning and its incorrect-product recovery, the approved visual redesign, food-image persistence, and the VITA food illustrations. Both typechecks clean, iOS export succeeds, 67 executed assertions pass, and a live provider run returns the right foods for real queries. One defect found and fixed (Favorites showed an empty state before storage hydrated). **Merge is gated on founder physical-device QA only** — the tooling here can render and screenshot screens but cannot tap them, so every touch-dependent path is reasoned rather than exercised. Two things are carried forward deliberately: Sprint 2 has **no committed test suite** (recommended as Sprint 3's first task), and the Kroger barcode remains an upstream Open Food Facts data error that no client change can fix. Detail: repo `docs/06-Slice-Tracker.md` → Sprint 2 closeout audit, and `docs/07-Audit-Log.md`.

**Opened and built 2026-08-21 as slice 2.9 — since approved.** The founders opened it directly after the Barcode Scanner rather than after Edge Cases & Polish, so the three remaining unstarted slices (Restaurant Coverage, Water Wiring, Polish & Audit) shifted to 2.10–2.12. Scope was the **Fuel landing screen only**; the remaining Fuel surfaces keep their current presentation. Nothing functional changed. Founder review is on a physical iPhone before any further Sprint 2 work starts. Detail: [[Fuel]], repo `docs/06-Slice-Tracker.md`.

**Binding constraints:** do not upgrade the Expo SDK · no provider secrets in the client · verify provider licensing before caching third-party data · [[Water]] and [[Peptides]] preserved but not expanded · the approved visual design stays locked.

### Definition of done (from the Build Handbook)

Functionality works · UI matches the Design System · no known critical bugs · documentation updated · audit completed · founder approval.

**Related:** [[Project Status]] · [[Roadmap]] · [[Claude Workflow]] · [[Sprint Retrospectives]]
