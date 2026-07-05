export type WeightPoint = {
  /** Short axis label, e.g. "Apr 15". */
  label: string;
  weight: number;
};

export type Milestone = {
  id: string;
  label: string;
  progressLabel: string;
  done: boolean;
};

export type WeightStats = {
  average: number;
  lowest: number;
  highest: number;
  goal: number;
  deltaLbs: number;
};

export type PhotoEntry = {
  id: string;
  dateLabel: string;
  weekLabel: string;
};

export type JourneyData = {
  stageId: string;
  week: number;
  totalWeeks: number;
  currentWeight: number;
  deltaLbs: number;
  deltaWeeks: number;
  /** Your weight, most recent weeks. */
  trend: WeightPoint[];
  /** The 4 weeks before that, for the comparison chart. */
  previousTrend: WeightPoint[];
  milestones: Milestone[];
  stats: WeightStats;
  photos: PhotoEntry[];
};
