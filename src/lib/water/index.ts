/**
 * VITA's shared hydration domain — the single source of truth for water
 * entries, the daily total, and the user's goal.
 *
 * Both the Water screen and Fuel's Hydration module import from here.
 * Neither imports the other (CLAUDE.md rule 4).
 */

export {
  DEFAULT_VOLUME_UNIT,
  DEFAULT_WATER_PREFERENCES,
  VOLUME_UNITS,
  type VolumeUnit,
  type WaterEntry,
  type WaterGoal,
  type WaterPreferences,
} from './model/types';

export {
  FLOZ_PER_CUP,
  ML_PER_CUP,
  ML_PER_FLOZ,
  ML_PER_L,
  formatAmount,
  formatEntered,
  formatVolume,
  fromMl,
  isVolumeUnit,
  parseAmount,
  roundForDisplay,
  toMl,
  unitLabel,
  unitName,
} from './model/units';

export {
  goalMl,
  isGoalMet,
  overMl,
  percent,
  progress,
  ratio,
  remainingMl,
  sortByLoggedAt,
  totalMl,
} from './model/totals';

export { createWaterEntry, type CreateWaterEntryInput } from './model/entries';

export type { WaterRepository } from './data/WaterRepository';
export { asyncStorageWaterRepository } from './data/asyncStorageRepository';
export { WATER_DOMAIN, WaterKeys } from './data/keys';

export { WaterProvider, useWater, type WaterContextValue } from './state/WaterProvider';
export { useWaterToday, type WaterToday } from './state/useWaterToday';
