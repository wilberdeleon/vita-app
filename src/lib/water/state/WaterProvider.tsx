/**
 * The single source of truth for hydration state.
 *
 * Built on Context + `useReducer` with refs shadowing state, deliberately
 * mirroring `NutritionProvider` rather than abstracting a shared
 * `TrackerProvider<T>`. The two providers look alike because the *pattern* is
 * right, not because the domains are the same — Water has a goal and a unit
 * preference, nutrition has targets, custom foods, and favorites. A generic
 * built to satisfy both would hide what each one actually does.
 *
 *   WaterEntry[]  →  WaterState  →  derived totals  →  Water screen + Fuel
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from 'react';
import { todayLogDate, type LogDate } from '../../daily/dates';
import { useDayRollover } from '../../daily/useDayRollover';
import { asyncStorageWaterRepository } from '../data/asyncStorageRepository';
import type { WaterRepository } from '../data/WaterRepository';
import { totalMl } from '../model/totals';
import {
  DEFAULT_WATER_PREFERENCES,
  type VolumeUnit,
  type WaterEntry,
  type WaterGoal,
  type WaterPreferences,
} from '../model/types';
import { WEEK_DAYS, type StoredDayTotal } from '../model/week';

type Status = 'loading' | 'ready';

type WaterState = {
  status: Status;
  logDate: LogDate;
  entries: WaterEntry[];
  /** `null` until the user sets one. Never defaulted to a made-up amount. */
  goal: WaterGoal | null;
  preferences: WaterPreferences;
  /**
   * Daily totals for the days *before* `logDate`, for the recent-days strip.
   *
   * Excludes the current day on purpose: today's total is derived live from
   * `entries`, so a logged drink shows up immediately instead of waiting for
   * a storage re-read. Loaded once per day change rather than after every
   * write, because past days cannot change while the user is looking at today.
   */
  history: StoredDayTotal[];
  /** Set when persistence failed, so the UI can say so instead of showing a silently empty day. */
  error: string | null;
};

type Action =
  | { type: 'loadStarted'; logDate: LogDate }
  | {
      type: 'loadFinished';
      logDate: LogDate;
      entries: WaterEntry[];
      goal: WaterGoal | null;
      preferences: WaterPreferences;
      history: StoredDayTotal[];
    }
  | { type: 'loadFailed'; message: string }
  | { type: 'setEntries'; entries: WaterEntry[] }
  | { type: 'setGoal'; goal: WaterGoal }
  | { type: 'setPreferences'; preferences: WaterPreferences }
  | { type: 'setError'; message: string | null };

function reducer(state: WaterState, action: Action): WaterState {
  switch (action.type) {
    case 'loadStarted':
      // Entries are cleared alongside the date change so a stale day's
      // entries can never be written under the new day's key mid-flight.
      return { ...state, status: 'loading', logDate: action.logDate, entries: [], history: [], error: null };
    case 'loadFinished':
      return {
        status: 'ready',
        logDate: action.logDate,
        entries: action.entries,
        goal: action.goal,
        preferences: action.preferences,
        history: action.history,
        error: null,
      };
    case 'loadFailed':
      return { ...state, status: 'ready', error: action.message };
    case 'setEntries':
      return { ...state, entries: action.entries };
    case 'setGoal':
      return { ...state, goal: action.goal };
    case 'setPreferences':
      return { ...state, preferences: action.preferences };
    case 'setError':
      return { ...state, error: action.message };
  }
}

