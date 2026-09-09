import { formatCalories } from '../model/format';
import type { DailyTotals } from '../model/nutrition';

/**
 * Which of the five things a day's calories can be.
 *
 * Named rather than derived from the numbers at each call site, because
 * "exactly at goal" and "under goal by zero" are the same arithmetic and
 * different sentences.
 */
export type CalorieState = 'loading' | 'no-goal' | 'under' | 'met' | 'over';

export type CalorieSummaryView = {
  state: CalorieState;
  consumed: number;
  /** `null` until the user authors one. Never a figure VITA chose. */
  goal: number | null;
  /** `null` with no goal; `0` once the goal is passed. */
  remaining: number | null;
  /** `null` with no goal; `0` until the goal is passed. */
  over: number | null;
  /** 0..1, clamped, or `null` with no goal. The rail on both screens. */
  progress: number | null;

  /** Fuel's headline figure: `616`. */
  figure: string;
  /** The line directly under it: `Calories consumed`. */
  caption: string;
  /** Fuel's secondary line: `884 left · 1,500 goal`, or `null` with no goal. */
  goalLine: string | null;

  /** Home's headline: `616 cal consumed`. */
  compact: string;
  /** Home's calorie context: `884 left`, `120 over`, `Goal reached`, `null`. */
  compactDetail: string | null;

  /** The facts, spoken. Identical on both screens. */
  spoken: string;
};

/**
 * **The one calorie summary.** Fuel's full section and Home's compact Fuel
 * widget are both built from this.
 *
 * ## Why it exists
 *
 * The founder's 5.6B.4 review put the two side by side. Fuel led with `1,340`
 * above `Calories · 2,000 goal · 660 left`, and Home led with `660 cal left`.
 * Both were true and they described the same day, but the large number meant
 * *consumed* on one screen and *remaining* on the other — which is exactly the
 * ambiguity a headline figure must not have. Each screen had derived its own
 * copy from the same totals, and two derivations are two chances to disagree.
 *
 * So the wording is decided once, here, in the domain that owns the numbers.
 * **The two screens may render different strings — a square widget cannot
 * carry Fuel's three lines — but they cannot disagree**, because every string
 * either screen shows comes out of this function.
 *
 * ## The large number always means consumed
 *
 * Founder ruling. `616` above `Calories consumed` leaves nothing to infer;
 * what is left and what the goal was are the supporting line beneath it.
 *
 * ## No verdict, in any state
 *
 * Passing a goal is `120 over`, never *exceeded*, *too much* or a warning.
 * There is no red, no icon and no failure language anywhere in this file, and
 * the colours the callers use for these states are hierarchy only — see
 * `macroAccent`. VITA describes the day; it does not grade it.
 *
 * ## It computes nothing
 *
 * Every figure comes from `dailyTotals` — the engine both screens already
 * read. This turns numbers into sentences and does no arithmetic of its own
 * beyond rounding for display, so a second calorie calculation cannot exist.
 */
export function calorieSummary(
  totals: Pick<DailyTotals, 'nutrition' | 'targets' | 'caloriesRemaining' | 'caloriesOver' | 'calorieProgress'>,
  isLoading = false,
): CalorieSummaryView {
  const consumed = Math.round(totals.nutrition.calories);
  const goal = totals.targets?.calories ?? null;

  if (isLoading) {
    return {
      state: 'loading',
      consumed,
      goal,
      remaining: null,
      over: null,
      progress: null,
      figure: '—',
      caption: 'Calories consumed',
      goalLine: null,
      compact: '—',
      compactDetail: null,
      spoken: 'Fuel. Loading.',
    };
  }

  const figure = formatCalories(consumed);

  if (goal === null) {
    return {
      state: 'no-goal',
      consumed,
      goal: null,
      remaining: null,
      over: null,
      /* Nothing to be a fraction of, so no rail — never a track at zero. */
      progress: null,
      figure,
      caption: 'Calories consumed',
      goalLine: null,
      compact: `${figure} cal consumed`,
      compactDetail: null,
      spoken: `${figure} calories consumed. No calorie goal set.`,
    };
  }

  const remaining = Math.round(totals.caloriesRemaining ?? 0);
  const over = Math.round(totals.caloriesOver ?? 0);
  const goalLabel = formatCalories(goal);
  const state: CalorieState = over > 0 ? 'over' : remaining > 0 ? 'under' : 'met';

  /*
   * `0 left` is arithmetic, not a sentence. A day that lands exactly on its
   * goal says so, the way Water's module does.
   */
  const context =
    state === 'over'
      ? `${formatCalories(over)} over`
      : state === 'under'
        ? `${formatCalories(remaining)} left`
        : 'Goal reached';

  return {
    state,
    consumed,
    goal,
    remaining,
    over,
    progress: totals.calorieProgress,
    figure,
    caption: 'Calories consumed',
    goalLine: `${context} · ${goalLabel} goal`,
    compact: `${figure} cal consumed`,
    compactDetail: context,
    spoken: `${figure} calories consumed. ${goalLabel} calorie goal. ${
      state === 'over'
        ? `${formatCalories(over)} calories over.`
        : state === 'under'
          ? `${formatCalories(remaining)} calories remaining.`
          : 'Goal reached.'
    }`,
  };
}
