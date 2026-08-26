/**
 * The single source of truth for peptide definitions and setups.
 *
 * Context + `useReducer` with shadow refs, mirroring `NutritionProvider` and
 * `WaterProvider` rather than abstracting a shared `TrackerProvider<T>`. The
 * three look alike because the *pattern* is right; the domains are genuinely
 * different, and a generic built to satisfy all of them would hide what each
 * one does.
 *
 * Deliberately not here: dose calculation (3.6, a pure module screens call
 * directly) and injection sites (3.8).
 *
 * **Administrations joined in slice 3.7**, and they are day-keyed where
 * setups are not — a configuration does not belong to a calendar day the way
 * an injection does. Only a bounded window of recent days is held in memory;
 * a log grows forever and eagerly loading all of it would make every app
 * start slower for data almost nobody scrolls to. Older days are read on
 * demand by the history screen.
 *
 * That day-keying is also why this provider now has a rollover: today's
 * entries must become yesterday's while the app is open, without a restart.
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
import { todayLogDate, useDayRollover, type LogDate } from '../../daily';
import { newId } from '../../daily/ids';
import { PEPTIDE_CATALOG, findCatalogDefinition } from '../data/catalog';
import { asyncStoragePeptideRepository } from '../data/asyncStorageRepository';
import type { PeptideRepository } from '../data/PeptideRepository';
import { applyLogChanges, createLogEntry, sortLogsNewestFirst } from '../model/logs';
import { applySetupChanges, createPeptideSetup, type PeptideSetupChanges, type PeptideSetupDraft } from '../model/setups';
import type { PeptideDefinition, PeptideLogDraft, PeptideLogEntry, PeptideSetup } from '../model/types';

/**
 * How much history the provider keeps warm.
 *
 * Enough for a setup's "Recent Logs" and a first screen of history without a
 * read; the full history screen asks the repository for more. Bounded by days
 * rather than entries because the store enumerates day keys.
 */
const RECENT_DAYS = 60;

type Status = 'loading' | 'ready';

type PeptideState = {
  status: Status;
  setups: PeptideSetup[];
  /** Definitions the user created. The catalog is compiled, not stored. */
  customDefinitions: PeptideDefinition[];
  /** A bounded window of recent administrations, newest first. */
  logs: PeptideLogEntry[];
  /** The local calendar day, refreshed on rollover so "today" stays honest. */
  today: LogDate;
  /** Set when persistence failed, so the UI can say so rather than look empty. */
  error: string | null;
};

type Action =
  | {
      type: 'loadFinished';
      setups: PeptideSetup[];
      customDefinitions: PeptideDefinition[];
      logs: PeptideLogEntry[];
    }
  | { type: 'loadFailed'; message: string }
  | { type: 'setSetups'; setups: PeptideSetup[] }
  | { type: 'setCustomDefinitions'; customDefinitions: PeptideDefinition[] }
  | { type: 'setLogs'; logs: PeptideLogEntry[] }
  | { type: 'setToday'; today: LogDate }
  | { type: 'setError'; message: string | null };

function reducer(state: PeptideState, action: Action): PeptideState {
  switch (action.type) {
    case 'loadFinished':
      return {
        ...state,
        status: 'ready',
        setups: action.setups,
        customDefinitions: action.customDefinitions,
        logs: action.logs,
        error: null,
      };
    case 'loadFailed':
      return { ...state, status: 'ready', error: action.message };
    case 'setSetups':
      return { ...state, setups: action.setups };
    case 'setCustomDefinitions':
      return { ...state, customDefinitions: action.customDefinitions };
    case 'setLogs':
      return { ...state, logs: action.logs };
    case 'setToday':
      return { ...state, today: action.today };
    case 'setError':
      return { ...state, error: action.message };
  }
}

export type PeptideContextValue = PeptideState & {
  /** The compiled catalog, exposed so screens never import the data module directly. */
  catalog: readonly PeptideDefinition[];
  /** Resolves a setup's `definitionId` across the catalog and custom definitions. */
  findDefinition: (definitionId: string) => PeptideDefinition | undefined;
  /** Creates and persists a custom definition, returning it so a setup can follow. */
  createCustomDefinition: (name: string, category?: string) => Promise<PeptideDefinition>;
  /** Creates a setup for a definition. Returns it so callers can navigate to it. */
  addSetup: (definitionId: string, draft?: PeptideSetupDraft) => Promise<PeptideSetup>;
  updateSetup: (id: string, changes: PeptideSetupChanges) => Promise<void>;
  setSetupActive: (id: string, active: boolean) => Promise<void>;

  /**
   * ── Administrations ──────────────────────────────────────────────────
   *
   * The snapshot is taken here, from the setup as it stands now. Every read
   * below returns stored entries untouched — no history is ever recomputed
   * from a setup that may have changed since.
   */
  addLog: (setupId: string, draft: PeptideLogDraft) => Promise<PeptideLogEntry | null>;
  updateLog: (entryId: string, draft: PeptideLogDraft) => Promise<void>;
  deleteLog: (entryId: string) => Promise<void>;
  /** Re-inserts a deleted entry exactly as it was, for Undo. */
  restoreLog: (entry: PeptideLogEntry) => Promise<void>;
  /** Everything recorded for one setup, newest first, within the loaded window. */
  logsForSetup: (setupId: string) => PeptideLogEntry[];
  /** Everything recorded on one day, newest first. */
  logsForDate: (logDate: LogDate) => PeptideLogEntry[];
  findLog: (entryId: string) => PeptideLogEntry | undefined;
};

