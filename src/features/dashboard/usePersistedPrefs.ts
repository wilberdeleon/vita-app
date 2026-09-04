import { useCallback, useEffect, useRef, useState } from 'react';
import { readJson, writeJson } from '../../lib/daily/storage';

/** A value, or a function of the current one — `useState`'s own shape. */
export type PrefsUpdate<T> = T | ((current: T) => T);

export type PersistedPrefs<T> = {
  value: T;
  /** True until the stored value has been read. */
  isLoading: boolean;
  setValue: (next: PrefsUpdate<T>) => void;
};

/**
 * One small persisted UI preference, read once and written as it changes.
 *
 * Shared by the Dashboard's two preferences — the widget layout and the Quick
 * Tools order — because they want identical behaviour and the second one
 * would otherwise be a copy of the first.
 *
 * ## Why these do not live in `src/lib/preferences`
 *
 * Two reasons, one architectural and one concrete. That module's own rule is
 * that it holds preferences *no single feature owns*; Home owns both of
 * these and nothing else reads them, exactly as Water's display unit stays
 * under `vita:v1:water:prefs`.
 *
 * The concrete one settles it: `PreferencesRepository.save()` writes the
 * **whole record**, and `ThemeProvider` calls it as `save({ themeMode })` —
 * so anything stored alongside would be erased the next time somebody
 * changed their theme.
 *
 * ## Reads are guarded, writes are fire-and-forget
 *
 * Whatever comes back goes through the caller's `normalize`, so a stale,
 * partial or hand-edited record still produces something renderable. A failed
 * write is deliberately silent: the change already applies for this session,
 * and an alert about a preference that will re-apply on the next tap is more
 * alarming than the loss it describes — the same trade `ThemeProvider`
 * records.
 *
 * ## `setValue` accepts an updater
 *
 * Like `useState`, because Home's drag handler is a stable callback held for
 * the life of a gesture: taking the layout from the render that created it
 * would reorder a list that may already have changed. Reading the current
 * value through a ref keeps the setter's identity stable, which is what let
 * the handler be stable in the first place.
 */
export function usePersistedPrefs<T>(
  key: string,
  normalize: (stored: unknown) => T,
  fallback: T,
): PersistedPrefs<T> {
  const [value, setValueState] = useState<T>(fallback);
  const [isLoading, setLoading] = useState(true);

  // Held in refs so the effect below never re-runs when a caller passes a new
  // function identity; the key is the only thing that identifies the record.
  const normalizeRef = useRef(normalize);
  normalizeRef.current = normalize;

  // Latest value, for resolving updaters without making `setValue` change
  // identity on every render.
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await readJson(key);
        // `null` means nothing was ever saved — a user who has not customised
        // anything, not an error. They get the fallback.
        if (!cancelled && stored !== null) setValueState(normalizeRef.current(stored));
      } catch (error) {
        if (__DEV__) console.warn(`[dashboard] could not read ${key}`, error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = useCallback(
    (update: PrefsUpdate<T>) => {
      const next =
        typeof update === 'function' ? (update as (current: T) => T)(valueRef.current) : update;

      // The UI changes immediately and does not wait on storage. A layout that
      // lagged a tap behind a disk write would feel broken.
      valueRef.current = next;
      setValueState(next);
      void (async () => {
        try {
          await writeJson(key, next);
        } catch (error) {
          if (__DEV__) console.warn(`[dashboard] could not save ${key}`, error);
        }
      })();
    },
    [key],
  );

  return { value, isLoading, setValue };
}
