import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toLogDate, type LogDate } from '../../lib/daily';
import {
  usePeptideContext,
  type PeptideLogEntry,
  type RoutineDayStatus,
} from '../../lib/peptides';
import { daysInMonth, monthOf, type MonthKey } from './month';

export type MonthActivity = {
  statuses: RoutineDayStatus[];
  logs: PeptideLogEntry[];
  isLoading: boolean;
  /** Set when the read failed. Empty and failed are different states. */
  error: string | null;
  retry: () => void;
  /** The oldest month any history exists for, once known. */
  earliest: MonthKey | null;
};

/** Cached per month, so stepping back and forward again does not re-read. */
type CacheEntry = { statuses: RoutineDayStatus[]; logs: PeptideLogEntry[] };

/**
 * One month of history for **every** routine, read on demand.
 *
 * ## Why this exists
 *
 * The provider keeps a warm window of recent history — enough for Today,
 * Recent Activity and a first screen of history without a read. Slice 5.5A's
 * month view was bounded by that window and had to stop at *"Earlier months
 * aren't available"*, which was never the intended product: **every day the
 * user ever recorded is still on disk.** The sixty-day limit was always a
 * loading decision, never a retention one — nothing prunes by age, and the
 * only time a day key is removed is when its last record is cleared.
 *
 * So this asks the repository, through the provider, for exactly the range
 * the month covers. July costs one read of July.
 *
 * ## What it deliberately does not do
 *
 * **It does not merge into the provider.** Browsing five months of calendar
 * must not slowly turn the warm window into every log ever written, and
 * Peptides Home must never wait on a historical read. The cache lives here
 * and dies with the screen.
 *
 * **It re-reads when the app writes.** Marking a day taken from the routine
 * screen changes what a month should say, so any change to the provider's own
 * arrays clears the cache. The alternative — a month that quietly disagrees
 * with the day you just recorded — is worse than a second read.
 *
 * **It distinguishes failed from empty.** A read that threw is reported as an
 * error, never as a month with nothing in it. A calendar that drew a failed
 * read as an empty month would be inventing history.
 */
export function useMonthHistory(month: MonthKey): MonthActivity {
  const { readHistory, earliestHistoryDate, routineStatuses, logs: warmLogs } = usePeptideContext();

  const cache = useRef(new Map<string, CacheEntry>());
  const [entry, setEntry] = useState<CacheEntry | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [earliest, setEarliest] = useState<MonthKey | null>(null);

  const key = `${month.year}-${month.month}`;

  /*
   * Any write anywhere in the app can change what a month says, and the
   * provider replaces these arrays on every one. Dropping the cache is a
   * cheap way to stay honest — a month is a handful of day keys.
   */
  useEffect(() => {
    cache.current.clear();
    setAttempt((count) => count + 1);
  }, [routineStatuses, warmLogs]);

  useEffect(() => {
    let cancelled = false;

    const cached = cache.current.get(key);
    if (cached) {
      setEntry(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const days = daysInMonth(month);
    void (async () => {
      try {
        const result = await readHistory(days[0], days[days.length - 1]);
        if (cancelled) return;
        cache.current.set(key, result);
        setEntry(result);
      } catch {
        if (cancelled) return;
        setEntry(null);
        setError("Couldn't load this month");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // `month` is rebuilt on every render; `key` is its stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, readHistory, attempt]);

  /** Asked once. It bounds navigation, and it does not change while browsing. */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const oldest = await earliestHistoryDate();
        if (cancelled) return;
        setEarliest(oldest ? monthOf(oldest) : monthOf(toLogDate(new Date())));
      } catch {
        // A failed bounds read must not silently pin navigation to this
        // month; leaving it null lets the screen fall back to its own rule.
        if (!cancelled) setEarliest(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [earliestHistoryDate, attempt]);

  const retry = useCallback(() => {
    cache.current.delete(key);
    setAttempt((count) => count + 1);
  }, [key]);

  return useMemo(
    () => ({
      statuses: entry?.statuses ?? [],
      logs: entry?.logs ?? [],
      isLoading,
      error,
      retry,
      earliest,
    }),
    [entry, isLoading, error, retry, earliest],
  );
}

/**
 * One month of **one routine's** history — the same read, narrowed.
 *
 * Filtering here rather than in the read is deliberate. A month is one range
 * of day keys whatever it is going to be used for, so the Peptides-level
 * calendar and a single routine's calendar ask storage the identical
 * question; splitting them would mean two caches, two loading states and two
 * chances to disagree about what July says.
 */
export function useMonthActivity(setupId: string, month: MonthKey): MonthActivity {
  const history = useMonthHistory(month);

  return useMemo(
    () => ({
      ...history,
      statuses: history.statuses.filter((status) => status.setupId === setupId),
      logs: history.logs.filter((log) => log.setupId === setupId),
    }),
    [history, setupId],
  );
}

/** The day a `LogDate` belongs to, for callers that only have a `Date`. */
export function todayKey(): LogDate {
  return toLogDate(new Date());
}
