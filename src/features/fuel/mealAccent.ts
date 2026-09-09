/**
 * Fuel's meal colour language — **the time of day, and nothing else.**
 *
 * Breakfast is sunrise, Lunch is midday, Dinner is night. Snacks deliberately
 * breaks the sequence: a snack happens at any hour, so it carries no
 * time-of-day signal — a plain utensils glyph on the brand's neutral sage.
 *
 * ## What these colours do not mean
 *
 * Nothing about the food. A meal accent is not a macro accent (see
 * `macroAccent`) and neither is a verdict: Dinner's dusk rose says *evening*,
 * not *bad*, and the row's rose tint says nothing whatever about what was
 * eaten. The two languages are kept apart on purpose, and the foods inside an
 * expanded meal stay neutral so the tint never appears to grade an item.
 *
 * ## Why these hues
 *
 * - **Breakfast — brand gold**, warmed by sunrise. Not `palette.carbs`, which
 *   is now the carbohydrate accent one section above: the same amber in both
 *   places would tie the two languages together, which is exactly what §29
 *   forbids.
 * - **Lunch — Fuel orange.** Midday, and the feature's own colour.
 * - **Dinner — a dusk rose.** Founder direction, 5.6B.4: a **moon**, and a
 *   restrained rose rather than the `palette.fat` red this used to carry. Red
 *   in VITA means an error, and a red Dinner row read as one.
 * - **Snacks — sage.** The brand's neutral olive. Not purple: purple is a
 *   locked domain colour (Atlas, Peptides, Sprint 0.1), and the Peptides
 *   module sits a few hundred pixels below this list.
 *
 * ## Each scheme gets its own value
 *
 * Gold on cream is the exact contrast failure the 5.3C quote hit — brand gold
 * reads at roughly 1.7:1 on the light page. Every accent below therefore
 * carries a deepened light-mode counterpart, the same fix `QUOTE_GOLD` uses.
 *
 * Lives in `features/fuel/` rather than `lib/nutrition/` because it is a
 * presentation choice specific to this screen. Home's meal rows keep their own
 * approved icon set and are deliberately NOT unified with these — Home's
 * visual design is locked.
 *
 * Ionicons carries no literal sunrise glyph, so Breakfast uses the closest
 * stock equivalent tinted warm — flagged rather than silently approximated.
 */

import type { Ionicons } from '@expo/vector-icons';
import type { MealSlot } from '../../lib/nutrition';
import { palette } from '../../theme/tokens';

export type MealAccent = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

type AccentSource = {
  icon: keyof typeof Ionicons.glyphMap;
  dark: string;
  light: string;
};

const ACCENTS: Record<MealSlot, AccentSource> = {
  Breakfast: { icon: 'partly-sunny-outline', dark: palette.gold, light: '#8A6A2C' },
  Lunch: { icon: 'sunny-outline', dark: palette.primary, light: '#C4540C' },
  Dinner: { icon: 'moon-outline', dark: '#D68FA5', light: '#8E4B63' },
  Snacks: { icon: 'restaurant-outline', dark: palette.sage, light: '#5C6350' },
};

export function mealAccent(slot: MealSlot, scheme: 'light' | 'dark' = 'dark'): MealAccent {
  const source = ACCENTS[slot];
  return { icon: source.icon, color: scheme === 'dark' ? source.dark : source.light };
}
