---
status: 📋 Planned
category: Health Features
priority: Critical
difficulty: Very High
tier: Pro
date_captured: 2026-07-06
last_updated: 2026-07-09
tags: [health-age, longevity, flagship, ai-scoring, trust-sensitive]
---

# Health Age

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 5 (Health), Slice 3. The concept and its role in the product are clear; the scoring model is not — that gap survives the promotion and is now the critical path.

## Category

[[Health Features]]

## Priority

**Critical.** Founder-named flagship metric for Vita's longevity direction — the single number meant to make "transformation over tracking" concrete and shareable.

## Estimated Difficulty

**Very High.** Not an engineering problem so much as a credibility problem: the difficulty is in defining a scoring model that is scientifically defensible, not in the code that computes it.

## Recommended Tier

**Pro.** Behavior-based (no lab data required — see [[Biomarker Age]] for the lab-gated deeper version), so it doesn't require Elite-tier data ingestion. A strong, achievable hook for the first paid tier. *Recommendation only — no pricing tiers are decided; see [[Business Model & Pricing]].*

## Problem

Users track a dozen disconnected numbers — weight, calories, water, workouts — with no single answer to "is this all working?" Health apps report activity; they rarely report *trajectory*. Without one legible signal, users can't feel whether today's decisions are actually adding up, which is exactly the motivation gap the [[Mission & Vision|mission]] exists to close.

## Solution

A single, understandable score estimating how "old" a user's health behaviors suggest they are, relative to their actual age — younger score = behaviors compounding in their favor. Computed from consistent, already-collected behavioral inputs: weight trend, nutrition consistency ([[Fuel]]), hydration ([[Water]]), activity, and habit adherence ([[Journey Stages]]). Moves with the user week to week, so it's a trend to manage, not a one-time verdict.

## User Experience

A user opens [[Dashboard]] and sees their Health Age alongside their real age — e.g., "You're 34. Your Health Age is 31." Tapping it opens a breakdown: which behaviors are pulling the number down (good) or up, phrased by Atlas in its coaching voice ("your consistency this month moved your Health Age down two years") rather than as a raw dashboard. The number updates gradually — never a jarring swing from one bad day — reinforcing that this is about pattern, not perfection.

## Why Users Would Love It

It turns abstract effort into a concrete, personal, shareable number — "I lowered my Health Age" is a genuinely motivating sentence in a way "I hit my calorie goal" isn't. It answers the question every health app dodges: *is this working?*

## Business Value

The clearest premium hook in the current idea backlog — differentiated from every calorie tracker and most wearables ([[Competitive Landscape]]). High retention potential (a trending number invites daily checking) and strong word-of-mouth/shareability for [[Growth Ideas]]. Directly expresses the product's positioning as a longevity platform, not a tracker.

## Dependencies

- Live behavioral data across Fuel, Water, Journey, and habits (Sprints 1–5) — cannot launch on mock data
- **A defined, defensible scoring model** — the actual blocker. Needs founder + scientific grounding before any design work; see [[Atlas Capabilities]] "Health Age Logic" for the AI/coaching layer built on top of it
- Trust review: an invented-feeling number would damage trust more than shipping no number at all ([[Core Principles]] #5)

## Future Enhancements

- Atlas proactively narrates Health Age changes as coaching moments ([[Coaching Strategy]])
- Feeds into [[Longevity Dashboard]] alongside [[Biomarker Age]]
- Historical Health Age timeline as its own transformation visual, alongside [[My Journey]] weight charts

## Related Ideas

[[Biomarker Age]] · [[Longevity Dashboard]] · [[Advanced Coaching (Proactive Check-Ins)]]

## Tags

#health-age #longevity #flagship #dashboard #trust-sensitive #post-v1

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟡 Needs Refinement — roadmapped, but the scoring model itself is still undefined.

**Next Step Required:** Define a scientifically defensible scoring model, with founder + credibility review, before design work starts.

**Estimated Sprint:** Sprint 5 — Health, Slice 3

**Dependencies:**
- Scoring model definition (the real blocker)
- Live behavioral data across Fuel, Water, Journey
- Trust/credibility review

**Confidence:** 6.5 / 10 — highest priority in the Lab, but confidence is capped by the same undefined-model risk called out above.

---

**Related:** [[Innovation Lab]] · [[Future Features]] · [[Atlas Capabilities]]
