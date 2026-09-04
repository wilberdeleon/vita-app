import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { PressableScale, VitaSheet } from '../../../components/ui';
import { vitaHaptic } from '../../../lib/haptics';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import {
  DEFAULT_LAYOUT,
  MODULE_REGISTRY,
  isHidden,
  moveModule,
  reorderModule,
  setModuleSize,
  sizeOf,
  toggleModule,
  type DashboardLayout,
  type DashboardModuleId,
  type ModuleSize,
} from '../modules';

type Props = {
  visible: boolean;
  layout: DashboardLayout;
  onChange: (next: DashboardLayout) => void;
  onClose: () => void;
};

/** Every row is the same height, which is what makes the drag arithmetic exact. */
const ROW_HEIGHT = 64;

const SIZE_LABELS: Record<ModuleSize, string> = { square: 'Square', wide: 'Wide' };

/**
 * Customize Home — show, hide, resize, reorder.
 *
 * **Drag, with no new dependency.** The founders asked to rearrange modules
 * naturally, and the audit found neither `react-native-gesture-handler` nor
 * `react-native-reanimated` installed. Adding two native dependencies to
 * reorder five rows was not justifiable, and it was not necessary: the drag
 * here changes *order* in a single-column list of uniform-height rows, which
 * `PanResponder` and `Animated` — both React Native core — do exactly. The
 * grid then derives placement from order and span, so nothing stores a
 * position that could disagree with what the user sees.
 *
 * **The buttons stayed.** Move up and move down are not a fallback that lost
 * to drag; they are the accessible path, and they remain the only way this
 * works for someone using VoiceOver or a switch. A gesture-only reorder would
 * be unusable by exactly the people who most need a customisable Home.
 *
 * **Size is offered only where a real design exists.** Quick Tools and
 * Today's Schedule are wide-only and say so by having no control, rather than
 * offering a square that would be the wide layout squeezed.
 *
 * Changes apply and persist as they are made — there is no Save button, so
 * closing the sheet cannot lose anything.
 */
