# Design Bible

**What is this?** The single page that holds Vita's design direction — the approved target aesthetic, the currently implemented interim system, and the gap between them.

**Why does it exist?** The repo's `docs/05-Design-System.md` is explicitly a placeholder ("not yet authored"). Until the full Design System is written and approved, this page keeps everyone honest about what is decided, what is implemented, and what is still open.

---

## The target direction (founder decision, 2026-07-06; theme model updated 2026-07-09)

**Premium. Modern. Minimal.** The quality bar is **Apple, Oura, WHOOP** — not fitness apps.

- **VITA supports both Light Mode and Dark Mode** as first-class experiences — not a dark-only product with light as an afterthought, and not a light product gaining dark mode later. Built on **reusable semantic design tokens** (e.g. `background`, `surface`, `textPrimary`, `textSecondary`, `hairline`, domain colors) with a light and dark value each, rather than screens referencing hardcoded hex values. This is [[Open Questions|Open Questions #1–2]], resolved by the founders 2026-07-09 — see [[Decision Log]].
- Materials/mood: **graphite, glass, concrete** — with **khaki, gray, and tan accents** — the premium aesthetic target, expressed consistently across both themes.
- **Glass surfaces** (translucency, depth, layering) as a core visual system, theme-aware.
- **Premium motion**, soft shadows, generous premium spacing.
- Navigation: the **floating, Instagram-inspired dock** ([[Navigation & Floating Dock]]).

**Explicitly avoid:** generic fitness aesthetics · gaming aesthetics · the previous space theme.

> **Status: theme model decided, not yet implemented.** `src/theme/tokens.ts` currently ships a single flat light palette with hardcoded values — no semantic token pairs, no dark palette, no theme switcher yet. Building that architecture is Design System / Sprint 1 work. What follows below is what's actually implemented today.

## The implemented interim system (verified in repo)

The founder-approved **VITA UI reference image (July 2026)** is the interim visual authority; its extracted tokens live in `src/theme/tokens.ts`:

- **Warm light theme (only theme shipped today):** background `#F6F5F2`, white cards (radius 20) with soft Apple-style diffuse shadows, track gray `#EFEDE9`. No dark equivalent exists in code yet.
- **Brand palette** (branding surfaces only): ink `#1C1F1A` · sage `#7C846B` · cream `#E6DFD2` · paper `#F7F5F1` · gold `#D4B27A` — [[Brand Identity & Icons]]
- **Permanent domain color hierarchy** (survives any retheme — founder decision, Sprint 0.1): orange = Fuel · blue = Water · purple = Atlas/peptides · green = Journey · neutrals = structure — [[Color System]]
- Type scale, spacing, radii — [[Typography]], [[Spacing & Layout]]
- Motion baseline — [[Motion & Animation]]
- 15 UI primitives — [[Component Library]]

## The gap — and how it resolves

**Resolved 2026-07-09:** the theme model is decided — both Light and Dark, semantic tokens, not hardcoded colors ([[Open Questions]] #1–2, see [[Decision Log]]). What's still open is the *implementation*: authoring the real Design System (`docs/05-Design-System.md`), which will define the actual semantic token set with light/dark values, component states, the dock and app shell, iconography, motion/haptics, and accessibility standards. Also still open: how the brand palette (ink/sage/cream/paper/gold) and the domain color hierarchy map onto both themes — a token-authoring detail, not a further founder decision.

Until the Design System is authored, the standing rule from the repo still applies: **do not invent visual styling** — new UI uses existing tokens and primitives only, and any new Sprint 1 UI work should be built against semantic token names (even if both themes' values aren't finalized yet) rather than hardcoded hex values, so the eventual dark palette is a value swap, not a rewrite.

## Design principles (stable regardless of theme)

From the [[Product Philosophy]] and [[Core Principles]]:

- Clean · Premium · Modern · Calm · Confident · Simple
- Every screen should **reduce stress, not create it**
- Premium over flashy; timeless over trendy
- Quality is a feature — polish and accessibility are not optional

**Related:** [[Color System]] · [[Typography]] · [[Component Library]] · [[UX Principles]] · [[Open Questions]]
