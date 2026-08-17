/**
 * AsyncStorage implementation of `FoodLogRepository`.
 *
 * Everything read back is validated before use. Persisted JSON is only as
 * trustworthy as the last write — a half-finished write, a hand-edited dev
 * build, or data from an older entry shape would otherwise surface as
 * `NaN` calories propagating silently into the day's totals. A malformed
 * record is dropped rather than repaired, because a guessed value in a food
 * log is worse than a missing one.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidLogDate, type LogDate } from '../model/dates';
import {
  MEAL_SLOTS,
  OPTIONAL_NUTRIENTS,
  type FoodEntry,
  type MealSlot,
  type NutritionFacts,
  type NutritionTargets,
  type ServingOption,
  type VitaFood,
} from '../model/types';
import type { NutritionRepository } from './FoodLogRepository';
import { StorageKeys } from './keys';

/* ── validation ─────────────────────────────────────────────────────── */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Rejects NaN and Infinity, which `typeof === 'number'` alone lets through. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function parseNutrition(value: unknown): NutritionFacts | null {
  if (!isRecord(value)) return null;
  if (
    !isFiniteNumber(value.calories) ||
    !isFiniteNumber(value.protein) ||
    !isFiniteNumber(value.carbs) ||
    !isFiniteNumber(value.fat)
  ) {
    return null;
  }

  const nutrition: NutritionFacts = {
    calories: value.calories,
    protein: value.protein,
    carbs: value.carbs,
    fat: value.fat,
  };

  // Optional nutrients survive only if they're valid numbers; a corrupted
  // one is dropped rather than zeroed, preserving "unknown" as distinct
  // from "none".
  for (const key of OPTIONAL_NUTRIENTS) {
    const optional = value[key];
    if (isFiniteNumber(optional)) nutrition[key] = optional;
  }

  return nutrition;
}

function isMealSlot(value: unknown): value is MealSlot {
  return typeof value === 'string' && (MEAL_SLOTS as readonly string[]).includes(value);
}

function parseEntry(value: unknown): FoodEntry | null {
  if (!isRecord(value)) return null;

  const { id, logDate, loggedAt, meal, foodRef, name, brand, serving } = value;

  if (!isNonEmptyString(id) || !isValidLogDate(logDate) || !isNonEmptyString(loggedAt)) return null;
  if (!isMealSlot(meal) || !isNonEmptyString(name)) return null;

  if (!isRecord(foodRef) || !isNonEmptyString(foodRef.source) || !isNonEmptyString(foodRef.vitaFoodId)) {
    return null;
  }

  if (!isRecord(serving) || !isNonEmptyString(serving.label) || !isFiniteNumber(serving.quantity)) return null;
  if (!isNonEmptyString(serving.unit)) return null;

  const nutrition = parseNutrition(value.nutrition);
  if (!nutrition) return null;

  return {
    id,
    logDate,
    loggedAt,
    meal,
    foodRef: {
      source: foodRef.source as FoodEntry['foodRef']['source'],
      sourceId: typeof foodRef.sourceId === 'string' ? foodRef.sourceId : '',
      vitaFoodId: foodRef.vitaFoodId,
    },
    name,
    ...(isNonEmptyString(brand) ? { brand } : {}),
    serving: {
      label: serving.label,
      quantity: serving.quantity,
      unit: serving.unit,
      ...(isFiniteNumber(serving.gramWeight) ? { gramWeight: serving.gramWeight } : {}),
    },
    nutrition,
  };
}

function parseServing(value: unknown): ServingOption | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.label) || !isFiniteNumber(value.quantity) || !isNonEmptyString(value.unit)) {
    return null;
  }
  const nutrition = parseNutrition(value.nutrition);
  if (!nutrition) return null;

  return {
    label: value.label,
    quantity: value.quantity,
    unit: value.unit,
    ...(isFiniteNumber(value.gramWeight) ? { gramWeight: value.gramWeight } : {}),
    nutrition,
  };
}

