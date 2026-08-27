/**
 * The read side of the peptide domain — what screens consume.
 *
 * Everything is derived per render from the setup array. Nothing is cached, so
 * there is no second copy of a list that can drift from the records it came
 * from.
 */

import { useMemo } from 'react';
import type { LogDate } from '../../daily';
import {
  routineDayMark,
  statusFor,
  type PeptideRoutineState,
  type RoutineDayMark,
  type RoutineDayStatus,
} from '../model/routine';
import { isScheduledOn, scheduleLabel } from '../model/schedule';
import type { PeptideDefinition, PeptideSetup } from '../model/types';
import { usePeptideContext } from './PeptideProvider';

/** A setup paired with the definition it points at, resolved once. */
export type ResolvedSetup = {
  setup: PeptideSetup;
  definition: PeptideDefinition;
  /**
   * The definition's own name — catalog or custom.
   *
   * **`displayName` is deliberately not consulted** (slice 3.9). The field is
   * gone from Setup: a second place to name a thing that already has a name
   * only creates two answers to "what is this?". Stored values survive on
   * disk untouched; they simply stop deciding what anything is called.
   */
  name: string;
  /** "Daily" · "Mon, Wed, Fri" · "Every 3 days" · "As needed", or `null`. */
  scheduleLabel: string | null;
  routineState: PeptideRoutineState;
};

/** A routine that the user's own schedule covers today, with their answer. */
export type TodayRoutine = ResolvedSetup & {
  status?: RoutineDayStatus;
  /** `taken`, `skipped`, or `unconfirmed` — never a judgement. */
  mark: RoutineDayMark;
};

export type PeptidesView = {
  isLoading: boolean;
  error: string | null;
  /**
   * Active routines their own schedule covers today.
   *
   * `asNeeded` routines are absent by construction: `isScheduledOn` returns
   * false for them, so nothing here invents a planned event the user never
   * asked for. They are reachable from the Active list like any other.
   */
  today: TodayRoutine[];
  /** Added but not yet configured. Not the same as paused — see `routine.ts`. */
  needsSetup: ResolvedSetup[];
  active: ResolvedSetup[];
  inactive: ResolvedSetup[];
  /** No routines at all — drives the empty state. */
  isEmpty: boolean;
  /**
   * Setups whose definition could not be resolved.
   *
   * Kept out of the lists rather than rendered as a blank row, and **not**
   * deleted: the record stays in storage untouched, so a definition that
   * reappears (a restored custom entry, a catalog id returning) brings its
   * setup back with it. Silently re-pointing it at some other compound would
   * be the one genuinely destructive option.
   */
  orphanedCount: number;
};

function resolveOne(
  setup: PeptideSetup,
  definition: PeptideDefinition,
): ResolvedSetup {
  return {
    setup,
    definition,
    name: definition.name,
    scheduleLabel: scheduleLabel(setup.schedule),
    routineState: setup.routineState,
  };
}

function resolve(
  setups: readonly PeptideSetup[],
  findDefinition: (id: string) => PeptideDefinition | undefined,
): { resolved: ResolvedSetup[]; orphanedCount: number } {
  const resolved: ResolvedSetup[] = [];
  let orphanedCount = 0;

  for (const setup of setups) {
    const definition = findDefinition(setup.definitionId);
    if (!definition) {
      orphanedCount += 1;
      continue;
    }
    resolved.push(resolveOne(setup, definition));
  }

  return { resolved, orphanedCount };
}

export function usePeptides(): PeptidesView {
  const { status, setups, customDefinitions, error, findDefinition, routineStatuses, today } =
    usePeptideContext();

  return useMemo(() => {
    const { resolved, orphanedCount } = resolve(setups, findDefinition);
    // Alphabetical within each list — neutral, and stable as routines are added.
    const byName = (a: ResolvedSetup, b: ResolvedSetup) => a.name.localeCompare(b.name);

    const active = resolved.filter((item) => item.routineState === 'active').sort(byName);

    return {
      isLoading: status === 'loading',
      error,
      today: active
        .filter((item) => isScheduledOn(item.setup.schedule, today, item.setup.startDate))
        .map((item) => {
          const dayStatus = statusFor(routineStatuses, item.setup.id, today);
          return {
            ...item,
            status: dayStatus,
            mark: routineDayMark({
              schedule: item.setup.schedule,
              startDate: item.setup.startDate,
              logDate: today,
              status: dayStatus,
            }),
          };
        }),
      needsSetup: resolved.filter((item) => item.routineState === 'needs-setup').sort(byName),
      active,
      inactive: resolved.filter((item) => item.routineState === 'inactive').sort(byName),
      isEmpty: setups.length === 0,
      orphanedCount,
    };
    // `customDefinitions` participates because `findDefinition` reads it
    // through a ref, so the identity of that callback never changes.
  }, [status, setups, customDefinitions, error, findDefinition, routineStatuses, today]);
}

