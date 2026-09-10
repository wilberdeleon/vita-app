/**
 * **The screens after a food is chosen** — the scanner, Food Detail, Manual
 * Entry and Edit Entry, driven as screens.
 *
 * ## Why this file exists before 5.6D changed anything
 *
 * These four routes carry the only writes in Fuel. The scanner had **no test
 * at all** — `expo-camera` and a real permission prompt are not renderable in
 * Jest, which is the reason the 5.6A audit recorded for leaving it uncovered,
 * and it is a reason to mock the camera rather than a reason to ship a barcode
 * flow no test has ever run. Manual Entry likewise had none. Food Detail and
 * Edit Entry had four tests between them.
 *
 * So this suite was written **against the screens as they stood at `c12c623`**,
 * before a single line of presentation was touched, and every assertion here
 * describes behaviour that must survive the redesign: what is written, which
 * meal it lands in, what a lookup does once and not twice, and what a stored
 * entry is allowed to change.
 *
 * ## No camera, no network
 *
 * `expo-camera` is replaced by a view that hands the scan callback back to the
 * test, so a "scan" is a real call through the screen's own handler rather than
 * a simulated one. `lookupBarcodeAcrossProviders` is stubbed at the registry
 * seam — the same seam `useFoodSearch.test.tsx` uses — so **nothing here
 * reaches Open Food Facts or USDA**.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/* ── the camera, replaced by something a test can drive ─────────────────── */

/**
 * The live `onBarcodeScanned` handler, captured from whatever `CameraView` the
 * screen last rendered. `scan()` below calls it exactly as the camera would.
 */
let cameraHandler: ((result: { data: string; type: string }) => void) | undefined;
let cameraProps: Record<string, unknown> = {};

let mockPermission: { granted: boolean; canAskAgain: boolean } | null = {
  granted: true,
  canAskAgain: true,
};
const mockRequestPermission = jest.fn(async () => mockPermission);

jest.mock('expo-camera', () => {
  const { View } = require('react-native');
  return {
    CameraView: (props: Record<string, unknown>) => {
      cameraHandler = props.onBarcodeScanned as typeof cameraHandler;
      cameraProps = props;
      return <View testID="camera-view" />;
    },
    useCameraPermissions: () => [mockPermission, mockRequestPermission],
  };
});

const mockOpenSettings = jest.fn();
jest.mock('expo-linking', () => ({ openSettings: (...a: unknown[]) => mockOpenSettings(...a) }));

/* ── the barcode lookup, stubbed at the provider registry ───────────────── */

const mockLookup = jest.fn();
jest.mock('../../../lib/nutrition/providers/registry', () => ({
  ...jest.requireActual('../../../lib/nutrition/providers/registry'),
  lookupBarcodeAcrossProviders: (...args: unknown[]) => mockLookup(...args),
}));

/* ── routing ────────────────────────────────────────────────────────────── */

let mockParams: Record<string, string> = {};
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockDismissAll = jest.fn();
let mockCanDismiss = false;

jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: (...args: unknown[]) => mockBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    navigate: jest.fn(),
    dismissAll: (...args: unknown[]) => mockDismissAll(...args),
    canDismiss: () => mockCanDismiss,
  },
  useLocalSearchParams: () => mockParams,
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import ScanBarcode from '../../../app/(vita)/fuel/scan';
import FoodDetail from '../../../app/(vita)/fuel/food/[id]';
import AddFoodManually from '../../../app/(vita)/fuel/manual';
import EditLogEntry from '../../../app/(vita)/fuel/entry/[id]';
import { ToastProvider } from '../../../components/ui';
import { todayLogDate } from '../../../lib/daily';
import type { NutritionRepository } from '../../../lib/nutrition/data/FoodLogRepository';
import {
  NutritionProvider,
  createEntry,
  rememberFoods,
  type FavoriteFood,
  type FoodEntry,
  type NutritionTargets,
  type VitaFood,
} from '../../../lib/nutrition';
import { PeptideProvider } from '../../../lib/peptides';
import { WaterProvider } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const TODAY = todayLogDate();

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Greek yogurt',
  brand: 'Fage',
  servings: [
    {
      label: '1 container',
      quantity: 1,
      unit: 'container',
      nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4 },
    },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

