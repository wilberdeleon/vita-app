/**
 * The Journey lifecycle (Sprint 6 slice 6.5).
 *
 * A Journey is a real thing the user creates: a named chapter with a
 * beginning, a planned end, an active period and — once the user decides —
 * an ending that is preserved. Weight entries (and, from 6.6, photos) belong
 * **to** a Journey; they do not define it.
 *
 * ## Two kinds of time, deliberately different
 *
 * - `startDate` / `plannedEndDate` are **calendar days** the user chose —
 *   `LogDate` strings, `YYYY-MM-DD` in the local calendar. A Journey that runs
 *   "Oct 28 to Jan 25" must still run Oct 28 to Jan 25 after a flight, so these
 *   are never stored as instants that a timezone could shift.
 * - `createdAt` / `completedAt` are **events** — ISO instants, like every
 *   other timestamp VITA stores.
 *
 * ## What is not stored
 *
 * Day X, days remaining, the elapsed fraction, starting / current weight and
 * every statistic are derived. Starting weight in particular is the
 * Journey's earliest weight entry — a second `startingWeight` field could
 * disagree with the history, and the history is the truth.
 */

import { fromLogDate, isValidLogDate, shiftLogDate, toLogDate, type LogDate } from '../../daily/dates';
import { newId } from '../../daily/ids';

export type JourneyStatus = 'active' | 'completed';

export type Journey = {
  /** Stable for the life of the Journey, completed ones included. */
  id: string;
  /** User-authored, trimmed, 1–`JOURNEY_NAME_MAX` characters. */
  name: string;
  /** Day 1, local calendar. A new Journey starts today. */
  startDate: LogDate;
  /** The last planned day, inclusive, local calendar. Extending moves only this. */
  plannedEndDate: LogDate;
  status: JourneyStatus;
  /** ISO instant the user pressed Begin Journey. */
  createdAt: string;
  /** ISO instant the user finished it. Present exactly when `status` is `completed`. */
  completedAt?: string;
  /**
   * Every successful Extend, oldest first (slice 6.7 correction). Append-only
   * lifecycle history — the Timeline derives *Journey extended* from it.
   * **Absent means none recorded**: Journeys extended before this field
   * existed have no history, and none is ever inferred from their length.
   */
  extensions?: JourneyExtension[];
};

/** One Extend, as it happened. Immutable once written. */
export type JourneyExtension = {
  /** `newId('extension')`, stored — stable for the life of the record. */
  id: string;
  /** ISO instant the extension was saved. */
  extendedAt: string;
  previousPlannedEndDate: LogDate;
  newPlannedEndDate: LogDate;
};

/** A Journey's extension history; missing reads as none. */
export function journeyExtensions(journey: Pick<Journey, 'extensions'>): readonly JourneyExtension[] {
  return journey.extensions ?? [];
}

/**
 * A Journey-owned weigh-in must fall **on or after the Journey's start day**,
 * compared as local calendar days (slice 6.7 correction). A Journey is a
 * chapter with a beginning; nothing recorded in it may predate that.
 */
export function isWithinJourneyStart(at: Date | string, startDate: LogDate): boolean {
  const date = typeof at === 'string' ? new Date(at) : at;
  if (!Number.isFinite(date.getTime())) return false;
  return toLogDate(date) >= startDate;
}

/** Long enough for "Getting Back to Me — Summer 2027", short enough for one header line. */
export const JOURNEY_NAME_MAX = 60;

/** Trims and validates a typed name. `null` when there is nothing to name it. */
export function normalizeJourneyName(input: string): string | null {
  const trimmed = input.replace(/\s+/g, ' ').trim();
  if (trimmed.length === 0 || trimmed.length > JOURNEY_NAME_MAX) return null;
  return trimmed;
}

/* ── calendar arithmetic ─────────────────────────────────────────────── */

const DAY_MS = 86_400_000;

/**
 * Whole calendar days from `a` to `b` (positive when `b` is later).
 *
 * Computed on UTC midnights built from the date's own parts, so a daylight-
 * saving change between the two can never turn 30 days into 29.96 → 29.
 */
export function calendarDaysBetween(a: LogDate, b: LogDate): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / DAY_MS);
}

/** `start` plus whole calendar months, clamped to the month's last day (Jan 31 + 1 month = Feb 28/29). */
export function addCalendarMonths(start: LogDate, months: number): LogDate {
  const date = fromLogDate(start);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toLogDate(target);
}

/* ── durations ───────────────────────────────────────────────────────── */

export type DurationPreset = '30d' | '60d' | '90d' | '6m';

export const DURATION_PRESETS: readonly { key: DurationPreset; label: string }[] = [
  { key: '30d', label: '30 days' },
  { key: '60d', label: '60 days' },
  { key: '90d', label: '90 days' },
  { key: '6m', label: '6 months' },
];

/**
 * The inclusive last day for a preset. "30 days" starting Oct 28 ends Nov 26:
 * Oct 28 is Day 1, Nov 26 is Day 30. Six months ends the day before the same
 * date six months on — a Journey from Oct 28 runs to Apr 27.
 */
export function plannedEndFor(preset: DurationPreset, startDate: LogDate): LogDate {
  switch (preset) {
    case '30d':
      return shiftLogDate(startDate, 29);
    case '60d':
      return shiftLogDate(startDate, 59);
    case '90d':
      return shiftLogDate(startDate, 89);
    case '6m':
      return shiftLogDate(addCalendarMonths(startDate, 6), -1);
  }
}

