/**
 * App-level preferences — the settings that belong to VITA itself rather
 * than to any one domain.
 *
 * **Deliberately small, and deliberately not a settings framework.** This
 * holds preferences that no single feature owns. A preference that belongs
 * to a domain stays with that domain: Water owns its display unit under
 * `vita:v1:water:prefs`, and Settings reads and writes *that* source rather
 * than keeping a second copy here that could disagree with it (founder
 * ruling, Open Question #16, closed 2026-08-21).
 *
 * The test for whether something belongs here is simple: does more than one
 * feature read it, and does no feature own it? Appearance passes — it
 * changes every screen and belongs to none of them.
 */

/**
 * The appearance the user chose, which is not the same as the appearance
 * they are currently seeing. `'system'` is a real, persistent choice that
 * resolves differently as the device changes; `ColorScheme` in
 * `src/theme/ThemeProvider.tsx` is the resolved light/dark value.
 *
 * Defined here rather than in the theme because this is the value that gets
 * persisted and read back, and a stored value needs exactly one definition
 * and one validator. `ThemeProvider` re-exports the type under its original
 * name, so every existing import keeps working.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Order is the order the Settings control renders them in. */
export const THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

/**
 * What a user who has never chosen gets — and what an unreadable stored
 * value falls back to.
 *
 * `'system'` rather than `'light'`: following the device is the choice that
 * assumes least about someone who has not expressed a preference, and it
 * matches `app.json`'s `userInterfaceStyle: "automatic"`.
 */
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

/**
 * Guards a mode read back from storage.
 *
 * A stored string that is not one of the three would otherwise reach
 * `resolveScheme` and fall through to a light theme regardless of the
 * device — a wrong answer rather than an honest default.
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}

/**
 * Every app-level preference, as one stored record.
 *
 * **One key, not one key per preference.** These are read together at
 * startup and are individually tiny; a key each would mean a storage round
 * trip per preference for no gain.
 *
 * ## Extension point — body weight and height
 *
 * **BMI did not take it.** The plan, written when BMI was slice 5.8, was
 * that the calculator would need an app-level body-weight unit (lb/kg) and
 * height unit (ft-in/cm). BMI shipped in **5.9** with a **unit selector
 * local to the calculator** and deliberately touched nothing here: it saves
 * no measurement, so an app-wide preference would have been a setting with
 * nothing behind it.
 *
 * **Sprint 6 did not take it either.** The founders ruled (2026-10-15) that
 * **Journey owns the body-weight display unit**, the way Water owns its
 * volume unit — it lives at `vita:v1:journey:prefs` in `src/lib/journey`,
 * not here. If a later feature ever needs an app-wide unit, adding one is:
 *
 *   1. a field here, with its own `DEFAULT_*` and type guard;
 *   2. a line in `parseAppPreferences`, which already falls back per field;
 *   3. a group on the Units screen.
 *
 * No key change and no migration, because `parseAppPreferences` reads
 * field by field and never rejects a record for missing one.
 *
 * **They are not added before something reads them.** A persisted weight
 * unit with no consumer is a preference the user can set and never observe,
 * which is the same dishonesty as a row that navigates nowhere.
 */
export type AppPreferences = {
  themeMode: ThemeMode;
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  themeMode: DEFAULT_THEME_MODE,
};
