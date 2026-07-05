import { WATER_TODAY } from './mock';
import type { WaterToday } from './types';

/**
 * Data boundary for Water. Sprint 0 serves fixtures; later sprints replace
 * this with Supabase queries — the screen contract is stable.
 */
export function getWaterToday(): WaterToday {
  return WATER_TODAY;
}
