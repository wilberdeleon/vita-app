import { Platform } from 'react-native';
import { palette } from '../../theme/tokens';
import type { TimePeriod } from './greeting';

/**
 * The square geometry, and the Dynamic Type threshold that goes with it.
 *
 * **Moved to `components/modules/geometry.ts` in 5.6B.3 and re-exported here.**
 * Fuel now draws the same Water and Peptides modules Home does, and a shared
 * component on two different footprints would not actually match — so the
 * footprint moved to where the shared components live. Every Home component
 * still imports these names from this file and nothing about the locked
 * Dashboard grid changed; there is simply one definition now instead of two
 * that could drift.
 *
 * The reasoning behind each number is recorded at the definition.
 */
export {
  COMPACT_FONT_SCALE,
  SQUARE_HEIGHT,
  SQUARE_RADIUS,
  WIDE_RADIUS,
  isCompactSquare,
  squareHeight,
} from '../../components/modules/geometry';

/** Quick Tools tiles share their own geometry, for the same reason. */
export const TOOL_TILE_HEIGHT = 72;

/**
 * How far *decoration* is allowed to grow.
 *
 * The distinction slice 5.3D settles: **information scales without limit,
 * ornament does not.** At the largest accessibility sizes the quote reached
 * four lines and pushed every real figure off the screen — a decorative line
 * had taken the space belonging to the day's actual data, which is the
 * opposite of what the setting is for.
 *
 * So the quote, its attribution and the wordmark carry a cap. This is **not**
 * `allowFontScaling={false}`: they still grow, and they still respond to the
 * setting — they simply stop before crowding out the content. Nothing that
 * states a fact carries a cap, and nothing ever will; a test asserts it.
 */
export const DECORATIVE_FONT_CAP = 1.35;

/** The same treatment for a tool tile, which also allows a second line. */
export function toolTileHeight(fontScale: number): number {
  const scale = Math.min(Math.max(fontScale, 1), 2);
  return Math.round(TOOL_TILE_HEIGHT * (1 + (scale - 1) * 0.7));
}

/**
 * Home's type scale (slice 5.3D).
 *
 * The founders' review was that the whole screen read slightly small. These
 * are **one small step up each**, not a new hierarchy: the gaps between roles
 * are preserved, so a value still dominates its label and support copy still
 * recedes. Nothing became bold that was not, and no secondary copy was
 * promoted to primary.
 *
 * **Kept local to Home on purpose.** `theme/tokens.ts` sizes every screen in
 * the app; changing it here would start a global typography migration inside
 * a Dashboard polish slice. Home proves the sizes, and the later identity
 * slices carry them outward — see the Migration Guide.
 *
 * Sizes only. Weight, colour and letter-spacing stay with the components,
 * because those are what distinguish the roles from each other.
 */
export const TYPE = {
  /** `GOOD NIGHT, WILBER` — an eyebrow, and staying one. */
  greeting: 12.5,
  quote: 21,
  quoteLineHeight: 28,
  attribution: 14,
  /** `Thu, Sep 3`. */
  dateChip: 14,
  /** `QUICK TOOLS`, `TODAY'S SCHEDULE`. */
  sectionHeading: 12,
  /** `Water`, `Peptides`, `Fuel` on a widget. */
  moduleLabel: 12.5,
  /** `No routines`, `2,000 cal left` — the square's headline. */
  squareValue: 20,
  /** Water's square headline, which sits under a ring rather than alone. */
  squareValueSmall: 17,
  /** The figure inside Water's ring. */
  ringValue: 15,
  /** `Goal reached`, `1 of 3 meals`, a routine name and amount. */
  support: 14.5,
  /** The value line on a wide module. */
  wideValue: 17,
  /** `Add`, `Log`, `View`. */
  actionLabel: 14.5,
  /** `Calculator`, `Sites`, `Scan`. */
  toolLabel: 15,
  /** `All tools`. */
  quietLink: 14,
  /** Customize Home: a module's name. */
  sheetLabel: 16,
  /** Customize Home: instructions, the footer note, `Reset Layout`. */
  sheetCaption: 14,
  /** Customize Home: the Square / Wide chips. */
  sheetChip: 12,
} as const;

/**
 * A classical serif for the quote, from what the platform already ships.
 *
 * The font audit found `expo-font` configured but **no bundled font files and
 * no `fontFamily` anywhere** — the whole app is the system face. iOS carries
 * Hoefler Text, a serif drawn from classical Roman models, so the Caesar line
 * can read as a quotation without adding a single byte to the bundle. Android
 * has no equivalent by name and takes its generic `serif`; everywhere else
 * falls back to the system font, which is the honest degradation.
 *
 * Deliberately *not* a script or display face. The brief asked for classical
 * and premium and ruled out wedding cursive and Old English by name — a
 * quiet serif in italic is what separates a quotation from body text.
 */
export const QUOTE_FONT = Platform.select({
  ios: 'Hoefler Text',
  android: 'serif',
  default: undefined,
});

/**
 * The quote's gold, per scheme.
 *
 * `palette.gold` is drawn for dark surfaces. On the cream background it sits
 * at roughly 1.7:1 against the page — well under the 3:1 WCAG asks of large
 * text, and visibly washed out on device. Light mode therefore takes a
 * deepened version of the same hue rather than dropping the colour: the
 * quotation still reads as gold, and it is legible.
 *
 * Not a new brand colour and not a token — one component's scheme pair, kept
 * next to the component that uses it.
 */
export const QUOTE_GOLD = {
  light: '#8A6A2C',
  dark: palette.gold,
} as const;

/**
 * The greeting's accent, by time of day.
 *
 * Morning and afternoon come straight from the palette — brand gold and the
 * existing amber. Evening and night are **muted derivatives rather than the
 * domain hues**: `palette.peptide` at full saturation in the header would
 * read as a Peptides accent sitting nowhere near the Peptides widget, and
 * `palette.water` would do the same for Water. These are desaturated enough
 * to read as time of day rather than as a feature.
 *
 * Only the greeting takes the accent. Nothing else in the header moves.
 */
export const DAYPART_ACCENT: Record<TimePeriod, string> = {
  /** Brand gold — sunrise, and the colour VITA already opens with. */
  morning: palette.gold,
  /** The existing amber, warm without being loud. No new hex invented. */
  afternoon: palette.carbs,
  /** Muted violet — dusk. Deliberately lighter and flatter than peptide purple. */
  evening: '#9B85C9',
  /** Cool indigo — night, and quiet enough to stay an eyebrow. */
  night: '#7C8CC4',
};

/**
 * The same accents, deepened for the cream background.
 *
 * Gold, amber and the two dusk hues are all light colours; on `paper` they
 * fall below the contrast an 11pt eyebrow needs. These are the same four
 * hues at a legible value — the time of day still reads as a colour, and it
 * reads at all.
 */
export const DAYPART_ACCENT_LIGHT: Record<TimePeriod, string> = {
  morning: '#8A6A2C',
  afternoon: '#A96A05',
  evening: '#5E4A96',
  night: '#41519B',
};

/** The accent for a period in the active scheme. */
export function daypartAccent(period: TimePeriod, scheme: 'light' | 'dark'): string {
  return scheme === 'dark' ? DAYPART_ACCENT[period] : DAYPART_ACCENT_LIGHT[period];
}
