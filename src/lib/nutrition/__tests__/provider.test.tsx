/**
 * `NutritionProvider` behaviour, through a real React render.
 *
 * Follows the shape `lib/water/__tests__/provider.test.tsx` established: a
 * probe component that renders nothing and hands the context out, over the
 * in-memory repository the provider was built to accept.
 *
 * Written **before** slice 5.6A changes how goals are represented, so the
 * "a brand-new user is handed 2,000 kcal they never chose" behaviour is on
 * record as the thing that was deliberately removed.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { NutritionRepository } from '../data/FoodLogRepository';
import { createEntry } from '../model/foods';
import type { FoodEntry, NutritionTargets, VitaFood } from '../model/types';
import type { FavoriteFood } from '../model/favorites';
import { NutritionProvider, useNutrition, type NutritionContextValue } from '../state/NutritionProvider';
import { useDailyNutrition, type DailyNutrition } from '../state/useDailyNutrition';
import { todayLogDate } from '../../daily/dates';

const TODAY = todayLogDate();

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

/** The injectable seam, in memory, so "disk" is inspectable. */
function fakeRepository(
  seed: { entries?: Record<string, FoodEntry[]>; targets?: NutritionTargets | null } = {},
) {
  const days: Record<string, FoodEntry[]> = { ...(seed.entries ?? {}) };
  let targets: NutritionTargets | null = seed.targets ?? null;
  let customFoods: VitaFood[] = [];
  let favorites: FavoriteFood[] = [];

  const repository: NutritionRepository = {
    async getEntries(logDate) {
      return days[logDate] ? [...days[logDate]] : [];
    },
    async saveEntries(logDate, entries) {
      days[logDate] = [...entries];
    },
    async getTargets() {
      return targets;
    },
    async saveTargets(next) {
      targets = next;
    },
    async getCustomFoods() {
      return [...customFoods];
    },
    async saveCustomFoods(next) {
      customFoods = [...next];
    },
    async getRecentEntries() {
      return Object.values(days).flat();
    },
    async getFavorites() {
      return [...favorites];
    },
    async saveFavorites(next) {
      favorites = [...next];
    },
  };

  return {
    repository,
    day: (logDate: string) => days[logDate] ?? [],
    targets: () => targets,
    favorites: () => favorites,
    customFoods: () => customFoods,
  };
}

let tree: ReactTestRenderer | null = null;

/** Mounts the provider and returns live accessors for its context. */
async function mount(repository: NutritionRepository) {
  let context: NutritionContextValue | null = null;
  let daily: DailyNutrition | null = null;

  function Probe() {
    context = useNutrition();
    daily = useDailyNutrition();
    return null;
  }

  await act(async () => {
    tree = create(
      <NutritionProvider repository={repository}>
        <Probe />
      </NutritionProvider>,
    );
  });

  return {
    get context() {
      return context!;
    },
    get daily() {
      return daily!;
    },
  };
}

afterEach(async () => {
  if (tree) await act(async () => tree!.unmount());
  tree = null;
});

describe('hydrating', () => {
  it('loads today from the repository', async () => {
    const seeded = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [seeded] } });
    const app = await mount(fake.repository);

    expect(app.daily.isLoading).toBe(false);
    expect(app.daily.entries).toHaveLength(1);
    expect(app.daily.logDate).toBe(TODAY);
  });

  it('opens empty for a user with nothing logged', async () => {
    const app = await mount(fakeRepository().repository);
    expect(app.daily.isEmpty).toBe(true);
    expect(app.daily.nutrition.calories).toBe(0);
  });

  it('reports a failed read without throwing', async () => {
    const broken: NutritionRepository = {
      ...fakeRepository().repository,
      async getEntries() {
        throw new Error('disk gone');
      },
    };
    const app = await mount(broken);

    expect(app.daily.error).toBe("We couldn't load your food log.");
    expect(app.daily.entries).toEqual([]);
  });
});

