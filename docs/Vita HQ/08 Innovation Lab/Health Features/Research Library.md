---
status: 📋 Planned
category: Health Features
priority: Medium
difficulty: High
tier: Free
date_captured: 2026-09-01
last_updated: 2026-09-01
tags: [reference, research, education, peptides, safety-sensitive, sprint4]
---

# Research Library

## Status

📋 Planned — the **Reference** half of Sprint 4 (then titled *Settings + Tools & Reference*, [[Roadmap]]), named by the founders on 2026-09-01. **Concept level only.**

**⏸️ Deferred at the Sprint 4 closeout, 2026-09-01 — deferred, not cancelled.** Sprint 4 closed as **Settings + Tools Foundation** after its two foundation slices, and this remains a valid product direction. The reason is sequencing, not doubt: this is presentation-heavy work, and the founders are defining a new VITA visual and interaction language next. Building it now would mean designing it twice. It resumes once that language exists — and lands into the `/tools` architecture slice 4.2 already established, where a new tool is a row and a route rather than a question about where it belongs.

**The concept is preserved in full:** factual educational material on storage, handling, reconstitution basics, stability and general reference, and research/development/approval status. **It remains gated on [[Open Questions]] #17** independently of the visual-language deferral — that gate is about review capacity and content accuracy, and it did not move.

Original note follows. No content is authored by that decision, and nothing here is approved to ship.

## Category

[[Health Features]]

## Priority

Medium — it is what turns *Tools* into *Tools & Reference*. It is also the single most legally and medically sensitive area in the product, so its priority is bounded by review capacity rather than by desire.

## Estimated Difficulty

High — the structure is easy and the **content boundary is the hard part**. Sprint 3 already proved this: the peptide detail pages needed automated content tests to stop careful writing from drifting into either defensiveness or recommendation.

## Recommended Tier

Free.

## Problem

A user tracking compounds in [[Peptides]] has questions VITA currently answers nowhere: how is this stored, what does reconstitution actually mean, how stable is it, where does this sit in development. They go and find answers on forums and vendor sites, which is exactly where the worst information lives.

## Solution

A reference layer reachable from **Settings → Tools & Reference**. Potential content:

- Research library structure
- Peptide and compound reference / educational material
- Storage and handling reference
- Reconstitution basics
- Stability and general reference
- Research / development / approval-status reference

## ⚠️ Product boundary — binding

**⚠️ Product boundary — binding (restated 2026-09-01, Sprint 4 closeout).** VITA does **not** provide recommended dosages, dose ranges, or treatment-style protocols — for research compounds or for approved medications. **This is not a gated future feature. It is not a product direction.** Earlier wording framed such content as available with founder authorisation plus medical and legal review; that framing is withdrawn, because it described a direction the founders do not want. What VITA does is unchanged: **it helps users understand, calculate, organise and track information they enter.** Factual reference material — storage, handling, reconstitution concepts, stability, and development/approval status — remains a valid direction, still subject to the review gate in [[Open Questions]] #17.

The standing boundary, stated plainly:

> VITA helps users understand, calculate, organise and track information they enter. It does not silently become a treatment recommendation engine.

This **extends** the Sprint 3 safety rules rather than relaxing them. Sprint 3 already established: an approved-vs-research distinction that is never blurred, evidence qualifiers attached to individual claims rather than laundered into a single page badge, a development-status model with dates and sources, and build-failing tests against recommendation, guarantee and dosing language. All of it applies here.

**Open and unresolved:** the 96 peptide catalog entries and every research summary in them are engineering-authored and **have never had expert medical or legal review** — recorded as a release gate in the Sprint 3 closeout audit and tracked as [[Open Questions]] #17. Time-sensitive development-status entries need **recurring re-checks**, not a one-time approval. A Research Library makes that gate larger, not smaller.

## User Experience

Settings → Tools & Reference → Research Library → a browsable, plainly written reference. Every page says what it is, where it came from, and what VITA is not claiming.

## Why Users Would Love It

It answers the questions people are currently asking a forum, in a calm and honest register, from the app already holding their routine.

## Business Value

Trust — [[Core Principles]] #5. Reference material is also durable: it does not need rebuilding every sprint.

## Dependencies

- The Sprint 4 Tools & Reference destination and navigation.
- **Founder decisions on [[Open Questions]] #17** — whether any educational content ships at all, and the exact disclaimer copy and placement.
- Medical, legal and content review capacity.
- A sourcing rule: pointers into PubMed / ClinicalTrials.gov / Drugs@FDA, never hand-written citations — the rule Sprint 3 already adopted.

## Future Enhancements

Search across reference material · linking a routine's compound directly to its reference page · a maintenance schedule for time-sensitive status entries.

## Related Ideas

[[Peptide Dose Calculator]] · [[Injection Site Tracking]] · [[BMI Calculator]] · [[Food & Product Scanner]]

## Tags

#reference #research #education #peptides #safety-sensitive #sprint4

## Implementation Readiness

**Current Status:** 🔴 Blocked — the structure is clear, but no content can be authored until the founders settle [[Open Questions]] #17 (does educational content ship, and under what disclaimer) and until review capacity exists.

**Next Step Required:** Founder decision on #17, plus a decision on who performs medical and legal review and on what cadence.

**Estimated Sprint:** **Sprint 5 — VITA Identity & Interaction**, draft slice 5.6, at concept and structure level — carried over when Sprint 4 closed as *Settings + Tools Foundation*. **Deferred, not cancelled.** Content ships only when review allows, and the **binding boundary is unchanged: VITA does not provide recommended dosages, dose ranges, or treatment-style protocols, and doing so is not a product direction.**

**Dependencies:**
- [[Open Questions]] #17 — unresolved
- Medical / legal review capacity
- The Sprint 3 release gate on existing catalog content

**Confidence:** 7 / 10 — high confidence in the value and in the structure; the deduction is entirely about review, which is outside engineering's control.

---

**Related:** [[Innovation Lab]] · [[Health Features]] · [[Peptides]] · [[Settings]] · [[Roadmap]]
