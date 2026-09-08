/**
 * The normalized VITA nutrition model (Sprint 2, founder-approved
 * 2026-08-17). Provider-independent by design: nothing in here knows that
 * USDA, Open Food Facts, or FatSecret exist. Provider adapters map *into*
 * these types; everything downstream — search, ranking, Food Detail, the
 * log, Fuel, Home — reads only these.
 *
 * Lives in `src/lib/` rather than `src/features/fuel/` because both Fuel
 * and Dashboard consume nutrition, and features never import each other
 * (CLAUDE.md rule 4). Same promotion `src/lib/journeyStages.ts` received
 * when Home and Journey needed one shared stage catalog.
 */

/**
 * Canonical meal vocabulary (founder decision, 2026-08-17). Plural
 * "Snacks" everywhere — the codebase previously carried both `'Snack'`
 * (Fuel) and `'Snacks'` (Home) for the same concept, which meant Home's
 * slot silently failed Fuel's icon lookup.
 */
export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

/** Display and iteration order. The single place this sequence is defined. */
export const MEAL_SLOTS: readonly MealSlot[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

/**
 * Where a food came from. Kept on every food and every logged entry.
 *
 * The interim `vita-fixture` member was removed in slice 2.6 when real
 * providers replaced the placeholder catalog — the proof that the provider
 * abstraction holds. `fatsecret` is declared ahead of its adapter so
 * provenance stays stable when restaurant coverage lands.
 */
export type FoodSource = 'usda' | 'openfoodfacts' | 'fatsecret' | 'vita-custom';

/**
 * Nutrition for a single unit of something — one serving, or one logged
 * entry's total.
 *
 * The four macros are always present; everything else is best-effort,
 * because no provider carries every field for every food and inventing a
 * zero would be indistinguishable from a real measured zero.
 */
export type NutritionFacts = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  saturatedFat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
};

/** The optional nutrients, listed once so helpers stay in sync with the type. */
export const OPTIONAL_NUTRIENTS = ['saturatedFat', 'fiber', 'sugar', 'sodium'] as const;
export type OptionalNutrient = (typeof OPTIONAL_NUTRIENTS)[number];

/** The required macros, same reasoning. */
export const CORE_NUTRIENTS = ['calories', 'protein', 'carbs', 'fat'] as const;
export type CoreNutrient = (typeof CORE_NUTRIENTS)[number];

/**
 * One way to measure a food, with the nutrition for exactly one of it.
 *
 * Nutrition hangs off the serving rather than the food because that is the
 * only honest way to represent "1 cup = 240 kcal" and "100 g = 89 kcal" for
 * the same banana. A food carries several of these; the user picks one.
 */
export type ServingOption = {
  /** Human label as shown in the picker, e.g. "1 cup (240 ml)". */
  label: string;
  quantity: number;
  /** 'g' | 'ml' | 'cup' | 'oz' | 'serving' | 'slice' | 'scoop' | 'bottle' | 'item' | … */
  unit: string;
  /** Present when the provider knows it — enables cross-unit conversion. */
  gramWeight?: number;
  /** Nutrition for ONE of this serving, before any quantity multiplier. */
  nutrition: NutritionFacts;
};

/** A food, normalized. The unit of search results, favorites, and detail. */
export type VitaFood = {
  /** Stable and source-derived: `${source}:${sourceId}`. */
  vitaId: string;
  source: FoodSource;
  sourceId: string;

  name: string;
  brand?: string;
  restaurant?: string;
  /** GTIN-14, zero-padded, so UPC-A and EAN-13 compare equal. */
  barcode?: string;
  imageUrl?: string;

  /** Never empty — a food with no measurable serving cannot be logged. */
  servings: ServingOption[];
  defaultServingIndex: number;

  isCustom: boolean;

  /**
   * How much this particular record can be trusted, 0–100. Provider-
   * independent by design: an adapter translates whatever its source knows
   * about record quality into this one number, and ranking reads only this.
   *
   * It exists because a flat per-provider score is too coarse. USDA returns
   * both laboratory-verified generic composition data *and* crowd-submitted
   * branded labels from the same endpoint, and those are not equally
   * trustworthy answers to "banana". Falls back to the provider's base
   * quality when an adapter has nothing better to say.
   */
  dataQuality?: number;

  /** ISO timestamp of when this was fetched or created. Drives cache TTL. */
  fetchedAt: string;
};

