/**
 * Journey lifecycle state (slice 6.5) — sits inside `WeightProvider`, because
 * starting a Journey writes its first weigh-in.
 *
 * ## Starting a Journey is all-or-nothing
 *
 * A Journey is never active without its starting weight, and a starting
 * weight never exists without its Journey. Two storage keys cannot be
 * written in one transaction, so the order is chosen for safety:
 *
 * 1. The starting weigh-in is written first, already carrying the new
 *    Journey's id. If that fails, nothing has been written.
 * 2. The Journey is written. If that fails, the weigh-in is removed again.
 *
 * If even the rollback fails, what is left is a weigh-in that names a Journey
 * which does not exist — and a weigh-in is only ever shown *through* its
 * Journey, so it is shown nowhere. The impossible visible state — an active
 * Journey with no start — cannot occur.
 *
 * Nothing here is created for the user: no Journey on first run, none from
 * old 6.4 weigh-ins, none to recover from a broken store.
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
import { todayLogDate, type LogDate } from '../../daily/dates';
import { asyncStorageJourneyRepository } from '../data/asyncStorageJourneyRepository';
import type { JourneyRepository } from '../data/JourneyRepository';
import { createWeightEntry } from '../model/entries';
import {
  activeJourney,
  addJourney,
  completeJourney,
  createJourney,
  extendJourney,
  pastJourneys,
  replaceJourney,
  type Journey,
} from '../model/journeys';
import type { WeightUnit } from '../model/types';
import { useWeight } from './WeightProvider';

export type StartJourneyInput = {
  name: string;
  plannedEndDate: LogDate;
  startingWeight: number;
  unit: WeightUnit;
  /** Injectable; defaults to now. Both the Journey and its first weigh-in use it. */
  now?: Date;
};

export type JourneyContextValue = {
  status: 'loading' | 'ready';
  journeys: Journey[];
  /** Derived: the one Journey with `status: 'active'`, or `null`. */
  active: Journey | null;
  /** Derived: completed Journeys, most recently finished first. */
  past: Journey[];
  error: string | null;
  /** Resolves the new Journey, or `null` when nothing could be saved (and nothing was). */
  startJourney: (input: StartJourneyInput) => Promise<Journey | null>;
  extendJourney: (id: string, newEnd: LogDate) => Promise<boolean>;
  finishJourney: (id: string) => Promise<boolean>;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

type Props = PropsWithChildren<{
  repository?: JourneyRepository;
  /** Injectable "today" for tests; defaults to the device's local day. */
  today?: () => LogDate;
}>;

export function JourneyProvider({ children, repository = asyncStorageJourneyRepository, today = todayLogDate }: Props) {
  const weight = useWeight();
  const [status, setStatus] = useState<'loading' | 'ready'>('loading');
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const journeysRef = useRef<Journey[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await repository.getJourneys();
        if (cancelled) return;
        journeysRef.current = stored;
        setJourneys(stored);
      } catch {
        if (!cancelled) setError("We couldn't load your Journeys.");
      } finally {
        if (!cancelled) setStatus('ready');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const save = useCallback(
    async (next: Journey[]): Promise<boolean> => {
      try {
        await repository.saveJourneys(next);
        journeysRef.current = next;
        setJourneys(next);
        setError(null);
        return true;
      } catch {
        setError("We couldn't save your Journey.");
        return false;
      }
    },
    [repository],
  );

  const startJourney = useCallback(
    async ({ name, plannedEndDate, startingWeight, unit, now = new Date() }: StartJourneyInput) => {
      if (activeJourney(journeysRef.current)) return null;
      const journey = createJourney({ name, plannedEndDate, now });
      const first = createWeightEntry({ weight: startingWeight, unit, loggedAt: now, journeyId: journey.id });

      if (!(await weight.restoreEntry(first))) return null;
      if (!(await save(addJourney(journeysRef.current, journey)))) {
        await weight.removeEntry(first.id);
        return null;
      }
      return journey;
    },
    [weight, save],
  );

  const extend = useCallback(
    async (id: string, newEnd: LogDate) => {
      const journey = journeysRef.current.find((candidate) => candidate.id === id);
      if (!journey) return false;
      let next: Journey;
      try {
        next = extendJourney(journey, newEnd, today());
      } catch {
        return false;
      }
      return save(replaceJourney(journeysRef.current, next));
    },
    [save, today],
  );

  const finish = useCallback(
    async (id: string) => {
      const journey = journeysRef.current.find((candidate) => candidate.id === id);
      if (!journey || journey.status !== 'active') return false;
      return save(replaceJourney(journeysRef.current, completeJourney(journey)));
    },
    [save],
  );

  const value = useMemo<JourneyContextValue>(
    () => ({
      status: status === 'ready' && weight.status === 'ready' ? 'ready' : 'loading',
      journeys,
      active: activeJourney(journeys),
      past: pastJourneys(journeys),
      error,
      startJourney,
      extendJourney: extend,
      finishJourney: finish,
    }),
    [status, weight.status, journeys, error, startJourney, extend, finish],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourneys(): JourneyContextValue {
  const context = useContext(JourneyContext);
  if (!context) throw new Error('useJourneys must be used inside a JourneyProvider (mounted in src/app/_layout.tsx).');
  return context;
}
