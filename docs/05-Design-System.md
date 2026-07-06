# VITA — Design System

Status: **Placeholder — not yet authored.**

The full Design System will be authored and approved separately before detailed UI polish begins. Until then, the **founder-approved VITA UI reference image (July 2026) is the interim visual authority**, and its extracted tokens live in `src/theme/tokens.ts`.

## Official brand palette (founder-approved brand sheet, July 2026)

- Ink `#1C1F1A` · Sage `#7C846B` · Cream `#E6DFD2` · Paper `#F7F5F1` · Gold `#D4B27A`
- The VITA mark (mountain range in a circle) lives in code as `src/components/shell/VitaMark.tsx` and drives the generated app icon/splash (`scripts/generate-brand-assets.mjs`). Do not redesign or create variations.
- Brand palette owns branding surfaces (icon, splash, logo, sign-in). Screen accents below come from the approved UI reference; reconciling the two is a decision for the full Design System.

## Permanent domain color hierarchy (founder decision, Sprint 0.1)

- **Orange `#F2670F` → Nutrition / Fuel** · **Blue `#2F80ED` → Water** · **Purple `#7C3AED` → Atlas** (and peptides per the approved UI reference) · **Green `#2E9E5B` → Journey progression** · **Neutrals → navigation, structure, general UI**
- Structural components (SegmentedTabs, Chip, section actions, the Home dock item) default to neutral ink; domain flows pass their domain color explicitly.
- This hierarchy is part of the permanent design language moving forward.

## Motion (Sprint 0.1 baseline)

- Tab transitions: fade. Press feedback: subtle spring scale (`PressableScale`, 0.97–0.98). Progress bars animate to their value (650ms ease-out cubic). No advanced animations until the Polish sprint.

## Interim tokens (extracted from the approved UI reference)
- **Macros:** protein `#E4572E` · carbs `#F5A623` · fat `#E5484D` · success green `#2E9E5B`
- **Surfaces:** warm background `#F6F5F2`, white cards radius 20 with soft shadow, track gray `#EFEDE9`
- **Type scale:** display 30 · title 22 · heading 17 · body 15 · caption 13 · micro 11 (system font)
- **Spacing:** 4-based scale (4–32); floating dock clearance 120

Existing primitives (in `src/components/ui/`): Screen, ScreenHeader, Card, SectionHeader, ProgressBar, StatBar, DailyProgressCard, SegmentedTabs, Chip, ListRow, IconBadge, Button, TextField, Stepper.

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
