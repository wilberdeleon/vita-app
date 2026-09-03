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

Existing primitives (in `src/components/ui/`): Screen, ScreenHeader, Card, GlassSurface, Section, SectionHeader, ProgressBar, ProgressRing, StatBar, DailyProgressCard, SegmentedTabs, Chip, ListRow, IconBadge, Button, TextField, NumericField, Stepper, PressableScale, EmptyState, Toast, VitaSheet. *(`PressableCard` was removed in slice 5.1 — zero call sites.)*

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

---

# The VITA Design Language (slice 5.1)

# ⚠️ DIRECTION FOUNDER-APPROVED — EXECUTION AWAITING 5.1A REVIEW

**The identity direction is approved** (founder device review, 2026-09-02): direct-on-background as the default, cards earning their use, glass as rare, feature-specific visual objects, restrained feature colour, the neutral primary action, one display-size subject per screen, `VitaSheet`, the `PressableScale` evolution, restrained haptics, the RN Animated motion foundation, reduce-motion support, and the vessel as a percentage-of-goal object with no capacity semantics.

**The execution is not yet locked.** Slice 5.1A applied the visual refinements the review asked for and awaits its own device review. Until that passes, production screens are not migrated — slice 5.2 (Water) is the first that does. The founder *rulings* it is built on (surface hierarchy, the vessel as percentage-of-goal, restrained haptics) are approved and are recorded in `docs/Sprint-5-Planning-Audit.md` §W. **The execution below is not.** Until that review passes, production screens are not migrated onto this language — slice 5.2 (Water) is the first that does.

## 1 — Surface roles

**The rule this replaces:** *content needs containing, therefore `Card`.*
**The rule now:** *a surface's treatment is chosen by what the content is for.*

Founder-approved hierarchy (§W.1), in order of how often it should be reached for:

| Role | Treatment | Use it for | Built from |
|---|---|---|---|
| **Direct content** — *the default* | No container, no border, no shadow. Hierarchy from type and space alone | Headings · primary status · key actions · the feature's visual object | plain `View` |
| **Grouped surface** | Opaque, `radii.card`, hairline border, soft shadow, generous padding. **Used sparingly** | Several *related* controls or facts that genuinely belong together | `Card` |
| **Panel** | One grouped surface, hairline-divided rows, minimal padding | Any list of peers — logs, routines, meals | `Card` + row dividers |
| **Utility row** | Small, navigational, low visual weight | A link to somewhere else | `ListRow` |
| **Layered surface** | Real blur, tint, highlight. **Rare** | Floating navigation · overlays · genuine layering | `GlassSurface` |
| **Sheet** | Bottom-anchored, backdrop, one task | A decision made *in place*, where a route would lose context | `VitaSheet` |
| **Feature visual object** | Feature-specific, non-rectangular, carries the feature's colour and state | The thing the screen is *about* | e.g. `WaterVessel` |

**The binding constraint, in the founder's words: do not replace card soup with glass soup.** Glass does not inherit the card's old job. If a card was wrong for a piece of content, glass is wrong for it too — the answer is usually Direct content.

**Test when adding UI:** if two adjacent surfaces have the same role, one of them is probably wrong.

**Card vs sheet vs route.** A **route** is for a task with its own address — navigable back to, deep-linkable, leavable and returnable. A **sheet** is for a decision made in place, where the thing being changed should stay on screen while it changes. Logging a drink while looking at today's hydration is the second kind.

## 2 — Feature colour

Mapping unchanged (it is a permanent founder decision): **Gold** = VITA / Journey / brand · **Blue** = Water · **Purple** = Peptides (and Atlas) · **Orange** = Fuel · **Green** = movement / activity.

What changes is *behaviour*.

**Feature colour carries:** the feature's visual object · progress and fill · completion state · selection state · icon glyphs · microinteraction feedback · **one** accent per screen, on the thing that matters most.

**Feature colour does not carry:** a full-width primary button · a whole card or surface tint · state that has no second, non-colour signal · decoration where nothing is stateful · gradients.

**The accent exception (5.1A).** A neutral control may carry a single feature-coloured *glyph* — the `+` on Add Water is Water blue on an otherwise neutral surface. That is the rule working, not an exception to it: the colour marks what the action is about while the control itself stays neutral. A second coloured element on the same control would not be.

**Two rules that follow:**

- **The primary action is neutral.** It does not change hue by section. A blue button on Water and a purple one on Peptides is exactly what made two unrelated screens read as one template in two colours — the diagnosis the whole sprint rests on. The prototype demonstrates this: the vessel is blue, the *Add Water* action is the theme's neutral.
- **Neutral is the default; colour is earned.** A screen where everything is blue says nothing is important.

*Note: this narrows the earlier convention that "domain flows pass their domain color explicitly." Domain colour still travels with domain flows — it now lands on objects, progress and state rather than on the button.*