const PeptideContext = createContext<PeptideContextValue | null>(null);

type Props = PropsWithChildren<{
  /** Injectable so a Supabase implementation — or a test double — drops in unchanged. */
  repository?: PeptideRepository;
}>;

export function PeptideProvider({ children, repository = asyncStoragePeptideRepository }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'loading',
    setups: [],
    customDefinitions: [],
    logs: [],
    today: todayLogDate(),
    error: null,
  });

  /**
   * Refs shadow the reducer state so a mutation reads the true current array
   * even when two fire in the same tick — reducer state would not have
   * re-rendered yet, and the second write would silently drop the first.
   */
  const setupsRef = useRef<PeptideSetup[]>([]);
  const definitionsRef = useRef<PeptideDefinition[]>([]);
  const logsRef = useRef<PeptideLogEntry[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [setups, customDefinitions, logs] = await Promise.all([
          repository.getSetups(),
          repository.getCustomDefinitions(),
          repository.getRecentLogs(RECENT_DAYS),
        ]);
        if (!active) return;
        const ordered = sortLogsNewestFirst(logs);
        setupsRef.current = setups;
        definitionsRef.current = customDefinitions;
        logsRef.current = ordered;
        dispatch({ type: 'loadFinished', setups, customDefinitions, logs: ordered });
      } catch {
        if (!active) return;
        dispatch({ type: 'loadFailed', message: "We couldn't load your peptides." });
      }
    })();

    return () => {
      active = false;
    };
  }, [repository]);

  const commitSetups = useCallback(
    async (next: PeptideSetup[]) => {
      setupsRef.current = next;
      dispatch({ type: 'setSetups', setups: next });
      try {
        await repository.saveSetups(next);
        dispatch({ type: 'setError', message: null });
      } catch {
        // State keeps the optimistic value — reverting would discard what the
        // user just did. The message is what tells them it isn't saved.
        dispatch({ type: 'setError', message: "We couldn't save that. Your changes may not persist." });
      }
    },
    [repository],
  );

  const findDefinition = useCallback(
    (definitionId: string) =>
      findCatalogDefinition(definitionId) ??
      definitionsRef.current.find((definition) => definition.id === definitionId),
    [],
  );

  const createCustomDefinition = useCallback(
    async (name: string, category?: string) => {
      const definition: PeptideDefinition = {
        id: newId('custom'),
        name: name.trim(),
        classification: 'custom',
        origin: 'user',
        ...(category?.trim() ? { category: category.trim() } : {}),
      };

      const next = [...definitionsRef.current, definition];
      definitionsRef.current = next;
      dispatch({ type: 'setCustomDefinitions', customDefinitions: next });

      try {
        await repository.saveCustomDefinitions(next);
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save that peptide. It may not persist." });
      }
      return definition;
    },
    [repository],
  );

  const addSetup = useCallback(
    async (definitionId: string, draft: PeptideSetupDraft = {}) => {
      const setup = createPeptideSetup(definitionId, draft);
      await commitSetups([...setupsRef.current, setup]);
      return setup;
    },
    [commitSetups],
  );

  const updateSetup = useCallback(
    (id: string, changes: PeptideSetupChanges) =>
      commitSetups(
        setupsRef.current.map((setup) => (setup.id === id ? applySetupChanges(setup, changes) : setup)),
      ),
    [commitSetups],
  );

  /**
   * Deactivation is a state change, never a deletion. The setup keeps every
   * field, and once logging exists its history stays intact and independent
   * of whether the setup is currently active.
   */
  const setSetupActive = useCallback(
    (id: string, active: boolean) => updateSetup(id, { active }),
    [updateSetup],
  );

  /**
   * Writes one day back to disk and refreshes the in-memory window.
   *
   * The day is the unit of persistence, so a mutation reads the day out of
   * the loaded window, applies itself, and writes the whole day. Reading from
   * `logsRef` rather than reducer state is what makes two mutations in the
   * same tick safe — state has not re-rendered yet, and the second write
   * would otherwise drop the first.
   */
  const commitDay = useCallback(
    async (logDate: LogDate, nextForDay: PeptideLogEntry[]) => {
      const others = logsRef.current.filter((entry) => entry.logDate !== logDate);
      const next = sortLogsNewestFirst([...others, ...nextForDay]);
      logsRef.current = next;
      dispatch({ type: 'setLogs', logs: next });

      try {
        await repository.saveLogs(logDate, nextForDay);
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save that peptide log." });
      }
    },
    [repository],
  );

  /**
   * The day may not be in the loaded window — someone can edit an entry from
   * further back than `RECENT_DAYS`. Reading it fresh keeps the write whole
   * rather than truncating a day to the part that happened to be in memory.
   */
  const dayEntries = useCallback(
    async (logDate: LogDate): Promise<PeptideLogEntry[]> => {
      const loaded = logsRef.current.filter((entry) => entry.logDate === logDate);
      if (loaded.length > 0) return loaded;
      try {
        return await repository.getLogs(logDate);
      } catch {
        return [];
      }
    },
    [repository],
  );

  const addLog = useCallback(
    async (setupId: string, draft: PeptideLogDraft): Promise<PeptideLogEntry | null> => {
      const setup = setupsRef.current.find((candidate) => candidate.id === setupId);
      if (!setup) return null;

      // The snapshot is taken here, once, from the setup as it stands now.
      const entry = createLogEntry(setup, draft);
      const day = await dayEntries(entry.logDate);
      await commitDay(entry.logDate, [...day, entry]);
      return entry;
    },
    [commitDay, dayEntries],
  );

  const updateLog = useCallback(
    async (entryId: string, draft: PeptideLogDraft) => {
      const existing = logsRef.current.find((entry) => entry.id === entryId);
      if (!existing) return;

      const updated = applyLogChanges(existing, draft);
      const fromDay = (await dayEntries(existing.logDate)).filter((entry) => entry.id !== entryId);
      await commitDay(existing.logDate, fromDay);

      // Editing the time can move an entry to another day, so the destination
      // is written separately rather than assumed to be the same key.
      const toDay = (await dayEntries(updated.logDate)).filter((entry) => entry.id !== entryId);
      await commitDay(updated.logDate, [...toDay, updated]);
    },
    [commitDay, dayEntries],
  );

  const deleteLog = useCallback(
    async (entryId: string) => {
      const existing = logsRef.current.find((entry) => entry.id === entryId);
      if (!existing) return;
      const day = (await dayEntries(existing.logDate)).filter((entry) => entry.id !== entryId);
      await commitDay(existing.logDate, day);
    },
    [commitDay, dayEntries],
  );

  /** Puts a deleted entry back exactly as it was — no new id, no new dates. */
  const restoreLog = useCallback(
    async (entry: PeptideLogEntry) => {
      const day = (await dayEntries(entry.logDate)).filter((candidate) => candidate.id !== entry.id);
      await commitDay(entry.logDate, [...day, entry]);
    },
    [commitDay, dayEntries],
  );

  const logsForSetup = useCallback(
    (setupId: string) => state.logs.filter((entry) => entry.setupId === setupId),
    [state.logs],
  );

  const logsForDate = useCallback(
    (logDate: LogDate) => state.logs.filter((entry) => entry.logDate === logDate),
    [state.logs],
  );

  const findLog = useCallback(
    (entryId: string) => state.logs.find((entry) => entry.id === entryId),
    [state.logs],
  );

  /**
   * Today has to change while the app is open. Without this, an entry logged
   * at 00:05 would land on a date the UI still believes is tomorrow.
   */
  const todayRef = useRef(state.today);
  todayRef.current = state.today;
  useDayRollover({
    getCurrentDate: useCallback(() => todayRef.current, []),
    // Peptides has no "browse another day" mode, so it always follows today.
    getIsFollowingToday: useCallback(() => true, []),
    onRollover: useCallback((today: LogDate) => dispatch({ type: 'setToday', today }), []),
  });

  const value = useMemo<PeptideContextValue>(
    () => ({
      ...state,
      catalog: PEPTIDE_CATALOG,
      findDefinition,
      createCustomDefinition,
      addSetup,
      updateSetup,
      setSetupActive,
      addLog,
      updateLog,
      deleteLog,
      restoreLog,
      logsForSetup,
      logsForDate,
      findLog,
    }),
    [
      state,
      findDefinition,
      createCustomDefinition,
      addSetup,
      updateSetup,
      setSetupActive,
      addLog,
      updateLog,
      deleteLog,
      restoreLog,
      logsForSetup,
      logsForDate,
      findLog,
    ],
  );

  return <PeptideContext.Provider value={value}>{children}</PeptideContext.Provider>;
}

export function usePeptideContext(): PeptideContextValue {
  const context = useContext(PeptideContext);
  if (!context) {
    throw new Error('usePeptideContext must be used inside a PeptideProvider (mounted in src/app/_layout.tsx).');
  }
  return context;
}
