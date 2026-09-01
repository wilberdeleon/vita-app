/**
 * `PeptideProvider` behaviour, through a real React render.
 *
 * Uses the `react-test-renderer` `jest-expo` already ships — no new testing
 * stack. The probe renders nothing; it exists so the provider's actual state
 * transitions can be asserted rather than reasoned about.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { PeptideRepository } from '../data/PeptideRepository';
import { vialFrom } from '../model/setups';
import type { PeptideDefinition, PeptideLogEntry, PeptideSetup } from '../model/types';
import { PeptideProvider, usePeptideContext, type PeptideContextValue } from '../state/PeptideProvider';
import { usePeptides, type PeptidesView } from '../state/usePeptides';
import type { RoutineDayStatus } from '../model/routine';

/** In-memory repository — the injectable seam the provider was built with. */
function fakeRepository(seed: { setups?: PeptideSetup[]; definitions?: PeptideDefinition[] } = {}) {
  const statusDays = new Map<string, RoutineDayStatus[]>();
  let setups: PeptideSetup[] = [...(seed.setups ?? [])];
  let definitions: PeptideDefinition[] = [...(seed.definitions ?? [])];
  const logs = new Map<string, PeptideLogEntry[]>();

  const repository: PeptideRepository = {
    async getSetups() {
      return [...setups];
    },
    async saveSetups(next) {
      setups = [...next];
    },
    async getCustomDefinitions() {
      return [...definitions];
    },
    async saveCustomDefinitions(next) {
      definitions = [...next];
    },
    async getLogs(logDate) {
      return [...(logs.get(logDate) ?? [])];
    },
    async saveLogs(logDate, entries) {
      if (entries.length === 0) logs.delete(logDate);
      else logs.set(logDate, [...entries]);
    },
    async getRecentLogs() {
      return [...logs.values()].flat();
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

  return {
    repository,
    /** What is actually on "disk" — asserted separately from React state. */
    stored: { setups: () => setups, definitions: () => definitions },
  };
}

let peptides: PeptideContextValue;
let view: PeptidesView;

function Probe() {
  peptides = usePeptideContext();
  view = usePeptides();
  return null;
}

let mounted: ReactTestRenderer | null = null;

async function mount(repository: PeptideRepository): Promise<void> {
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

describe('empty state', () => {
  it('starts with nothing and says so', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    expect(view.isLoading).toBe(false);
    expect(view.isEmpty).toBe(true);
    expect(view.active).toEqual([]);
    expect(view.inactive).toEqual([]);
    expect(view.orphanedCount).toBe(0);
  });

  it('exposes the compiled catalog without it being persisted', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    expect(peptides.catalog.length).toBeGreaterThan(0);
    expect(stored.definitions()).toEqual([]);
  });
});

describe('creating setups', () => {
  it('creates a catalog-backed setup, active by default, and persists it', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:semaglutide');
    });

    expect(view.active).toHaveLength(1);
    expect(view.active[0].name).toBe('Semaglutide');
    expect(view.active[0].definition.classification).toBe('approved-medication');
    expect(view.active[0].setup.active).toBe(true);
    expect(stored.setups()).toHaveLength(1);
  });

  it('requires only a definition — everything else stays absent', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:tirzepatide');
    });

    const { setup } = view.active[0];
    expect(setup.vial).toBeUndefined();
    expect(setup.reconstitutionMl).toBeUndefined();
    expect(setup.syringe).toBeUndefined();
    expect(setup.schedule).toBeUndefined();
    expect(setup.startDate).toBeUndefined();
    expect(setup.notes).toBeUndefined();
    // The two fields that must always exist.
    expect(setup.preferredDoseUnit).toBe('mg');
    expect(setup.preferredEntryMode).toBe('mass');
  });

  it('stores a fully configured setup', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:bpc-157', {
        displayName: 'Morning vial',
        vial: vialFrom({ amount: 5, unit: 'mg' }),
        reconstitutionMl: 2,
        syringe: { unitsPerMl: 100 },
        preferredDoseUnit: 'mcg',
        schedule: { kind: 'daily' },
        startDate: '2026-08-01',
        notes: 'Fridge',
      });
    });

    // A *daily* routine, so 3.10A's deduplication puts it in `today` rather
    // than in `active`. What this test is about is what got stored, which is
    // the same object either way.
    const { setup, name, scheduleLabel } = view.today[0];
    // Slice 3.9: the definition names the routine. A stored `displayName`
    // survives on disk untouched but no longer decides what anything is
    // called — one thing, one name.
    expect(name).toBe('BPC-157');
    expect(setup.displayName).toBe('Morning vial');
    expect(setup.vial?.amountMcg).toBe(5000);
    expect(setup.vial?.authored).toEqual({ amount: 5, unit: 'mg' });
    expect(scheduleLabel).toBe('Daily');
  });

  it('has no field describing a typical, recommended, or standard dose', async () => {
    const { repository } = fakeRepository();
    await mount(repository);
    await act(async () => {
      await peptides.addSetup('catalog:ipamorelin');
    });

    const serialized = JSON.stringify(view.active[0].setup).toLowerCase();
    for (const word of ['typical', 'recommended', 'standard', 'suggested', 'dosage']) {
      expect(serialized).not.toContain(word);
    }
  });
});

