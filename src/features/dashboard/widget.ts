import { Platform } from 'react-native';
import { palette, radii } from '../../theme/tokens';
import type { TimePeriod } from './greeting';

/**
 * The one square-widget geometry, shared by every square module.
 *
 * **Founder ruling, slice 5.3C: Water, Peptides and Fuel squares are the same
 * size.** In 5.3B each set its own `minHeight`, so Peptides — which has the
 * least to say — sat visibly shorter than Water beside it, and a widget's
 * footprint changed with how much data happened to exist that day. A grid of
 * widgets has to hold still: the shape is the container, not the content.
 *
 * Height rather than aspect ratio because the cell width is whatever half the
 * screen minus gaps comes to, and a true square would be a different height on
 * every device. This is a fixed, deliberate proportion that reads as square on
 * the phones VITA targets.
 *
 * Internal layouts stay feature-specific — the point is one *footprint*, not
 * one design.
 *
 * **The number is set by the busiest square, not the emptiest.** Water with
 * no goal carries the most: a label, a ring, a total, a status line and an
 * Add control. At 172 that stack overflowed and the total collided with the
 * status line on device. One shared footprint means the shared value has to
 * clear the worst case, and the quieter modules centre themselves in the
 * space rather than shrinking to fit their content — which is the whole
 * point of the ruling.
 */
export const SQUARE_HEIGHT = 192;

/** A square widget is a little rounder than a wide strip; it reads as an object. */
export const SQUARE_RADIUS = radii.glassLarge;
export const WIDE_RADIUS = radii.card;

/** Quick Tools tiles share their own geometry, for the same reason. */
export const TOOL_TILE_HEIGHT = 68;

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
