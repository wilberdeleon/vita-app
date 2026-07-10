---
status: 📋 Planned
category: Integrations
priority: Medium
difficulty: Medium
tier: Free
date_captured: 2026-07-06
last_updated: 2026-07-09
tags: [integration, apple-health, healthkit, data-quality]
---

# Apple Health Integration

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 5 (Health), Slice 5.

## Category

[[Integrations]]

## Priority

Medium. Also named in the repo Master Roadmap's long-term list — a shared founder and existing-doc priority.

## Estimated Difficulty

Medium. A well-trodden integration path (Apple's HealthKit) rather than novel engineering, but iOS-specific work with real permissions/UX design.

## Recommended Tier

**Free** — recommended, not decided. Reasoning: this is a data-quality and friction-reduction feature, not a premium value-add. Free sync means more, better data flowing into [[Health Age]] and other metrics for every user, which strengthens the whole product rather than gating it. See [[Business Model & Pricing]] for the undecided tier structure this assumes.

## Problem

Users already generate relevant health data elsewhere — steps, workouts, sleep, weight from a smart scale — that they'd have to re-enter manually in Vita or simply won't log at all, weakening every metric that depends on complete data (especially [[Health Age]]).

## Solution

Sync with Apple Health (HealthKit) to pull in weight, activity, and relevant metrics automatically, and optionally push Vita-logged data (water, weight) back so Apple Health stays the user's unified health record.

## User Experience

During onboarding or from [[Settings]], a user grants HealthKit permission with a clear, honest explanation of what's read and why. From then on, relevant metrics appear in Vita without manual entry — e.g., a smart-scale weigh-in shows up in [[My Journey]] automatically. The user can disconnect at any time from Settings, with a clear explanation of what stops syncing.

## Why Users Would Love It

Removes redundant data entry entirely for anything already tracked elsewhere — the single highest-leverage friction reduction available for users who already have an Apple Watch, smart scale, or other HealthKit-connected device.

## Business Value

Improves data completeness for every downstream metric ([[Health Age]] especially) at effectively zero cost to the user. A baseline-expected feature for a premium iOS health app — its *absence* would be a bigger competitive liability than its presence is a differentiator.

## Dependencies

- Native iOS work — HealthKit entitlement and permission flow (App Store review implications, see [[Launch Plan]])
- A clear data-use/privacy stance before requesting permission — trust principle applies directly ([[Core Principles]] #5)
- Android equivalent (Health Connect) is a separate, later decision — not scoped here

## Future Enhancements

- Two-way sync (Vita writes back to Apple Health)
- Wearable-specific integrations beyond HealthKit's aggregation (WHOOP, Oura direct APIs) — see repo Master Roadmap's wearables mention
- Sleep and recovery data feeding future [[Health Features|health metrics]]

## Related Ideas

[[Health Age]] · [[Biomarker Age]]

## Tags

#integration #apple-health #healthkit #free-tier #data-quality

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟢 Concept Complete

**Next Step Required:** None — promoted to the official roadmap; awaiting Sprint 5 to begin.

**Estimated Sprint:** Sprint 5 — Health, Slice 5

**Dependencies:**
- HealthKit entitlement + permission flow
- Live data model for weight/activity

**Confidence:** 8.5 / 10 — well-trodden integration path, no open scientific or scope risk.

---

**Related:** [[Innovation Lab]] · [[Future Features]] · [[Tech Stack]]
