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
  fromLogDate,
  isToday,
  isValidLogDate,
  toLogDate,
  todayLogDate,
  type LogDate,
} from './model/dates';

export { defaultMealForTime, mealSlotIcon } from './model/mealSlots';

export { MACROS, type MacroDescriptor, type MacroKey } from './model/macros';

export {
  formatAmount,
  formatCalories,
  formatMacros,
  formatQuantity,
  formatServingCount,
  pluralizeUnit,
} from './model/format';

export {
  createCustomFood,
  createEntry,
  entryServingLabel,
  newId,
  servingLabel,
  type CreateEntryInput,
  type CustomFoodInput,
} from './model/foods';

export {
  EMPTY_NUTRITION,
  addNutrition,
  dailyTotals,
  groupByMeal,
  nutritionForServing,
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

export { NutritionProvider, useNutrition } from './state/NutritionProvider';
export { useDailyNutrition, type DailyNutrition } from './state/useDailyNutrition';
