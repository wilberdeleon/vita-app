/**
 * The three macros VITA tracks, in display order.
 *
 * Defined once so Fuel and Home iterate the same list rather than each
 * hardcoding protein/carbs/fat — which is how the two screens ended up
 * with independent macro fixtures in the first place.
 *
 * No colors here on purpose: this module stays theme-free, matching
 * `src/lib/journeyStages.ts`. The keys are chosen to match the color token
 * names, so a consumer resolves the color with `palette[macro.key]`.
 */

import type { NutritionFacts } from './types';

/**
 * What VITA *tracks*, which is not the same as what can have a goal.
 *
 * This was the intersection of `NutritionFacts` and `NutritionTargets`,
 * which only held while every macro had a target. Since 5.6A.1 only protein
 * can, and carbs and fat are totals — so the two ideas are decoupled here
 * rather than left to collapse the list to one entry.
 */
export type MacroKey = Extract<keyof NutritionFacts, 'protein' | 'carbs' | 'fat'>;

/** Whether a macro is something the user can set a goal for. Only protein is. */
export function macroHasGoal(key: MacroKey): key is 'protein' {
  return key === 'protein';
}

export type MacroDescriptor = {
  key: MacroKey;
  label: string;
  unit: string;
};

export const MACROS: readonly MacroDescriptor[] = [
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
];
