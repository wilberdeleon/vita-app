import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, IconBadge, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { NutritionDetailList } from '../../../../features/fuel/components/NutritionDetailList';
import { NutritionSummary } from '../../../../features/fuel/components/NutritionSummary';
import { PortionEditor } from '../../../../features/fuel/components/PortionEditor';
import { getFixtureFood } from '../../../../features/fuel/fixtureCatalog';
import {
  createEntry,
  defaultMealForTime,
  formatServingCount,
  nutritionForServing,
  useNutrition,
  type MealSlot,
} from '../../../../lib/nutrition';
import { spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * The reusable decision point between a food *definition* and a food *log
 * entry*: which serving, how many, which meal — with nutrition recalculating
 * live before anything is committed.
 *
 * It consumes only the normalized `VitaFood` model. Nothing on this screen
 * knows whether the food was typed in by hand, pulled from the interim
 * fixture catalog, or (later) returned by USDA, Open Food Facts, FatSecret,
 * or a barcode scan — which is the whole point of normalizing at the
 * provider boundary rather than here.
 */
export default function FoodDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vitaId = decodeURIComponent(id ?? '');

  const { findFood, addEntry, removeEntry } = useNutrition();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  // User-created foods win over the fixture catalog: if both somehow carry
  // an id, the one the user made is the one they meant.
  const food = findFood(vitaId) ?? getFixtureFood(vitaId);

  const [servingIndex, setServingIndex] = useState(food?.defaultServingIndex ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [meal, setMeal] = useState<MealSlot>(() => defaultMealForTime());
  const [saving, setSaving] = useState(false);

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

  const portionLabel = formatServingCount(quantity, serving.unit);
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
      <ScreenHeader title={food.name} back />

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
