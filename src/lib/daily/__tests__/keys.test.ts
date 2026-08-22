/**
 * Storage keys name data that is already on users' devices. Their exact
 * format is a compatibility contract, not an implementation detail — a change
 * here does not throw, it silently orphans a real person's food log.
 *
 * The nutrition block below exists specifically because slice 3.1 moved
 * `NAMESPACE` out of nutrition and into the shared layer. These assertions
 * pin the strings nutrition produced before that move.
 */

import { FOOD_LOG_KEY_PREFIX, StorageKeys } from '../../nutrition/data/keys';
import { NAMESPACE, dayKey, dayKeyPrefix, singletonKey } from '../keys';

describe('shared namespace', () => {
  it('is versioned, so a future shape change can migrate instead of overwrite', () => {
    expect(NAMESPACE).toBe('vita:v1');
  });
});

describe('nutrition keys are unchanged by the slice 3.1 promotion', () => {
  it('builds the same food-log key as before', () => {
    expect(StorageKeys.foodLog('2026-08-22')).toBe('vita:v1:foodlog:2026-08-22');
  });

  it('builds the same singleton keys as before', () => {
    expect(StorageKeys.targets).toBe('vita:v1:targets');
    expect(StorageKeys.myFoods).toBe('vita:v1:myfoods');
    expect(StorageKeys.favorites).toBe('vita:v1:favorites');
  });

  it('builds the same cached-food key as before', () => {
    expect(StorageKeys.cachedFood('usda:12345')).toBe('vita:v1:cache:food:usda:12345');
  });

  it('keeps the food-log prefix consistent with the keys it enumerates', () => {
    expect(FOOD_LOG_KEY_PREFIX).toBe('vita:v1:foodlog:');
    const key = StorageKeys.foodLog('2026-08-22');
    expect(key.startsWith(FOOD_LOG_KEY_PREFIX)).toBe(true);
    expect(key.slice(FOOD_LOG_KEY_PREFIX.length)).toBe('2026-08-22');
  });
});

describe('shared key builders', () => {
  it('namespaces a day key by domain', () => {
    expect(dayKey('water', '2026-08-22')).toBe('vita:v1:water:log:2026-08-22');
    expect(dayKey('peptides', '2026-08-22')).toBe('vita:v1:peptides:log:2026-08-22');
  });

  it('keeps domains from colliding', () => {
    expect(dayKey('water', '2026-08-22')).not.toBe(dayKey('peptides', '2026-08-22'));
  });

  it('returns a prefix that slices cleanly back to the date', () => {
    const prefix = dayKeyPrefix('water');
    const key = dayKey('water', '2026-08-22');
    expect(key.startsWith(prefix)).toBe(true);
    expect(key.slice(prefix.length)).toBe('2026-08-22');
  });

  it('does not let one domain prefix match another domain key', () => {
    expect(dayKey('peptides', '2026-08-22').startsWith(dayKeyPrefix('water'))).toBe(false);
  });

  it('namespaces singleton keys by domain', () => {
    expect(singletonKey('water', 'goal')).toBe('vita:v1:water:goal');
    expect(singletonKey('water', 'prefs')).toBe('vita:v1:water:prefs');
    expect(singletonKey('peptides', 'setups')).toBe('vita:v1:peptides:setups');
  });

  it('keeps a singleton key from ever colliding with a day key', () => {
    expect(singletonKey('water', 'goal')).not.toBe(dayKey('water', '2026-08-22'));
  });
});
