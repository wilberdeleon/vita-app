/**
 * The app-preference persistence boundary, against a real AsyncStorage mock.
 *
 * Two things are being proven. The ordinary path — what is saved comes back,
 * and a relaunch is just another read. And that a damaged store degrades to
 * a *default* rather than to a wrong value: an appearance that reads back as
 * some unrecognised string would otherwise fall through `resolveScheme` to a
 * light theme regardless of the device, which is a wrong answer dressed as
 * a working one.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NAMESPACE } from '../../daily/keys';
import { asyncStoragePreferencesRepository as repo } from '../data/asyncStorageRepository';
import { PreferenceKeys } from '../data/keys';
import { DEFAULT_THEME_MODE, THEME_MODES, isThemeMode } from '../model/types';

/** Writes a raw payload under the preference key, bypassing the repository. */
async function putRaw(payload: unknown): Promise<void> {
  await AsyncStorage.setItem(PreferenceKeys.app, JSON.stringify(payload));
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('storage key', () => {
  it('is namespaced under vita:v1 and isolated to settings', () => {
    expect(PreferenceKeys.app).toBe(`${NAMESPACE}:settings:prefs`);
  });

  /**
   * The whole point of the #16 ruling: Settings does not own Water's
   * preference. If these two keys ever collided, one would silently
   * overwrite the other.
   */
  it('cannot collide with the water preference key', () => {
    expect(PreferenceKeys.app).not.toBe(`${NAMESPACE}:water:prefs`);
  });
});

describe('isThemeMode', () => {
  it('accepts every declared mode', () => {
    for (const mode of THEME_MODES) expect(isThemeMode(mode)).toBe(true);
  });

  it('rejects anything else', () => {
    for (const value of ['Light', 'DARK', '', 'auto', null, undefined, 0, 1, {}, [], true]) {
      expect(isThemeMode(value)).toBe(false);
    }
  });

  /**
   * `includes` on an array rather than `in` on an object: `in` walks the
   * prototype chain, so `'toString'` and `'constructor'` would both pass.
   */
  it('rejects inherited object properties', () => {
    expect(isThemeMode('toString')).toBe(false);
    expect(isThemeMode('constructor')).toBe(false);
    expect(isThemeMode('hasOwnProperty')).toBe(false);
  });
});

describe('round trip', () => {
  it('returns null before anything has been written', async () => {
    expect(await repo.get()).toBeNull();
  });

  it.each(THEME_MODES)('saves and reads back %s', async (mode) => {
    await repo.save({ themeMode: mode });
    expect(await repo.get()).toEqual({ themeMode: mode });
  });

  it('replaces the previous value rather than accumulating', async () => {
    await repo.save({ themeMode: 'dark' });
    await repo.save({ themeMode: 'light' });
    expect(await repo.get()).toEqual({ themeMode: 'light' });
  });
});

describe('damaged storage degrades to defaults, never to a wrong value', () => {
  it('treats unparseable JSON as absent', async () => {
    await AsyncStorage.setItem(PreferenceKeys.app, '{not json');
    expect(await repo.get()).toBeNull();
  });

  it.each([['a string'], [42], [null], [[]], [true]])(
    'treats a non-record payload (%p) as absent',
    async (payload) => {
      await putRaw(payload);
      expect(await repo.get()).toBeNull();
    },
  );

  it.each([['sepia'], [''], [7], [null], [{}], [['dark']]])(
    'falls back to the default for an invalid themeMode (%p)',
    async (stored) => {
      await putRaw({ themeMode: stored });
      expect(await repo.get()).toEqual({ themeMode: DEFAULT_THEME_MODE });
    },
  );

  it('falls back to the default when the field is missing entirely', async () => {
    await putRaw({});
    expect(await repo.get()).toEqual({ themeMode: DEFAULT_THEME_MODE });
  });

  /**
   * The forward-compatibility guarantee that makes the slice-4.4 extension
   * point real: a record written by a build that knows more preferences
   * than this one keeps the fields this build understands, rather than
   * being discarded because it carried an unfamiliar key.
   */
  it('keeps a known field when the record carries unknown ones', async () => {
    await putRaw({ themeMode: 'dark', weightUnit: 'kg', somethingLater: true });
    expect(await repo.get()).toEqual({ themeMode: 'dark' });
  });
});
