import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../components/ui';
import type { NutritionRepository } from '../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  type FavoriteFood,
  type FoodEntry,
  type NutritionTargets,
  type VitaFood,
} from '../../lib/nutrition';
import type { WaterRepository } from '../../lib/water/data/WaterRepository';
import type { VolumeUnit, WaterGoal, WaterPreferences } from '../../lib/water/model/types';
import { WaterProvider } from '../../lib/water';
import { radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import Settings from './settings/index';
import NutritionGoals from './settings/nutrition-goals';
import Units from './settings/units';

/**
 * Settings, its two subpages, and the states they can be in — `__DEV__` only.
 *
 * ## Why it exists
 *
 * 5.7B rebuilt Settings' presentation, and the states worth looking at are
 * not the ones a fresh install shows. Nutrition Goals reads differently with
 * goals set than without — the *Clear goals* action only exists in the first
 * case — and Units reads differently per stored unit. Reaching those on a
 * device means **writing goals and preferences into the founder's real
 * storage** to take a screenshot, which is the thing every preview harness in
 * this app exists to avoid.
 *
 * The same pattern `fuel-preview`, `peptides-preview` and `dashboard-preview`
 * established, with the same guarantee: **each scenario builds its own
 * in-memory repositories, and nothing reaches storage.**
 *
 * ## What it deliberately does not do
 *
 * **It does not stub the theme.** Appearance writes through the real
 * `ThemeProvider`, because a preview that faked it would be showing a control
 * that does nothing — and the one thing Appearance needs verified is that
 * tapping a mode changes the app. So switching Light/Dark here switches the
 * *whole preview*, which is the correct behaviour and the reason there is no
 * separate light-mode scenario: pick Dark or Light in the control and the
 * screen you are looking at follows.
 *
 * That is also the one thing here that does touch storage — the theme
 * preference, written by the same call the real screen makes. It is the
 * user's own setting rather than invented data, and it is the only way the
 * control can be honest.
 */

type Scenario = {
  key: string;
  label: string;
  screen: 'settings' | 'units' | 'goals';
  targets?: NutritionTargets | null;
  unit?: VolumeUnit;
};

const SCENARIOS: Scenario[] = [
  { key: 'home', label: 'Settings', screen: 'settings' },
  { key: 'units-floz', label: 'Units · fl oz', screen: 'units', unit: 'floz' },
  { key: 'units-ml', label: 'Units · mL', screen: 'units', unit: 'ml' },
  { key: 'goals-empty', label: 'Goals · none set', screen: 'goals' },
  {
    key: 'goals-both',
    label: 'Goals · both set',
    screen: 'goals',
    targets: { calories: 1800, protein: 150 },
  },
  {
    key: 'goals-calories',
    label: 'Goals · calories only',
    screen: 'goals',
    targets: { calories: 2200 },
  },
];

/** Water's seam, in memory — Units reads and writes Water's own preference. */
function memoryWaterRepository(scenario: Scenario): WaterRepository {
  let goal: WaterGoal | null = null;
  let preferences: WaterPreferences | null = scenario.unit ? { unit: scenario.unit } : null;

  return {
    async getEntries() {
      return [];
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
  const days: Record<string, FoodEntry[]> = {};
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
      /* Settings reads no foods; this exists only to satisfy the seam. */
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

export default function SettingsPreview() {
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

  const stage =
    active.screen === 'settings' ? <Settings /> : active.screen === 'units' ? <Units /> : <NutritionGoals />;

  return (
    <View style={[styles.root, { backgroundColor: surfaces.background }]}>
      <View style={[styles.bar, { borderBottomColor: surfaces.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SCENARIOS.map((item) => {
            const selected = item.key === active.key;
            return (
              <PressableScale
                key={item.key}
                onPress={() => router.replace(`/settings-preview?state=${item.key}`)}
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

      {/* The real screens, over repositories that forget everything. */}
      <View style={styles.stage}>
        <NutritionProvider key={active.key} repository={repository}>
          <WaterProvider key={`${active.key}-water`} repository={waterRepository}>
            {stage}
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
    // Clear of the status bar, like the other preview harnesses.
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
