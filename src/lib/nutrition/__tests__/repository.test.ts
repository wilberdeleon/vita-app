/**
 * The nutrition repository, against the real AsyncStorage mock.
 *
 * These keys name data already on users' devices, so their exact format is
 * a compatibility contract rather than an implementation detail — the same
 * reasoning `lib/daily/__tests__/keys.test.ts` records for the namespace.
 * Nothing here asserts what the repository *should* do; it pins what it
 * already does, before slice 5.6A changes how goals are represented.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../data/keys';
import {
  asyncStorageNutritionRepository as repository,
  createEntry,
  toFavorite,
  type FoodEntry,
  type VitaFood,
} from '..';

const food = (overrides: Partial<VitaFood> = {}): VitaFood => ({
  vitaId: 'usda:1',
  source: 'usda',
  sourceId: '1',
  name: 'Oats',
  servings: [
    { label: '1 cup', quantity: 1, unit: 'cup', nutrition: { calories: 300, protein: 10, carbs: 54, fat: 5 } },
  ],
  defaultServingIndex: 0,
  isCustom: false,
  fetchedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

const entryOn = (logDate: string, meal: FoodEntry['meal'] = 'Breakfast', overrides: Partial<VitaFood> = {}) =>
  createEntry({ food: food(overrides), quantity: 1, meal, logDate });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('logging a day', () => {
  it('round-trips an entry through storage', async () => {
    const entry = entryOn('2026-09-01');
    await repository.saveEntries('2026-09-01', [entry]);

    expect(await repository.getEntries('2026-09-01')).toEqual([entry]);
  });

  it('preserves every snapshot field a logged entry carries', async () => {
    /*
     * The snapshot design is what lets history stay readable after a food
     * definition changes or disappears. If any of these were dropped on the
     * way to disk, the log would silently start re-deriving them.
     */
    const entry = entryOn('2026-09-01', 'Lunch', {
      brand: 'Quaker',
      imageUrl: 'https://example.test/oats.jpg',
    });
    await repository.saveEntries('2026-09-01', [entry]);

    const [stored] = await repository.getEntries('2026-09-01');
    expect(stored.name).toBe('Oats');
    expect(stored.brand).toBe('Quaker');
    expect(stored.imageUrl).toBe('https://example.test/oats.jpg');
    expect(stored.meal).toBe('Lunch');
    expect(stored.loggedAt).toBe(entry.loggedAt);
    expect(stored.serving).toEqual(entry.serving);
    expect(stored.nutrition).toEqual(entry.nutrition);
    expect(stored.foodRef).toEqual(entry.foodRef);
  });

  it('keeps entry order', async () => {
    const first = entryOn('2026-09-01', 'Breakfast');
    const second = entryOn('2026-09-01', 'Dinner');
    await repository.saveEntries('2026-09-01', [first, second]);

    expect((await repository.getEntries('2026-09-01')).map((e) => e.id)).toEqual([
      first.id,
      second.id,
    ]);
  });

  it('keeps days apart', async () => {
    await repository.saveEntries('2026-09-01', [entryOn('2026-09-01')]);
    await repository.saveEntries('2026-09-02', [entryOn('2026-09-02'), entryOn('2026-09-02')]);

    expect(await repository.getEntries('2026-09-01')).toHaveLength(1);
    expect(await repository.getEntries('2026-09-02')).toHaveLength(2);
  });

  it('returns nothing for a day never written', async () => {
    expect(await repository.getEntries('2026-01-01')).toEqual([]);
  });

  it('removes the key entirely when a day is emptied', async () => {
    // Empty days leave no residue, so key presence can mean "this day has
    // something in it".
    await repository.saveEntries('2026-09-01', [entryOn('2026-09-01')]);
    await repository.saveEntries('2026-09-01', []);

    expect(await AsyncStorage.getItem(StorageKeys.foodLog('2026-09-01'))).toBeNull();
    expect(await repository.getEntries('2026-09-01')).toEqual([]);
  });

  it('drops an entry whose own logDate contradicts its key', async () => {
    // Keeping it would double-count it the moment that other day is opened.
    const stray = entryOn('2026-08-30');
    await AsyncStorage.setItem(StorageKeys.foodLog('2026-09-01'), JSON.stringify([stray]));

    expect(await repository.getEntries('2026-09-01')).toEqual([]);
  });

  it('treats a corrupted day as absent rather than throwing', async () => {
    // A torn write must not block the whole log on launch.
    await AsyncStorage.setItem(StorageKeys.foodLog('2026-09-01'), '{not json');
    expect(await repository.getEntries('2026-09-01')).toEqual([]);
  });

  it('writes under the versioned key the rest of the app agrees on', async () => {
    await repository.saveEntries('2026-09-01', [entryOn('2026-09-01')]);
    expect(StorageKeys.foodLog('2026-09-01')).toBe('vita:v1:foodlog:2026-09-01');
    expect(await AsyncStorage.getItem('vita:v1:foodlog:2026-09-01')).not.toBeNull();
  });
});

