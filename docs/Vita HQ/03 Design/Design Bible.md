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

### Density and restraint (founder direction, 2026-08-18)

The quality bar has not moved — Apple / Oura / WHOOP, as above. What the founders added is a specific critique of how VITA currently *spends* space, prompted by [[Fuel]]:

> Too basic · too bulky · overusing large numbers · filling space simply because space exists.

Calorie and nutrition values are the named example: they grow disproportionately large and dominate whole screens. The corrective principle:

> **Size communicates importance, not availability.** A number is large because it is the one thing the screen is about — never because the card had room left over.

What this asks for across the product: refined density · better hierarchy · more intentional visual storytelling · less bulky presentation · more personality · more interactive health tracking. This is not a licence to copy Oura or WHOOP — it is a standard of intentionality, applied through VITA's own system.

First application: the **Fuel Visual Refinement** slice late in Sprint 2 ([[Roadmap]]). *Direction, not approved specification — recorded ahead of the work.*

> **Status: theme model decided ✅ and implemented app-wide ✅.** Sprint 1 built the architecture (`ThemeProvider`, `useTheme()`, light/dark surface pairs, the Settings → Appearance picker) for Home; the visual consistency pass (2026-08-16) extended it to every remaining screen. Light, Dark, and System all work across the whole app, System following the device appearance live.

## The implemented system (verified in repo)

**The Home/Dashboard screen is the current visual source of truth** — founder-approved and stable. Every other screen follows its design language: premium, modern, minimal, clean, strong hierarchy, theme-aware surfaces, rounded cards, subtle borders, controlled accents, cohesive typography, consistent section headers and navigation styling. Feature screens keep their own layouts and content — **shared DNA, not a shared layout.** Full guidance in the repo's `docs/05-Design-System.md`.

- **Both themes shipped:** light background `#F8F6F2` with white cards; dark background `#000000` with `#1A1B1D` cards. Cards radius 20 with a hairline border in both themes plus a soft light-mode shadow. Exact token pairs in [[Color System]].
- **Brand palette** (branding surfaces only): ink `#1C1F1A` · sage `#7C846B` · cream `#E6DFD2` · paper `#F7F5F1` · gold `#D4B27A` — [[Brand Identity & Icons]]
- **Permanent domain color hierarchy** (survives any retheme — founder decision, Sprint 0.1): orange = Fuel · blue = Water · purple = Atlas/peptides · green = Journey · neutrals = structure — [[Color System]]
- Type scale, spacing, radii — [[Typography]], [[Spacing & Layout]]
- Motion baseline — [[Motion & Animation]]
- 15 UI primitives — [[Component Library]]

## The gap — and how it resolves

**Resolved 2026-07-09** (model) **and 2026-08-16** (implementation): both Light and Dark via semantic tokens, now live across every screen ([[Open Questions]] #1–2, see [[Decision Log]]).

**Still open, and now scheduled:** authoring the full Design System doc (`docs/05-Design-System.md` remains a working document rather than the finished article) — component states, iconography, motion/haptics, and accessibility standards. **Slice 5.1 — VITA Design Language, inside [[Roadmap|Sprint 5 — VITA Identity & Interaction]], is the slice that authors the missing parts.** It is a serious foundational slice, not a token pass: it must answer when VITA uses a card, when content sits directly on the background, what module sizes exist, how feature colors are used, what a primary action is, how bottom sheets and completed states behave, how progressive disclosure works, how VITA uses motion and haptics, what visual objects represent each feature, and what a VITA interaction should feel like. **Draft, not authorized** — see repo `docs/Sprint-5-Identity-Brief.md`.

**Home's status.** Home/Dashboard remains the visual source of truth until Sprint 5 replaces the language it embodies — and slice 5.2 redesigns Home itself, so the reference and the redesign are the same surface. Until 5.1 and 5.2 are founder-approved, everything on this page stands unchanged. Also still open: how the brand palette (ink/sage/cream/paper/gold) maps formally onto both themes — a token-authoring detail, not a further founder decision.

The standing rule still applies: **do not invent visual styling** — new UI uses existing tokens and primitives only, resolving surfaces through `useTheme().surfaces` rather than hardcoded hex or light-only `palette` values.

## Design principles (stable regardless of theme)

From the [[Product Philosophy]] and [[Core Principles]]:

- Clean · Premium · Modern · Calm · Confident · Simple
- Every screen should **reduce stress, not create it**
- Premium over flashy; timeless over trendy
- Quality is a feature — polish and accessibility are not optional

**Related:** [[Color System]] · [[Typography]] · [[Component Library]] · [[UX Principles]] · [[Open Questions]]
