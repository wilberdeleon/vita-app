# VITA — Design System

Status: **Placeholder — not yet authored.**

The full Design System will be authored and approved separately before detailed UI polish begins. Until then, the **founder-approved VITA UI reference image (July 2026) is the interim visual authority**, and its extracted tokens live in `src/theme/tokens.ts`.

## Theme model (founder decision, 2026-07-09)

**VITA supports both Light Mode and Dark Mode, built on reusable semantic design tokens from the beginning — not hardcoded colors.** Tokens each carry a light value and a dark value; screens and components reference the token name, never a raw hex value.

**Implemented and app-wide.** Sprint 1 built the architecture (`ThemeProvider.tsx`, `useTheme()`, `lightSurfaces`/`darkSurfaces` in `theme/tokens.ts`, Settings → Appearance as the Light/Dark/System picker) but applied it to Home only; the visual consistency pass that followed extended it to every remaining screen. The split to respect when adding UI:

- **`useTheme().surfaces`** — `background`, `card`, `border`, `text`, `textSecondary`, `textTertiary`, `track`. Every background, text, and border color comes from here. Reading these from `palette` instead pins the component to light mode permanently, which is exactly the drift this pass removed.
- **`palette`** — theme-invariant values only: brand, domain, macro, and semantic colors. Orange is orange in both themes.
- Structural controls (`SegmentedTabs`, `Chip`) resolve their own neutral fill per theme — pass `activeColor`/`color` only for a domain flow.

### Approved implementation decisions (visual consistency pass, 2026-08-16)

Founder-approved after Expo Go review on device. Do not reverse these casually.

- **Card borders.** Cards carry a subtle hairline border in both themes. Light-mode drop shadows do essentially nothing against a near-black background, so in dark mode the border is what separates a card from the page — matching how Home's `GlassSurface` cards already read.
- **Domain soft surfaces.** Tinted backings (the Journey add-photo circle, the Atlas orb, the weight delta badge) use a low-opacity tint of their domain color — `` `${palette.journey}1A` `` — instead of the fixed pastel `*Soft` values. The pastels are light-mode-only and glare as bright blobs on black. The `*Soft` tokens remain in `tokens.ts` for light-only contexts.
- **Progress track.** ~~`ProgressBar`'s track is *deliberately theme-invariant*, the one exception to the surfaces rule.~~ **Superseded 2026-08-17 — see the refinement below.**

### Progress track refined (founder-approved, 2026-08-17)

The theme-invariant track held while every progress bar was fed by a fixture that always showed partial progress. Once real logging landed in Sprint 2, an empty day rendered a near-white bar across a near-black card — which reads as *100% complete*, not 0%. The founders reclassified this as a **usability defect rather than an aesthetic preference** and approved a minimal correction.

`ProgressBar`'s track now resolves through `useTheme().surfaces.track`.

- **Light mode is byte-identical.** `lightSurfaces.track` *is* `palette.track` (`#EFEDE9`) — the same value the removed literal held.
- **Only dark changes**, to `rgba(255,255,255,0.12)`: visible enough to read as a track, quiet enough that the filled portion still clearly dominates.
- **Home was verified on device** across all three of its consumers — `JourneySection` (gold journey bar), `MacroRow` (protein/carbs/fat), and `MetricTile` (the 3px accents). No file under `src/features/dashboard/` was modified, and Home reads better than before: the pale tracks had been competing with the content above them.

This refines rather than reverses the 2026-08-16 decision — the principle that Home is the reference treatment still stands; what changed is that the reference itself was wrong once the data became real.

## Visual source of truth: Home/Dashboard

**The Home/Dashboard screen is the current visual authority for VITA.** When a question arises about how something should look, match Home. Its design language:

premium · modern · minimal · clean · strong hierarchy · theme-aware surfaces · rounded cards · subtle borders · controlled accent colors · cohesive typography · consistent section headers · consistent navigation styling.

**Share the DNA, not the layout.** Feature screens keep their own layouts and content — Fuel should look like Fuel, Journey like Journey, Settings like Settings. What they share is the theme, spacing rhythm, card and border treatment, section-header system, typography, accent semantics, and dock styling. This is explicitly *not* an instruction to reuse Home's composition.

Home is founder-approved and stable. Changing a shared primitive in a way that visibly alters Home requires flagging it first.

## Navigation placement (founder decision, 2026-07-09)

