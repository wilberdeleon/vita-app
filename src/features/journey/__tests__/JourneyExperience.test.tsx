/**
 * Slice 6.3 — Journey's three pillars, and the wall between release and the
 * `__DEV__` preview.
 *
 * Release Journey renders real domain state only. The preview renders the
 * same components with fixtures declared inside the preview route. The tests
 * that matter most here are the isolation ones: an empty real history must
 * produce the empty pillars, never the populated preview.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), navigate: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Journey from '../../../app/(vita)/(tabs)/journey';
import JourneyPreview from '../../../app/(vita)/journey-preview';
import { JourneyKeys, toKg, type WeightEntry } from '../../../lib/journey';
import type { PreferencesRepository } from '../../../lib/preferences/data/PreferencesRepository';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { JourneyView } from '../components/JourneyView';
import { elapsed, signedChange } from '../format';

const ROOT = join(__dirname, '..', '..', '..', '..');
const theme: PreferencesRepository = { get: async () => ({ themeMode: 'light' }), save: async () => {} };

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement) {
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}
      >
        <ThemeProvider repository={theme}>{element}</ThemeProvider>
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
});

function text(tree: ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = node.props.children;
      return Array.isArray(children) ? children.join('') : String(children ?? '');
    })
    .join(' \n ');
}

function segment(tree: ReactTestRenderer, pillar: string) {
  return tree.root.findAll(
    (node) => node.props.accessibilityLabel === `Journey, ${pillar}` && typeof node.props.onPress === 'function',
  )[0];
}

async function select(tree: ReactTestRenderer, pillar: string) {
  await act(async () => segment(tree, pillar).props.onPress());
}

/* ─── the three pillars ──────────────────────────────────────────────── */

describe('three first-class pillars', () => {
  it('opens on Overview, with its selected state announced', async () => {
    const tree = await mount(<Journey />);
    expect(segment(tree, 'Overview').props.accessibilityState).toEqual({ selected: true });
    expect(segment(tree, 'Weight').props.accessibilityState).toEqual({ selected: false });
    expect(segment(tree, 'Photos').props.accessibilityState).toEqual({ selected: false });
  });

  it('Overview, empty, names what Journey is made of without inventing any of it', async () => {
    const content = text(await mount(<Journey />));
    expect(content).toContain('Journey brings together the weight and progress photos you record');
    expect(content).toContain('No weight entries yet.');
    expect(content).toContain('No progress photos yet.');
    expect(content).toContain('Your recorded Journey will appear here, in the order it happened.');
  });

  it('Weight, empty, says what belongs there — and is not Overview with a new title', async () => {
    const tree = await mount(<Journey />);
    await select(tree, 'Weight');
    expect(segment(tree, 'Weight').props.accessibilityState).toEqual({ selected: true });
    const content = text(tree);
    expect(content).toContain('No weight entries yet');
    expect(content).toContain('Every weigh-in you record is kept here with its date and time');
    expect(content).not.toContain('Journey brings together');
    expect(content).not.toContain('No progress photos yet');
  });

  it('Photos is a real pillar with its own private-history empty state', async () => {
    const tree = await mount(<Journey />);
    await select(tree, 'Photos');
    expect(segment(tree, 'Photos').props.accessibilityState).toEqual({ selected: true });
    const content = text(tree);
    expect(content).toContain('No progress photos yet');
    expect(content).toContain('Your private progress-photo history will live here');
    expect(content).not.toContain('No weight entries yet');
    // Social and feed vocabulary has no place in private history.
    for (const social of ['like', 'share', 'feed', 'follow', 'post']) expect(content.toLowerCase()).not.toContain(social);
  });

  it('returns to Overview, and the selection is never persisted', async () => {
    const tree = await mount(<Journey />);
    await select(tree, 'Photos');
    await select(tree, 'Overview');
    expect(text(tree)).toContain('Journey brings together');
    await select(tree, 'Weight');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();

    await act(async () => tree.unmount());
    mounted = null;
    const again = await mount(<Journey />);
    expect(segment(again, 'Overview').props.accessibilityState).toEqual({ selected: true });
  });
});