describe('custom definitions', () => {
  it('creates one, persists it, and can back a setup', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    let definitionId = '';
    await act(async () => {
      const definition = await peptides.createCustomDefinition('  My Blend  ');
      definitionId = definition.id;
      await peptides.addSetup(definition.id);
    });

    expect(stored.definitions()).toHaveLength(1);
    expect(stored.definitions()[0].name).toBe('My Blend'); // trimmed
    expect(stored.definitions()[0].classification).toBe('custom');
    expect(stored.definitions()[0].origin).toBe('user');
    expect(view.active[0].definition.id).toBe(definitionId);
    expect(view.active[0].name).toBe('My Blend');
  });

  it('names every routine after the definition it points at', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      const definition = await peptides.createCustomDefinition('Shared');
      await peptides.addSetup(definition.id);
      await peptides.addSetup(definition.id);
    });

    // The definition is stored once and both routines resolve their name
    // from it. `addSetup` is the low-level primitive and does not dedupe;
    // `addToRoutine` — the only path a screen uses — does.
    expect(stored.definitions()).toHaveLength(1);
    expect(view.active.map((item) => item.name)).toEqual(['Shared', 'Shared']);
  });
});

describe('editing', () => {
  it('preserves id, definition, and createdAt while refreshing updatedAt', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:semaglutide');
    });
    const original = view.active[0].setup;

    await act(async () => {
      await peptides.updateSetup(original.id, { displayName: 'Renamed', preferredDoseUnit: 'mcg' });
    });

    const updated = view.active[0].setup;
    expect(updated.id).toBe(original.id);
    expect(updated.definitionId).toBe(original.definitionId);
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.displayName).toBe('Renamed');
    expect(updated.preferredDoseUnit).toBe('mcg');
    expect(view.active).toHaveLength(1); // updated in place, not duplicated
  });

  it('clears an optional field when it is explicitly set to undefined', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:bpc-157', { notes: 'temporary' });
    });
    const id = view.active[0].setup.id;

    await act(async () => {
      await peptides.updateSetup(id, { notes: undefined });
    });

    expect(view.active[0].setup.notes).toBeUndefined();
  });

  it('never leaves the always-present preferences missing', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:bpc-157');
    });
    const id = view.active[0].setup.id;

    await act(async () => {
      await peptides.updateSetup(id, { preferredDoseUnit: undefined, preferredEntryMode: undefined });
    });

    expect(view.active[0].setup.preferredDoseUnit).toBe('mg');
    expect(view.active[0].setup.preferredEntryMode).toBe('mass');
  });
});

