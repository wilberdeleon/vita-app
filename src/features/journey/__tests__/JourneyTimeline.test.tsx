/**
 * Slice 6.7 — the unified Journey Timeline through the real routes and
 * providers. The timeline is derived, so every change to a weigh-in or a
 * photo must show up in it with no timeline storage at all.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: (...args: unknown[]) => mockPush(...args), navigate: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  Redirect: () => null,
  useLocalSearchParams: () => mockParams,
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Svg from 'react-native-svg';
import { act, type ReactTestRenderer } from 'react-test-renderer';
import Journey from '../../../app/(vita)/(tabs)/journey';
import JourneyDetail from '../../../app/(vita)/journey/[id]';
import JourneyPreview from '../../../app/(vita)/journey-preview';
import PhotoDetail from '../../../app/(vita)/journey/photo/[id]';
import { shiftLogDate } from '../../../lib/daily';
import { TIMELINE_INITIAL, TIMELINE_STEP } from '../components/JourneyTimeline';
import {
  TODAY,
  at,
  entry,
  hasControl,
  journeyFixture,
  mountApp,
  photoFiles,
  photoFixture,
  pillar,
  press,
  seedPhotos,
  seedStorage,
  text,
  type,
  unmountApp,
} from './journeyHarness';

const ACTIVE = journeyFixture({ id: 'j-a', name: 'Summer Transformation' }); // started 10 days ago
const OTHER = journeyFixture({
  id: 'j-b',
  name: 'Other Chapter',
  startDate: shiftLogDate(TODAY, -120),
  plannedEndDate: shiftLogDate(TODAY, -40),
  status: 'completed',
  completedAt: at(45, 18),
});

beforeEach(async () => {
  mockParams = {};
  await AsyncStorage.clear();
  photoFiles.reset();
  jest.clearAllMocks();
});

afterEach(async () => {
  await unmountApp();
  jest.restoreAllMocks();
});

/** Every timeline item, in render order, by its spoken label. */
function timeline(tree: ReactTestRenderer): string[] {
  // Scoped to the Journey screen when one is mounted, so another screen's labels never count.
  const screens = tree.root.findAll((n) => n.type === Journey);
  const labels = (screens[0] ?? tree.root)
    .findAll((n) => typeof n.props.accessibilityLabel === 'string' && /^(Journey began|Journey completed|Weight recorded|Progress photo|Milestone),/.test(n.props.accessibilityLabel) && n.props.accessible !== false)
    .map((n) => n.props.accessibilityLabel as string);
  return labels.filter((label, i) => label !== labels[i - 1]);
}

const kinds = (tree: ReactTestRenderer) => timeline(tree).map((label) => label.split(',')[0]);

async function overview(weights = [entry('w0', at(10, 7), 180, ACTIVE.id)], photos: ReturnType<typeof photoFixture>[] = []) {
  await seedStorage({ journeys: [ACTIVE, OTHER], weights });
  if (photos.length) await seedPhotos(photos);
  return mountApp(<Journey />);
}

