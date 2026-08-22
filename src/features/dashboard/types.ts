import type { Ionicons } from '@expo/vector-icons';

/**
 * Home's canonical meal vocabulary is the shared one. Re-exported rather
 * than redeclared so `'Snack'` vs `'Snacks'` can never drift apart again —
 * there is exactly one definition, in `src/lib/nutrition`.
 */
export type { MealSlot } from '../../lib/nutrition';
import type { MealSlot } from '../../lib/nutrition';

/**
 * ── View models, not domain types ──────────────────────────────────────
 *
 * `MacroSummary`, `CalorieSummary`, and `MealSlotSummary` describe how Home
 * *renders* nutrition, not where nutrition lives. Since slice 2.5 they are
 * assembled in `dashboard.tsx` from the shared engine (`useDailyNutrition()`)
 * rather than from a fixture.
 *
 * They are deliberately kept rather than replaced by a shared type. The
 * duplication the Sprint 2 audit flagged — `MacroSummary` mirroring Fuel's
 * `Macro` — was already eliminated in slice 2.1 when Fuel's copy was
 * deleted, so nothing in `src/lib/nutrition` now has these shapes. Fuel's
 * own progress bars want a different one (`{ label, valueLabel, progress,
 * color }`). Inventing a shared display type to satisfy neither, and
 * editing a locked Dashboard component to adopt it, would buy no
 * data-integrity gain — the data is already single-source.
 */
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

/**
 * Per-slot summary (founders, 2026-07-18 clean redesign) — one row per meal
 * slot with its logged total and item status, not a running list of
 * individual foods. Home is a summary; Fuel's Food Log is the detailed view.
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

/**
 * What the Dashboard's own fixture still owns.
 *
 * `calories` and `mealSlots` were removed in slice 2.5 — daily nutrition now
 * comes from `src/lib/nutrition`, the single source of truth shared with
 * Fuel. Everything left here belongs to domains Sprint 2 does not cover
 * (Journey, movement, recovery, sleep, steps) and is honestly still mock.
 *
 * `goals` keeps all four pillars, but the **nutrition** pillar's `complete`
 * is recomputed from real logged data in `dashboard.tsx`; water, movement,
 * and recovery stay fixture-driven until their own features are built.
 */
export type DashboardData = {
  firstName: string;
  goals: GoalPillar[];
  journey: JourneySnapshot;
  quickStats: QuickStat[];
};
