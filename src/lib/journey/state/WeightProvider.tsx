/**
 * Journey / Weight state — the one place weight entries change.
 *
 * Mirrors `WaterProvider`: refs shadow state so two mutations in one tick
 * cannot drop each other, writes are optimistic, and every mutation resolves
 * a boolean that is `true` only when the write reached storage — a caller
 * must never confirm a weigh-in that was not saved.
 *
 * Mounted at the root with `JourneyProvider` (6.5): the Journey tab, the
 * start flow and the Journey summary route all read the same history.
 *
 * Deliberately exposes no chart, trend, delta or goal API. `current` is the
 * newest entry, derived on every change and never stored.
 *
 * **Journey boundary (6.7 correction).** A Journey-owned weigh-in may not be
 * dated before its Journey's start day. `WeightProvider` sits *above*
 * `JourneyProvider`, so the Journey registers a start-date lookup here
 * (`setJourneyStarts`) and every add, edit and restore of a Journey-owned
 * entry is checked against it — whatever screen or code makes the call.
 * Unowned legacy entries are never checked; an id the lookup does not know
 * (a Journey being created this instant) is not blocked.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { asyncStorageWeightRepository } from '../data/asyncStorageRepository';
import type { WeightRepository } from '../data/WeightRepository';
import {
  addWeightEntry,
  createWeightEntry,
  latestEntry,
  removeWeightEntry,
  updateWeightEntry,
  type WeightEntryChanges,
} from '../model/entries';
import type { LogDate } from '../../daily/dates';
import { isWithinJourneyStart } from '../model/journeys';
import { DEFAULT_WEIGHT_PREFERENCES, type WeightEntry, type WeightPreferences, type WeightUnit } from '../model/types';

export type WeightState = {
  status: 'loading' | 'ready';
  /** Newest first — the one ordering every consumer uses. */
  entries: WeightEntry[];
  /** Derived: the newest entry, or `null`. Never persisted. */
  current: WeightEntry | null;
  unit: WeightUnit;
  error: string | null;
};

export type WeightContextValue = WeightState & {
  /** Always a new record — never replaces a same-day entry. `journeyId` owns it (6.5). */
  addEntry: (weight: number, unit: WeightUnit, loggedAt?: Date, journeyId?: string) => Promise<boolean>;
  /** `false`, with nothing written, when no entry has this id. */
  updateEntry: (id: string, changes: WeightEntryChanges) => Promise<boolean>;
  /** `false`, with nothing written, when no entry has this id. */
  removeEntry: (id: string) => Promise<boolean>;
  /**
   * Puts a removed entry back exactly as it was — same id, time and value.
   * Powers Undo after a delete (slice 6.4). `false`, with nothing written, if
   * an entry with that id already exists.
   */
  restoreEntry: (entry: WeightEntry) => Promise<boolean>;
  /** Changes display only; stored entries are never rewritten. */
  setUnit: (unit: WeightUnit) => Promise<boolean>;
  /** Registered by `JourneyProvider`: a Journey's start day, or `null` if unknown. */
  setJourneyStarts: (lookup: JourneyStartLookup) => void;
};

export type JourneyStartLookup = (journeyId: string) => LogDate | null;

const NO_STARTS: JourneyStartLookup = () => null;

const WeightContext = createContext<WeightContextValue | null>(null);

type Props = PropsWithChildren<{
  /** Injectable so a test double — or a networked implementation — drops in unchanged. */
  repository?: WeightRepository;
}>;

