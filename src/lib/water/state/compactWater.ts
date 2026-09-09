import type { WaterToday } from './useWaterToday';

/**
 * Everything a compact Water module needs to draw itself — and nothing else.
 *
 * Strings, a fraction and two booleans. No `WaterToday`, no provider, no unit
 * conversion: the shared component that renders this must not be able to reach
 * the domain, or "presentational" would be a comment rather than a fact.
 */
export type CompactWaterView = {
  /** `13%` with a goal, the day's total without one, `—` while loading. */
  value: string;
  /** `Goal reached`, `40 fl oz to go`, `No goal set`, or empty while loading. */
  detail: string;
  /** The full spoken summary. Never derived from the visible strings. */
  spoken: string;
  /**
   * The vessel's fill, or `null` when there is no goal to be a fraction of.
   *
   * `null` is not zero and must never render as zero: someone who has set no
   * goal has not failed to fill anything. `WaterVessel` draws that state
   * latent, and the spoken label says so in words.
   */
  progress: number | null;
};

/**
 * The one derivation behind Home's and Fuel's Water modules.
 *
 * ## Why it is a function and not two components' worth of ternaries
 *
 * It was the latter until 5.6B.3. The founder's device comparison found Home
 * saying `13%` above `40 fl oz to go` while Fuel said `24.3 fl oz` above `of
 * 64 fl oz` — the same feature, the same data, two different readings, because
 * two screens had each written their own. Copy rules that live in two
 * components diverge; this one cannot.
 *
 * **Home's wording is the source**, per the founder's ruling that where Home
 * already has the approved presentation, Fuel converges to it.
 *
 * ## Every figure comes from Water
 *
 * `totalLabel`, `goalLabel` and `remainingLabel` are already formatted in the
 * user's own display unit by `useWaterToday`, and `progress` and `percent` are
 * Water's own arithmetic. **Nothing here computes a volume, converts a unit or
 * decides what a percentage means** — a second hydration calculation is
 * exactly the thing that would let Fuel and the Water screen disagree.
 */
export function compactWaterView(today: WaterToday): CompactWaterView {
  const { hasGoal, percent, isGoalMet, remainingLabel, totalLabel, goalLabel, isLoading } = today;

  if (isLoading) {
    return { value: '—', detail: '', spoken: 'Water. Loading.', progress: null };
  }

  /*
   * A percentage fits inside a compact module; a volume with a unit does not
   * always. With a goal the percentage is the headline and the volumes are
   * spoken in full; without one the day's real total *is* the headline,
   * because there is nothing to be a fraction of.
   */
  const value = hasGoal && percent !== null ? `${percent}%` : totalLabel;
  const detail = !hasGoal ? 'No goal set' : isGoalMet ? 'Goal reached' : `${remainingLabel} to go`;

  return {
    value,
    detail,
    /*
     * The spoken form carries the volumes the visible one compresses into a
     * percentage. A screen-reader user should not have to infer `24.3 fl oz`
     * from `38%`.
     */
    spoken:
      hasGoal && percent !== null
        ? `Water. ${totalLabel} of ${goalLabel}. ${percent} percent.`
        : `Water. ${totalLabel} today. No goal set.`,
    /*
     * The only place the view records whether a goal exists — `null` means
     * there is none, and the component needs nothing else to know it. A
     * second `hasGoal` field would be a fact stated twice, in two places that
     * could disagree.
     */
    progress: hasGoal ? today.progress : null,
  };
}
