import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale, ToastProvider } from '../../components/ui';
import { ScannerFrame } from '../../features/fuel/components/ScannerFrame';
import { MealContext } from '../../features/fuel/components/MealContext';
import { EmptyState, Screen, ScreenHeader } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { todayLogDate } from '../../lib/daily';
import type { NutritionRepository } from '../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  createEntry,
  rememberFoods,
  type FavoriteFood,
  type FoodEntry,
  type MealSlot,
  type NutritionTargets,
  type VitaFood,
} from '../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import FoodDetail from './fuel/food/[id]';
import AddFoodManually from './fuel/manual';
import EditLogEntry from './fuel/entry/[id]';

/**
 * Every state of the screens **after** a food is chosen — `__DEV__` only.
 *
 * The same harness `fuel-preview` and `peptides-preview` established, for the
 * same reason and with the same guarantee: **nothing here reaches storage**.
 * Each scenario builds its own in-memory repository, so flicking through
 * fifteen variants of a logged entry leaves no residue in the founder's own
 * food log.
 *
 * ## Why the scanner's states are fixtures rather than the real screen
 *
 * The real `/fuel/scan` needs a camera and a network round-trip, and neither
 * exists in a preview. Its **camera-independent** states are rendered here as
 * faithful static fixtures — the permission prompt, the denied state, the
 * frame with a meal, the lookup, not-found and lookup-failure — assembled from
 * the same components the real screen uses, so what is reviewed here is the
 * real presentation rather than a mock-up of it. **The live camera, a real
 * barcode and a real lookup must be tested on the device.** §97, §109.
 *
 * ## What one route rather than three
 *
 * `/fuel-detail-preview`, `/fuel-manual-preview` and `/fuel-scan-preview`
 * would be three launcher entries for one review pass. The chip bar this
 * repository already uses keeps them legible in one place, which is the
 * readability §96 asks for without the extra surface area.
 */

const TODAY = todayLogDate();

const IMAGE = 'https://images.openfoodfacts.org/images/products/preview.jpg';

