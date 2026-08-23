/**
 * The persistence boundary, exercised against a real AsyncStorage mock.
 *
 * Most of this file is about what a corrupted store must *not* be able to do.
 * Peptide setup data feeds the dose calculator in slice 3.6, so a
 * plausible-but-wrong vial amount is worse than a missing one and invisible
 * either way — every numeric field is checked for being finite and positive,
 * and a record failing an identity check is discarded whole.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStoragePeptideRepository as repo } from '../data/asyncStorageRepository';
import { PeptideKeys } from '../data/keys';
import { createPeptideSetup, vialFrom } from '../model/setups';
import type { PeptideDefinition, PeptideSetup } from '../model/types';

const AT = new Date('2026-08-23T10:00:00.000Z');

const setup = (overrides: Partial<PeptideSetup> = {}): PeptideSetup => ({
  ...createPeptideSetup('catalog:semaglutide', {}, AT),
  ...overrides,
});

const customDefinition = (overrides: Partial<PeptideDefinition> = {}): PeptideDefinition => ({
  id: 'custom_abc',
  name: 'My Blend',
  classification: 'custom',
  origin: 'user',
  ...overrides,
});

async function putRaw(key: string, payload: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(payload));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('storage keys', () => {
  it('are namespaced under vita:v1 and isolated to peptides', () => {
    expect(PeptideKeys.setups).toBe('vita:v1:peptides:setups');
    expect(PeptideKeys.customDefinitions).toBe('vita:v1:peptides:customdefs');
  });

  it('cannot collide with Water or Nutrition', () => {
    const others = [
      'vita:v1:water:goal',
      'vita:v1:water:prefs',
      'vita:v1:water:log:2026-08-23',
      'vita:v1:foodlog:2026-08-23',
      'vita:v1:myfoods',
      'vita:v1:favorites',
      'vita:v1:targets',
    ];
    for (const key of Object.values(PeptideKeys)) {
      expect(others).not.toContain(key);
    }
  });

  it('does not persist the catalog — it is compiled code', async () => {
    await repo.saveSetups([setup()]);
    const keys = await AsyncStorage.getAllKeys();
    expect(keys.some((key) => key.includes('catalog'))).toBe(false);
  });
});

describe('setups — round trip', () => {
  it('returns nothing before the user has made one', async () => {
    expect(await repo.getSetups()).toEqual([]);
  });

  it('saves and reads back a minimal setup unchanged', async () => {
    const saved = setup();
    await repo.saveSetups([saved]);
    expect(await repo.getSetups()).toEqual([saved]);
  });

  it('preserves a fully configured setup, including the authored vial pair', async () => {
    const saved = setup({
      displayName: 'Weekly pen',
      vial: vialFrom({ amount: 10, unit: 'mg' }),
      reconstitutionMl: 1,
      syringe: { unitsPerMl: 100 },
      preferredDoseUnit: 'mcg',
      schedule: { kind: 'daysOfWeek', days: [1, 4] },
      startDate: '2026-08-01',
      notes: 'Fridge, top shelf',
    });
    await repo.saveSetups([saved]);

    const [read] = await repo.getSetups();
    expect(read).toEqual(saved);
    expect(read.vial?.amountMcg).toBe(10000);
    expect(read.vial?.authored).toEqual({ amount: 10, unit: 'mg' });
  });

  it('survives a restart — a fresh read with no in-memory state', async () => {
    await repo.saveSetups([setup({ id: 'a' }), setup({ id: 'b' })]);
    expect((await repo.getSetups()).map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('replaces the collection wholesale rather than appending', async () => {
    await repo.saveSetups([setup({ id: 'a' })]);
    await repo.saveSetups([setup({ id: 'b' })]);
    expect((await repo.getSetups()).map((s) => s.id)).toEqual(['b']);
  });

  it('removes the key when the collection is emptied, leaving no residue', async () => {
    await repo.saveSetups([setup()]);
    await repo.saveSetups([]);
    expect(await repo.getSetups()).toEqual([]);
    expect(await AsyncStorage.getAllKeys()).not.toContain(PeptideKeys.setups);
  });

  it('keeps an inactive setup — deactivation is not deletion', async () => {
    await repo.saveSetups([setup({ id: 'a', active: false, notes: 'paused' })]);
    const [read] = await repo.getSetups();
    expect(read.active).toBe(false);
    expect(read.notes).toBe('paused');
  });
});

describe('setups — read-time validation', () => {
  it('treats unparseable JSON as empty rather than crashing', async () => {
    await AsyncStorage.setItem(PeptideKeys.setups, '{ not json');
    expect(await repo.getSetups()).toEqual([]);
  });

  it('treats a non-array payload as empty', async () => {
    for (const payload of [{ id: 'a' }, 'a string', 42, null]) {
      await putRaw(PeptideKeys.setups, payload);
      expect(await repo.getSetups()).toEqual([]);
    }
  });

  it('drops records missing an identity field and keeps the healthy ones', async () => {
    await putRaw(PeptideKeys.setups, [
      setup({ id: 'good-1' }),
      { ...setup(), id: '' },
      { ...setup(), definitionId: '' },
      { ...setup(), createdAt: '' },
      { ...setup(), updatedAt: '' },
      null,
      'not a record',
      setup({ id: 'good-2' }),
    ]);
    expect((await repo.getSetups()).map((s) => s.id)).toEqual(['good-1', 'good-2']);
  });

  it('drops a record with an invalid mass unit or entry mode', async () => {
    await putRaw(PeptideKeys.setups, [
      { ...setup(), id: 'bad-unit', preferredDoseUnit: 'grams' },
      { ...setup(), id: 'proto-unit', preferredDoseUnit: 'toString' },
      { ...setup(), id: 'bad-mode', preferredEntryMode: 'guess' },
      { ...setup(), id: 'bad-active', active: 'yes' },
      setup({ id: 'good' }),
    ]);
    expect((await repo.getSetups()).map((s) => s.id)).toEqual(['good']);
  });

  /**
   * Optional fields are dropped individually rather than voiding the setup —
   * losing a notes field should not lose the whole configuration. The setup
   * survives; the bad field does not.
   */
  it('drops a malformed vial but keeps the setup', async () => {
    await putRaw(PeptideKeys.setups, [
      { ...setup(), id: 'a', vial: { amountMcg: 0, authored: { amount: 10, unit: 'mg' } } },
      { ...setup(), id: 'b', vial: { amountMcg: -5000, authored: { amount: 10, unit: 'mg' } } },
      { ...setup(), id: 'c', vial: { amountMcg: null, authored: { amount: 10, unit: 'mg' } } },
      { ...setup(), id: 'd', vial: { amountMcg: 10000, authored: { amount: 10, unit: 'kg' } } },
      { ...setup(), id: 'e', vial: { amountMcg: 10000 } },
      { ...setup(), id: 'f', vial: 'ten milligrams' },
    ]);

    const read = await repo.getSetups();
    expect(read.map((s) => s.id)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    for (const record of read) {
      expect(record.vial).toBeUndefined();
    }
  });

  it('drops a non-positive reconstitution volume', async () => {
    await putRaw(PeptideKeys.setups, [
      { ...setup(), id: 'a', reconstitutionMl: 0 },
      { ...setup(), id: 'b', reconstitutionMl: -1 },
      { ...setup(), id: 'c', reconstitutionMl: '1' },
      { ...setup(), id: 'd', reconstitutionMl: 2 },
    ]);
    const read = await repo.getSetups();
    expect(read.filter((s) => s.reconstitutionMl !== undefined).map((s) => s.id)).toEqual(['d']);
  });

  it('drops an invalid syringe configuration', async () => {
    await putRaw(PeptideKeys.setups, [
      { ...setup(), id: 'a', syringe: { unitsPerMl: 0 } },
      { ...setup(), id: 'b', syringe: { unitsPerMl: -100 } },
      { ...setup(), id: 'c', syringe: {} },
      { ...setup(), id: 'd', syringe: { unitsPerMl: 100 } },
    ]);
    const read = await repo.getSetups();
    expect(read.filter((s) => s.syringe !== undefined).map((s) => s.id)).toEqual(['d']);
  });

  it('drops an invalid schedule', async () => {
    await putRaw(PeptideKeys.setups, [
      { ...setup(), id: 'a', schedule: { kind: 'weekly' } },
      { ...setup(), id: 'b', schedule: { kind: 'daysOfWeek', days: [9] } },
      { ...setup(), id: 'c', schedule: { kind: 'everyNDays', n: 0 } },
      { ...setup(), id: 'd', schedule: { kind: 'daily' } },
    ]);
    const read = await repo.getSetups();
    expect(read.filter((s) => s.schedule !== undefined).map((s) => s.id)).toEqual(['d']);
  });

  it('drops an impossible start date, now that LogDate validation checks the calendar', async () => {
    await putRaw(PeptideKeys.setups, [
      { ...setup(), id: 'a', startDate: '2026-02-30' },
      { ...setup(), id: 'b', startDate: '2026-13-01' },
      { ...setup(), id: 'c', startDate: 'yesterday' },
      { ...setup(), id: 'd', startDate: '2024-02-29' },
    ]);
    const read = await repo.getSetups();
    expect(read.filter((s) => s.startDate !== undefined).map((s) => s.id)).toEqual(['d']);
  });

  it('does not rewrite storage to "fix" what it read', async () => {
    const corrupt = [setup({ id: 'good' }), { ...setup(), id: '' }];
    await putRaw(PeptideKeys.setups, corrupt);
    await repo.getSetups();

    const raw = JSON.parse((await AsyncStorage.getItem(PeptideKeys.setups)) ?? 'null');
    expect(raw).toHaveLength(2);
  });
});