function fakeRepository(
  seed: { entries?: FoodEntry[]; targets?: NutritionTargets | null; customFoods?: VitaFood[] } = {},
) {
  const days: Record<string, FoodEntry[]> = { [TODAY]: [...(seed.entries ?? [])] };
  let targets: NutritionTargets | null = seed.targets ?? null;
  let customFoods: VitaFood[] = [...(seed.customFoods ?? [])];
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

  return {
    repository,
    day: () => days[TODAY] ?? [],
    customFoods: () => [...customFoods],
    favorites: () => [...favorites],
  };
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

beforeEach(() => {
  mockPermission = { granted: true, canAskAgain: true };
  mockLookup.mockReset();
  mockCanDismiss = false;
  cameraHandler = undefined;
  cameraProps = {};
});

afterEach(async () => {
  if (mounted) await act(async () => mounted!.unmount());
  mounted = null;
  mockParams = {};
  mockPush.mockClear();
  mockBack.mockClear();
  mockReplace.mockClear();
  mockDismissAll.mockClear();
  mockOpenSettings.mockClear();
  mockRequestPermission.mockClear();
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
      return children
        .filter((child: unknown) => typeof child === 'string' || typeof child === 'number')
        .join('');
    })
    .filter(Boolean);
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');

/**
 * A pressable, found the way a person finds it: by what it says.
 *
 * It matches an accessible name first and falls back to the visible label,
 * deliberately — several of these controls had **no accessible name at all**
 * when this suite was written, which is a finding rather than a reason to skip
 * them. Written this way, one assertion holds both before the redesign and
 * after it, and `describe('what a screen reader hears')` below asserts the
 * labels separately so the gap cannot close by accident and go unnoticed.
 */
function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: string) =>
    Boolean(value) && (typeof label === 'string' ? value === label : label.test(value));
  return tree.root.findAll(
    (node) =>
      typeof node.props?.onPress === 'function' &&
      (matches(String(node.props.accessibilityLabel ?? '')) ||
        matches(String(node.props.label ?? '')) ||
        matches(visibleText(node))),
  )[0];
}

/** Every string rendered inside a node — the words actually on the control. */
function visibleText(node: ReactTestInstance): string {
  try {
    return node
      .findAllByType(Text)
      .map((child) => {
        const parts = Array.isArray(child.props.children) ? child.props.children : [child.props.children];
        return parts.filter((part) => typeof part === 'string' || typeof part === 'number').join('');
      })
      .join(' ')
      .trim();
  } catch {
    return '';
  }
}



async function press(node: ReactTestInstance | undefined) {
  if (!node) throw new Error('no such control on screen');
  await act(async () => {
    await node.props.onPress();
  });
}

/**
 * A text input by its accessible name, falling back to the visible label its
 * `TextField` renders — same reasoning as `control`. `TextField` did not pass
 * `label` through to the input's accessible name when this was written, so
 * every field on Manual Entry was anonymous to VoiceOver.
 */
function field(tree: ReactTestRenderer, label: string) {
  const wanted = label.toLowerCase();
  const named = tree.root
    .findAllByType(TextInput)
    .find((node) => String(node.props.accessibilityLabel ?? '').toLowerCase().startsWith(wanted));
  if (named) return named;

  return tree.root
    .findAll(
      (node) =>
        typeof node.type === 'function' &&
        String(node.props?.label ?? '').toLowerCase().startsWith(wanted),
    )
    .flatMap((node) => node.findAllByType(TextInput))[0];
}

async function type(tree: ReactTestRenderer, label: string, value: string) {
  const input = field(tree, label);
  if (!input) throw new Error(`no field labelled "${label}" — found: ${inputLabels(tree).join(', ')}`);
  await act(async () => input.props.onChangeText(value));
}

const inputLabels = (tree: ReactTestRenderer) =>
  tree.root.findAllByType(TextInput).map((node) => String(node.props.accessibilityLabel ?? '?'));


