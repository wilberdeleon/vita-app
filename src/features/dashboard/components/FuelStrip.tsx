import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AccentRail, PressableScale } from '../../../components/ui';
import { calorieSummary, type DailyNutrition } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { ModuleSize } from '../modules';
import { SQUARE_RADIUS, TYPE, WIDE_RADIUS, isCompactSquare, squareHeight } from '../widget';

/**
 * Amber, not red, when a calorie goal is passed — the same constant name and
 * the same hex Fuel Home's own section uses, for the same reason: passing a
 * target is worth noticing and not worth being scolded for.
 */
const OVER_ACCENT = palette.carbs;

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
 * Fuel on Home — consumed out of goal, in both shapes, and wide by default.
 *
 * The rail is Fuel's identity here because calories are one number travelling
 * along one axis; Water owns the vessel and Peptides the count. Wide is the
 * shipped default at the founders' direction, so Home opens with one
 * prominent module above a pair.
 *
 * **Every figure is real** and comes from `useDailyNutrition()` — the engine
 * Fuel itself reads — and every calorie *string* comes from `calorieSummary`,
 * the one derivation Fuel Home is also built from. An empty day says so
 * rather than showing a plausible number, and **no score of any kind** is
 * computed here: not a VITA Score, not a grade, not a rating.
 *
 * ## The hierarchy, and the two corrections that arrived at it
 *
 * `180 / 1,500 cal` with `1,320 left` beneath it. One primary relationship,
 * one quiet remainder — consumed, then goal, then what is left.
 *
 * It took two founder reviews to get here, and both rejections are worth
 * keeping written down because each fixed the other's overcorrection.
 *
 * **First it was one prose line.** `calories.compact` and `compactDetail`
 * were joined with the meal count inside a single `Text` under
 * `numberOfLines={1}`, which rendered `180 cal consumed · 1,320 left · 1 of 4
 * meals` and then an ellipsis on a real device. Three facts of descending
 * importance, flattened into one sentence and then truncated.
 *
 * **Then it was two large statistics.** The 2026-09-13 correction split them
 * into `180` / `cal consumed` beside `1,320` / `left`, with `1,500 goal` on a
 * third line. That fixed the truncation and introduced two new faults the
 * founder named on device: the widget grew to roughly 160pt and read as a
 * hero card rather than one module among several, and **consumed and
 * remaining carried equal visual weight** — two 26pt figures side by side,
 * leaving the reader to work out which one the day actually is.
 *
 * **Now the relationship is the subject.** `180 / 1,500 cal` is one line in
 * three weights: the consumed figure large and high-contrast, the goal it is
 * measured against smaller and quieter, the unit smaller still and attached.
 * A reader does not combine two numbers; the sentence is already formed. What
 * is left drops to a single quiet line under it, which is where a derived
 * figure belongs.
 *
 * ## The meal count stays gone
 *
 * It was the third clause in the sentence that broke, it competed with the
 * figures the widget exists for, and Fuel Home already lists every meal.
 * Founder direction in both corrections (§26, then §15).
 *
 * ## Nothing is capped, shrunk or concatenated
 *
 * No `numberOfLines` on any figure, no `adjustsFontSizeToFit` anywhere in
 * this file, and no prose sentence to truncate. The calorie line is one
 * `Text` with nested spans, so it breaks at the spaces around the slash if it
 * ever has to and **never inside a number** — the defect the previous
 * correction shipped and this one must not reintroduce.
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
   * Fuel's three lines; they cannot **disagree**, because there is one
   * derivation and this file does no calorie arithmetic at all.
   */
  const calories = calorieSummary(today, today.isLoading);
  const spoken = `Fuel. ${calories.spoken}`;

  /* Amber past the goal, on the consumed figure and the rail — the treatment
     Fuel Home already uses for the same state. Never red. */
  const accent = calories.state === 'over' ? OVER_ACCENT : palette.primary;

  /**
   * `180 / 1,500 cal`, or `180 cal consumed` with no goal.
   *
   * One `Text` in three weights rather than three `Text` nodes in a row:
   * nested spans share a baseline and a line box, so the unit sits on the
   * figure's baseline without any alignment arithmetic, and the whole phrase
   * wraps as one piece of text at accessibility sizes.
   *
   * **With no goal there is no slash and no denominator.** `180 / —` is what
   * §6 rules out by name, and it cannot be composed here because
   * `goalFigure` is `null` in that state — the absence is in the derivation,
   * not in a condition this file could forget.
   *
   * ## No explicit line height
   *
   * Deliberate, and measured. The first attempt set one as a ratio of
   * `fontScale` — the pattern Fuel Home's headline needs, because there a
   * *fixed* 37pt line box became a ceiling that dropped a 51pt figure onto
   * the caption beneath it.
   *
   * On device that turned out to be the wrong tool for a line made of three
   * runs of different sizes. At accessibility-extra-large the simulator
   * measured **95pt of empty space above the figure and 84pt below it** —
   * the card reached 359pt for one line of text and two short ones. Removing
   * the override took it to 232pt with the same type at the same size, and
   * the leading between the three elements became proportionate.
   *
   * It is safe to leave to the platform here in a way it is not on Fuel
   * Home: this line is alone in its own gapped column, so there is no
   * sibling for an overflowing line box to land on, and natural leading
   * scales with the type by definition.
   */
  const calorieLine = (scale: { figure: number; goal: number; unit: number }, center: boolean) => (
    <Text
      style={[
        styles.line,
        center && styles.centered,
        {
          fontSize: scale.figure,
          /* Only the consumed figure takes the amber — the goal and the unit
             stay in their own quiet roles, exactly as on Fuel Home. */
          color: calories.state === 'over' ? OVER_ACCENT : surfaces.text,
        },
      ]}
    >
      {calories.figure}
      {calories.goalFigure === null ? (
        <Text style={[styles.unit, { fontSize: scale.unit, color: surfaces.textTertiary }]}> cal consumed</Text>
      ) : (
        <>
          <Text style={[styles.goal, { fontSize: scale.goal, color: surfaces.textSecondary }]}>
            {' / '}
            {calories.goalFigure}
          </Text>
          <Text style={[styles.unit, { fontSize: scale.unit, color: surfaces.textTertiary }]}> cal</Text>
        </>
      )}
    </Text>
  );

  /**
   * `1,320 left`, `120 over`, `Goal reached` — or nothing.
   *
   * Smaller, lighter and tertiary, per §5. Not a second statistic and never
   * coloured: green would read as approval of a number VITA has no opinion
   * about, and red as an error. Fuel's orange lives on the flame and the rail.
   *
   * `compactDetail` is the string Home has shown for this since 5.6B.4 — the
   * same field, demoted from a 26pt figure back to a supporting line.
   */
  const secondary = (center: boolean) =>
    calories.compactDetail === null ? null : (
      <Text style={[styles.secondary, center && styles.centered, { color: surfaces.textTertiary }]}>
        {calories.compactDetail}
      </Text>
    );

  /* Decorative — the module states the same fraction in words. Rendered only
     against a real target: a bar with nothing to fill is the "empty track
     reads as complete" problem in miniature.

     `AccentRail` is the shared rail Fuel Home draws too, so the founder's
     §13 refinement could not land on one screen and not the other. */
  const bar = calories.progress === null ? null : <AccentRail progress={calories.progress} color={accent} />;

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
          * The same semantics as wide at the square's type scale — §17. Not
          * the wide layout squeezed and not a different reading of the day:
          * the same `180 / 1,500 cal` over the same `1,320 left`, centred,
          * with the room a 170pt cell actually has.
          *
          * At the default text size the phrase fits one line. Past that it
          * wraps at the spaces around the slash — `180 / 1,500` over `cal` —
          * which is the composition §17 sketches and the only break the text
          * can take, because neither number contains one.
          */}
        <View style={styles.squareBody}>
          {calorieLine(SQUARE_SCALE, true)}
          {secondary(true)}
        </View>

        {/* Decorative, and the first thing to give way to larger text. */}
        {compact ? null : bar}
        {logAction}
      </PressableScale>
    );
  }

  /*
   * Wide — the shipped default, and the shape both founder reviews were of.
   *
   * Identity and the action on the top row, untouched by this correction
   * (§12); the calorie relationship, its remainder and the rail beneath. Four
   * elements in a deliberate rhythm rather than the five-line stack that came
   * before, and **no `minHeight`**: the previous 116 was inert — the content
   * measured nearer 160 — and a number that cannot bind is worse than no
   * number, because it reads as a decision. The card is now as tall as the
   * things in it, which is what §11 asks for.
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

      {/* The calorie block — the two lines belong together, so they sit
          closer to each other than to anything else on the card (§14). */}
      <View style={styles.figures}>
        {calorieLine(WIDE_SCALE, false)}
        {secondary(false)}
      </View>

      {bar}
    </PressableScale>
  );
}

