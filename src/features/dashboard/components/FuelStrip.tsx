import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, ProgressBar } from '../../../components/ui';
import { calorieSummary, type DailyNutrition } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { ModuleSize } from '../modules';
import { SQUARE_RADIUS, TYPE, WIDE_RADIUS, isCompactSquare, squareHeight } from '../widget';

type Props = {
  today: DailyNutrition;
  size: ModuleSize;
  onOpen: () => void;
  onLog: () => void;
  /**
   * Enters Home's edit mode. Lives on this module's own root pressable
   * because React Native gives the innermost pressable the responder — a
   * wrapper above it would never see the hold — and because `Pressable`
   * suppresses `onPress` once a long press fires, so holding a widget cannot
   * also open the feature.
   */
  onLongPress?: () => void;
};

/**
 * Fuel on Home — a bar in both shapes, and wide by default.
 *
 * The bar is Fuel's identity here because calories are one number travelling
 * along one axis; Water owns the ring and Peptides the count. Wide is the
 * shipped default at the founders' direction, so Home opens with one
 * prominent module above a pair.
 *
 * **The two layouts are designed, not stretched.** Wide runs the bar the full
 * width beneath a single row; square stacks the figure over the meal count
 * with a shorter bar. Neither is the other squeezed.
 *
 * **Every figure is real** and comes from `useDailyNutrition()` — the engine
 * Fuel itself reads — and since 5.6B.4 every calorie *sentence* comes from
 * `calorieSummary`, the one derivation Fuel's own section also uses. An empty
 * day says so rather than showing a plausible number, and **no score of any
 * kind** is computed here: not a VITA Score, not a grade, not a rating. None
 * is authorised and none is invented.
 *
 * **Shape, size, icon and button are untouched** by that change: 5.6B.4
 * authorised the calorie copy and its semantics on this locked surface, and
 * nothing else.
 */