describe('recent entries', () => {
  it('reads across days, newest logged first', async () => {
    const older = { ...entryOn('2026-09-01'), loggedAt: '2026-09-01T08:00:00.000Z' };
    const newer = { ...entryOn('2026-09-03'), loggedAt: '2026-09-03T08:00:00.000Z' };
    await repository.saveEntries('2026-09-01', [older]);
    await repository.saveEntries('2026-09-03', [newer]);

    const recents = await repository.getRecentEntries(10);
    expect(recents.map((e) => e.id)).toEqual([newer.id, older.id]);
  });

  it('skips gaps rather than walking back date by date', async () => {
    // A user does not log every day; enumerating keys is why gaps are free.
    await repository.saveEntries('2026-09-01', [entryOn('2026-09-01')]);
    await repository.saveEntries('2026-09-20', [entryOn('2026-09-20')]);

    expect(await repository.getRecentEntries(2)).toHaveLength(2);
  });

  it('honours the day limit, taking the most recent days', async () => {
    await repository.saveEntries('2026-09-01', [entryOn('2026-09-01')]);
    await repository.saveEntries('2026-09-02', [entryOn('2026-09-02')]);
    await repository.saveEntries('2026-09-03', [entryOn('2026-09-03')]);

    const recents = await repository.getRecentEntries(1);
    expect(recents).toHaveLength(1);
    expect(recents[0].logDate).toBe('2026-09-03');
  });
});

describe('goals in storage', () => {
  it('is null for a user who has never set one', async () => {
    /*
     * The finding that decides 5.6A: the repository has always modelled
     * "never set" as `null`. The invented 2,000 kcal default was applied
     * *above* this layer, in the provider — so nothing synthetic was ever
     * written to disk. See the slice's goal audit.
     */
    expect(await repository.getTargets()).toBeNull();
  });

  it('round-trips goals the user actually authored', async () => {
    const authored = { calories: 2200, protein: 150 };
    await repository.saveTargets(authored);
    expect(await repository.getTargets()).toEqual(authored);
  });

  it('ignores carb and fat goals left over from 5.6A', async () => {
    /*
     * §9's backward-compatible read. 5.6A briefly allowed four goals; the
     * founder ruling narrowed them to calories and protein. A record written
     * in between is not migrated or deleted — the parser simply walks
     * `GOAL_FIELDS`, so the extra keys are inert, and the next save drops
     * them. Nothing the user set for calories or protein is lost.
     */
    await AsyncStorage.setItem(
      StorageKeys.targets,
      JSON.stringify({ calories: 2200, protein: 150, carbs: 200, fat: 60 }),
    );
    expect(await repository.getTargets()).toEqual({ calories: 2200, protein: 150 });
  });

  it('drops the stale keys the next time goals are saved', async () => {
    await AsyncStorage.setItem(
      StorageKeys.targets,
      JSON.stringify({ calories: 2200, carbs: 200, fat: 60 }),
    );
    await repository.saveTargets({ calories: 1800 });

    const raw = JSON.parse((await AsyncStorage.getItem(StorageKeys.targets))!) as object;
    expect(Object.keys(raw)).toEqual(['calories']);
  });

  it('treats a record of only carb and fat goals as no goal at all', async () => {
    await AsyncStorage.setItem(StorageKeys.targets, JSON.stringify({ carbs: 200, fat: 60 }));
    expect(await repository.getTargets()).toBeNull();
  });

  it('reads a partial record — a calories-only goal is a goal', async () => {
    /*
     * Before 5.6A `parseTargets` demanded all four macros and returned
     * `null` if any was missing, so a calories-only goal was unreadable.
     * Each field is now read independently: someone may set a calorie goal
     * and no macro goals, or a protein goal alone.
     */
    await AsyncStorage.setItem(StorageKeys.targets, JSON.stringify({ calories: 2200 }));
    expect(await repository.getTargets()).toEqual({ calories: 2200 });
  });

  it('round-trips a partial goal through save and read', async () => {
    await repository.saveTargets({ protein: 150 });
    expect(await repository.getTargets()).toEqual({ protein: 150 });
  });

  it('drops a field that is not a positive number', async () => {
    // A zero or negative goal is not a goal. Nothing here judges the *size*
    // of one — a range check would be a nutrition recommendation.
    await AsyncStorage.setItem(
      StorageKeys.targets,
      JSON.stringify({ calories: 2000, protein: 0 }),
    );
    expect(await repository.getTargets()).toEqual({ calories: 2000 });
  });

  it('treats a record with nothing usable in it as no goal', async () => {
    await AsyncStorage.setItem(StorageKeys.targets, JSON.stringify({ calories: 0 }));
    expect(await repository.getTargets()).toBeNull();
  });

  it('clears goals by removing the key, not by writing an empty record', async () => {
    await repository.saveTargets({ calories: 2200 });
    await repository.saveTargets(null);

    expect(await AsyncStorage.getItem(StorageKeys.targets)).toBeNull();
    expect(await repository.getTargets()).toBeNull();
  });

  it('accepts no absurd-value policy of its own', async () => {
    // 5,000 kcal is the user's business. VITA stores what it is told.
    await repository.saveTargets({ calories: 5000 });
    expect(await repository.getTargets()).toEqual({ calories: 5000 });
  });

  it('stores them under the compatibility key', async () => {
    expect(StorageKeys.targets).toBe('vita:v1:targets');
  });

  it('treats a corrupted record as no goals rather than throwing', async () => {
    await AsyncStorage.setItem(StorageKeys.targets, '{not json');
    expect(await repository.getTargets()).toBeNull();
  });
});

