# Asset Inventory

**What is this?** The index of Vita's brand and product assets — what exists, where it lives, and how it's produced.

**Why does it exist?** Assets scattered across machines die. Everything here points to a versioned location.

*Verified 2026-07-06 from the repo.*

---

## The rule

**Brand assets are generated from code, never hand-edited.** The VITA mark lives as a component (`src/components/shell/VitaMark.tsx`); `scripts/generate-brand-assets.mjs` (using `sharp`) produces the app assets from it. To change an asset, change the source and regenerate — see [[Brand Identity & Icons]] for the locked-mark rule.

## Inventory (repo `assets/`)

| Asset | File | Notes |
|---|---|---|
| App icon | `assets/icon.png` | Generated from the VITA mark |
| Splash | `assets/splash-icon.png` | Ink `#1C1F1A` background (set in `app.json`) |
| Android adaptive icon | `android-icon-foreground / -background / -monochrome.png` | Generated set |
| Favicon | `assets/favicon.png` | Web target |

## Living in code (not files)

- **VITA mark** — `VitaMark.tsx` (the canonical logo)
- **Brand palette & all design tokens** — `src/theme/tokens.ts` ([[Color System]])

## Referenced but not in the repo (**Needs Verification** — locate and archive copies)

- The **founder-approved VITA UI reference image (July 2026)** — the interim visual authority the entire Sprint 0 UI was built from
- The **founder-approved brand sheet (July 2026)** — source of the brand palette

Recommendation: place copies (or exports) in this folder so HQ preserves the visual authorities the docs keep citing.

## Future assets (homes reserved)

App Store screenshots and listing art ([[Launch Plan]]) · marketing visuals ([[Marketing & Growth]]) · Design System reference exports once authored ([[Design Bible]]).

**Related:** [[Brand Identity & Icons]] · [[Design Bible]]
