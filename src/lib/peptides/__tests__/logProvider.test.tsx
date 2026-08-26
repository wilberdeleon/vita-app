/**
 * `PeptideProvider`'s log state, through a real render.
 *
 * The screens are covered elsewhere; what is proven here is the state layer —
 * that today means today, that a day's records are written whole, and that an
 * edit which moves an entry across midnight leaves both days correct.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { todayLogDate } from '../../daily';
import type { PeptideRepository } from '../data/PeptideRepository';
import type { PeptideLogEntry, PeptideSetup } from '../model/types';
import { PeptideProvider, usePeptideContext, type PeptideContextValue } from '../state/PeptideProvider';
import { toMcg } from '../model/units';
import type { RoutineDayStatus } from '../model/routine';

const CREATED = '2026-08-25T10:00:00.000Z';

function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    routineState: 'active',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

function fakeRepository(setups: PeptideSetup[], seed: PeptideLogEntry[] = []) {
  const days = new Map<string, PeptideLogEntry[]>();
  const statusDays = new Map<string, RoutineDayStatus[]>();
  for (const entry of seed) days.set(entry.logDate, [...(days.get(entry.logDate) ?? []), entry]);

  const repository: PeptideRepository = {
    async getSetups() {
      return [...setups];
    },
    async saveSetups() {},
    async getCustomDefinitions() {
      return [];
    },
    async saveCustomDefinitions() {},
    async getLogs(logDate) {
      return [...(days.get(logDate) ?? [])];
    },
    async saveLogs(logDate, entries) {
      if (entries.length === 0) days.delete(logDate);
      else days.set(logDate, [...entries]);
    },
    async getRecentLogs() {
      return [...days.values()].flat();
    },
    async getRoutineStatuses(logDate: string) {
      return statusDays.get(logDate) ?? [];
    },
    async saveRoutineStatuses(logDate: string, next: RoutineDayStatus[]) {
      if (next.length === 0) statusDays.delete(logDate);
      else statusDays.set(logDate, next);
    },
    async getRecentRoutineStatuses() {
      return [...statusDays.values()].flat();
    },
  };
  return { repository, days };
}

let mounted: ReactTestRenderer | null = null;
let context: PeptideContextValue;

function Probe() {
  context = usePeptideContext();
  return null;
}

async function render(repository: PeptideRepository) {
  await act(async () => {
    mounted = create(
      <PeptideProvider repository={repository}>
        <Probe />
      </PeptideProvider>,
    );
  });
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
});

/** Local noon on a day offset from today, so the calendar day is unambiguous. */
function noonDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

describe('adding', () => {
  it('persists an entry with its snapshot', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
    });

    const stored = [...days.values()].flat();
    expect(stored).toHaveLength(1);
    expect(stored[0].calculationSnapshot?.calculatedUnits).toBe(20);
    expect(context.logs).toHaveLength(1);
  });

  it('refuses a setup that does not exist', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    let created: PeptideLogEntry | null = null;
    await act(async () => {
      created = await context.addLog('setup-missing', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
    });

    expect(created).toBeNull();
    expect([...days.values()].flat()).toHaveLength(0);
  });

  it('keeps two entries logged in the same tick', async () => {
    // The shadow ref exists for exactly this: reducer state has not
    // re-rendered between the two, so a naive read would drop the first.
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
      await context.addLog('setup-1', { authoredAmount: 1, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
    });

    expect([...days.values()].flat()).toHaveLength(2);
    expect(context.logs).toHaveLength(2);
  });
});

describe('today', () => {
  it('counts only entries from the current calendar day', async () => {
    const { repository } = fakeRepository([setupFixture()]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(1) });
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(3) });
    });

    expect(context.logsForDate(context.today)).toHaveLength(1);
    expect(context.logs).toHaveLength(3);
  });

  it('starts on the real local day', async () => {
    const { repository } = fakeRepository([setupFixture()]);
    await render(repository);
    expect(context.today).toBe(todayLogDate());
  });

  it('counts several administrations on one day', async () => {
    const { repository } = fakeRepository([setupFixture()]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
      await context.addLog('setup-1', { authoredAmount: 1, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
    });

    expect(context.logsForDate(context.today)).toHaveLength(2);
  });
});