export function FuelStrip({ today, size, onOpen, onLog, onLongPress }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const compact = isCompactSquare(fontScale);

  /*
   * **The same summary Fuel's own Nutrition section is built from.**
   *
   * Until 5.6B.4 this file did its own arithmetic and wrote its own copy, and
   * the founder's device comparison found the result: Fuel led with `1,340`
   * meaning *consumed* while this led with `660 cal left` meaning *remaining*.
   * Both described the same day and neither was wrong — but the same figure
   * position meant two different things across two screens.
   *
   * Now every calorie string here comes out of `calorieSummary`. The two
   * screens still render differently, because a widget this size cannot carry
   * three lines; they cannot **disagree**, because there is one derivation.
   */
  const calories = calorieSummary(today, today.isLoading);

  /*
   * **Statistics, not a sentence.**
   *
   * This used to be `[calories.compactDetail, meals].join(' · ')` rendered
   * inside the same `Text` as `calories.compact`, which produced
   * `180 cal consumed · 1,320 left · 1 of 4 meals` under `numberOfLines={1}`
   * and an ellipsis on a real device. The founder's ruling was that the data
   * was right and the hierarchy was wrong: consumed, remaining and the goal
   * are three facts of descending importance, and prose flattens them into
   * one.
   *
   * So each is read separately and set separately. Nothing here is
   * concatenated, nothing is capped to a line count, and there is no
   * `adjustsFontSizeToFit` anywhere in this file any more.
   *
   * **The meal count is gone.** It was the third clause in the sentence that
   * broke, it competed with the figures the widget exists for, and Fuel Home
   * already lists every meal. The founder's §26 default was to omit it.
   */
  const spoken = `Fuel. ${calories.spoken}`;

  /* Decorative — the module states the same figures in words. Rendered only
     against a real target: a bar with nothing to fill is the "empty track
     reads as complete" problem in miniature. */
  const bar =
    calories.progress === null ? null : (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {/*
          * Amber once the goal is passed, matching Fuel's own rail. Never
          * red: passing a target is not an error.
          */}
        <ProgressBar
          progress={calories.progress}
          color={calories.state === 'over' ? palette.carbs : palette.primary}
          height={3}
        />
      </View>
    );

  /**
   * One statistic — the figure, then what it counts.
   *
   * The figure is the subject and stays neutral and high-contrast; the label
   * under it is quiet. No value on this widget is coloured: green would read
   * as approval of a number VITA has no opinion about, and red as an error.
   * Fuel's orange lives on the flame and the rail.
   */
  const stat = (figure: string, label: string, wide: boolean) => (
    <View style={wide ? styles.stat : styles.statSquare}>
      <Text style={[wide ? styles.statFigure : styles.statFigureSquare, { color: surfaces.text }]}>
        {figure}
      </Text>
      <Text style={[styles.statLabel, { color: surfaces.textTertiary }]}>{label}</Text>
    </View>
  );

  const logAction = (
    <PressableScale
      onPress={onLog}
      haptic="selection"
      hitSlop={6}
      accessibilityLabel="Log food"
      style={[styles.action, { borderColor: surfaces.border }]}
    >
      <Ionicons name="add" size={14} color={palette.primary} />
      <Text style={[styles.actionLabel, { color: surfaces.text }]}>Log</Text>
    </PressableScale>
  );

  if (size === 'square') {
    return (
      <PressableScale
        style={[
          styles.square,
          { borderColor: surfaces.border, minHeight: squareHeight(fontScale), maxHeight: squareHeight(fontScale) },
        ]}
        onPress={onOpen}
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityLabel={spoken}
        accessibilityHint="Opens Fuel"
      >
        <View style={styles.head}>
          <Ionicons name="flame" size={14} color={palette.primary} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Fuel</Text>
        </View>

        {/*
          * The same hierarchy as wide, stacked for the narrower footprint —
          * consumed, then what is left, then the goal. Not the wide layout
          * squeezed: the two statistics sit over each other rather than
          * beside, because 164pt cannot hold two figures side by side.
          *
          * `adjustsFontSizeToFit` is gone. It silently shrank the figure
          * instead of letting the layout adapt, which is what §34 forbids and
          * what made the square quietly illegible at large text.
          */}
        <View style={styles.squareBody}>
          {stat(calories.figure, 'cal consumed', false)}
          {calories.statFigure && calories.statLabel ? (
            <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]}>
              {calories.statFigure} {calories.statLabel}
            </Text>
          ) : calories.state === 'met' ? (
            <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]}>Goal reached</Text>
          ) : null}
        </View>

        {/* Decorative, and the first thing to give way to larger text. */}
        {compact ? null : bar}
        {logAction}
      </PressableScale>
    );
  }

  /*
   * Wide — the shipped default, and the shape the founder reviewed.
   *
   * Identity and the action on the top row; the statistics beneath them, with
   * room to be read. It is taller than the 64pt bar it replaces, which the
   * founder authorised explicitly: the old height was the reason three facts
   * had to be squeezed onto one line. Quick Tools and Today's Schedule simply
   * sit lower now, and neither was changed to make that happen.
   */
  return (
    <PressableScale
      style={[styles.wide, { borderColor: surfaces.border }]}
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityLabel={spoken}
      accessibilityHint="Opens Fuel"
    >
      <View style={styles.wideHead}>
        <View style={[styles.badge, { backgroundColor: `${palette.primary}1A` }]}>
          <Ionicons name="flame" size={16} color={palette.primary} />
        </View>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Fuel</Text>
        <View style={styles.spacer} />
        {logAction}
      </View>

      {/*
        * Two statistics side by side, and they **wrap** rather than shrink:
        * at accessibility text sizes the second drops beneath the first
        * instead of either being compressed. That is the §34 requirement, and
        * the reason `flexBasis` is set rather than a fixed width.
        */}
      <View style={styles.statsRow}>
        {stat(calories.figure, 'cal consumed', true)}
        {calories.statFigure && calories.statLabel
          ? stat(calories.statFigure, calories.statLabel, true)
          : null}
      </View>

      {/*
        * The quiet third line. `1,500 goal` where one exists; `Goal reached`
        * on a day that landed exactly on it — a sentence rather than a
        * statistic, in the same restrained treatment and never in green.
        */}
      {calories.goalLabel || calories.state === 'met' ? (
        <Text style={[styles.goal, { color: surfaces.textTertiary }]}>
          {calories.state === 'met' ? `Goal reached · ${calories.goalLabel}` : calories.goalLabel}
        </Text>
      ) : null}

      {bar}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  square: {
    flex: 1,
    borderWidth: 1,
    borderRadius: SQUARE_RADIUS,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    /*
     * One shared footprint — see `widget.ts`. A widget must not resize because
     * its feature happened to have less to say today.
     *
     * Both bounds, not `height`: `flex: 1` above resolves a flex basis of 0 on
     * the main axis, which would win over a plain height and collapse the
     * cell. Clamping the range pins the footprint whatever the flex maths
     * decides, in either direction.
     */
    /* The value is applied inline — it depends on the system text scale. */
  },
  wide: {
    borderWidth: 1,
    borderRadius: WIDE_RADIUS,
    padding: spacing.m,
    gap: spacing.s,
    /*
     * Taller than the 64pt bar this replaces, by founder authorisation.
     *
     * A `minHeight` rather than a height: the content decides, and at
     * accessibility text sizes the statistics wrap and the module grows past
     * this. 64pt was the constraint that forced three facts onto one line.
     */
    minHeight: 116,
  },
  wideHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  spacer: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    // Wraps at accessibility sizes instead of compressing either figure.
    flexWrap: 'wrap',
    gap: spacing.m,
    rowGap: spacing.s,
  },
  stat: {
    gap: 1,
    /*
     * **Content decides when the row breaks.**
     *
     * `flexShrink: 0` with an automatic basis means a statistic is never
     * compressed below the width of the figure inside it, so once the two no
     * longer fit side by side `flexWrap` puts the second on its own line.
     *
     * The first attempt set a fixed `flexBasis`, and the row therefore never
     * wrapped: at accessibility-extra-large both statistics still "fitted"
     * two across, each got half a 390pt card, and `1,320` **broke mid-number**
     * into `1,32` / `0` — worse than truncating, because it reads as two
     * figures. Scaling that basis by `fontScale` was the second attempt and
     * missed for the same underlying reason: the wrap has to follow the text
     * that is actually rendered, not a number multiplied by a guess.
     */
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  statSquare: {
    gap: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  statFigure: {
    ...typography.heading,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  statFigureSquare: {
    ...typography.heading,
    fontSize: TYPE.squareValue,
    fontWeight: '700',
    textAlign: 'center',
  },
  statLabel: {
    ...typography.caption,
    fontSize: TYPE.support,
  },
  goal: {
    ...typography.caption,
    fontSize: TYPE.support,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.micro,
    fontSize: TYPE.moduleLabel,
    letterSpacing: 0.6,
  },
  squareBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  squareDetail: {
    ...typography.caption,
    fontSize: TYPE.support,
    textAlign: 'center',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: TYPE.actionLabel,
    fontWeight: '600',
  },
});
