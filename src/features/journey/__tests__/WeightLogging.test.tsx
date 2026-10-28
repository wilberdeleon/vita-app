/**
 * Slice 6.4 — logging, history, edit and delete, through the real Journey
 * route over the real 6.2 repository (AsyncStorage's in-memory mock).
 *
 * Every assertion that matters reads storage as well as the screen: a weigh-in
 * is only real if it was saved, and the screen must never show what storage
 * does not hold.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockHaptic = jest.fn();
jest.mock('../../../lib/haptics', () => ({ vitaHaptic: (event: string) => mockHaptic(event) }));

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), navigate: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { act, create, type ReactTestRenderer, type ReactTestInstance } from 'react-test-renderer';
import Journey from '../../../app/(vita)/(tabs)/journey';
import JourneyPreview from '../../../app/(vita)/journey-preview';
import { PressableScale, ToastProvider } from '../../../components/ui';
import { JourneyKeys, toKg, type WeightEntry } from '../../../lib/journey';
import type { PreferencesRepository } from '../../../lib/preferences/data/PreferencesRepository';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { HISTORY_PAGE } from '../components/WeightPillar';

const theme: PreferencesRepository = { get: async () => ({ themeMode: 'light' }), save: async () => {} };

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement = <Journey />) {
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}
      >
        <ThemeProvider repository={theme}>
          <ToastProvider>{element}</ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

beforeEach(async () => {
  mockParams = {};
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
  jest.restoreAllMocks();
});

/* ─── helpers ───────────────────────────────────────────────────────── */

function text(tree: ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = node.props.children;
      return Array.isArray(children) ? children.join('') : String(children ?? '');
    })
    .join(' \n ');
}

function control(tree: ReactTestRenderer, label: string | RegExp): ReactTestInstance {
  const match = (value: unknown) => (typeof label === 'string' ? value === label : typeof value === 'string' && label.test(value));
  const found = tree.root.findAll((node) => match(node.props.accessibilityLabel) && typeof node.props.onPress === 'function');
  if (found.length) return found[0];
  // Chips and the toast's action are named by their visible text.
  for (const node of tree.root.findAllByType(Text)) {
    const children = node.props.children;
    if (!match(Array.isArray(children) ? children.join('') : children)) continue;
    let parent: ReactTestInstance | null = node.parent;
    while (parent && typeof parent.props.onPress !== 'function') parent = parent.parent;
    if (parent) return parent;
  }
  throw new Error(`No control labelled ${label}`);
}

function hasControl(tree: ReactTestRenderer, label: string | RegExp): boolean {
  try {
    control(tree, label);
    return true;
  } catch {
    return false;
  }
}

function field(tree: ReactTestRenderer, label: string): ReactTestInstance {
  return tree.root.findAll((node) => node.props.accessibilityLabel === label && typeof node.props.onChangeText === 'function')[0];
}

async function press(tree: ReactTestRenderer, label: string | RegExp) {
  await act(async () => control(tree, label).props.onPress());
}

async function type(tree: ReactTestRenderer, label: string, value: string) {
  await act(async () => field(tree, label).props.onChangeText(value));
}

async function pillar(tree: ReactTestRenderer, name: 'Overview' | 'Weight' | 'Photos') {
  await press(tree, `Journey, ${name}`);
}

async function stored(): Promise<WeightEntry[]> {
  const raw = await AsyncStorage.getItem(JourneyKeys.weight);
  return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
}