/**
 * The wide calorie line, in three sizes.
 *
 * `figure` dominates and `goal` is exactly `TYPE.wideValue`, the size Water
 * and Peptides set their own wide value at — so Fuel leads Home without the
 * goal half of its headline outgrowing the modules beside it (§35). 26 was
 * the previous single figure size and is kept, because the founder's
 * objection was to *two* of them, not to this one.
 */
const WIDE_SCALE = { figure: 26, goal: TYPE.wideValue, unit: TYPE.support } as const;

/** The same three roles at the square's scale — see `TYPE.squareValue`. */
const SQUARE_SCALE = { figure: TYPE.squareValue, goal: TYPE.support, unit: 12.5 } as const;

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
     *
     * The value is applied inline — it depends on the system text scale.
     */
  },
  wide: {
    borderWidth: 1,
    borderRadius: WIDE_RADIUS,
    padding: spacing.m,
    /*
     * Tight, and the same on every boundary the card owns: head row to
     * calorie block, calorie block to rail.
     *
     * `spacing.s` before, which with the extra line the old layout carried
     * left more vertical breathing room than the information justified —
     * §14. 4pt also does the other half of §13's ask: the rail sits against
     * the figures it describes rather than floating at the bottom edge.
     */
    gap: spacing.xs,
  },
  wideHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  spacer: {
    flex: 1,
  },
  figures: {
    /* Closer to each other than to the rest of the card — one block. */
    gap: 2,
  },
  line: {
    ...typography.heading,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  goal: {
    fontWeight: '600',
    letterSpacing: 0,
  },
  unit: {
    ...typography.captionMedium,
    fontWeight: '600',
    letterSpacing: 0,
  },
  secondary: {
    ...typography.caption,
    fontSize: TYPE.support,
  },
  centered: {
    textAlign: 'center',
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
