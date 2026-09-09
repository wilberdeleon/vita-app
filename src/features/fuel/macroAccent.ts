import type { MacroKey } from '../../lib/nutrition';

/**
 * Fuel's macro colour language — **category identity, and nothing else.**
 *
 * ## What these colours mean
 *
 * Protein is one thing, carbohydrate is another, fat is a third. That is the
 * entire semantic content. They do **not** mean good or bad, high or low, over
 * or under, healthy or unhealthy, or recommended or not. VITA has no opinion
 * about anyone's macro split and no target for carbs or fat to be measured
 * against, so there is nothing here for a colour to grade.
 *
 * ## Why the palette's own macro tokens are not used
 *
 * `palette.protein`, `palette.carbs` and `palette.fat` are green, amber and
 * red. Side by side those three are a traffic light — the reading that got the
 * composition bar built and deleted in 5.6B, and that put a green bar under
 * protein until 5.6B.3 removed it. **Green in particular cannot appear here**:
 * green says *good*, which is a verdict.
 *
 * The palette tokens are left alone rather than changed, because they are also
 * used by Food Detail, Manual Entry and the entry rows — surfaces 5.6D owns
 * and this slice must not touch. This file is Fuel Home's own choice, the way
 * `mealAccent` is.
 *
 * ## Why each hue
 *
 * - **Protein — muted violet.** Founder direction. Deliberately the pale,
 *   flattened violet Home already uses for dusk rather than
 *   `palette.peptide`'s deep `#7C3AED`: the Peptides module sits a few hundred
 *   pixels below this row, and a saturated purple label would read as a
 *   peptide reference. Same reasoning Home's `DAYPART_ACCENT` records for the
 *   same conflict.
 * - **Carbs — amber.** Warm, and distinct from Fuel's own `#F2670F`, which is
 *   a red-orange: the calorie figure above must not look like a fourth macro.
 * - **Fat — steel blue.** Cool, and desaturated well away from Water's
 *   `#2F80ED` so the row does not borrow another feature's colour. Blue here
 *   means *the cool one of the three*; it does not mean healthier.
 *
 * ## Each scheme gets its own value
 *
 * Not one colour that "works in both". Three prior bugs in this codebase came
 * from a single hex inverting its own hierarchy across themes — the pale
 * progress track that read as complete on black, `BodyMap`'s zone that
 * vanished in light, and the gold quote washing out on cream. Dark takes the
 * light, airy value; light takes it deepened enough to read on the cream page.
 *
 * **The accent never touches the value.** The figure itself stays neutral and
 * high-contrast in both themes — the colour is on the small label above it and
 * on protein's rail, which is as far as identity is allowed to go before it
 * starts looking like a status.
 */

type AccentPair = { dark: string; light: string };

const ACCENTS: Record<MacroKey, AccentPair> = {
  protein: { dark: '#A88BD9', light: '#5E4A96' },
  carbs: { dark: '#F5A623', light: '#A96A05' },
  fat: { dark: '#7FA6C4', light: '#3F6485' },
};

export function macroAccent(key: MacroKey, scheme: 'light' | 'dark'): string {
  return ACCENTS[key][scheme];
}