describe('active and inactive', () => {
  it('moves a setup to inactive without deleting anything', async () => {
    const { repository, stored } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:semaglutide', { notes: 'keep me', startDate: '2026-08-01' });
    });
    const id = view.active[0].setup.id;

    await act(async () => {
      await peptides.setSetupActive(id, false);
    });

    expect(view.active).toHaveLength(0);
    expect(view.inactive).toHaveLength(1);
    expect(view.isEmpty).toBe(false); // having only inactive setups is not empty
    // Every field survives.
    expect(view.inactive[0].setup.notes).toBe('keep me');
    expect(view.inactive[0].setup.startDate).toBe('2026-08-01');
    expect(stored.setups()).toHaveLength(1);
  });

  it('reactivates', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:semaglutide');
    });
    const id = view.active[0].setup.id;

    await act(async () => {
      await peptides.setSetupActive(id, false);
    });
    await act(async () => {
      await peptides.setSetupActive(id, true);
    });

    expect(view.active).toHaveLength(1);
    expect(view.inactive).toHaveLength(0);
  });

  it('sorts each list alphabetically', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      await peptides.addSetup('catalog:tirzepatide');
      await peptides.addSetup('catalog:bpc-157');
      await peptides.addSetup('catalog:semaglutide');
    });

    expect(view.active.map((item) => item.name)).toEqual(['BPC-157', 'Semaglutide', 'Tirzepatide']);
  });
});

describe('definition resolution', () => {
  it('resolves catalog and custom definitions alike', async () => {
    const { repository } = fakeRepository();
    await mount(repository);

    await act(async () => {
      const definition = await peptides.createCustomDefinition('Mine');
      await peptides.addSetup('catalog:semaglutide');
      await peptides.addSetup(definition.id);
    });

    expect(view.active).toHaveLength(2);
    expect(view.orphanedCount).toBe(0);
  });

  /**
   * A setup pointing at a definition that no longer exists is kept out of the
   * lists and left alone in storage. Silently re-pointing it at some other
   * compound would be the one genuinely destructive option — the setup would
   * then claim to be tracking something the user never chose.
   */
  it('omits an orphaned setup without deleting or re-pointing it', async () => {
    const orphan: PeptideSetup = {
      id: 'orphan',
      definitionId: 'custom_deleted',
      routineState: 'active',
      active: true,
      preferredDoseUnit: 'mg',
      preferredEntryMode: 'mass',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };
    const { repository, stored } = fakeRepository({ setups: [orphan] });
    await mount(repository);

    expect(view.active).toHaveLength(0);
    expect(view.inactive).toHaveLength(0);
    expect(view.orphanedCount).toBe(1);
    expect(view.isEmpty).toBe(false);
    // Untouched on disk, so a restored definition brings its setup back.
    expect(stored.setups()).toHaveLength(1);
  });
});

describe('loading and failure', () => {
  it('hydrates existing setups and custom definitions', async () => {
    const definition: PeptideDefinition = {
      id: 'custom_1',
      name: 'Stored Blend',
      classification: 'custom',
      origin: 'user',
    };
    const stored: PeptideSetup = {
      id: 'p1',
      definitionId: 'custom_1',
      routineState: 'active',
      active: true,
      preferredDoseUnit: 'mcg',
      preferredEntryMode: 'mass',
      createdAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };
    const { repository } = fakeRepository({ setups: [stored], definitions: [definition] });
    await mount(repository);

    expect(view.isLoading).toBe(false);
    expect(view.active).toHaveLength(1);
    expect(view.active[0].name).toBe('Stored Blend');
  });

  it('surfaces a load failure instead of looking empty', async () => {
    const { repository } = fakeRepository();
    const failing: PeptideRepository = {
      ...repository,
      async getSetups() {
        throw new Error('storage unavailable');
      },
    };
    await mount(failing);

    expect(view.error).toBe("We couldn't load your peptides.");
    expect(view.isLoading).toBe(false);
  });

  it('keeps the optimistic value on a save failure and says it may not persist', async () => {
    const { repository } = fakeRepository();
    const failing: PeptideRepository = {
      ...repository,
      async saveSetups() {
        throw new Error('disk full');
      },
    };
    await mount(failing);

    await act(async () => {
      await peptides.addSetup('catalog:semaglutide');
    });

    expect(view.active).toHaveLength(1);
    expect(view.error).toBe("We couldn't save that. Your changes may not persist.");
  });
});
