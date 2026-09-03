/**
 * VITA's app-level preference store.
 *
 * What lives here is deliberately narrow: preferences that change the whole
 * app and belong to no single feature. Domain preferences stay with their
 * domain — see the note in `model/types.ts`.
 */

export {
  DEFAULT_APP_PREFERENCES,
  DEFAULT_THEME_MODE,
  THEME_MODES,
  isThemeMode,
  type AppPreferences,
  type ThemeMode,
} from './model/types';

export type { PreferencesRepository } from './data/PreferencesRepository';
export { asyncStoragePreferencesRepository } from './data/asyncStorageRepository';
export { PREFERENCES_DOMAIN, PreferenceKeys } from './data/keys';
