/**
 * The single source of truth for nutrition state.
 *
 * Before this existed, Fuel and Home each rendered their own fixture — same
 * headline calories, contradictory meal breakdowns, neither summing to its
 * own total. Everything nutrition-related now flows from here:
 *
 *   FoodEntry[]  →  DailyNutritionState  →  totals  →  Fuel + Home
 *
 * Deliberately built on Context + useReducer rather than a state library.
 * It mirrors `ThemeProvider`, which is the pattern already established in
 * this codebase, and adds no dependency for a problem this size.
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
import { AppState, type AppStateStatus } from 'react-native';
import { asyncStorageFoodLogRepository } from '../data/asyncStorageRepository';
import type { FoodLogRepository } from '../data/FoodLogRepository';
import { todayLogDate, type LogDate } from '../model/dates';
import { DEFAULT_TARGETS, type FoodEntry, type NutritionTargets } from '../model/types';

type Status = 'loading' | 'ready';

type NutritionState = {
  status: Status;
  logDate: LogDate;
  entries: FoodEntry[];
  targets: NutritionTargets;
  /** Set when persistence failed, so the UI can say so instead of showing a silently empty day. */
  error: string | null;
};

type Action =
  | { type: 'loadStarted'; logDate: LogDate }
  | { type: 'loadFinished'; logDate: LogDate; entries: FoodEntry[]; targets: NutritionTargets }
  | { type: 'loadFailed'; message: string }
  | { type: 'setEntries'; entries: FoodEntry[] }
  | { type: 'setTargets'; targets: NutritionTargets }
  | { type: 'setError'; message: string | null };

function reducer(state: NutritionState, action: Action): NutritionState {
  switch (action.type) {
    case 'loadStarted':
      // Entries are cleared alongside the date change so a stale day's
      // entries can never be written under the new day's key mid-flight.
      return { ...state, status: 'loading', logDate: action.logDate, entries: [], error: null };
    case 'loadFinished':
      return {
        status: 'ready',
        logDate: action.logDate,
        entries: action.entries,
        targets: action.targets,
        error: null,
      };
    case 'loadFailed':
      return { ...state, status: 'ready', error: action.message };
    case 'setEntries':
      return { ...state, entries: action.entries };
    case 'setTargets':
      return { ...state, targets: action.targets };
    case 'setError':
      return { ...state, error: action.message };
  }
}

export type NutritionContextValue = NutritionState & {
  addEntry: (entry: FoodEntry) => Promise<void>;
  updateEntry: (id: string, changes: Partial<Omit<FoodEntry, 'id' | 'logDate'>>) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  /** Re-inserts a removed entry in its original position — powers Undo. */
  restoreEntry: (entry: FoodEntry, index: number) => Promise<void>;
  updateTargets: (targets: NutritionTargets) => Promise<void>;
  selectDate: (logDate: LogDate) => void;
};

const NutritionContext = createContext<NutritionContextValue | null>(null);

type Props = PropsWithChildren<{
  /** Injectable so a Supabase implementation — or a test double — drops in unchanged. */
  repository?: FoodLogRepository;
}>;

export function NutritionProvider({ children, repository = asyncStorageFoodLogRepository }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'loading',
    logDate: todayLogDate(),
    entries: [],
    targets: DEFAULT_TARGETS,
    error: null,
  });

  /**
   * Refs shadow the reducer state so a mutation reads the true current
   * array even when two fire in the same tick — reducer state wouldn't have
   * re-rendered yet, and the second write would silently drop the first.
   */
  const entriesRef = useRef<FoodEntry[]>([]);
  const logDateRef = useRef<LogDate>(state.logDate);
  /** False once the user has deliberately navigated to a day other than today. */
  const followToday = useRef(true);

  const load = useCallback(
    async (logDate: LogDate) => {
      logDateRef.current = logDate;
      dispatch({ type: 'loadStarted', logDate });
      try {
        const [entries, storedTargets] = await Promise.all([
          repository.getEntries(logDate),
          repository.getTargets(),
        ]);
        // A slower load for a date the user has already navigated away from
        // must not overwrite the newer one.
        if (logDateRef.current !== logDate) return;
        entriesRef.current = entries;
        dispatch({ type: 'loadFinished', logDate, entries, targets: storedTargets ?? DEFAULT_TARGETS });
      } catch {
        if (logDateRef.current !== logDate) return;
        entriesRef.current = [];
        dispatch({ type: 'loadFailed', message: "We couldn't load your food log." });
      }
    },
    [repository],
  );

  useEffect(() => {
    void load(todayLogDate());
  }, [load]);

  /**
   * Day rollover. Someone who logs breakfast, backgrounds the app, and
   * returns the next morning should not be shown yesterday's totals under
   * "Today". Only rolls when the user is actually following today.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status !== 'active' || !followToday.current) return;
      const today = todayLogDate();
      if (today !== logDateRef.current) void load(today);
    });
    return () => subscription.remove();
  }, [load]);

  const commit = useCallback(
    async (next: FoodEntry[]) => {
      const logDate = logDateRef.current;
      entriesRef.current = next;
      dispatch({ type: 'setEntries', entries: next });
      try {
        await repository.saveEntries(logDate, next);
        dispatch({ type: 'setError', message: null });
      } catch {
        // State keeps the optimistic value — reverting would throw away
        // what the user just did. The message is what tells them it isn't
        // saved yet, rather than letting them find out after a restart.
        dispatch({ type: 'setError', message: "We couldn't save that. Your log may not persist." });
      }
    },
    [repository],
  );

  const addEntry = useCallback(
    (entry: FoodEntry) => commit([...entriesRef.current, entry]),
    [commit],
  );

  const updateEntry = useCallback(
    (id: string, changes: Partial<Omit<FoodEntry, 'id' | 'logDate'>>) =>
      commit(entriesRef.current.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry))),
    [commit],
  );

  const removeEntry = useCallback(
    (id: string) => commit(entriesRef.current.filter((entry) => entry.id !== id)),
    [commit],
  );

  const restoreEntry = useCallback(
    (entry: FoodEntry, index: number) => {
      const next = [...entriesRef.current];
      next.splice(Math.min(Math.max(index, 0), next.length), 0, entry);
      return commit(next);
    },
    [commit],
  );

  const updateTargets = useCallback(
    async (targets: NutritionTargets) => {
      dispatch({ type: 'setTargets', targets });
      try {
        await repository.saveTargets(targets);
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save your goals." });
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

  const value = useMemo<NutritionContextValue>(
    () => ({ ...state, addEntry, updateEntry, removeEntry, restoreEntry, updateTargets, selectDate }),
    [state, addEntry, updateEntry, removeEntry, restoreEntry, updateTargets, selectDate],
  );

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
}

export function useNutrition(): NutritionContextValue {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used inside a NutritionProvider (mounted in src/app/_layout.tsx).');
  }
  return context;
}
