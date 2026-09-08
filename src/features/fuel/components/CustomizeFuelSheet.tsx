import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { PressableScale, VitaSheet } from '../../../components/ui';
import { vitaHaptic } from '../../../lib/haptics';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import {
  FUEL_SECTION_REGISTRY,
  defaultFuelLayout,
  isSectionHidden,
  moveSection,
  reorderSection,
  sectionSize,
  setSectionSize,
  targetIndexFor,
  toggleSection,
  type FuelLayout,
  type FuelSection,
  type FuelSectionSize,
} from '../sections';

type Props = {
  visible: boolean;
  layout: FuelLayout;
  onChange: (next: FuelLayout) => void;
  onClose: () => void;
};

const SIZE_LABELS: Record<FuelSectionSize, string> = { square: 'Square', wide: 'Wide' };

/** Movement past this is a drag rather than a tap that wandered. */
const CLAIM = 6;

/**
 * Customize Fuel — which optional sections appear, in what order, and the two
 * that can change shape.
 *
 * ## The same language as Customize Home, not the same model
 *
 * The founder asked for Home's customisation experience, and this borrows its
 * vocabulary deliberately: a list of rows, a visibility check on the left,
 * Square / Wide chips, arrows, a drag handle, Reset Layout at the foot. Someone
 * who has arranged Home already knows how to work this.
 *
 * What it does **not** borrow is Home's data model. Fuel's customisation is
 * narrower on purpose — see `sections.ts`:
 *
 * - **Nutrition and Meals cannot be hidden.** They are the feature. A screen
 *   you can empty until it no longer logs food is a screen that can be broken
 *   by accident, and the way back would be through this sheet, which the user
 *   would have to already know exists.
 * - **Only Water and Peptides offer a size**, because only they have two real
 *   designs. The other three say `Wide` as a quiet subtitle rather than as a
 *   chip that does nothing — an inert control is worse than no control.
 * - **There is no delete `×`.** Hiding is reversible in place and says so;
 *   removal implies a list of removed things to go and find.
 *
 * ## Why the drag commits on release rather than reflowing live
 *
 * Home's sheet reorders as the finger passes each neighbour, which it can do
 * because every one of its rows is exactly the same height. These rows are
 * not: a size control makes one taller than a row without one, and at
 * accessibility text sizes the labels wrap to different line counts. So the
 * drag measures what is actually on screen and resolves through
 * `targetIndexFor` — the same helper the in-page arrange gesture uses, so the
 * two cannot disagree — and lands once. The arrows move a row immediately, so
 * nothing about the sheet depends on being able to drag.
 *
 * Changes apply and persist as they are made. There is no Save button, so
 * closing the sheet cannot lose anything.
 */
