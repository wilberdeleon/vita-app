# Motion & Animation

**What is this?** Vita's motion language — what moves, how, and why.

**Why does it exist?** Premium motion is part of the founder-approved direction. Motion in Vita is felt rather than noticed: it confirms actions and adds warmth without ever performing for attention.

---

## Current baseline (verified — Sprint 0.1, Slice 0.12)

Deliberately minimal until real polish work begins:

| Element | Motion |
|---|---|
| Tab transitions | Fade (`animation: 'fade'` on the tab navigator) |
| Press feedback | Subtle spring scale via `PressableScale` (0.97–0.98) |
| Progress bars | Animate to value, 650ms ease-out cubic |

**Standing rule (repo Design System): no advanced animations until real polish work begins.** *(Previously scoped to a single terminal "Sprint 8 Polish" — the official 2026-07-09 [[Roadmap]] distributes polish into a dedicated slice at the end of every sprint instead: Dashboard Polish, Journey Polish, Fuel Polish, Atlas Polish, Health Polish, Premium Polish. No single "the Polish sprint" exists anymore.)*

## Target state

"Premium motion" under the [[Design Bible]] direction — the Apple/Oura/WHOOP register: physical, damped, unhurried. Animations, haptics, and transitions become first-class work incrementally, each sprint's own Polish slice — not one deferred terminal sprint. Haptics are entirely unimplemented today.

## Micro-interaction direction (founder direction, 2026-08-18)

The founders want subtle motion, and **restraint is the point: premium micro-interactions, not novelty animation.** VITA does not become a cartoon or a game.

Candidates named so far — none approved, none designed:

- Small food-icon movement on a successful log
- Smooth macro / progress animation
- Gentle confirmation transitions
- Water fill animation ([[Water]])
- Peptide injection-site selection feedback ([[Peptides]])
- Card state transitions
- Progress changes

**Where this work lives — revised 2026-09-01 by the identity insertion.** **Sprint 5 — VITA Identity & Interaction establishes VITA's interaction vocabulary** — what a press, a completion, a sheet, a progress change and a successful log feel like — including water fill, dose completion, press states, sheets, transitions and haptics. Slice 5.7 is that pass, and it is explicitly **not** the final launch-animation sprint. **Sprint 9 — Final Polish / Motion / Launch Experience** (renumbered and renamed from Sprint 8 — Final Polish & Animations) then performs the final app-wide pass: applying that vocabulary consistently everywhere, finishing motion, edge cases, accessibility, performance and the launch experience. **Neither replaces the other.**

Sprint 9 owns the **global** layer: the shared motion system, haptics vocabulary, transition consistency, and app-wide micro-interaction standards. It is **not a holding pen for every feature's visual debt** — feature-specific motion may ship earlier where it genuinely belongs to that feature (Fuel motion inside Sprint 2's refinement slice, for example), and Sprint 8 then reconciles everything into one vocabulary. See [[Roadmap]].

*Note: the standing-rule box above describes the 2026-07-09 roadmap's per-sprint Polish slices. The 2026-08-17 restructure reintroduced a terminal polish sprint (Sprint 8, now **Sprint 9**) — so both exist now: per-feature polish where it belongs, plus a global reconciliation pass at the end. Since 2026-09-01 there is a third layer between them: **Sprint 5 defines the vocabulary** the other two apply.*

## Principles for when that work begins

- Motion confirms, never decorates. If removing an animation loses no meaning, remove it.
- Respect reduced-motion accessibility settings.
- One motion vocabulary app-wide — durations and easings become tokens, like colors.

## Dependencies / open questions

- Animation driver (Reanimated vs. core `Animated`) is an undecided per-slice choice — **Needs Verification**, relevant well before the final polish sprint; **Sprint 5's motion work is where it most likely has to be settled.**
- Haptics vocabulary (when does Vita buzz?) — founder taste decision.

**Related:** [[Design Bible]] · [[Component Library]] · [[UX Principles]]
