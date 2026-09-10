import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Button, EmptyState, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { FavoriteButton } from '../../../../features/fuel/components/FavoriteButton';
import { FoodFacts } from '../../../../features/fuel/components/FoodFacts';
import { FoodIdentity } from '../../../../features/fuel/components/FoodIdentity';
import { MealContext } from '../../../../features/fuel/components/MealContext';
import { WrongProductAction, providerLabel } from '../../../../features/fuel/components/WrongProductAction';
import { NutritionDetailList } from '../../../../features/fuel/components/NutritionDetailList';
import { PortionEditor } from '../../../../features/fuel/components/PortionEditor';
import {
  createEntry,
  defaultMealForTime,
  formatCalories,
  traceBarcode,
  nutritionForServing,
  parseMealSlot,
  readCachedFood,
  readCachedFoodSync,
  useNutrition,
  type MealSlot,
  type VitaFood,
} from '../../../../lib/nutrition';

/**
 * **What food is this, what serving am I logging, and what does it contain?**
 *
 * The reusable decision point between a food *definition* and a food *log
 * entry*: which serving, how many, which meal — with nutrition recalculating
 * live before anything is committed.
 *
 * It consumes only the normalized `VitaFood` model. Nothing on this screen
 * knows whether the food was typed in by hand or returned by USDA, Open Food
 * Facts, or a barcode scan — which is the whole point of normalizing at the
 * provider boundary rather than here, and the reason a scan, a search result
 * and a favourite all land on **this one screen** rather than on three
 * lookalikes. §27, §59, §60, §61.
 *
 * ## What 5.6D changed
 *
 * Nothing about the model, the arithmetic, the resolution order or the write.
 * The screen was a centred 64pt hero over a stack of four cards — a picture
 * card, a nutrition card, a portion card, a detail card — which is what every
 * food app looked like in 2019 and the one thing in Fuel that could not have
 * come from anywhere else in VITA. The founder's contract asks a simpler
 * question: *does this look like the row I just tapped?*
 *
 * So the header is the stacked task-screen header Add Food uses, the meal is
 * stated in **Fuel Home's own meal identity**, the food is the list row's
 * geometry one size up, and the nutrition is Fuel Home's macro language. Card
 * soup gone; hairlines and direct-on-background throughout. §32–§36, §66.
 *
 * ## What it is deliberately not
 *
 * Not a dashboard, not a health report, not a recommendation. **No daily goal
 * reaches this screen** — no calorie remainder, no protein target, no carb or
 * fat allowance, no percentage of anything (§45, §87). No score, no grade, no
 * traffic light, no "better choice" (§84, §85). The calories here are what
 * this portion of this food contains, which is why the caption is `Calories`
 * and never `Calories consumed` — that sentence belongs to Fuel Home and to
 * food already eaten. §35.
 */
