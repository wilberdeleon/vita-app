---
status: 📋 Planned
category: Health Features
priority: High
difficulty: Very High
tier: Elite
date_captured: 2026-07-06
last_updated: 2026-07-09
tags: [biomarker-age, longevity, labs, trust-sensitive, post-health-age]
---

# Biomarker Age

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 5 (Health), Slice 4. The concept is clear; data-entry mechanics and scientific claims are both still open.

## Category

[[Health Features]]

## Priority

High. The deeper, more scientifically grounded sibling of [[Health Age]] — sequenced to follow it, not precede it.

## Estimated Difficulty

Very High. Combines the same scoring-credibility problem as Health Age with a new one: getting real lab data into the app at all.

## Recommended Tier

Elite. Requires lab-result ingestion and a more sophisticated model than the behavior-only Health Age — a natural top-tier feature. *Recommendation only — see [[Business Model & Pricing]].*

## Problem

Health Age estimates biological trajectory from behavior; it can't see what's actually happening inside the body. Users on real health journeys — including [[Peptides|GLP-1 and peptide users]] — often have real bloodwork sitting in a portal or a PDF that no app helps them understand as *one number that matters*.

## Solution

A biological-age estimate computed from actual biomarkers (bloodwork): inputs like relevant metabolic, inflammatory, and lipid markers translated into an age-adjusted score, shown alongside — and reconciled with — [[Health Age]].

## User Experience

A user uploads or manually enters recent lab results (mechanism undecided — manual entry, photo/OCR, or a lab-integration API are all open options). Vita returns a Biomarker Age, explained in plain language per marker ("your A1C is trending toward pre-diabetic range — here's what that means for your score"), with Atlas contextualizing what to do about it within its coaching boundaries ([[Coaching Strategy]] — never diagnosis).

## Why Users Would Love It

For users already invested enough to get labs done, this is the payoff: their actual biology, translated into the same simple number language as the rest of Vita, instead of a PDF full of reference ranges they have to Google.

## Business Value

The strongest Elite-tier justification in the current backlog — a feature genuinely hard for competitors focused on tracking to replicate, since it requires both data-ingestion infrastructure and real scientific credibility. Reinforces the "personal operating system for health" long-term vision ([[Long-Term Vision]]).

## Dependencies

- [[Health Age]] should ship and prove the scoring-credibility model first
- Lab-data ingestion path: manual entry vs. OCR vs. third-party lab API integration — all undecided ([[Integrations]])
- Heaviest trust and possibly regulatory bar of any idea in the Lab — consumer health-claims review needed before design ([[Core Principles]] #5)

## Future Enhancements

- Direct lab-provider integrations (Function Health–style) once volume justifies it
- Feeds [[Longevity Dashboard]]
- Trend-over-time marker charts, echoing [[My Journey]] weight visualization

## Related Ideas

[[Health Age]] · [[Longevity Dashboard]] · [[Apple Health Integration]]

## Tags

#biomarker-age #longevity #labs #elite-tier #trust-sensitive #post-v1

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟡 Needs Refinement — roadmapped, but sequenced after Health Age with its own unresolved mechanics.

**Next Step Required:** Wait for [[Health Age]] to ship and prove the scoring model; separately resolve the lab-data ingestion mechanism (manual entry vs. OCR vs. lab API).

**Estimated Sprint:** Sprint 5 — Health, Slice 4

**Dependencies:**
- [[Health Age]] shipping first
- Lab-data ingestion path decision
- Consumer health-claims/regulatory review

**Confidence:** 5.5 / 10 — lowest in this promoted batch; heaviest trust bar in the Lab plus a real sequencing dependency.

---

**Related:** [[Innovation Lab]] · [[Future Features]] · [[Peptides]]
