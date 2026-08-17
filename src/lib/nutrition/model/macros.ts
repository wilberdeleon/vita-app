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

import type { NutritionFacts, NutritionTargets } from './types';

export type MacroKey = Extract<keyof NutritionFacts & keyof NutritionTargets, 'protein' | 'carbs' | 'fat'>;

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
