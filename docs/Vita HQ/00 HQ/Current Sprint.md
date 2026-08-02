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

## Sprint 2 — Fuel (next, in progress)

**Reprioritized ahead of Journey** (the official [[Roadmap]]'s original Sprint 2) per founder direction, 2026-08-01/02 — see [[Roadmap]] for the flagged sequencing note. Fuel inherits the theme system, `GlassSurface` card language, and spacing/typography patterns established in Sprint 1 rather than building its own visual language from scratch.

### Definition of done (from the Build Handbook)

Functionality works · UI matches the Design System · no known critical bugs · documentation updated · audit completed · founder approval.

**Related:** [[Project Status]] · [[Roadmap]] · [[Claude Workflow]] · [[Sprint Retrospectives]]
