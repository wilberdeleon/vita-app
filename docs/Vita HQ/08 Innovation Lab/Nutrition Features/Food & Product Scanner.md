---
status: 📋 Planned
category: Nutrition Features
priority: High
difficulty: Very High
tier: Free
date_captured: 2026-09-01
last_updated: 2026-09-01
tags: [tools, scanner, barcode, food-score, nutrition, ingredients, sprint4]
---

# Food & Product Scanner

## Status

📋 Planned — named by the founders on 2026-09-01 as a **candidate** Tool for Sprint 4 (then titled *Settings + Tools & Reference*, [[Roadmap]]). **Not a guaranteed inclusion and not a trivial feature.**

**⏸️ Deferred at the Sprint 4 closeout, 2026-09-01 — deferred, not cancelled.** Sprint 4 closed as **Settings + Tools Foundation** after its two foundation slices, and this remains a valid product direction. The reason is sequencing, not doubt: this is presentation-heavy work, and the founders are defining a new VITA visual and interaction language next. Building it now would mean designing it twice. It resumes once that language exists — and lands into the `/tools` architecture slice 4.2 already established, where a new tool is a row and a route rather than a question about where it belongs.

**Two things are settled and carry forward.** The **Sprint 2 barcode scanner in [[Fuel]] is untouched and still works** — scanning was never the hard part. And **no VITA Score exists or is authorised**: the scoring methodology remains unresolved, deliberately, and none may be invented. A score is a claim about a product, and VITA has no defensible basis for one yet.

Original note follows. This is likely the largest single item in the Tools set and may require its own slice or a dedicated planning pass.

## Category

[[Nutrition Features]]

## Priority

High as a concept — it is the most user-visible idea in the Sprint 4 set. Its *scheduling* priority is deliberately unsettled, because its size is not yet known.

## Estimated Difficulty

Very High — not the scanning, which VITA already does. The difficulty is **the score**: deciding what it measures, defending the methodology, and explaining a result to someone who disagrees with it.

## Recommended Tier

Free for the scan and the evaluation. Any richer analysis is a later question.

## Problem

A user standing in a supermarket holding a product cannot tell whether it is a reasonable choice. The ingredient list is technical, the nutrition panel is per-100g, and the front of the pack is marketing. Yuka proved there is real appetite for one plain answer to *"is this good?"*

## Solution

Scan a barcode or product and receive an easy-to-understand evaluation.

Potential components:

- **Barcode scanning** — VITA already ships real camera scanning from Sprint 2.
- **Ingredient and nutrition information** — pulled from the existing provider layer (Open Food Facts, USDA FoodData Central) as a starting point.
- **An understandable score or evaluation** — one clear result rather than a wall of numbers.
- **An explanation of *why*** the product received that result — the part that earns trust, and the part that is hard.
- **Potential alternatives**, later — deliberately not part of the first conception.

## User Experience

Open the scanner from Tools → point at a barcode → the product resolves → a clear evaluation appears, with the reasoning available rather than hidden. If the product is unknown, VITA says so plainly instead of inventing a score.

## Why Users Would Love It

It turns a confusing label into one honest sentence, in the app that already holds their food log.

## Business Value

High visibility, high shareability, and a genuine reason to open VITA outside a logging moment. It also strengthens [[Fuel]] by reusing the provider layer already built.

## Dependencies

- The Sprint 2 barcode scanner and provider layer (both exist).
- **A scoring methodology that VITA can defend.** This does not exist and is the real blocker.
- Provider licensing for ingredient data, at the depth a score requires — the Sprint 2 licensing constraints still apply.
- Coverage: a scanner that fails on a third of a shopper's basket reads as broken.

## Future Enhancements

Suggested alternatives · personal weighting (allergens, goals) · scanning non-food products, which is where the "product" half of the name eventually leads.

## Related Ideas

[[Contextual Food Visuals]] · [[Mobile Order Screenshot Import]] · [[BMI Calculator]] · [[Research Library]]

## Tags

#tools #scanner #barcode #food-score #nutrition #sprint4

## Implementation Readiness

**Current Status:** 🟡 Needs Refinement — the *experience* is clear and the *scoring methodology is entirely undefined*. A score is a claim about a product, and VITA does not yet have a defensible basis for one.

**Next Step Required:** A dedicated planning pass on the scoring methodology — what it measures, on what data, how it is explained, and what VITA says when it does not know. Not a slice-planning task squeezed into a broader sprint.

**Estimated Sprint:** Unscheduled. Carried past Sprint 4's closeout; **Sprint 5 — VITA Identity & Interaction is not committed to inventing a VITA Score**, and scoring methodology remains a separate founder/product decision. Sprint 5 may redesign how the *existing* scanner fits visually into VITA if and when that is authorized. The Sprint 2 barcode scanner in [[Fuel]] is untouched and still works. May well move to its own sprint.

**Dependencies:**
- A defensible scoring methodology (does not exist)
- Ingredient-data licensing at scoring depth
- Product coverage adequate for real shopping

**Confidence:** 6 / 10 — high confidence in the desire for it; low confidence that it fits inside Sprint 4 as one ordinary slice.

---

**Related:** [[Innovation Lab]] · [[Nutrition Features]] · [[Fuel]] · [[Settings]] · [[Roadmap]]
