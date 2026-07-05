/**
 * VITA design tokens — extracted from the founder-approved UI reference
 * (July 2026). Interim authority until docs/05-Design-System.md is authored.
 *
 * Color ownership: orange = VITA core (Home/Fuel), blue = Water,
 * purple = Peptides & Atlas.
 */

export const palette = {
  // Brand
  primary: '#F2670F',
  primarySoft: '#FDEBDD',
  water: '#2F80ED',
  waterSoft: '#E3EEFD',
  peptide: '#7C3AED',
  peptideSoft: '#EFE7FD',

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
  control: 14,
  chip: 10,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 30, fontWeight: '700' as const, letterSpacing: 0.2 },
  title: { fontSize: 22, fontWeight: '700' as const },
  heading: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  captionMedium: { fontSize: 13, fontWeight: '500' as const },
  micro: { fontSize: 11, fontWeight: '500' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  dock: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

/** Height reserved at the bottom of scrollable screens so content clears the floating dock. */
export const DOCK_CLEARANCE = 120;