/** Drives the camera exactly as `expo-camera` would. */
async function scan(data: string, type = 'ean13') {
  if (!cameraHandler) throw new Error('the camera has no scan handler — is the screen in its live state?');
  await act(async () => {
    cameraHandler!({ data, type });
  });
  // Let the lookup promise settle.
  await act(async () => undefined);
}

const found = (result: VitaFood) => ({ status: 'found' as const, food: result, provider: 'openfoodfacts' });
const notFound = { status: 'not-found' as const, outcomes: [] };
const failed = {
  status: 'error' as const,
  outcomes: [{ provider: 'openfoodfacts', ok: false, error: { kind: 'network', stage: 'fetch' } }],
};

/* ═══════════════════════════════════════════════════════════════════════════
   THE SCANNER
   ═══════════════════════════════════════════════════════════════════════════ */

describe('the scanner — camera permission', () => {
  it('waits rather than guessing while permission is still unknown', async () => {
    mockPermission = null;
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    // No camera is mounted, and nothing claims access was denied.
    expect(tree.root.findAll((n) => n.props?.testID === 'camera-view')).toHaveLength(0);
    expect(screen(tree)).not.toMatch(/denied|off/i);
  });

  it('explains what the camera is for before asking for it', async () => {
    mockPermission = { granted: false, canAskAgain: true };
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    expect(screen(tree)).toMatch(/camera/i);
    expect(control(tree, /allow/i)).toBeTruthy();
  });

  it('asks the system when the user agrees', async () => {
    mockPermission = { granted: false, canAskAgain: true };
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await press(control(tree, /allow/i));
    expect(mockRequestPermission).toHaveBeenCalled();
  });

  it('sends the user to Settings once the system will not ask again', async () => {
    mockPermission = { granted: false, canAskAgain: false };
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await press(control(tree, /settings/i));
    expect(mockOpenSettings).toHaveBeenCalled();
    expect(mockRequestPermission).not.toHaveBeenCalled();
  });

  it('always leaves another way to add a food when the camera is unavailable', async () => {
    mockPermission = { granted: false, canAskAgain: false };
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    expect(control(tree, /search/i)).toBeTruthy();
  });

  it('shows the live camera once permission is granted', async () => {
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    expect(tree.root.findAll((n) => n.props?.testID === 'camera-view').length).toBeGreaterThan(0);
  });

  it('scans only the symbologies packaged food actually carries', async () => {
    await mount(<ScanBarcode />, fakeRepository().repository);
    const settings = cameraProps.barcodeScannerSettings as { barcodeTypes: string[] };
    expect(settings.barcodeTypes).toEqual(expect.arrayContaining(['ean13', 'upc_a']));
    // Never QR: a QR code is not a grocery item, and firing on one dead-ends.
    expect(settings.barcodeTypes).not.toContain('qr');
  });
});

describe('the scanner — a barcode is read', () => {
  it('looks up a scanned code and opens the food it resolved', async () => {
    mockLookup.mockResolvedValue(found(food({ vitaId: 'off:5000112637922' })));
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);

    await scan('5000112637922');

    expect(mockLookup).toHaveBeenCalledTimes(1);
    // Normalized to GTIN-14 before it leaves the screen — an EAN-13 is padded,
    // so one physical product is one lookup key whichever symbology carried it.
    expect(mockLookup.mock.calls[0][0]).toBe('05000112637922');
    // `replace`, not `push`: backing out of the food must not return to a
    // frozen scanner mid-lookup.
    expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining('/fuel/food/'));
    expect(tree).toBeTruthy();
  });

  it('does not fire twice while the code sits in the frame', async () => {
    /*
     * The defect this pins. `onBarcodeScanned` fires many times per second for
     * as long as a code is visible, and a `useState` flag is not enough —
     * React batches, so several callbacks slip through before the re-render.
     * A synchronous ref is the only thing that holds.
     */
    mockLookup.mockResolvedValue(found(food()));
    await mount(<ScanBarcode />, fakeRepository().repository);

    await act(async () => {
      cameraHandler!({ data: '5000112637922', type: 'ean13' });
      cameraHandler!({ data: '5000112637922', type: 'ean13' });
      cameraHandler!({ data: '5000112637922', type: 'ean13' });
    });
    await act(async () => undefined);

    expect(mockLookup).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('ignores a code that is not a usable product barcode, and keeps looking', async () => {
    await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('not-a-barcode');
    expect(mockLookup).not.toHaveBeenCalled();

    // Still live — a stray label must not dead-end the scanner.
    mockLookup.mockResolvedValue(found(food()));
    await scan('5000112637922');
    expect(mockLookup).toHaveBeenCalledTimes(1);
  });

  it('seeds the cache so the food resolves on the screen it opens', async () => {
    const scanned = food({ vitaId: 'off:5000112637922', name: 'Scanned bar' });
    mockLookup.mockResolvedValue(found(scanned));
    await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    mockParams = { id: 'off:5000112637922' };
    const detail = await mount(<FoodDetail />, fakeRepository().repository);
    expect(screen(detail)).toContain('Scanned bar');
  });

  it('marks the food as barcode-originated so it can offer a way out', async () => {
    mockLookup.mockResolvedValue(found(food()));
    await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');
    expect(String(mockReplace.mock.calls[0][0])).toContain('from=scan');
  });
});