describe('reading back', () => {
  it('filters by setup', async () => {
    const { repository } = fakeRepository([
      setupFixture(),
      setupFixture({ id: 'setup-2', definitionId: 'catalog:bpc-157' }),
    ]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
      await context.addLog('setup-2', { authoredAmount: 250, authoredUnit: 'mcg', loggedAt: noonDaysAgo(0) });
    });

    expect(context.logsForSetup('setup-1')).toHaveLength(1);
    expect(context.logsForSetup('setup-2')[0].amount.authoredUnit).toBe('mcg');
  });

  it('returns entries newest first', async () => {
    const { repository } = fakeRepository([setupFixture()]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', { authoredAmount: 1, authoredUnit: 'mg', loggedAt: noonDaysAgo(3) });
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
      await context.addLog('setup-1', { authoredAmount: 3, authoredUnit: 'mg', loggedAt: noonDaysAgo(1) });
    });

    expect(context.logs.map((entry) => entry.amount.authoredAmount)).toEqual([2, 3, 1]);
  });
});

describe('editing', () => {
  it('recomputes inside the entry’s own snapshot, not the current setup', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    let entry: PeptideLogEntry | null = null;
    await act(async () => {
      entry = await context.addLog('setup-1', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
    });
    expect(entry!.calculationSnapshot?.calculatedUnits).toBe(20);

    await act(async () => {
      await context.updateLog(entry!.id, {
        authoredAmount: 1,
        authoredUnit: 'mg',
        loggedAt: entry!.loggedAt,
      });
    });

    const stored = [...days.values()].flat()[0];
    expect(stored.amount.amountMcg).toBe(1000);
    expect(stored.calculationSnapshot?.reconstitutionMl).toBe(2);
    expect(stored.calculationSnapshot?.calculatedUnits).toBe(10);
  });

  it('moves an entry cleanly when its time crosses a day boundary', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    let entry: PeptideLogEntry | null = null;
    await act(async () => {
      entry = await context.addLog('setup-1', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
    });
    const originalDay = entry!.logDate;

    await act(async () => {
      await context.updateLog(entry!.id, {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(1),
      });
    });

    // Removed from the old day, present exactly once on the new one.
    expect(days.get(originalDay) ?? []).toHaveLength(0);
    expect([...days.values()].flat()).toHaveLength(1);
    expect(context.logs).toHaveLength(1);
  });
});

describe('deleting and restoring', () => {
  it('removes the entry from its day', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    let entry: PeptideLogEntry | null = null;
    await act(async () => {
      entry = await context.addLog('setup-1', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
    });

    await act(async () => context.deleteLog(entry!.id));
    expect([...days.values()].flat()).toHaveLength(0);
    expect(context.logs).toHaveLength(0);
  });

  it('restores a deleted entry exactly as it was', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    let entry: PeptideLogEntry | null = null;
    await act(async () => {
      entry = await context.addLog('setup-1', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
    });

    await act(async () => context.deleteLog(entry!.id));
    await act(async () => context.restoreLog(entry!));

    // Same id, same timestamps — Undo puts back the record, not a copy of it.
    const stored = [...days.values()].flat();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(entry);
  });

  it('leaves other entries alone', async () => {
    const { repository, days } = fakeRepository([setupFixture()]);
    await render(repository);

    let first: PeptideLogEntry | null = null;
    await act(async () => {
      first = await context.addLog('setup-1', {
        authoredAmount: 2,
        authoredUnit: 'mg',
        loggedAt: noonDaysAgo(0),
      });
      await context.addLog('setup-1', { authoredAmount: 1, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
    });

    await act(async () => context.deleteLog(first!.id));
    expect([...days.values()].flat()).toHaveLength(1);
  });
});

describe('inactive setups', () => {
  it('keeps history readable after deactivation', async () => {
    // Deactivating has never deleted anything, and history that vanishes when
    // you stop tracking something is not history.
    const { repository } = fakeRepository([setupFixture({ active: false })]);
    await render(repository);

    await act(async () => {
      await context.addLog('setup-1', { authoredAmount: 2, authoredUnit: 'mg', loggedAt: noonDaysAgo(0) });
    });

    expect(context.logsForSetup('setup-1')).toHaveLength(1);
  });
});
