import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  NumericField,
  Screen,
  ScreenHeader,
  SectionHeader,
  TextField,
} from '../../../components/ui';
import { MealContext } from '../../../features/fuel/components/MealContext';
import { macroAccent } from '../../../features/fuel/macroAccent';
import { createCustomFood, parseMealSlot, useNutrition, type NutritionFacts } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Parses a nutrition field. Blank and malformed both return `null` so the
 * caller can tell "not filled in" apart from a real zero — entering 0 g of fat
 * is a fact, leaving it blank is not.
 */
function parseAmount(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

/**
 * **The manual version of the same Food Detail model.**
 *
 * Creates a food *definition* — it does not log anything. "What is this food?"
 * and "how much did I eat, and when?" are separate questions, and keeping them
 * separate is what makes a custom food reusable instead of something retyped
 * at every meal. So saving here hands off to Food Detail, which owns serving,
 * quantity and meal for every food in the app regardless of where it came
 * from. (Slice 2.2 logged directly from this screen as the shortest path to
 * proving the write path; 2.3 restored the intended architecture, and 5.6D
 * did not touch it. §57.)
 *
 * ## What 5.6D changed
 *
 * Not one field, not one validation rule, not one byte of what is stored. What
 * changed is that it stopped looking like a developer's database form.
 *
 * It was titled `Add Food` — the same words as the screen before it — with the
 * meal as grey subtitle text, `Food Name` and `Sat. Fat (g)` in the old title
 * casing, and every nutrition field inside a card, so a person typing in their
 * own recipe was looking at a schema. It is now grouped by human meaning —
 * **Food, Serving, Nutrition** — under the same uppercase headings Fuel Home
 * uses, direct on the background, with the meal stated in **Fuel Home's own
 * meal identity**. §49–§54.
 *
 * ## The macros carry Fuel's category identity
 *
 * Protein's violet, carbs' amber and fat's steel blue come from `macroAccent`
 * — the same function Fuel Home and Food Detail call, so the three colours
 * mean the same three things everywhere in the product. **Identity only**: not
 * good, not bad, not a target, not a verdict, and nothing on this screen
 * suggests what any of the numbers should be. §54, §64, §84, §87.
 *
 * ## Placeholders do not recommend
 *
 * The fields carry units as suffixes rather than example values. `e.g. 2000`
 * in a calorie box is a recommendation wearing a hint's clothing, and a person
 * filling in an unfamiliar form will anchor on it. §55.
 */
export default function AddFoodManually() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal = parseMealSlot(params.meal);
  const { surfaces, scheme } = useTheme();
  const { saveCustomFood } = useNutrition();

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

  const [saving, setSaving] = useState(false);
  /** Validation appears once the user has tried to save, not while typing. */
  const [attempted, setAttempted] = useState(false);

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
   * The four macros are required — they're the minimum that makes a food worth
   * logging. Everything under the disclosure stays optional, and omitted
   * values are stored as absent rather than zero. Unchanged from 2.2.
   */
  const isValid =
    parsed.name.length > 0 &&
    parsed.unit.length > 0 &&
    parsed.size !== null &&
    parsed.calories !== null &&
    parsed.protein !== null &&
    parsed.carbs !== null &&
    parsed.fat !== null;

  /** Shown beneath a field only after a save attempt, and only where wrong. */
  const problem = (bad: boolean, message: string) =>
    attempted && bad ? (
      <Text style={[styles.problem, { color: palette.fat }]} accessibilityRole="text">
        {message}
      </Text>
    ) : null;

  const handleSave = async () => {
    setAttempted(true);
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

    await saveCustomFood(food);

    // `replace`, not `push`: the form has done its job, and backing out of Food
    // Detail should return to Add Food rather than to a filled-in form that
    // would create a second copy of the same food.
    router.replace(
      `/fuel/food/${encodeURIComponent(food.vitaId)}${meal ? `?meal=${encodeURIComponent(meal)}` : ''}`,
    );
  };

  /** A nutrition field wearing its macro's category colour on the label. */
  const macroField = (
    key: 'protein' | 'carbs' | 'fat',
    label: string,
    value: string,
    onChangeText: (next: string) => void,
  ) => (
    <View style={styles.cell}>
      <NumericField
        label={label}
        labelColor={macroAccent(key, scheme)}
        suffix="g"
        accessibilityLabel={`${label} in grams`}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );

  return (
    <Screen>
      <ScreenHeader title="Enter food manually" back close />
      {meal ? <MealContext meal={meal} /> : null}

      <SectionHeader title="Food" />
      <TextField
        label="Food name"
        accessibilityLabel="Food name"
        value={name}
        onChangeText={setName}
      />
      {problem(parsed.name.length === 0, 'A name is needed to save this food.')}
      <TextField
        label="Brand"
        accessibilityLabel="Brand, optional"
        value={brand}
        onChangeText={setBrand}
      />

      <SectionHeader title="Serving" />
      <View style={styles.row}>
        <View style={styles.cell}>
          <NumericField
            label="Serving size"
            accessibilityLabel="Serving size"
            value={servingSize}
            onChangeText={setServingSize}
          />
        </View>
        <View style={styles.cell}>
          {/* The unit is the user's own word — `slice`, `bar`, `bowl`. Nothing
              here constrains it to a list the provider layer would recognise. */}
          <TextField
            label="Unit"
            accessibilityLabel="Serving unit"
            value={servingUnit}
            onChangeText={setServingUnit}
          />
        </View>
      </View>
      {problem(parsed.size === null, 'Enter a serving size greater than zero.')}
      {problem(parsed.size !== null && parsed.unit.length === 0, 'Enter a unit, such as serving or slice.')}

      <SectionHeader title="Nutrition per serving" />
      <NumericField
        label="Calories"
        /* Fuel's own colour, and the only place it appears on this form —
           calories are the feature's subject, not a fourth macro. */
        labelColor={palette.primary}
        accessibilityLabel="Calories"
        value={calories}
        onChangeText={setCalories}
      />
      {problem(parsed.calories === null, 'Enter the calories in one serving.')}

      <View style={styles.row}>
        {macroField('protein', 'Protein', protein, setProtein)}
        {macroField('carbs', 'Carbs', carbs, setCarbs)}
        {macroField('fat', 'Fat', fat, setFat)}
      </View>
      {problem(
        parsed.protein === null || parsed.carbs === null || parsed.fat === null,
        'Enter protein, carbs and fat. Use 0 where a food has none.',
      )}

      <Pressable
        onPress={() => setShowMore((open) => !open)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={showMore ? 'Hide optional nutrition' : 'Show optional nutrition'}
        accessibilityState={{ expanded: showMore }}
        style={styles.disclosure}
      >
        <Text style={[styles.disclosureLabel, { color: palette.primary }]}>
          {showMore ? 'Hide optional' : 'Add optional nutrition'}
        </Text>
      </Pressable>

      {showMore ? (
        <View style={styles.optional}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <NumericField
                label="Saturated fat"
                suffix="g"
                accessibilityLabel="Saturated fat in grams, optional"
                value={saturatedFat}
                onChangeText={setSaturatedFat}
              />
            </View>
            <View style={styles.cell}>
              <NumericField
                label="Fiber"
                suffix="g"
                accessibilityLabel="Fiber in grams, optional"
                value={fiber}
                onChangeText={setFiber}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.cell}>
              <NumericField
                label="Sugar"
                suffix="g"
                accessibilityLabel="Sugar in grams, optional"
                value={sugar}
                onChangeText={setSugar}
              />
            </View>
            <View style={styles.cell}>
              <NumericField
                label="Sodium"
                suffix="mg"
                accessibilityLabel="Sodium in milligrams, optional"
                value={sodium}
                onChangeText={setSodium}
              />
            </View>
          </View>
        </View>
      ) : null}

      {/*
        * Never disabled. A disabled primary action on a form is the control a
        * person taps to find out what is wrong, and a button that does nothing
        * answers nothing — pressing it now marks the form as attempted and the
        * problems appear beneath the fields that have them. Nothing is written
        * unless the form is genuinely valid.
        */}
      <Button label="Save food" variant="neutral" onPress={handleSave} disabled={saving} />
      <Text style={[styles.footnote, { color: surfaces.textTertiary }]}>
        Saved to My Foods so you can log it again without retyping it. You'll pick the serving and meal
        next.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    // Wraps at accessibility text sizes, where three labelled boxes no longer
    // fit across — the treatment Add Food's action row needed on device.
    flexWrap: 'wrap',
    gap: spacing.m,
  },
  cell: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 96,
  },
  disclosure: {
    minHeight: 40,
    justifyContent: 'center',
  },
  disclosureLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  optional: {
    gap: spacing.m,
  },
  problem: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  footnote: {
    ...typography.caption,
  },
});