export type WaterContextValue = WaterState & {
  addEntry: (entry: WaterEntry) => Promise<void>;
  updateEntry: (id: string, changes: Partial<Omit<WaterEntry, 'id' | 'logDate'>>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  /** Re-inserts a removed entry in its original position — powers Undo. */
  restoreEntry: (entry: WaterEntry, index: number) => Promise<void>;
  setGoal: (goal: WaterGoal) => Promise<void>;
  setUnit: (unit: VolumeUnit) => Promise<void>;
  selectDate: (logDate: LogDate) => void;
};

const WaterContext = createContext<WaterContextValue | null>(null);

type Props = PropsWithChildren<{
  /** Injectable so a Supabase implementation — or a test double — drops in unchanged. */
  repository?: WaterRepository;
}>;

export function WaterProvider({ children, repository = asyncStorageWaterRepository }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'loading',
    logDate: todayLogDate(),
    entries: [],
    goal: null,
    preferences: DEFAULT_WATER_PREFERENCES,
    history: [],
    error: null,
  });

  /**
   * Refs shadow the reducer state so a mutation reads the true current array
   * even when two fire in the same tick — reducer state would not have
   * re-rendered yet, and the second write would silently drop the first.
   * Tapping a quick-add twice quickly is exactly that case.
   */
  const entriesRef = useRef<WaterEntry[]>([]);
  const preferencesRef = useRef<WaterPreferences>(DEFAULT_WATER_PREFERENCES);
  const logDateRef = useRef<LogDate>(state.logDate);
  /** False once the user has deliberately navigated to a day other than today. */
  const followToday = useRef(true);

  const load = useCallback(
    async (logDate: LogDate) => {
      logDateRef.current = logDate;
      dispatch({ type: 'loadStarted', logDate });
      try {
        const [entries, goal, preferences, recentDays] = await Promise.all([
          repository.getEntries(logDate),
          repository.getGoal(),
          repository.getPreferences(),
          // One extra day, because the window ending today includes today —
          // which is dropped below in favour of the live entry array.
          repository.getRecentDays(WEEK_DAYS + 1),
        ]);
        // A slower load for a date the user has already navigated away from
        // must not overwrite the newer one.
        if (logDateRef.current !== logDate) return;
        const resolved = preferences ?? DEFAULT_WATER_PREFERENCES;
        const history = recentDays
          .filter((day) => day.logDate !== logDate)
          .map((day) => ({ logDate: day.logDate, totalMl: totalMl(day.entries) }));
        entriesRef.current = entries;
        preferencesRef.current = resolved;
        dispatch({ type: 'loadFinished', logDate, entries, goal, preferences: resolved, history });
      } catch {
        if (logDateRef.current !== logDate) return;
        entriesRef.current = [];
        dispatch({ type: 'loadFailed', message: "We couldn't load your water log." });
      }
    },
    [repository],
  );

  useEffect(() => {
    void load(todayLogDate());
  }, [load]);

  const readLogDate = useCallback(() => logDateRef.current, []);
  const readFollowToday = useCallback(() => followToday.current, []);
  const handleRollover = useCallback((today: LogDate) => void load(today), [load]);

  /** Yesterday's water must not still read as today's after midnight. */
  useDayRollover({
    getCurrentDate: readLogDate,
    getIsFollowingToday: readFollowToday,
    onRollover: handleRollover,
  });

  const commit = useCallback(
    async (next: WaterEntry[]) => {
      const logDate = logDateRef.current;
      entriesRef.current = next;
      dispatch({ type: 'setEntries', entries: next });
      try {
        await repository.saveEntries(logDate, next);
        dispatch({ type: 'setError', message: null });
      } catch {
        // State keeps the optimistic value — reverting would throw away what
        // the user just did. The message is what tells them it isn't saved,
        // rather than letting them find out after a restart.
        dispatch({ type: 'setError', message: "We couldn't save that. Your water log may not persist." });
      }
    },
    [repository],
  );

  const addEntry = useCallback((entry: WaterEntry) => commit([...entriesRef.current, entry]), [commit]);

  const updateEntry = useCallback(
    (id: string, changes: Partial<Omit<WaterEntry, 'id' | 'logDate'>>) =>
      commit(entriesRef.current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry))),
    [commit],
  );

  const removeEntry = useCallback(
    (id: string) => commit(entriesRef.current.filter((entry) => entry.id !== id)),
    [commit],
  );

  const restoreEntry = useCallback(
    (entry: WaterEntry, index: number) => {
      const next = [...entriesRef.current];
      next.splice(Math.min(Math.max(index, 0), next.length), 0, entry);
      return commit(next);
    },
    [commit],
  );

  const setGoal = useCallback(
    async (goal: WaterGoal) => {
      dispatch({ type: 'setGoal', goal });
      try {
        await repository.saveGoal(goal);
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save your water goal." });
      }
    },
    [repository],
  );

  const setUnit = useCallback(
    async (unit: VolumeUnit) => {
      // Only the display preference changes. Every stored entry keeps the
      // amount and unit it was logged with, so switching to millilitres
      // never rewrites a drink the user recorded in ounces.
      const next: WaterPreferences = { ...preferencesRef.current, unit };
      preferencesRef.current = next;
      dispatch({ type: 'setPreferences', preferences: next });
      try {
        await repository.savePreferences(next);
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save your unit preference." });
      }
    },
    [repository],
  );

  const selectDate = useCallback(
    (logDate: LogDate) => {
      followToday.current = logDate === todayLogDate();
      void load(logDate);
    },
    [load],
  );

  const value = useMemo<WaterContextValue>(
    () => ({ ...state, addEntry, updateEntry, removeEntry, restoreEntry, setGoal, setUnit, selectDate }),
    [state, addEntry, updateEntry, removeEntry, restoreEntry, setGoal, setUnit, selectDate],
  );

  return <WaterContext.Provider value={value}>{children}</WaterContext.Provider>;
}

export function useWater(): WaterContextValue {
  const context = useContext(WaterContext);
  if (!context) {
    throw new Error('useWater must be used inside a WaterProvider (mounted in src/app/_layout.tsx).');
  }
  return context;
}
