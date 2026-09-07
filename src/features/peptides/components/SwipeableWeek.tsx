import { useRef, type PropsWithChildren } from 'react';
import { Animated, PanResponder, StyleSheet } from 'react-native';
import { motion } from '../../../theme/tokens';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import { claimsGesture, dragOffset, releaseAction } from '../weekSwipe';

/** How far the outgoing week slides before the new one settles in. */
const SETTLE_OUT = 28;

type Props = PropsWithChildren<{
  onPrevious: () => void;
  /** `undefined` when there is no next week — the present is the boundary. */
  onNext?: () => void;
}>;

/**
 * Horizontal swipe over the week strip — drag it like a timeline.
 *
 * ## Why a gesture at all
 *
 * The arrows work and are staying (§5), but stepping back three weeks meant
 * three deliberate taps on a 32pt target. The founder's note was that a week
 * strip *looks* like something you should be able to push sideways, and it
 * was not. Dragging right reaches back into the past, dragging left comes
 * forward, which is the direction a calendar moves under a finger.
 *
 * ## Sharing the screen with a vertical scroll
 *
 * The routine screen scrolls, and the cells underneath are real buttons, so
 * this has to be the *third* claimant on every touch and win only when the
 * intent is unmistakable. It claims in the **capture** phase, because a
 * `Pressable` becomes the responder the moment a finger lands and a parent
 * can only take it back on the way down — and it claims solely when the
 * movement is past {@link CLAIM_DISTANCE} and {@link DIRECTION_RATIO} times
 * more horizontal than vertical. A tap never moves that far; a scroll is
 * never that sideways.
 *
 * Once it has the gesture it refuses termination, so a scroll view cannot
 * take a swipe back out from under the finger halfway through.
 *
 * ## One swipe is one week
 *
 * Deliberately not proportional to distance or velocity (§9): a fast flick
 * moves one week, exactly like a slow drag that crosses the threshold. A
 * gesture that skipped four weeks because it was thrown would leave someone
 * somewhere they did not choose, and the arrows exist for precision anyway.
 *
 * ## The drag is visible, and the settle is small
 *
 * The strip follows the finger — damped, and capped at {@link MAX_DRAG} so it
 * stays in its lane — then either slides a little further and returns with
 * the new week, or springs back to where it was. Motion confirms; it does not
 * perform. **Under Reduce Motion the week simply changes**, with no travel at
 * all, which is the app-wide rule: land on the final state rather than play a
 * shorter animation.
 */
export function SwipeableWeek({ onPrevious, onNext, children }: PropsWithChildren<Props>) {
  const reducedMotion = useReducedMotion();
  const translateX = useRef(new Animated.Value(0)).current;

  /*
   * Read inside the responder callbacks, which are created once. A ref keeps
   * them looking at the current props rather than at the first render's.
   */
  const handlers = useRef({ onPrevious, onNext, reducedMotion });
  handlers.current = { onPrevious, onNext, reducedMotion };

  const responder = useRef(
    PanResponder.create({
      // A touch is a tap until it proves otherwise — the day cells underneath
      // are buttons and must keep receiving presses.
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        claimsGesture(gesture.dx, gesture.dy),

      // Having claimed a horizontal swipe, keep it: a scroll view asking for
      // the gesture mid-drag would strand the strip part-way.
      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (_event, gesture) => {
        const { onNext: next, reducedMotion: reduced } = handlers.current;
        if (reduced) return;

        translateX.setValue(dragOffset(gesture.dx, next !== undefined));
      },

      onPanResponderRelease: (_event, gesture) => {
        const { onPrevious: previous, onNext: next, reducedMotion: reduced } = handlers.current;

        const action = releaseAction(gesture.dx, gesture.vx, next !== undefined);
        const backwards = action === 'previous';
        const change = action === 'previous' ? previous : action === 'next' ? next : undefined;

        if (!change) {
          if (reduced) {
            translateX.setValue(0);
            return;
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: motion.pressSpring.speed,
            bounciness: 0,
          }).start();
          return;
        }

        if (reduced) {
          translateX.setValue(0);
          change();
          return;
        }

        const direction = backwards ? 1 : -1;
        Animated.timing(translateX, {
          toValue: direction * SETTLE_OUT,
          duration: motion.duration.press,
          useNativeDriver: true,
        }).start(() => {
          change();
          // The new week arrives from the side the old one left towards.
          translateX.setValue(-direction * SETTLE_OUT);
          Animated.timing(translateX, {
            toValue: 0,
            duration: motion.duration.state,
            useNativeDriver: true,
          }).start();
        });
      },

      onPanResponderTerminate: () => {
        translateX.setValue(0);
      },
    }),
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[styles.week, { transform: [{ translateX }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  week: {
    // The drag is clipped to its own lane, so a week never appears to slide
    // over the sections either side of it.
    overflow: 'hidden',
  },
});