describe('favourites', () => {
  it('round-trips a favourite', async () => {
    await repository.saveFavorites([toFavorite(food())]);
    const [stored] = await repository.getFavorites();
    expect(stored.vitaId).toBe('usda:1');
  });

  it('removes the key when the last favourite goes', async () => {
    await repository.saveFavorites([toFavorite(food())]);
    await repository.saveFavorites([]);
    expect(await AsyncStorage.getItem(StorageKeys.favorites)).toBeNull();
    expect(await repository.getFavorites()).toEqual([]);
  });

  it('keeps a definition for a source whose terms allow storing one', async () => {
    // This is what makes favourites work offline and after a cache expires.
    await repository.saveFavorites([toFavorite(food({ source: 'vita-custom' }))]);
    const [stored] = await repository.getFavorites();
    expect(stored.food?.name).toBe('Oats');
  });
});

describe('custom foods', () => {
  it('round-trips My Foods', async () => {
    const custom = food({ source: 'vita-custom', vitaId: 'vita-custom:x', isCustom: true });
    await repository.saveCustomFoods([custom]);
    expect((await repository.getCustomFoods())[0].name).toBe('Oats');
  });

  it('removes the key when the last one goes', async () => {
    await repository.saveCustomFoods([
      food({ source: 'vita-custom', vitaId: 'vita-custom:x', isCustom: true }),
    ]);
    await repository.saveCustomFoods([]);
    expect(await AsyncStorage.getItem(StorageKeys.myFoods)).toBeNull();
  });
});

describe('data safety', () => {
  it('touches no key outside its own namespace', async () => {
    await AsyncStorage.setItem('vita:v1:water:log:2026-09-01', '[]');
    await AsyncStorage.setItem('vita:v1:peptides:log:2026-09-01', '[]');

    await repository.saveEntries('2026-09-01', [entryOn('2026-09-01')]);
    await repository.saveTargets({ calories: 2000 });
    await repository.saveFavorites([toFavorite(food())]);

    expect(await AsyncStorage.getItem('vita:v1:water:log:2026-09-01')).toBe('[]');
    expect(await AsyncStorage.getItem('vita:v1:peptides:log:2026-09-01')).toBe('[]');
  });
});
