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

## Principles for when that work begins

- Motion confirms, never decorates. If removing an animation loses no meaning, remove it.
- Respect reduced-motion accessibility settings.
- One motion vocabulary app-wide — durations and easings become tokens, like colors.

## Dependencies / open questions

- Animation driver (Reanimated vs. core `Animated`) is an undecided per-slice choice — **Needs Verification**, now relevant as early as Sprint 1's Dashboard Polish slice rather than a distant Sprint 8.
- Haptics vocabulary (when does Vita buzz?) — founder taste decision.

**Related:** [[Design Bible]] · [[Component Library]] · [[UX Principles]]
