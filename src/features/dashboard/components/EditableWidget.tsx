import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, type PropsWithChildren } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type LayoutRectangle,
} from 'react-native';
import { PressableScale } from '../../../components/ui';
import { vitaHaptic } from '../../../lib/haptics';
import { spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import type { DashboardModuleId } from '../modules';

type Props = PropsWithChildren<{
  id: DashboardModuleId;
  /** Spoken name, e.g. `Water`. */
  label: string;
  editing: boolean;
  /**
   * Enters edit mode. Also passed by the route into the feature modules
   * themselves — see below for why one handler needs two homes.
   */
  onLongPress: () => void;
  onRemove: () => void;
  /** Where this cell sits on screen, so a drop can be resolved against its neighbours. */
  onMeasure: (id: DashboardModuleId, rect: LayoutRectangle) => void;
  /** Resolves the drop: the module the finger ended over, or null. */
  onDrop: (id: DashboardModuleId, dx: number, dy: number) => void;
}>;

/** Rotation is kept under half a degree — a hint of movement, not a wobble. */
const JIGGLE_DEGREES = 0.45;
const JIGGLE_MS = 130;

/**
 * A Dashboard widget you can hold, move and remove.
 *
 * ## Edit mode is entered by holding a widget, as on a home screen
 *
 * A long press is the gesture people already know for "I want to rearrange
 * this", and it costs no permanent chrome — Home carries no edit button
 * competing with its content. The sheet is still there for everything a
 * gesture cannot do.
 *
 * **It is deliberately wired in two places.** React Native hands the
 * responder to the *innermost* pressable, so a hold that lands on Water's own
 * square is Water's to handle, and a wrapper above it would never see the
 * gesture; the route therefore passes `onLongPress` into those modules too,
 * where `Pressable` also suppresses the tap on release so holding a widget
 * cannot both rearrange Home and open the feature. The wrapper here catches
 * the rest: the wide utility sections, whose backgrounds are plain views, and
 * the space around a module's inner controls. One handler, both paths.
 *
 * The obvious-looking alternative — one transparent overlay over each widget
 * — cannot work: an overlay that can receive a hold also receives every tap,
 * so Add, Log and the tool tiles would all stop responding.
 *
 * ## The jiggle is deliberately almost nothing
 *
 * Under half a degree, alternating. Enough to say *these are movable*, far
 * short of the cartoon wobble the brief ruled out. **Under Reduced Motion it
 * does not run at all** — and edit mode stays perfectly legible without it,
 * because the remove controls and the outline are what actually carry the
 * state. That is the rule the design system states: no meaning may depend on
 * animation.
 *
 * ## Dropping, not live reflowing
 *
 * The widget follows the finger and the order changes **on release**, once,
 * against the measured cell rectangles. Reordering continuously mid-drag
 * would mean recomputing the grid, re-measuring every cell and compensating
 * the gesture baseline on every crossing — several chances to get a swap
 * subtly wrong in an environment where the gesture cannot be tested by hand.
 * Dropping is one decision from one final position, it is straightforward to
 * verify, and it still produces exactly the outcome asked for: hold Peptides,
 * move it over Water, release, and the two trade places.
 *
 * A drop needs the finger to end inside another widget's rectangle, so small
 * movements settle back rather than shuffling the screen.
 *
 * ## Measuring in window coordinates, and why scrolling cannot break it
 *
 * `onLayout` reports a position relative to the parent cell, which is useless
 * for comparing widgets in different rows, so each widget measures itself with
 * `measureInWindow` — and re-measures the moment edit mode is entered, so
 * every rectangle is captured in the same frame at the same scroll offset.
 * Because the drag delta is applied to the dragged widget's own stored
 * rectangle, a comparison between rectangles from that one frame stays correct
 * even if the whole list sat at a different scroll position when it was first
 * laid out: everything shifted together.
 */
export function EditableWidget({
  id,
  label,
  editing,
  onLongPress,
  onRemove,
  onMeasure,
  onDrop,
  children,
}: Props) {
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  const jiggle = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lift = useRef(new Animated.Value(0)).current;

  const editingRef = useRef(editing);
  editingRef.current = editing;

  const root = useRef<View | null>(null);
  const measure = useCallback(() => {
    root.current?.measureInWindow((x, y, width, height) => {
      if (width === 0 && height === 0) return;
      onMeasure(id, { x, y, width, height });
    });
  }, [id, onMeasure]);

  // Re-measured on entering edit mode so every widget's rectangle comes from
  // one frame; see the note above.
  useEffect(() => {
    if (editing) measure();
  }, [editing, measure]);

  useEffect(() => {
    if (!editing || reducedMotion) {
      jiggle.stopAnimation();
      jiggle.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(jiggle, { toValue: 1, duration: JIGGLE_MS, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(jiggle, { toValue: -1, duration: JIGGLE_MS, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [editing, reducedMotion, jiggle]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Only while editing, and only for a deliberate movement — so a tap
        // still opens the feature when Home is not being rearranged.
        onMoveShouldSetPanResponder: (_event, gesture) =>
          editingRef.current && (Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8),
        onPanResponderGrant: () => {
          vitaHaptic('selection');
          Animated.timing(lift, { toValue: 1, duration: 120, useNativeDriver: true }).start();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
        onPanResponderRelease: (_event, gesture) => {
          onDrop(id, gesture.dx, gesture.dy);
          pan.setValue({ x: 0, y: 0 });
          Animated.timing(lift, { toValue: 0, duration: 120, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () => {
          pan.setValue({ x: 0, y: 0 });
          lift.setValue(0);
        },
      }),
    [id, onDrop, pan, lift],
  );

  const rotate = jiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${JIGGLE_DEGREES}deg`, `${JIGGLE_DEGREES}deg`],
  });
  const scale = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <Animated.View
      style={[
        styles.root,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: editing ? rotate : '0deg' },
            { scale },
          ],
        },
      ]}
      ref={root}
      onLayout={measure}
      {...(editing ? responder.panHandlers : {})}
    >
      {/*
        * Catches holds that no inner pressable claimed. It is not an
        * accessible control: a hold is unreachable with VoiceOver anyway, and
        * Customize Home is the accessible route to everything edit mode does.
        */}
      <Pressable
        style={styles.fill}
        onLongPress={onLongPress}
        delayLongPress={450}
        disabled={editing}
        accessible={false}
        importantForAccessibility="no"
      >
        {children}
      </Pressable>

      {/*
        * While editing, a transparent layer sits over the module so its own
        * buttons cannot fire — a tap meant to grab a widget must not open
        * Water or log food. It sets no responder itself, so the drag handler
        * on the container still receives the gesture, and the remove control
        * below is rendered above it and stays live.
        */}
      {editing ? (
        <View
          style={StyleSheet.absoluteFill}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}

      {editing ? (
        <PressableScale
          style={[styles.remove, { backgroundColor: surfaces.background, borderColor: surfaces.border }]}
          onPress={() => {
            vitaHaptic('selection');
            onRemove();
          }}
          hitSlop={10}
          /* "Remove from Home", never "Delete" — nothing is destroyed, and the
             widget comes straight back from Customize Home. */
          accessibilityLabel={`Remove ${label} from Home`}
        >
          <Ionicons name="close" size={14} color={surfaces.text} />
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  remove: {
    position: 'absolute',
    top: -spacing.s,
    left: -spacing.s,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
});
