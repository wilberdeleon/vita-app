---
status: 📋 Planned
category: Health Features
priority: High
difficulty: High
tier: Free
date_captured: 2026-08-18
last_updated: 2026-08-18
tags: [peptides, calculator, dose, reconstitution, safety-sensitive, units]
---

# Peptide Dose Calculator

## Status

📋 Planned — named directly in founder direction 2026-08-18 as a proposed slice of **Sprint 5 — Water & Peptides** ([[Roadmap]]). The concept is clear and the math is well-defined; what is not settled is the unit model's edge behavior and how the derivation is shown.

## Category

[[Health Features]]

## Priority

High — this is the reason a peptide tracker is *useful* rather than merely a diary. Without it, [[Peptides]] is a form that records numbers the user already had to work out themselves.

## Estimated Difficulty

High — not because the arithmetic is hard, but because it is **safety-adjacent**. A calculator that is subtly wrong about a dose is worse than no calculator, so unit handling, rounding, and transparency have to be right rather than approximately right.

## Recommended Tier

Free. Gating dose math behind a paywall would be indefensible.

## Problem

A reconstituted peptide vial hides a conversion most people do not do intuitively. A 10 mg vial reconstituted with 1 mL of bacteriostatic water yields a concentration; a syringe is marked in *units*, not milligrams. Users therefore have to convert between what the syringe shows them and what a dose is described in — every single time.

The founders' specific observation: **many users think primarily in syringe units and do not intuitively understand the conversion math.** Today they do it by hand, from memory, or from a forum post — which is exactly the kind of quiet, repeated, error-prone friction VITA exists to remove.

## Solution

Given a saved setup — **vial amount + reconstitution volume** — the calculator works in **both directions**:

- Enter **syringe units** → show the calculated **mg / mcg** dose.
- Enter a **mg / mcg** dose → show the equivalent **syringe units**.

Non-negotiable implementation requirements, carried from the founder direction:

- **Normalize units internally.** mg · mcg · mL · syringe units, as typed values. **Never free-form strings for anything feeding a calculation.** Other units only if genuinely needed.
- **Verified math with tests** — including rounding behavior and the round-trip property (units → dose → units). This is the first place in VITA where the deliberately-deferred testing-framework decision actually has to be made (repo `docs/09-Technical-Documentation.md`).
- **Show the derivation, not just the answer.** A number the user cannot sanity-check is not trustworthy, and trust is [[Core Principles]] #5.
- **Log entries snapshot the administered dose.** Later edits to a vial setup must never silently rewrite history — the same principle [[Fuel]] established with `FoodEntry.nutrition`.

## User Experience

The user saves their setup once — peptide, vial strength, reconstitution volume — as part of their **User Peptide Setup** ([[Peptides]]). From then on, logging is: open Peptides → the active peptide is already there with its setup → type the syringe units they actually drew → the mg/mcg equivalent appears immediately alongside, with the concentration it was derived from visible → select site → log.

If they think in milligrams instead, they type the milligrams and the unit mark appears. The field they did not type is always the derived one, and it is always labelled as derived.

## Why Users Would Love It

It removes a recurring moment of doubt from something people are already nervous about doing correctly. It also means their history is finally comparable — every entry carries both representations, so a log is meaningful whether they think in units or in milligrams.

## Business Value

This is the feature that makes VITA credible to GLP-1 users and peptide trackers — a user group the Product Bible names explicitly and that no mainstream health app serves well. Serving them properly signals that VITA meets people where their health journey actually is. It is also a strong retention hook: a saved, correct setup is not something a user re-creates elsewhere casually.

## Dependencies

- **User Peptide Setup must exist first** — vial strength and reconstitution volume are the calculator's inputs. That is the preceding Sprint 5 slice (Peptide Data Foundation).
- **A typed unit model** shared across setup, calculator, and log entry.
- **A testing framework decision** — see above.
- **The medical/legal boundary** ([[Open Questions]] #17): the calculator performs arithmetic on user-supplied numbers and must not drift into recommending a dose. Presenting a conversion is not the same as advising a dose, and the copy must keep that line visible.

## Future Enhancements

- Remaining-vial tracking — doses drawn against vial volume, so the user knows when a vial runs out.
- Warning when an entered value is wildly outside the vial's possible range (an arithmetic sanity check, **not** a clinical judgment).
- Unit-preference default carried from [[Settings]] (Sprint 7).

## Related Ideas

[[Injection Site Tracking]] — the other half of making a peptide log genuinely interactive; both are proposed Sprint 5 slices.

## Tags

#peptides #calculator #dose #reconstitution #safety-sensitive #units

## Implementation Readiness

*Portfolio-review snapshot — distinct from Status above (lifecycle stage). This tracks how close the idea is to a buildable sprint.*

**Current Status:** 🟡 Needs Refinement — the behavior is fully specified; the unit model's edge cases (rounding, syringe types, precision displayed) and how the derivation is surfaced still need design.

**Next Step Required:** Define the typed unit model and the rounding/precision rules, with the test cases written alongside them — at Sprint 5 planning, not before.

**Estimated Sprint:** Sprint 5 — Water & Peptides (proposed slice 4).

**Dependencies:**
- User Peptide Setup (preceding Sprint 5 slice)
- Testing framework decision
- Medical/legal boundary — [[Open Questions]] #17

**Confidence:** 8 / 10 — high confidence in the value and in the math being tractable; the point deducted is for the safety burden, which raises the cost of being *nearly* right to unacceptable.

---

**Related:** [[Innovation Lab]] · [[Health Features]] · [[Peptides]] · [[Roadmap]]
