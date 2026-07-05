# VITA — Design System

Status: **Placeholder — not yet authored.**

The full Design System will be authored and approved separately before detailed UI polish begins. Until then, the **founder-approved VITA UI reference image (July 2026) is the interim visual authority**, and its extracted tokens live in `src/theme/tokens.ts`.

## Interim tokens (extracted from the approved UI reference)

- **Color ownership:** orange `#F2670F` = VITA core (Home, Fuel, primary actions) · blue `#2F80ED` = Water · purple `#7C3AED` = Peptides & Atlas
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