describe('logging, editing and removing', () => {
  it('adds an entry and re-derives the day', async () => {
    const fake = fakeRepository();
    const app = await mount(fake.repository);

    await act(async () => {
      await app.context.addEntry(
        createEntry({ food: food(), quantity: 2, meal: 'Lunch', logDate: TODAY }),
      );
    });

    expect(app.daily.nutrition.calories).toBe(600);
    expect(app.daily.isEmpty).toBe(false);
    // …and it reached storage, not just state.
    expect(fake.day(TODAY)).toHaveLength(1);
  });

  it('files the entry under the meal it was logged to', async () => {
    const fake = fakeRepository();
    const app = await mount(fake.repository);

    await act(async () => {
      await app.context.addEntry(
        createEntry({ food: food(), quantity: 1, meal: 'Dinner', logDate: TODAY }),
      );
    });

    const dinner = app.daily.meals.find((meal) => meal.slot === 'Dinner')!;
    expect(dinner.itemCount).toBe(1);
    expect(app.daily.mealsLoggedCount).toBe(1);
    expect(app.daily.totalMealSlots).toBe(4);
  });

  it('keeps two entries added in the same tick', async () => {
    // The refs that shadow reducer state exist for exactly this: without
    // them the second write reads a stale array and drops the first.
    const fake = fakeRepository();
    const app = await mount(fake.repository);

    await act(async () => {
      await Promise.all([
        app.context.addEntry(createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY })),
        app.context.addEntry(createEntry({ food: food(), quantity: 1, meal: 'Lunch', logDate: TODAY })),
      ]);
    });

    expect(fake.day(TODAY)).toHaveLength(2);
  });

  it('updates an entry and re-derives the totals', async () => {
    const seeded = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [seeded] } });
    const app = await mount(fake.repository);

    await act(async () => {
      await app.context.updateEntry(seeded.id, {
        nutrition: { calories: 900, protein: 30, carbs: 100, fat: 20 },
      });
    });

    expect(app.daily.nutrition.calories).toBe(900);
  });

  it('removes an entry', async () => {
    const seeded = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [seeded] } });
    const app = await mount(fake.repository);

    await act(async () => app.context.removeEntry(seeded.id));

    expect(app.daily.entries).toEqual([]);
    expect(app.daily.nutrition.calories).toBe(0);
    expect(fake.day(TODAY)).toEqual([]);
  });

  it('restores a removed entry to its original position — the undo path', async () => {
    const first = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const second = createEntry({ food: food(), quantity: 1, meal: 'Lunch', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [first, second] } });
    const app = await mount(fake.repository);

    await act(async () => app.context.removeEntry(first.id));
    await act(async () => app.context.restoreEntry(first, 0));

    expect(app.daily.entries.map((entry) => entry.id)).toEqual([first.id, second.id]);
  });

  it('totals stay derived — nothing caches a stale sum', async () => {
    const seeded = createEntry({ food: food(), quantity: 1, meal: 'Breakfast', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [seeded] } });
    const app = await mount(fake.repository);
    expect(app.daily.nutrition.calories).toBe(300);

    await act(async () => app.context.removeEntry(seeded.id));
    expect(app.daily.nutrition.calories).toBe(0);

    await act(async () => {
      await app.context.addEntry(
        createEntry({ food: food(), quantity: 3, meal: 'Snacks', logDate: TODAY }),
      );
    });
    expect(app.daily.nutrition.calories).toBe(900);
  });
});

describe('favourites and My Foods', () => {
  it('toggles a favourite on and off, and persists it', async () => {
    const fake = fakeRepository();
    const app = await mount(fake.repository);

    await act(async () => {
      await app.context.toggleFavorite(food());
    });
    expect(app.context.isFavorite('usda:1')).toBe(true);
    expect(fake.favorites()).toHaveLength(1);

    await act(async () => {
      await app.context.toggleFavorite(food());
    });
    expect(app.context.isFavorite('usda:1')).toBe(false);
    expect(fake.favorites()).toEqual([]);
  });

  it('saves a custom food and can find it again', async () => {
    const fake = fakeRepository();
    const app = await mount(fake.repository);

    const custom = food({ vitaId: 'vita-custom:x', source: 'vita-custom', sourceId: 'x', isCustom: true });
    await act(async () => {
      await app.context.saveCustomFood(custom);
    });

    expect(app.context.findFood('vita-custom:x')?.name).toBe('Oats');
    expect(fake.customFoods()).toHaveLength(1);
  });

  it('removes a custom food', async () => {
    const fake = fakeRepository();
    const app = await mount(fake.repository);
    const custom = food({ vitaId: 'vita-custom:x', source: 'vita-custom', sourceId: 'x', isCustom: true });

    await act(async () => {
      await app.context.saveCustomFood(custom);
    });
    await act(async () => app.context.removeCustomFood('vita-custom:x'));

    expect(app.context.findFood('vita-custom:x')).toBeUndefined();
  });
});

