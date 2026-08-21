/**
 * VITA's shared nutrition domain — the single source of truth for food
 * entries, daily totals, and nutrition targets.
 *
 * Both `features/fuel` and `features/dashboard` import from here. Neither
 * imports the other (CLAUDE.md rule 4).
 */

export {
  CORE_NUTRIENTS,
  DEFAULT_TARGETS,
  MEAL_SLOTS,
  OPTIONAL_NUTRIENTS,
  type CoreNutrient,
  type FoodEntry,
  type FoodSource,
  type MealSlot,
  type NutritionFacts,
  type NutritionTargets,
  type OptionalNutrient,
  type ServingOption,
  type VitaFood,
} from './model/types';

export {
  formatLogDateLong,
  fromLogDate,
  isToday,
  isValidLogDate,
  toLogDate,
  todayLogDate,
  type LogDate,
} from './model/dates';

export { defaultMealForTime, parseMealSlot } from './model/mealSlots';

export { MACROS, type MacroDescriptor, type MacroKey } from './model/macros';

export {
  formatAmount,
  formatCalories,
  formatMacros,
  formatPortion,
  formatQuantity,
} from './model/format';

export {
  createCustomFood,
  createEntry,
  editableServings,
  entryServingLabel,
  foodFromEntry,
  newId,
  servingFromEntry,
  servingLabel,
  type CreateEntryInput,
  type CustomFoodInput,
} from './model/foods';

export {
  PERSISTABLE_SOURCES,
  canPersistDefinition,
  toFavorite,
  type FavoriteFood,
} from './model/favorites';

export {
  EMPTY_NUTRITION,
  addNutrition,
  dailyTotals,
  groupByMeal,
  nutritionForServing,
  over,
  percent,
  progress,
  ratio,
  remaining,
  roundForDisplay,
  scaleNutrition,
  sumEntries,
  summarizeMeals,
  type DailyTotals,
  type MealSummary,
} from './model/nutrition';

export type {
  CustomFoodRepository,
  FoodLogRepository,
  NutritionRepository,
} from './data/FoodLogRepository';
export { asyncStorageNutritionRepository } from './data/asyncStorageRepository';

export { gtinEquals, isValidGtin, normalizeGtin, type Gtin } from './providers/gtin';
export { beginBarcodeTrace, traceBarcode } from './providers/trace';
export { ProviderError, type FoodProvider, type ProviderErrorKind } from './providers/types';
export {
  PROVIDERS,
  configuredProviders,
  lookupBarcodeAcrossProviders,
  searchAllProviders,
  type AggregatedSearch,
  type BarcodeLookup,
  type ProviderOutcome,
} from './providers/registry';
export { dedupeFoods, normalizeName, type MergedFood } from './search/dedupe';
export { rankFoods, scoreFood, type ScoredFood } from './search/rank';
export { readCachedFood, readCachedFoodSync, rememberFoods } from './search/cache';
export { MIN_QUERY_LENGTH, useFoodSearch, type FoodSearchState, type FoodSearchStatus } from './state/useFoodSearch';

export { NutritionProvider, useNutrition } from './state/NutritionProvider';
export { useDailyNutrition, type DailyNutrition } from './state/useDailyNutrition';
export {
  RECENT_LIMIT,
  RECENT_MAX_DAYS,
  collapseToRecents,
  useRecentFoods,
  type RecentFood,
} from './state/useRecentFoods';
