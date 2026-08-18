import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, IconBadge, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { NutritionDetailList } from '../../../../features/fuel/components/NutritionDetailList';
import { NutritionSummary } from '../../../../features/fuel/components/NutritionSummary';
import { PortionEditor } from '../../../../features/fuel/components/PortionEditor';
import {
  editableServings,
  formatPortion,
  nutritionForServing,
  readCachedFoodSync,
  useNutrition,
  type MealSlot,
} from '../../../../lib/nutrition';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * Edits an existing log entry — how much was eaten and at which meal, never
 * what the food itself is.
 *
 * That distinction is the point. Changing this entry to two servings must
 * not rewrite "Protein Oats" to 600 kcal per serving for every future log;
 * the food definition is left completely alone, and only the entry's
 * mutable fields change.
 *
 * Everything below the hero is the same set of components Food Detail uses,
 * on purpose: the add flow and the edit flow must never drift apart on
 * serving arithmetic, and two editors would guarantee that they eventually
 * did.
 */
export default function EditLogEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = decodeURIComponent(id ?? '');

  const { entries, findFood, updateEntry, removeEntry, restoreEntry } = useNutrition();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const entry = entries.find((candidate) => candidate.id === entryId);

  // Resolved once from the entry, so the serving list is stable across
  // re-renders while the user is adjusting quantity.
  const resolved = useMemo(() => {
    if (!entry) return null;
    const food = findFood(entry.foodRef.vitaFoodId) ?? readCachedFoodSync(entry.foodRef.vitaFoodId);
    return editableServings(entry, food);
  }, [entry, findFood]);

  const [servingIndex, setServingIndex] = useState(() => resolved?.selectedIndex ?? 0);
  const [quantity, setQuantity] = useState(() => entry?.serving.quantity ?? 1);
  const [meal, setMeal] = useState<MealSlot>(() => entry?.meal ?? 'Breakfast');
  const [saving, setSaving] = useState(false);

  const serving = resolved?.servings[servingIndex] ?? resolved?.servings[0];

  // Preview only. Nothing is written until Save, so backing out leaves the
  // stored entry exactly as it was.
  const preview = useMemo(
    () => (serving ? nutritionForServing(serving, quantity) : null),
    [serving, quantity],
  );

  if (!entry || !resolved || !serving || !preview) {
    return (
      <Screen>
        <ScreenHeader title="Edit Entry" back />
        <EmptyState
          icon="help-circle-outline"
          title="This entry is no longer in your log"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const subtitle = entry.brand ?? undefined;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    // Only the user-selected mutable fields. `id`, `logDate`, `loggedAt`,
    // and `foodRef` are untouched, so this stays the same eating event —
    // which will matter once sync and history exist.
    await updateEntry(entry.id, {
      meal,
      serving: {
        label: serving.label,
        quantity,
        unit: serving.unit,
        ...(serving.gramWeight !== undefined ? { gramWeight: serving.gramWeight * quantity } : {}),
      },
      nutrition: preview,
    });

    showToast({ message: `Updated · ${entry.name}` });
    router.navigate('/fuel/log');
  };

  const handleRemove = () => {
    const index = entries.findIndex((candidate) => candidate.id === entry.id);
    void removeEntry(entry.id);
    showToast({
      message: `Removed · ${entry.name}`,
      actionLabel: 'Undo',
      onAction: () => {
        void restoreEntry(entry, index);
      },
    });
    router.navigate('/fuel/log');
  };

  return (
    <Screen>
      <ScreenHeader title="Edit Entry" back />

      <View style={styles.hero}>
        <IconBadge icon="fast-food-outline" size={64} />
        <Text style={[styles.name, { color: surfaces.text }]}>{entry.name}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>{subtitle}</Text> : null}
      </View>

      <NutritionSummary nutrition={preview} portionLabel={formatPortion(quantity, serving.label)} />

      <PortionEditor
        servings={resolved.servings}
        servingIndex={servingIndex}
        onServingChange={setServingIndex}
        quantity={quantity}
        onQuantityChange={setQuantity}
        meal={meal}
        onMealChange={setMeal}
      />

      <NutritionDetailList nutrition={preview} />

      <Button label="Save Changes" onPress={handleSave} disabled={saving} />

      <Pressable onPress={handleRemove} hitSlop={8} accessibilityRole="button">
        <Text style={[styles.remove, { color: palette.fat }]}>Remove from log</Text>
      </Pressable>
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
  remove: {
    ...typography.captionMedium,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: spacing.s,
  },
});
