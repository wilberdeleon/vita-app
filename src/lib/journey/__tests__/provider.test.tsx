/**
 * `WeightProvider`, exercised through a real React render over an in-memory
 * repository — the seam the provider was built with.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { WeightRepository } from '../data/WeightRepository';
import type { WeightEntry, WeightPreferences } from '../model/types';
import { toKg } from '../model/units';
import { WeightProvider, useWeight, type WeightContextValue } from '../state/WeightProvider';

function fakeRepository(seed: { entries?: WeightEntry[]; preferences?: WeightPreferences | null } = {}) {
  let entries: WeightEntry[] = [...(seed.entries ?? [])];
  let preferences: WeightPreferences | null = seed.preferences ?? null;
  const writes = { entries: 0, preferences: 0 };
  let failNext = false;
  const repository: WeightRepository = {
    async getEntries() {
      return [...entries];
    },
    async saveEntries(next) {
      if (failNext) {
        failNext = false;
        throw new Error('disk full');
      }
      writes.entries += 1;
      entries = [...next];
    },
    async getPreferences() {
      return preferences;
    },
    async savePreferences(next) {
      writes.preferences += 1;
      preferences = next;
    },
  };
  return {
    repository,
    writes,
    stored: () => entries,
    storedPreferences: () => preferences,
    failNextSave: () => {
      failNext = true;
    },
  };
}

let latest: WeightContextValue;
function Probe() {
  latest = useWeight();
  return null;
}

let tree: ReactTestRenderer | null = null;
async function mount(repository: WeightRepository) {
  await act(async () => {
    tree = create(
      <WeightProvider repository={repository}>
        <Probe />
      </WeightProvider>,
    );
  });
  return () => latest;
}

afterEach(async () => {
  const t = tree;
  tree = null;
  if (t) await act(async () => t.unmount());
});

const e = (id: string, loggedAt: string, weightKg: number): WeightEntry => ({ id, loggedAt, weightKg, enteredUnit: 'kg' });

describe('first run', () => {
  it('has no entries, no current weight and the default unit — nothing seeded', async () => {
    const fake = fakeRepository();
    const state = await mount(fake.repository);
    expect(state().status).toBe('ready');
    expect(state().entries).toEqual([]);
    expect(state().current).toBeNull();
    expect(state().unit).toBe('lb');
    expect(fake.writes).toEqual({ entries: 0, preferences: 0 });
  });
});

describe('adding', () => {
  it('stores canonical kg and keeps every same-day weigh-in', async () => {
    const fake = fakeRepository();
    const state = await mount(fake.repository);
    await act(async () => {
      expect(await state().addEntry(180, 'lb', new Date('2026-10-15T07:00:00Z'))).toBe(true);
      expect(await state().addEntry(180, 'lb', new Date('2026-10-15T21:00:00Z'))).toBe(true);
    });
    expect(state().entries).toHaveLength(2);
    expect(fake.stored()).toHaveLength(2);
    expect(fake.stored().every((x) => x.weightKg === toKg(180, 'lb'))).toBe(true);
    expect(state().current?.loggedAt).toBe('2026-10-15T21:00:00.000Z');
  });

  it('two adds in one tick both survive', async () => {
    const fake = fakeRepository();
    const state = await mount(fake.repository);
    await act(async () => {
      await Promise.all([state().addEntry(80, 'kg'), state().addEntry(81, 'kg')]);
    });
    expect(fake.stored()).toHaveLength(2);
  });

  it('an add fired before the load finishes does not overwrite stored history', async () => {
    const fake = fakeRepository({ entries: [e('old', '2026-10-01T08:00:00.000Z', 80)] });
    let release = () => {};
    const gate = new Promise<void>((done) => {
      release = done;
    });
    const slow: WeightRepository = {
      ...fake.repository,
      getEntries: async () => {
        await gate;
        return fake.repository.getEntries();
      },
    };
    const state = await mount(slow);
    expect(state().status).toBe('loading');
    let pending: Promise<boolean> | undefined;
    await act(async () => {
      pending = state().addEntry(81, 'kg', new Date('2026-10-15T08:00:00Z'));
    });
    await act(async () => {
      release();
      expect(await pending).toBe(true);
    });
    expect(fake.stored().map((x) => x.id)).toContain('old');
    expect(fake.stored()).toHaveLength(2);
    expect(state().entries).toHaveLength(2);
  });

  it('reports a failed write as false', async () => {
    const fake = fakeRepository();
    const state = await mount(fake.repository);
    fake.failNextSave();
    await act(async () => {
      expect(await state().addEntry(80, 'kg')).toBe(false);
    });
    expect(state().error).not.toBeNull();
  });
});

describe('display unit', () => {
  it('changes display only — stored entries are not rewritten', async () => {
    const stored = [e('a', '2026-10-15T08:00:00.000Z', toKg(180, 'lb'))];
    const fake = fakeRepository({ entries: stored });
    const state = await mount(fake.repository);
    const before = JSON.stringify(fake.stored());
    await act(async () => {
      expect(await state().setUnit('kg')).toBe(true);
      await state().setUnit('lb');
      await state().setUnit('kg');
    });
    expect(state().unit).toBe('kg');
    expect(fake.writes.entries).toBe(0);
    expect(JSON.stringify(fake.stored())).toBe(before);
    expect(state().entries[0].weightKg).toBe(toKg(180, 'lb'));
  });

  it('survives a reload', async () => {
    const fake = fakeRepository();
    let state = await mount(fake.repository);
    await act(async () => {
      await state().setUnit('kg');
    });
    await act(async () => tree!.unmount());
    tree = null;
    state = await mount(fake.repository);
    expect(state().unit).toBe('kg');
  });
});

describe('edit and delete', () => {
  const a = e('a', '2026-10-01T08:00:00.000Z', 80);
  const b = e('b', '2026-10-15T08:00:00.000Z', 81);

  it('edits one entry by id, keeps its id, and the edit survives reload', async () => {
    const fake = fakeRepository({ entries: [b, a] });
    let state = await mount(fake.repository);
    await act(async () => {
      expect(await state().updateEntry('a', { weight: { value: 79.5, unit: 'kg' } })).toBe(true);
    });
    await act(async () => tree!.unmount());
    tree = null;
    state = await mount(fake.repository);
    expect(state().entries.find((x) => x.id === 'a')?.weightKg).toBe(79.5);
    expect(state().entries.find((x) => x.id === 'b')).toEqual(b);
  });

  it('deleting the newest makes the next newest current, and survives reload', async () => {
    const fake = fakeRepository({ entries: [b, a] });
    let state = await mount(fake.repository);
    expect(state().current?.id).toBe('b');
    await act(async () => {
      expect(await state().removeEntry('b')).toBe(true);
    });
    expect(state().current?.id).toBe('a');
    await act(async () => tree!.unmount());
    tree = null;
    state = await mount(fake.repository);
    expect(state().entries).toEqual([a]);
  });

  it('deleting the last entry leaves an empty history that survives reload', async () => {
    const fake = fakeRepository({ entries: [a] });
    let state = await mount(fake.repository);
    await act(async () => {
      await state().removeEntry('a');
    });
    await act(async () => tree!.unmount());
    tree = null;
    state = await mount(fake.repository);
    expect(state().entries).toEqual([]);
    expect(state().current).toBeNull();
  });

  it('an unknown id resolves false and writes nothing', async () => {
    const fake = fakeRepository({ entries: [b, a] });
    const state = await mount(fake.repository);
    await act(async () => {
      expect(await state().updateEntry('nope', { weight: { value: 1, unit: 'kg' } })).toBe(false);
      expect(await state().removeEntry('nope')).toBe(false);
    });
    expect(fake.writes.entries).toBe(0);
    expect(state().entries).toEqual([b, a]);
  });
});

describe('the domain carries no judgment', () => {
  it('exposes no goal, BMI, trend, delta, streak or success API', async () => {
    const state = await mount(fakeRepository().repository);
    const keys = Object.keys(state()).join(' ').toLowerCase();
    for (const banned of ['goal', 'bmi', 'trend', 'delta', 'streak', 'success', 'ontrack', 'progress', 'achievement', 'chart']) {
      expect(keys).not.toContain(banned);
    }
  });
});
