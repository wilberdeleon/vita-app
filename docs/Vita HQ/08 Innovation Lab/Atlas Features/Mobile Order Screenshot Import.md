---
status: 📋 Planned
category: Atlas Features
priority: High
difficulty: Very High
tier: Atlas
date_captured: 2026-07-09
last_updated: 2026-07-09
tags: [atlas, fuel, nutrition, image-understanding, ocr, screenshot-import, premium, trust-sensitive, post-v1]
---

# Mobile Order Screenshot Import

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 3 (Fuel), Slice 7, under the name **"Screenshot Food Analysis."**

## Category

[[Atlas Features]] — this is explicitly framed as an Atlas action (Atlas analyzes, identifies, and drafts), not raw app infrastructure, so it follows the category rule: "if the idea is 'the coach does X,' it belongs in Atlas Features." Heavily cross-referenced from [[Nutrition Features]] and [[AI Features]] since it sits right at their intersection.

## Priority

High. Restaurant and delivery meals are among the most common — and most frequently *skipped or logged wrong* — entries in any nutrition app, because manually reconstructing an order is tedious. Closing that gap materially improves data completeness for everything downstream, including [[Health Age]].

## Estimated Difficulty

Very High. Three hard problems stack on top of each other: (1) reliably parsing screenshots from many different, unstyled app UIs (McDonald's, Wendy's, Chick-fil-A, Subway, Chipotle, In-N-Out, DoorDash, Uber Eats — each with its own layout, and layouts change over time), (2) matching detected item names and modifiers ("no pickles," "large," "extra bacon") to official nutrition data, and (3) doing both accurately enough that the draft is actually a time-saver rather than something the user has to fact-check line by line.

## Recommended Tier

**Atlas** — the founders described this as an "Atlas Premium" feature; mapped here to the existing **Atlas** tier vocabulary (the tier that unlocks the coach generally), consistent with [[Meal Planning]] and [[Advanced Coaching (Proactive Check-Ins)]]. If "Atlas Premium" is meant to name a distinct tier above Atlas, that's a naming question for [[Business Model & Pricing]], which already flags this vocabulary as unconfirmed. *Recommendation only — no pricing/tiers are decided.*

## Problem

Logging a restaurant or delivery order is the highest-friction, most error-prone moment in [[Fuel]]'s current flow: a user has to remember exactly what they ordered, search for each item individually, and guess at modifiers and portion sizes — a multi-step reconstruction task, not a quick log. In practice this is exactly the kind of meal that gets logged inaccurately or skipped entirely, which quietly erodes both the user's own [[Journey Stages|consistency]] and the accuracy of everything Vita computes from logged data.

## Solution

The user uploads a screenshot of a mobile order confirmation (McDonald's, Wendy's, Chick-fil-A, Subway, Chipotle, In-N-Out, DoorDash, Uber Eats, etc.). Atlas analyzes the image, identifies the restaurant, detects every menu item and modifier, looks up official nutrition information, calculates calories and macros, and generates a **draft** meal.

**Nothing is ever logged automatically.** Atlas pre-fills the meal for review — the user can edit any item, quantity, or macro before explicitly pressing Save. This is a deliberate trust boundary, not just a UX nicety: it keeps the human as the final authority over their own data, consistent with [[Core Principles]] #5 (earn trust), and it protects against the real cost of a wrong silent log — Atlas has to be honest when it isn't sure, never confidently wrong.

## User Experience

From [[Fuel]] (or from an Atlas chat), the user taps an "Import from order" action and selects a screenshot from their camera roll. Atlas shows a brief, calm processing state — no fake enthusiasm, consistent with [[Atlas Personality]] — then returns a draft meal card: restaurant name, each detected item with its calories/macros, and a running total. Anything Atlas isn't confident about is flagged plainly rather than guessed silently (e.g., "Couldn't confirm this modifier — please check"). The user taps into any field to correct it, removes anything misread, adjusts quantities, and presses **Save** to log it — at which point it behaves exactly like a normal manual [[Fuel]] entry.

## Why Users Would Love It

It collapses the most tedious logging moment in the app into "screenshot in, review, save" — turning the meals people are most tempted to skip logging into the easiest ones to log accurately. It also reads as genuinely intelligent rather than a lookup tool, which is a real moment of "oh, this app actually gets it."

## Business Value

Directly improves data completeness at the highest-friction point in the logging flow, which strengthens every metric built on top of it ([[Health Age]] especially — see its Dependencies section on data completeness). A strong, easy-to-demo Atlas-tier upsell: it's the kind of feature that sells itself in thirty seconds. Differentiates sharply from search/barcode-only competitors ([[Competitive Landscape]]), who have no answer for "I got a #2 combo, no pickles, extra sauce."

## Dependencies

- **Vision-capable AI model access** (multimodal image understanding) — a model/provider decision not yet made; see [[Future AI]]
- **Official nutrition data source** — raises the stakes on the food-database provider decision already open on [[Fuel]], since this needs restaurant-specific menu data (including modifiers/customizations), not just a generic food database
- A new entry point in the [[Fuel]] logging flow ("Import from order") — additive, doesn't replace manual/search/barcode logging
- Live [[Fuel]] data model (Sprints 1–5 — currently mock)
- **Privacy/data-handling decision for uploaded screenshots.** Order screenshots and receipts can carry incidental personal or payment info — needs an explicit policy (process-and-discard vs. retain, and for how long) before this ships. This is a real trust question, not an implementation detail — treat with the same care as [[Peptides]]'s sensitive-data handling.

## Future Enhancements

Everything the founders named, in rough order of how naturally each extends the same underlying pipeline:

- **Email receipt import** — parsing order-confirmation emails instead of requiring a manual screenshot
- **Apple Wallet receipt import**
- **Direct DoorDash / Uber Eats integration** — API-based order retrieval instead of screenshot parsing, once/if those platforms offer one, removing the OCR step entirely for those sources
- **Restaurant PDF import** (menus, emailed receipts)
- **Saved favorite orders** — a recurring order becomes a one-tap re-log instead of a repeat screenshot
- **Learning from previous corrections** — Atlas improves its detection accuracy for a given user's common restaurants and orders based on how they've edited past drafts, so accuracy compounds with use rather than staying static

## Related Ideas

[[AI Meal Photo Recognition]] · [[Smart Fridge Scanner]] (both sibling image-understanding ideas — the three now share Atlas Vision as a common infrastructure dependency) · [[Meal Planning]] · [[Fuel]] (open food-database question) · [[Health Age]] (data completeness) · [[AI Features]] (the underlying image-understanding capability)

## Tags

#atlas #fuel #nutrition #image-understanding #ocr #screenshot-import #premium #trust-sensitive #post-v1

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟢 Concept Complete

**Next Step Required:** None — promoted to the official roadmap; awaiting Sprint 3 to begin.

**Estimated Sprint:** Sprint 3 — Fuel, Slice 7 ("Screenshot Food Analysis")

**Dependencies:**
- Atlas Vision
- Nutrition Database
- OCR Pipeline

**Confidence:** 8.5 / 10

---

**Related:** [[Innovation Lab]] · [[Atlas Features]] · [[Fuel]] · [[Atlas Capabilities]]
