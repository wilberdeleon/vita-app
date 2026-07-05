import type { Ionicons } from '@expo/vector-icons';

export type MacroSummary = {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
};

export type CalorieSummary = {
  current: number;
  goal: number;
  macros: MacroSummary[];
};

export type QuickStat = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: string;
  label: string;
};

export type MealEntry = {
  id: string;
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  kcal: number;
};

export type JourneySnapshot = {
  stage: string;
  week: number;
  totalWeeks: number;
};

export type DashboardData = {
  firstName: string;
  headline: string;
  subline: string;
  calories: CalorieSummary;
  quickStats: QuickStat[];
  journey: JourneySnapshot;
  meals: MealEntry[];
};
