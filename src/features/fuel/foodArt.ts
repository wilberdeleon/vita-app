/**
 * The VITA food illustration set.
 *
 * Hand-drawn vector shapes on a 24×24 grid, stroked in a single color so a
 * food reads correctly in Light and Dark mode without a second asset. Drawn
 * here rather than pulled from an icon font because the font could not say
 * what these need to say: Ionicons has no banana, no taco, and no burrito,
 * and its one general food glyph is a **burger and a drink** — so every
 * unclassified food in VITA was confidently drawn as a burger, and every
 * banana as an apple. A wrong picture is worse than no picture.
 *
 * Rendered with `react-native-svg`, already a dependency (the Journey charts
 * and the calorie ring use it). No new package, no image assets, no raster
 * files to scale.
 *
 * ── Scope ───────────────────────────────────────────────────────────────
 * Fourteen shapes, chosen for coverage rather than completeness: the ones
 * the founders named plus the few that let several categories share a
 * *correct* picture (a bowl legitimately serves oatmeal, pasta, rice, and
 * salad). Categories with no honest match point at `utensils`, the neutral
 * generic. That is the governing rule — **generic is preferable to wrong** —
 * and it is why this file stays small instead of trying to draw everything.
 *
 * ── Style ───────────────────────────────────────────────────────────────
 * Outline only, uniform stroke, round caps and joins, no fill, nothing
 * below ~3 or above ~21 on either axis so every shape occupies the same
 * optical weight in a row of mixed foods.
 */

export type ArtKey =
  | 'banana'
  | 'apple'
  | 'egg'
  | 'burger'
  | 'pizza'
  | 'taco'
  | 'burrito'
  | 'chips'
  | 'bottle'
  | 'coffee'
  | 'drumstick'
  | 'bread'
  | 'bowl'
  | 'utensils';

export type ArtShape =
  | { path: string }
  | { circle: { cx: number; cy: number; r: number } };

export const ART_VIEWBOX = 24;

