/**
 * Journey's three pillars inside an active Journey, and the wall between
 * release and the `__DEV__` preview (slices 6.3 → 6.5).
 *
 * Since 6.5 the pillars exist only inside a Journey, so every pillar test
 * seeds a real active Journey through storage and mounts the real route under
 * the real providers.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  Redirect: () => null,
  useLocalSearchParams: () => mockParams,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import Svg from 'react-native-svg';
import { act, type ReactTestRenderer } from 'react-test-renderer';
import Journey from '../../../app/(vita)/(tabs)/journey';
import JourneyPreview from '../../../app/(vita)/journey-preview';
import { JourneyKeys, toKg } from '../../../lib/journey';
import { elapsed, signedChange } from '../format';
import {
  TODAY,
  at,
  control,
  entry,
  hasControl,
  hasPillars,
  journeyFixture,
  mountApp,
  pillar,
  photoFiles,
  seedStorage,
  text,
  unmountApp,
} from './journeyHarness';

const ROOT = join(__dirname, '..', '..', '..', '..');
const ACTIVE = journeyFixture({ id: 'j-active', name: 'Summer Chapter' });

beforeEach(async () => {
  mockParams = {};
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

afterEach(async () => {
  await unmountApp();
});

function segment(tree: ReactTestRenderer, name: string) {
  return control(tree, `Journey, ${name}`);
}

async function mountActive(lbs: number[] = [180.4]) {
  await seedStorage({
    journeys: [ACTIVE],
    weights: lbs.map((lb, i) => entry(`w${i}`, at(10 - i, 7), lb, ACTIVE.id)),
  });
  jest.clearAllMocks();
  return mountApp(<Journey />);
}

/* ─── the three pillars, inside a Journey ───────────────────────────── */

describe('three first-class pillars inside an active Journey', () => {
  it('opens on Overview, with its selected state announced', async () => {
    const tree = await mountActive();
    expect(segment(tree, 'Overview').props.accessibilityState).toEqual({ selected: true });
    expect(segment(tree, 'Weight').props.accessibilityState).toEqual({ selected: false });
    expect(segment(tree, 'Photos').props.accessibilityState).toEqual({ selected: false });
  });

  it('Overview is the home of this Journey: its facts, then its Timeline (6.7)', async () => {
    const content = text(await mountActive());
    expect(content).toContain('Summer Chapter');
    for (const fact of ['STARTING', 'CURRENT', 'WEIGH-INS', 'TIMELINE', 'Journey began', 'Weight recorded']) {
      expect(content).toContain(fact);
    }
    // One weigh-in: nothing to compare, so no change.
    expect(content).not.toContain('CHANGE');
    expect(content).not.toMatch(/[−+]\d+\.\d lb/);
    // The 6.3–6.6 placeholder spine is gone; the planned end is a plan, not history.
    for (const gone of ['BEGAN', 'PLANNED END', 'What you record in this Journey will appear here']) expect(content).not.toContain(gone);
  });

  it('Weight shows this Journey’s history with its Log Weight action', async () => {
    const tree = await mountActive([180.4, 179.0]);
    await pillar(tree, 'Weight');
    expect(segment(tree, 'Weight').props.accessibilityState).toEqual({ selected: true });
    const content = text(tree);
    expect(content).toContain('179.0');
    expect(content).toContain('WEIGHT HISTORY · 2 ENTRIES');
    expect(control(tree, 'Log Weight')).toBeDefined();
  });

  it('Photos is a real pillar with its own private-history empty state and no action', async () => {
    const tree = await mountActive();
    await pillar(tree, 'Photos');
    const content = text(tree);
    expect(content).toContain('No progress photos yet');
    expect(content).toContain('Your private progress-photo history will live here');
    for (const social of ['like', 'share', 'feed', 'follow', 'post', 'add photo']) expect(content.toLowerCase()).not.toContain(social);
  });

  it('returns to Overview, and the selection is never persisted', async () => {
    const tree = await mountActive();
    await pillar(tree, 'Photos');
    await pillar(tree, 'Overview');
    expect(text(tree)).toContain('Journey began');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    await unmountApp();
    const again = await mountApp(<Journey />);
    expect(segment(again, 'Overview').props.accessibilityState).toEqual({ selected: true });
  });
});

/* ─── the real providers ─────────────────────────────────────────────── */

