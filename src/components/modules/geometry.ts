import { radii } from '../../theme/tokens';

/**
 * The geometry every compact feature module shares.
 *
 * ## Why this is not in `features/dashboard/widget.ts` any more
 *
 * It was, and it was right there until Fuel needed the same numbers. The
 * founder's 5.6B.3 device comparison found Home and Fuel showing the same two
 * features at two different sizes with two different type scales, and ruled
 * that they should match — not resemble. A shared *component* on two different
 * footprints would still not match, so the footprint is shared too.
 *
 * `widget.ts` re-exports every name below, so Home's own components import
 * exactly what they always did and nothing about the locked Dashboard grid
 * moves. **There is one definition; Home and Fuel cannot drift apart.**
 */

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
 * **The number is set by the busiest square, not the emptiest.** Water with no
 * goal carries the most: a label, a vessel, a total, a status line and an Add
 * control. At 172 that stack overflowed and the total collided with the status
 * line on device — which is what the 5.3C device pass caught. One shared
 * footprint means the shared value has to clear the worst case, and the
 * quieter modules centre themselves in the space rather than shrinking to fit
 * their content, which is the whole point of the ruling. **Raised again in
 * 5.3D** to carry that slice's larger type.
 *
 * This is the base, at the system's default text size. `squareHeight()` below
 * is what a component should actually use.
 */
export const SQUARE_HEIGHT = 208;

/** A square widget is a little rounder than a wide strip; it reads as an object. */
export const SQUARE_RADIUS = radii.glassLarge;
export const WIDE_RADIUS = radii.card;

/**
 * Dynamic Type: the point at which a square drops its decorative visual.
 *
 * **VITA respects the device's text-size setting** — nothing in this app
 * passes `allowFontScaling={false}`, and nothing here starts. But a fixed
 * footprint and growing text eventually collide, and 5.3C already shipped that
 * collision once. Past this multiplier the square switches to a compact
 * presentation: the vessel and the calorie bar step aside and their space goes
 * to the words.
 *
 * Both are already `accessibilityElementsHidden` — they encode only what the
 * text states outright — so nothing is lost that a screen reader ever had.
 * **No data is abbreviated away**: the figures and their spoken labels are
 * identical at every text size.
 */
export const COMPACT_FONT_SCALE = 1.25;

export function isCompactSquare(fontScale: number): boolean {
  return fontScale >= COMPACT_FONT_SCALE;
}

/**
 * The shared square footprint at a given system text scale.
 *
 * **Both bounds, so the grid holds still.** 5.6B.2 removed the ceiling from
 * Fuel's own square after it clipped `fl oz` off `24.3 fl oz` at accessibility
 * sizes — but the cap was never the cause. Fuel's base was 168 where this is
 * 208, and the stack simply does not fit in the smaller box; at 208, with the
 * vessel standing aside past `COMPACT_FONT_SCALE`, it does. Fuel adopting
 * Home's footprint fixes the clipping *and* makes the two screens identical,
 * which is the whole point of a shared module.
 *
 * Damped rather than proportional: at the same point the text demands more
 * room, `isCompactSquare` hands back the vessel's space, so following the
 * scale exactly would leave the square half empty.
 */
export function squareHeight(fontScale: number): number {
  const scale = Math.min(Math.max(fontScale, 1), 2);
  return Math.round(SQUARE_HEIGHT * (1 + (scale - 1) * 0.6));
}

/**
 * The type scale a compact module draws with.
 *
 * The same numbers Home's `TYPE` carries for these roles, in the file the
 * modules themselves live in — so a change here reaches Home and Fuel in one
 * edit, and neither can be adjusted without the other. Home's `TYPE` keeps the
 * roles belonging to its header, Quick Tools and Today's Schedule, which are
 * not shared with anything.
 */
export const MODULE_TYPE = {
  /** `Water`, `Peptides` on a widget. */
  label: 12.5,
  /** `No routines`, `4 scheduled` — the square's headline. */
  squareValue: 20,
  /** Water's square headline, which sits under the vessel rather than alone. */
  squareValueSmall: 17,
  /** `Goal reached`, `4 today`, a routine name and amount. */
  support: 14.5,
  /** The value line on a wide module. */
  wideValue: 17,
  /** `Add`, `View`. */
  actionLabel: 14.5,
} as const;