## 3 — Typography

**No new font.** The existing scale stands: `display` 32 · `title` 24 · `heading` 17 · `body` 15 · `caption` 13 · `micro` 11, system font throughout.

| Role | Token | Rule |
|---|---|---|
| Brand / identity | `title` + wordmark spacing | `ScreenHeader brand` only |
| Screen context | `title` | The screen's name |
| Hero metric | `display` or larger | **One per screen, maximum.** It is the thing the screen is about — never a slogan |
| Section / group | `SectionHeader` | See below |
| Body | `body` | What the screen says |
| Secondary metadata | `caption` | Timestamps, context lines |
| Label / kicker | `micro` uppercase | Sparingly |

**`SectionHeader` is a real contributor to sameness** — one treatment, and up to twelve on a single screen (`peptides/catalog/[id].tsx`). Guidance until variants are added in a screen's own slice:

- Use it for a screen's genuine structural divisions, **two or three at most**.
- Prefer an **inline label** inside a surface for a group that is not a screen-level division.
- Prefer **progressive disclosure** where a section exists only to hold secondary detail — a collapsed region needs no header above it.
- A section whose content can be empty should **vanish when empty** rather than render a header over nothing. Peptides home already does this; it is the correct pattern.

## 4 — Spacing and rhythm

- **Section rhythm** (unrelated concepts): `spacing.xxl`–`xxxl`, via `Screen`'s `contentGap`.
- **Content rhythm** (within a group): `spacing.m`.
- **Around a visual object**: generous, because the object is the hierarchy.
- **Progressive disclosure**: tighter than section rhythm — a disclosed region is *inside* its parent, not a peer of it.

**Premium does not mean empty.** Do not add whitespace to look expensive; add it to separate things that are genuinely separate. `Screen`'s `contentGap` is the lever, and most screens currently take the default without thinking about it.

## 5 — Radius

Current: `card` 20 · `control` 16 · `chip` 12 · `pill` 999 · `glassTile` 20 · `glassRow` 22 · `glassLarge` 24 — five of seven are the same rounded-rectangle idea.

- **Direct content has no radius at all** — it has no bounding box. This is the biggest single change, and it is what stops every piece of content from being another rounded rectangle.
- **Large surfaces** keep `card` / `glassLarge`.
- **Controls** keep `control`; **chips and pills** keep theirs.
- **A visual object owns its own shape** and is not bound to the radius scale.

Do not flatten everything to sharp rectangles; do not keep large rounded rectangles everywhere.

## 6 — Borders and dividers

Prefer, in order: **spacing** → **alignment** → **typography** → **a hairline divider** → **a bordered surface**. A group of peers is usually a panel with dividers, not a stack of bordered cards — `ListRow` currently carries its own border and shadow, which is why a list of rows reads as a stack of cards.

Where a border is used, it stays a hairline in `surfaces.border`. In dark mode the border does the separating work: the light-mode drop shadow is invisible against near-black.

## 7 — Interaction

| | Rule |
|---|---|
| **Press** | `PressableScale`. Scale `motion.pressScale` (0.97 control / 0.98 surface) with the shared spring. **Under Reduced Motion it fades instead of scaling** — feedback stays, movement goes |
| **Selection** | Instant, no motion. Colour plus `accessibilityState.selected` |
| **Success** | `Toast` remains the default confirmation for an action that completes instantly |
| **Completion** | The object changes, plus **one** accompanying signal. Never a toast *and* an animation *and* a haptic for one action |
| **Destructive** | Reversible → Undo toast, never a dialog. Irreversible → a dialog that **says what is kept** |
| **Motion budget** | Nothing over 700ms. Nothing animates on mount that could animate on change |

**Motion confirms, it never decorates. If nothing changed, nothing moves.**

## 8 — Motion

Timings live in `theme/tokens.ts` → `motion`, so components stop inventing their own:

| Token | Value | For |
|---|---|---|
| `duration.press` | 90ms | Touch response |
| `duration.state` | 180ms | A discrete change — selection, completion settling |
| `duration.sheet` | 260ms | A surface entering or leaving |
| `duration.progress` | 700ms | A measured value moving to a new one |

**The settle (5.1A).** A value that *rises* may overshoot slightly and return — 1.8% over 240ms on the water level — so liquid reads as liquid rather than as a bar chart. It is the value's own motion, never a decorative layer on top, it fires only on a rise, and it is skipped entirely under Reduced Motion. Nothing in VITA animates once it has come to rest.

`pressSpring` (speed 40, bounciness 5) and `pressScale` are shared. Easing is `Easing.out(cubic)` for progress, `Easing.out(quad)` for state.

**React Native `Animated` only.** Reanimated is not installed and is not justified — the audit found no requirement it answers, and it would be a native dependency added during an Expo-Go-pinned sprint.

