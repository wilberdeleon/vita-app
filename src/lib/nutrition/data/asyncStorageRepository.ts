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
} from '../model/types';
import type { FoodLogRepository } from './FoodLogRepository';
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

export const asyncStorageFoodLogRepository: FoodLogRepository = {
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
};