describe('goals', () => {
  it('gives a brand-new user none, rather than figures VITA chose', async () => {
    /*
     * **The defect slice 5.6A removed.** The repository has always modelled
     * "never set" as `null`; the provider then substituted
     * `DEFAULT_TARGETS` — 2,000 kcal, 160 g protein, 214 g carbs, 64 g fat,
     * carried over from two Sprint 1 fixtures — and every Fuel surface
     * presented them as the user's own goals, against a `updateTargets`
     * that no screen ever called.
     *
     * Nothing synthetic was ever written to disk, which is why removing it
     * needed no migration and could not lose anyone's data.
     */
    const fake = fakeRepository({ targets: null });
    const app = await mount(fake.repository);

    expect(fake.targets()).toBeNull();
    expect(app.daily.targets).toBeNull();
    // And none of the goal-relative figures pretend to exist either.
    expect(app.daily.caloriesRemaining).toBeNull();
    expect(app.daily.caloriesOver).toBeNull();
    expect(app.daily.calorieProgress).toBeNull();
    expect(app.daily.caloriePercent).toBeNull();
  });

  it('reads back goals the user authored', async () => {
    const authored = { calories: 1800, protein: 120 };
    const app = await mount(fakeRepository({ targets: authored }).repository);
    expect(app.daily.targets).toEqual(authored);
    expect(app.daily.caloriesRemaining).toBe(1800);
  });

  it('supports a calories-only goal, with no protein figure invented', async () => {
    const app = await mount(fakeRepository({ targets: { calories: 2200 } }).repository);

    expect(app.daily.targets).toEqual({ calories: 2200 });
    expect(app.daily.targets?.protein).toBeUndefined();
    expect(app.daily.caloriePercent).toBe(0);
  });

  it('supports a protein-only goal, with no calorie figures invented', async () => {
    const app = await mount(fakeRepository({ targets: { protein: 150 } }).repository);

    expect(app.daily.targets).toEqual({ protein: 150 });
    expect(app.daily.caloriesRemaining).toBeNull();
    expect(app.daily.caloriePercent).toBeNull();
  });

  it('derives nothing goal-shaped for carbs or fat, ever', async () => {
    /*
     * 5.6A.1: carbohydrate and fat are tracked totals with no target, so
     * there is no progress, no remainder and no percentage to compute. The
     * type no longer admits one, and this pins the behaviour beside it.
     */
    const seeded = createEntry({ food: food(), quantity: 1, meal: 'Lunch', logDate: TODAY });
    const fake = fakeRepository({
      entries: { [TODAY]: [seeded] },
      targets: { calories: 2000, protein: 150 },
    });
    const app = await mount(fake.repository);

    expect(app.daily.nutrition.carbs).toBe(54);
    expect(app.daily.nutrition.fat).toBe(5);
    expect(Object.keys(app.daily.targets ?? {}).sort()).toEqual(['calories', 'protein']);
  });

  it('writes what the user set, and clears back to nothing', async () => {
    const fake = fakeRepository();
    const app = await mount(fake.repository);

    await act(async () => app.context.updateTargets({ calories: 2200, protein: 150 }));
    expect(fake.targets()).toEqual({ calories: 2200, protein: 150 });
    expect(app.daily.targets).toEqual({ calories: 2200, protein: 150 });

    await act(async () => app.context.updateTargets(null));
    // Clearing restores *no goal* — never the old synthetic figures.
    expect(fake.targets()).toBeNull();
    expect(app.daily.targets).toBeNull();
    expect(app.daily.caloriesRemaining).toBeNull();
  });

  it('measures the day against a goal once one exists', async () => {
    const seeded = createEntry({ food: food(), quantity: 2, meal: 'Breakfast', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [seeded] }, targets: { calories: 2000 } });
    const app = await mount(fake.repository);

    expect(app.daily.nutrition.calories).toBe(600);
    expect(app.daily.caloriesRemaining).toBe(1400);
    expect(app.daily.caloriesOver).toBe(0);
    expect(app.daily.caloriePercent).toBe(30);
  });

  it('reports being over factually, and never as a negative remainder', async () => {
    const seeded = createEntry({ food: food(), quantity: 10, meal: 'Dinner', logDate: TODAY });
    const fake = fakeRepository({ entries: { [TODAY]: [seeded] }, targets: { calories: 2000 } });
    const app = await mount(fake.repository);

    expect(app.daily.caloriesRemaining).toBe(0);
    expect(app.daily.caloriesOver).toBe(1000);
    // Clamped so the ring stays honest while the percentage keeps counting.
    expect(app.daily.calorieProgress).toBe(1);
    expect(app.daily.caloriePercent).toBe(150);
  });
});
