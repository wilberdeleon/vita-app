/**
 * Settings, driven through the screens a person actually uses.
 *
 * The Sprint 3 lesson, applied to a slice whose entire subject is what a
 * screen *shows*: a green domain suite is not evidence that a screen works.
 * The defects this slice fixed were all visible-surface defects — rows that
 * drew a chevron and went nowhere, a subtitle asserting a preference that
 * did not exist, a version string three sprints stale. None of them would
 * have been caught by a helper test, and none of them can regress without
 * failing something here.
 *
 * The strongest test in the file is the last one: changing the water unit in
 * Settings and then reading it off the Water screen, through the same
 * provider. That is the single-source-of-truth claim, proven rather than
 * asserted.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/**
 * `expo-constants` reports an empty `expoConfig` under jest-expo — it reads a
 * real manifest at runtime, and there is none here. Supplying one is what
 * lets these tests prove the version row renders *from configuration*, which
 * is the actual fix; against the bare environment they could only prove it no
 * longer says "Sprint 0".
 */
let mockExpoConfig: Record<string, unknown> | null = { version: '1.0.0' };
jest.mock('expo-constants', () => ({
  __esModule: true,
  get default() {
    return { get expoConfig() { return mockExpoConfig; } };
  },
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Settings from '../../../app/(vita)/settings/index';
import Units from '../../../app/(vita)/settings/units';
import WaterLog from '../../../app/(vita)/water/index';
import { ListRow, ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import type { WaterRepository } from '../../../lib/water/data/WaterRepository';
import { createWaterEntry } from '../../../lib/water/model/entries';
import type { WaterEntry, WaterGoal, WaterPreferences } from '../../../lib/water/model/types';
import { WaterProvider } from '../../../lib/water/state/WaterProvider';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const TODAY = todayLogDate();

function fakeWaterRepository(seed: { preferences?: WaterPreferences | null; entries?: WaterEntry[] } = {}) {
  const days: Record<string, WaterEntry[]> = seed.entries ? { [TODAY]: [...seed.entries] } : {};
  let goal: WaterGoal | null = null;
  let preferences: WaterPreferences | null = seed.preferences ?? null;

  const repository: WaterRepository = {
    async getEntries(logDate) {
      return days[logDate] ? [...days[logDate]] : [];
    },
    async saveEntries(logDate, entries) {
      days[logDate] = [...entries];
    },
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
    async getRecentDays(maxDays: number) {
      return Object.keys(days)
        .filter((logDate) => days[logDate].length > 0)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, Math.max(0, maxDays))
        .map((logDate) => ({ logDate, entries: [...days[logDate]] }));
    },
  };

  return { repository, storedPreferences: () => preferences };
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement, repository: WaterRepository): Promise<ReactTestRenderer> {
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
            <WaterProvider repository={repository}>{element}</WaterProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  mockBack.mockClear();
  mockPush.mockClear();
  if (tree) await act(async () => tree.unmount());
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children
      .filter((c): c is string | number => typeof c === 'string' || typeof c === 'number')
      .join('');
  });
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

const rows = (tree: ReactTestRenderer) => tree.root.findAllByType(ListRow).map((node) => node.props);

/** A pressable by the name a screen reader announces, or by its own text. */
function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: unknown) =>
    typeof value === 'string' && (typeof label === 'string' ? value === label : label.test(value));

  return tree.root.findAll(
    (node) =>
      typeof node.type !== 'string' &&
      typeof node.props.onPress === 'function' &&
      (matches(node.props.accessibilityLabel) ||
        matches(node.props.title) ||
        (Array.isArray(node.props.children)
          ? node.props.children.some(matches)
          : matches(node.props.children))),
  )[0];
}

/* ── the honesty rule ───────────────────────────────────────────────── */

