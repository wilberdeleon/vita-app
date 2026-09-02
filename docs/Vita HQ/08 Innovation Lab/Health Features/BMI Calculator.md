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

📋 Planned — named by the founders on 2026-09-01 as a planned Tool inside Sprint 4 (then titled *Settings + Tools & Reference*, [[Roadmap]]).

**⏸️ Deferred at the Sprint 4 closeout, 2026-09-01 — deferred, not cancelled.** Sprint 4 closed as **Settings + Tools Foundation** after its two foundation slices, and this remains a valid product direction. The reason is sequencing, not doubt: this is presentation-heavy work, and the founders are defining a new VITA visual and interaction language next. Building it now would mean designing it twice. It resumes once that language exists — and lands into the `/tools` architecture slice 4.2 already established, where a new tool is a row and a route rather than a question about where it belongs.

**Carried into Sprint 5 — VITA Identity & Interaction by the roadmap alignment of 2026-09-01. Still planned. Explicitly not cancelled — the founders want it.** It may land in draft slice 5.6 (Tools Integration) or in a dedicated adjacent slice after the design language is approved; that is a Sprint 5 architecture-audit decision and no slice number is assigned yet.

**No implementation details are assigned beyond that.** The presentation questions this note already raises — how the category and scale read without becoming a verdict — are exactly the ones the new visual language should answer first.

Original note follows. The concept is small and well understood; what is not decided is where it sits inside the Tools destination and how the result is presented without drifting into judgement.

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

- The Tools destination and its navigation — **built in Sprint 4 slice 4.2 and now a dependency that is met.**
- A unit model for height and weight consistent with whatever [[Settings]] establishes.
- **For the future integration only:** [[My Journey|Journey]] / Weight (**Sprint 6** since the 2026-09-01 identity insertion), which will own stored height and latest weight.

## Future Enhancements

**Read the user's own numbers instead of asking for them.** Once Journey / Weight exists (**Sprint 6**), BMI could read the stored height and latest weight rather than requiring duplicate entry. **This is explicitly not built now** — Journey owns that data and does not exist yet, and building against a data model that has not been designed would constrain it.

## Related Ideas

[[Peptide Dose Calculator]] · [[Research Library]] · [[Food & Product Scanner]]

## Tags

#tools #bmi #calculator #reference #sprint4

## Implementation Readiness

**Current Status:** 🟡 Needs Refinement — the calculation and inputs are obvious; the presentation of the category, and the exact tone around it, are not yet designed.

**Next Step Required:** Decide how the category and scale are presented without reading as a verdict, and whether anything is persisted — **once the Sprint 5 design language exists**, not before. That language is precisely what should answer it.

**Estimated Sprint:** **Sprint 5 — VITA Identity & Interaction** — Tools Integration, or a dedicated adjacent slice, after the design language is approved. *(Was Sprint 4 — Settings + Tools & Reference; deferred at that sprint's closeout.)*

**Dependencies:**
- The Tools destination (met — Sprint 4 slice 4.2)
- The Sprint 5 design language
- A shared height/weight unit model
- Journey / Weight (Sprint 6) — for the future auto-fill only

**Confidence:** 8 / 10 — high confidence in the value and feasibility; the deduction is for tone, which is where a BMI feature most easily goes wrong.

---

**Related:** [[Innovation Lab]] · [[Health Features]] · [[Settings]] · [[Roadmap]]