describe('custom definitions', () => {
  it('round-trip', async () => {
    const definition = customDefinition();
    await repo.saveCustomDefinitions([definition]);
    expect(await repo.getCustomDefinitions()).toEqual([definition]);
  });

  it('keeps an optional category', async () => {
    const definition = customDefinition({ category: 'Blend' });
    await repo.saveCustomDefinitions([definition]);
    expect((await repo.getCustomDefinitions())[0].category).toBe('Blend');
  });

  /**
   * The load-bearing rule. Approval status is asserted by the compiled catalog
   * and nowhere else — a hand-edited store must not be able to relabel a
   * research compound as an approved medication.
   */
  it('refuses any stored definition claiming a classification other than custom', async () => {
    await putRaw(PeptideKeys.customDefinitions, [
      { ...customDefinition(), id: 'a', classification: 'approved-medication' },
      { ...customDefinition(), id: 'b', classification: 'research-compound' },
      { ...customDefinition(), id: 'c', classification: 'anything' },
      { ...customDefinition(), id: 'd', origin: 'catalog' },
      customDefinition({ id: 'ok' }),
    ]);
    expect((await repo.getCustomDefinitions()).map((d) => d.id)).toEqual(['ok']);
  });

  it('drops records missing a name or id', async () => {
    await putRaw(PeptideKeys.customDefinitions, [
      { ...customDefinition(), id: '' },
      { ...customDefinition(), name: '' },
      customDefinition({ id: 'ok' }),
    ]);
    expect((await repo.getCustomDefinitions()).map((d) => d.id)).toEqual(['ok']);
  });

  it('treats unparseable JSON as empty', async () => {
    await AsyncStorage.setItem(PeptideKeys.customDefinitions, '][');
    expect(await repo.getCustomDefinitions()).toEqual([]);
  });

  it('is stored separately from setups, so deleting one cannot lose the other', async () => {
    await repo.saveCustomDefinitions([customDefinition()]);
    await repo.saveSetups([setup({ definitionId: 'custom_abc' })]);
    await repo.saveSetups([]);

    expect(await repo.getCustomDefinitions()).toHaveLength(1);
  });
});
