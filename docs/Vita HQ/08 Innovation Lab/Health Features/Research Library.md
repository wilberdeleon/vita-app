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

📋 Planned — the **Reference** half of **Sprint 4 — Settings + Tools & Reference** ([[Roadmap]]), named by the founders on 2026-09-01. **Concept level only.** No content is authored by that decision, and nothing here is approved to ship.

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

**VITA does not casually provide "recommended dosage" or prescriptive protocols for unapproved or research compounds.** Dose-range or treatment-style content requires **explicit founder authorisation plus appropriate medical, legal and content review** — it is not a writing decision and not an engineering decision.

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

**Estimated Sprint:** Sprint 4 — Settings + Tools & Reference, at concept and structure level. Content ships only when review allows.

**Dependencies:**
- [[Open Questions]] #17 — unresolved
- Medical / legal review capacity
- The Sprint 3 release gate on existing catalog content

**Confidence:** 7 / 10 — high confidence in the value and in the structure; the deduction is entirely about review, which is outside engineering's control.

---

**Related:** [[Innovation Lab]] · [[Health Features]] · [[Peptides]] · [[Settings]] · [[Roadmap]]