/**
 * One thing the user ate, on one day.
 *
 * `nutrition` is a SNAPSHOT, already multiplied by quantity — not a
 * reference to be recomputed later. Three reasons: history stays truthful
 * when a provider revises a food; deleting a custom food or losing network
 * cannot corrupt past days; and daily totals become a pure sum with no
 * lookups, no async, and no loading state on Fuel or Home.
 *
 * `name`/`brand` are denormalized for the same reason — the log renders
 * without resolving anything.
 */
export type FoodEntry = {
  id: string;
  /** 'YYYY-MM-DD' in the device's local timezone at the moment of logging. */
  logDate: string;
  loggedAt: string;
  meal: MealSlot;

  foodRef: {
    source: FoodSource;
    sourceId: string;
    vitaFoodId: string;
  };

  name: string;
  brand?: string;
  /**
   * The food's image at the moment it was logged, denormalized for exactly
   * the same reason `name`/`brand` are: the log must render without
   * resolving anything. Without it, a logged food's visual depended on the
   * provider cache still holding that food *this session*, so a scanned
   * product showed its real image right after the scan and a generic glyph
   * after the next launch. Optional — most foods have no image, and a
   * missing one is a normal state, not a defect.
   */
  imageUrl?: string;

  serving: {
    label: string;
    /** How many of `label` — supports 0.5, 1.5, and so on. */
    quantity: number;
    unit: string;
    gramWeight?: number;
  };

  nutrition: NutritionFacts;
};

/**
 * Daily goals — **authored by the user, or absent.**
 *
 * ## Every field is optional, and so is the whole thing
 *
 * `null` means the user has never set a goal, which is the state everyone
 * starts in and a perfectly normal one to stay in. A non-null record may
 * carry either field or both: someone can set a calorie goal and no protein
 * goal, or a protein goal alone. A field that is absent is *not a goal*, and
 * nothing downstream may substitute a number for it.
 *
 * ## Why there is no default
 *
 * Until slice 5.6A this type was required in full and shipped with a
 * `DEFAULT_TARGETS` constant of 2,000 kcal, 160 g protein, 214 g carbs and
 * 64 g fat — figures carried over from two Sprint 1 fixtures. The provider
 * substituted them whenever storage held nothing, which was always, because
 * no screen could write goals. Every Fuel surface then presented them as
 * *the user's own targets*: `2000 Calories remaining`, `Protein Goal 0 / 160 g`.
 *
 * They were never persisted — the repository has always modelled "never set"
 * as `null` — so they were a display-layer fiction rather than stored data.
 * The founder ruling for 5.6A is that **VITA does not invent nutrition
 * goals**: a goal exists when the user creates one and not before, the same
 * rule Water settled in 5.2 and Peptides in 5.4.
 *
 * Nothing anywhere derives a goal from age, sex, height, weight, activity or
 * a weight target. There is no recommendation engine and none is authorised.
 */
export type NutritionTargets = {
  calories?: number;
  protein?: number;
};

/**
 * The two things a goal can be set for, in the order they are shown.
 *
 * **Calories and protein only** (founder ruling, slice 5.6A.1). Carbohydrate
 * and fat are secondary totals rather than things people set out to hit, and
 * asking for four numbers made a goal feel like a configuration exercise.
 * Carbs and fat are still tracked, summed and displayed everywhere they were
 * — they simply have no target to be measured against, so they are reported
 * as plain totals and never as `80 / 214 g`.
 *
 * A stored record from 5.6A may still carry `carbs` and `fat` keys. They are
 * ignored on read because this list is what the parser walks, and the next
 * save drops them — see `parseTargets`.
 */
export const GOAL_FIELDS = ['calories', 'protein'] as const;
export type GoalField = (typeof GOAL_FIELDS)[number];

/** True when a record carries no goal at all — indistinguishable from `null`. */
export function hasAnyGoal(targets: NutritionTargets | null): targets is NutritionTargets {
  return targets !== null && GOAL_FIELDS.some((field) => targets[field] !== undefined);
}
