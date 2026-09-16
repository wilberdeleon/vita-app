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
import type { WaterRepository } from '../../lib/water/data/WaterRepository';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../../lib/water/model/types';
import { WaterProvider } from '../../lib/water';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import Dashboard from './(tabs)/dashboard';

/**
 * Home's **Fuel widget**, in every calorie state — `__DEV__` only.
 *
 * ## Why this exists
 *
 * The 2026-09-13 founder correction rebuilt the widget's hierarchy and the
 * 2026-09-15 one rebuilt it again — `180 / 1,500 cal` over `1,320 left`,
 * compact. The four states it has to get right are under goal, exactly at
 * goal, over goal and no goal at all. Three of those are unreachable on a
 * device without
 * actually eating — an over-goal day means logging two thousand calories of
 * fixture food into the founder's real log, which is precisely what a preview
 * exists to avoid.
 *
 * The same harness `fuel-preview` and `peptides-preview` established, with the
 * same guarantee: **each scenario builds its own in-memory repository, and
 * nothing reaches storage.**
 *
 * It earned its keep twice. The 2026-09-15 pass used it to measure the wide
 * widget at **159.7pt before and 128.3pt after** on a real simulator, and to
 * catch a defect no test could see: an explicit `lineHeight` on the
 * three-weight calorie line left 95pt of empty space above the figure at
 * accessibility-extra-large. Both readings came from screenshots of these
 * scenarios.
 *
 * ## What it deliberately cannot do
 *
 * **It controls the data, not the layout.** Unlike Fuel, `Dashboard` takes no
 * props — it reads `useDashboardLayout()` from real storage — and giving it a
 * layout override would mean changing a locked screen's API for a preview,
 * which this correction is not authorised to do. So the widget renders at
 * whatever size the real layout says, which is **wide** by default and the
 * shape the founder's feedback targets. Square is covered by tests, and by
 * toggling it in Customize Home on the real screen.
 */

const TODAY = todayLogDate();

function food(calories: number): VitaFood {
  return {
    vitaId: `preview:${calories}`,
    source: 'usda',
    sourceId: String(calories),
    name: 'Preview meal',
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
  };
}

const entry = (calories: number, meal: MealSlot): FoodEntry =>
  createEntry({ food: food(calories), quantity: 1, meal, logDate: TODAY });

type Scenario = {
  key: string;
  label: string;
  entries?: FoodEntry[];
  targets?: NutritionTargets | null;
  waterGoal?: WaterGoal | null;
  waterMl?: number;
};

const WATER: WaterGoal = { amount: 8, unit: 'cup' };

const SCENARIOS: Scenario[] = [
  /* The state the founder reviewed, and the one the correction is about. */
  {
    key: 'under',
    label: 'Under goal',
    entries: [entry(180, 'Breakfast')],
    targets: { calories: 1500 },
    waterGoal: WATER,
    waterMl: 720,
  },
  {
    key: 'met',
    label: 'Goal reached',
    entries: [entry(1500, 'Lunch')],
    targets: { calories: 1500 },
    waterGoal: WATER,
    waterMl: 720,
  },
  {
    key: 'over',
    label: 'Over goal',
    entries: [entry(980, 'Lunch'), entry(640, 'Dinner')],
    targets: { calories: 1500 },
    waterGoal: WATER,
    waterMl: 720,
  },
  {
    key: 'no-goal',
    label: 'No goal',
    entries: [entry(180, 'Breakfast')],
    waterGoal: WATER,
    waterMl: 720,
  },
  { key: 'empty', label: 'Empty day', targets: { calories: 1500 }, waterGoal: WATER },
  {
    key: 'large-figures',
    label: 'Large figures',
    entries: [entry(4820, 'Lunch')],
    targets: { calories: 12000 },
    waterGoal: WATER,
    waterMl: 720,
  },
  {
    key: 'protein-too',
    label: 'Both goals',
    entries: [entry(616, 'Lunch')],
    targets: { calories: 1500, protein: 150 },
    waterGoal: WATER,
    waterMl: 720,
  },
];

/** Water's own seam, in memory — Home draws Water beside Fuel. */
function memoryWaterRepository(scenario: Scenario): WaterRepository {
  const entries: WaterEntry[] = scenario.waterMl
    ? [
        {
          id: 'preview-water',
          logDate: TODAY,
          loggedAt: `${TODAY}T09:00:00.000Z`,
          amountMl: scenario.waterMl,
          enteredAmount: scenario.waterMl,
          enteredUnit: 'ml',
        } as WaterEntry,
      ]
    : [];
  let goal: WaterGoal | null = scenario.waterGoal ?? null;
  let preferences: WaterPreferences | null = null;

  return {
    async getEntries(logDate) {
      return logDate === TODAY ? [...entries] : [];
    },
    async saveEntries() {},
    async getGoal() {
      return goal;
    },
    async saveGoal(next) {
      goal = next;
    },
    async getPreferences() {
      return preferences;
    },
    async savePreferences(next) {
      preferences = next;
    },
    async getRecentDays() {
      return [];
    },
  } as WaterRepository;
}

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

export default function DashboardPreview() {
  const { surfaces } = useTheme();
  const { state } = useLocalSearchParams<{ state?: string }>();

  const active = SCENARIOS.find((item) => item.key === state) ?? SCENARIOS[0];
  // Re-created whenever the scenario changes, so each one starts clean.
  const repository = useMemo(() => memoryRepository(active), [active]);
  const waterRepository = useMemo(() => memoryWaterRepository(active), [active]);

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
                onPress={() => router.replace(`/dashboard-preview?state=${item.key}`)}
                style={[
                  styles.chip,
                  { borderColor: surfaces.border },
                  selected && { backgroundColor: surfaces.text, borderColor: surfaces.text },
                ]}
                accessibilityLabel={`Preview ${item.label}`}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[styles.chipLabel, { color: selected ? surfaces.background : surfaces.textSecondary }]}
                >
                  {item.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {/* The real screen, over repositories that forget everything. */}
      <View style={styles.stage}>
        <NutritionProvider key={active.key} repository={repository}>
          <WaterProvider key={`${active.key}-water`} repository={waterRepository}>
            <Dashboard />
          </WaterProvider>
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
    // Clear of the status bar, like `fuel-logging-preview`.
    paddingTop: spacing.xxxl + spacing.xl,
  },
  chips: {
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.s,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  chipLabel: {
    ...typography.caption,
  },
  stage: {
    flex: 1,
  },
});
