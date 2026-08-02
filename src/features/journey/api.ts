import { getJourneyStage, type JourneyStage } from '../../lib/journeyStages';
import { JOURNEY_FIXTURE } from './mock';
import type { JourneyData } from './types';

/**
 * Data boundary for My Journey. Sprint 0 serves fixtures; later sprints
 * replace this with Supabase queries — the screen contract is stable.
 */
export function getJourney(): JourneyData {
  return JOURNEY_FIXTURE;
}

export function getStage(stageId: string): JourneyStage {
  return getJourneyStage(stageId);
}
