import { palette } from '../../theme/tokens';
import type { DashboardData } from './types';

/**
 * Dashboard's remaining placeholder data. Nutrition was removed in slice
 * 2.5 — calories, macros, and meals now come from the shared nutrition
 * engine, so there is no second fake dataset competing with Fuel's.
 * What's left (Journey, steps, sleep, workouts, streak) belongs to domains
 * Sprint 2 doesn't cover.
 */
export const DASHBOARD_FIXTURE: DashboardData = {
  firstName: 'Wilber',
  goals: [
    // `complete` here is a placeholder — dashboard.tsx recomputes the
    // nutrition pillar from real logged data (slice 2.5). The other three
    // pillars have no feature behind them yet and stay fixture-driven.
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant-outline', color: palette.primary, complete: false },
    { id: 'water', label: 'Water', icon: 'water-outline', color: palette.water, complete: true },
    { id: 'movement', label: 'Movement', icon: 'barbell-outline', color: palette.success, complete: true },
    { id: 'recovery', label: 'Recovery', icon: 'moon-outline', color: palette.peptide, complete: false },
  ],
  journey: {
    stageId: 'focus',
    nextStageId: 'growth',
    week: 2,
    totalWeeks: 24,
    stagePercent: 0.18,
    overallPercent: 0.25,
  },
  quickStats: [
    { id: 'steps', icon: 'footsteps-outline', color: palette.journey, value: '6,842', label: 'Steps', progress: 6842 / 10000 },
    { id: 'water', icon: 'water-outline', color: palette.water, value: '5 / 8', label: 'Water', progress: 5 / 8 },
    { id: 'workout', icon: 'flame-outline', color: palette.primary, value: '1 / 3', label: 'Workouts', progress: 1 / 3 },
    { id: 'sleep', icon: 'moon-outline', color: palette.peptide, value: '6.4 h', label: 'Sleep', progress: 6.4 / 8 },
    { id: 'streak', icon: 'calendar-outline', color: palette.gold, value: '12', label: 'Streak', progress: 12 / 30 },
  ],
};
