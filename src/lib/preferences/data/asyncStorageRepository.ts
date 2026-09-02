/**
 * AsyncStorage-backed app preferences.
 *
 * Built on the shared `readJson`/`writeJson` helpers, which already treat
 * unparseable JSON as absent rather than throwing — a corrupted preference
 * should cost the user their theme choice, not the ability to open the app.
 */

import { isRecord } from '../../daily/guards';
import { readJson, writeJson } from '../../daily/storage';
import { DEFAULT_THEME_MODE, isThemeMode, type AppPreferences } from '../model/types';
import type { PreferencesRepository } from './PreferencesRepository';
import { PreferenceKeys } from './keys';

/**
 * Reads the stored record **field by field**, never all-or-nothing.
 *
 * This is what makes the extension point in `model/types.ts` real. A record
 * written before a preference existed is missing that field, and a record
 * written by a newer build carries fields this one does not know. Rejecting
 * the whole record in either case would silently discard preferences the
 * user did set — so each field independently falls back to its default and
 * everything valid survives.
 *
 * `null` is reserved for "there is nothing here at all", which is a
 * different answer from "here is a record whose fields I had to default".
 */
function parseAppPreferences(value: unknown): AppPreferences | null {
  if (!isRecord(value)) return null;

  return {
    themeMode: isThemeMode(value.themeMode) ? value.themeMode : DEFAULT_THEME_MODE,
  };
}

export const asyncStoragePreferencesRepository: PreferencesRepository = {
  async get(): Promise<AppPreferences | null> {
    return parseAppPreferences(await readJson(PreferenceKeys.app));
  },

  async save(preferences: AppPreferences): Promise<void> {
    await writeJson(PreferenceKeys.app, preferences);
  },
};
