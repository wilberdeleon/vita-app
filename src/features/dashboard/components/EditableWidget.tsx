import { Ionicons } from "@expo/vector-icons";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PropsWithChildren,
} from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type LayoutRectangle,
} from "react-native";
import { PressableScale } from "../../../components/ui";
import { motion, spacing } from "../../../theme/tokens";
import { useTheme } from "../../../theme/ThemeProvider";
import { useReducedMotion } from "../../../theme/useReducedMotion";
import type { DashboardModuleId } from "../modules";

type Props = PropsWithChildren<{
  id: DashboardModuleId;
  /** Spoken name, e.g. `Water`. */
  label: string;
  editing: boolean;
  /**
   * This widget's translation from where it is rendered.
   *
   * Owned by the grid, not by this component: while a drag is in flight the
   * dragged widget's offset follows the finger and every other widget's is
   * animated toward the slot the candidate order would give it. One value
   * serves both, because they are the same thing — where this widget appears
   * versus where it currently sits in the tree.
   */
  offset: Animated.ValueXY;
  /** True for the one widget under the finger. */
  dragging: boolean;
  /**
   * Enters edit mode. Also passed by the route into the feature modules
   * themselves — see below for why one handler needs two homes.
   */
  onLongPress: () => void;
  onRemove: () => void;
  /** Where this cell sits on screen, so a drop can be resolved against its neighbours. */
  onMeasure: (id: DashboardModuleId, rect: LayoutRectangle) => void;
  onDragStart: (id: DashboardModuleId) => void;
  onDragMove: (id: DashboardModuleId, dx: number, dy: number) => void;
  onDragEnd: (id: DashboardModuleId, dx: number, dy: number) => void;
  onDragCancel: (id: DashboardModuleId) => void;
}>;

/** Rotation is kept under half a degree — a hint of movement, not a wobble. */
const JIGGLE_DEGREES = 0.45;
const JIGGLE_MS = 130;

/** Movement before a touch becomes a drag rather than a press. */
const DRAG_SLOP = 8;

/** The lift. Enough to read as "picked up", well short of a zoom. */
const LIFT_SCALE = 1.03;

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
 * because the remove controls are what actually carry the state. That is the
 * rule the design system states: no meaning may depend on animation.
 *
 * ## The drag is live (slice 5.3D)
 *
 * 5.3C committed the reorder on release, and the founders' review was that it
 * felt static — you could not see where a widget would land until you let go.
 * Now the widget lifts, follows the finger, and its neighbours glide toward
 * the positions the candidate order gives them **while the finger is still
 * down**; release settles it into the slot it is already sitting over.
 *
 * **Nothing about the layout changes mid-drag.** The rendered order is frozen
 * for the whole gesture and every widget is translated instead — re-rendering
 * the grid would move the dragged widget's own cell out from under the
 * gesture. The arithmetic lives in `dragLayout.ts`, kept pure so the reflow
 * can be tested without a device that can drag; this component owns only the
 * gesture and the lift.
 */
export function EditableWidget({
  id,
  label,
  editing,
  offset,
  dragging,
  onLongPress,
  onRemove,
  onMeasure,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragCancel,
  children,
}: Props) {
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  const jiggle = useRef(new Animated.Value(0)).current;
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
  // one frame; see the note in `dragLayout.ts`.
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
        Animated.timing(jiggle, {
          toValue: 1,
          duration: JIGGLE_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(jiggle, {
          toValue: -1,
          duration: JIGGLE_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [editing, reducedMotion, jiggle]);

  /*
   * The lift. Reduced Motion still gets the emphasis — a widget being carried
   * has to look different from the ones it is moving past — it simply arrives
   * without travelling.
   */
  useEffect(() => {
    if (reducedMotion) {
      lift.setValue(dragging ? 1 : 0);
      return;
    }
    Animated.timing(lift, {
      toValue: dragging ? 1 : 0,
      duration: motion.duration.state,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [dragging, reducedMotion, lift]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Only while editing, and only for a deliberate movement — so a tap
        // still opens the feature when Home is not being rearranged.
        onMoveShouldSetPanResponder: (_event, gesture) =>
          editingRef.current &&
          (Math.abs(gesture.dx) > DRAG_SLOP ||
            Math.abs(gesture.dy) > DRAG_SLOP),
        onPanResponderGrant: () => onDragStart(id),
        /*
         * Written by hand rather than through `Animated.event` so the widget
         * and the candidate order are updated from the same gesture frame —
         * the reflow must never lag the finger by an event.
         */
        onPanResponderMove: (_event, gesture) => {
          offset.setValue({ x: gesture.dx, y: gesture.dy });
          onDragMove(id, gesture.dx, gesture.dy);
        },
        onPanResponderRelease: (_event, gesture) =>
          onDragEnd(id, gesture.dx, gesture.dy),
        onPanResponderTerminate: () => onDragCancel(id),
      }),
    [id, offset, onDragStart, onDragMove, onDragEnd, onDragCancel],
  );

  const rotate = jiggle.interpolate({
    inputRange: [-1, 1],
    outputRange: [`-${JIGGLE_DEGREES}deg`, `${JIGGLE_DEGREES}deg`],
  });
  const scale = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [1, LIFT_SCALE],
  });
  const shadowOpacity = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.22],
  });

  return (
    <Animated.View
      style={[
        styles.root,
        {
          /*
           * Position and lift only. The jiggle rotates a *nested* view rather
           * than joining this array: a transform array is either JS-driven or
           * native-driven, and these values must be JS-driven — the offset is
           * written from the gesture and the shadow cannot be native at all.
           * Nesting lets the one continuously looping animation keep the
           * native driver while everything here stays on the JS side.
           */
          transform: [
            { translateX: offset.x },
            { translateY: offset.y },
            { scale },
          ],
          // Raised over its neighbours so a widget crossing them reads as
          // being carried rather than tunnelling underneath.
          zIndex: dragging ? 5 : 1,
          shadowColor: "#000000",
          shadowOpacity,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        },
      ]}
      ref={root}
      /* Lets a test supply the rectangle this widget would measure on a
         device; `measureInWindow` returns nothing without a real host view. */
      testID={`dashboard-widget-${id}`}
      onLayout={measure}
      {...(editing ? responder.panHandlers : {})}
    >
      {/* The carried widget holds still; the jiggle is what marks the ones it
          is moving past as movable too. */}
      <Animated.View
        style={[
          styles.fill,
          { transform: [{ rotate: editing && !dragging ? rotate : "0deg" }] },
        ]}
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
      </Animated.View>

      {editing ? (
        <PressableScale
          style={[
            styles.remove,
            {
              backgroundColor: surfaces.background,
              borderColor: surfaces.border,
            },
          ]}
          onPress={() => onRemove()}
          haptic="selection"
          /*
           * `hitSlop` carries the 28pt badge past the 44pt minimum without
           * drawing a control that large over the widget's own corner.
           */
          hitSlop={9}
          /* "Remove from Home", never "Delete" — nothing is destroyed, and the
             widget comes straight back from Customize Home. */
          accessibilityLabel={`Remove ${label} from Home`}
        >
          <Ionicons name="close" size={15} color={surfaces.text} />
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
    position: "absolute",
    /*
     * Top-right, straddling the corner (founder ruling, 5.3D; it was
     * top-left in 5.3C). That is where every home screen puts it, and the
     * corner is the one part of a VITA widget that never carries content —
     * the feature label sits top-left and the action runs along the bottom —
     * so nothing is covered.
     */
    top: -spacing.s,
    right: -spacing.s,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
});