describe('the scanner — when the barcode does not resolve', () => {
  it('says the food was not found, without blame or jargon', async () => {
    mockLookup.mockResolvedValue(notFound);
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    expect(screen(tree)).toMatch(/not found/i);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('says a lookup failed differently from a food that does not exist', async () => {
    mockLookup.mockResolvedValue(failed);
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    const text = screen(tree);
    expect(text).not.toMatch(/not found/i);
    expect(control(tree, /try again/i)).toBeTruthy();
  });

  it('never shows a provider name, endpoint or status code to the user', async () => {
    mockLookup.mockResolvedValue(failed);
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    // `__DEV__` diagnostics are excluded: they are a development affordance and
    // are not part of the shipped copy. Everything else must be plain English.
    const shipped = texts(tree).filter((line) => !line.includes('openfoodfacts:'));
    expect(shipped.join(' ')).not.toMatch(/HTTP|\b\d{3}\b|openfoodfacts|usda|endpoint/i);
  });

  it('retries the same barcode without making the user scan it again', async () => {
    mockLookup.mockResolvedValueOnce(failed).mockResolvedValueOnce(found(food()));
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    await press(control(tree, /try again/i));
    await act(async () => undefined);

    expect(mockLookup).toHaveBeenCalledTimes(2);
    // The same normalized code, not whatever the camera last saw.
    expect(mockLookup.mock.calls[1][0]).toBe(mockLookup.mock.calls[0][0]);
  });

  it('returns to a clean scanner, ready for the next code', async () => {
    mockLookup.mockResolvedValue(notFound);
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    await press(control(tree, /scan again/i));
    expect(tree.root.findAll((n) => n.props?.testID === 'camera-view').length).toBeGreaterThan(0);

    // And the lock really did release — the same code scans a second time.
    mockLookup.mockResolvedValue(found(food()));
    await scan('5000112637922');
    expect(mockLookup).toHaveBeenCalledTimes(2);
  });

  it('offers search and manual entry as the way forward', async () => {
    mockLookup.mockResolvedValue(notFound);
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    await press(control(tree, /add manually|manual/i));
    expect(String(mockReplace.mock.calls[0][0])).toContain('/fuel/manual');
  });
});

describe('the scanner — the meal survives', () => {
  it.each(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])('carries %s into the food it opens', async (meal) => {
    mockParams = { meal };
    mockLookup.mockResolvedValue(found(food()));
    await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    expect(String(mockReplace.mock.calls[0][0])).toContain(`meal=${meal}`);
  });

  it.each(['Breakfast', 'Dinner'])('carries %s into the manual fallback too', async (meal) => {
    mockParams = { meal };
    mockLookup.mockResolvedValue(notFound);
    const tree = await mount(<ScanBarcode />, fakeRepository().repository);
    await scan('5000112637922');

    await press(control(tree, /add manually|manual/i));
    expect(String(mockReplace.mock.calls[0][0])).toContain(`meal=${meal}`);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   FOOD DETAIL
   ═══════════════════════════════════════════════════════════════════════════ */

describe('Food Detail', () => {
  it('shows the food, its brand, and the nutrition of one serving', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    const text = screen(tree);
    expect(text).toContain('Greek yogurt');
    expect(text).toContain('Fage');
    expect(text).toContain('140');
    expect(text).toMatch(/18/);
  });

  it('recalculates when the quantity changes, rather than restating the serving', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    await press(control(tree, 'Increase'));
    // 140 × 1.5 — the arithmetic belongs to the nutrition engine, and this
    // asserts the screen delegates to it rather than repeating it.
    expect(screen(tree)).toContain('210');
  });

  it('writes an entry carrying the food’s own snapshot', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const repo = fakeRepository();
    const tree = await mount(<FoodDetail />, repo.repository);

    await press(control(tree, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));

    const [entry] = repo.day();
    expect(entry.name).toBe('Greek yogurt');
    expect(entry.brand).toBe('Fage');
    expect(entry.nutrition.calories).toBe(140);
    expect(entry.foodRef.vitaFoodId).toBe('usda:1');
  });

  it.each(['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const)('logs into %s when that is where it came from', async (meal) => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1', meal };
    const repo = fakeRepository();
    const tree = await mount(<FoodDetail />, repo.repository);

    await press(control(tree, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));
    expect(repo.day()[0].meal).toBe(meal);
  });

  it('ignores a meal it does not recognise rather than trusting the URL', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1', meal: 'Brunch' };
    const repo = fakeRepository();
    const tree = await mount(<FoodDetail />, repo.repository);

    await press(control(tree, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));
    expect(['Breakfast', 'Lunch', 'Dinner', 'Snacks']).toContain(repo.day()[0].meal);
  });

  it('lets the meal be changed before logging', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1', meal: 'Breakfast' };
    const repo = fakeRepository();
    const tree = await mount(<FoodDetail />, repo.repository);

    const dinner = tree.root.findAll(
      (node) => typeof node.props?.onPress === 'function' && node.props?.label === 'Dinner',
    )[0];
    await press(dinner);
    await press(control(tree, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));

    expect(repo.day()[0].meal).toBe('Dinner');
  });

  it('offers every serving the food carries, and only those', async () => {
    rememberFoods([
      food({
        vitaId: 'usda:multi',
        servings: [
          { label: '1 container', quantity: 1, unit: 'container', nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4 } },
          { label: '100 g', quantity: 100, unit: 'g', nutrition: { calories: 59, protein: 10, carbs: 3, fat: 0 } },
        ],
      }),
    ]);
    mockParams = { id: 'usda:multi' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    expect(screen(tree)).toContain('100 g');
  });

  it('does not offer a serving choice a food does not have', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);
    // One serving is not a choice; a picker with a single option is furniture.
    expect(screen(tree)).not.toMatch(/^Serving$/m);
  });

  it('unwinds the whole flow after logging rather than stranding the stack', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    mockCanDismiss = true;
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    await press(control(tree, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));
    expect(mockDismissAll).toHaveBeenCalled();
  });

  it('goes to Fuel when there is no stack to unwind', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    mockCanDismiss = false;
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    await press(control(tree, /^Add to (Breakfast|Lunch|Dinner|Snacks)$/));
    expect(mockReplace).toHaveBeenCalledWith('/fuel');
  });

  it('says so plainly when the food cannot be resolved at all', async () => {
    mockParams = { id: 'usda:vanished' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);
    expect(screen(tree)).toMatch(/no longer available/i);
  });

  it('can favorite the food without logging it', async () => {
    rememberFoods([food()]);
    mockParams = { id: 'usda:1' };
    const repo = fakeRepository();
    const tree = await mount(<FoodDetail />, repo.repository);

    await press(control(tree, /to favorites/i));
    expect(repo.favorites()).toHaveLength(1);
    expect(repo.day()).toHaveLength(0);
  });

  it('renders a food with no brand without leaving punctuation behind', async () => {
    rememberFoods([food({ vitaId: 'usda:plain', brand: undefined })]);
    mockParams = { id: 'usda:plain' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    const text = screen(tree);
    expect(text).not.toMatch(/undefined|NaN|null/);
    expect(text).not.toMatch(/(^|\s)·(\s|$)/);
  });

  it('shows only the optional nutrients the food actually carries', async () => {
    rememberFoods([
      food({
        vitaId: 'usda:partial',
        servings: [
          {
            label: '1 container',
            quantity: 1,
            unit: 'container',
            nutrition: { calories: 140, protein: 18, carbs: 6, fat: 4, fiber: 2 },
          },
        ],
      }),
    ]);
    mockParams = { id: 'usda:partial' };
    const tree = await mount(<FoodDetail />, fakeRepository().repository);

    // A missing nutrient is absent, never rendered as 0 or as a dash.
    expect(screen(tree)).not.toMatch(/Sodium/i);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   MANUAL ENTRY
   ═══════════════════════════════════════════════════════════════════════════ */

describe('Manual Entry', () => {
  const fill = async (tree: ReactTestRenderer) => {
    await type(tree, 'Food name', 'Overnight oats');
    await type(tree, 'Calories', '320');
    await type(tree, 'Protein', '12');
    await type(tree, 'Carbs', '48');
    await type(tree, 'Fat', '9');
  };

  it('will not save without the facts that make a food loggable', async () => {
    /*
     * Asserted as "nothing is written", not as "the button is disabled".
     *
     * 5.6D stopped disabling the primary action: a disabled Save is the control
     * a person presses to find out what is wrong, and one that does nothing
     * answers nothing. Pressing it now surfaces the problems instead. The
     * guarantee that matters — an incomplete food never reaches storage — is
     * what this pins, and it held before the change and after it.
     */
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);

    await press(control(tree, /save/i));

    expect(repo.customFoods()).toHaveLength(0);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(screen(tree)).toMatch(/name is needed/i);
  });

  it('saves once name and the four macros are present', async () => {
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);

    await press(control(tree, /save/i));

    const [custom] = repo.customFoods();
    expect(custom.name).toBe('Overnight oats');
    expect(custom.isCustom).toBe(true);
    expect(custom.servings[0].nutrition).toMatchObject({ calories: 320, protein: 12, carbs: 48, fat: 9 });
  });

  it('creates a food definition and hands the logging decision on', async () => {
    /*
     * The architecture this pins: "what is this food" and "how much did I eat"
     * are separate questions. Manual Entry answers the first and routes to Food
     * Detail for the second, which is what makes a custom food reusable rather
     * than something retyped at every meal.
     */
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await press(control(tree, /save/i));

    expect(repo.day()).toHaveLength(0);
    expect(String(mockReplace.mock.calls[0][0])).toContain('/fuel/food/');
  });

  it.each(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])('carries %s through to the logging screen', async (meal) => {
    mockParams = { meal };
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await press(control(tree, /save/i));

    expect(String(mockReplace.mock.calls[0][0])).toContain(`meal=${meal}`);
  });

  it('stores an omitted optional nutrient as absent, never as zero', async () => {
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await press(control(tree, /save/i));

    const nutrition = repo.customFoods()[0].servings[0].nutrition;
    expect(nutrition.fiber).toBeUndefined();
    expect(nutrition.sodium).toBeUndefined();
  });

  it('keeps a genuine zero, which is a real answer', async () => {
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await type(tree, 'Fat', '0');
    await press(control(tree, /save/i));

    expect(repo.customFoods()[0].servings[0].nutrition.fat).toBe(0);
  });

  it('refuses a malformed number rather than storing NaN', async () => {
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await type(tree, 'Calories', 'abc');

    await press(control(tree, /save/i));
    expect(repo.customFoods()).toHaveLength(0);
    expect(screen(tree)).not.toMatch(/NaN/);
  });

  it('refuses a serving that cannot be scaled', async () => {
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await type(tree, 'Serving size', '0');

    await press(control(tree, /save/i));
    expect(repo.customFoods()).toHaveLength(0);
    expect(screen(tree)).toMatch(/greater than zero/i);
  });

  it('treats a brand as optional', async () => {
    const repo = fakeRepository();
    const tree = await mount(<AddFoodManually />, repo.repository);
    await fill(tree);
    await press(control(tree, /save/i));

    expect(repo.customFoods()[0].brand).toBeUndefined();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   EDIT ENTRY
   ═══════════════════════════════════════════════════════════════════════════ */

describe('Edit Entry', () => {
  const logged = () =>
    createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Breakfast' });

  it('opens the entry that was logged, from its own stored snapshot', async () => {
    const entry = logged();
    mockParams = { id: entry.id };
    const tree = await mount(<EditLogEntry />, fakeRepository({ entries: [entry] }).repository);

    expect(screen(tree)).toContain('Greek yogurt');
    expect(screen(tree)).toContain('140');
  });

  it('saves a changed quantity against the same eating event', async () => {
    const entry = logged();
    mockParams = { id: entry.id };
    const repo = fakeRepository({ entries: [entry] });
    const tree = await mount(<EditLogEntry />, repo.repository);

    await press(control(tree, 'Increase'));
    await press(control(tree, /save/i));

    const [saved] = repo.day();
    expect(saved.id).toBe(entry.id);
    expect(saved.serving.quantity).toBe(1.5);
    expect(saved.nutrition.calories).toBe(210);
    // The event's identity is untouched — same day, same origin.
    expect(saved.logDate).toBe(entry.logDate);
    expect(saved.foodRef).toEqual(entry.foodRef);
  });

  it('moves an entry to another meal', async () => {
    const entry = logged();
    mockParams = { id: entry.id };
    const repo = fakeRepository({ entries: [entry] });
    const tree = await mount(<EditLogEntry />, repo.repository);

    const dinner = tree.root.findAll(
      (node) => typeof node.props?.onPress === 'function' && node.props?.label === 'Dinner',
    )[0];
    await press(dinner);
    await press(control(tree, /save/i));

    expect(repo.day()[0].meal).toBe('Dinner');
  });

  it('never rewrites the food definition it was logged from', async () => {
    /*
     * The rule the whole screen exists for. Eating two containers today must
     * not make "Greek yogurt" 280 calories per serving for every future log,
     * and must not touch any other entry of the same food.
     */
    const entry = logged();
    const other = createEntry({ food: food(), servingIndex: 0, quantity: 1, meal: 'Lunch' });
    const definition = food();
    mockParams = { id: entry.id };
    const repo = fakeRepository({ entries: [entry, other], customFoods: [definition] });
    const tree = await mount(<EditLogEntry />, repo.repository);

    await press(control(tree, 'Increase'));
    await press(control(tree, /save/i));

    expect(repo.customFoods()[0].servings[0].nutrition.calories).toBe(140);
    expect(repo.day().find((e) => e.id === other.id)!.nutrition.calories).toBe(140);
  });

  it('changes nothing until Save is pressed', async () => {
    const entry = logged();
    mockParams = { id: entry.id };
    const repo = fakeRepository({ entries: [entry] });
    const tree = await mount(<EditLogEntry />, repo.repository);

    await press(control(tree, 'Increase'));
    expect(repo.day()[0].nutrition.calories).toBe(140);
  });

  it('removes an entry from the log', async () => {
    const entry = logged();
    mockParams = { id: entry.id };
    const repo = fakeRepository({ entries: [entry] });
    const tree = await mount(<EditLogEntry />, repo.repository);

    await press(control(tree, /remove from log/i));
    expect(repo.day()).toHaveLength(0);
  });

  it('stays editable after its food definition is gone', async () => {
    // The snapshot is the entry's own. A deleted custom food or an evicted
    // cache entry must not make a logged meal unopenable.
    const entry = logged();
    mockParams = { id: entry.id };
    const repo = fakeRepository({ entries: [entry] });
    const tree = await mount(<EditLogEntry />, repo.repository);

    expect(screen(tree)).toContain('Greek yogurt');
    await press(control(tree, /save/i));
    expect(repo.day()).toHaveLength(1);
  });

  it('says so plainly when the entry is already gone', async () => {
    mockParams = { id: 'entry:vanished' };
    const tree = await mount(<EditLogEntry />, fakeRepository().repository);
    expect(screen(tree)).toMatch(/no longer/i);
  });
});
