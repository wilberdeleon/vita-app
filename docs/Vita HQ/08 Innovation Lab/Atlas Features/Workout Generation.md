---
status: 📋 Planned
category: Atlas Features
priority: Medium
difficulty: High
tier: Atlas
date_captured: 2026-07-06
last_updated: 2026-07-09
tags: [atlas, workouts, ai-generated, blocked-on-product-decision]
---

# Workout Generation

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 4 (Atlas), Slice 4, under the name **"Workout Planning."** This confirms Atlas will generate workout plans; it does **not** explicitly confirm whether a full workout-*tracking* module also ships — the product decision below remains genuinely open despite the promotion.

## Category

[[Atlas Features]]

## Priority

Medium. Lower than [[Meal Planning]] until the underlying product question is resolved.

## Estimated Difficulty

High — and the difficulty is front-loaded into a decision, not just implementation.

## Recommended Tier

Atlas tier. *Recommendation only — see [[Business Model & Pricing]].*

## Problem

Users training toward a transformation goal often want structured guidance on movement, not just nutrition — but Vita currently has no workout tracking anywhere in the product.

## Solution

Atlas-generated training plans matched to the user's level, available equipment, time budget, and goals, adapting week over week based on what actually gets completed.

## User Experience

*(Provisional — depends on the open product question below.)* A user sets a training goal via Atlas or [[Settings]]; Atlas returns a weekly plan with exercises, sets/reps, and progression logic. If a tracking module exists, completed workouts feed back into plan adaptation and into [[Journey Stages]] consistency; if it doesn't, this stays advisory-only content with no logging loop.

## Why Users Would Love It

Removes program-design expertise as a barrier to training effectively — the same "you don't have to figure this out alone" value [[Meal Planning]] offers, applied to movement.

## Business Value

Extends Atlas's utility surface area and the product's premium positioning against fitness-only apps. Value is capped, though, until the tracking-module question is answered — generation without any record of what happened is a much thinner feature.

## Dependencies

- **Open product question, founder decision required first:** does a workout-tracking module enter the product (a real addition to the core areas beyond [[Dashboard]], [[Fuel]], [[My Journey]], [[Water]], [[Peptides]], [[Atlas]], [[Settings]]), or does Vita stay nutrition/transformation-first and keep workout guidance purely advisory? This determines nearly everything else about scope.
- If a tracking module is approved: logging UI, data model ([[Supabase & Database]]), and its own [[Journey Stages]] consistency wiring

## Future Enhancements

- Video-guided form cues
- Integration with wearable workout data if a tracking module ships ([[Integrations]])

## Related Ideas

[[Meal Planning]] · [[Advanced Coaching (Proactive Check-Ins)]]

## Tags

#atlas #workouts #ai-generated #open-question #post-v1

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟡 Needs Refinement — the roadmap commits to the slice, but the underlying scope question (advisory-only vs. full tracking module) is unresolved.

**Next Step Required:** Founder decision — does a workout-tracking module enter the product, or does "Workout Planning" stay advisory-only?

**Estimated Sprint:** Sprint 4 — Atlas, Slice 4 ("Workout Planning")

**Dependencies:**
- Atlas coaching/chat foundation (Sprint 4, Slices 1–2)
- Tracking-module scope decision (see Status above)

**Confidence:** 6 / 10 — the roadmap commitment resolves *whether* this ships, not *what* it fully includes.

---

**Related:** [[Innovation Lab]] · [[Atlas Capabilities]] · [[Open Questions]]
