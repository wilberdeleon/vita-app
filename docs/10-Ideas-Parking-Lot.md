# VITA — Ideas Parking Lot

Single source of truth for future ideas.

Ideas parked here are not commitments. Before any idea graduates to the Roadmap, it must pass the VITA Promise questions in the Product Bible and the "Build for the Next 10 Years" test in the Founder's Principles.

**Where full proposals live.** Since the Innovation Lab was created (2026-07-06), the written-up proposal for an idea — problem, solution, user experience, dependencies, implementation readiness — lives in Vita HQ at `docs/Vita HQ/08 Innovation Lab/`. This page stays the repo-side index: what is parked, and where to read it. It does not duplicate the proposals.

---

## Parked Ideas

| Date | Idea | Notes |
|------|------|-------|
| 2026-08-18 | **Contextual food visuals** | Small, tasteful food illustrations/icons in Fuel — burger, taco, bowl, oatmeal, coffee — for quick recognition, never large food photography. Needs a `Food → Category → illustration` mapping and must degrade cleanly when a provider has no image. Unscheduled. Proposal: HQ `08 Innovation Lab/Nutrition Features/Contextual Food Visuals.md` · direction: `05-Design-System.md`, `09-Technical-Documentation.md` |
| 2026-08-18 | **Peptide dose calculator** | Bidirectional syringe units ⇄ mg/mcg conversion from a saved vial + reconstitution setup. Scoped into Sprint 3 as proposed slice 3.7 (reordered 2026-08-21; was Sprint 5); parked here because the math, unit handling, and test requirements need real design first. Proposal: HQ `08 Innovation Lab/Health Features/Peptide Dose Calculator.md` |
| 2026-08-18 | **Injection site tracking & rotation** | Simple tappable body visual for recording injection site, plus site history and rotation guidance (organizational, not medical advice). Scoped into Sprint 3 as proposed slice 3.8 (reordered 2026-08-21; was Sprint 5). Proposal: HQ `08 Innovation Lab/Health Features/Injection Site Tracking.md` |
| 2026-09-01 | **BMI Calculator** | Height input, weight input, calculated BMI, category/range, and a polished visual representation of the scale. Named by the founders as a planned Tool for **Sprint 4 — Settings + Tools & Reference**. *Future opportunity, deliberately not built with it:* once Journey / Weight exists (Sprint 5), BMI could read the user's stored height and latest weight instead of requiring duplicate entry. Proposal: HQ `08 Innovation Lab/Health Features/BMI Calculator.md` |
| 2026-09-01 | **Food / Product Scanner (Food Score)** | A Yuka-style scanner: scan a barcode or product and get an easy-to-understand food/product evaluation — ingredient and nutrition information, an understandable score, an explanation of *why* it scored that way, and potential alternatives later. A **Sprint 4 candidate, not a guaranteed or trivial feature**; likely the largest single Tools item and may need its own slice or planning pass. Scoring methodology and its defensibility are unresolved. Proposal: HQ `08 Innovation Lab/Nutrition Features/Food & Product Scanner.md` |
| 2026-09-01 | **Research Library / Reference** | A reference layer for Sprint 4: peptide and compound reference material, storage and handling, reconstitution basics, stability and general reference, research/development/approval-status reference. **Binding boundary (restated 2026-09-01):** VITA does **not** provide recommended dosages, dose ranges, or treatment-style protocols, and doing so is **not a product direction** — the earlier "with authorisation and review" framing is withdrawn. Reference material stays factual: storage, handling, reconstitution concepts, stability, development status — that content requires explicit founder authorization plus medical, legal and content review. Proposal: HQ `08 Innovation Lab/Health Features/Research Library.md` |
| 2026-09-01 | **Tools discoverability from Dashboard** | Tools may eventually be surfaced from Dashboard/Home for easier discoverability, in addition to Settings → Tools & Reference. **Exact placement is deliberately undecided and no Dashboard card is authorized.** Recorded as a saved product idea. Proposal: HQ `08 Innovation Lab/UX Improvements/Tools Discoverability from Dashboard.md` |
| 2026-09-01 | **Peptide reminder delivery** | Sprint 3 persists reminder preferences and a reminder time on a routine, but **OS notification delivery is not implemented** and a test asserts no notification dependency exists. Future work: scheduled routine notifications, Taken / Skipped actions from a notification, and delivery on the configured schedule days. Unscheduled; not automatically Sprint 4 scope. See `04-Master-Roadmap.md` → Sprint 4 and HQ `02 Product/Peptides.md`. |

## Recorded on the Roadmap instead

Founder direction from 2026-08-18 that already has a scheduled home, listed so it is not looked for here:

- **Fuel Visual Refinement** — a dedicated late slice of Sprint 2 (density, typography, number sizing, hierarchy, logging polish). See `04-Master-Roadmap.md`.
- **Water: user-defined goal, quick logging, better progress visualization, date-aware daily behavior** — Sprint 3. See `04-Master-Roadmap.md`.
- **Peptides: catalog + Custom, educational information, approved-vs-research distinction, saved vial/reconstitution setup, history and editing, disclaimer framework** — Sprint 3. See `04-Master-Roadmap.md`.
- **Shared motion system, haptics, global micro-interaction standards** — Sprint 8. See `05-Design-System.md` → Future direction.
- **Settings: profile, notifications, preferences, units, appearance, privacy** — Sprint 4 (moved up from Sprint 7 on 2026-09-01 and broadened to **Settings + Tools & Reference**). See `04-Master-Roadmap.md`.
- **A coherent Tools destination for the existing Peptide Calculator and Injection Sites / Body Model** — Sprint 4. These already shipped in Sprint 3; Sprint 4 organizes and expands them rather than building them from zero. See `04-Master-Roadmap.md`.