describe('every visible row is real', () => {
  /**
   * The invariant the whole slice exists to establish, expressed once
   * rather than as a row-by-row list — so a row added later cannot
   * reintroduce the defect without failing this.
   */
  it('never draws a chevron on a row that does nothing', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    for (const row of rows(tree)) {
      if (row.chevron) {
        expect(typeof row.onPress).toBe('function');
      }
    }
  });

  it('shows only the rows that have real functionality behind them', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    /**
     * The shipping inventory. `Identity Prototype` is deliberately absent:
     * it is `__DEV__`-only (Sprint 5 slice 5.1, removed in 5.9), so the rows
     * a real user can ever see are still exactly these four.
     */
    const shipped = rows(tree)
      .map((row) => row.title)
      .filter((title) => title !== 'Identity Prototype');

    expect(shipped).toEqual(['Appearance', 'Units', 'Tools & Reference', 'Version']);
  });

  /**
   * Guards the temporary development entry point in both directions: it has
   * to work while it exists, and it has to be genuinely gated. Jest runs with
   * `__DEV__` true, which is why the row is present here at all — the
   * assertion that matters for shipping is the one above, which excludes it.
   */
  it('offers the identity prototype only in development, and it navigates', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    const row = rows(tree).find((candidate) => candidate.title === 'Identity Prototype');

    if (__DEV__) {
      expect(row).toBeDefined();
      expect(typeof row!.onPress).toBe('function');
    } else {
      expect(row).toBeUndefined();
    }
  });

  it.each([
    ['Profile', /Profile/],
    ['the mock account email', /vita\.app/],
    ['Notifications', /Notifications/],
    ['Privacy & Data', /Privacy/],
    ['Sign Out', /Sign Out/],
  ])('no longer shows %s', async (_label, pattern) => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);
    expect(screen(tree)).not.toMatch(pattern);
  });

  /**
   * The most misleading string on the old screen: VITA has never had pounds
   * or mass ounces anywhere, and the claim contradicted the real volume
   * preference stored under `vita:v1:water:prefs`.
   */
  it('no longer asserts an imperial unit system that does not exist', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);
    expect(screen(tree)).not.toMatch(/Imperial/i);
    expect(screen(tree)).not.toMatch(/\blb\b/);
  });
});

describe('version', () => {
  afterEach(() => {
    mockExpoConfig = { version: '1.0.0' };
  });

  it('reports the configured app version and no internal sprint name', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    const version = rows(tree).find((row) => row.title === 'Version');
    expect(version?.value).toBe('1.0.0');
    expect(screen(tree)).not.toMatch(/Sprint/i);
    expect(screen(tree)).not.toMatch(/0\.1\.0/);
  });

  /** It follows the config rather than a literal — the whole point of the fix. */
  it('follows the configured version when it changes', async () => {
    mockExpoConfig = { version: '2.4.1' };
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    expect(rows(tree).find((row) => row.title === 'Version')?.value).toBe('2.4.1');
  });

  it('appends a build number when one is configured', async () => {
    mockExpoConfig = { version: '1.0.0', ios: { buildNumber: '12' } };
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    expect(rows(tree).find((row) => row.title === 'Version')?.value).toBe('1.0.0 (12)');
  });

  /** Never `1.0.0 (undefined)`, which is how a naive template reads today. */
  it('omits the build number when none is configured', async () => {
    mockExpoConfig = { version: '1.0.0', ios: {} };
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    expect(rows(tree).find((row) => row.title === 'Version')?.value).toBe('1.0.0');
  });

  it('says so plainly when no version is available at all', async () => {
    mockExpoConfig = null;
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    expect(rows(tree).find((row) => row.title === 'Version')?.value).toBe('Unknown');
  });

  it('is not presented as something you can open', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    const version = rows(tree).find((row) => row.title === 'Version');
    expect(version?.chevron).toBeFalsy();
    expect(version?.onPress).toBeUndefined();
  });
});

/* ── navigation ─────────────────────────────────────────────────────── */