/** One setup by id, resolved. `null` while loading or if it no longer exists. */
export function useResolvedSetup(setupId: string): ResolvedSetup | null {
  const { setups, customDefinitions, findDefinition } = usePeptideContext();

  return useMemo(() => {
    const setup = setups.find((candidate) => candidate.id === setupId);
    if (!setup) return null;
    const definition = findDefinition(setup.definitionId);
    if (!definition) return null;
    return resolveOne(setup, definition);
  }, [setupId, setups, customDefinitions, findDefinition]);
}

/**
 * The routine a definition already has, if any.
 *
 * Drives the state-aware catalog CTA and the duplicate guard. Looks across
 * *every* state — a paused routine is still a routine, and offering "Add to
 * Routine" for one would quietly create a second.
 */
export function useRoutineForDefinition(definitionId: string): ResolvedSetup | null {
  const { setups, customDefinitions, findDefinition } = usePeptideContext();

  return useMemo(() => {
    const setup = setups.find((candidate) => candidate.definitionId === definitionId);
    if (!setup) return null;
    const definition = findDefinition(setup.definitionId);
    if (!definition) return null;
    return resolveOne(setup, definition);
  }, [definitionId, setups, customDefinitions, findDefinition]);
}

/**
 * One calendar week for a routine, Monday to Sunday.
 *
 * **A real week, not a rolling window** (slice 3.9B). The previous version
 * showed the last seven days ending today, which produced orders like
 * *Friday → Saturday → Sunday → Monday* — chronologically correct and
 * unreadable as a calendar, because no week starts on Friday. The founder
 * rejected it on sight. Monday-first is the fixed order now, and the offset
 * chooses which week.
 *
 * Days the schedule does not cover are included and marked `not-scheduled`,
 * so the row reads as a week rather than as a gapped list.
 */
export function useRoutineWeek(
  setup: PeptideSetup | undefined,
  weekOffset = 0,
): Array<{ logDate: LogDate; mark: RoutineDayMark }> {
  const { routineStatuses, today } = usePeptideContext();

  return useMemo(() => {
    if (!setup) return [];
    const [year, month, day] = today.split('-').map(Number);

    /**
     * Local-calendar arithmetic only — never `new Date('YYYY-MM-DD')`, which
     * parses as UTC and shifts the whole week for anyone west of London.
     */
    const anchor = new Date(year, month - 1, day + weekOffset * 7);
    // getDay() is Sunday-first; this converts to a Monday-first index so
    // subtracting it lands on Monday rather than on the previous Sunday.
    const mondayIndex = (anchor.getDay() + 6) % 7;
    const monday = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate() - mondayIndex,
    );

    const week: Array<{ logDate: LogDate; mark: RoutineDayMark }> = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset);
      const logDate =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate(),
        ).padStart(2, '0')}` as LogDate;

      week.push({
        logDate,
        mark: routineDayMark({
          schedule: setup.schedule,
          startDate: setup.startDate,
          logDate,
          status: statusFor(routineStatuses, setup.id, logDate),
        }),
      });
    }

    return week;
  }, [setup, weekOffset, routineStatuses, today]);
}


/**
 * A one-line summary for Fuel's Peptides tile.
 *
 * **Facts only, and no goal** (slice 3.9). The tile ran on a fixture that
 * claimed `1 of 3 logged` to every user forever — a count that was invented
 * and a target that has never existed. VITA has no daily peptide goal, so
 * there is nothing to divide by and no progress to draw. What it can honestly
 * say is how many administrations were recorded today and how many routines
 * the user's own schedule covers.
 *
 * Deliberately tiny: Fuel gets a summary and a door, not a second Peptides
 * screen embedded in a nutrition one.
 */
export function usePeptideSummary(): { loggedToday: number; scheduledToday: number; label: string } {
  const { logsForDate, today } = usePeptideContext();
  const { today: scheduled } = usePeptides();

  return useMemo(() => {
    const loggedToday = logsForDate(today).length;
    return {
      loggedToday,
      scheduledToday: scheduled.length,
      label:
        loggedToday > 0
          ? `${loggedToday} logged today`
          : scheduled.length > 0
            ? `${scheduled.length} scheduled`
            : 'None logged',
    };
  }, [logsForDate, today, scheduled]);
}
