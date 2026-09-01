---
status: 📋 Planned
category: Health Features
priority: Medium
difficulty: Low
tier: Free
date_captured: 2026-09-01
last_updated: 2026-09-01
tags: [tools, bmi, calculator, weight, height, reference]
---

# BMI Calculator

## Status

📋 Planned — named by the founders on 2026-09-01 as a planned Tool inside **Sprint 4 — Settings + Tools & Reference** ([[Roadmap]]). The concept is small and well understood; what is not decided is where it sits inside the Tools destination and how the result is presented without drifting into judgement.

## Category

[[Health Features]]

## Priority

Medium — it is not a reason anyone downloads VITA, but it is the kind of small, correct utility that makes a Tools destination feel worth opening. It also has an obvious future payoff once [[My Journey|Journey]] stores height and weight.

## Estimated Difficulty

Low — the arithmetic is trivial and unambiguous. The work is presentation and tone, not computation.

## Recommended Tier

Free.

## Problem

A user who wants to know their BMI leaves VITA to find it, types their height and weight into someone else's page, and gets a number with a category attached and no context. Meanwhile VITA is the app that already knows — or soon will know — both of those numbers.

## Solution

A small, self-contained calculator in **Tools**: enter a height, enter a weight, see the calculated BMI, its category/range, and a clear visual representation of where the value falls on the scale.

**VITA calculates; it does not judge.** A category is what the standard index says, not a verdict on the person. Copy and colour must stay neutral, consistent with the tone rules that govern [[Water]]'s goal and [[Peptides]]' schedules — no congratulation, no warning, no implied instruction.

## User Experience

1. Settings → Tools & Reference → BMI Calculator.
2. Enter height (unit-aware) and weight (unit-aware).
3. The BMI value appears with its category and a polished visual scale showing where it sits.
4. Nothing is saved unless a later decision says it should be — the same "nothing is persisted" posture the standalone [[Peptide Dose Calculator]] took in slice 3.6.

## Why Users Would Love It

It answers a common question in the app they are already in, in VITA's visual language, without the ad-covered detour.

## Business Value

Low direct value; real compounding value. It makes **Tools** a place worth returning to rather than a single-purpose peptide utility, which is exactly the coherence Sprint 4 exists to create.

## Dependencies

- The Sprint 4 Tools destination and its navigation.
- A unit model for height and weight consistent with whatever [[Settings]] establishes.
- **For the future integration only:** [[My Journey|Journey]] / Weight (Sprint 5), which will own stored height and latest weight.

## Future Enhancements

**Read the user's own numbers instead of asking for them.** Once Journey / Weight exists (Sprint 5), BMI could read the stored height and latest weight rather than requiring duplicate entry. **This is explicitly not built now** — Journey owns that data and does not exist yet, and building against a data model that has not been designed would constrain it.

## Related Ideas

[[Peptide Dose Calculator]] · [[Research Library]] · [[Food & Product Scanner]]

## Tags

#tools #bmi #calculator #reference #sprint4

## Implementation Readiness

**Current Status:** 🟡 Needs Refinement — the calculation and inputs are obvious; the presentation of the category, and the exact tone around it, are not yet designed.

**Next Step Required:** Decide how the category and scale are presented without reading as a verdict, and whether anything is persisted — at Sprint 4 planning, not before.

**Estimated Sprint:** Sprint 4 — Settings + Tools & Reference.

**Dependencies:**
- The Sprint 4 Tools destination
- A shared height/weight unit model
- Journey / Weight (Sprint 5) — for the future auto-fill only

**Confidence:** 8 / 10 — high confidence in the value and feasibility; the deduction is for tone, which is where a BMI feature most easily goes wrong.

---

**Related:** [[Innovation Lab]] · [[Health Features]] · [[Settings]] · [[Roadmap]]
