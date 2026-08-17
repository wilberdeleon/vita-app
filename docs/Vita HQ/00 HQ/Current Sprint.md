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

## Sprint 2 — Fuel — 🟡 In progress (started 2026-08-17)

**Founder-authorized 2026-08-17.** Branch: `sprint-2-fuel`. The 2026-08-17 roadmap restructure makes Fuel officially Sprint 2 (it was Sprint 3 under the 2026-07-09 plan) — see [[Roadmap]] and [[Decision Log]].

**Objective:** turn Fuel from presentation-only screens into a real nutrition tracking system. Fuel inherits the theme system, card language, and spacing/typography patterns established in Sprint 1 rather than building its own — the approved visual design is locked, and Fuel is not redesigned.

**Approved architecture — prove the engine before the network.** The nutrition foundation (food entries → daily state → calculated totals → persistence) is built and proven *before* external food providers are introduced. The shared nutrition domain is promoted to `src/lib/nutrition/` so neither [[Fuel]] nor [[Dashboard]] imports the other's internals, per CLAUDE.md rule 4 — the same promotion [[Journey Stages]] received.

**Slice sequence:** Nutrition Foundation → Core Logging → Home Integration → Recents/Favorites/Custom Foods → Provider Layer → Food Search → Barcode Scanner → Edge Cases & Polish → Final Verification. Live progress: repo `docs/06-Slice-Tracker.md`.

**Binding constraints:** do not upgrade the Expo SDK · no provider secrets in the client · verify provider licensing before caching third-party data · [[Water]] and [[Peptides]] preserved but not expanded · the approved visual design stays locked.

### Definition of done (from the Build Handbook)

Functionality works · UI matches the Design System · no known critical bugs · documentation updated · audit completed · founder approval.

**Related:** [[Project Status]] · [[Roadmap]] · [[Claude Workflow]] · [[Sprint Retrospectives]]
