import type { Ionicons } from '@expo/vector-icons';

export type JourneyStage = {
  id: string;
  order: number;
  name: string;
  tagline: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/**
 * The canonical 8-stage Journey system from the approved UI reference.
 * Progress is defined by consistency, not perfection.
 */
export const JOURNEY_STAGES: JourneyStage[] = [
  { id: 'foundation', order: 1, name: 'Foundation', tagline: "You've decided to start something better.", icon: 'layers-outline' },
  { id: 'focus', order: 2, name: 'Focus', tagline: "You're directing your energy with intention.", icon: 'aperture-outline' },
  { id: 'growth', order: 3, name: 'Growth', tagline: 'Small actions today create real change.', icon: 'leaf-outline' },
  { id: 'momentum', order: 4, name: 'Momentum', tagline: "You're building consistency and seeing results.", icon: 'play-forward-outline' },
  { id: 'balance', order: 5, name: 'Balance', tagline: "You're aligning your body, mind, and lifestyle.", icon: 'infinite-outline' },
  { id: 'thrive', order: 6, name: 'Thrive', tagline: "You're thriving—energy, confidence, clarity.", icon: 'sunny-outline' },
  { id: 'mastery', order: 7, name: 'Mastery', tagline: 'Discipline is your default. Excellence is your standard.', icon: 'flag-outline' },
  { id: 'legacy', order: 8, name: 'Legacy', tagline: "You've built a life that inspires and lasts.", icon: 'trophy-outline' },
];
