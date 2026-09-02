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
import {
  createRoutineStatus,
  statusFor,
  statusesForSetup,
  type PeptideRoutineState,
  type RoutineDayStatus,
} from '../model/routine';
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
  /** What the user answered about planned days, within the loaded window. */
  routineStatuses: RoutineDayStatus[];
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
      routineStatuses: RoutineDayStatus[];
    }
  | { type: 'loadFailed'; message: string }
  | { type: 'setSetups'; setups: PeptideSetup[] }
  | { type: 'setCustomDefinitions'; customDefinitions: PeptideDefinition[] }
  | { type: 'setLogs'; logs: PeptideLogEntry[] }
  | { type: 'setRoutineStatuses'; routineStatuses: RoutineDayStatus[] }
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
        routineStatuses: action.routineStatuses,
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
    case 'setRoutineStatuses':
      return { ...state, routineStatuses: action.routineStatuses };
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
   * ── Routines (slice 3.9) ─────────────────────────────────────────────
   *
   * Adding, configuring, pausing and removing are separate acts, because
   * they are separate decisions. The old flow ran them together and made
   * "I'm interested in this" cost a full configuration form.
   */
  /** Creates a `needs-setup` shell, or returns the routine that already exists. */
  addToRoutine: (definitionId: string) => Promise<PeptideSetup>;
  /** Saves configuration and makes the routine active in one step. */
  completeSetup: (id: string, changes: PeptideSetupChanges) => Promise<void>;
  setRoutineState: (id: string, state: PeptideRoutineState) => Promise<void>;
  /** Drops the routine. Logs, sites and day statuses are all left alone. */
  removeRoutine: (id: string) => Promise<void>;

  /**
   * ── Routine days ─────────────────────────────────────────────────────
   *
   * A day the user answered has a record; a day they did not has nothing.
   * There is deliberately no way to write "unconfirmed".
   */
  /** Records an administration *and* the status linked to it, in that order. */
  markTaken: (setupId: string, draft: PeptideLogDraft) => Promise<PeptideLogEntry | null>;
  /** Records a deliberate skip. Never creates an administration. */
  markSkipped: (setupId: string, logDate: LogDate) => Promise<void>;
  /** Clears a day's answer, returning what was removed so Undo can replace it. */
  clearRoutineDay: (
    setupId: string,
    logDate: LogDate,
  ) => Promise<{ status: RoutineDayStatus; log?: PeptideLogEntry } | null>;
  restoreRoutineDay: (status: RoutineDayStatus, log?: PeptideLogEntry) => Promise<void>;
  routineStatusFor: (setupId: string, logDate: LogDate) => RoutineDayStatus | undefined;
  routineStatusesForSetup: (setupId: string) => RoutineDayStatus[];

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
    routineStatuses: [],
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
  const statusesRef = useRef<RoutineDayStatus[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [setups, customDefinitions, logs, routineStatuses] = await Promise.all([
          repository.getSetups(),
          repository.getCustomDefinitions(),
          repository.getRecentLogs(RECENT_DAYS),
          repository.getRecentRoutineStatuses(RECENT_DAYS),
        ]);
        if (!active) return;
        const ordered = sortLogsNewestFirst(logs);
        setupsRef.current = setups;
        definitionsRef.current = customDefinitions;
        logsRef.current = ordered;
        statusesRef.current = routineStatuses;
        dispatch({
          type: 'loadFinished',
          setups,
          customDefinitions,
          logs: ordered,
          routineStatuses,
        });
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
    (id: string, active: boolean) => updateSetup(id, { routineState: active ? 'active' : 'inactive' }),
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
    async (logDate: LogDate, nextForDay: PeptideLogEntry[]): Promise<boolean> => {
      const others = logsRef.current.filter((entry) => entry.logDate !== logDate);
      const next = sortLogsNewestFirst([...others, ...nextForDay]);
      logsRef.current = next;
      dispatch({ type: 'setLogs', logs: next });

      try {
        await repository.saveLogs(logDate, nextForDay);
        return true;
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save that peptide log." });
        return false;
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

  /* ── routines ──────────────────────────────────────────────────────── */

  /**
   * Adding a peptide is not configuring one.
   *
   * Creates a shell in `needs-setup` and stops. The old flow dropped the user
   * straight into a long form at the moment they had only decided they were
   * interested, which is why the founder described the whole path as
   * friction. Configuring is a separate act, done when they are ready.
   *
   * **One current routine per definition.** Tapping *Add to Routine* twice —
   * or coming back to the page later — returns whatever routine already
   * exists rather than creating a second one, in any state. Removed routines
   * are gone from the store and so do not count as current, which is what
   * makes re-adding work.
   */
  const addToRoutine = useCallback(
    async (definitionId: string) => {
      const existing = setupsRef.current.find((setup) => setup.definitionId === definitionId);
      if (existing) return existing;

      const setup = createPeptideSetup(definitionId, {}, new Date(), 'needs-setup');
      await commitSetups([...setupsRef.current, setup]);
      return setup;
    },
    [commitSetups],
  );

  /** Saving Setup is what makes a routine active — there is no separate switch. */
  const completeSetup = useCallback(
    (id: string, changes: PeptideSetupChanges) =>
      updateSetup(id, { ...changes, routineState: 'active' }),
    [updateSetup],
  );

  const setRoutineState = useCallback(
    (id: string, routineState: PeptideRoutineState) => updateSetup(id, { routineState }),
    [updateSetup],
  );

  /**
   * Removing a routine removes the routine, and nothing else.
   *
   * Logs are day-keyed and independent, statuses likewise; neither is touched
   * here. That is the entire point — someone stopping a peptide still took
   * it, and a health app that erases what happened because you stopped
   * tracking it is destroying the record it exists to keep. Names still
   * resolve afterwards because a log carries its own `definitionId`.
   */
  const removeRoutine = useCallback(
    (id: string) => commitSetups(setupsRef.current.filter((setup) => setup.id !== id)),
    [commitSetups],
  );

  /* ── routine day statuses ──────────────────────────────────────────── */

  const commitStatusDay = useCallback(
    async (logDate: LogDate, nextForDay: RoutineDayStatus[]): Promise<boolean> => {
      const others = statusesRef.current.filter((status) => status.logDate !== logDate);
      const next = [...others, ...nextForDay];
      statusesRef.current = next;
      dispatch({ type: 'setRoutineStatuses', routineStatuses: next });

      try {
        await repository.saveRoutineStatuses(logDate, nextForDay);
        return true;
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save that. Your change may not persist." });
        return false;
      }
    },
    [repository],
  );

  const statusDay = useCallback(
    async (logDate: LogDate): Promise<RoutineDayStatus[]> => {
      const loaded = statusesRef.current.filter((status) => status.logDate === logDate);
      if (loaded.length > 0) return loaded;
      try {
        return await repository.getRoutineStatuses(logDate);
      } catch {
        return [];
      }
    },
    [repository],
  );

  /**
   * Recording that a scheduled administration happened.
   *
   * **The log is written first, and the status only if that succeeded.** A
   * status saying *taken* with no administration behind it is the one
   * genuinely corrupt state this feature can reach: it would show a
   * confirmed dose in the calendar that appears nowhere in history. If the
   * log cannot be persisted the optimistic entry is rolled back out of
   * memory and no status is written, so the day stays unanswered — which is
   * true, and recoverable.
   *
   * `linkedLogId` is what makes the pairing reversible later.
   */
  const markTaken = useCallback(
    async (setupId: string, draft: PeptideLogDraft): Promise<PeptideLogEntry | null> => {
      const setup = setupsRef.current.find((candidate) => candidate.id === setupId);
      if (!setup) return null;

      const entry = createLogEntry(setup, draft);
      const day = await dayEntries(entry.logDate);
      const logSaved = await commitDay(entry.logDate, [...day, entry]);

      if (!logSaved) {
        // Undo the optimistic insert rather than leave a log the store never
        // accepted, and write no status at all.
        const rolledBack = logsRef.current.filter((candidate) => candidate.id !== entry.id);
        logsRef.current = rolledBack;
        dispatch({ type: 'setLogs', logs: rolledBack });
        return null;
      }

      const status = createRoutineStatus(setupId, entry.logDate, 'taken', {
        linkedLogId: entry.id,
      });
      const existing = (await statusDay(entry.logDate)).filter(
        (candidate) => candidate.setupId !== setupId,
      );
      await commitStatusDay(entry.logDate, [...existing, status]);
      return entry;
    },
    [commitDay, commitStatusDay, dayEntries, statusDay],
  );

  /**
   * Recording that a scheduled day was deliberately skipped.
   *
   * **Never writes an administration.** Skipping is the user saying a dose
   * did not happen; manufacturing a log for it would be the exact inversion
   * of the truth. No reason is asked for either — VITA has no business
   * interrogating someone about their own body.
   */
  const markSkipped = useCallback(
    async (setupId: string, logDate: LogDate) => {
      const status = createRoutineStatus(setupId, logDate, 'skipped');
      const existing = (await statusDay(logDate)).filter(
        (candidate) => candidate.setupId !== setupId,
      );
      await commitStatusDay(logDate, [...existing, status]);
    },
    [commitStatusDay, statusDay],
  );

  /**
   * Undoing a day's answer, returning what was removed so it can be put back.
   *
   * **Only a log this flow created is removed with it.** The link is followed
   * by id, so a manual entry — which no status points at — is never swept up
   * by changing a routine status. Someone who logged three administrations by
   * hand and then untaps *Taken* keeps all three.
   */
  const clearRoutineDay = useCallback(
    async (
      setupId: string,
      logDate: LogDate,
    ): Promise<{ status: RoutineDayStatus; log?: PeptideLogEntry } | null> => {
      const existing = (await statusDay(logDate)).find(
        (candidate) => candidate.setupId === setupId,
      );
      if (!existing) return null;

      const remaining = (await statusDay(logDate)).filter(
        (candidate) => candidate.setupId !== setupId,
      );
      await commitStatusDay(logDate, remaining);

      if (!existing.linkedLogId) return { status: existing };

      const linked = logsRef.current.find((entry) => entry.id === existing.linkedLogId);
      if (!linked) return { status: existing };

      const day = (await dayEntries(linked.logDate)).filter((entry) => entry.id !== linked.id);
      await commitDay(linked.logDate, day);
      return { status: existing, log: linked };
    },
    [commitDay, commitStatusDay, dayEntries, statusDay],
  );

  /** Puts a cleared day back exactly as it was, log included, for Undo. */
  const restoreRoutineDay = useCallback(
    async (status: RoutineDayStatus, log?: PeptideLogEntry) => {
      if (log) {
        const day = (await dayEntries(log.logDate)).filter((entry) => entry.id !== log.id);
        await commitDay(log.logDate, [...day, log]);
      }
      const existing = (await statusDay(status.logDate)).filter(
        (candidate) => candidate.setupId !== status.setupId,
      );
      await commitStatusDay(status.logDate, [...existing, status]);
    },
    [commitDay, commitStatusDay, dayEntries, statusDay],
  );

  const routineStatusFor = useCallback(
    (setupId: string, logDate: LogDate) => statusFor(state.routineStatuses, setupId, logDate),
    [state.routineStatuses],
  );

  const routineStatusesForSetup = useCallback(
    (setupId: string) => statusesForSetup(state.routineStatuses, setupId),
    [state.routineStatuses],
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
      addToRoutine,
      completeSetup,
      setRoutineState,
      removeRoutine,
      markTaken,
      markSkipped,
      clearRoutineDay,
      restoreRoutineDay,
      routineStatusFor,
      routineStatusesForSetup,
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
