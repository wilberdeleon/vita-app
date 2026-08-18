/**
 * Merging the same food returned by more than one provider.
 *
 * The goal is a single clean list, not four rows reading "Banana". But the
 * opposite failure is worse: collapsing a 12 oz can into a 20 oz bottle
 * hides a real choice and silently logs the wrong calories. So every pass
 * here errs toward keeping products separate unless the evidence is strong.
 */

import { normalizeGtin } from '../providers/gtin';
import type { VitaFood } from '../model/types';

/** A merged result, keeping every source it was seen in. */
export type MergedFood = VitaFood & {
  /** Other providers that returned the same food, for provenance and ranking. */
  alternateSources: VitaFood[];
};

/** Lowercase, strip punctuation, collapse whitespace, drop packaging noise. */
export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b\d+\s?(oz|g|kg|ml|l|lb|ct|pack|pk)\b/g, ' ')
    .replace(/\bpack of \d+\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function brandKey(food: VitaFood): string {
  return normalizeName(food.brand ?? '');
}

/** Token-set overlap (Jaccard). Order-insensitive, so "oats protein" matches "protein oats". */
function similarity(a: string, b: string): number {
  const left = new Set(a.split(' ').filter(Boolean));
  const right = new Set(b.split(' ').filter(Boolean));
  if (left.size === 0 || right.size === 0) return 0;

  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / (left.size + right.size - shared);
}

function calories(food: VitaFood): number {
  const serving = food.servings[food.defaultServingIndex] ?? food.servings[0];
  return serving?.nutrition.calories ?? 0;
}

/** Within 5% — close enough that two entries are the same food measured twice. */
function caloriesAgree(a: VitaFood, b: VitaFood): boolean {
  const left = calories(a);
  const right = calories(b);
  if (left === 0 && right === 0) return true;
  const larger = Math.max(left, right);
  return larger > 0 && Math.abs(left - right) / larger <= 0.05;
}

const NEAR_DUPLICATE_SIMILARITY = 0.9;

function merge(primary: VitaFood, duplicate: VitaFood): MergedFood {
  const existing = (primary as MergedFood).alternateSources ?? [];
  return {
    ...primary,
    // Fill gaps from the duplicate rather than discarding what it knew —
    // Open Food Facts often carries an image USDA lacks, and vice versa
    // for a barcode.
    ...(primary.imageUrl ? {} : duplicate.imageUrl ? { imageUrl: duplicate.imageUrl } : {}),
    ...(primary.barcode ? {} : duplicate.barcode ? { barcode: duplicate.barcode } : {}),
    ...(primary.brand ? {} : duplicate.brand ? { brand: duplicate.brand } : {}),
    alternateSources: [...existing, duplicate],
  };
}

/**
 * Three passes, cheapest and most certain first.
 *
 * `foods` must arrive already ranked — the first occurrence wins and
 * absorbs the rest, so the better result is the one the user sees.
 */
export function dedupeFoods(foods: VitaFood[]): MergedFood[] {
  const merged: MergedFood[] = [];
  const byBarcode = new Map<string, number>();
  const byBrandName = new Map<string, number>();

  for (const food of foods) {
    // ── Pass 1: barcode identity. Exact and decisive. ──
    const barcode = normalizeGtin(food.barcode);
    if (barcode) {
      const index = byBarcode.get(barcode);
      if (index !== undefined) {
        merged[index] = merge(merged[index], food);
        continue;
      }
    }

    // ── Pass 2: brand + name identity, for branded items without a barcode. ──
    const brand = brandKey(food);
    const name = normalizeName(food.name);
    const compositeKey = brand ? `${brand}|${name}` : null;
    if (compositeKey) {
      const index = byBrandName.get(compositeKey);
      if (index !== undefined) {
        merged[index] = merge(merged[index], food);
        continue;
      }
    }

    // ── Pass 3: near-duplicate generics. Deliberately the narrowest pass. ──
    // Requires BOTH sides unbranded and calories within 5%, which is what
    // keeps "Big Mac" apart from "Big Mac (No Bun)" and a 12 oz can apart
    // from a 20 oz bottle.
    if (!brand) {
      const index = merged.findIndex(
        (candidate) =>
          !candidate.brand &&
          similarity(normalizeName(candidate.name), name) >= NEAR_DUPLICATE_SIMILARITY &&
          caloriesAgree(candidate, food),
      );
      if (index >= 0) {
        merged[index] = merge(merged[index], food);
        continue;
      }
    }

    const position = merged.length;
    merged.push({ ...food, alternateSources: [] });
    if (barcode) byBarcode.set(barcode, position);
    if (compositeKey) byBrandName.set(compositeKey, position);
  }

  return merged;
}
