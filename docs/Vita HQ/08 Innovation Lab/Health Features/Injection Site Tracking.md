---
status: 📋 Planned
category: Health Features
priority: Medium
difficulty: Medium
tier: Free
date_captured: 2026-08-18
last_updated: 2026-08-18
tags: [peptides, injection-site, rotation, visual-picker, safety-sensitive]
---

# Injection Site Tracking

## Status

✅ Built — slices 3.8, 3.8A and 3.8B (2026-08-25 to 2026-08-26), **pending founder device QA.** Slice 3.8B settled the shape of it: an interactive body model *plus* a one-tap list of every canonical site, with the list as the everyday path and the figure as the visual aid one tap behind it. The taxonomy landed flat rather than region-plus-side, and the **interactive body map that this page called ordinary work was initially skipped in 3.8 and then required by the founder** — see [[Decision Log]] 2026-08-26. What shipped is deliberately narrower than the proposal below: **no rotation guidance of any kind.** VITA records where you injected and reports it back; it never suggests, ranks, schedules, or warns. The "site rotation / suggest rotating elsewhere" ideas below are **not built and are not planned** — they are the line this feature does not cross. Details: [[Peptides]], repo `docs/06-Slice-Tracker.md`.

**Route, since Sprint 4 slice 4.2:** `/tools/injection-sites`, reached via **Settings → Tools & Reference**. It was `/settings/tools/injection-sites` when built in Sprint 3. Behaviour is unchanged. **The everyday logging flow was never involved:** *View Body Model* inside the log sheet is an inline toggle rendering the body map in place, not navigation into Tools — the fast path stays fast.


*Original proposal, recorded 2026-08-18:* 📋 Planned — named directly in founder direction 2026-08-18 as a proposed slice of **Sprint 3 — Water + Peptides** ([[Roadmap]]), proposed slice **3.8**. *Sprint 5 when recorded; moved forward by the founder roadmap reorder of 2026-08-21, which put Water + Peptides ahead of Journey.*

**Built in Sprint 3 (slices 3.8–3.8C)** — including the interactive body model — and carried into **Sprint 4 — Settings + Tools & Reference**, which organises and expands the Tools experience around it rather than building it again. The lifecycle status above moves to ✅ Released when the founders close Sprint 3.

## Category

[[Health Features]]

## Priority

Medium — it is not what makes a peptide log work (that is the [[Peptide Dose Calculator]]), but it is what makes it feel like a real tracker rather than a notes field.

## Estimated Difficulty

Medium. A tappable body diagram and a recency history are ordinary work. The care is in the taxonomy and in the language: this feature sits one careless sentence away from sounding like medical advice.

## Problem

An injection log without a site is missing the thing users actually need to remember. Site rotation is a routine part of self-administration, and it is remembered — badly — in people's heads. The failure mode is repetition: reaching for the same convenient spot because there is nothing recording that you already used it.

Typing a site name into a free-text field solves none of this. It is slow, it is inconsistent ("left abdomen" vs "L abdomen" vs "belly left"), and inconsistent data cannot power any kind of rotation view later.

## Solution

**Structured site selection on every log**, chosen from a simple visual rather than typed.

- **A site picker with a simple body/model graphic.** Tap an area, the site is recorded. The founders were explicit: *this does not need to be anatomically complex* — it is a clean visual aid. **No 3D model** unless later justified.
- **A structured taxonomy**, not free text. Working examples: abdomen · left abdomen · right abdomen · thigh · left thigh · right thigh · upper arm · other/custom. The exact taxonomy is researched properly at implementation.
- **Rotation support:** remember recent sites · display the last-used location · highlight recently used areas · suggest rotating to another eligible area · maintain site history.