/* ─── the real provider ──────────────────────────────────────────────── */

describe('release reads real Journey storage and never writes it', () => {
  it('reads the Journey keys, finds nothing, seeds nothing and writes nothing', async () => {
    const tree = await mount(<Journey />);
    const reads = (AsyncStorage.getItem as jest.Mock).mock.calls.map(([key]) => key);
    expect(reads).toEqual(expect.arrayContaining([JourneyKeys.weight, JourneyKeys.preferences]));
    for (const pillar of ['Weight', 'Photos', 'Overview']) await select(tree, pillar);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('does not change the display unit on its own', async () => {
    await AsyncStorage.setItem(JourneyKeys.preferences, JSON.stringify({ unit: 'kg' }));
    jest.clearAllMocks();
    await mount(<Journey />);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(JourneyKeys.preferences)).toBe(JSON.stringify({ unit: 'kg' }));
  });

  it('renders a real stored weigh-in — release is wired to real data, not to nothing', async () => {
    const entry: WeightEntry = { id: 'real', loggedAt: new Date().toISOString(), weightKg: toKg(172.4, 'lb'), enteredUnit: 'lb' };
    await AsyncStorage.setItem(JourneyKeys.weight, JSON.stringify([entry]));
    const tree = await mount(<Journey />);
    expect(text(tree)).toContain('172.4');
    await select(tree, 'Weight');
    expect(text(tree)).toContain('172.4');
    // One entry is not a trend: no line, no change.
    expect(tree.root.findAllByType(Svg)).toHaveLength(0);
    expect(text(tree)).not.toMatch(/[−+]\d/);
  });
});

/* ─── release / preview isolation ────────────────────────────────────── */

/** Strings only the preview's fixtures can produce. */
const PREVIEW_ONLY = ['178.0', '186.4', '183.2', 'Development progress photo placeholder', 'DEVELOPMENT PREVIEW', 'Then', 'All photos', 'Latest photo'];

describe('the preview cannot leak into release', () => {
  it('an empty real history renders empty pillars — never the populated preview', async () => {
    const tree = await mount(<Journey />);
    for (const pillar of ['Overview', 'Weight', 'Photos']) {
      await select(tree, pillar);
      const content = text(tree);
      for (const fixture of PREVIEW_ONLY) expect(content).not.toContain(fixture);
    }
  });

  it('no release module imports the preview route or its fixtures', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name) && !/-preview\.tsx$/.test(entry.name)) {
          if (/from\s+['"][^'"]*journey-preview['"]/.test(readFileSync(full, 'utf8'))) offenders.push(full);
        }
      }
    };
    walk(join(ROOT, 'src'));
    expect(offenders).toEqual([]);
  });

  it('release hands Photos nothing but the frozen empty list', () => {
    const source = readFileSync(join(ROOT, 'src/app/(vita)/(tabs)/journey.tsx'), 'utf8');
    expect(source).toContain('const NO_PHOTOS: readonly JourneyPhotoView[] = Object.freeze([]);');
    expect(source).toMatch(/photos: NO_PHOTOS/);
    expect(source).not.toMatch(/placeholder:\s*true|SCENARIO|journey-preview/);
  });

  it('JourneyView has no default data — a caller must hand it something', () => {
    const source = readFileSync(join(ROOT, 'src/features/journey/components/JourneyView.tsx'), 'utf8');
    expect(source).toMatch(/export function JourneyView\(\{ data, initialPillar = 'overview' \}: Props\)/);
    // No default for `data` in the signature.
    expect(source).not.toMatch(/\{\s*data\s*=/);
  });
});