export default function FoodDetail() {
  const { id, meal: mealParam, from } = useLocalSearchParams<{ id: string; meal?: string; from?: string }>();
  const vitaId = decodeURIComponent(id ?? '');

  /**
   * Whether the scanner opened this screen. Only a barcode result gets the
   * recovery affordance and the provenance line: a barcode is an exact
   * identity claim, so being wrong about one is a different kind of wrong than
   * a search result the user picked themselves.
   */
  const fromScan = from === 'scan';

  /**
   * The meal chosen before the user ever got here.
   *
   * Fuel's meal rows deep-link the whole logging flow with `?meal=Lunch`, and
   * every screen in between forwards it, so "add food to Lunch" does not end
   * with being asked which meal it was. Validated rather than trusted — an
   * unrecognized value falls back to the time-of-day default. The picker below
   * is still shown and still editable: this changes what is preselected, never
   * what is possible.
   */
  const preselectedMeal = parseMealSlot(mealParam);

  const { findFood, addEntry, removeEntry } = useNutrition();
  const { showToast } = useToast();

  /**
   * Resolution order: My Foods and favorites first, then the provider cache
   * that search or a barcode scan populated, then a persisted read for the
   * cold-start case where the app restarted between the two.
   *
   * **The async result is stored WITH the id it belongs to.** This route is a
   * single screen: navigating from one food to another updates `params`
   * without remounting, so state seeded by a `useState` initializer belongs to
   * whichever food happened to open the screen first and never updates. That
   * caused a scanned barcode to display an unrelated earlier product — two
   * different bottles resolving to the same wrong food, because the screen was
   * still showing the first thing it ever rendered.
   */
  const [resolved, setResolved] = useState<{ vitaId: string; food: VitaFood } | null>(null);
  const direct = findFood(vitaId) ?? readCachedFoodSync(vitaId);
  const food = direct ?? (resolved?.vitaId === vitaId ? resolved.food : undefined);

  useEffect(() => {
    if (direct) return;
    let active = true;
    void readCachedFood(vitaId).then((result) => {
      if (active && result) setResolved({ vitaId, food: result });
    });
    return () => {
      active = false;
    };
  }, [direct, vitaId]);

  const [servingIndex, setServingIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [meal, setMeal] = useState<MealSlot>(() => preselectedMeal ?? defaultMealForTime());
  const [saving, setSaving] = useState(false);

  /**
   * Reset the portion choices whenever the food identity changes, for the same
   * no-remount reason: without this, opening a second food inherits the first
   * one's serving, quantity, and meal.
   */
  useEffect(() => {
    setServingIndex(food?.defaultServingIndex ?? 0);
    setQuantity(1);
    setMeal(preselectedMeal ?? defaultMealForTime());
    setSaving(false);
    // Keyed on the resolved food's own id, not the route param, so the food's
    // preferred default serving is applied once it is actually known.
  }, [food?.vitaId, food?.defaultServingIndex, preselectedMeal]);

  // Records what this screen actually received and resolved, so a device trace
  // shows whether a wrong product arrived or was substituted here.
  useEffect(() => {
    traceBarcode('detail.routeParam', vitaId);
    traceBarcode('detail.resolvedId', food?.vitaId ?? 'UNRESOLVED');
    traceBarcode('detail.renderedName', food?.name ?? 'none');
  }, [vitaId, food?.vitaId, food?.name]);

  const serving = food?.servings[servingIndex] ?? food?.servings[0];

  // The single calculation on this screen, and it delegates: scaling lives in
  // the nutrition engine so Food Detail, the log, and the edit screen can never
  // drift apart on the arithmetic. §39.
  const preview = useMemo(
    () => (serving ? nutritionForServing(serving, quantity) : null),
    [serving, quantity],
  );

  if (!food || !serving || !preview) {
    return (
      <Screen>
        <ScreenHeader title="Food details" back />
        <EmptyState
          icon="help-circle-outline"
          title="This food is no longer available"
          body="It may have been removed. Try searching for it again."
        />
      </Screen>
    );
  }

  const mealSuffix = preselectedMeal ? `?meal=${encodeURIComponent(preselectedMeal)}` : '';

  const handleAdd = async () => {
    if (saving) return;
    setSaving(true);

    const entry = createEntry({ food, servingIndex, quantity, meal });

    /**
     * The log snapshot, traced because device QA reported the wrong product on
     * **Edit Entry** — a screen that reads a stored entry, not a provider
     * response. These four lines say whether a wrong identity was already wrong
     * when it arrived here, or became wrong at the moment it was written.
     */
    traceBarcode('log.foodRef', `${entry.foodRef.source}:${entry.foodRef.sourceId}`);
    traceBarcode('log.snapshotName', entry.name);
    traceBarcode('log.snapshotBrand', entry.brand ?? 'none');
    traceBarcode('log.snapshotGtin', food.barcode ?? 'none');

    await addEntry(entry);

    showToast({
      message: `Logged · ${food.name} — ${formatCalories(entry.nutrition.calories)} cal`,
      actionLabel: 'Undo',
      onAction: () => {
        void removeEntry(entry.id);
      },
    });

    /**
     * Adding to the log finishes the flow, so unwind the whole thing.
     *
     * A log can be reached through several stacked screens — Add Food → Search
     * → Food Detail, or Add Food → Scan → Food Detail — and navigating to one
     * destination would leave the rest of that stack underneath, so the user
     * pressed Back three or four times to get out. `dismissAll()` pops every
     * screen above the tab navigator in one step, landing on Fuel with the new
     * entry and updated totals already rendered, and with Back behaving
     * normally afterwards. No duplicate Fuel root, because the tab screen is
     * never pushed — only revealed.
     *
     * Guarded: if there is nothing above the root to dismiss (a deep link
     * straight to this screen), fall back to navigating to Fuel rather than
     * throwing or stranding the user here.
     */
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/fuel');
  };

  return (
    <Screen>
      {/* The heart lives in the header's action slot, so favorite state is
          visible and toggleable without competing with the primary action. */}
      <ScreenHeader title="Food details" back action={<FavoriteButton food={food} />} />

      {/*
        * Follows the picker below rather than the route parameter, so changing
        * the meal changes the mark at the top — the moon appears the moment
        * Dinner is chosen. Same `mealAccent` mapping Fuel Home's meal rows and
        * Add Food's context line read. §63.
        */}
      <MealContext meal={meal} />

      <FoodIdentity
        food={food}
        servingLabel={serving.label}
        /* Provenance, only where it earns its place: it is what makes an
           incorrect-product report actionable, and Open Food Facts requires
           attribution wherever its data is shown. Quiet, and at the bottom. */
        footnote={fromScan ? `Source: ${providerLabel(food)}` : null}
      />

      <FoodFacts nutrition={preview} servingLabel={serving.label} quantity={quantity} />

      <PortionEditor
        servings={food.servings}
        servingIndex={servingIndex}
        onServingChange={setServingIndex}
        quantity={quantity}
        onQuantityChange={setQuantity}
        meal={meal}
        onMealChange={setMeal}
      />

      <NutritionDetailList nutrition={preview} />

      {/*
        * Says where it is going. `+ Add to Log` named a data structure; this
        * names the meal the user is about to affect, which is also the last
        * chance to notice it is the wrong one. Neutral primary, not a glowing
        * orange slab — Fuel orange is an earned accent. §42, §65.
        */}
      <Button label={`Add to ${meal}`} variant="neutral" onPress={handleAdd} disabled={saving} />

      {fromScan ? <WrongProductAction food={food} mealSuffix={mealSuffix} /> : null}
    </Screen>
  );
}
