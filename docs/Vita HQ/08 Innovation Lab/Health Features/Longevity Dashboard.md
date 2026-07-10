---
status: 📝 Defined
category: Health Features
priority: High
difficulty: High
tier: Elite
date_captured: 2026-07-06
last_updated: 2026-07-06
tags: [longevity, dashboard, capstone, depends-on-health-age]
---

# Longevity Dashboard

## Status

📝 Defined — depends entirely on [[Health Age]] and [[Biomarker Age]] existing first.

## Category

[[Health Features]]

## Priority

High. Potentially Vita's most differentiating single screen once its dependencies ship.

## Estimated Difficulty

High. Largely an aggregation/visualization problem once the two scores it displays already exist — the hard work happens upstream.

## Recommended Tier

Elite. The capstone screen for users who've unlocked both underlying scores. *Recommendation only — see [[Business Model & Pricing]].*

## Problem

Even with [[Health Age]] and [[Biomarker Age]] shipped separately, a user has no single place that shows how their behavioral trajectory and biological reality relate to each other over time — the "how am I actually aging" view the whole longevity direction is building toward.

## Solution

A dedicated screen bringing Health Age, Biomarker Age, and their long-term trends together — the visual home for Vita's longevity thesis, distinct from the day-to-day [[Dashboard]].

## User Experience

A user navigates from their Dashboard or Settings into a dedicated Longevity view: both age scores side by side, historical trend lines, and Atlas-authored context connecting the two ("your Biomarker Age caught up with your Health Age this quarter — your behavior changes are showing up in your bloodwork"). This is a reflective, less-frequent screen than the daily Dashboard — closer to a monthly check-in.

## Why Users Would Love It

It's the payoff screen — the place where months of small decisions become one coherent, legible story about their body. This is "transformation over tracking" made maximally literal.

## Business Value

The single screen most likely to appear in App Store marketing screenshots and press coverage — a genuine differentiator ([[Competitive Landscape]]). Strong Elite-tier retention driver since it rewards sustained, longer-term engagement rather than daily habit alone.

## Dependencies

- **Hard dependency on both [[Health Age]] and [[Biomarker Age]] shipping first** — this cannot be designed, let alone built, before them
- Historical data storage for trend lines over months ([[Supabase & Database]])

## Future Enhancements

- Exportable/shareable longevity reports (ties into [[Growth Ideas]])
- Predictive trajectory ("at this pace, in 6 months...") once the scoring models are trusted enough to extrapolate
- Integration with [[Integrations|wearable data]] for a fuller physiological picture

## Related Ideas

[[Health Age]] · [[Biomarker Age]]

## Tags

#longevity #dashboard #elite-tier #capstone #post-v1

---

**Related:** [[Innovation Lab]] · [[Future Features]] · [[Long-Term Vision]]
