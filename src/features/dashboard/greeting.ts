import { useEffect, useState } from 'react';

/**
 * Single authoritative time-of-day boundary model (founder decision, July
 * 2026): morning 05:00–11:59 · afternoon 12:00–16:59 · evening 17:00–20:59 ·
 * night 21:00–04:59.
 */
export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export type Greeting = {
  period: TimePeriod;
  /** e.g. "Good morning" — rendered uppercase with the name by DashboardHero. */
  label: string;
};

const LABELS: Record<TimePeriod, string> = {
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
};

function periodForHour(hour: number): TimePeriod {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function greetingForHour(hour: number): Greeting {
  const period = periodForHour(hour);
  return { period, label: LABELS[period] };
}

/**
 * Live greeting that re-evaluates every minute, so a Dashboard left open
 * across a period boundary (e.g. 11:59am → 12:00pm) flips without a reload.
 */
export function useGreeting(): Greeting {
  const [greeting, setGreeting] = useState(() => greetingForHour(new Date().getHours()));

  useEffect(() => {
    const id = setInterval(() => {
      setGreeting(greetingForHour(new Date().getHours()));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  return greeting;
}
