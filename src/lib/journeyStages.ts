import type { Ionicons } from '@expo/vector-icons';

export type JourneyStage = {
  id: string;
  order: number;
  name: string;
  tagline: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/**
 * The canonical 8-stage Journey system from the approved "VITA Journey
 * Stages" reference sheet (founders, 2026-07-19) — shared by the Journey
 * tab and the Home dashboard's Current Journey card, so it lives in `lib/`
 * rather than either feature (features never import from each other).
 * Progress is defined by consistency, not perfection.
 *
 * Icons are the closest available Ionicons match for each stage's custom
 * reference glyph — Ionicons has no literal "stacked building blocks"
 * (Foundation), "3-ring target" (Focus), "sprout with ground line"
 * (Growth), or "mountain peak with sun" (Mastery) shapes, so those four
 * use the nearest semantic equivalent already in the set rather than a
 * custom-drawn asset. Flagged rather than silently approximated — see the
 * 2026-07-19 audit log entry for the full per-stage mapping.
 */
export const JOURNEY_STAGES: JourneyStage[] = [
  { id: 'foundation', order: 1, name: 'Foundation', tagline: "I'm showing up. Building the base.", icon: 'layers-outline' },
  { id: 'focus', order: 2, name: 'Focus', tagline: "I'm becoming intentional.", icon: 'aperture-outline' },
  { id: 'growth', order: 3, name: 'Growth', tagline: 'The momentum is real.', icon: 'leaf-outline' },
  { id: 'momentum', order: 4, name: 'Momentum', tagline: 'Discipline starts replacing motivation.', icon: 'trending-up-outline' },
  { id: 'balance', order: 5, name: 'Balance', tagline: "I'm living the lifestyle.", icon: 'git-commit-outline' },
  { id: 'thrive', order: 6, name: 'Thrive', tagline: 'My health compounds.', icon: 'sunny-outline' },
  { id: 'mastery', order: 7, name: 'Mastery', tagline: 'I operate from identity.', icon: 'flag-outline' },
  { id: 'legacy', order: 8, name: 'Legacy', tagline: 'This is my new baseline.', icon: 'sparkles-outline' },
];

export function getJourneyStage(stageId: string): JourneyStage {
  return JOURNEY_STAGES.find((stage) => stage.id === stageId) ?? JOURNEY_STAGES[0];
}