export const FOOD_ART: Record<ArtKey, ArtShape[]> = {
  // A crescent, tapering to a stem — the one silhouette that cannot be
  // mistaken for any other fruit.
  banana: [
    {
      path:
        'M8 3.6 C8 10.8, 12 16.6, 19.1 17.2 ' +
        'C20.2 17.3, 20.7 15.8, 19.7 15.3 ' +
        'C13.8 13.4, 11 9.4, 10.9 3.6 Z',
    },
    { path: 'M8 3.6 L10.9 3.6' },
  ],

  apple: [
    {
      path:
        'M12 8.4 C10.7 7, 7.3 6.8, 6 9.6 ' +
        'C4.7 12.4, 6.3 18.2, 8.8 19.1 ' +
        'C10.1 19.6, 11.1 18.9, 12 18.9 ' +
        'C12.9 18.9, 13.9 19.6, 15.2 19.1 ' +
        'C17.7 18.2, 19.3 12.4, 18 9.6 ' +
        'C16.7 6.8, 13.3 7, 12 8.4 Z',
    },
    { path: 'M12 8.4 C12 6.6, 12.5 5.2, 13.7 4.4' },
    { path: 'M13.4 5.8 C14.7 4.6, 16.5 4.8, 17.1 5.4 C16.7 6.8, 14.9 7.2, 13.7 6.5' },
  ],

  egg: [
    {
      path:
        'M12 3.6 C15.5 3.6, 18.3 8.9, 18.3 13 ' +
        'C18.3 16.9, 15.5 20.1, 12 20.1 ' +
        'C8.5 20.1, 5.7 16.9, 5.7 13 ' +
        'C5.7 8.9, 8.5 3.6, 12 3.6 Z',
    },
  ],

  // Dome, filling, base — stacked, which is what makes a burger a burger.
  burger: [
    { path: 'M4 10.6 C4 7, 7.6 4.4, 12 4.4 C16.4 4.4, 20 7, 20 10.6 Z' },
    { path: 'M4.2 13.4 C6 12.2, 7.8 14.2, 9.8 13.2 C11.8 12.2, 13.6 14.2, 15.6 13.3 C17.2 12.6, 18.6 13.4, 19.8 13.4' },
    { path: 'M4.4 16.2 H19.6 C19.6 18.4, 17.2 19.8, 12 19.8 C6.8 19.8, 4.4 18.4, 4.4 16.2 Z' },
  ],

  pizza: [
    { path: 'M12 3.6 L20.2 18.4 C17.6 20, 6.4 20, 3.8 18.4 Z' },
    { circle: { cx: 10.2, cy: 12.2, r: 1.05 } },
    { circle: { cx: 14, cy: 14.4, r: 1.05 } },
    { circle: { cx: 11.4, cy: 16.8, r: 1.05 } },
  ],

  // Flat side up, curved shell below, filling mounded over the opening.
  taco: [
    { path: 'M3.6 9.6 H20.4 C20.4 15.6, 16.7 20.4, 12 20.4 C7.3 20.4, 3.6 15.6, 3.6 9.6 Z' },
    // The filling deliberately overhangs both rims. Contained inside the
    // shell it read as a lid, and the whole shape became a second bowl.
    { path: 'M2.9 9.6 C4.2 6.7, 6.7 9, 8.5 7.3 C10.3 5.7, 12.5 8.4, 14.5 6.9 C16.3 5.6, 18.7 7.1, 21.1 9.6' },
  ],

  // A rolled, tucked cylinder on the diagonal, with two fold creases.
  burrito: [
    {
      path:
        'M5.9 18.1 C4.6 16.8, 4.6 14.7, 5.9 13.4 ' +
        'L13.4 5.9 C14.7 4.6, 16.8 4.6, 18.1 5.9 ' +
        'C19.4 7.2, 19.4 9.3, 18.1 10.6 ' +
        'L10.6 18.1 C9.3 19.4, 7.2 19.4, 5.9 18.1 Z',
    },
    // A single crease near the top end plus a tucked fold across the
    // bottom cap. Two symmetrical creases read as a plaster.
    { path: 'M13.4 8 L16 10.6' },
    { path: 'M6.6 17.4 C7.9 16.1, 9.1 16.1, 10.4 17.4' },
  ],

  // A crimped bag, not a crisp — the container is the recognizable part.
  chips: [
    { path: 'M6.8 8 L17.2 8 L18.4 19.1 C18.5 20, 17.9 20.7, 17 20.7 L7 20.7 C6.1 20.7, 5.5 20, 5.6 19.1 Z' },
    { path: 'M6.2 8 L8.2 5.2 L10.7 8 L13.3 5.2 L15.8 8 L17.8 5.2' },
  ],

  bottle: [
    { path: 'M10.2 3.2 H13.8 V5.6 H10.2 Z' },
    {
      path:
        'M10.2 5.6 V7.2 C10.2 8.2, 8.4 8.8, 8.4 10.6 ' +
        'V18.8 C8.4 20.1, 9.4 21, 10.6 21 ' +
        'H13.4 C14.6 21, 15.6 20.1, 15.6 18.8 ' +
        'V10.6 C15.6 8.8, 13.8 8.2, 13.8 7.2 V5.6',
    },
    { path: 'M8.4 13.2 H15.6' },
  ],

  coffee: [
    { path: 'M4.9 8.6 H16.3 V15 C16.3 17.8, 14 20.1, 11.2 20.1 H10 C7.2 20.1, 4.9 17.8, 4.9 15 Z' },
    { path: 'M16.3 10.4 H18.2 C19.7 10.4, 20.9 11.6, 20.9 13.1 C20.9 14.6, 19.7 15.8, 18.2 15.8 H16.3' },
    { path: 'M8.6 3.4 C8.6 4.5, 9.6 4.9, 9.6 6' },
    { path: 'M12.4 3.4 C12.4 4.5, 13.4 4.9, 13.4 6' },
  ],

  drumstick: [
    // Meat large and tilted so it tapers into the bone. A small round blob
    // on a long stick read as a rattle.
    {
      path:
        'M12.6 4.9 C15.7 2.7, 20 3.9, 20.9 7.5 ' +
        'C21.8 11.1, 19.1 14.4, 15.4 14.4 ' +
        'C13 14.4, 10.9 12.7, 10.5 10.3 ' +
        'C10.2 8.3, 11 6.2, 12.6 4.9 Z',
    },
    { path: 'M11.4 12.5 L9.9 14' },
    // One continuous knuckle rather than two circles on a stick.
    {
      path:
        'M9.9 14 C8.9 13.3, 7.5 13.6, 7 14.7 ' +
        'C6.5 15.8, 7.3 17, 8.5 16.9 ' +
        'C8.4 18.1, 9.5 19, 10.6 18.5 ' +
        'C11.7 18, 12 16.6, 11.2 15.6',
    },
  ],

  bread: [
    {
      path:
        'M4.6 18.6 V12.5 C4.6 8.7, 7.9 5.8, 12 5.8 ' +
        'C16.1 5.8, 19.4 8.7, 19.4 12.5 V18.6 ' +
        'C19.4 19.5, 18.7 20.2, 17.8 20.2 H6.2 ' +
        'C5.3 20.2, 4.6 19.5, 4.6 18.6 Z',
    },
    { path: 'M9.2 8.2 C9.8 9.6, 9.8 10.9, 9.2 12.3' },
    { path: 'M14.8 8.2 C15.4 9.6, 15.4 10.9, 14.8 12.3' },
  ],

  bowl: [
    { path: 'M3.6 10.8 A8.4 2.7 0 1 1 20.4 10.8 A8.4 2.7 0 1 1 3.6 10.8 Z' },
    { path: 'M3.6 11.2 C3.9 16.3, 7.5 20.3, 12 20.3 C16.5 20.3, 20.1 16.3, 20.4 11.2' },
  ],

  /**
   * The generic. A fork and knife say "food, unspecified" and cannot be
   * mistaken for a particular dish — which is the entire requirement for a
   * fallback, and exactly what the previous burger glyph failed.
   */
  utensils: [
    { path: 'M6.2 3.4 V8.6 C6.2 10.1, 7.3 11.3, 8.7 11.5 V20.6' },
    { path: 'M8.7 3.4 V8.6' },
    { path: 'M11.2 3.4 V8.6 C11.2 10.1, 10.1 11.3, 8.7 11.5' },
    { path: 'M16.6 20.6 V13.2 C15.3 12.7, 14.6 11.2, 14.6 9 C14.6 5.9, 15.7 3.4, 17.4 3.4 C19.1 3.4, 20.2 5.9, 20.2 9 C20.2 11.2, 19.5 12.7, 18.2 13.2 V20.6' },
  ],
};
