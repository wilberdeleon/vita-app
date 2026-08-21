/**
 * Fuel's meal color language — the warm progression of a day.
 *
 * Breakfast reads as sunrise yellow, Lunch as midday orange, Dinner as a
 * deeper sunset red-orange. Snacks deliberately breaks the sequence: a snack
 * happens at any hour, so it carries no time-of-day signal at all — no moon,
 * no dusk color, a plain utensils glyph on the brand's neutral sage.
 *
 * Sage rather than the concept reference's purple. Purple is a *locked*
 * domain color in VITA (Atlas and peptides, Sprint 0.1), and the Peptides
 * module sits a few hundred pixels below this list — a purple Snacks row
 * would read as a peptide entry. Every value below is an existing brand or
 * macro token; no new hex was invented for this screen.
 *
 * Lives in `features/fuel/` rather than `lib/nutrition/` because it is a
 * presentation choice specific to this screen. Home's meal rows keep their
 * own approved icon set in `features/dashboard/components/MealRow.tsx` and
 * are deliberately NOT unified with these — Home's visual design is locked.
 *
 * Ionicons carries no literal sunrise or sunset glyph, so Breakfast and
 * Dinner use the closest stock equivalents tinted warm — flagged rather than
 * silently approximated, same as Home did.
 */

import type { Ionicons } from '@expo/vector-icons';
import type { MealSlot } from '../../lib/nutrition';
import { palette } from '../../theme/tokens';

export type MealAccent = {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const ACCENTS: Record<MealSlot, MealAccent> = {
  Breakfast: { icon: 'partly-sunny-outline', color: palette.carbs },
  Lunch: { icon: 'sunny-outline', color: palette.primary },
  Dinner: { icon: 'sunny', color: palette.fat },
  Snacks: { icon: 'restaurant-outline', color: palette.sage },
};

export function mealAccent(slot: MealSlot): MealAccent {
  return ACCENTS[slot];
}
