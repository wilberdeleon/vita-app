---
status: 📋 Planned
category: Atlas Features
priority: High
difficulty: High
tier: Atlas
date_captured: 2026-07-06
last_updated: 2026-07-09
tags: [atlas, meal-planning, nutrition, ai-generated]
---

# Meal Planning

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 4 (Atlas), Slice 3.

## Category

[[Atlas Features]]

## Priority

High. First natural extension of Atlas from chat coach into active daily utility.

## Estimated Difficulty

High. Depends on a food-data foundation that doesn't exist yet ([[Fuel]] open question on data provider) plus real generation quality.

## Recommended Tier

Atlas tier (the tier that unlocks the coach generally). *Recommendation only — see [[Business Model & Pricing]].*

## Problem

Deciding what to eat, every meal, every day, is the single highest-frequency source of decision fatigue in a health journey — and the most common place consistency breaks down. Generic meal plans (the kind competitors offer) ignore what a specific user actually eats and will realistically stick to.

## Solution

Atlas generates meal plans from the user's goals, preferences, restrictions, and — critically — their actual [[Fuel]] logging history, not a generic template. Plans come with plain-language reasoning ("higher protein early in the week because your logs show weekend slippage"), optimizing for *adherence* over nutritional perfection.

## User Experience

From Fuel or via Atlas chat, a user requests a plan for the week (or lets Atlas proactively suggest one). Atlas returns a day-by-day meal outline grounded in foods the user has actually logged before, with substitution options and a one-tap "log this meal" action that flows straight into the existing [[Fuel]] logging flow — no new UI paradigm, it plugs into what exists.

## Why Users Would Love It

It removes the single most repetitive daily decision in the product, and unlike a generic plan, it feels like it actually knows them — because it does.

## Business Value

A concrete, dailyuse reason to open Vita beyond logging — strong retention lever. A natural Atlas-tier upsell: meal planning is valuable enough on its own to justify subscribing just for it.

## Dependencies

- Live [[Fuel]] logging history (Sprints 1–5)
- **Food database/nutrition-data provider decision** — unresolved open question on the [[Fuel]] page; blocks both logging depth and plan quality
- [[Coaching Strategy]] adherence-first framing, so plans don't drift into generic "optimal" nutrition advice that ignores real behavior

## Future Enhancements

- Grocery-list generation from a plan (crosses into [[Nutrition Features]])
- Plans that adapt mid-week when a user logs something off-plan, rather than treating deviation as failure
- Restaurant-aware planning for users who eat out often

## Related Ideas

[[Workout Generation]] · [[Advanced Coaching (Proactive Check-Ins)]] · [[Fuel]]

## Tags

#atlas #meal-planning #nutrition #ai-generated #post-v1

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟢 Concept Complete

**Next Step Required:** None — promoted to the official roadmap; awaiting Sprint 4 to begin.

**Estimated Sprint:** Sprint 4 — Atlas, Slice 3

**Dependencies:**
- Atlas coaching/chat foundation (Sprint 4, Slices 1–2)
- Food database provider decision (open on [[Fuel]])
- Live Fuel logging history

**Confidence:** 7.5 / 10

---

**Related:** [[Innovation Lab]] · [[Atlas Capabilities]] · [[Coaching Strategy]]