function at(daysAgo: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function entry(id: string, iso: string, lb: number): WeightEntry {
  return { id, loggedAt: iso, weightKg: toKg(lb, 'lb'), enteredUnit: 'lb' };
}

async function seed(entries: WeightEntry[], unit?: 'lb' | 'kg') {
  await AsyncStorage.setItem(JourneyKeys.weight, JSON.stringify(entries));
  if (unit) await AsyncStorage.setItem(JourneyKeys.preferences, JSON.stringify({ unit }));
  jest.clearAllMocks();
}

/** A time earlier today that is safely in the past whenever the test runs. */
function earlierToday(): { iso: string; time: string } {
  const now = new Date();
  const date = new Date(now.getTime() - 60 * 60 * 1000);
  if (date.getDate() !== now.getDate()) date.setTime(now.getTime() - 60 * 1000);
  date.setSeconds(0, 0);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return { iso: date.toISOString(), time };
}

async function openWeight() {
  const tree = await mount();
  await pillar(tree, 'Weight');
  return tree;
}

/* ─── 6.4A logging ─────────────────────────────────────────────────── */

describe('logging a weight', () => {
  it('logs the first real entry: canonical kg stored, sheet closed, pillar populated', async () => {
    const tree = await openWeight();
    expect(text(tree)).toContain('No weight entries yet');
    await press(tree, 'Log Weight');
    expect(text(tree)).toContain('Log Weight');
    await type(tree, 'Weight in pounds', '180');
    await press(tree, 'Log 180.0 pounds');

    const saved = await stored();
    expect(saved).toHaveLength(1);
    expect(saved[0].weightKg).toBe(180 * 0.45359237);
    expect(saved[0].enteredUnit).toBe('lb');
    expect(Math.abs(Date.parse(saved[0].loggedAt) - Date.now())).toBeLessThan(5_000);
    expect(mockHaptic).toHaveBeenCalledWith('confirm');

    const content = text(tree);
    expect(hasControl(tree, 'Log 180.0 pounds')).toBe(false); // sheet closed
    expect(content).toContain('180.0');
    expect(content).toContain('WEIGHT HISTORY · 1 ENTRY');
    expect(content).toContain('TODAY');
  });

  it('shows one entry as one entry — no change, no comparison, no chart', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '180');
    await press(tree, 'Log 180.0 pounds');
    const content = text(tree);
    expect(content).not.toContain('since previous entry');
    expect(content).not.toMatch(/[\u2212+]\d+\.\d/);
    expect(tree.root.findAllByType(Svg)).toHaveLength(0);
  });

  it('logs in kg without touching the Journey display unit', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await press(tree, 'Weight unit, kg');
    expect(text(tree)).toContain('Recording this weigh-in in kilograms. Journey still shows pounds.');
    await type(tree, 'Weight in kilograms', '81.6');
    await press(tree, 'Log 81.6 kilograms');
    const saved = await stored();
    expect(saved[0].weightKg).toBe(81.6);
    expect(saved[0].enteredUnit).toBe('kg');
    expect(await AsyncStorage.getItem(JourneyKeys.preferences)).toBeNull();
    expect(text(tree)).toContain('179.9'); // still displayed in lb
  });

  it('converts a typed value when the unit changes — 180 lb becomes 81.6 kg, not 180 kg', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '180');
    await press(tree, 'Weight unit, kg');
    expect(field(tree, 'Weight in kilograms').props.value).toBe('81.6');
  });

  it('accepts decimals', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '180.4');
    await press(tree, 'Log 180.4 pounds');
    expect((await stored())[0].weightKg).toBe(toKg(180.4, 'lb'));
  });

  it.each(['0', '-5', '0.0', 'abc', '18o', '1.2.3'])('refuses %p — nothing can be saved', async (value) => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', value);
    const save = control(tree, 'Log Weight, enter a weight first');
    expect(save.props.disabled).toBe(true);
    await act(async () => save.props.onPress());
    expect(await stored()).toEqual([]);
  });

  it('has no medical bounds — 600 lb and 40 lb are both weights', async () => {
    const tree = await openWeight();
    for (const value of ['600', '40']) {
      await press(tree, 'Log Weight');
      await type(tree, 'Weight in pounds', value);
      await press(tree, `Log ${value}.0 pounds`);
    }
    expect(await stored()).toHaveLength(2);
  });

  it('records an earlier weigh-in at the date and time given', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '179');
    await press(tree, /^When, /);
    await press(tree, 'Yesterday');
    await type(tree, 'Time, hours colon minutes', '07:30');
    await press(tree, 'Log 179.0 pounds');
    expect((await stored())[0].loggedAt).toBe(at(1, 7, 30));
    expect(text(tree)).toContain('YESTERDAY');
  });

  it('refuses a time in the future', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '179');
    await press(tree, /^When, /);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const key = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    await type(tree, 'Date, year dash month dash day', key);
    expect(text(tree)).toContain('That time hasn’t happened yet.');
    const save = control(tree, 'Log 179.0 pounds');
    expect(save.props.disabled).toBe(true);
    await act(async () => save.props.onPress());
    expect(await stored()).toEqual([]);
  });

  it('closing the sheet writes nothing', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '180');
    await press(tree, 'Close');
    expect(await stored()).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
    expect(text(tree)).toContain('No weight entries yet');
  });

  it('the number pad’s Done dismisses the keyboard and saves nothing', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '180');
    await press(tree, 'Done, close the number pad');
    expect(await stored()).toEqual([]);
    expect(hasControl(tree, 'Log 180.0 pounds')).toBe(true); // still open, value kept
  });

  it('a failed write keeps the sheet open and warns', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '180');
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    await press(tree, 'Log 180.0 pounds');
    expect(mockHaptic).toHaveBeenCalledWith('warn');
    expect(mockHaptic).not.toHaveBeenCalledWith('confirm');
    expect(hasControl(tree, 'Log 180.0 pounds')).toBe(true);
  });
});