/** Days from start to planned end, both included. */
export function plannedDays(journey: Pick<Journey, 'startDate' | 'plannedEndDate'>): number {
  return calendarDaysBetween(journey.startDate, journey.plannedEndDate) + 1;
}

export type JourneyProgress = {
  /** Day 1 on the start date; keeps counting past the planned end. */
  day: number;
  /** Planned length, inclusive. */
  totalDays: number;
  /** Planned days left after today; 0 once the end date is reached. */
  remainingDays: number;
  /** 0–1, for the rail. 1 from the planned end date on. */
  fraction: number;
  /** True on and after the planned end date. The Journey stays active. */
  endReached: boolean;
};

/** Where `today` falls in the Journey. Pure; `today` is injected so tests never race the clock. */
export function journeyProgress(journey: Pick<Journey, 'startDate' | 'plannedEndDate'>, today: LogDate): JourneyProgress {
  const totalDays = plannedDays(journey);
  const day = Math.max(1, calendarDaysBetween(journey.startDate, today) + 1);
  const remainingDays = Math.max(0, calendarDaysBetween(today, journey.plannedEndDate));
  return {
    day,
    totalDays,
    remainingDays,
    fraction: Math.min(1, day / totalDays),
    endReached: today >= journey.plannedEndDate,
  };
}

/* ── lifecycle ───────────────────────────────────────────────────────── */

export type CreateJourneyInput = {
  name: string;
  plannedEndDate: LogDate;
  /** Injectable; defaults to now. The start date is this instant's local day. */
  now?: Date;
};

/**
 * A new active Journey starting **today** — no back-dating in this slice.
 * Throws on an invalid name or an end that is not after today: callers
 * validate first, so reaching here with either is a programming error.
 */
export function createJourney({ name, plannedEndDate, now = new Date() }: CreateJourneyInput): Journey {
  const normalized = normalizeJourneyName(name);
  if (!normalized) throw new Error('createJourney: a Journey needs a name');
  const startDate = toLogDate(now);
  if (!isValidLogDate(plannedEndDate) || plannedEndDate <= startDate) {
    throw new Error(`createJourney: planned end ${plannedEndDate} must be after ${startDate}`);
  }
  return {
    id: newId('journey'),
    name: normalized,
    startDate,
    plannedEndDate,
    status: 'active',
    createdAt: now.toISOString(),
  };
}

/** The earliest end an extension may choose: after the current end, and after today. */
export function earliestExtension(journey: Journey, today: LogDate): LogDate {
  const after = journey.plannedEndDate > today ? journey.plannedEndDate : today;
  return shiftLogDate(after, 1);
}

/** `true` when `newEnd` is a valid extension of an active Journey. */
export function canExtendTo(journey: Journey, newEnd: LogDate, today: LogDate): boolean {
  return journey.status === 'active' && isValidLogDate(newEnd) && newEnd >= earliestExtension(journey, today);
}

/**
 * Moves the planned end **and records that it moved**, in one Journey value —
 * so a saved Journey can never have a new end without its history entry, or
 * a history entry without a new end. Same id, same start, same records.
 */
export function extendJourney(journey: Journey, newEnd: LogDate, today: LogDate, now: Date = new Date()): Journey {
  if (!canExtendTo(journey, newEnd, today)) throw new Error(`extendJourney: ${newEnd} is not a valid extension`);
  const extension: JourneyExtension = {
    id: newId('extension'),
    extendedAt: now.toISOString(),
    previousPlannedEndDate: journey.plannedEndDate,
    newPlannedEndDate: newEnd,
  };
  return { ...journey, plannedEndDate: newEnd, extensions: [...journeyExtensions(journey), extension] };
}

/** Finishes an active Journey at `now`. Its records keep their `journeyId`. */
export function completeJourney(journey: Journey, now: Date = new Date()): Journey {
  if (journey.status !== 'active') throw new Error('completeJourney: only an active Journey can be finished');
  return { ...journey, status: 'completed', completedAt: now.toISOString() };
}

/** The one active Journey, or `null`. */
export function activeJourney(journeys: readonly Journey[]): Journey | null {
  return journeys.find((journey) => journey.status === 'active') ?? null;
}

/** Completed Journeys, most recently finished first. */
export function pastJourneys(journeys: readonly Journey[]): Journey[] {
  return journeys
    .filter((journey) => journey.status === 'completed')
    .sort((a, b) => Date.parse(b.completedAt ?? '') - Date.parse(a.completedAt ?? ''));
}

/**
 * Adds a new active Journey. **One active Journey at a time:** refused while
 * another is active — the user finishes or extends the current one first.
 */
export function addJourney(journeys: readonly Journey[], journey: Journey): Journey[] {
  if (journey.status === 'active' && activeJourney(journeys)) {
    throw new Error('addJourney: a Journey is already active');
  }
  return [...journeys, journey];
}

/** Replaces one Journey by id; unknown id leaves the list unchanged. */
export function replaceJourney(journeys: readonly Journey[], next: Journey): Journey[] {
  return journeys.map((journey) => (journey.id === next.id ? next : journey));
}

/** Days the Journey actually ran: start to completion (or `today`), inclusive. */
export function elapsedDays(journey: Journey, today: LogDate): number {
  const end = journey.completedAt ? toLogDate(new Date(journey.completedAt)) : today;
  return Math.max(1, calendarDaysBetween(journey.startDate, end) + 1);
}
