---
status: 📋 Planned
category: Widgets
priority: High
difficulty: High
tier: Mixed — Free / Atlas
date_captured: 2026-07-09
last_updated: 2026-07-09
tags: [widgets, ios, widgetkit, home-screen, atlas, engagement, premium, free-tier, post-v1]
---

# Apple Home Screen Widgets

## Status

📋 Planned — promoted 2026-07-09. Named directly in the official [[Roadmap]] as Sprint 6 (Premium), Slice 1 ("Widgets"). Live Activities (this idea's own future enhancement) was additionally pulled forward into its own Slice 2, ahead of this idea's other future enhancements.

## Category

[[Widgets]] — this is the category's founding idea, activating a category that's existed since the Lab's creation with none logged yet. Cross-referenced from [[Atlas Features]] since 2 of the 12 proposed widgets are Atlas-powered.

## Priority

High. Widgets are Vita's only realistic path to a presence outside the app itself — genuinely high-leverage for both engagement (ambient, no-open-required visibility) and premium brand signaling (a beautifully designed widget suite sits directly next to Apple's own apps on the home screen, exactly the [[Design Bible|Apple/Oura/WHOOP quality bar]] the founders are targeting). Unlike most of the Lab's High-priority ideas, most of this one's scope doesn't depend on an unsolved AI problem — see Estimated Difficulty.

## Estimated Difficulty

High overall, but difficulty varies sharply by widget. The 10 non-Atlas widgets (Journey Progress, Weight Progress, Nutrition Progress, Protein Goal, Water Tracking, Daily Focus, Step Count, Calories Remaining, Workout Reminder, Quick Actions) are well-understood native iOS platform work — displaying already-logged data via WidgetKit, no AI/ML risk. The 2 Atlas-powered widgets (Atlas Coaching Widget, Meal Suggestion Widget) are considerably harder: they need real Atlas coaching logic *and* have to work within a real platform constraint — see Dependencies. Treat this as two difficulty tiers within one idea, not one uniform Very High rating.

## Recommended Tier

**Mixed — Free and Atlas, by design.** The founders were explicit: most widgets (Journey Progress, Weight Progress, Nutrition Progress, Protein Goal, Water Tracking, Daily Focus, Step Count, Calories Remaining, Workout Reminder, Quick Actions) are **Free**; the Atlas-powered widgets (Atlas Coaching Widget, Meal Suggestion Widget) are **Atlas**-tier. This is the first idea in the Lab proposing a literal split within one feature rather than one tier for the whole idea — noted on [[Business Model & Pricing]] as a useful data point for however the real tier system gets designed. *Recommendation only — no pricing/tiers are decided.*

## Problem

Vita currently has zero presence outside the app itself. Every check-in — water progress, calories remaining, today's Journey Stage — requires a full app open, which is real friction for exactly the kind of small, consistent decision-making the [[Mission & Vision|mission]] is built around. It's also a missed premium-design opportunity: competitors like Oura achieve ambient, glanceable presence (via hardware); Vita has no equivalent today, on a surface (the home screen) that's highly visible and often screenshotted for App Store marketing.

## Solution

A suite of native iOS Home Screen widgets, with Atlas-powered widgets that dynamically change throughout the day based on the user's progress, habits, remaining goals, and time of day rather than showing static numbers.

**Potential widgets:**
- Journey Progress
- Weight Progress
- Nutrition Progress
- Protein Goal
- Water Tracking
- Daily Focus
- Step Count
- Calories Remaining
- Workout Reminder
- **Atlas Coaching Widget** *(Atlas-powered)*
- **Meal Suggestion Widget** *(Atlas-powered)*
- Quick Actions Widget

## User Experience

The user adds a Vita widget from the standard iOS widget gallery, in whatever size the widget supports, and pins it to their home screen. A data widget (e.g., Calories Remaining) updates as the day's logging happens. The Atlas Coaching Widget shifts its message across the day — a morning nudge toward water or a light protein-forward breakfast, an afternoon note on calories remaining before dinner, an evening wrap-up on the day's consistency — always in [[Atlas Personality]]'s calm, direct register. Even a single line of widget text has to sound like Atlas, not generic app copy; this is a small surface with no room for the wrong tone.