export function CustomizeHomeSheet({ visible, layout, onChange, onClose }: Props) {
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  /** The row being dragged, and how far it has travelled. */
  const [dragging, setDragging] = useState<DashboardModuleId | null>(null);
  const drag = useRef(new Animated.Value(0)).current;

  /**
   * Live state is read through refs because the responder closures are
   * created once per row. Reading `layout` directly would give the drag a
   * stale order the moment anything else changed.
   */
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const offsetRef = useRef(0);

  const responders = useMemo(
    () =>
      layout.order.map((id) =>
        PanResponder.create({
          // Only a deliberate vertical movement starts a drag, so the sheet
          // can still be scrolled and the row can still be tapped.
          onMoveShouldSetPanResponder: (_event, gesture) => Math.abs(gesture.dy) > 6,
          onPanResponderGrant: () => {
            setDragging(id);
            offsetRef.current = 0;
            drag.setValue(0);
            vitaHaptic('selection');
          },
          onPanResponderMove: (_event, gesture) => {
            drag.setValue(gesture.dy);

            /*
             * Reorder as the row passes each neighbour rather than only on
             * release, so the list shows the result while the finger is still
             * down. `offsetRef` tracks how many places it has already moved,
             * so the value the row is translated by stays relative to where
             * it now sits.
             */
            const current = layoutRef.current;
            const from = current.order.indexOf(id);
            const shift = Math.round((gesture.dy - offsetRef.current) / ROW_HEIGHT);
            if (shift === 0) return;

            const to = Math.max(0, Math.min(current.order.length - 1, from + shift));
            if (to === from) return;

            offsetRef.current += (to - from) * ROW_HEIGHT;
            drag.setValue(gesture.dy - offsetRef.current);
            vitaHaptic('selection');
            onChange(reorderModule(current, from, to));
          },
          onPanResponderRelease: () => {
            setDragging(null);
            offsetRef.current = 0;
            if (reducedMotion) {
              drag.setValue(0);
              return;
            }
            Animated.timing(drag, { toValue: 0, duration: 180, useNativeDriver: true }).start();
          },
          onPanResponderTerminate: () => {
            setDragging(null);
            offsetRef.current = 0;
            drag.setValue(0);
          },
        }),
      ),
    [layout.order, drag, onChange, reducedMotion],
  );

  return (
    <VitaSheet visible={visible} onClose={onClose} title="Customize Home">
      <Text style={[styles.intro, { color: surfaces.textTertiary }]}>
        Choose which sections appear, how big they are, and their order. Drag a handle to move one,
        or use the arrows.
      </Text>

      <View style={styles.list}>
        {layout.order.map((id, index) => {
          const hidden = isHidden(layout, id);
          const meta = MODULE_REGISTRY[id];
          const label = meta.label;
          const size = sizeOf(layout, id);
          const isDragging = dragging === id;

          return (
            <Animated.View
              key={id}
              style={[
                styles.row,
                index > 0 && styles.divided,
                index > 0 && { borderTopColor: surfaces.border },
                isDragging && {
                  transform: [{ translateY: drag }],
                  backgroundColor: surfaces.card,
                  borderRadius: radii.control,
                  zIndex: 2,
                },
              ]}
            >
              <PressableScale
                onPress={() => {
                  vitaHaptic('selection');
                  onChange(toggleModule(layout, id));
                }}
                hitSlop={6}
                accessibilityLabel={hidden ? `Show ${label}` : `Hide ${label}`}
                accessibilityState={{ checked: !hidden }}
                style={styles.toggle}
              >
                <Ionicons
                  name={hidden ? 'ellipse-outline' : 'checkmark-circle'}
                  size={22}
                  color={hidden ? surfaces.textTertiary : surfaces.text}
                />
              </PressableScale>

              <View style={styles.text}>
                <Text
                  style={[styles.label, { color: hidden ? surfaces.textTertiary : surfaces.text }]}
                  numberOfLines={1}
                >
                  {label}
                </Text>

                {meta.sizes.length > 1 ? (
                  <View style={styles.sizes}>
                    {meta.sizes.map((option) => {
                      const selected = size === option;
                      return (
                        <PressableScale
                          key={option}
                          onPress={() => {
                            vitaHaptic('selection');
                            onChange(setModuleSize(layout, id, option));
                          }}
                          hitSlop={4}
                          accessibilityLabel={`${label}, ${SIZE_LABELS[option]}`}
                          accessibilityState={{ selected }}
                          style={[
                            styles.sizeChip,
                            { borderColor: surfaces.border },
                            selected && { backgroundColor: surfaces.text, borderColor: surfaces.text },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sizeLabel,
                              { color: selected ? surfaces.background : surfaces.textSecondary },
                            ]}
                          >
                            {SIZE_LABELS[option]}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={[styles.fixed, { color: surfaces.textTertiary }]}>Wide</Text>
                )}
              </View>

              <View style={styles.moves}>
                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(moveModule(layout, id, 'up'));
                  }}
                  disabled={index === 0}
                  hitSlop={6}
                  accessibilityLabel={`Move ${label} up`}
                  style={[styles.move, index === 0 && styles.disabled]}
                >
                  <Ionicons name="chevron-up" size={17} color={surfaces.textSecondary} />
                </PressableScale>

                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(moveModule(layout, id, 'down'));
                  }}
                  disabled={index === layout.order.length - 1}
                  hitSlop={6}
                  accessibilityLabel={`Move ${label} down`}
                  style={[styles.move, index === layout.order.length - 1 && styles.disabled]}
                >
                  <Ionicons name="chevron-down" size={17} color={surfaces.textSecondary} />
                </PressableScale>

                {/*
                  * The drag handle. Not the only way to reorder — the arrows
                  * above are, for anyone not using a pointer — so it carries
                  * no accessibility role of its own.
                  */}
                <View
                  {...responders[index].panHandlers}
                  style={styles.handle}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Ionicons name="reorder-three-outline" size={20} color={surfaces.textTertiary} />
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.note, { color: surfaces.textTertiary }]}>
          The VITA header, greeting and Settings always stay.
        </Text>

        <PressableScale
          onPress={() => {
            vitaHaptic('selection');
            onChange(DEFAULT_LAYOUT);
          }}
          hitSlop={8}
          accessibilityLabel="Reset Home layout to default"
          style={styles.reset}
        >
          <Text style={[styles.resetLabel, { color: surfaces.textSecondary }]}>Reset Layout</Text>
        </PressableScale>
      </View>
    </VitaSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
    marginTop: spacing.m,
  },
  list: {
    marginTop: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
    height: ROW_HEIGHT,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggle: {
    minWidth: 26,
    alignItems: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    ...typography.bodyMedium,
  },
  sizes: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sizeChip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: 3,
  },
  sizeLabel: {
    ...typography.micro,
    fontWeight: '600',
  },
  fixed: {
    ...typography.micro,
  },
  moves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  move: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  footer: {
    marginTop: spacing.l,
    gap: spacing.m,
  },
  note: {
    ...typography.caption,
  },
  reset: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  resetLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
