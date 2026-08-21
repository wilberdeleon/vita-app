---
status: 📝 Defined
category: Nutrition Features
priority: Medium
difficulty: Medium
tier: Free
date_captured: 2026-08-18
last_updated: 2026-08-18
tags: [fuel, nutrition, visual-design, illustration, delight, provider-independence]
---

# Contextual Food Visuals

## Status

🏗 In Development — scoped in by the founders on 2026-08-21 and **partly built**. The resolution *architecture* now ships: a shared three-tier resolver (real provider image → VITA category visual → generic) with 24 categories, used by every food surface through one component (repo `src/features/fuel/foodVisual.ts`, `FoodAvatar`).

**First artwork tranche shipped 2026-08-21.** The stock-glyph approach was tried and failed on device — an icon font's only general food glyph is a burger and a drink, so every unclassified food was drawn as a burger and every banana as an apple. Replaced with **14 hand-drawn VITA vector shapes** (banana, apple, egg, burger, pizza, taco, burrito, chips, bottle, coffee, drumstick, bread, bowl, and a fork-and-knife generic), rendered through the existing SVG dependency — no new package, no raster assets.

**Still open, and why this is not released:** the set covers the high-value categories, not the taxonomy. Fries, desserts, shakes, and snack bars deliberately fall back to the generic rather than borrow a neighbouring food's picture, and the founders' fuller ambition — a genuinely distinctive VITA illustration language rather than clean functional line art — is untouched. Adding a drawing is now a one-file change with no caller impact, which is the point of stopping here.

## Category

[[Nutrition Features]]

## Priority

Medium — this is delight and recognition, not capability. It makes [[Fuel]] feel like a premium product rather than a form; it does not make logging possible where it wasn't.

## Estimated Difficulty

Medium. The rendering is trivial. The hard parts are the **asset strategy** (where does the art come from, who maintains it) and **classification** (mapping arbitrary provider foods to a visual category reliably enough that the wrong picture is rare).

## Recommended Tier

Free — a core part of how Fuel should feel, not a paywalled flourish.

## Problem

Food logging in Fuel is currently all type: a name, some numbers, a row. Every food looks like every other food, so a log is scanned by reading rather than recognized at a glance — and the screens read as a functional prototype rather than a refined health product ([[Design Bible]] → Density and restraint).

The obvious fix — product photography — is worse. Large food photos would dominate the interface, fight the calm premium register, and break the moment a provider has no image for a food. And that moment is common: USDA, Open Food Facts, restaurant providers, and user-created custom foods all have wildly inconsistent image coverage. A custom food has none by definition.

## Solution

A system of **small contextual food visuals**: a burger shows a small burger, a taco a taco, a Chipotle-style order a bowl, a muffin a muffin, oatmeal a bowl of oatmeal, an apple an apple, coffee a cup, a protein shake a bottle.

**Small · delightful · tasteful · premium · useful for quick recognition.** Explicitly *not* giant food photos dominating the interface.

Resolution is layered so nothing ever looks broken:

| Case | What renders |
|---|---|
| Real product image available, and it genuinely improves the experience | The product image |
| No image available | The VITA contextual illustration for the food's category |
| Category unknown | A clean generic food fallback |

Implementation options to evaluate when scoped — none chosen:

- A curated food-category icon/illustration library
- Lightweight commissioned vector assets
- Small animated illustrations (restrained — see [[Motion & Animation]])
- Provider product images where appropriate, with category art as fallback

## User Experience

A user opens Food Log after a normal day and sees their meals at a glance — a small bowl next to the oatmeal, a cup next to the coffee, a burger next to lunch. Nothing is louder than the food name or the numbers; the visuals sit at the scale of an icon, not a photo. Search results and Food Detail gain the same quiet recognition cue.

When a food has no image and no obvious category — a niche branded product, a custom entry called "Sunday leftovers" — a neutral generic glyph appears. The user never sees a broken image, a grey placeholder box, or an obviously wrong illustration for something recognizable.

## Why Users Would Love It

Recognition is faster than reading. A visual log is scannable in a second, feels alive rather than clerical, and makes a day of eating something you *see* rather than something you audit — which is the difference between a tracker and a companion ([[Product Philosophy]]).

## Business Value

Perceived quality. This is one of the cheapest available moves toward the Apple/Oura/WHOOP register the founders have set as the bar, and it differentiates Fuel's daily surface from every macro-counting app that renders identical text rows. Also a retention lever: a log people enjoy looking at is a log people keep.

## Dependencies

- **A food visual classification layer.** Provider data does not reliably expose a usable *visual* category — provider taxonomies are commercial and nutritional, not pictorial. Likely shape: `Food → Category → VITA illustration`, with a candidate vocabulary of fruit · vegetable · burger · sandwich · bowl · taco · pizza · breakfast · oatmeal · bakery · drink · coffee · dairy · protein · snack · dessert. **Do not over-engineer this yet.** Recorded in repo `docs/09-Technical-Documentation.md`.
- **Classification belongs to the normalized model, not the provider adapters.** `VitaFood` is already provider-independent; a visual category is a property of the normalized food, derived once, rather than something each adapter invents differently.
- **The provider layer** (Sprint 2, slice 2.6) must exist first — this idea is defined partly by *not* depending on it.
- **An asset decision** — [[Open Questions]] #18.
- Licensing applies to imagery too: provider image terms must be verified before any product image is cached or persisted, exactly as for nutrition data ([[Decision Log]], 2026-08-17 provider row).

## Future Enhancements

- Small motion on a successful log — the founders' example of a restrained micro-interaction ([[Motion & Animation]]). Belongs to a polish slice, not to this idea's first version.
- Category art reused elsewhere: meal rows on [[Dashboard]], Atlas meal suggestions, future meal planning.
- User-chosen visual for a custom food.

## Related Ideas

[[Mobile Order Screenshot Import]] · [[AI Meal Photo Recognition]] · [[Smart Fridge Scanner]] — all three produce or consume food identity, and all three would benefit from a settled category vocabulary.

## Tags

#fuel #nutrition #visual-design #illustration #delight #provider-independence

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟡 Needs Refinement — the experience and its constraints are defined; the asset strategy and the classification approach are not.

**Next Step Required:** A founder decision on where the artwork comes from (curated library · commissioned vectors · provider images with fallback) — [[Open Questions]] #18. Everything else follows from that.

**Estimated Sprint:** Future — no sprint. Adjacent to Sprint 2's Fuel Visual Refinement slice but deliberately not inside it.

**Dependencies:**
- Asset strategy decision ([[Open Questions]] #18)
- Food category classification layer
- Provider layer (Sprint 2, slice 2.6) and provider image licensing

**Confidence:** 7 / 10 — high confidence in the value and in the layered-fallback design; the uncertainty is entirely in classification accuracy and the ongoing cost of maintaining an illustration set.

---

**Related:** [[Innovation Lab]] · [[Nutrition Features]] · [[Fuel]] · [[Design Bible]]
