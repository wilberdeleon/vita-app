/**
 * **The 5.6E end-to-end audit, as tests.**
 *
 * Two defects came out of auditing Fuel as one connected feature rather than
 * as a list of screens, and neither was caught by any of the 2,215 tests that
 * existed. This file is narrow on purpose: it holds those two, and the
 * invariant behind each, so the audit's findings cannot quietly return.
 *
 * ## What is deliberately *not* here
 *
 * The Fuel/Home calorie agreement across all four goal states, the shared
 * Water and Peptides modules, the meal-identity matrix, macro identity, food
 * visuals, the food-row family, scanner duplicate suppression and the Manual
 * save invariant are all already covered — in `FuelIdentity`, `FuelContinuity`,
 * `FuelLogging`, `FuelStructure` and `compactModules`. Restating them here
 * would inflate the count without testing anything new.
 *
 * The full Water and Peptides screens are likewise absent by design:
 * `compactWaterView` and `compactPeptidesView` consume labels **already
 * formatted** by `useWaterToday` / the peptide provider, which is the same
 * hook the full screens render from. Two consumers of one string cannot
 * disagree, and asserting that they do not is a test of nothing.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockParams: Record<string, string> = {};
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => mockParams,
}));

import { readFileSync } from 'fs';
import { join } from 'path';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import FuelSetup from '../../../app/(vita)/fuel/setup';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import type { NutritionRepository } from '../../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  createEntry,
  type FavoriteFood,
  type FoodEntry,
  type NutritionTargets,
  type VitaFood,
} from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { FoodListRow } from '../components/FoodListRow';

const TODAY = todayLogDate();

/** Real provider data is ugly. This is the length Open Food Facts actually returns. */
const LONG_NAME = 'Organic sprouted whole grain sourdough bread with sunflower and flax seeds';

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:long',
  source: 'usda',
  sourceId: 'long',
  name: LONG_NAME,
  brand: 'A Very Long Artisanal Bakery Company',
  servings: [
    {
      label: '1 thick slice',
      quantity: 1,
      unit: 'slice',
      nutrition: { calories: 210, protein: 7, carbs: 38, fat: 3 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

function fakeRepository(seed: { entries?: FoodEntry[]; targets?: NutritionTargets | null } = {}) {
  const days: Record<string, FoodEntry[]> = { [TODAY]: [...(seed.entries ?? [])] };
  let targets: NutritionTargets | null = seed.targets ?? null;
  let customFoods: VitaFood[] = [];
  let favorites: FavoriteFood[] = [];

  const repository: NutritionRepository = {
    async getEntries(logDate) {
      return days[logDate] ? [...days[logDate]] : [];
    },
    async saveEntries(logDate, entries) {
      days[logDate] = [...entries];
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
  return { repository, day: () => days[TODAY] ?? [] };
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement, repository: NutritionRepository) {
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <ToastProvider>
            <NutritionProvider repository={repository}>
              <WaterProvider>
                <PeptideProvider>{element}</PeptideProvider>
              </WaterProvider>
            </NutritionProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  if (mounted) await act(async () => mounted!.unmount());
  mounted = null;
  mockParams = {};
  mockPush.mockClear();
});

const textNodes = (tree: ReactTestRenderer, value: string) =>
  tree.root.findAllByType(Text).filter((node) => String(node.props.children) === value);

/** Every string rendered anywhere on screen, including inside labels. */
const allText = (tree: ReactTestRenderer) =>
  tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
      return children
        .filter((child: unknown) => typeof child === 'string' || typeof child === 'number')
        .join('');
    })
    .concat(
      tree.root
        .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
        .map((node) => String(node.props.accessibilityLabel)),
    )
    .filter(Boolean);

async function expandBreakfast(tree: ReactTestRenderer) {
  const row = tree.root.findAll(
    (node) =>
      typeof node.props?.onPress === 'function' &&
      /^Breakfast\./.test(String(node.props.accessibilityLabel ?? '')),
  )[0];
  if (!row) throw new Error('Breakfast row not found');
  await act(async () => row.props.onPress());
}

/* ═══════════════════════════════════════════════════════════════════════════
   FINDING 1 — a logged food's name was cropped on Fuel Home
   ═══════════════════════════════════════════════════════════════════════════ */

describe('a logged food’s name', () => {
  /**
   * The defect, and why it counted as one on a locked screen.
   *
   * 5.6C removed the line cap from `FoodListRow` because the founder saw
   * `Clif Bar Cool Mint…` on device, and recorded the ruling that the name is
   * the one string that must never be cropped. Fuel Home's own expanded meal
   * row still carried `numberOfLines={1}`, so **the same food** read in full in
   * Search and as an ellipsis once it was inside a meal — and at accessibility
   * text sizes a 74-character provider name became a few characters of the
   * string a person is scanning for.
   */
  it('is never cropped inside a meal on Fuel Home', async () => {
    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const tree = await mount(<Fuel />, fakeRepository({ entries: [entry] }).repository);
    await expandBreakfast(tree);

    const nodes = textNodes(tree, LONG_NAME);
    expect(nodes.length).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.props.numberOfLines).toBeUndefined();
    }
  });

  it('is never cropped in a discovery list either', () => {
    // The other half of the invariant, so the two cannot drift apart again.
    let tree: ReactTestRenderer;
    act(() => {
      tree = create(
        <ThemeProvider>
          <FoodListRow food={food()} />
        </ThemeProvider>,
      );
    });
    for (const node of textNodes(tree!, LONG_NAME)) {
      expect(node.props.numberOfLines).toBeUndefined();
    }
    act(() => tree!.unmount());
  });

  it('still caps the supporting line, which is allowed to', async () => {
    /*
     * The distinction the ruling draws: a *secondary* line may truncate, the
     * subject may not. Removing every cap would make one long serving label
     * push the calories off a dense row.
     */
    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const tree = await mount(<Fuel />, fakeRepository({ entries: [entry] }).repository);
    await expandBreakfast(tree);

    const serving = textNodes(tree, '1 thick slice');
    expect(serving.length).toBeGreaterThan(0);
    expect(serving[0].props.numberOfLines).toBe(1);
  });

  it('leaves the row free to grow, rather than pinning its height', async () => {
    // A wrapping name inside a fixed-height row is clipped instead of cropped,
    // which is worse: the text is simply cut off mid-glyph.
    const entry = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const tree = await mount(<Fuel />, fakeRepository({ entries: [entry] }).repository);
    await expandBreakfast(tree);

    const name = textNodes(tree, LONG_NAME)[0];
    const row = name.parent?.parent;
    const styles = [row?.props?.style].flat(3).filter(Boolean) as Record<string, unknown>[];
    for (const style of styles) {
      expect(style.height).toBeUndefined();
      expect(style.maxHeight).toBeUndefined();
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   FINDING 2 — `kcal` reached user-facing copy
   ═══════════════════════════════════════════════════════════════════════════ */

describe('calorie terminology', () => {
  /**
   * The Design System's rule, written down since Sprint 2: **user-facing copy
   * says `Calories`, or `cal` where a row is tight — never `kcal`.** Internal
   * fields, provider payloads and nutrient units are unaffected.
   *
   * Both screens that edit the daily calorie goal — Fuel's own setup and
   * Settings → Nutrition Goals — labelled the same number `(kcal)`. Two
   * screens editing one value, both breaking one written rule, and no test
   * looked at the copy.
   */
  it('never says kcal on Fuel’s setup screen', async () => {
    const tree = await mount(<FuelSetup />, fakeRepository().repository);
    const text = allText(tree).join(' ');

    expect(text).not.toMatch(/kcal/i);
    expect(text).toMatch(/calorie goal/i);
  });

  it('never says kcal anywhere a person can read it', () => {
    /*
     * Asserted against the source rather than through a render, because the
     * offending strings sat on two screens in two features and a per-screen
     * test would only ever cover the ones someone thought to mount.
     *
     * Comments and identifiers are exempt — `kcal` is the correct word in a
     * docstring explaining a provider's payload, and `const kcal = ...` is a
     * local variable nobody sees. Only string literals count.
     */
    const roots = [
      join(__dirname, '../../../app/(vita)'),
      join(__dirname, '../../../features'),
    ];
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of require('fs').readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(path);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;

        const source = readFileSync(path, 'utf8');
        // Strip block and line comments, then look inside quoted strings only.
        const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const literal of code.match(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g) ?? []) {
          if (/kcal/i.test(literal)) offenders.push(`${path}: ${literal}`);
        }
      }
    };
    roots.forEach(walk);

    expect(offenders).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   THE AUDIT'S OWN GUARANTEES
   ═══════════════════════════════════════════════════════════════════════════ */

describe('the audit’s standing checks', () => {
  it('reaches no DEV preview route from product navigation', () => {
    /*
     * §38: normal runtime must never expose preview fixtures. The harnesses are
     * `__DEV__`-gated *and* unreferenced — this asserts the second, because the
     * gate protects a release build while a stray `router.push` would still put
     * fake food in front of the founder during a device pass.
     */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of require('fs').readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(path);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;
        // A preview route may of course name itself.
        if (/-preview\.tsx$/.test(entry.name)) continue;

        const source = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const literal of source.match(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g) ?? []) {
          if (/\/(fuel|peptides|fuel-logging)-preview/.test(literal)) offenders.push(`${path}: ${literal}`);
        }
      }
    };
    walk(join(__dirname, '../../../app/(vita)'));
    walk(join(__dirname, '../../../features'));

    expect(offenders).toEqual([]);
  });

  it('keeps /fuel/log unreferenced rather than half-migrated', async () => {
    /*
     * §63. `/fuel/log` predates the refresh, still renders a `Card` and a
     * filled-orange `+ Log Food`, and is reached by **nothing** — the state
     * recorded at the 5.6B audit and unchanged since. It stays for deep-link
     * back-compatibility rather than being redesigned or deleted for tidiness,
     * so what matters is that normal navigation cannot land a person on it.
     *
     * If a future slice surfaces it, this fails and the screen has to be
     * brought into the locked language first.
     */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of require('fs').readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(path);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name) || entry.name === 'log.tsx') continue;
        const source = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const literal of source.match(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g) ?? []) {
          if (/\/fuel\/log/.test(literal)) offenders.push(`${path}: ${literal}`);
        }
      }
    };
    walk(join(__dirname, '../../../app/(vita)'));
    walk(join(__dirname, '../../../features'));

    expect(offenders).toEqual([]);
  });

  it('renders one numeric keyboard accessory, from the primitive', () => {
    /*
     * §48. The Done bar belongs to `NumericField` itself — it used to be a
     * separate export each screen had to remember, and founder QA found the
     * forgotten case three times in three slices. A screen re-declaring one
     * would register a second accessory for the same field.
     */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of require('fs').readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(path);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;
        if (/NumericField\.tsx$/.test(entry.name)) continue;
        // Comments stripped first: both Water's and Peptides' sheets *explain*
        // the accessory's `nativeID` matching in prose, which is documentation,
        // not a second bar.
        const code = readFileSync(path, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^\s*\/\/.*$/gm, '');
        if (/<InputAccessoryView|from 'react-native'[\s\S]{0,400}InputAccessoryView/.test(code)) {
          offenders.push(path);
        }
      }
    };
    walk(join(__dirname, '../../../app/(vita)'));
    walk(join(__dirname, '../../../features'));
    walk(join(__dirname, '../../../components'));

    expect(offenders).toEqual([]);
  });
});
