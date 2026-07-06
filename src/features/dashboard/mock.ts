import { palette } from '../../theme/tokens';
import type { DashboardData } from './types';

/** Realistic placeholder data matching the approved UI reference. */
export const DASHBOARD_FIXTURE: DashboardData = {
  firstName: 'Wilber',
  headline: "You've got this.",
  subline: 'Small steps today. Big changes tomorrow.',
  calories: {
    current: 1267,
    goal: 2000,
    macros: [
      { label: 'Protein', current: 107, goal: 160, unit: 'g', color: palette.protein },
      { label: 'Carbs', current: 100, goal: 214, unit: 'g', color: palette.carbs },
      { label: 'Fat', current: 45, goal: 64, unit: 'g', color: palette.fat },
    ],
  },
  quickStats: [
    { id: 'steps', icon: 'footsteps-outline', color: palette.success, value: '6,842', label: '/ 10,000' },
    { id: 'water', icon: 'water-outline', color: palette.water, value: '5 / 8', label: 'Cups' },
    { id: 'peptides', icon: 'medical-outline', color: palette.peptide, value: '1 / 3', label: 'Logged' },
    { id: 'sleep', icon: 'moon-outline', color: palette.sage, value: '6.4 h', label: 'Sleep' },
  ],
  journey: {
    stage: 'Momentum',
    week: 4,
    totalWeeks: 24,
  },
  meals: [
    { id: 'breakfast', slot: 'Breakfast', name: 'Protein Oats', kcal: 300 },
    { id: 'lunch', slot: 'Lunch', name: 'Grilled Chicken Bowl', kcal: 450 },
    { id: 'dinner', slot: 'Dinner', name: 'Salmon & Veggies', kcal: 500 },
  ],
};