describe('the DEV preview', () => {
  it('renders the populated vision, clearly labelled, and writes nothing', async () => {
    mockParams = { state: 'established' };
    const tree = await mount(<JourneyPreview />);
    const content = text(tree);
    expect(content).toContain('DEVELOPMENT PREVIEW · FIXTURE DATA, NOT A REAL JOURNEY');
    expect(content).toContain('178.0');
    expect(content).toContain('−8.4 lb');
    for (const pillar of ['Weight', 'Photos', 'Overview']) await select(tree, pillar);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('labels every placeholder photo as a development placeholder', async () => {
    mockParams = { state: 'established', pillar: 'photos' };
    const tree = await mount(<JourneyPreview />);
    const images = tree.root.findAll((node) => typeof node.type === 'string' && node.props.accessibilityRole === 'image');
    const photos = images.filter((node) => /photo/i.test(node.props.accessibilityLabel ?? ''));
    expect(photos.length).toBeGreaterThanOrEqual(6); // Then, Now, and the grid of four
    for (const node of photos) expect(node.props.accessibilityLabel).toMatch(/Development progress photo placeholder, /);
    expect(text(tree)).toContain('THEN');
    expect(text(tree)).toContain('NOW');
    expect(text(tree)).toContain('10 weeks apart');
  });

  it('describes change neutrally — a signed number, never a verdict or a verdict colour', async () => {
    mockParams = { state: 'established', pillar: 'weight' };
    const tree = await mount(<JourneyPreview />);
    const content = text(tree).toLowerCase();
    for (const verdict of ['great', 'progress!', 'keep', 'well done', 'on track', 'goal', 'bmi', 'streak']) {
      expect(content).not.toContain(verdict);
    }
    const colours = tree.root
      .findAll((node) => typeof node.type === 'string')
      .flatMap((node) => [node.props.stroke, node.props.fill, ...[node.props.style].flat(3).map((s) => s?.color)])
      .filter(Boolean)
      .map((c: string) => c.toUpperCase());
    for (const verdict of ['#2E9E5B', '#E5484D']) expect(colours).not.toContain(verdict);
  });

  it('is not available outside development', async () => {
    const dev = (global as unknown as { __DEV__: boolean }).__DEV__;
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    try {
      mockParams = { state: 'established' };
      const content = text(await mount(<JourneyPreview />));
      expect(content).toContain('Not available.');
      expect(content).not.toContain('178.0');
    } finally {
      (global as unknown as { __DEV__: boolean }).__DEV__ = dev;
    }
  });
});

/* ─── neutral arithmetic ─────────────────────────────────────────────── */

describe('change is arithmetic', () => {
  it('signs both directions the same way, with a true minus', () => {
    expect(signedChange(toKg(186.4, 'lb'), toKg(178.0, 'lb'), 'lb')).toBe('−8.4 lb');
    expect(signedChange(toKg(178.0, 'lb'), toKg(186.4, 'lb'), 'lb')).toBe('+8.4 lb');
    expect(signedChange(80, 80, 'kg')).toBe('0.0 kg');
  });

  it('measures elapsed time from real instants', () => {
    const start = '2026-08-06T07:00:00.000Z';
    expect(elapsed(start, '2026-08-09T07:00:00.000Z')).toBe('3 days');
    expect(elapsed(start, '2026-10-15T07:00:00.000Z')).toBe('10 weeks');
    expect(elapsed(start, '2027-02-06T07:00:00.000Z')).toBe('6 months');
  });
});

/* JourneyView is exercised through both routes above; this pins that a
   direct render with nothing in it is the empty Overview. */
describe('JourneyView with empty data', () => {
  it('is the empty Overview', async () => {
    const tree = await mount(<JourneyView data={{ status: 'ready', weights: [], photos: [], unit: 'lb' }} />);
    expect(text(tree)).toContain('No weight entries yet.');
  });

  it('renders no pillar until the history has been read', async () => {
    const tree = await mount(<JourneyView data={{ status: 'loading', weights: [], photos: [], unit: 'lb' }} />);
    expect(text(tree)).not.toContain('No weight entries yet');
  });
});
