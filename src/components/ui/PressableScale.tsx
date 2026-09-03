import { useMemo, useRef, type PropsWithChildren } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { motion } from '../../theme/tokens';
import { useReducedMotion } from '../../theme/useReducedMotion';
import { vitaHaptic, type HapticEvent } from '../../lib/haptics';

type Props = PropsWithChildren<
  Omit<PressableProps, 'style' | 'onPressIn' | 'onPressOut'> & {
    style?: StyleProp<ViewStyle>;
    /** Scale while pressed. Keep subtle. Defaults to the control scale. */
    pressedScale?: number;
    /**
     * Fire a haptic when the press completes.
     *
     * Opt-in and unset everywhere it already existed, so no current control
     * gains a vibration it did not have. Pass it only where a press causes a
     * real state change — see `src/lib/haptics`, which is emphatic that this
     * does not belong on ordinary navigation.
     */
    haptic?: HapticEvent;
  }
>;

/**
 * The press response — VITA's one press feedback (Sprint 5 slice 5.1).
 *
 * Announces itself as a button whenever it actually does something. Without
 * the role, VoiceOver reads a `Button`'s or `ListRow`'s label as ordinary
 * text and never says it is actionable — the gap recorded during slice 3.6A.
 * A caller can still override the role for the rare non-button pressable.
 *
 * **Three things changed in 5.1, all of them centrally:**
 *
 * **It honours Reduced Motion.** It did not before, which made it the largest
 * remaining gap in the app's reduce-motion story — one component, but six
 * call sites, and the one a user touches most. A press still gives feedback
 * when motion is reduced; it is opacity rather than a spring, so the control
 * still answers the finger without anything moving.
 *
 * **Its spring and scale come from `motion` tokens** rather than the literals
 * that used to live here, so a press feels the same as every other press by
 * construction rather than by coincidence.
 *
 * **It can carry a haptic.** Opt-in, off by default, and routed through
 * `vitaHaptic` so the vocabulary stays in one place. It fires on `onPress` —
 * after the tap is committed — not on `onPressIn`, because a haptic is
 * confirmation that something happened, and a finger that slides off a button
 * has not made anything happen.
 *
 * **It composes with the caller's own opacity rather than replacing it**
 * (fixed in slice 5.2A). Adding the reduced-motion fade in 5.1 put an
 * `opacity` after the caller's `style` in the same array, which silently won
 * — so every control that dims itself through style stopped dimming.
 * `Button`'s disabled state is the one that mattered: a disabled button
 * rendered at full strength across the whole app while still refusing taps,
 * which is a control that lies about what it will do. The two opacities are
 * multiplied now, so a disabled control is dim and *also* fades on press.
 */
export function PressableScale({
  children,
  onPress,
  disabled,
  style,
  pressedScale = motion.pressScale.control,
  haptic,
  ...pressableProps
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  /**
   * Whatever opacity the caller asked for, multiplied by the press fade.
   * Flattened because `style` is routinely an array, and a caller's `opacity`
   * can sit in any element of it.
   */
  const baseOpacity = StyleSheet.flatten(style)?.opacity;
  const resolvedBase = typeof baseOpacity === 'number' ? baseOpacity : 1;
  const composedOpacity = useMemo(
    () => Animated.multiply(opacity, resolvedBase),
    [opacity, resolvedBase],
  );

  const springTo = (toValue: number) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: motion.pressSpring.speed,
      bounciness: motion.pressSpring.bounciness,
    }).start();

  /**
   * Reduced motion swaps the spring for a fade rather than dropping feedback
   * altogether. "Reduce motion" is a request about movement, not a request to
   * make controls feel dead — and a press with no acknowledgement at all
   * reads as a control that did not register the tap.
   */
  const press = (down: boolean) => {
    if (reducedMotion) {
      opacity.setValue(down ? 0.6 : 1);
      return;
    }
    springTo(down ? pressedScale : 1);
  };

  return (
    <Pressable
      onPress={
        onPress
          ? (event) => {
              if (haptic) vitaHaptic(haptic);
              onPress(event);
            }
          : undefined
      }
      disabled={disabled}
      accessibilityRole={onPress ? 'button' : undefined}
      onPressIn={() => press(true)}
      onPressOut={() => press(false)}
      {...pressableProps}
    >
      <Animated.View style={[style, { opacity: composedOpacity, transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
