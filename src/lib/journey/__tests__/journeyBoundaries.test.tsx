/**
 * Slice 6.7 corrections, at the provider/domain boundary:
 *
 * 1. A Journey-owned weigh-in may not be dated before its Journey's start
 *    day — enforced by `WeightProvider` for every write path, whatever UI
 *    (or code) makes the call. Legacy unowned weigh-ins are untouched.
 * 2. Extend records its own history in the same Journey write: one entry per
 *    successful extension, none otherwise, never inferred for old Journeys.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { fromLogDate, shiftLogDate } from '../../daily/dates';
import { asyncStorageJourneyRepository, parseJourney } from '../data/asyncStorageJourneyRepository';
import type { JourneyRepository } from '../data/JourneyRepository';
import { JourneyKeys } from '../data/keys';
import type { WeightRepository } from '../data/WeightRepository';
import { isWithinJourneyStart, journeyExtensions, type Journey } from '../model/journeys';
import { deriveJourneyTimeline } from '../model/timeline';
import { toKg } from '../model/units';
import type { WeightEntry } from '../model/types';
import { JourneyProvider, useJourneys, type JourneyContextValue } from '../state/JourneyProvider';
import { WeightProvider, useWeight, type WeightContextValue } from '../state/WeightProvider';

const START = '2026-10-29';
const TODAY = '2026-11-10';

/** Local instant on `day` at `hour:minute`. */
function local(day: string, hour: number, minute = 0): Date {
  const date = fromLogDate(day);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function journey(overrides: Partial<Journey> = {}): Journey {
  return {
    id: 'j-a',
    name: 'Now',
    startDate: START,
    plannedEndDate: '2026-11-27',
    status: 'active',
    createdAt: local(START, 9).toISOString(),
    ...overrides,
  };
}
const PAST = journey({ id: 'j-b', name: 'Before', startDate: '2026-07-01', plannedEndDate: '2026-08-29', status: 'completed', completedAt: local('2026-08-30', 18).toISOString() });

function entry(id: string, at: Date, journeyId: string | null): WeightEntry {
  return { id, loggedAt: at.toISOString(), weightKg: toKg(180, 'lb'), enteredUnit: 'lb', ...(journeyId ? { journeyId } : {}) };
}

function weightRepo(seed: WeightEntry[] = []) {
  let entries = [...seed];
  const repository: WeightRepository = {
    getEntries: async () => [...entries],
    saveEntries: async (next) => {
      entries = [...next];
    },
    getPreferences: async () => null,
    savePreferences: async () => {},
  };
  return { repository, stored: () => entries };
}

function journeyRepo(seed: Journey[]) {
  let journeys = [...seed];
  let fail = false;
  let writes = 0;
  const repository: JourneyRepository = {
    getJourneys: async () => [...journeys],
    saveJourneys: async (next) => {
      writes += 1;
      if (fail) {
        fail = false;
        throw new Error('disk full');
      }
      journeys = [...next];
    },
  };
  return { repository, stored: () => journeys, failNext: () => (fail = true), writes: () => writes };
}

let w: WeightContextValue;
let j: JourneyContextValue;
function Probe() {
  w = useWeight();
  j = useJourneys();
  return null;
}

let tree: ReactTestRenderer | null = null;
async function mount(weights: WeightEntry[] = [], journeys: Journey[] = [journey(), PAST]) {
  const wr = weightRepo(weights);
  const jr = journeyRepo(journeys);
  await act(async () => {
    tree = create(
      <WeightProvider repository={wr.repository}>
        <JourneyProvider repository={jr.repository} today={() => TODAY}>
          <Probe />
        </JourneyProvider>
      </WeightProvider>,
    );
  });
  return { wr, jr };
}

afterEach(async () => {
  const t = tree;
  tree = null;
  if (t) await act(async () => t.unmount());
  await AsyncStorage.clear();
});

async function run<T>(fn: () => Promise<T>): Promise<T> {
  let result!: T;
  await act(async () => {
    result = await fn();
  });
  return result;
}

describe('the weigh-in date rule', () => {
  it('compares local calendar days: the start day from 12:01 AM counts; 11:59 PM the night before does not', () => {
    expect(isWithinJourneyStart(local(START, 0, 1), START)).toBe(true);
    expect(isWithinJourneyStart(local(START, 20), START)).toBe(true);
    expect(isWithinJourneyStart(local(shiftLogDate(START, 1), 7), START)).toBe(true);
    expect(isWithinJourneyStart(local(shiftLogDate(START, -1), 23, 59), START)).toBe(false);
    expect(isWithinJourneyStart(new Date('nonsense'), START)).toBe(false);
  });
});

describe('Journey-owned weigh-ins cannot predate the Journey', () => {
  it('log on the start day and the day after: saved', async () => {
    const { wr } = await mount();
    expect(await run(() => w.addEntry(180, 'lb', local(START, 0, 1), 'j-a'))).toBe(true);
    expect(await run(() => w.addEntry(179, 'lb', local(shiftLogDate(START, 1), 7), 'j-a'))).toBe(true);
    expect(wr.stored()).toHaveLength(2);
  });

  it('log the day before: refused, nothing written', async () => {
    const { wr } = await mount();
    expect(await run(() => w.addEntry(180, 'lb', local(shiftLogDate(START, -1), 23, 59), 'j-a'))).toBe(false);
    expect(wr.stored()).toEqual([]);
    expect(w.entries).toEqual([]);
  });

  it('edit an existing weigh-in to the day before: refused, the entry unchanged', async () => {
    const original = entry('w1', local(START, 8), 'j-a');
    const { wr } = await mount([original]);
    expect(await run(() => w.updateEntry('w1', { loggedAt: local(shiftLogDate(START, -3), 8) }))).toBe(false);
    expect(wr.stored()).toEqual([original]);
    expect(await run(() => w.updateEntry('w1', { loggedAt: local(START, 6) }))).toBe(true);
  });

  it('restore (Undo) is held to the same rule', async () => {
    const { wr } = await mount();
    expect(await run(() => w.restoreEntry(entry('w1', local(shiftLogDate(START, -1), 8), 'j-a')))).toBe(false);
    expect(wr.stored()).toEqual([]);
  });

  it('each Journey uses its own start day', async () => {
    const { wr } = await mount();
    const july = local('2026-07-15', 8);
    expect(await run(() => w.addEntry(180, 'lb', july, 'j-b'))).toBe(true);
    expect(await run(() => w.addEntry(180, 'lb', july, 'j-a'))).toBe(false);
    expect(wr.stored().map((e) => e.journeyId)).toEqual(['j-b']);
  });

  it('legacy unowned weigh-ins are not part of a Journey and stay untouched and editable', async () => {
    const legacy = entry('old', local('2026-01-05', 8), null);
    const { wr } = await mount([legacy]);
    expect(w.entries).toEqual([legacy]);
    expect(await run(() => w.updateEntry('old', { loggedAt: local('2025-12-31', 8) }))).toBe(true);
    expect(await run(() => w.addEntry(170, 'lb', local('2025-06-01', 8)))).toBe(true);
    expect(wr.stored()).toHaveLength(2);
  });

  it('the starting weigh-in is written on the start day', async () => {
    const { wr } = await mount([], []);
    const now = local(TODAY, 9, 30);
    await run(() => j.startJourney({ name: 'Fresh', plannedEndDate: '2027-01-01', startingWeight: 180, unit: 'lb', now }));
    const [started] = j.journeys;
    expect(started.startDate).toBe(TODAY);
    expect(isWithinJourneyStart(wr.stored()[0].loggedAt, started.startDate)).toBe(true);
  });

  it('the Timeline therefore has no supported path to a weigh-in before Journey began', async () => {
    await mount();
    await run(() => w.addEntry(180, 'lb', local(shiftLogDate(START, -2), 8), 'j-a'));
    await run(() => w.addEntry(181, 'lb', local(START, 8), 'j-a'));
    const items = deriveJourneyTimeline({ journey: j.active!, weights: w.entries, photos: [], today: TODAY });
    expect(items.map((i) => i.kind)).toEqual(['weight', 'began']);
  });
});

describe('extension history', () => {
  it('a successful Extend appends one record with the previous end, the new end and the real time — in the same write as the new end', async () => {
    const { jr } = await mount();
    const writesBefore = jr.writes();
    expect(await run(() => j.extendJourney('j-a', '2026-12-27'))).toBe(true);
    expect(jr.writes()).toBe(writesBefore + 1);
    const saved = jr.stored().find((x) => x.id === 'j-a')!;
    expect(saved.plannedEndDate).toBe('2026-12-27');
    expect(saved.extensions).toEqual([
      { id: expect.stringMatching(/^extension_/), extendedAt: expect.any(String), previousPlannedEndDate: '2026-11-27', newPlannedEndDate: '2026-12-27' },
    ]);
    expect(Math.abs(Date.parse(saved.extensions![0].extendedAt) - Date.now())).toBeLessThan(5_000);
  });

  it('a second Extend appends — the first is kept, oldest first', async () => {
    const { jr } = await mount();
    await run(() => j.extendJourney('j-a', '2026-12-27'));
    await run(() => j.extendJourney('j-a', '2027-01-26'));
    const history = jr.stored().find((x) => x.id === 'j-a')!.extensions!;
    expect(history.map((e) => [e.previousPlannedEndDate, e.newPlannedEndDate])).toEqual([
      ['2026-11-27', '2026-12-27'],
      ['2026-12-27', '2027-01-26'],
    ]);
    expect(new Set(history.map((e) => e.id)).size).toBe(2);
  });

  it('no record when nothing changes, the date is refused, or the save fails', async () => {
    const { jr } = await mount();
    expect(await run(() => j.extendJourney('j-a', '2026-11-27'))).toBe(false); // same end
    expect(await run(() => j.extendJourney('j-a', '2026-11-01'))).toBe(false); // earlier
    jr.failNext();
    expect(await run(() => j.extendJourney('j-a', '2026-12-27'))).toBe(false); // disk full
    const saved = jr.stored().find((x) => x.id === 'j-a')!;
    expect(saved.plannedEndDate).toBe('2026-11-27');
    expect(saved.extensions).toBeUndefined();
    expect(journeyExtensions(j.active!)).toEqual([]);
  });

  it('a Journey stored before history existed loads with none — nothing is inferred from its length', async () => {
    const long = { id: 'old', name: 'Long', startDate: '2026-01-01', plannedEndDate: '2026-12-31', status: 'active', createdAt: '2026-01-01T09:00:00.000Z' };
    expect(parseJourney(long)).toEqual(long);
    expect(journeyExtensions(parseJourney(long)!)).toEqual([]);
    expect(deriveJourneyTimeline({ journey: parseJourney(long)!, weights: [], photos: [], today: '2026-03-01' }).some((i) => i.kind === 'extended')).toBe(false);
  });

  it('round-trips through storage; a malformed entry is dropped on its own, never repaired', async () => {
    const good = { id: 'extension_1', extendedAt: local('2026-11-05', 9).toISOString(), previousPlannedEndDate: '2026-11-27', newPlannedEndDate: '2026-12-27' };
    const stored = {
      ...journey(),
      plannedEndDate: '2026-12-27',
      extensions: [good, { ...good, id: '' }, { ...good, newPlannedEndDate: '2026-11-01' }, 'nonsense'],
    };
    await AsyncStorage.setItem(JourneyKeys.journeys, JSON.stringify([stored]));
    const [loaded] = await asyncStorageJourneyRepository.getJourneys();
    expect(loaded.extensions).toEqual([good]);
    await asyncStorageJourneyRepository.saveJourneys([loaded]);
    expect(JSON.parse((await AsyncStorage.getItem(JourneyKeys.journeys))!)[0].extensions).toEqual([good]);
    expect((await AsyncStorage.getAllKeys()).filter((k) => /timeline|extension/i.test(k))).toEqual([]);
  });

  it('extending and then finishing keeps the history', async () => {
    const { jr } = await mount();
    await run(() => j.extendJourney('j-a', '2026-12-27'));
    await run(() => j.finishJourney('j-a'));
    const done = jr.stored().find((x) => x.id === 'j-a')!;
    expect(done.status).toBe('completed');
    expect(done.extensions).toHaveLength(1);
  });
});
