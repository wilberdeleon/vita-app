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
 * text, border, track) have light/dark pairs — see `lightSurfaces`/
 * `darkSurfaces` and `useTheme()` in `ThemeProvider.tsx`.
 *
 * `palette` keeps its shape, but as of the app-wide visual consistency pass
 * it is the source for THEME-INVARIANT values only — brand, domain, macro,
 * and semantic colors. Its surface/text entries (`background`, `card`,
 * `text`, `textSecondary`, `textTertiary`, `track`, `hairline`) are the
 * light-mode half of the pairs below and exist so `lightSurfaces` has one
 * source of truth; read them through `useTheme().surfaces`, not directly,
 * or the component will be permanently light.
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

  /**
   * A deliberately skipped routine day (founder direction, slice 3.9B).
   *
   * Amber, reusing the existing `carbs` hex rather than inventing a colour.
   * **Not red**: skipping on purpose is a choice the user made, not a failure,
   * and `fat` red is what this app uses for genuine errors. Named for its
   * meaning so nothing has to remember which macro token happened to look
   * right.
   */
  routineSkipped: '#F5A623',

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
  track: palette.track,
} as const;

/** Dark-mode surfaces (founders, 2026-07-20 v4 — pure black background per the exact-replica reference spec). */
export const darkSurfaces = {
  background: '#000000',
  card: '#1A1B1D',
  border: 'rgba(255,255,255,0.08)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textTertiary: 'rgba(255,255,255,0.45)',
  track: 'rgba(255,255,255,0.12)',
} as const;

export type Surfaces = {
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  /** Unfilled portion of segmented controls, steppers, and inert wells. */
  track: string;
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

/**
 * Motion timings (Sprint 5 slice 5.1).
 *
 * **Four durations, not one per component.** Before this, every animating
 * component picked its own number — 650ms in `ProgressBar`, 700ms in
 * `WaterLevelPanel`, an undocumented spring in `PressableScale` — so nothing
 * in the app moved at a shared speed. These are the speeds; a component that
 * needs a fifth is making a case, not reaching for a literal.
 *
 * The scale runs from "the finger is still down" to "a value changed and the
 * eye should follow it":
 *
 * - `press` — the touch response. Must beat the user's own perception of lag.
 * - `state` — a discrete change: selection, a toggle, a completion settling.
 * - `sheet` — a surface entering or leaving.
 * - `progress` — a measured value moving to a new one. The slowest, because
 *   it is the only one whose *travel* carries the meaning.
 *
 * **Nothing exceeds 700ms.** `progress` keeps `ProgressBar`'s and
 * `WaterLevelPanel`'s existing feel rather than inventing a new one — those
 * two are founder-approved on device, and re-timing approved motion is not
 * what this slice is for.
 *
 * The governing rule, unchanged since Sprint 0.1: **motion confirms, it never
 * decorates.** If nothing changed, nothing moves.
 */
export const motion = {
  duration: {
    press: 90,
    state: 180,
    sheet: 260,
    progress: 700,
  },
  /**
   * The shared press spring — previously hardcoded inside `PressableScale`.
   * Stiff and barely bouncy on purpose: a press is feedback, not a flourish.
   */
  pressSpring: {
    speed: 40,
    bounciness: 5,
  },
  /** Scale a surface compresses to while held. Large surfaces use less. */
  pressScale: {
    control: 0.97,
    surface: 0.98,
  },
} as const;
