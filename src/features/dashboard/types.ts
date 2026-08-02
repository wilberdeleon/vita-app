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

export type GoalPillarId = 'nutrition' | 'water' | 'movement' | 'recovery';

/** One of the four daily goal pillars shown as a tile in Today's Summary. */
export type GoalPillar = {
  id: GoalPillarId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  complete: boolean;
};

export type QuickStat = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  value: string;
  label: string;
  /** 0..1 — drives the thin progress accent under each Health Metric tile. */
  progress: number;
};

export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

/**
 * Per-slot summary (founders, 2026-07-18 clean redesign) — one row per meal
 * slot with its logged total and item status, not a running list of
 * individual foods.
 */
export type MealSlotSummary = {
  slot: MealSlot;
  kcal: number;
  itemCount: number;
};

/**
 * Current Journey snapshot (founders, 2026-07-18 clean redesign v2).
 * `stageId`/`nextStageId` key into the shared `JOURNEY_STAGES` catalog
 * (src/lib/journeyStages.ts) for label/icon/order — nothing about the stage
 * itself is hardcoded here. `stagePercent` ("18% through Focus") and
 * `overallPercent` (the journey progress bar + its label) are independent
 * display fields, not derived from `week`/`totalWeeks` — the approved
 * mockup's own numbers aren't mutually consistent under any single formula,
 * and a real duration-aware stage-computation engine is Journey-feature
 * territory, out of scope for this Home presentation-layer redesign.
 */
export type JourneySnapshot = {
  stageId: string;
  nextStageId: string;
  week: number;
  totalWeeks: number;
  stagePercent: number;
  overallPercent: number;
};

export type DashboardData = {
  firstName: string;
  calories: CalorieSummary;
  goals: GoalPillar[];
  journey: JourneySnapshot;
  quickStats: QuickStat[];
  mealSlots: MealSlotSummary[];
};