export function CustomizeFuelSheet({ visible, layout, onChange, onClose }: Props) {
  const { surfaces } = useTheme();
  const reducedMotion = useReducedMotion();

  const [dragging, setDragging] = useState<FuelSection | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  /**
   * Measured row heights and the live layout, held in refs because a
   * responder's closures are created once per row: reading either from the
   * render that created them would give the drag a stale list.
   */
  const heights = useRef<Partial<Record<FuelSection, number>>>({});
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const responders = useMemo(
    () =>
      layout.order.map((id) =>
        PanResponder.create({
          onMoveShouldSetPanResponder: (_event, gesture) =>
            Math.abs(gesture.dy) > CLAIM && Math.abs(gesture.dy) > Math.abs(gesture.dx),
          onPanResponderGrant: () => {
            setDragging(id);
            translateY.setValue(0);
            vitaHaptic('selection');
          },
          onPanResponderMove: (_event, gesture) => {
            if (!reducedMotion) translateY.setValue(gesture.dy);
          },
          onPanResponderRelease: (_event, gesture) => {
            setDragging(null);
            translateY.setValue(0);

            const current = layoutRef.current;
            const ordered = current.order.map((section) => heights.current[section] ?? 0);
            const from = current.order.indexOf(id);
            const to = targetIndexFor(ordered, from, gesture.dy);
            if (to !== from) {
              vitaHaptic('selection');
              onChange(reorderSection(current, id, to));
            }
          },
          onPanResponderTerminate: () => {
            setDragging(null);
            translateY.setValue(0);
          },
        }),
      ),
    [layout.order, onChange, reducedMotion, translateY],
  );

  return (
    <VitaSheet visible={visible} onClose={onClose} title="Customize Fuel">
      <Text style={[styles.intro, { color: surfaces.textTertiary }]}>
        Choose which sections appear and their order. Water and Peptides can be square or wide.
      </Text>

      <View style={styles.list}>
        {layout.order.map((id, index) => {
          const meta = FUEL_SECTION_REGISTRY[id];
          const hidden = isSectionHidden(layout, id);
          const size = sectionSize(layout, id);
          const isDragging = dragging === id;
          const resizable = meta.sizes.length > 1;

          return (
            <Animated.View
              key={id}
              onLayout={(event) => {
                heights.current[id] = event.nativeEvent.layout.height;
              }}
              style={[
                styles.row,
                index > 0 && styles.divided,
                index > 0 && { borderTopColor: surfaces.border },
                isDragging && {
                  transform: [{ translateY }],
                  backgroundColor: surfaces.card,
                  borderRadius: radii.control,
                  zIndex: 2,
                },
              ]}
            >
              {meta.hideable ? (
                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(toggleSection(layout, id));
                  }}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={hidden ? `Show ${meta.label}` : `Hide ${meta.label}`}
                  accessibilityState={{ checked: !hidden }}
                  style={styles.toggle}
                >
                  <Ionicons
                    name={hidden ? 'ellipse-outline' : 'checkmark-circle'}
                    size={22}
                    color={hidden ? surfaces.textTertiary : surfaces.text}
                  />
                </PressableScale>
              ) : (
                /*
                 * Not a disabled toggle: a control that looks pressable and
                 * refuses is worse than none. This is a mark, and the row's
                 * subtitle says in words why it cannot be turned off.
                 */
                <View
                  style={styles.toggle}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Ionicons name="checkmark-circle" size={22} color={surfaces.textTertiary} />
                </View>
              )}

              <View style={styles.text}>
                <Text
                  style={[styles.label, { color: hidden ? surfaces.textTertiary : surfaces.text }]}
                  accessible
                  accessibilityRole="text"
                  accessibilityLabel={`${meta.label}, ${hidden ? 'hidden' : 'visible'}, ${
                    SIZE_LABELS[size]
                  }, position ${index + 1} of ${layout.order.length}`}
                >
                  {meta.label}
                </Text>

                {resizable ? (
                  <View style={styles.sizes}>
                    {meta.sizes.map((option) => {
                      const selected = size === option;
                      return (
                        <PressableScale
                          key={option}
                          onPress={() => {
                            vitaHaptic('selection');
                            onChange(setSectionSize(layout, id, option));
                          }}
                          hitSlop={4}
                          accessibilityRole="button"
                          accessibilityLabel={`Set ${meta.label} to ${SIZE_LABELS[
                            option
                          ].toLowerCase()}`}
                          accessibilityState={{ selected }}
                          style={[
                            styles.sizeChip,
                            { borderColor: surfaces.border },
                            selected && {
                              backgroundColor: surfaces.text,
                              borderColor: surfaces.text,
                            },
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
                  <Text style={[styles.fixed, { color: surfaces.textTertiary }]}>
                    {meta.hideable ? 'Wide' : 'Wide · Always shown'}
                  </Text>
                )}
              </View>

              <View style={styles.moves}>
                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(moveSection(layout, id, -1));
                  }}
                  disabled={index === 0}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${meta.label} up`}
                  style={[styles.move, index === 0 && styles.disabled]}
                >
                  <Ionicons name="chevron-up" size={17} color={surfaces.textSecondary} />
                </PressableScale>

                <PressableScale
                  onPress={() => {
                    vitaHaptic('selection');
                    onChange(moveSection(layout, id, 1));
                  }}
                  disabled={index === layout.order.length - 1}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${meta.label} down`}
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
          The Fuel header, date, scanner and Add food always stay. Nutrition and Meals are always
          shown.
        </Text>

        <PressableScale
          onPress={() => {
            vitaHaptic('selection');
            onChange(defaultFuelLayout());
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Reset Fuel layout to default"
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
    fontSize: 14,
    marginTop: spacing.m,
  },
  list: {
    marginTop: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    // `minHeight`, never `height`: at accessibility text sizes a label wraps
    // and a size chip grows, and a fixed row would crop both. The drag
    // measures what actually rendered, so growing rows cost it nothing.
    minHeight: 60,
    paddingVertical: spacing.s,
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
    fontSize: 16,
  },
  sizes: {
    flexDirection: 'row',
    // Wraps rather than crops once the chips outgrow the row.
    flexWrap: 'wrap',
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
    fontSize: 12,
    fontWeight: '600',
  },
  fixed: {
    ...typography.micro,
    fontSize: 12,
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
    fontSize: 14,
  },
  reset: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  resetLabel: {
    ...typography.captionMedium,
    fontSize: 14,
    fontWeight: '600',
  },
});