describe('Overview Timeline', () => {
  it('a new Journey: its starting weight, then Journey began — nothing invented, no placeholder', async () => {
    const tree = await overview();
    expect(text(tree)).toContain('TIMELINE');
    expect(timeline(tree)).toEqual([
      expect.stringMatching(/^Weight recorded, 180\.0 pounds, /),
      `Journey began, ${ACTIVE.startDate.replace(/^(\d+)-(\d+)-(\d+)$/, (_m, y, mo, d) => `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][Number(mo) - 1]} ${Number(d)}, ${y}`)}`,
    ]);
    for (const gone of ['No timeline', 'What you record in this Journey will appear here', 'PLANNED END']) expect(text(tree)).not.toContain(gone);
  });

  it('newest first, weigh-ins and photos together, only this Journey’s', async () => {
    const tree = await overview(
      [entry('w0', at(10, 7), 180, ACTIVE.id), entry('w1', at(3, 7), 179, ACTIVE.id), entry('x', at(2, 7), 150, OTHER.id), entry('legacy', at(2, 8), 151)],
      [photoFixture('p1', ACTIVE.id, at(5, 19)), photoFixture('px', OTHER.id, at(60, 8))],
    );
    expect(kinds(tree)).toEqual(['Weight recorded', 'Progress photo', 'Weight recorded', 'Journey began']);
    expect(text(tree)).not.toContain('150.0');
    expect(text(tree)).not.toContain('151.0');
    expect(timeline(tree)[1]).toMatch(/^Progress photo, the first in this Journey, /);
  });

  it('shows the latest items first and reveals earlier ones until the beginning is reached', async () => {
    const many = Array.from({ length: 40 }, (_, i) => entry(`w${i}`, at(9 - Math.floor(i / 5), 6 + (i % 5)), 180 - i / 10, ACTIVE.id));
    const tree = await overview(many);
    const total = 40 + 1 + 2; // weigh-ins + began + 5 and 10 milestones
    expect(timeline(tree)).toHaveLength(TIMELINE_INITIAL);
    expect(kinds(tree)).not.toContain('Journey began');
    await press(tree, /^Show earlier, /);
    expect(timeline(tree)).toHaveLength(TIMELINE_INITIAL + TIMELINE_STEP);
    await press(tree, /^Show earlier, /);
    expect(timeline(tree)).toHaveLength(total);
    expect(kinds(tree).at(-1)).toBe('Journey began');
    expect(hasControl(tree, /^Show earlier/)).toBe(false);
  });

  it('weight is neutral and never interactive in the timeline; no chart, no Then-vs-Now', async () => {
    const tree = await overview([entry('w0', at(10, 7), 180, ACTIVE.id), entry('w1', at(1, 7), 184, ACTIVE.id), entry('w2', at(0, 0, 5), 178, ACTIVE.id)]);
    expect(tree.root.findAll((n) => /^Weight recorded/.test(n.props.accessibilityLabel ?? '') && typeof n.props.onPress === 'function')).toHaveLength(0);
    expect(tree.root.findAllByType(Svg)).toHaveLength(0);
    const content = text(tree).toLowerCase();
    for (const word of ['then', 'progress!', 'gain', 'loss', 'lost', 'great', 'keep it up', 'streak', 'achieved', 'badge']) expect(content).not.toContain(word);
  });

  it('a photo item opens the existing photo detail', async () => {
    const tree = await overview(undefined, [photoFixture('p1', ACTIVE.id, at(2, 19))]);
    await press(tree, /^Progress photo, the first in this Journey, /);
    expect(mockPush).toHaveBeenCalledWith('/journey/photo/p1');
  });

  it('milestones are factual markers: 5 weigh-ins, 5 progress photos, dated by the record that crossed it', async () => {
    const weights = [9, 8, 7, 6, 5].map((d, i) => entry(`w${i}`, at(d, 7), 180, ACTIVE.id));
    const photos = [9, 8, 7, 6, 4].map((d, i) => photoFixture(`p${i}`, ACTIVE.id, at(d, 19)));
    const tree = await overview(weights, photos);
    const milestones = timeline(tree).filter((l) => l.startsWith('Milestone'));
    expect(milestones).toEqual([expect.stringMatching(/^Milestone, 5 progress photos recorded, /), expect.stringMatching(/^Milestone, 5 weigh-ins recorded, /)]);
    expect(text(tree)).not.toMatch(/achiev|congrat|unlocked|badge/i);
  });

  it('30 days into this Journey once Day 30 is reached, dated Day 30', async () => {
    const long = journeyFixture({ id: 'j-a', name: 'Long', startDate: shiftLogDate(TODAY, -40), plannedEndDate: shiftLogDate(TODAY, 49) });
    await seedStorage({ journeys: [long], weights: [entry('w0', at(40, 7), 180, 'j-a')] });
    const tree = await mountApp(<Journey />);
    expect(timeline(tree)).toContain(
      `Milestone, 30 days into this Journey, ${(() => {
        const [y, m, d] = shiftLogDate(long.startDate, 29).split('-').map(Number);
        return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${d}, ${y}`;
      })()}`,
    );
  });
});

describe('live — the timeline follows its records with no timeline storage', () => {
  it('log, edit and delete a weigh-in', async () => {
    const tree = await overview([entry('w0', at(10, 7), 180, ACTIVE.id), entry('w1', at(1, 8), 178, ACTIVE.id)]);
    await pillar(tree, 'Weight');
    await press(tree, 'Log Weight');
    await type(tree, 'Weight in pounds', '177.2');
    await press(tree, 'Log 177.2 pounds');
    await pillar(tree, 'Overview');
    expect(timeline(tree)[0]).toMatch(/^Weight recorded, 177\.2 pounds/);

    await pillar(tree, 'Weight');
    await press(tree, /^178\.0 pounds, /);
    await type(tree, 'Weight in pounds', '176.0');
    await press(tree, 'Save 176.0 pounds');
    await pillar(tree, 'Overview');
    expect(timeline(tree).join('|')).toContain('176.0 pounds');
    expect(timeline(tree).join('|')).not.toContain('178.0 pounds');

    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.text === 'Delete')?.onPress?.());
    await pillar(tree, 'Weight');
    await press(tree, /^176\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    await pillar(tree, 'Overview');
    expect(timeline(tree).join('|')).not.toContain('176.0 pounds');
    expect((await AsyncStorage.getAllKeys()).filter((k) => /timeline|milestone/i.test(k))).toEqual([]);
  });

  it('deleting below a threshold removes the milestone', async () => {
    const weights = [9, 8, 7, 6, 5].map((d, i) => entry(`w${i}`, at(d, 7), 180 + i, ACTIVE.id));
    const tree = await overview(weights);
    expect(kinds(tree)).toContain('Milestone');
    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.text === 'Delete')?.onPress?.());
    await pillar(tree, 'Weight');
    await press(tree, /^184\.0 pounds, /);
    await press(tree, 'Delete this weight entry');
    await pillar(tree, 'Overview');
    expect(kinds(tree)).not.toContain('Milestone');
  });

  it('re-dating a photo moves its item; deleting it removes it', async () => {
    const photo = photoFixture('p1', ACTIVE.id, at(1, 19));
    await seedStorage({ journeys: [ACTIVE], weights: [entry('w0', at(10, 7), 180, ACTIVE.id), entry('w1', at(3, 7), 179, ACTIVE.id)] });
    await seedPhotos([photo]);
    mockParams = { id: 'p1' };
    const detail = await mountApp(<PhotoDetail />);
    await press(detail, 'Change date and time');
    await type(detail, 'Date, year dash month dash day', shiftLogDate(TODAY, -5));
    await type(detail, 'Time, hours colon minutes', '07:00');
    await press(detail, 'Save');
    await unmountApp();

    let tree = await mountApp(<Journey />);
    expect(kinds(tree)).toEqual(['Weight recorded', 'Progress photo', 'Weight recorded', 'Journey began']);
    await unmountApp();

    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.text === 'Delete')?.onPress?.());
    const again = await mountApp(<PhotoDetail />);
    await press(again, 'Delete this progress photo');
    await act(async () => new Promise((resolve) => setImmediate(resolve)));
    await unmountApp();
    tree = await mountApp(<Journey />);
    expect(kinds(tree)).not.toContain('Progress photo');
  });
});

describe('live while Overview stays mounted (as it does under the photo detail screen)', () => {
  it('a re-date or delete made elsewhere updates the mounted timeline at once', async () => {
    await seedStorage({ journeys: [ACTIVE], weights: [entry('w0', at(10, 7), 180, ACTIVE.id), entry('w1', at(3, 7), 179, ACTIVE.id)] });
    await seedPhotos([photoFixture('p1', ACTIVE.id, at(1, 19))]);
    mockParams = { id: 'p1' };
    const tree = await mountApp(
      <>
        <Journey />
        <PhotoDetail />
      </>,
    );
    expect(kinds(tree)).toEqual(['Progress photo', 'Weight recorded', 'Weight recorded', 'Journey began']);
    await press(tree, 'Change date and time');
    await type(tree, 'Date, year dash month dash day', shiftLogDate(TODAY, -5));
    await type(tree, 'Time, hours colon minutes', '07:00');
    await press(tree, 'Save');
    expect(kinds(tree)).toEqual(['Weight recorded', 'Progress photo', 'Weight recorded', 'Journey began']);

    jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons) => buttons?.find((b) => b.text === 'Delete')?.onPress?.());
    await press(tree, 'Delete this progress photo');
    await act(async () => new Promise((resolve) => setImmediate(resolve)));
    expect(kinds(tree)).toEqual(['Weight recorded', 'Weight recorded', 'Journey began']);
  });
});

describe('a finished Journey', () => {
  it('opens on its Timeline: Journey completed at the top, Journey began reachable at the bottom, read-only', async () => {
    const done = journeyFixture({
      id: 'j-d',
      name: 'Spring Reset',
      startDate: shiftLogDate(TODAY, -100),
      plannedEndDate: shiftLogDate(TODAY, -10),
      status: 'completed',
      completedAt: at(9, 18),
    });
    await seedStorage({ journeys: [done, ACTIVE], weights: [entry('d0', at(100, 7), 190, 'j-d'), entry('d1', at(50, 7), 186, 'j-d'), entry('a0', at(5, 7), 150, ACTIVE.id)] });
    await seedPhotos([photoFixture('dp', 'j-d', at(60, 19))]);
    mockParams = { id: 'j-d' };
    const tree = await mountApp(<JourneyDetail />);
    expect(kinds(tree)).toEqual(['Journey completed', 'Weight recorded', 'Progress photo', 'Milestone', 'Weight recorded', 'Journey began']);
    expect(timeline(tree)[0]).toMatch(/^Journey completed, .*, ran 92 days$/);
    expect(text(tree)).not.toContain('150.0');
    for (const action of ['Log Weight', 'Add Progress Photo', 'Manage Journey', 'Change date and time', 'Delete this progress photo']) {
      expect(hasControl(tree, action)).toBe(false);
    }
    // Its Weight and Photos stay reachable, read-only.
    await pillar(tree, 'Weight');
    expect(text(tree)).toContain('186.0');
    expect(hasControl(tree, 'Log Weight')).toBe(false);
  });
});

describe('the DEV preview', () => {
  it('renders fixture timelines with milestones and writes nothing', async () => {
    mockParams = { state: 'established' };
    const tree = await mountApp(<JourneyPreview />);
    const all = () => tree.root.findAll((n) => /^Show earlier/.test(n.props.accessibilityLabel ?? '') && typeof n.props.onPress === 'function');
    while (all().length) await act(async () => all()[0].props.onPress());
    const labels = timeline(tree);
    for (const milestone of ['5 weigh-ins recorded', '10 weigh-ins recorded', '5 progress photos recorded', '30 days into this Journey']) {
      expect(labels.some((l) => l.includes(milestone))).toBe(true);
    }
    // Preview photos are placeholders: they open nothing.
    expect(tree.root.findAll((n) => /^Progress photo/.test(n.props.accessibilityLabel ?? '') && typeof n.props.onPress === 'function')).toHaveLength(0);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
    expect(photoFiles.copies).toEqual([]);
  });

  it('completed preview ends its chapter with Journey completed', async () => {
    mockParams = { state: 'completed' };
    const tree = await mountApp(<JourneyPreview />);
    expect(kinds(tree)[0]).toBe('Journey completed');
    expect(kinds(tree).at(-1)).toBe('Journey began');
  });
});
