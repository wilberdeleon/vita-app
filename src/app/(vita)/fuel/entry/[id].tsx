import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { FavoriteButton } from '../../../../features/fuel/components/FavoriteButton';
import { FoodAvatar } from '../../../../features/fuel/components/FoodAvatar';
import { NutritionDetailList } from '../../../../features/fuel/components/NutritionDetailList';
import { NutritionSummary } from '../../../../features/fuel/components/NutritionSummary';
import { PortionEditor } from '../../../../features/fuel/components/PortionEditor';
import {
  editableServings,
  foodFromEntry,
  formatPortion,
  nutritionForServing,
  readCachedFoodSync,
  traceBarcode,
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

  /**
   * Re-seed from the entry whenever a different one is opened.
   *
   * `/fuel/entry/[id]` is a single route, so navigating from one entry to
   * another updates `params` without remounting and a `useState` initializer
   * never re-runs — the second entry would inherit the first one's quantity
   * and meal. Same defect class that made a scanned barcode show an earlier
   * product on Food Detail.
   */
  useEffect(() => {
    if (!entry) return;
    setServingIndex(resolved?.selectedIndex ?? 0);
    setQuantity(entry.serving.quantity);
    setMeal(entry.meal);
    setSaving(false);
  }, [entryId, entry?.id]);

  /**
   * What this screen is showing, from the stored entry itself.
   *
   * Device QA reported the wrong product **here**, on a screen that reads
   * the log rather than a provider. If the trace shows the scan resolved
   * correctly and this snapshot is wrong, the fault is in the write; if the
   * snapshot matches what the provider returned, the wrong identity arrived
   * from upstream and was recorded faithfully.
   */
  useEffect(() => {
    if (!entry) return;
    traceBarcode('edit.entryId', entry.id);
    traceBarcode('edit.foodRef', `${entry.foodRef.source}:${entry.foodRef.sourceId}`);
    traceBarcode('edit.snapshotName', entry.name);
    traceBarcode('edit.snapshotBrand', entry.brand ?? 'none');
  }, [entry?.id, entry?.name, entry?.brand, entry?.foodRef.source, entry?.foodRef.sourceId]);

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

  /**
   * Favoriting here acts on the *food*, never the eating event: it leaves
   * serving, quantity, meal, and the entry itself untouched. Built from the
   * entry's snapshot so it works without a provider round-trip.
   */
  const food = foodFromEntry(entry);

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
    // Editing is reached from the Food Log, so `back` returns exactly there
    // without stacking a second copy of it.
    router.back();
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
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title="Edit Entry" back action={<FavoriteButton food={food} />} />

      <View style={styles.hero}>
        <FoodAvatar food={food} size={64} />
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
