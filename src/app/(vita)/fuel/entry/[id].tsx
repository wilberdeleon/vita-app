import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { FavoriteButton } from '../../../../features/fuel/components/FavoriteButton';
import { FoodFacts } from '../../../../features/fuel/components/FoodFacts';
import { FoodIdentity } from '../../../../features/fuel/components/FoodIdentity';
import { MealContext } from '../../../../features/fuel/components/MealContext';
import { NutritionDetailList } from '../../../../features/fuel/components/NutritionDetailList';
import { PortionEditor } from '../../../../features/fuel/components/PortionEditor';
import {
  editableServings,
  foodFromEntry,
  nutritionForServing,
  readCachedFoodSync,
  traceBarcode,
  useNutrition,
  type MealSlot,
} from '../../../../lib/nutrition';
import { palette, typography } from '../../../../theme/tokens';

/**
 * Edits an existing log entry — how much was eaten and at which meal, never
 * what the food itself is.
 *
 * ## The distinction this screen exists to protect
 *
 * Changing this entry to two servings must not rewrite "Greek yogurt" to 280
 * calories per serving for every future log, and must not touch any other
 * entry of the same food. The food definition is left completely alone, and
 * only the entry's mutable fields change: `id`, `logDate`, `loggedAt` and
 * `foodRef` are never written, so this stays the same eating event — which
 * will matter once sync and history exist. §47, and a test asserts it directly.
 *
 * The entry carries its **own snapshot**, so a logged meal stays openable and
 * editable after its custom food is deleted or its cache entry evicted.
 * Historical entries are historical.
 *
 * ## One family with Food Detail
 *
 * Everything below the header is the same set of components Food Detail uses,
 * on purpose: the add flow and the edit flow must never drift apart on serving
 * arithmetic, and two editors would guarantee that they eventually did. 5.6D
 * extended that from the controls to the presentation — the same identity
 * block, the same macro language, the same meal mark — so this reads as the
 * screen it was logged from rather than as a form. §46.
 */
export default function EditLogEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = decodeURIComponent(id ?? '');

  const { entries, findFood, updateEntry, removeEntry, restoreEntry } = useNutrition();
  const { showToast } = useToast();

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
   * never re-runs — the second entry would inherit the first one's quantity and
   * meal. Same defect class that made a scanned barcode show an earlier product
   * on Food Detail.
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
   * Device QA reported the wrong product **here**, on a screen that reads the
   * log rather than a provider. If the trace shows the scan resolved correctly
   * and this snapshot is wrong, the fault is in the write; if the snapshot
   * matches what the provider returned, the wrong identity arrived from
   * upstream and was recorded faithfully.
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
        <ScreenHeader title="Edit entry" back />
        <EmptyState
          icon="help-circle-outline"
          title="This entry is no longer in your log"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  /**
   * Favoriting here acts on the *food*, never the eating event: it leaves
   * serving, quantity, meal, and the entry itself untouched. Built from the
   * entry's snapshot so it works without a provider round-trip.
   */
  const food = foodFromEntry(entry);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    // Only the user-selected mutable fields.
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
      <ScreenHeader title="Edit entry" back action={<FavoriteButton food={food} />} />

      {/* Follows the picker, so moving the entry to Dinner shows the moon. */}
      <MealContext meal={meal} />

      <FoodIdentity food={food} servingLabel={serving.label} />

      <FoodFacts nutrition={preview} servingLabel={serving.label} quantity={quantity} />

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

      <Button label="Save changes" variant="neutral" onPress={handleSave} disabled={saving} />

      {/*
        * Destructive, in the red VITA reserves for exactly this, and quiet
        * enough not to compete with Save. It gained an accessible name in
        * 5.6D — it was an unlabelled pressable, so a screen reader announced
        * the one irreversible control on the screen as "button". §48, §77.
        */}
      <Pressable
        onPress={handleRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${entry.name} from log`}
        style={styles.removeRow}
      >
        <Text style={[styles.remove, { color: palette.fat }]}>Remove from log</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  removeRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  remove: {
    ...typography.captionMedium,
    fontWeight: '600',
    textAlign: 'center',
  },
});