export function WeightProvider({ children, repository = asyncStorageWeightRepository }: Props) {
  const [status, setStatus] = useState<WeightState['status']>('loading');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [preferences, setPreferences] = useState<WeightPreferences>(DEFAULT_WEIGHT_PREFERENCES);
  const [error, setError] = useState<string | null>(null);

  const entriesRef = useRef<WeightEntry[]>([]);
  const startsRef = useRef<JourneyStartLookup>(NO_STARTS);
  const setJourneyStarts = useCallback((lookup: JourneyStartLookup) => {
    startsRef.current = lookup;
  }, []);
  /** `false` for a Journey-owned entry dated before its Journey's start day. */
  const withinJourney = useCallback((entry: WeightEntry) => {
    if (!entry.journeyId) return true;
    const start = startsRef.current(entry.journeyId);
    return start === null || isWithinJourneyStart(entry.loggedAt, start);
  }, []);
  /**
   * Resolves when the stored history has been read. Every mutation awaits it:
   * an add fired before the load finished would otherwise save a one-entry
   * list over the user's whole history.
   */
  const loaded = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  if (loaded.current === null) {
    let resolve = () => {};
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    loaded.current = { promise, resolve };
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [stored, prefs] = await Promise.all([repository.getEntries(), repository.getPreferences()]);
        if (cancelled) return;
        entriesRef.current = stored;
        setEntries(stored);
        setPreferences(prefs ?? DEFAULT_WEIGHT_PREFERENCES);
      } catch {
        if (!cancelled) setError("We couldn't load your weight history.");
      } finally {
        if (!cancelled) setStatus('ready');
        loaded.current?.resolve();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const commit = useCallback(
    async (mutate: (current: WeightEntry[]) => WeightEntry[] | null): Promise<boolean> => {
      await loaded.current?.promise;
      const next = mutate(entriesRef.current);
      if (next === null) return false;
      entriesRef.current = next;
      setEntries(next);
      try {
        await repository.saveEntries(next);
        setError(null);
        return true;
      } catch {
        setError("We couldn't save that. Your weight history may not persist.");
        return false;
      }
    },
    [repository],
  );

  const addEntry = useCallback(
    (weight: number, unit: WeightUnit, loggedAt?: Date, journeyId?: string) => {
      // Built before awaiting, so an invalid weight throws to the caller at once.
      const entry = createWeightEntry({ weight, unit, loggedAt, journeyId });
      return commit((current) => (withinJourney(entry) ? addWeightEntry(current, entry) : null));
    },
    [commit, withinJourney],
  );

  const updateEntry = useCallback(
    (id: string, changes: WeightEntryChanges) =>
      commit((current) => {
        if (!current.some((entry) => entry.id === id)) return null;
        const next = updateWeightEntry(current, id, changes);
        return withinJourney(next.find((entry) => entry.id === id)!) ? next : null;
      }),
    [commit, withinJourney],
  );

  const removeEntry = useCallback(
    (id: string) =>
      commit((current) => (current.some((entry) => entry.id === id) ? removeWeightEntry(current, id) : null)),
    [commit],
  );

  const restoreEntry = useCallback(
    (entry: WeightEntry) =>
      commit((current) =>
        current.some((existing) => existing.id === entry.id) || !withinJourney(entry) ? null : addWeightEntry(current, entry),
      ),
    [commit, withinJourney],
  );

  const setUnit = useCallback(
    async (unit: WeightUnit) => {
      const next: WeightPreferences = { unit };
      setPreferences(next);
      try {
        await repository.savePreferences(next);
        return true;
      } catch {
        setError("We couldn't save your unit preference.");
        return false;
      }
    },
    [repository],
  );

  const value = useMemo<WeightContextValue>(
    () => ({
      status,
      entries,
      current: latestEntry(entries),
      unit: preferences.unit,
      error,
      addEntry,
      updateEntry,
      removeEntry,
      restoreEntry,
      setUnit,
      setJourneyStarts,
    }),
    [status, entries, preferences.unit, error, addEntry, updateEntry, removeEntry, restoreEntry, setUnit, setJourneyStarts],
  );

  return <WeightContext.Provider value={value}>{children}</WeightContext.Provider>;
}

export function useWeight(): WeightContextValue {
  const context = useContext(WeightContext);
  if (!context) throw new Error('useWeight must be used inside a WeightProvider.');
  return context;
}