/* ─── same-day entries ─────────────────────────────────────────────── */

describe('several weigh-ins in one day', () => {
  it('keeps both, the newer is current, and times tell them apart', async () => {
    await seed([entry('am', at(0, 0, 1), 180.2)]);
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '181');
    await press(tree, 'Log 181.0 pounds');

    const saved = await stored();
    expect(saved).toHaveLength(2);
    expect(new Set(saved.map((e) => e.id)).size).toBe(2);
    const content = text(tree);
    expect(content).toContain('WEIGHT HISTORY · 2 ENTRIES');
    expect(content).toContain('+0.8 lb');
    expect(content).toContain('since previous entry');
    expect(content).toContain('12:01 AM');
    expect(content.match(/TODAY/g)).toHaveLength(1);
  });
});

/* ─── 6.4B history ─────────────────────────────────────────────────── */

describe('history', () => {
  it('is newest first and grouped by local day', async () => {
    await seed([entry('old', at(9, 8), 184), entry('y', at(1, 8), 182), entry('t', at(0, 0, 5), 181)]);
    const tree = await openWeight();
    const content = text(tree);
    const order = ['TODAY', 'YESTERDAY'].map((label) => content.indexOf(label));
    expect(order[0]).toBeGreaterThan(-1);
    expect(order[1]).toBeGreaterThan(order[0]);
    expect(content.indexOf('181.0 lb')).toBeLessThan(content.indexOf('182.0 lb'));
    expect(content.indexOf('182.0 lb')).toBeLessThan(content.indexOf('184.0 lb'));
  });

  it('speaks each row as weight, date and time', async () => {
    await seed([entry('t', at(0, 0, 5), 181)]);
    const tree = await openWeight();
    expect(hasControl(tree, /^181\.0 pounds, \w+day, \w+ \d+ at 12:05 AM$/)).toBe(true);
  });

  it(`renders ${HISTORY_PAGE} rows at a time, then pages`, async () => {
    const many = Array.from({ length: 120 }, (_, i) => entry(`e${i}`, at(i, 8), 180 + (i % 7) / 10));
    await seed(many);
    const tree = await openWeight();
    const rows = () => tree.root.findAllByType(PressableScale).filter((n) => /pounds, .* at /.test(n.props.accessibilityLabel ?? ''));
    expect(rows()).toHaveLength(HISTORY_PAGE);
    expect(text(tree)).toContain(`Show earlier entries · ${120 - HISTORY_PAGE} more`);
    await press(tree, /^Show earlier entries/);
    expect(rows()).toHaveLength(HISTORY_PAGE * 2);
  });

  it('switching the display unit changes display only, never stored values', async () => {
    await seed([entry('a', at(1, 8), 180), entry('b', at(0, 0, 5), 178)]);
    const before = await AsyncStorage.getItem(JourneyKeys.weight);
    const tree = await openWeight();
    await press(tree, 'Show weight in, kg');
    expect(text(tree)).toContain('80.7');
    expect(text(tree)).toContain('81.6 kg');
    expect(await AsyncStorage.getItem(JourneyKeys.weight)).toBe(before);
    expect(JSON.parse((await AsyncStorage.getItem(JourneyKeys.preferences))!)).toEqual({ unit: 'kg' });
  });
});