describe('release reads real Journey storage and never writes it on view', () => {
  it('reads the Journey keys, finds nothing, seeds nothing and writes nothing', async () => {
    const tree = await mountApp(<Journey />);
    const reads = (AsyncStorage.getItem as jest.Mock).mock.calls.map(([key]) => key);
    expect(reads).toEqual(expect.arrayContaining([JourneyKeys.weight, JourneyKeys.preferences, JourneyKeys.journeys]));
    expect(hasPillars(tree)).toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it('does not change the display unit on its own', async () => {
    await seedStorage({ unit: 'kg' });
    jest.clearAllMocks();
    await mountApp(<Journey />);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(JourneyKeys.preferences)).toBe(JSON.stringify({ unit: 'kg' }));
  });

  it('an active Journey is rendered from storage — release is wired to real data', async () => {
    const tree = await mountActive([172.4]);
    expect(text(tree)).toContain('172.4 lb');
    expect(tree.root.findAllByType(Svg)).toHaveLength(0);
  });
});

/* ─── release / preview isolation ────────────────────────────────────── */

const PREVIEW_ONLY = [
  '178.0',
  '186.4',
  '183.2',
  'Getting Back to Me',
  'Summer Transformation',
  'Marathon Prep',
  'Spring Reset',
  'Development progress photo placeholder',
  'DEVELOPMENT PREVIEW',
];

describe('the preview cannot leak into release', () => {
  it('no Journey renders the first-use screen — never a demo Journey', async () => {
    const content = text(await mountApp(<Journey />));
    expect(content).toContain('Start a New Journey');
    for (const fixture of PREVIEW_ONLY) expect(content).not.toContain(fixture);
  });

  it('a real active Journey shows none of the preview fixtures, on any pillar', async () => {
    const tree = await mountActive([163.7]);
    for (const name of ['Overview', 'Weight', 'Photos'] as const) {
      await pillar(tree, name);
      const content = text(tree);
      for (const fixture of PREVIEW_ONLY) expect(content).not.toContain(fixture);
    }
  });

  it('no release module imports the preview route or its fixtures', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const item of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, item.name);
        if (item.isDirectory()) {
          if (item.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(item.name) && !/-preview\.tsx$/.test(item.name)) {
          if (/from\s+['"][^'"]*journey-preview['"]/.test(readFileSync(full, 'utf8'))) offenders.push(full);
        }
      }
    };
    walk(join(ROOT, 'src'));
    expect(offenders).toEqual([]);
  });

  it('release hands Photos only the active Journey\'s real photos (6.6) — never a placeholder', () => {
    const source = readFileSync(join(ROOT, 'src/app/(vita)/(tabs)/journey.tsx'), 'utf8');
    expect(source).toMatch(/photos\s*\.photosFor\(activeId\)/);
    expect(source).toMatch(/photos: photoViews/);
    expect(source).not.toMatch(/placeholder:\s*true|journey-preview|showFuture/);
  });

  it('JourneyView has no default data — a caller must hand it a Journey and its data', () => {
    const source = readFileSync(join(ROOT, 'src/features/journey/components/JourneyView.tsx'), 'utf8');
    expect(source).toMatch(/export function JourneyView\(\{ journey, today, data,/);
    expect(source).not.toMatch(/\{\s*data\s*=/);
    expect(source).not.toMatch(/\{\s*journey\s*=/);
  });
});

describe('the DEV preview', () => {
  const states = ['none', 'early', 'established', 'ended', 'completed', 'library'];

  it.each(states)('renders "%s", labelled as fixtures, and never touches storage', async (state) => {
    mockParams = { state };
    const tree = await mountApp(<JourneyPreview />);
    expect(text(tree)).toContain('DEVELOPMENT PREVIEW · FIXTURE DATA, NOT A REAL JOURNEY');
    jest.clearAllMocks();
    for (const name of ['Weight', 'Photos', 'Overview'] as const) {
      if (hasPillars(tree)) await pillar(tree, name);
    }
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
    // 6.6: the preview's placeholder photos are drawn, never copied, saved or deleted.
    expect(photoFiles.copies).toEqual([]);
    expect(photoFiles.removed).toEqual([]);
  });

  it('preview photos are DEV-only placeholders with no Add, no detail, and no file', async () => {
    mockParams = { state: 'established' };
    const tree = await mountApp(<JourneyPreview />);
    await pillar(tree, 'Photos');
    expect(hasControl(tree, 'Add Progress Photo')).toBe(false);
    expect(tree.root.findAll((n) => /^Development progress photo placeholder/.test(n.props.accessibilityLabel ?? '')).length).toBeGreaterThan(0);
    expect(tree.root.findAll((n) => typeof n.props.onPress === 'function' && /progress photo/i.test(n.props.accessibilityLabel ?? ''))).toEqual([]);
  });

  it('shows every lifecycle state with its own real component', async () => {
    const expectations: Record<string, string[]> = {
      none: ['Start a New Journey'],
      early: ['Getting Back to Me', 'DAY 13 OF 90'],
      established: ['Summer Transformation', 'DAY 71 OF 90', 'CHANGE'],
      ended: ['Marathon Prep', 'Journey end date reached'],
      completed: ['COMPLETED', 'Spring Reset', 'FINAL'],
      library: ['PAST JOURNEYS', 'Spring Reset', 'New Year, Slowly'],
    };
    for (const [state, strings] of Object.entries(expectations)) {
      mockParams = { state };
      const tree = await mountApp(<JourneyPreview />);
      for (const value of strings) expect(text(tree)).toContain(value);
      await unmountApp();
    }
  });

  it('can write nothing: no Log Weight, no Start, no Manage', async () => {
    for (const state of ['none', 'established', 'ended', 'completed']) {
      mockParams = { state, pillar: 'weight' };
      const tree = await mountApp(<JourneyPreview />);
      const labels = tree.root.findAll((n) => typeof n.props.onPress === 'function').map((n) => n.props.accessibilityLabel);
      for (const action of ['Log Weight', 'Start a New Journey', 'Manage Journey', 'Extend Journey', 'Finish Journey']) {
        expect(labels).not.toContain(action);
      }
      await unmountApp();
    }
  });

  it('labels every placeholder photo as a development placeholder', async () => {
    mockParams = { state: 'established', pillar: 'photos' };
    const tree = await mountApp(<JourneyPreview />);
    const images = tree.root.findAll((node) => typeof node.type === 'string' && node.props.accessibilityRole === 'image');
    const photos = images.filter((node) => /photo/i.test(node.props.accessibilityLabel ?? ''));
    expect(photos.length).toBeGreaterThanOrEqual(6);
    for (const node of photos) expect(node.props.accessibilityLabel).toMatch(/Development progress photo placeholder, /);
  });

  it('describes change neutrally — never a verdict or a verdict colour', async () => {
    mockParams = { state: 'established', pillar: 'weight' };
    const tree = await mountApp(<JourneyPreview />);
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
      const content = text(await mountApp(<JourneyPreview />));
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

void act;
void TODAY;