function food(overrides: Partial<VitaFood> = {}): VitaFood {
  return {
    vitaId: 'usda:preview',
    source: 'usda',
    sourceId: 'preview',
    name: 'Greek yogurt',
    brand: 'Fage',
    servings: [
      {
        label: '1 container (170 g)',
        quantity: 1,
        unit: 'container',
        nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4 },
      },
    ],
    defaultServingIndex: 0,
    isCustom: false,
    fetchedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

const LONG_NAME =
  'Organic sprouted whole grain sourdough bread with sunflower and flax seeds';

type Screen_ = 'detail' | 'manual' | 'edit' | 'scan';

type Scenario = {
  key: string;
  label: string;
  screen: Screen_;
  /** Foods seeded into the provider cache so Food Detail can resolve them. */
  foods?: VitaFood[];
  entries?: FoodEntry[];
  targets?: NutritionTargets | null;
  params?: Record<string, string>;
  /** Which fixture the scanner renders. */
  scan?: 'prompt' | 'denied' | 'ready' | 'looking-up' | 'not-found' | 'error';
  meal?: MealSlot;
};

const BRANDED = food();
const WITH_IMAGE = food({ vitaId: 'usda:image', name: 'Peanut butter', brand: 'Skippy', imageUrl: IMAGE });
const NO_BRAND = food({ vitaId: 'usda:nobrand', name: 'Banana', brand: undefined });
const LONG = food({ vitaId: 'usda:long', name: LONG_NAME, brand: 'A Very Long Artisanal Bakery Company' });
const MULTI = food({
  vitaId: 'usda:multi',
  name: 'Rolled oats',
  brand: 'Quaker',
  servings: [
    { label: '1/2 cup dry', quantity: 1, unit: 'cup', nutrition: { calories: 150, protein: 5, carbs: 27, fat: 3 } },
    { label: '100 g', quantity: 100, unit: 'g', nutrition: { calories: 379, protein: 13, carbs: 68, fat: 7 } },
    { label: '1 packet', quantity: 1, unit: 'packet', nutrition: { calories: 100, protein: 4, carbs: 19, fat: 2 } },
  ],
});
const RICH = food({
  vitaId: 'usda:rich',
  name: 'Protein bar',
  brand: 'Clif',
  servings: [
    {
      label: '1 bar (68 g)',
      quantity: 1,
      unit: 'bar',
      nutrition: { calories: 250, protein: 20, carbs: 29, fat: 7, saturatedFat: 2, fiber: 3, sugar: 18, sodium: 200 },
    },
  ],
});
const SPARSE = food({
  vitaId: 'usda:sparse',
  name: 'Mystery snack',
  brand: undefined,
  servings: [
    {
      label: '1 serving',
      quantity: 1,
      unit: 'serving',
      nutrition: {
        calories: 90,
        protein: undefined as unknown as number,
        carbs: 4,
        fat: undefined as unknown as number,
      },
    },
  ],
});

const ALL_FOODS = [BRANDED, WITH_IMAGE, NO_BRAND, LONG, MULTI, RICH, SPARSE];

/**
 * A logged entry with a **stable, readable id**.
 *
 * `createEntry` mints a random one, which is right for a real log and wrong
 * here: the previewed screen reads its own `id` out of the URL, so a generated
 * id makes an Edit Entry deep link unwritable by hand and different on every
 * reload. Naming them means `?state=edit&id=preview-edit` works typed straight
 * into Expo Go, which is how the founder reaches these.
 */
const loggedEntry = (id: string, source: VitaFood, meal: MealSlot, quantity = 1): FoodEntry => ({
  ...createEntry({ food: source, servingIndex: 0, quantity, meal, logDate: TODAY }),
  id,
});

const GOALS: NutritionTargets = { calories: 2000, protein: 150 };

const SCENARIOS: Scenario[] = [
  /* ── Food Detail ──────────────────────────────────────────────────── */
  { key: 'detail', label: 'Detail', screen: 'detail', params: { id: BRANDED.vitaId } },
  { key: 'detail-image', label: 'Real image', screen: 'detail', params: { id: WITH_IMAGE.vitaId } },
  { key: 'detail-art', label: 'Art fallback', screen: 'detail', params: { id: NO_BRAND.vitaId } },
  { key: 'detail-nobrand', label: 'No brand', screen: 'detail', params: { id: NO_BRAND.vitaId } },
  { key: 'detail-long', label: 'Long name', screen: 'detail', params: { id: LONG.vitaId } },
  { key: 'detail-servings', label: 'Many servings', screen: 'detail', params: { id: MULTI.vitaId } },
  { key: 'detail-optional', label: 'Full nutrition', screen: 'detail', params: { id: RICH.vitaId } },
  { key: 'detail-sparse', label: 'Missing macros', screen: 'detail', params: { id: SPARSE.vitaId } },
  {
    key: 'detail-goals',
    label: 'Detail · goals set',
    screen: 'detail',
    params: { id: BRANDED.vitaId },
    /* The check that matters: a daily goal exists and **still** nothing on this
       screen mentions it. §45. */
    targets: GOALS,
  },
  { key: 'detail-breakfast', label: 'Breakfast', screen: 'detail', params: { id: BRANDED.vitaId, meal: 'Breakfast' } },
  { key: 'detail-lunch', label: 'Lunch', screen: 'detail', params: { id: BRANDED.vitaId, meal: 'Lunch' } },
  { key: 'detail-dinner', label: 'Dinner', screen: 'detail', params: { id: BRANDED.vitaId, meal: 'Dinner' } },
  { key: 'detail-snacks', label: 'Snacks', screen: 'detail', params: { id: BRANDED.vitaId, meal: 'Snacks' } },
  {
    key: 'detail-scanned',
    label: 'From scan',
    screen: 'detail',
    params: { id: BRANDED.vitaId, meal: 'Dinner', from: 'scan' },
  },
  { key: 'detail-missing', label: 'Food gone', screen: 'detail', params: { id: 'usda:vanished' } },

  /* ── Manual Entry ─────────────────────────────────────────────────── */
  { key: 'manual', label: 'Manual · blank', screen: 'manual' },
  { key: 'manual-breakfast', label: 'Manual · Breakfast', screen: 'manual', params: { meal: 'Breakfast' } },
  { key: 'manual-dinner', label: 'Manual · Dinner', screen: 'manual', params: { meal: 'Dinner' } },
  { key: 'manual-snacks', label: 'Manual · Snacks', screen: 'manual', params: { meal: 'Snacks' } },

  /* ── Edit Entry ───────────────────────────────────────────────────── */
  {
    key: 'edit',
    label: 'Edit entry',
    screen: 'edit',
    entries: [loggedEntry('preview-edit', BRANDED, 'Breakfast')],
  },
  {
    key: 'edit-quantity',
    label: 'Edit · 2 servings',
    screen: 'edit',
    entries: [loggedEntry('preview-edit-quantity', BRANDED, 'Dinner', 2)],
  },
  {
    key: 'edit-long',
    label: 'Edit · long name',
    screen: 'edit',
    entries: [loggedEntry('preview-edit-long', LONG, 'Lunch')],
  },
  {
    key: 'edit-optional',
    label: 'Edit · full nutrition',
    screen: 'edit',
    entries: [loggedEntry('preview-edit-optional', RICH, 'Snacks')],
  },
  { key: 'edit-missing', label: 'Edit · entry gone', screen: 'edit', params: { id: 'entry:vanished' } },

  /* ── Scanner fixtures ─────────────────────────────────────────────── */
  { key: 'scan-prompt', label: 'Scan · asking', screen: 'scan', scan: 'prompt' },
  { key: 'scan-denied', label: 'Scan · denied', screen: 'scan', scan: 'denied' },
  { key: 'scan-ready', label: 'Scan · ready', screen: 'scan', scan: 'ready' },
  { key: 'scan-dinner', label: 'Scan · Dinner', screen: 'scan', scan: 'ready', meal: 'Dinner' },
  { key: 'scan-looking', label: 'Scan · looking up', screen: 'scan', scan: 'looking-up' },
  { key: 'scan-notfound', label: 'Scan · not found', screen: 'scan', scan: 'not-found' },
  { key: 'scan-error', label: 'Scan · lookup failed', screen: 'scan', scan: 'error' },
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

/**
 * The scanner's camera-independent states, drawn with the real components.
 *
 * A live camera cannot be simulated here, so the ready and looking-up fixtures
 * put the real `ScannerFrame` over a flat dark field standing in for the feed —
 * enough to judge the frame, the instruction, the meal mark and the contrast,
 * and **not** enough to claim the scanner has been tested. That is a device
 * job. §97, §109.
 */
function ScanFixture({ state, meal }: { state: NonNullable<Scenario['scan']>; meal?: MealSlot }) {
  const { surfaces } = useTheme();

  const recovery = (
    actions: { icon: keyof typeof Ionicons.glyphMap; label: string }[],
  ) => (
    <View style={styles.actions}>
      {actions.map((action) => (
        <View key={action.label} style={styles.cell}>
          <View style={[styles.action, { borderColor: surfaces.border }]}>
            <Ionicons name={action.icon} size={17} color={palette.primary} />
            <Text style={[styles.actionLabel, { color: surfaces.text }]}>{action.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (state === 'ready' || state === 'looking-up') {
    return (
      <View style={styles.feed}>
        <View style={[styles.scrim, state === 'looking-up' && styles.scrimBusy]} />
        <ScannerFrame busy={state === 'looking-up'} meal={meal} />
      </View>
    );
  }

  if (state === 'prompt' || state === 'denied') {
    const blocked = state === 'denied';
    return (
      <Screen>
        <ScreenHeader title="Scan barcode" back close />
        {meal ? <MealContext meal={meal} /> : null}
        <EmptyState
          icon="camera-outline"
          title={blocked ? 'Camera access is off' : 'Scan a barcode'}
          body={
            blocked
              ? 'Camera access is needed to scan a barcode. You can turn it on in Settings.'
              : 'Camera access is needed to scan a barcode. Nothing is recorded — the camera only reads the code.'
          }
        />
        {recovery([
          blocked
            ? { icon: 'settings-outline', label: 'Settings' }
            : { icon: 'camera-outline', label: 'Allow camera' },
          { icon: 'search-outline', label: 'Search' },
          { icon: 'create-outline', label: 'Manual' },
        ])}
      </Screen>
    );
  }

  const isError = state === 'error';
  return (
    <Screen>
      <ScreenHeader title="Scan barcode" back close />
      {meal ? <MealContext meal={meal} /> : null}
      <EmptyState
        icon={isError ? 'cloud-offline-outline' : 'help-circle-outline'}
        title={isError ? "Couldn't look up this barcode" : 'Food not found'}
        body={isError ? 'Check your connection and try again.' : 'Try searching for it or enter it manually.'}
      />
      {recovery([
        ...(isError ? [{ icon: 'refresh-outline' as const, label: 'Try again' }] : []),
        { icon: 'barcode-outline', label: 'Scan again' },
        { icon: 'search-outline', label: 'Search' },
        { icon: 'create-outline', label: 'Manual' },
      ])}
    </Screen>
  );
}

export default function FuelLoggingPreview() {
  const { surfaces } = useTheme();
  const { state } = useLocalSearchParams<{ state?: string }>();

  const active = SCENARIOS.find((item) => item.key === state) ?? SCENARIOS[0];
  const repository = useMemo(() => memoryRepository(active), [active]);

  /*
   * The provider cache is process-wide, so seeding it here is the one thing
   * that is not scoped to a scenario. These are fixtures with `usda:preview`
   * style ids; they resolve nothing a real search would return, and the cache
   * is memory-only.
   */
  useMemo(() => rememberFoods(ALL_FOODS), []);

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
                onPress={() => router.replace(href(item))}
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

      <View style={styles.stage}>
        <ToastProvider>
          <NutritionProvider key={active.key} repository={repository}>
            <Stage scenario={active} />
          </NutritionProvider>
        </ToastProvider>
      </View>
    </View>
  );
}

/**
 * The real screen, unmodified.
 *
 * Each scenario's route parameters are carried in **this route's own URL** —
 * `?state=detail-dinner&id=usda:preview&meal=Dinner` — so `useLocalSearchParams`
 * inside Food Detail returns exactly what it would on `/fuel/food/[id]`. The
 * extra `state` key is ignored by every screen that reads it. Nothing here
 * mocks the router, and no screen under review has to know it is in a preview.
 */
function Stage({ scenario }: { scenario: Scenario }) {
  if (scenario.screen === 'scan') {
    return <ScanFixture state={scenario.scan ?? 'ready'} meal={scenario.meal} />;
  }
  if (scenario.screen === 'manual') return <AddFoodManually />;
  if (scenario.screen === 'edit') return <EditLogEntry />;
  return <FoodDetail />;
}

/** A scenario's own parameters, appended to the preview's URL. */
function href(scenario: Scenario): string {
  const params = new URLSearchParams({ state: scenario.key });
  const own =
    scenario.screen === 'edit' && scenario.entries?.[0]
      ? { id: scenario.entries[0].id, ...scenario.params }
      : (scenario.params ?? {});
  for (const [key, value] of Object.entries(own)) params.set(key, value);
  return `/fuel-logging-preview?${params.toString()}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    // Clear of the status bar. `fuel-preview` uses `xxxl` and clips the clock
    // on a Dynamic Island device; this harness has more chips, so it sits
    // lower rather than inheriting the same overlap.
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
  feed: {
    flex: 1,
    backgroundColor: '#101010',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scrimBusy: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 130,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 44,
  },
  actionLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    flexShrink: 1,
  },
});
