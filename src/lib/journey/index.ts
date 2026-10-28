/**
 * Journey / Weight — the single source of truth for recorded body weight
 * (slice 6.2). Canonical kilograms; the lb/kg display unit is Journey's own.
 * No goal, no BMI, no trend storage, no recommendations.
 */

export {
  DEFAULT_WEIGHT_PREFERENCES,
  DEFAULT_WEIGHT_UNIT,
  WEIGHT_UNITS,
  type WeightEntry,
  type WeightPreferences,
  type WeightUnit,
} from './model/types';

export {
  KG_PER_LB,
  formatWeight,
  fromKg,
  isValidWeight,
  isWeightUnit,
  parseWeight,
  roundForDisplay,
  toKg,
} from './model/units';

export {
  addWeightEntry,
  createWeightEntry,
  MAX_FUTURE_SKEW_MS,
  isLoggableTime,
  latestEntry,
  removeWeightEntry,
  sortNewestFirst,
  updateWeightEntry,
  type CreateWeightEntryInput,
  type WeightEntryChanges,
} from './model/entries';

export type { WeightRepository } from './data/WeightRepository';
export { asyncStorageWeightRepository } from './data/asyncStorageRepository';
export { JOURNEY_DOMAIN, JourneyKeys } from './data/keys';
export { WeightProvider, useWeight, type WeightContextValue, type WeightState } from './state/WeightProvider';
