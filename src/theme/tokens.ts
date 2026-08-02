/**
 * VITA design tokens — extracted from the founder-approved UI reference and
 * brand sheet (July 2026). Interim authority until docs/05-Design-System.md
 * is fully authored.
 *
 * Permanent domain color hierarchy (founder decision, Sprint 0.1):
 * orange = Nutrition/Fuel · blue = Water · purple = Atlas (and peptides,
 * per the approved UI reference) · green = Journey progression ·
 * neutrals = navigation, structure, general UI.
 *
 * Theme-invariant vs. theme-aware (founders, 2026-07-18 — clean redesign,
 * dropping the Mountain World photo background in favor of full light/dark
 * support): brand, domain, and macro colors below do NOT change between
 * themes — red is red regardless of theme. Only surfaces (background, card,
 * text, border) have light/dark pairs — see `lightSurfaces`/`darkSurfaces`
 * and `useTheme()` in `ThemeProvider.tsx`. `palette` itself is UNCHANGED in
 * shape and stays the single flat light-mode object every non-Home screen
 * already imports directly — those screens intentionally don't theme-switch
 * yet (see Slice Tracker for the explicit scope note).
 */

export const palette = {
  // Official VITA brand palette (founder-approved, July 2026)
  ink: '#1C1F1A',
  sage: '#7C846B',
  cream: '#E6DFD2',
  paper: '#F7F5F1',
  gold: '#D4B27A',

  // Permanent domain colors
  primary: '#F2670F', // Nutrition / Fuel
  primarySoft: '#FDEBDD',
  water: '#2F80ED',
  waterSoft: '#E3EEFD',
  peptide: '#7C3AED', // Atlas + peptides
  peptideSoft: '#EFE7FD',
  journey: '#2E9E5B', // Journey progression
  journeySoft: '#E4F4EA',

  // Macros — `protein` corrected to green (founders, 2026-07-18) to match
  // the approved Daily Portrait / clean-redesign reference; reuses the
  // existing journey green rather than inventing a new hex.
  protein: '#2E9E5B',
  carbs: '#F5A623',
  fat: '#E5484D',

  // Semantic
  success: '#2E9E5B',
  successSoft: '#E4F4EA',

  // Surfaces — warm cream, not pure white (founders, 2026-07-18).
  background: '#F8F6F2',
  card: '#FFFFFF',
  cardWarm: '#5C3A21', // "Visual Progress" brown card
  track: '#EFEDE9',
  hairline: '#ECEAE6',

  // Text
  text: '#1B1B1B',
  textSecondary: '#6E6B66',
  textTertiary: '#A3A099',
  textOnColor: '#FFFFFF',
} as const;

/** Light-mode surfaces (founders, 2026-07-18) — mirrors `palette`'s existing values so there's one source of truth. */
export const lightSurfaces = {
  background: palette.background,
  card: palette.card,
  border: 'rgba(28,31,26,0.08)',
  text: palette.text,
  textSecondary: palette.textSecondary,
  textTertiary: palette.textTertiary,
} as const;

/** Dark-mode surfaces (founders, 2026-07-20 v4 — pure black background per the exact-replica reference spec). */
export const darkSurfaces = {
  background: '#000000',
  card: '#1A1B1D',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textTertiary: 'rgba(255,255,255,0.45)',
} as const;

export type Surfaces = {
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  card: 20,
  control: 16,
  chip: 12,
  pill: 999,
  glassTile: 20,
  glassRow: 22,
  glassLarge: 24,
} as const;

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: 0.2 },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  captionMedium: { fontSize: 13, fontWeight: '500' as const },
  micro: { fontSize: 11, fontWeight: '500' as const },
} as const;

// Softer, Apple-style diffuse shadows: lower opacity, larger blur.
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.045,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  dock: {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

/** Height reserved at the bottom of scrollable screens so content clears the floating dock. */
export const DOCK_CLEARANCE = 120;

/**
 * Glass material system (founders, 2026-07-18, simplified in the clean
 * redesign) — frosted-glass surfaces for Home dashboard cards and the
 * floating dock. Reduced from the Mountain World era's five opacity tiers
 * to two (`card`, `navigation`): the new flat-background mockups show one
 * consistent card treatment, not several opacity tiers, so the extra
 * variants were token sprawl the design no longer calls for. Each variant
 * now carries a light AND dark tint/border/highlight/blur set — see
 * GlassSurface, which picks the active scheme's set via useTheme().
 */
export const glass = {
  card: {
    light: {
      tint: 'rgba(255,255,255,0.70)',
      border: 'rgba(28,31,26,0.06)',
      highlight: 'rgba(255,255,255,0.5)',
      blurIntensity: 30,
    },
    dark: {
      // Nudged from 0.05/0.08 toward the exact-replica reference's #121212
      // card / #1E1E1E border on a pure-black background (founders,
      // 2026-07-20 v4).
      tint: 'rgba(255,255,255,0.07)',
      border: 'rgba(255,255,255,0.10)',
      highlight: 'rgba(255,255,255,0.06)',
      blurIntensity: 30,
    },
  },
  navigation: {
    light: {
      tint: 'rgba(255,255,255,0.78)',
      border: 'rgba(28,31,26,0.08)',
      highlight: 'rgba(255,255,255,0.55)',
      blurIntensity: 35,
    },
    dark: {
      tint: 'rgba(255,255,255,0.07)',
      border: 'rgba(255,255,255,0.10)',
      highlight: 'rgba(255,255,255,0.08)',
      blurIntensity: 35,
    },
  },
} as const;

export const glassShadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.18,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;