## 9 — Reduce motion

`useReducedMotion` is the switch. **Every new Sprint 5 motion must honour it.**

**The degradation rule: land on the final state directly. Never play a shorter version of the same animation.** Where feedback would otherwise vanish entirely, substitute a non-moving equivalent — `PressableScale` fades rather than scales, and `VitaSheet` presents without sliding.

Honoured by: `ProgressBar` · `WaterLevelPanel` · `PressableScale` (5.1) · `VitaSheet` (5.1) · `WaterVessel` (5.1). **Still outstanding: `Toast`, `FuelQuickActions`** — scheduled for slice 5.7.

## 10 — Haptics

`expo-haptics`, behind `src/lib/haptics`. Call sites say `vitaHaptic('confirm')`, never a raw Expo call.

| Event | Platform | Fires on |
|---|---|---|
| `selection` | `selectionAsync` | Choosing from a set — a quick amount, a unit, a site, a tab |
| `confirm` | `impactAsync(Light)` | Something the user asked for was recorded |
| `complete` | `notificationAsync(Success)` | A day-level goal was reached. **Rare by design** |
| `warn` | `notificationAsync(Warning)` | Destructive confirmation, or a failed save |

**Never** on scroll, navigation, render, or decorative transitions. **Never twice for one action** — where `confirm` and `complete` both apply, fire only `complete`. Failures are silent: a missing vibration must never interrupt the action it accompanied.

## 11 — Progressive disclosure

Hide secondary complexity; never hide the primary action, and never hide safety-relevant text.

- **Immediate action is always visible.** Administrative detail collapses.
- A disclosed region is **inside** its parent — tighter spacing, no section header above it.
- Disclosure state is presentation only. It never changes what is stored.

## 12 — Completion

The object changes, and **one** signal accompanies it.

Water's goal: the vessel's own edge turns brand gold and the fill completes — blue is the feature, gold is VITA, and a met goal is a VITA moment. A `complete` haptic. The text says `Goal reached`.

**Excluded: confetti · badges · streak celebrations · scores · sounds · anything that reads as reward.** VITA has a no-guilt-mechanics rule; its mirror is no-reward-mechanics. **Completion should feel like settling, not like winning.**

## 13 — Empty states

`EmptyState` is tonally correct and stays. Two rules around it:

- **Sections vanish when empty** wherever the section is genuinely optional.
- Use a **compact inline line** for an empty region *inside* a surface; reserve the full `EmptyState` for a screen's primary empty condition.
- **No motivational filler.** The current copy is right and should not be warmed up.

## 14 — Feature-specific vs shared

**A primitive is justified by shared *behaviour*, not by shared silhouette.** Two things that are both "a big rounded thing at the top of a screen" are not the same component — treating them as one is how VITA got here.

**Intentionally not shared:** the hydration vessel (Water only — never a `ProgressObject` or `HeroCard`) · `BodyMap` (shared *within* Peptides across its modes, never generalised to a "diagram") · `WaterWeekStrip` vs `RoutineDayStrip` (different semantics: relative volume vs discrete day marks) · Fuel's meal colour language and food art · the Taken/Skipped control pair · Atlas's orb.

## 15 — Accessibility floor

Every new surface must clear all of these:

1. **Never colour-only.** Completion, selection and due-state each carry a second signal — text, icon, or shape.
2. **Never animation-only.** No state reachable solely by watching a transition.
3. **Every visual object has a text equivalent.** `WaterVessel` is a `progressbar` with a label and a spoken value, so "Hydration, 33 percent of goal" is available without sight.
4. **Touch targets** stay at 44pt, or add `hitSlop`.
5. **Dynamic type** — compact modules and tiles break first; check on device.

## 16 — Light and dark

Dark is the primary identity reference. **Light is real and must not feel like a broken inversion.**

**Define relationships, not values, and give each theme its own numbers.** Three bugs in this codebase came from one value that inverted its own hierarchy across themes: the pale progress track that read as *complete* on black; `BodyMap`'s zone that survived review on a bright screen and vanished on a real one; and `waterSoft` outshining today's column in the week strip. All three passed desk review.

`WaterVessel` follows the rule — separate empty-fill, liquid and edge values per theme, and a lighter meniscus in dark than in light.

**Verify on a real device, in both themes.** Desk review does not catch this class of defect.

---

## What this document still owes

- `SectionHeader` variants (proposed in 5.1, built when a screen's slice needs them)
- Iconography
- The full component state matrix
- App-shell and dock specification beyond current behaviour

## Where the Design System lives in code

- Tokens and theme: `src/theme/`
- Primitive components: `src/components/ui/`
- App shell (floating dock, frame): `src/components/shell/`

All new UI must follow this document once approved. No custom styling may be introduced unless approved and documented here.
