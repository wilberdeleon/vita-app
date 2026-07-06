/**
 * VITA design tokens — extracted from the founder-approved UI reference and
 * brand sheet (July 2026). Interim authority until docs/05-Design-System.md
 * is fully authored.
 *
 * Permanent domain color hierarchy (founder decision, Sprint 0.1):
 * orange = Nutrition/Fuel · blue = Water · purple = Atlas (and peptides,
 * per the approved UI reference) · green = Journey progression ·
 * neutrals = navigation, structure, general UI.
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

  // Macros
  protein: '#E4572E',
  carbs: '#F5A623',
  fat: '#E5484D',

  // Semantic
  success: '#2E9E5B',
  successSoft: '#E4F4EA',

  // Surfaces
  background: '#F6F5F2',
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
