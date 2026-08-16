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
- **Progress track.** `ProgressBar`'s track is *deliberately theme-invariant*, the one exception to the surfaces rule. The approved Home dashboard shows that pale track under the gold journey bar and the macro bars in dark mode, so it is the reference treatment. Every other screen matches Home by leaving it alone. **Do not "fix" this for token purity** — changing it would change Home, and that needs a deliberate design decision.

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

Existing primitives (in `src/components/ui/`): Screen, ScreenHeader, Card, PressableCard, GlassSurface, Section, SectionHeader, ProgressBar, StatBar, DailyProgressCard, SegmentedTabs, Chip, ListRow, IconBadge, Button, TextField, Stepper, PressableScale.

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