/* ─── 6.4C edit / delete ───────────────────────────────────────────── */

describe('editing an entry', () => {
  it('changes that entry only and keeps its id', async () => {
    await seed([entry('a', at(1, 8), 180), entry('b', at(0, 0, 5), 178)]);
    const tree = await openWeight();
    await press(tree, /^180\.0 pounds, /);
    expect(text(tree)).toContain('Edit Weight');
    expect(field(tree, 'Weight in pounds').props.value).toBe('180.0');
    await type(tree, 'Weight in pounds', '179.4');
    await press(tree, 'Save 179.4 pounds');

    const saved = await stored();
    expect(saved.find((e) => e.id === 'a')!.weightKg).toBe(toKg(179.4, 'lb'));
    expect(saved.find((e) => e.id === 'b')).toEqual(entry('b', at(0, 0, 5), 178));
    expect(saved.map((e) => e.id).sort()).toEqual(['a', 'b']);
  });

  it('switching unit converts and, untouched, keeps the exact stored kilograms', async () => {
    const original = entry('a', at(0, 0, 5), 180);
    await seed([original]);
    const tree = await openWeight();
    await press(tree, /^180\.0 pounds, /);
    await press(tree, 'Weight unit, kg');
    expect(field(tree, 'Weight in kilograms').props.value).toBe('81.6');
    await press(tree, 'Save 81.6 kilograms');
    const [saved] = await stored();
    expect(saved.id).toBe('a');
    expect(saved.enteredUnit).toBe('kg');
    expect(saved.weightKg).toBeCloseTo(original.weightKg, 10);
  });

  it('can move an entry in time, and the current weight follows', async () => {
    await seed([entry('a', at(2, 8), 180), entry('b', at(1, 8), 178)]);
    const tree = await openWeight();
    await press(tree, /^180\.0 pounds, /);
    const { iso, time } = earlierToday();
    await press(tree, /^When, /);
    await press(tree, 'Today');
    await type(tree, 'Time, hours colon minutes', time);
    await press(tree, 'Save 180.0 pounds');
    const saved = await stored();
    expect(saved.find((e) => e.id === 'a')!.loggedAt).toBe(iso);
    expect(saved.find((e) => e.id === 'a')!.weightKg).toBe(toKg(180, 'lb'));
    expect(text(tree)).toContain('+2.0 lb');
  });
});

