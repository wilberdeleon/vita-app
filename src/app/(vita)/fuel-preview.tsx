import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../components/ui';
import { todayLogDate } from '../../lib/daily';
import type { NutritionRepository } from '../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  createEntry,
  type FavoriteFood,
  type FoodEntry,
  type MealSlot,
  type NutritionTargets,
  type VitaFood,
} from '../../lib/nutrition';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import Fuel from './(tabs)/fuel';

/**
 * Every Fuel Home state, on demand — `__DEV__` only.
 *
 * The same harness `peptides-preview` established, and for the same reason:
 * reviewing an empty day, a full day, a day over its goal and a day of long
 * names otherwise means logging and deleting real food between screenshots.
 *
 * **Nothing here reaches storage.** Each scenario builds its own in-memory
 * repository, so a review pass leaves no residue in the founder's own log.
 */

const TODAY = todayLogDate();

function food(name: string, calories: number, overrides: Partial<VitaFood> = {}): VitaFood {
  return {
    vitaId: `usda:${name}`,
    source: 'usda',
    sourceId: name,
    name,
    servings: [
      {
        label: '1 serving',
        quantity: 1,
        unit: 'serving',
        nutrition: {
          calories,
          protein: Math.round(calories * 0.08),
          carbs: Math.round(calories * 0.11),
          fat: Math.round(calories * 0.03),
        },
      },
    ],
    defaultServingIndex: 0,
    isCustom: false,
    fetchedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * A logged entry at a fixed **local** hour, so a scenario renders the same
 * way twice — and so a breakfast reads as a morning.
 *
 * Built through `Date` rather than by writing an ISO string with a `Z`: real
 * entries stamp `new Date().toISOString()`, which is the local instant, and
 * a hand-written UTC literal renders as 1:15 AM anywhere west of London.
 */
function entry(name: string, calories: number, meal: MealSlot, hour: number, image?: string): FoodEntry {
  const made = createEntry({
    food: food(name, calories, image ? { imageUrl: image } : {}),
    quantity: 1,
    meal,
    logDate: TODAY,
  });
  const [year, month, day] = TODAY.split('-').map(Number);
  const at = new Date(year, month - 1, day, hour, 15, 0);
  return { ...made, loggedAt: at.toISOString() };
}

/* A real Open Food Facts thumbnail URL shape; unreachable in preview, which
   is itself worth seeing — the art fallback has to hold when it fails. */
const IMAGE = 'https://images.openfoodfacts.org/images/products/preview.jpg';

type Scenario = {
  key: string;
  label: string;
  entries?: FoodEntry[];
  targets?: NutritionTargets | null;
};

const SCENARIOS: Scenario[] = [
  { key: 'empty', label: 'Empty · no goals' },
  {
    key: 'empty-goals',
    label: 'Empty · goals set',
    targets: { calories: 2000, protein: 150 },
  },
  {
    key: 'breakfast',
    label: 'One food',
    entries: [entry('Greek yogurt', 140, 'Breakfast', 8)],
  },
  {
    key: 'full-day',
    label: 'Full day',
    entries: [
      entry('Greek yogurt', 140, 'Breakfast', 8),
      entry('Blueberries', 60, 'Breakfast', 8),
      entry('Chicken bowl', 620, 'Lunch', 13),
      entry('Almonds', 170, 'Snacks', 16),
      entry('Salmon', 410, 'Dinner', 19),
      entry('Rice', 210, 'Dinner', 19),
    ],
  },
  {
    key: 'busy-day',
    label: 'Many items',
    entries: Array.from({ length: 14 }, (_, index) =>
      entry(
        ['Toast', 'Eggs', 'Coffee', 'Banana', 'Salad', 'Soup', 'Bread', 'Apple'][index % 8],
        120 + index * 15,
        (['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as MealSlot[])[Math.floor(index / 4)] ?? 'Snacks',
        7 + index,
      ),
    ),
  },
  {
    key: 'images',
    label: 'With images',
    entries: [
      entry('Peanut butter', 190, 'Breakfast', 8, IMAGE),
      entry('Protein bar', 220, 'Snacks', 15, IMAGE),
    ],
  },
  {
    key: 'mixed-art',
    label: 'Image + art',
    entries: [
      entry('Peanut butter', 190, 'Breakfast', 8, IMAGE),
      entry('Banana', 105, 'Breakfast', 9),
      entry('Pizza', 620, 'Dinner', 19),
    ],
  },
  {
    key: 'calorie-goal',
    label: 'Calorie goal',
    targets: { calories: 2000 },
    entries: [entry('Chicken bowl', 620, 'Lunch', 13)],
  },
  {
    key: 'protein-goal',
    label: 'Protein goal',
    targets: { protein: 150 },
    entries: [entry('Chicken bowl', 620, 'Lunch', 13)],
  },
  {
    key: 'both-goals',
    label: 'Both goals',
    targets: { calories: 2000, protein: 150 },
    entries: [
      entry('Greek yogurt', 140, 'Breakfast', 8),
      entry('Chicken bowl', 620, 'Lunch', 13),
    ],
  },
  {
    key: 'over-goal',
    label: 'Over goal',
    targets: { calories: 1200, protein: 150 },
    entries: [
      entry('Chicken bowl', 620, 'Lunch', 13),
      entry('Pizza', 980, 'Dinner', 19),
    ],
  },
  {
    key: 'long-names',
    label: 'Long names',
    entries: [
      entry('Organic sprouted whole grain sourdough with seeds', 210, 'Breakfast', 8),
      entry('Grilled free-range chicken breast with quinoa and roasted vegetables', 640, 'Lunch', 13),
    ],
  },
  {
    key: 'missing-macros',
    label: 'Missing macros',
    entries: [
      {
        ...entry('Mystery snack', 250, 'Snacks', 15),
        nutrition: { calories: 250, protein: 0, carbs: 0, fat: 0 },
      },
    ],
  },
];

/** Everything lives in this closure; nothing reaches storage. */
function memoryRepository(scenario: Scenario): NutritionRepository {
  const days: Record<string, FoodEntry[]> = { [TODAY]: [...(scenario.entries ?? [])] };
  let targets: NutritionTargets | null = scenario.targets ?? null;
  let customFoods: VitaFood[] = [];
  let favorites: FavoriteFood[] = [];

  return {
    async getEntries(logDate) {
      return days[logDate] ? [...days[logDate]] : [];
    },
    async saveEntries(logDate, next) {
      days[logDate] = [...next];
    },
    async getTargets() {
      return targets;
    },
    async saveTargets(next) {
      targets = next;
    },
    async getCustomFoods() {
      return [...customFoods];
    },
    async saveCustomFoods(next) {
      customFoods = [...next];
    },
    async getRecentEntries() {
      return Object.values(days).flat();
    },
    async getFavorites() {
      return [...favorites];
    },
    async saveFavorites(next) {
      favorites = [...next];
    },
  };
}

export default function FuelPreview() {
  const { surfaces } = useTheme();
  const { state } = useLocalSearchParams<{ state?: string }>();

  const active = SCENARIOS.find((item) => item.key === state) ?? SCENARIOS[0];
  // Re-created whenever the scenario changes, so each one starts clean.
  const repository = useMemo(() => memoryRepository(active), [active]);

  if (!__DEV__) {
    return (
      <View style={[styles.root, { backgroundColor: surfaces.background }]}>
        <Text style={{ color: surfaces.text }}>Not available.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: surfaces.background }]}>
      <View style={[styles.bar, { borderBottomColor: surfaces.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SCENARIOS.map((item) => {
            const selected = item.key === active.key;
            return (
              <PressableScale
                key={item.key}
                onPress={() => router.replace(`/fuel-preview?state=${item.key}`)}
                style={[
                  styles.chip,
                  { borderColor: surfaces.border },
                  selected && { backgroundColor: surfaces.text, borderColor: surfaces.text },
                ]}
                accessibilityLabel={`Preview ${item.label}`}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: selected ? surfaces.background : surfaces.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {/* The real screen, over a repository that forgets everything. */}
      <View style={styles.stage}>
        <NutritionProvider key={active.key} repository={repository}>
          <Fuel />
        </NutritionProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xxxl + spacing.l,
    paddingBottom: spacing.s,
  },
  chips: {
    gap: spacing.xs,
    paddingHorizontal: spacing.l,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  chipLabel: {
    ...typography.micro,
    fontSize: 12,
    fontWeight: '600',
  },
  stage: {
    flex: 1,
  },
});