**Settings remains permanently in the top-right corner (header icon, present on every screen) and is not part of the floating dock.** The dock stays a fixed 4 items: Home, Fuel, Journey, Atlas. This is locked, not an open question.

## Official brand palette (founder-approved brand sheet, July 2026)

- Ink `#1C1F1A` · Sage `#7C846B` · Cream `#E6DFD2` · Paper `#F7F5F1` · Gold `#D4B27A`
- The VITA mark (mountain range in a circle) lives in code as `src/components/shell/VitaMark.tsx` and drives the generated app icon/splash (`scripts/generate-brand-assets.mjs`). Do not redesign or create variations.
- Brand palette owns branding surfaces (icon, splash, logo, sign-in). Screen accents below come from the approved UI reference; reconciling the two is a decision for the full Design System.

## Permanent domain color hierarchy (founder decision, Sprint 0.1)

- **Gold `#D4B27A` → brand, journey stage / progression emphasis, premium highlights** · **Orange `#F2670F` → Fuel / nutrition** · **Blue `#2F80ED` → Water / hydration** · **Green `#2E9E5B` → progress, movement, positive completion** · **Purple `#7C3AED` → Peptides** (and Atlas) · **Neutrals → navigation, structure, general UI**
- Structural components (SegmentedTabs, Chip, section actions, the Home dock item) default to the theme's neutral — brand ink in light, primary text in dark; domain flows pass their domain color explicitly.
- This hierarchy is part of the permanent design language moving forward. **Do not recolor an existing feature into a different hue.** Treat it as guidance rather than an absolute where already-approved UI requires otherwise (Home's gold journey accents, for example).

## Motion (Sprint 0.1 baseline)

- Tab transitions: fade. Press feedback: subtle spring scale (`PressableScale`, 0.97–0.98). Progress bars animate to their value (650ms ease-out cubic). No advanced animations until the Polish sprint.

## Interim tokens (`src/theme/tokens.ts` is authoritative — values below verified 2026-08-16)
- **Macros:** protein `#2E9E5B` (green, corrected 2026-07-18 to match the approved reference) · carbs `#F5A623` · fat `#E5484D` · success green `#2E9E5B`
- **Light surfaces:** warm background `#F8F6F2` · cards `#FFFFFF` radius 20, hairline border + soft shadow · track gray `#EFEDE9`
- **Dark surfaces:** background `#000000` · cards `#1A1B1D` · border `rgba(255,255,255,0.08)` · text white, secondary 65%, tertiary 45% · track `rgba(255,255,255,0.12)`
- **Type scale:** display 32 · title 24 · heading 17 · body 15 · caption 13 · micro 11 (system font)
- **Spacing:** 4-based scale (4–32); floating dock clearance 120

Existing primitives (in `src/components/ui/`): Screen, ScreenHeader, Card, PressableCard, GlassSurface, Section, SectionHeader, ProgressBar, StatBar, DailyProgressCard, SegmentedTabs, Chip, ListRow, IconBadge, Button, TextField, Stepper, PressableScale, EmptyState, Toast.

`EmptyState` (added Sprint 2, slice 2.1) is the shared empty-state treatment: outline glyph, secondary title, optional tertiary body, centered. Deliberately quiet — no illustration and no shouting call to action. Logging nothing yet is a normal moment in a normal day, not a failure to correct, which is the same reasoning behind the no-guilt-mechanics rule.

`Toast` (added Sprint 2, slice 2.2) is the confirmation surface for instant actions — a dark pill above the dock with an optional action (typically Undo), 2.6s plain / 6s with an action. Deliberately not a modal or success screen: logging is meant to take seconds. Its surface is dark in both themes, so its label is white in both rather than following `surfaces.text`.

---

## Future direction (founder direction, 2026-08-18) — not yet implemented

Recorded so it survives the sprints between now and when it is built. **This is stated direction, not approved specification.** Nothing here changes current implementation, and details may change after technical investigation, UX testing, provider availability, or design review.

### Density and restraint

The quality bar has not moved — premium, modern, minimal, in the Apple / Oura / WHOOP register. What the founders added is a specific critique of how VITA currently *spends* space:

> Too basic · too bulky · overusing large numbers · filling space simply because space exists.

Calorie and nutrition values are the named example: they grow disproportionately large and dominate entire screens. The corrective principle: **size communicates importance, not availability.** A number is large because it is the one thing the screen is about, never because the card had room. Refined density, stronger hierarchy, and more intentional visual storytelling — less bulk, more personality.

The first application is the **Fuel Visual Refinement** slice near the end of Sprint 2 (`docs/04-Master-Roadmap.md`), which evaluates information density, typography scale, number sizing, spacing, card sizing, empty space, hierarchy, search-result density, Food Detail density, logging confirmation, meal rows, and Food Log presentation. Same feature architecture, significantly more refined presentation — it is not a functional redesign.

**Built 2026-08-21 for the Fuel landing screen** (slice 2.9 — pending founder review; the remaining Fuel surfaces are still to come). Three system-level results:

- **Rows in a panel, not a grid of cards.** Where a screen shows several peer items and some are empty, they belong in one surface separated by hairlines. A card per item spends its border, shadow, and padding on emptiness — which is precisely the "filling space because space exists" failure. Fuel's four meal slots cost one row each when empty and expand in place when they have content.
- **Proportion is the hierarchy signal.** A secondary module reads as secondary by being half width, and a primary action reads as primary by being filled — neither needs to be taller. Nothing on Fuel grew to assert importance.
- **Calories terminology.** VITA's user-facing copy says **Calories** (or **cal** where a row is tight), never `kcal`. US-English product decision, presentation only: internal fields, provider payload names, and nutrient units are unchanged.

**Meal color language** (Fuel): Breakfast sunrise yellow · Lunch midday orange · Dinner sunset red-orange · Snacks neutral sage with a plain utensils glyph and deliberately no time-of-day signal, since a snack happens at any hour. Warm progression built entirely from existing brand and macro tokens. **Snacks is not purple**, though the founder's concept reference shows it that way — purple is a locked domain color (Atlas and peptides) and the Peptides module sits directly below the meal list. Flagged for founder confirmation.

### Food visuals — three tiers (built 2026-08-21)

Every surface that shows a food resolves its picture through one shared
function, never per screen:

1. **The real provider image**, when the food has one. A photograph beats
   anything we can infer.
2. **A VITA category visual**, inferred conservatively from the name across
   24 broad categories.
3. **The generic food treatment**, when the name says nothing reliable.

Three rules hold this together.

**A wrong picture is worse than no picture.** This is the governing rule and
it was learned the hard way: the first implementation borrowed an icon
font, whose only general food glyph is a burger and a drink — so every food
VITA could not classify was confidently drawn as a burger, and every banana
as an apple. A category with no honest drawing now resolves to the neutral
generic instead of borrowing a different food's picture.

**The generic must be neutral.** A fork and knife say "food, unspecified"
and cannot be mistaken for a particular dish. A specific food can never
serve as a fallback.

**Ambiguity resolves to generic, never to a guess.** An unrecognized name
gets the neutral treatment, which is a correct answer. The one exception is
a deliberately tiny list of household product names ("Big Mac") that no
amount of generic word matching can reach — an exception list, not a
strategy.

The drawings live in `src/features/fuel/foodArt.ts`: outline-only vector
shapes on a 24×24 grid, uniform stroke, round joins, one color so a single
drawing serves Light and Dark, and stroke weight scaled to render size so a
row icon and a hero icon carry equal optical weight. Category travels with
the resolved visual even when a real image wins, so a surface can tint or
label by category regardless of which tier answered.

### Contextual food visuals (concept — unscheduled)

Food tracking should eventually feel more alive and visually distinctive: a burger shows a small burger, a taco a taco, a bowl a bowl, coffee a cup. **Small, delightful, tasteful, premium, and useful for quick recognition — explicitly not giant food photography dominating the interface.**

Two constraints already settled as direction:

- **Presentation must not depend on any one provider.** VITA must not look visually broken because a provider has no image. Real product image when it genuinely improves the experience → VITA contextual illustration/category icon when there is no image → clean generic food fallback when the category is unknown. This matters because USDA, Open Food Facts, restaurant providers, and custom foods all have inconsistent image coverage.
- **A food → category → illustration mapping will be needed**, since provider data does not reliably expose a usable *visual* category. Recorded as a future architecture consideration in `docs/09-Technical-Documentation.md`; deliberately not designed or over-engineered yet.

Implementation options to evaluate when this is scoped: a curated food-category icon/illustration library · lightweight vector assets · small animated illustrations · provider product images where appropriate · category fallback art. Full proposal: Vita HQ `08 Innovation Lab/Nutrition Features/Contextual Food Visuals.md`.

### Motion and micro-interactions

Subtle motion is wanted, and restraint is the point: **premium micro-interactions, not novelty animation.** VITA does not become a cartoon or a game. Named candidates — small food-icon movement on a successful log, smooth macro/progress animation, gentle confirmation transitions, water fill animation, peptide injection-site selection feedback, card state transitions, progress changes.

Division of ownership, **as revised by the 2026-09-01 identity insertion**: **Sprint 5 — VITA Identity & Interaction establishes the interaction vocabulary** — what a press, a completion, a sheet, a progress change and a successful log feel like in VITA — and **Sprint 9 — Final Polish / Motion / Launch Experience** (renumbered and renamed from Sprint 8 — Final Polish & Animations) performs the final app-wide pass: applying that vocabulary consistently everywhere, finishing motion, edge cases, accessibility, performance and the launch experience. **Neither replaces the other.** Feature-specific motion may still ship earlier where it genuinely belongs to that feature — Fuel motion inside Sprint 2's refinement slice, for example — and Sprint 9 is not a holding pen for every feature's visual debt. The standing rules still apply: motion confirms, never decorates; respect reduced-motion settings; one vocabulary app-wide.

---

## Sprint 5 — VITA Identity & Interaction (founder direction, 2026-09-01) — not yet implemented

**⚠️ Direction, not approved specification. No implementation is authorized; the sprint is planned, not opened.** The full brief is `docs/Sprint-5-Identity-Brief.md` (**DRAFT / PENDING SPRINT 5 ARCHITECTURE APPROVAL**); the roadmap entry is in `docs/04-Master-Roadmap.md` → Sprint 5. This section exists so the Design System points at that work rather than duplicating it.

**The problem this document must eventually answer.** VITA overuses large rounded surfaces and card containers, so unrelated content arrives at the same visual weight — most screens reach for dark background, large rounded card, text, icon, another rounded card. Features that behave nothing alike look like variations of one template. The 2026-08-18 density direction above identified this on Fuel; Sprint 5 generalizes it to the product.

**Slice 5.1 — VITA Design Language is the slice that authors the missing parts of this document**, and it is a serious foundational slice rather than a token pass. Its questions: when VITA uses a card · when content sits directly on the background · what module sizes exist · how feature colors are used · what a VITA primary action is · how secondary actions work · how bottom sheets behave · how a completed state behaves · how progressive disclosure works · how VITA uses motion · how VITA uses haptics · what visual objects represent each feature · how VITA avoids over-design · **what a VITA interaction should feel like.**

**What is preserved:** the black / near-black premium foundation · VITA branding and the VITA mark · **gold as the primary brand color** · premium typography · mature spacing · restrained feature colors · the interim tokens and primitives listed above. **Feature colors become more functional than decorative** — gold for VITA / Journey / brand, blue for Water, purple/violet for Peptides, orange for Fuel, green for movement / activity — carrying indicators, interaction states, illustrations, visual objects, progress and motion rather than recoloring whole buttons or whole cards. **This refines the permanent domain color hierarchy above; it does not replace it, and no feature is recolored into a different hue.**

**Non-goals, explicitly:** bright cartoon gamification · random glassmorphism · gradient overload · animation for decoration · a completely different aesthetic · an architecture, business-logic, persistence or repository rewrite · a generic motivational wellness-app redesign.

**Home's status.** Home/Dashboard remains the current visual source of truth until Sprint 5 replaces the language it embodies — and slice 5.2 redesigns Home itself, so the reference and the redesign are the same surface. Until 5.1 and 5.2 are founder-approved, everything above stands unchanged and no new UI invents styling ahead of them.

---

## What this document will define (when authored)

- Design tokens: color palette, typography scale, spacing, radii, elevation
- Light and dark themes
- Core components (Button, Card, Input, etc.) and their states
- The floating dock and app shell
- Iconography
- Motion, haptics, and transitions
- Accessibility standards

## Where the Design System lives in code

- Tokens and theme: `src/theme/`
- Primitive components: `src/components/ui/`
- App shell (floating dock, frame): `src/components/shell/`

All new UI must follow this document once approved. No custom styling may be introduced unless approved and documented here.