function parseCustomFood(value: unknown): VitaFood | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.vitaId) || !isNonEmptyString(value.sourceId) || !isNonEmptyString(value.name)) {
    return null;
  }
  if (!Array.isArray(value.servings)) return null;

  const servings: ServingOption[] = [];
  for (const candidate of value.servings) {
    const serving = parseServing(candidate);
    if (serving) servings.push(serving);
  }
  // A food with no usable serving cannot be logged, so it is not a food.
  if (servings.length === 0) return null;

  const defaultIndex = isFiniteNumber(value.defaultServingIndex) ? value.defaultServingIndex : 0;

  return {
    vitaId: value.vitaId,
    source: 'vita-custom',
    sourceId: value.sourceId,
    name: value.name,
    ...(isNonEmptyString(value.brand) ? { brand: value.brand } : {}),
    ...(isNonEmptyString(value.barcode) ? { barcode: value.barcode } : {}),
    servings,
    defaultServingIndex: defaultIndex >= 0 && defaultIndex < servings.length ? defaultIndex : 0,
    isCustom: true,
    fetchedAt: isNonEmptyString(value.fetchedAt) ? value.fetchedAt : new Date(0).toISOString(),
  };
}

function parseTargets(value: unknown): NutritionTargets | null {
  if (!isRecord(value)) return null;
  if (
    !isFiniteNumber(value.calories) ||
    !isFiniteNumber(value.protein) ||
    !isFiniteNumber(value.carbs) ||
    !isFiniteNumber(value.fat)
  ) {
    return null;
  }
  return {
    calories: value.calories,
    protein: value.protein,
    carbs: value.carbs,
    fat: value.fat,
  };
}

/* ── storage helpers ────────────────────────────────────────────────── */

async function readJson(key: string): Promise<unknown> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    // Unparseable JSON means a torn or corrupted write. Treated as absent —
    // the alternative is throwing on app launch and blocking the whole log.
    return null;
  }
}

/* ── implementation ─────────────────────────────────────────────────── */

export const asyncStorageNutritionRepository: NutritionRepository = {
  async getEntries(logDate: LogDate): Promise<FoodEntry[]> {
    const parsed = await readJson(StorageKeys.foodLog(logDate));
    if (!Array.isArray(parsed)) return [];

    const entries: FoodEntry[] = [];
    for (const candidate of parsed) {
      const entry = parseEntry(candidate);
      // A stored entry whose logDate contradicts its key belongs to another
      // day; keeping it here would double-count it once that day is opened.
      if (entry && entry.logDate === logDate) entries.push(entry);
    }
    return entries;
  },

  async saveEntries(logDate: LogDate, entries: FoodEntry[]): Promise<void> {
    const key = StorageKeys.foodLog(logDate);
    if (entries.length === 0) {
      // Empty days are removed rather than stored as `[]`, so clearing a day
      // leaves no residue and a future history view can treat key presence
      // as "this day has something in it".
      await AsyncStorage.removeItem(key);
      return;
    }
    await AsyncStorage.setItem(key, JSON.stringify(entries));
  },

  async getTargets(): Promise<NutritionTargets | null> {
    return parseTargets(await readJson(StorageKeys.targets));
  },

  async saveTargets(targets: NutritionTargets): Promise<void> {
    await AsyncStorage.setItem(StorageKeys.targets, JSON.stringify(targets));
  },

  async getCustomFoods(): Promise<VitaFood[]> {
    const parsed = await readJson(StorageKeys.myFoods);
    if (!Array.isArray(parsed)) return [];

    const foods: VitaFood[] = [];
    for (const candidate of parsed) {
      const food = parseCustomFood(candidate);
      if (food) foods.push(food);
    }
    return foods;
  },

  async saveCustomFoods(foods: VitaFood[]): Promise<void> {
    if (foods.length === 0) {
      await AsyncStorage.removeItem(StorageKeys.myFoods);
      return;
    }
    await AsyncStorage.setItem(StorageKeys.myFoods, JSON.stringify(foods));
  },
};
