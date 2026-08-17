import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Screen, ScreenHeader, SectionHeader, TextField, useToast } from '../../../components/ui';
import { MealPicker } from '../../../features/fuel/components/MealPicker';
import {
  createCustomFood,
  createEntry,
  defaultMealForTime,
  useNutrition,
  type MealSlot,
  type NutritionFacts,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Parses a nutrition field. Blank and malformed both return `null` so the
 * caller can tell "not filled in" apart from a real zero — entering 0 g of
 * fat is a fact, leaving it blank is not.
 */
function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

export default function AddFoodManually() {
  const { surfaces } = useTheme();
  const { saveCustomFood, addEntry, removeEntry } = useNutrition();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('1');
  const [servingUnit, setServingUnit] = useState('serving');

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [showMore, setShowMore] = useState(false);
  const [saturatedFat, setSaturatedFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [sugar, setSugar] = useState('');
  const [sodium, setSodium] = useState('');

  const [meal, setMeal] = useState<MealSlot>(() => defaultMealForTime());
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => {
    const size = parseAmount(servingSize);
    return {
      name: name.trim(),
      unit: servingUnit.trim(),
      // A zero-sized serving can't be scaled, so it's invalid rather than 0.
      size: size !== null && size > 0 ? size : null,
      calories: parseAmount(calories),
      protein: parseAmount(protein),
      carbs: parseAmount(carbs),
      fat: parseAmount(fat),
      saturatedFat: parseAmount(saturatedFat),
      fiber: parseAmount(fiber),
      sugar: parseAmount(sugar),
      sodium: parseAmount(sodium),
    };
  }, [name, servingUnit, servingSize, calories, protein, carbs, fat, saturatedFat, fiber, sugar, sodium]);

  /**
   * The four macros are required — they're the minimum that makes a food
   * worth logging. Everything under "More nutrition" stays optional, and
   * omitted values are stored as absent rather than zero.
   */
  const isValid =
    parsed.name.length > 0 &&
    parsed.unit.length > 0 &&
    parsed.size !== null &&
    parsed.calories !== null &&
    parsed.protein !== null &&
    parsed.carbs !== null &&
    parsed.fat !== null;

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);

    const nutrition: NutritionFacts = {
      calories: parsed.calories!,
      protein: parsed.protein!,
      carbs: parsed.carbs!,
      fat: parsed.fat!,
      ...(parsed.saturatedFat !== null ? { saturatedFat: parsed.saturatedFat } : {}),
      ...(parsed.fiber !== null ? { fiber: parsed.fiber } : {}),
      ...(parsed.sugar !== null ? { sugar: parsed.sugar } : {}),
      ...(parsed.sodium !== null ? { sodium: parsed.sodium } : {}),
    };

    const food = createCustomFood({
      name: parsed.name,
      brand: brand.trim() || undefined,
      servingQuantity: parsed.size!,
      servingUnit: parsed.unit,
      nutrition,
    });

    // The food is saved to My Foods first so it stays reusable even if the
    // user immediately undoes the log — creating it and eating it are two
    // separate facts.
    await saveCustomFood(food);

    const entry = createEntry({ food, quantity: 1, meal });
    await addEntry(entry);

    showToast({
      message: `Logged · ${food.name} — ${Math.round(nutrition.calories)} kcal`,
      actionLabel: 'Undo',
      onAction: () => {
        void removeEntry(entry.id);
      },
    });

    // Returns to the Food Log rather than the method picker, so the entry
    // that was just created is the first thing on screen.
    router.navigate('/fuel/log');
  };

  return (
    <Screen>
      <ScreenHeader title="Add Food" back close />

      <TextField label="Food Name" placeholder="e.g. Overnight oats" value={name} onChangeText={setName} />
      <TextField label="Brand (optional)" placeholder="e.g. Chobani" value={brand} onChangeText={setBrand} />

      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField
            label="Serving Size"
            placeholder="1"
            keyboardType="decimal-pad"
            value={servingSize}
            onChangeText={setServingSize}
          />
        </View>
        <View style={styles.grow}>
          <TextField label="Unit" placeholder="serving" value={servingUnit} onChangeText={setServingUnit} />
        </View>
      </View>

      <SectionHeader title="Nutrition per serving" />
      <Card style={styles.nutritionCard}>
        <TextField
          label="Calories (kcal)"
          placeholder="0"
          keyboardType="decimal-pad"
          value={calories}
          onChangeText={setCalories}
        />
        <View style={styles.row}>
          <View style={styles.grow}>
            <TextField
              label="Protein (g)"
              placeholder="0"
              keyboardType="decimal-pad"
              value={protein}
              onChangeText={setProtein}
            />
          </View>
          <View style={styles.grow}>
            <TextField
              label="Carbs (g)"
              placeholder="0"
              keyboardType="decimal-pad"
              value={carbs}
              onChangeText={setCarbs}
            />
          </View>
          <View style={styles.grow}>
            <TextField
              label="Fat (g)"
              placeholder="0"
              keyboardType="decimal-pad"
              value={fat}
              onChangeText={setFat}
            />
          </View>
        </View>

        <Pressable onPress={() => setShowMore((open) => !open)} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.moreToggle, { color: palette.primary }]}>
            {showMore ? 'Fewer details' : 'More nutrition (optional)'}
          </Text>
        </Pressable>

        {showMore ? (
          <View style={styles.moreFields}>
            <View style={styles.row}>
              <View style={styles.grow}>
                <TextField
                  label="Sat. Fat (g)"
                  placeholder="—"
                  keyboardType="decimal-pad"
                  value={saturatedFat}
                  onChangeText={setSaturatedFat}
                />
              </View>
              <View style={styles.grow}>
                <TextField
                  label="Fiber (g)"
                  placeholder="—"
                  keyboardType="decimal-pad"
                  value={fiber}
                  onChangeText={setFiber}
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.grow}>
                <TextField
                  label="Sugar (g)"
                  placeholder="—"
                  keyboardType="decimal-pad"
                  value={sugar}
                  onChangeText={setSugar}
                />
              </View>
              <View style={styles.grow}>
                <TextField
                  label="Sodium (mg)"
                  placeholder="—"
                  keyboardType="decimal-pad"
                  value={sodium}
                  onChangeText={setSodium}
                />
              </View>
            </View>
          </View>
        ) : null}
      </Card>

      <SectionHeader title="Add to" />
      <MealPicker value={meal} onChange={setMeal} />

      <Button label="Save & Log" onPress={handleSave} disabled={!isValid || saving} />
      <Text style={[styles.footnote, { color: surfaces.textTertiary }]}>
        Saved to My Foods so you can log it again without retyping it.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  grow: {
    flex: 1,
  },
  nutritionCard: {
    gap: spacing.m,
  },
  moreToggle: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  moreFields: {
    gap: spacing.m,
  },
  footnote: {
    ...typography.caption,
    textAlign: 'center',
  },
});
