/**
 * Chart input shape for the dormant `LineChart` / `WeightBars` components.
 *
 * Slice 6.1 deleted the rest of this file — `JourneyData`, `Milestone`,
 * `WeightStats` (with its `goal`) and `PhotoEntry` existed only to type the
 * invented `JOURNEY_FIXTURE`, and none of them is the canonical Journey
 * model. Stored weight lives in `src/lib/journey/` (slice 6.2). The charts
 * are kept, unrendered, for real-data reuse in slice 6.5.
 */
export type WeightPoint = {
  /** Short axis label, e.g. "Apr 15". */
  label: string;
  weight: number;
};
