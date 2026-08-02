import { palette } from '../../theme/tokens';
import type { DashboardData } from './types';

/** Realistic placeholder data matching the approved clean-redesign v2 UI reference. */
export const DASHBOARD_FIXTURE: DashboardData = {
  firstName: 'Wilber',
  headline: 'Build with intention.',
  subline: 'YOUR DAY, YOUR DIRECTION.',
  calories: {
    current: 1267,
    goal: 2000,
    macros: [
      { label: 'Protein', current: 107, goal: 160, unit: 'g', color: palette.protein },
      { label: 'Carbs', current: 100, goal: 214, unit: 'g', color: palette.carbs },
      { label: 'Fat', current: 45, goal: 64, unit: 'g', color: palette.fat },
    ],
  },
  goals: [
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant-outline', color: palette.primary, complete: true },
    { id: 'water', label: 'Water', icon: 'water-outline', color: palette.water, complete: true },
    { id: 'movement', label: 'Movement', icon: 'barbell-outline', color: palette.success, complete: true },
    { id: 'recovery', label: 'Recovery', icon: 'moon-outline', color: palette.peptide, complete: false },
  ],
  streakDays: 12,
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
  ],
  mealSlots: [
    { slot: 'Breakfast', kcal: 420, itemCount: 1 },
    { slot: 'Lunch', kcal: 620, itemCount: 1 },
    { slot: 'Dinner', kcal: 520, itemCount: 1 },
    { slot: 'Snacks', kcal: 180, itemCount: 1 },
  ],
};
