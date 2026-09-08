import { Ionicons } from '@expo/vector-icons';
import { useRef, type PropsWithChildren } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { motion, radii, spacing, typography } from '../../../theme/tokens';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = PropsWithChildren<{
  label: string;
  arranging: boolean;
  /** Position in the current order, and how many there are. */
  index: number;
  total: number;
  onLongPress: () => void;
  onMove: (direction: -1 | 1) => void;
  onMeasure: (height: number) => void;
  onDragMove: (dy: number) => void;
  onDragEnd: (dy: number) => void;
}>;

/** Movement past this is a drag rather than a hesitation. */
const CLAIM = 8;

/**
 * One Fuel section, and the handle that moves it.
 *
 * ## Ordering only
 *
 * Home lets a widget be resized, hidden and reordered, because Home is a set
 * of independent domains with no single right arrangement. Fuel is one
 * workflow with a canonical hierarchy, so the only thing worth varying is
 * which part someone looks at first. There is no size control, no hide
 * control, and **no delete `×`** — a section is being moved, never removed.
 *
 * ## Drag is not the only way
 *
 * A vertical drag is unavailable to anyone navigating by flick, so every
 * section carries real **Move up** and **Move down** buttons in arrange
 * mode. They are not an accessibility afterthought bolted beside a gesture:
 * they and the drag resolve through the same `moveSection`/`reorderSection`
 * helpers, so the two can never disagree about what a step means.
 *
 * ## Motion stays out of the way
 *
 * The carried section lifts by opacity and follows the finger; the rest do
 * not animate at all. **Under Reduce Motion nothing translates** — the
 * buttons still work and the drag still commits, it simply lands rather than
 * travels. No jiggle: Home's belongs to a grid of widgets being rearranged,
 * and borrowing it here would be decoration.
 */
export function ArrangeableSection({
  label,
  arranging,
  index,
  total,
  onLongPress,
  onMove,
  onMeasure,
  onDragMove,
  onDragEnd,
  children,
}: Props) {
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();
  const translateY = useRef(new Animated.Value(0)).current;

  const handlers = useRef({ arranging, reducedMotion, onDragMove, onDragEnd });
  handlers.current = { arranging, reducedMotion, onDragMove, onDragEnd };

  const responder = useRef(
    PanResponder.create({
      // A touch is a press until it travels, so everything inside a section
      // keeps working while arrange mode is off.
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_event, gesture) =>
        handlers.current.arranging &&
        Math.abs(gesture.dy) > CLAIM &&
        Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (_event, gesture) => {
        if (!handlers.current.reducedMotion) translateY.setValue(gesture.dy);
        handlers.current.onDragMove(gesture.dy);
      },

      onPanResponderRelease: (_event, gesture) => {
        translateY.setValue(0);
        handlers.current.onDragEnd(gesture.dy);
      },

      onPanResponderTerminate: () => {
        translateY.setValue(0);
        handlers.current.onDragEnd(0);
      },
    }),
  ).current;

  return (
    <Animated.View
      {...(arranging ? responder.panHandlers : {})}
      onLayout={(event) => onMeasure(event.nativeEvent.layout.height)}
      style={[
        styles.section,
        arranging && [styles.arranging, { borderColor: surfaces.border }],
        { transform: [{ translateY }] },
      ]}
    >
      {arranging ? (
        <View style={styles.handle}>
          <Ionicons name="reorder-two-outline" size={18} color={surfaces.textTertiary} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]} numberOfLines={1}>
            {label}
          </Text>

          <Pressable
            onPress={() => onMove(-1)}
            disabled={index === 0}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Move ${label} up`}
            style={({ pressed }) => [styles.move, index === 0 && styles.disabled, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-up" size={17} color={surfaces.text} />
          </Pressable>

          <Pressable
            onPress={() => onMove(1)}
            disabled={index === total - 1}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Move ${label} down`}
            style={({ pressed }) => [
              styles.move,
              index === total - 1 && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-down" size={17} color={surfaces.text} />
          </Pressable>
        </View>
      ) : null}

      <Pressable
        onLongPress={onLongPress}
        delayLongPress={450}
        /* The section itself is not a button — this exists only to catch the
           hold that opens arrange mode, so it takes no role and no label. */
        accessible={false}
        style={arranging ? styles.dimmed : undefined}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    // Nothing in the resting state: sections are direct on the background,
    // and only arrange mode gives them an outline to grab.
  },
  arranging: {
    borderWidth: 1,
    borderRadius: radii.control,
    padding: spacing.m,
  },
  handle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingBottom: spacing.s,
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.6,
    fontWeight: '600',
    flex: 1,
  },
  move: {
    padding: spacing.xs,
  },
  disabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
  dimmed: {
    // The content is context while arranging, not the subject.
    opacity: 0.55,
  },
});

export const ARRANGE_SPRING = motion.pressSpring;
