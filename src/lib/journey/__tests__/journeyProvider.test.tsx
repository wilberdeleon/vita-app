/**
 * `JourneyProvider` (slice 6.5) over in-memory repositories that can fail on
 * demand — the seams that prove starting a Journey is all-or-nothing.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { JourneyRepository } from '../data/JourneyRepository';
import type { WeightRepository } from '../data/WeightRepository';
import type { Journey } from '../model/journeys';
import type { WeightEntry, WeightPreferences } from '../model/types';
import { toKg } from '../model/units';
import { JourneyProvider, useJourneys, type JourneyContextValue } from '../state/JourneyProvider';
import { WeightProvider, useWeight, type WeightContextValue } from '../state/WeightProvider';

function weightRepo(seed: WeightEntry[] = []) {
  let entries = [...seed];
  let fail = 0;
  const repository: WeightRepository = {
    async getEntries() {
      return [...entries];
    },
    async saveEntries(next) {
      if (fail > 0) {
        fail -= 1;
        throw new Error('disk full');
      }
      entries = [...next];
    },
    async getPreferences(): Promise<WeightPreferences | null> {
      return null;
    },
    async savePreferences() {},
  };
  return { repository, stored: () => entries, failNext: (count = 1) => (fail = count) };
}

function journeyRepo(seed: Journey[] = []) {
  let journeys = [...seed];
  let fail = false;
  const repository: JourneyRepository = {
    async getJourneys() {
      return [...journeys];
    },
    async saveJourneys(next) {
      if (fail) {
        fail = false;
        throw new Error('disk full');
      }
      journeys = [...next];
    },
  };
  return { repository, stored: () => journeys, failNext: () => (fail = true) };
}

let journeysCtx: JourneyContextValue;
let weightCtx: WeightContextValue;
function Probe() {
  journeysCtx = useJourneys();
  weightCtx = useWeight();
  return null;
}

let tree: ReactTestRenderer | null = null;
async function mount(w: WeightRepository, j: JourneyRepository, today = () => '2026-10-28') {
  await act(async () => {
    tree = create(
      <WeightProvider repository={w}>
        <JourneyProvider repository={j} today={today}>
          <Probe />
        </JourneyProvider>
      </WeightProvider>,
    );
  });
}

afterEach(async () => {
  const t = tree;
  tree = null;
  if (t) await act(async () => t.unmount());
});

const NOW = new Date(2026, 9, 28, 9, 30);
const START = { name: 'Summer Transformation', plannedEndDate: '2027-01-25', startingWeight: 180.4, unit: 'lb' as const, now: NOW };

describe('first run', () => {
  it('has no Journey and creates none', async () => {
    const w = weightRepo();
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    expect(journeysCtx.status).toBe('ready');
    expect(journeysCtx.active).toBeNull();
    expect(journeysCtx.past).toEqual([]);
    expect(j.stored()).toEqual([]);
  });

  it('legacy 6.4 weigh-ins are not turned into a Journey', async () => {
    const legacy: WeightEntry = { id: 'old', loggedAt: '2026-10-20T15:00:00Z', weightKg: 80, enteredUnit: 'lb' };
    const w = weightRepo([legacy]);
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    expect(journeysCtx.active).toBeNull();
    expect(j.stored()).toEqual([]);
    expect(w.stored()).toEqual([legacy]);
  });
});

describe('starting a Journey', () => {
  it('writes the Journey and its starting weigh-in, owned by it, at the same instant', async () => {
    const w = weightRepo();
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    let created: Journey | null = null;
    await act(async () => {
      created = await journeysCtx.startJourney(START);
    });
    expect(created).not.toBeNull();
    const journey = j.stored()[0];
    expect(journey).toMatchObject({ name: 'Summer Transformation', startDate: '2026-10-28', plannedEndDate: '2027-01-25', status: 'active' });
    expect(w.stored()).toEqual([
      { id: expect.stringMatching(/^weight_/), loggedAt: NOW.toISOString(), weightKg: toKg(180.4, 'lb'), enteredUnit: 'lb', journeyId: journey.id },
    ]);
    expect(journeysCtx.active?.id).toBe(journey.id);
  });

  it('does not adopt legacy weigh-ins — the new Journey starts with its own starting weight only', async () => {
    const legacy: WeightEntry = { id: 'old', loggedAt: '2026-10-20T15:00:00Z', weightKg: 80, enteredUnit: 'lb' };
    const w = weightRepo([legacy]);
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    await act(async () => {
      await journeysCtx.startJourney(START);
    });
    const id = j.stored()[0].id;
    expect(w.stored().find((e) => e.id === 'old')).toEqual(legacy);
    expect(w.stored().filter((e) => e.journeyId === id)).toHaveLength(1);
  });

  it('is refused while another Journey is active', async () => {
    const w = weightRepo();
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    await act(async () => {
      await journeysCtx.startJourney(START);
      expect(await journeysCtx.startJourney({ ...START, name: 'Second' })).toBeNull();
    });
    expect(j.stored()).toHaveLength(1);
    expect(w.stored()).toHaveLength(1);
  });
});

describe('starting is all-or-nothing', () => {
  it('if the starting weigh-in cannot be saved, no Journey is written', async () => {
    const w = weightRepo();
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    w.failNext();
    await act(async () => {
      expect(await journeysCtx.startJourney(START)).toBeNull();
    });
    expect(j.stored()).toEqual([]);
    expect(w.stored()).toEqual([]);
    expect(journeysCtx.active).toBeNull();
  });

  it('if the Journey cannot be saved, the starting weigh-in is removed again', async () => {
    const w = weightRepo();
    const j = journeyRepo();
    await mount(w.repository, j.repository);
    j.failNext();
    await act(async () => {
      expect(await journeysCtx.startJourney(START)).toBeNull();
    });
    expect(j.stored()).toEqual([]);
    expect(w.stored()).toEqual([]);
    expect(weightCtx.entries).toEqual([]);
    expect(journeysCtx.active).toBeNull();
  });

  it('if even the rollback fails, the orphan weigh-in belongs to no Journey and no Journey is active', async () => {
    const w = weightRepo();
    const j = journeyRepo();
    const realSave = w.repository.saveEntries;
    let calls = 0;
    // Save 1 (the starting weigh-in) succeeds; save 2 (the rollback) fails.
    w.repository.saveEntries = async (next) => {
      calls += 1;
      if (calls === 2) throw new Error('rollback failed');
      return realSave(next);
    };
    await mount(w.repository, j.repository);
    j.failNext();
    await act(async () => {
      expect(await journeysCtx.startJourney(START)).toBeNull();
    });
    expect(j.stored()).toEqual([]);
    expect(journeysCtx.active).toBeNull();
    const orphan = w.stored();
    expect(orphan).toHaveLength(1);
    // It names a Journey that does not exist, so no Journey can ever show it.
    expect(j.stored().some((journey) => journey.id === orphan[0].journeyId)).toBe(false);
  });
});

describe('extending and finishing', () => {
  async function started() {
    const w = weightRepo();
    const j = journeyRepo();
    await mount(w.repository, j.repository, () => '2026-11-10');
    await act(async () => {
      await journeysCtx.startJourney(START);
    });
    return { w, j };
  }

  it('extend moves only the planned end', async () => {
    const { j, w } = await started();
    const before = j.stored()[0];
    await act(async () => {
      expect(await journeysCtx.extendJourney(before.id, '2027-03-01')).toBe(true);
    });
    expect(j.stored()[0]).toEqual({ ...before, plannedEndDate: '2027-03-01' });
    expect(w.stored()).toHaveLength(1);
  });

  it('extend refuses an end that is not later', async () => {
    const { j } = await started();
    await act(async () => {
      expect(await journeysCtx.extendJourney(j.stored()[0].id, '2027-01-25')).toBe(false);
      expect(await journeysCtx.extendJourney(j.stored()[0].id, '2026-12-01')).toBe(false);
    });
  });

  it('finish completes it, keeps its weigh-ins owned by it, and frees the way for a new one', async () => {
    const { j, w } = await started();
    const id = j.stored()[0].id;
    await act(async () => {
      expect(await journeysCtx.finishJourney(id)).toBe(true);
    });
    expect(j.stored()[0]).toMatchObject({ id, status: 'completed', completedAt: expect.any(String) });
    expect(journeysCtx.active).toBeNull();
    expect(journeysCtx.past.map((p) => p.id)).toEqual([id]);
    expect(w.stored()[0].journeyId).toBe(id);

    await act(async () => {
      expect(await journeysCtx.startJourney({ ...START, name: 'Second Chapter', plannedEndDate: '2027-06-01', startingWeight: 175 })).not.toBeNull();
    });
    const second = journeysCtx.active!;
    expect(second.name).toBe('Second Chapter');
    expect(w.stored().filter((e) => e.journeyId === second.id)).toHaveLength(1);
    expect(w.stored().filter((e) => e.journeyId === id)).toHaveLength(1);
  });

  it('a finished Journey cannot be finished again', async () => {
    const { j } = await started();
    const id = j.stored()[0].id;
    await act(async () => {
      await journeysCtx.finishJourney(id);
      expect(await journeysCtx.finishJourney(id)).toBe(false);
    });
  });
});