describe('navigation', () => {
  it('opens Units', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    await act(async () => control(tree, 'Units')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/settings/units');
  });

  /**
   * Settings stays the discovery path after slice 4.2 moved Tools out of its
   * route tree — the row remains, and points at the canonical destination
   * rather than at a Settings-owned subfolder.
   */
  it('opens Tools & Reference at its own top-level route', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    await act(async () => control(tree, 'Tools & Reference')!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/tools');
  });

  /** The old address is gone, not aliased. */
  it('never pushes the retired settings-owned tools route', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    for (const row of rows(tree)) {
      if (row.onPress) await act(async () => row.onPress());
    }
    for (const call of mockPush.mock.calls) {
      expect(String(call[0])).not.toContain('/settings/tools');
    }
  });

  it('offers a way back and never jumps to another feature', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Settings />, repository);

    await act(async () => control(tree, 'Back')!.props.onPress());
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

/* ── units ──────────────────────────────────────────────────────────── */

describe('Units', () => {
  it('shows the water preference and nothing that has no consumer yet', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Units />, repository);

    expect(screen(tree)).toMatch(/WATER/i);
    // Body weight and height belong to slice 4.4; listing them now would be
    // a preference the user can set and never observe.
    expect(screen(tree)).not.toMatch(/Weight/i);
    expect(screen(tree)).not.toMatch(/Height/i);
  });

  it('offers the four real volume units', async () => {
    const { repository } = fakeWaterRepository();
    const tree = await mount(<Units />, repository);

    const rendered = screen(tree);
    for (const unit of ['fl oz', 'cups', 'mL', 'L']) expect(rendered).toContain(unit);
  });

  it('reflects the unit already stored', async () => {
    const { repository } = fakeWaterRepository({ preferences: { unit: 'ml' } });
    const tree = await mount(<Units />, repository);

    const selected = tree.root.findAll(
      (node) => node.props.accessibilityState?.selected === true && !!node.props.accessibilityLabel,
    );
    expect(selected.map((node) => node.props.accessibilityLabel)).toContain('Water display unit, mL');
  });

  it('writes the choice to the water preference, not to a second copy', async () => {
    const { repository, storedPreferences } = fakeWaterRepository();
    const tree = await mount(<Units />, repository);

    await act(async () => control(tree, 'Water display unit, mL')!.props.onPress());
    expect(storedPreferences()).toEqual({ unit: 'ml' });
  });

  /**
   * The single-source-of-truth proof, and the reason Water's storage was
   * left exactly where it was: Settings changes the preference, and the
   * Water screen — a different route, reading the same provider — shows it.
   */
  it('changes what the Water screen displays', async () => {
    const { repository } = fakeWaterRepository({
      preferences: { unit: 'floz' },
      entries: [createWaterEntry({ logDate: TODAY, amount: 500, unit: 'ml' })],
    });

    const units = await mount(<Units />, repository);
    await act(async () => control(units, 'Water display unit, mL')!.props.onPress());
    await act(async () => units.unmount());
    mounted = null;

    const water = await mount(<WaterLog />, repository);
    expect(screen(water)).toContain('500 mL');
    expect(screen(water)).not.toContain('fl oz');
  });

  /**
   * The Water domain's central rule, which this screen's copy promises:
   * a display preference never rewrites what was logged.
   */
  it('leaves an already-logged amount stored in the unit it was entered in', async () => {
    const logged = createWaterEntry({ logDate: TODAY, amount: 16, unit: 'floz' });
    const { repository } = fakeWaterRepository({ preferences: { unit: 'floz' }, entries: [logged] });

    const tree = await mount(<Units />, repository);
    await act(async () => control(tree, 'Water display unit, mL')!.props.onPress());

    const stored = await repository.getEntries(TODAY);
    expect(stored[0].enteredAmount).toBe(16);
    expect(stored[0].enteredUnit).toBe('floz');
    expect(stored[0].amountMl).toBe(logged.amountMl);
  });
});
