/**
 * Journey / Weight persistence, against the AsyncStorage mock.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { asyncStorageWeightRepository as repo } from '../data/asyncStorageRepository';
import { JourneyKeys } from '../data/keys';
import { createWeightEntry } from '../model/entries';
import type { WeightEntry } from '../model/types';
import { toKg } from '../model/units';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const e = (id: string, loggedAt: string, weightKg = 80): WeightEntry => ({ id, loggedAt, weightKg, enteredUnit: 'kg' });

describe('keys', () => {
  it('are new, versioned and Journey-owned', () => {
    expect(JourneyKeys.weight).toBe('vita:v1:journey:weight');
    expect(JourneyKeys.preferences).toBe('vita:v1:journey:prefs');
  });

  it('collide with no existing VITA key', () => {
    // Every key string any other domain builds today.
    const existing = [
      'vita:v1:water:goal',
      'vita:v1:water:prefs',
      'vita:v1:preferences:prefs',
      'vita:v1:peptides:setups',
      'vita:v1:peptides:customdefs',
      'vita:v1:targets',
      'vita:v1:myfoods',
      'vita:v1:favorites',
      'vita:v1:fuel:layout',
      'vita:v1:fuel:setup',
      'vita:v1:dashboard:layout',
      'vita:v1:dashboard:tools',
    ];
    for (const key of Object.values(JourneyKeys)) expect(existing).not.toContain(key);
  });

  it('are the only keys under the journey domain anywhere in source', () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name) && /JOURNEY_DOMAIN|vita:v1:journey/.test(readFileSync(full, 'utf8'))) {
          hits.push(full.slice(full.indexOf('src/')));
        }
      }
    };
    walk(join(__dirname, '..', '..', '..'));
    expect(hits.sort()).toEqual(['src/lib/journey/data/keys.ts', 'src/lib/journey/index.ts']);
  });
});

describe('first run', () => {
  it('has zero entries and no unit preference — nothing seeded', async () => {
    expect(await repo.getEntries()).toEqual([]);
    expect(await repo.getPreferences()).toBeNull();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });
});

describe('round trips', () => {
  it('saves and loads multiple entries, newest first', async () => {
    const a = e('a', '2026-10-01T08:00:00.000Z');
    const b = e('b', '2026-10-15T08:00:00.000Z');
    const c = e('c', '2026-10-15T20:00:00.000Z');
    await repo.saveEntries([a, c, b]);
    expect((await repo.getEntries()).map((x) => x.id)).toEqual(['c', 'b', 'a']);
  });

  it('preserves canonical kg exactly — no rounding on the way to disk', async () => {
    const entry = createWeightEntry({ weight: 180, unit: 'lb' });
    await repo.saveEntries([entry]);
    expect((await repo.getEntries())[0].weightKg).toBe(toKg(180, 'lb'));
  });

  it('persists the unit preference', async () => {
    await repo.savePreferences({ unit: 'kg' });
    expect(await repo.getPreferences()).toEqual({ unit: 'kg' });
  });

  it('explicit empty reads back as empty, and leaves no residue', async () => {
    await repo.saveEntries([e('a', '2026-10-01T08:00:00.000Z')]);
    await repo.saveEntries([]);
    expect(await repo.getEntries()).toEqual([]);
    expect(await AsyncStorage.getItem(JourneyKeys.weight)).toBeNull();
  });
});

describe('corrupt storage', () => {
  it('reads unparseable JSON as empty, without throwing', async () => {
    await AsyncStorage.setItem(JourneyKeys.weight, '{not json');
    await AsyncStorage.setItem(JourneyKeys.preferences, '}}');
    expect(await repo.getEntries()).toEqual([]);
    expect(await repo.getPreferences()).toBeNull();
  });

  it('reads a non-array as empty', async () => {
    await AsyncStorage.setItem(JourneyKeys.weight, JSON.stringify({ entries: [] }));
    expect(await repo.getEntries()).toEqual([]);
  });

  it('drops malformed records whole and keeps the valid ones — never repairs', async () => {
    const good = e('good', '2026-10-15T08:00:00.000Z', 80);
    await AsyncStorage.setItem(
      JourneyKeys.weight,
      JSON.stringify([
        good,
        { ...good, id: 'zero', weightKg: 0 },
        { ...good, id: 'neg', weightKg: -80 },
        { ...good, id: 'str', weightKg: '80' },
        { ...good, id: 'null', weightKg: null },
        { ...good, id: 'unit', enteredUnit: 'stone' },
        { ...good, id: 'time', loggedAt: 'yesterday' },
        { ...good, id: '' },
        { ...good, id: 'good', weightKg: 99 }, // duplicate id
        null,
        42,
      ]),
    );
    expect(await repo.getEntries()).toEqual([good]);
  });

  it('drops unknown fields rather than carrying them into the domain', async () => {
    await AsyncStorage.setItem(
      JourneyKeys.weight,
      JSON.stringify([{ ...e('a', '2026-10-15T08:00:00.000Z'), goalWeightKg: 70, bmi: 24, trend: 'down' }]),
    );
    expect(Object.keys((await repo.getEntries())[0]).sort()).toEqual(['enteredUnit', 'id', 'loggedAt', 'weightKg']);
  });

  it('reading never rewrites what is on disk', async () => {
    const raw = JSON.stringify([e('a', '2026-10-15T08:00:00.000Z'), { id: 'bad' }]);
    await AsyncStorage.setItem(JourneyKeys.weight, raw);
    await repo.getEntries();
    expect(await AsyncStorage.getItem(JourneyKeys.weight)).toBe(raw);
  });

  it('ignores an unknown unit preference', async () => {
    await AsyncStorage.setItem(JourneyKeys.preferences, JSON.stringify({ unit: 'stone' }));
    expect(await repo.getPreferences()).toBeNull();
  });
});

describe('isolation', () => {
  it('writes only Journey keys', async () => {
    await repo.saveEntries([e('a', '2026-10-15T08:00:00.000Z')]);
    await repo.savePreferences({ unit: 'lb' });
    expect([...(await AsyncStorage.getAllKeys())].sort()).toEqual([JourneyKeys.preferences, JourneyKeys.weight].sort());
  });
});