## Why Users Would Love It

Ambient awareness without opening the app — Vita becomes quietly present in daily life the way a premium companion should, achieved through design rather than hardware. Free users get real utility on day one; Atlas subscribers get a coach that shows up on their home screen, not just inside a chat.

## Business Value

Free widgets are a strong, low-cost acquisition and retention lever — visibility itself compounds daily engagement independent of any feature gate, and a well-designed widget suite is close to guaranteed App Store screenshot material ([[Launch Plan]]). Atlas-powered widgets are a clean premium-tier upsell, consistent with the same reasoning already established for [[Meal Planning]] and [[Advanced Coaching (Proactive Check-Ins)]] — ongoing coaching computation justifies the gate; static data display doesn't.

## Dependencies

- **Live data across nearly every domain** (weight, nutrition, water, steps, workouts) — this is the [[Widgets]] category's own standing dependency note in practice: widgets are worthless on mock data, and this idea touches more feature modules at once than almost anything else in the Lab
- **WidgetKit's refresh-budget constraint (real, worth naming honestly).** iOS limits how often a widget's timeline can reload — a budgeted number of refreshes per day set by the system, not a live feed. "Dynamically changes throughout the day" has to be engineered as a pre-computed timeline of states for the day, not real-time push updates. This directly shapes how the Atlas Coaching and Meal Suggestion widgets need to be built.
- **Design System sequencing.** This is one of Vita's most externally visible surfaces — it likely shouldn't ship against today's hardcoded interim light palette only to need a redo once the [[Design Bible|Light + Dark semantic token system]] (decided 2026-07-09, not yet built) lands
- **Atlas coaching logic** (for the 2 Atlas-powered widgets only) — depends on real coaching data/logic existing in the main app first, same [[Future AI]] dependency as other Atlas Features ideas
- Apple Watch and Lock Screen are separate platform surfaces from Home Screen widgets, not automatically included by building this — see Future Enhancements

## Future Enhancements

Everything the founders named, in the order given:

- **Interactive widgets** — iOS App Intents allow direct interaction (e.g., logging a glass of water) without opening the app at all
- **Lock Screen widgets** — a distinct, smaller-format surface with its own design constraints
- **Apple Watch complications** — a separate watchOS target, not covered by iOS Home Screen widget work
- **Live Activities** — the Dynamic Island / ongoing-activity surface; a natural fit for an active workout or fast, though this depends on whether a workout-tracking module ever exists (see [[Workout Generation]]'s open product question)
- **Smart rotating widget** — a widget that chooses *which* metric to surface based on relevance, distinct from the Atlas widgets simply updating their message over time
- **Dynamic coaching** — deeper Atlas Coaching Widget intelligence, converging with [[Coaching Strategy]] and [[Advanced Coaching (Proactive Check-Ins)]]

## Related Ideas

[[Advanced Coaching (Proactive Check-Ins)]] (the Atlas Coaching Widget and Dynamic coaching enhancement overlap directly with its proactive-nudge philosophy — likely shares timing/logic) · [[Meal Planning]] (Meal Suggestion Widget overlaps) · [[Mobile Order Screenshot Import]] · [[AI Meal Photo Recognition]] · [[Smart Fridge Scanner]] (siblings in the sense that Atlas-powered surfaces are becoming a real pattern across the Lab)

## Tags

#widgets #ios #widgetkit #home-screen #atlas #engagement #premium #free-tier #post-v1

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟢 Concept Complete

**Next Step Required:** None — promoted to the official roadmap; awaiting Sprint 6 to begin.

**Estimated Sprint:** Sprint 6 — Premium, Slice 1 ("Widgets"); Live Activities specifically is Slice 2 of the same sprint.

**Dependencies:**
- Live data (all domains)
- WidgetKit refresh-budget constraints
- Atlas coaching logic (2 of 12 widgets only)

**Confidence:** 8 / 10 — higher than the vision ideas because there's no open scientific/accuracy-ceiling problem here; the risk is almost entirely sequencing (waiting on live data and the Design System), not feasibility.

---

**Related:** [[Innovation Lab]] · [[Widgets]] · [[Dashboard]] · [[Atlas Features]]
