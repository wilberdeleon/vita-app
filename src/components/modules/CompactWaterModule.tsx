import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from '../ui/PressableScale';
import { WaterVessel } from '../ui/WaterVessel';
import {
  MODULE_TYPE,
  SQUARE_RADIUS,
  WIDE_RADIUS,
  isCompactSquare,
  squareHeight,
} from './geometry';

/** What every compact module accepts, whichever feature it reports. */
export type CompactModuleSize = 'square' | 'wide';

type Props = {
  /** Already derived by `compactWaterView` — this component reaches nothing. */
  view: {
    value: string;
    detail: string;
    spoken: string;
    progress: number | null;
  };
  size: CompactModuleSize;
  /** Opens Water with the Add Water sheet already up. */
  onAdd: () => void;
  onOpen: () => void;
  /**
   * Enters the host screen's edit or arrange mode.
   *
   * Lives on this module's own root pressable because React Native gives the
   * innermost pressable the responder — a wrapper above it would never see the
   * hold — and because `Pressable` suppresses `onPress` once a long press
   * fires, so holding a module cannot also open the feature.
   */
  onLongPress?: () => void;
  testID?: string;
};

/**
 * Hydration, wherever hydration is reported — **one component, two screens.**
 *
 * ## Why it is shared
 *
 * Home and Fuel each had their own. The founder put the two screens side by
 * side on device in the 5.6B.3 review and found the same feature drawn two
 * ways: a ring on one, a ring at a different size with different copy on the
 * other, on different footprints. The ruling was that they should **match**,
 * not resemble — so there is now one component, one derivation
 * (`compactWaterView`) and one footprint (`geometry.ts`).
 *
 * **Presentational, strictly.** It takes a view model and three callbacks. It
 * imports no domain, calls no hook that reads data, and has no idea which
 * screen it is on. That is what lets Home keep Home's layout preference and
 * Fuel keep Fuel's while both draw the identical object: **the presentation is
 * shared, the layout choice is not.**
 *
 * ## The vessel, not a ring
 *
 * Founder ruling, 5.6B.3. Water already owns a distinctive object — the
 * fillable vessel from 5.2 — and the compact modules were drawing a generic
 * progress ring instead, which is the one shape every health app already has.
 * The same `WaterVessel` now appears at three sizes: the Water screen's hero,
 * the square module, and a slim form in the wide strip. **No second bottle was
 * drawn and no second hydration calculation exists** — it is the same
 * component fed the same fraction Water computes for its own screen.
 *
 * **Not one layout stretched.** The square stacks label, vessel and reading in
 * a column because a column has height and no width; the wide lays them along
 * a row and puts the action on the right because a row has the opposite.
 *
 * **No goal is an honest state.** Without a target there is nothing to be a
 * fraction of, so `progress` arrives as `null`, the vessel draws latent rather
 * than empty, and the module shows the day's real total. A vessel at 0% would
 * say the user is failing a goal they never chose.
 */
export function CompactWaterModule({ view, size, onAdd, onOpen, onLongPress, testID }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const compact = isCompactSquare(fontScale);

  /* The vessel encodes only what the text already says, so it is decorative —
     and at large text sizes it stands aside so the words can have its room. */
  const vessel = (width: number) => (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <WaterVessel progress={view.progress} width={width} />
    </View>
  );

  const addAction = (
    <PressableScale
      onPress={onAdd}
      haptic="selection"
      hitSlop={6}
      accessibilityLabel="Add water"
      style={[styles.action, { borderColor: surfaces.border }]}
    >
      <Ionicons name="add" size={14} color={palette.water} />
      <Text style={[styles.actionLabel, { color: surfaces.text }]}>Add</Text>
    </PressableScale>
  );

  if (size === 'square') {
    return (
      <PressableScale
        testID={testID}
        style={[
          styles.square,
          {
            borderColor: surfaces.border,
            minHeight: squareHeight(fontScale),
            maxHeight: squareHeight(fontScale),
          },
        ]}
        onPress={onOpen}
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityLabel={view.spoken}
        accessibilityHint="Opens Water"
      >
        <View style={styles.head}>
          <Ionicons name="water" size={14} color={palette.water} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Water</Text>
        </View>

        {compact ? null : vessel(38)}

        <View style={styles.squareText}>
          <Text
            style={[styles.squareValue, { color: surfaces.text }]}
            numberOfLines={compact ? 2 : 1}
          >
            {view.value}
          </Text>
          {view.detail ? (
            <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]} numberOfLines={2}>
              {view.detail}
            </Text>
          ) : null}
        </View>

        {addAction}
      </PressableScale>
    );
  }

  return (
    <PressableScale
      testID={testID}
      style={[styles.wide, { borderColor: surfaces.border }]}
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityLabel={view.spoken}
      accessibilityHint="Opens Water"
    >
      {vessel(22)}

      <View style={styles.wideText}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Water</Text>
        {/* A figure is information, so it wraps rather than truncating once
            the text is large — 5.3D found `2,000 c…` on a wide Fuel strip. */}
        <Text style={[styles.wideValue, { color: surfaces.text }]} numberOfLines={compact ? 3 : 1}>
          {view.value}
          {view.detail ? (
            <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {view.detail}</Text>
          ) : null}
        </Text>
      </View>

      {addAction}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  square: {
    flex: 1,
    borderWidth: 1,
    // A touch rounder than the wide strip — a square widget is more of an
    // object and reads better with a softer corner.
    borderRadius: SQUARE_RADIUS,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    /*
     * Both bounds, applied inline because they depend on the text scale.
     *
     * `flex: 1` resolves a flex basis of 0 on the main axis, which would win
     * over a plain `height` and collapse the cell, so the range is clamped
     * from both sides — that is the 5.3C ruling, and it is what stops a widget
     * growing because its feature happened to have a lot to say today.
     *
     * 5.6B.2 removed the ceiling on Fuel's own square after it clipped
     * `fl oz` at accessibility sizes. The cap was not the cause: Fuel's base
     * was 168 where Home's is 208, and the stack does not fit in the smaller
     * box. Adopting Home's footprint fixes it and keeps the two screens
     * identical, which is the point of sharing the component at all.
     */
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: WIDE_RADIUS,
    padding: spacing.m,
    minHeight: 64,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.micro,
    fontSize: MODULE_TYPE.label,
    letterSpacing: 0.6,
  },
  squareText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  squareValue: {
    ...typography.bodyMedium,
    fontSize: MODULE_TYPE.squareValueSmall,
    fontWeight: '700',
  },
  squareDetail: {
    ...typography.caption,
    fontSize: MODULE_TYPE.support,
    textAlign: 'center',
  },
  wideText: {
    flex: 1,
    gap: 1,
  },
  wideValue: {
    ...typography.bodyMedium,
    fontSize: MODULE_TYPE.wideValue,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontSize: MODULE_TYPE.support,
    fontWeight: '400',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 40,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontSize: MODULE_TYPE.actionLabel,
    fontWeight: '600',
  },
});