**⚠️ Framing boundary.** Rotation support is presented as **organizational guidance — helping the user keep track of what they already did — and never as personalized medical treatment advice.** Any claim about injection technique or site selection must be sourced and reviewed during implementation ([[Open Questions]] #17). "You last used this area on Tuesday" is a fact about the user's own log. "You should inject here instead" is not, and VITA does not say it.

## User Experience

At the end of the logging flow — after peptide and dose — the user gets a small body graphic instead of a text field. Recently used areas are visibly marked. They tap an area that isn't; it is recorded, and the log is done. The whole step takes a second and produces structured data.

Later, opening a past entry shows the site alongside dose and date. A history view shows where recent injections landed, so the pattern is visible without the user having to reconstruct it from memory.

## Why Users Would Love It

It replaces something people are currently tracking in their heads with something the app simply knows. It is faster than typing, it produces a record that is actually reviewable, and it respects the user's intelligence — showing them their own pattern rather than instructing them.

## Business Value

Depth in an underserved niche. Together with the [[Peptide Dose Calculator]], this is what separates VITA's peptide support from a generic "medication log" checkbox, for a user group the Product Bible names explicitly. Structured site data is also the prerequisite for any future consistency or rotation view.

## Dependencies

- **Peptide Log Entry model** must carry a structured site field — established in the earlier Sprint 3 slices (3.5 Peptide Definition + User Setup, 3.6 Peptide Logging + History). See the three-part model on [[Peptides]]: Peptide Definition ≠ User Peptide Setup ≠ Peptide Log Entry.
- **Site taxonomy research** at implementation.
- **Medical-content review** for any wording that touches technique or site choice — [[Open Questions]] #17.
- A body graphic asset that fits VITA's visual system ([[Design Bible]]) — quiet and diagrammatic, not clinical or alarming.

## Future Enhancements

- Site-rotation history as a reviewable view (frequency and recency by area). **Not automatic health analytics** — the founders were explicit that complex analytics are not added by default.
- **Injection rotation visualization (founder-requested, 2026-09-01 — an exploration target for Sprint 5 draft slice 5.5, not guaranteed final UX).** A body visualization showing injection locations over a selected week — for example Monday right abdomen, Tuesday left thigh, Wednesday right thigh, Friday left abdomen — with markers on the body representation and a tap opening the corresponding log or day detail. Open planning questions: front / back · multiple injections at the same site · multiple peptides · week filtering · historical filtering · marker overlap · accessibility · and whether it lives in Routine, History or Tools. See [[Open Questions]] #20.
- **Optional site logging on Mark as Taken (founder direction, 2026-09-01, Sprint 5 draft slice 5.5).** Mark as Taken → optional site selection → body map / quick site interaction → confirm, with the log retaining date, time, dose, units and injection site. **The existing logging and history architecture is reused, never replaced.**
- **Shared body-map principle (binding).** Peptide logging and this standalone tool should share the **same** body-map / injection-site primitive. **Do not create an unrelated duplicate implementation** — the existing `BodyMap` is inspected and evolved.
- Gentle selection feedback as a micro-interaction ([[Motion & Animation]]) — named by the founders as a restrained-motion candidate.
- Per-peptide site preferences, if a peptide's typical administration differs.

## Related Ideas

[[Peptide Dose Calculator]] — the other proposed Sprint 3 peptide slice; together they define the interactive tracker.

## Tags

#peptides #injection-site #rotation #visual-picker #safety-sensitive

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟡 Needs Refinement — the experience is defined; the site taxonomy and the exact wording of rotation guidance are not, and the wording is the risk-bearing part.

**Next Step Required:** Research and fix the site taxonomy, and draft the rotation copy for medical review — at Sprint 3 planning.

**Estimated Sprint:** Sprint 3 — Water + Peptides (proposed slice 3.8).

**Dependencies:**
- Peptide Log Entry model (preceding Sprint 3 slices, 3.5–3.6)
- Site taxonomy research
- Medical-content review of rotation language — [[Open Questions]] #17

**Confidence:** 7.5 / 10 — confident in the experience and in it being buildable; the deduction is for the guidance-vs-advice line, which is a review dependency rather than an engineering one.

---

**Related:** [[Innovation Lab]] · [[Health Features]] · [[Peptides]] · [[Peptide Dose Calculator]]
