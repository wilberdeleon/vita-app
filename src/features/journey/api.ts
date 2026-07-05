import { JOURNEY_FIXTURE } from './mock';
import { JOURNEY_STAGES, type JourneyStage } from './stages';
import type { JourneyData } from './types';

/**
 * Data boundary for My Journey. Sprint 0 serves fixtures; later sprints
 * replace this with Supabase queries — the screen contract is stable.
 */
export function getJourney(): JourneyData {
  return JOURNEY_FIXTURE;
}

export function getStage(stageId: string): JourneyStage {
  return JOURNEY_STAGES.find((stage) => stage.id === stageId) ?? JOURNEY_STAGES[0];
}