describe('deleting an entry', () => {
  function confirmWith(choice: 'Delete' | 'Cancel') {
    return jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      buttons?.find((button) => button.text === choice)?.onPress?.();
    });
  }

  it('asks first, naming the entry, and Cancel deletes nothing', async () => {
    await seed([entry('a', at(0, 0, 5), 178)]);
    const alert = confirmWith('Cancel');
    const tree = await openWeight();
    await press(tree, /^178\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    expect(alert).toHaveBeenCalledWith('Delete weight entry?', expect.stringContaining('178.0 lb · Today, 12:05 AM'), expect.anything());
    expect(await stored()).toHaveLength(1);
  });

  it('deleting the newest removes only it and the previous becomes current', async () => {
    await seed([entry('a', at(1, 8), 180), entry('b', at(0, 0, 5), 178)]);
    confirmWith('Delete');
    const tree = await openWeight();
    await press(tree, /^178\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    expect((await stored()).map((e) => e.id)).toEqual(['a']);
    expect(text(tree)).toContain('WEIGHT HISTORY · 1 ENTRY');
    expect(text(tree)).toContain('180.0');
    expect(text(tree)).toContain('Weight entry deleted');
  });

  it('deleting an older entry leaves the current weight alone', async () => {
    await seed([entry('a', at(1, 8), 180), entry('b', at(0, 0, 5), 178)]);
    confirmWith('Delete');
    const tree = await openWeight();
    await press(tree, /^180\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    expect((await stored()).map((e) => e.id)).toEqual(['b']);
    expect(hasControl(tree, /^178\.0 pounds, /)).toBe(true);
  });

  it('Undo puts the exact entry back', async () => {
    const original = entry('a', at(0, 0, 5), 178);
    await seed([original]);
    confirmWith('Delete');
    const tree = await openWeight();
    await press(tree, /^178\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    expect(await stored()).toEqual([]);
    await press(tree, /Undo/);
    expect(await stored()).toEqual([original]);
  });

  it('deleting the last entry returns Weight and Overview to the truthful empty state', async () => {
    await seed([entry('a', at(0, 0, 5), 178)]);
    confirmWith('Delete');
    const tree = await openWeight();
    await press(tree, /^178\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    expect(text(tree)).toContain('No weight entries yet');
    expect(text(tree)).not.toContain('178.0');
    await pillar(tree, 'Overview');
    expect(text(tree)).toContain('No weight entries yet.');
    expect(text(tree)).not.toContain('178.0');
  });
});

/* ─── 6.4D Overview ────────────────────────────────────────────────── */

describe('Overview with real weight', () => {
  it('fills only the Weight node — latest weight and when, at body size', async () => {
    await seed([entry('a', at(1, 8), 180), entry('b', at(0, 0, 5), 178)]);
    const tree = await mount();
    const content = text(tree);
    expect(content).toContain('178.0 lb');
    expect(content).toContain('Today, 12:05 AM');
    expect(content).not.toContain('180.0'); // latest only
    expect(content).toContain('No progress photos yet.');
    expect(content).toContain('Your recorded Journey will appear here');
    for (const absent of ['LATEST WEIGHT', 'since', 'Weigh-in', 'goal', 'BMI', 'Journey began', 'First record']) {
      expect(content).not.toContain(absent);
    }
    expect(tree.root.findAllByType(Svg)).toHaveLength(0);
    // Weight is a node on the spine, not a hero.
    const big = tree.root.findAllByType(Text).filter((n) => [n.props.style].flat(3).some((s) => s && s.fontSize >= 32));
    expect(big).toHaveLength(0);
  });

  it('release never draws the 6.7 trend line, on any pillar', async () => {
    await seed(Array.from({ length: 8 }, (_, i) => entry(`e${i}`, at(i, 8), 180 - i)));
    const tree = await mount();
    for (const name of ['Overview', 'Weight', 'Photos'] as const) {
      await pillar(tree, name);
      expect(tree.root.findAllByType(Svg)).toHaveLength(0);
    }
  });
});

/* ─── preview isolation, now that release writes ───────────────────── */

describe('real data and the DEV preview stay apart', () => {
  it('a real logged weight never appears in the preview, and the preview cannot write', async () => {
    const tree = await openWeight();
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '163.7');
    await press(tree, 'Log 163.7 pounds');
    const before = await AsyncStorage.getItem(JourneyKeys.weight);
    await act(async () => tree.unmount());
    mounted = null;
    jest.clearAllMocks();

    mockParams = { state: 'established', pillar: 'weight' };
    const preview = await mount(<JourneyPreview />);
    expect(text(preview)).toContain('178.0');
    expect(text(preview)).not.toContain('163.7');
    expect(hasControl(preview, 'Log Weight')).toBe(false);
    expect(hasControl(preview, /^178\.0 pounds, /)).toBe(false); // rows are read-only
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(JourneyKeys.weight)).toBe(before);
  });

  it('real Journey with real data shows none of the preview fixtures', async () => {
    await seed([entry('a', at(0, 0, 5), 163.7)]);
    const tree = await mount();
    for (const name of ['Overview', 'Weight', 'Photos'] as const) {
      await pillar(tree, name);
      const content = text(tree);
      for (const fixture of ['178.0', '186.4', 'Development progress photo placeholder', 'DEVELOPMENT PREVIEW']) {
        expect(content).not.toContain(fixture);
      }
    }
  });
});
