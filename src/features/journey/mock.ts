import type { JourneyData } from './types';

/** Realistic placeholder data matching the approved UI reference. */
export const JOURNEY_FIXTURE: JourneyData = {
  stageId: 'momentum',
  week: 4,
  totalWeeks: 24,
  currentWeight: 185.2,
  deltaLbs: -2.4,
  deltaWeeks: 4,
  trend: [
    { label: 'Apr 15', weight: 187.6 },
    { label: 'Apr 22', weight: 187.1 },
    { label: 'Apr 29', weight: 186.4 },
    { label: 'May 6', weight: 185.9 },
    { label: 'May 13', weight: 185.2 },
  ],
  previousTrend: [
    { label: 'Mar 18', weight: 189.4 },
    { label: 'Mar 25', weight: 189.0 },
    { label: 'Apr 1', weight: 188.5 },
    { label: 'Apr 8', weight: 188.0 },
    { label: 'Apr 15', weight: 187.6 },
  ],
  milestones: [
    { id: 'weigh-ins', label: 'Log weight 5x this week', progressLabel: '5 / 5', done: true },
    { id: 'protein', label: 'Hit your protein goal', progressLabel: '6 / 7 days', done: true },
    { id: 'workouts', label: 'Complete 3 workouts', progressLabel: '2 / 3', done: false },
  ],
  stats: {
    average: 186.2,
    lowest: 185.2,
    highest: 191.8,
    goal: 175.0,
    deltaLbs: -2.4,
  },
  photos: [
    { id: 'w6', dateLabel: 'May 13', weekLabel: 'Week 6' },
    { id: 'w5', dateLabel: 'May 6', weekLabel: 'Week 5' },
    { id: 'w4', dateLabel: 'Apr 29', weekLabel: 'Week 4' },
    { id: 'w3', dateLabel: 'Apr 22', weekLabel: 'Week 3' },
  ],
};

export const TIME_RANGES = ['7D', '1M', '3M', '6M', '1Y'];
