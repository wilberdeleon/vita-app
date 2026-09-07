/**
 * The arithmetic behind dragging the week strip sideways.
 *
 * **Pure, and separate from the component on purpose.** A `PanResponder`'s
 * handlers are only reachable through React Native's responder negotiation
 * and a synthetic touch history, so a test that drove them would be testing
 * the framework. Every decision the gesture makes — whether to claim a touch
 * at all, how far the strip follows a finger, and what a release means — is
 * a function of two or three numbers, and lives here where it can be stated
 * plainly. The same split `dragLayout.ts` uses for the dashboard.
 */

/**
 * How far a finger must travel horizontally before the strip takes the
 * gesture. Small enough that a deliberate swipe feels immediate, large enough
 * that the few pixels of drift in a tap never register as one.
 */
export const CLAIM_DISTANCE = 12;

/**
 * How much more horizontal than vertical the movement has to be.
 *
 * The routine screen scrolls vertically, and a strip that grabbed anything
 * with a sideways component would make the page feel sticky. A diagonal is
 * treated as a scroll: the page is the default, and the strip has to earn it.
 */
export const DIRECTION_RATIO = 1.6;

/** Distance that commits a week — roughly a thumb's width of travel. */
export const COMMIT_DISTANCE = 56;

/** A flick that has not travelled far still counts, if it is quick enough. */
export const COMMIT_VELOCITY = 0.35;

/** The strip never leaves its lane; the drag is resistive past this. */
export const MAX_DRAG = 72;

/** How much of the finger's travel the strip actually follows. */
const FOLLOW = 0.55;

/** What it follows when there is nowhere to go — enough to feel the edge. */
const FOLLOW_BLOCKED = 0.18;

/**
 * Whether a horizontal drag has proved itself against a vertical scroll.
 *
 * Both conditions matter. Distance alone would claim the first pixels of a
 * slightly-angled scroll; direction alone would claim a tap that wobbled.
 */
export function claimsGesture(dx: number, dy: number): boolean {
  return Math.abs(dx) > CLAIM_DISTANCE && Math.abs(dx) > Math.abs(dy) * DIRECTION_RATIO;
}

/**
 * How far the strip sits from home while a finger is on it.
 *
 * Damped, so it trails the finger rather than sticking to it, and clamped so
 * it stays in its own lane. Dragging towards a week that does not exist —
 * forward, at the present — gives much less: the edge is felt rather than
 * explained.
 */
export function dragOffset(dx: number, canGoNext: boolean): number {
  const blocked = dx < 0 && !canGoNext;
  const damped = dx * (blocked ? FOLLOW_BLOCKED : FOLLOW);
  return Math.max(-MAX_DRAG, Math.min(MAX_DRAG, damped));
}

/**
 * What letting go means.
 *
 * **Always at most one week** (§9). Neither distance nor velocity is turned
 * into a count: a thrown flick moves one week exactly like a slow drag past
 * the threshold. A gesture that skipped four weeks because it was fast would
 * leave someone somewhere they did not choose, and the arrows are there when
 * a particular week is wanted.
 *
 * Dragging right reaches back into the past and dragging left comes forward,
 * which is the direction a calendar moves under a finger.
 */
export function releaseAction(
  dx: number,
  vx: number,
  canGoNext: boolean,
): 'previous' | 'next' | 'cancel' {
  const committed = Math.abs(dx) > COMMIT_DISTANCE || Math.abs(vx) > COMMIT_VELOCITY;
  if (!committed) return 'cancel';

  // A release with no travel at all is not a direction, whatever its velocity.
  if (dx === 0) return 'cancel';
  if (dx > 0) return 'previous';
  return canGoNext ? 'next' : 'cancel';
}
