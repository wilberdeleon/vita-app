import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, IconBadge, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { FavoriteButton } from '../../../../features/fuel/components/FavoriteButton';
import { NutritionDetailList } from '../../../../features/fuel/components/NutritionDetailList';
import { NutritionSummary } from '../../../../features/fuel/components/NutritionSummary';
import { PortionEditor } from '../../../../features/fuel/components/PortionEditor';
import {
  createEntry,
  defaultMealForTime,
  formatPortion,
  nutritionForServing,
  readCachedFood,
  readCachedFoodSync,
  useNutrition,
  type MealSlot,
  type VitaFood,
} from '../../../../lib/nutrition';
import { spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * The reusable decision point between a food *definition* and a food *log
 * entry*: which serving, how many, which meal — with nutrition recalculating
 * live before anything is committed.
 *
 * It consumes only the normalized `VitaFood` model. Nothing on this screen
 * knows whether the food was typed in by hand or returned by USDA, Open
 * Food Facts, or (later) FatSecret or a barcode scan — which is the whole
 * point of normalizing at the provider boundary rather than here.
 */
export default function FoodDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vitaId = decodeURIComponent(id ?? '');

  const { findFood, addEntry, removeEntry } = useNutrition();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  /**
   * Resolution order: My Foods and favorites first, then the provider cache
   * that search or a barcode scan populated, then a persisted read for the
   * cold-start case where the app restarted between the two.
   *
   * **The async result is stored WITH the id it belongs to.** This route is a
   * single screen: navigating from one food to another updates `params`
   * without remounting, so state seeded by a `useState` initializer belongs
   * to whichever food happened to open the screen first and never updates.
   * That caused a scanned barcode to display an unrelated earlier product —
   * two different bottles resolving to the same wrong food, because the
   * screen was still showing the first thing it ever rendered.
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
  const [meal, setMeal] = useState<MealSlot>(() => defaultMealForTime());
  const [saving, setSaving] = useState(false);

  /**
   * Reset the portion choices whenever the food identity changes, for the
   * same no-remount reason: without this, opening a second food inherits the
   * first one's serving, quantity, and meal.
   */
  useEffect(() => {
    setServingIndex(food?.defaultServingIndex ?? 0);
    setQuantity(1);
    setMeal(defaultMealForTime());
    setSaving(false);
    // Keyed on the resolved food's own id, not the route param, so the
    // food's preferred default serving is applied once it is actually known.
  }, [food?.vitaId, food?.defaultServingIndex]);

  const serving = food?.servings[servingIndex] ?? food?.servings[0];

  // The single calculation on this screen, and it delegates: scaling lives
  // in the nutrition engine so Food Detail, the log, and the future edit
  // screen can never drift apart on the arithmetic.
  const preview = useMemo(
    () => (serving ? nutritionForServing(serving, quantity) : null),
    [serving, quantity],
  );

  if (!food || !serving || !preview) {
    return (
      <Screen>
        <ScreenHeader title="Food" back />
        <EmptyState
          icon="help-circle-outline"
          title="This food is no longer available"
          body="It may have been removed. Try searching for it again."
        />
      </Screen>
    );
  }

  const portionLabel = formatPortion(quantity, serving.label);
  const subtitle = [food.brand, food.restaurant].filter(Boolean).join(' · ');

  const handleAdd = async () => {
    if (saving) return;
    setSaving(true);

    const entry = createEntry({ food, servingIndex, quantity, meal });
    await addEntry(entry);

    showToast({
      message: `Logged · ${food.name} — ${Math.round(entry.nutrition.calories)} kcal`,
      actionLabel: 'Undo',
      onAction: () => {
        void removeEntry(entry.id);
      },
    });

    // Back to the Food Log so the entry that was just created is on screen,
    // rather than to whichever picker the user arrived through.
    router.navigate('/fuel/log');
  };

  return (
    <Screen>
      {/* The heart lives in the header's action slot, so favorite state is
          visible and toggleable without competing with Add to Log. */}
      <ScreenHeader title={food.name} back action={<FavoriteButton food={food} />} />

      <View style={styles.hero}>
        <IconBadge icon="fast-food-outline" size={64} />
        <Text style={[styles.name, { color: surfaces.text }]}>{food.name}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>{subtitle}</Text> : null}
      </View>

      <NutritionSummary nutrition={preview} portionLabel={portionLabel} />

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

      <Button label="+ Add to Log" onPress={handleAdd} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.s,
  },
  name: {
    ...typography.title,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    textAlign: 'center',
  },
});
