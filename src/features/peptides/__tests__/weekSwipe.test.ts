/**
 * Dragging the week strip — the decisions, in isolation.
 *
 * The founder asked for the strip to be pushed sideways like a timeline
 * rather than stepped with two small arrows. Everything that can go wrong
 * with that is a number: claiming a touch the page wanted, moving four weeks
 * because a flick was fast, or changing week on a tap that wobbled.
 */

import {
  CLAIM_DISTANCE,
  COMMIT_DISTANCE,
  COMMIT_VELOCITY,
  MAX_DRAG,
  claimsGesture,
  dragOffset,
  releaseAction,
} from '../weekSwipe';

describe('claiming the gesture', () => {
  it('takes a clearly horizontal drag', () => {
    expect(claimsGesture(40, 4)).toBe(true);
    expect(claimsGesture(-40, 4)).toBe(true);
  });

  it('leaves a vertical drag to the page', () => {
    // The routine screen scrolls. This is the case that would make it sticky.
    expect(claimsGesture(4, 40)).toBe(false);
    expect(claimsGesture(20, 60)).toBe(false);
  });

  it('leaves a diagonal to the page as well', () => {
    // Equal parts sideways and down is a scroll that drifted, not a swipe.
    expect(claimsGesture(30, 30)).toBe(false);
    expect(claimsGesture(30, 20)).toBe(false);
  });

  it('ignores the drift in a tap', () => {
    for (const dx of [0, 3, 8, CLAIM_DISTANCE]) {
      expect(claimsGesture(dx, 1)).toBe(false);
    }
    expect(claimsGesture(CLAIM_DISTANCE + 1, 1)).toBe(true);
  });
});

describe('following the finger', () => {
  it('trails it rather than sticking to it', () => {
    const offset = dragOffset(40, true);
    expect(offset).toBeGreaterThan(0);
    expect(offset).toBeLessThan(40);
  });

  it('never leaves its lane, however far the finger goes', () => {
    expect(dragOffset(1000, true)).toBe(MAX_DRAG);
    expect(dragOffset(-1000, true)).toBe(-MAX_DRAG);
  });

  it('resists at the present, where there is no next week', () => {
    // Forward is blocked; the edge should be felt rather than explained.
    const free = Math.abs(dragOffset(-60, true));
    const blocked = Math.abs(dragOffset(-60, false));
    expect(blocked).toBeGreaterThan(0);
    expect(blocked).toBeLessThan(free / 2);
  });

  it('still reaches back freely when forward is blocked', () => {
    expect(dragOffset(60, false)).toBe(dragOffset(60, true));
  });

  it('is centred when nothing has moved', () => {
    expect(dragOffset(0, true)).toBe(0);
  });
});

describe('letting go', () => {
  it('goes back a week when dragged right', () => {
    expect(releaseAction(COMMIT_DISTANCE + 1, 0, true)).toBe('previous');
  });

  it('comes forward a week when dragged left', () => {
    expect(releaseAction(-(COMMIT_DISTANCE + 1), 0, true)).toBe('next');
  });

  it('snaps back when the drag was too short', () => {
    expect(releaseAction(COMMIT_DISTANCE - 1, 0, true)).toBe('cancel');
    expect(releaseAction(-(COMMIT_DISTANCE - 1), 0, true)).toBe('cancel');
    expect(releaseAction(4, 0, true)).toBe('cancel');
  });

  it('accepts a quick flick that did not travel far', () => {
    expect(releaseAction(20, COMMIT_VELOCITY + 0.2, true)).toBe('previous');
    expect(releaseAction(-20, -(COMMIT_VELOCITY + 0.2), true)).toBe('next');
  });

  it('moves exactly one week however hard it is thrown', () => {
    /*
     * §9. Neither distance nor velocity is turned into a count — the result
     * is a single step or nothing. A gesture that skipped four weeks because
     * it was fast would leave someone somewhere they never chose.
     */
    for (const [dx, vx] of [
      [80, 0.4],
      [400, 3],
      [2000, 12],
    ]) {
      expect(releaseAction(dx, vx, true)).toBe('previous');
      expect(releaseAction(-dx, -vx, true)).toBe('next');
    }
  });

  it('refuses to move past the present', () => {
    expect(releaseAction(-200, -3, false)).toBe('cancel');
    // …while the past stays reachable.
    expect(releaseAction(200, 3, false)).toBe('previous');
  });

  it('treats a release with no travel as no direction', () => {
    // A stationary finger lifted with residual velocity is not a swipe.
    expect(releaseAction(0, 5, true)).toBe('cancel');
  });
});
