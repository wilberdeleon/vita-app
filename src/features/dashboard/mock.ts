import { palette } from '../../theme/tokens';
import type { DashboardData } from './types';

/**
 * Dashboard's remaining placeholder data.
 *
 * Nutrition left in slice 2.5 and **water left in slice 3.4** — both now come
 * from their shared domains, so no fake dataset competes with the real one.
 * What is left genuinely mock: Journey, steps, sleep, workouts, streak, and
 * the Movement and Recovery goal pillars — domains with no feature behind them
 * yet. They keep fixture values rather than being quietly redefined, so the
 * "N of 4 goals complete" count stays honest about what it actually knows.
 */
export const DASHBOARD_FIXTURE: DashboardData = {
  firstName: 'Wilber',
  goals: [
    // `complete` here is a placeholder — dashboard.tsx recomputes the
    // nutrition pillar from real logged data (slice 2.5). The other three
    // pillars have no feature behind them yet and stay fixture-driven.
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant-outline', color: palette.primary, complete: false },
    // Recomputed from real hydration state in dashboard.tsx (slice 3.4).
    // `false` is the placeholder, not a claim — the same treatment nutrition
    // has had since slice 2.5.
    { id: 'water', label: 'Water', icon: 'water-outline', color: palette.water, complete: false },
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
    /**
     * Value and progress are replaced from real hydration state in
     * dashboard.tsx (slice 3.4); what stays here is presentation metadata —
     * id, icon, color, label, and position in the row. The placeholders are
     * deliberately an em dash and zero rather than a plausible number, so a
     * failure to override reads as "unknown" instead of quietly inventing a
     * hydration figure. This tile used to hardcode `5 / 8` forever.
     */
    { id: 'water', icon: 'water-outline', color: palette.water, value: '—', label: 'Water', progress: 0 },
    { id: 'workout', icon: 'flame-outline', color: palette.primary, value: '1 / 3', label: 'Workouts', progress: 1 / 3 },
    { id: 'sleep', icon: 'moon-outline', color: palette.peptide, value: '6.4 h', label: 'Sleep', progress: 6.4 / 8 },
    { id: 'streak', icon: 'calendar-outline', color: palette.gold, value: '12', label: 'Streak', progress: 12 / 30 },
  ],
};
