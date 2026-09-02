/**
 * Local-day rollover on app foreground.
 *
 * Someone who logs breakfast, backgrounds the app, and comes back the next
 * morning must not be shown yesterday's totals under "Today". React Native
 * gives no day-change event, so the check happens when the app becomes
 * active — the only moment the user could actually be looking.
 *
 * Written inside `NutritionProvider` in Sprint 2 and promoted here in slice
 * 3.1 with its semantics intact, because Water and Peptides need exactly the
 * same behavior and a second copy would be a second thing to get subtly
 * wrong. `NutritionProvider` now consumes this hook rather than its own copy.
 *
 * Both state reads are functions, not values. The listener is registered once
 * and would otherwise close over the day and the follow-flag as they were at
 * registration time — reading them at event time is what makes the check
 * correct hours later.
 */

import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { todayLogDate, type LogDate } from './dates';

export type DayRolloverOptions = {
  /** The day currently on screen. Read when the app becomes active. */
  getCurrentDate: () => LogDate;
  /**
   * False once the user has deliberately navigated to a day other than today.
   * Someone reviewing last Tuesday should stay on last Tuesday.
   */
  getIsFollowingToday: () => boolean;
  /** Called only when the app is active, following today, and the day changed. */
  onRollover: (today: LogDate) => void;
};

export function useDayRollover({ getCurrentDate, getIsFollowingToday, onRollover }: DayRolloverOptions): void {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (status !== 'active' || !getIsFollowingToday()) return;
      const today = todayLogDate();
      if (today !== getCurrentDate()) onRollover(today);
    });
    return () => subscription.remove();
  }, [getCurrentDate, getIsFollowingToday, onRollover]);
}
