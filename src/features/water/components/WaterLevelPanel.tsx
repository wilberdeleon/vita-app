import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../../../components/ui';
import type { WaterToday } from '../../../lib/water';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useReducedMotion } from '../../../theme/useReducedMotion';

type Props = {
  today: WaterToday;
  onEditGoal: () => void;
};

const PENDING = '—';

/** Tall enough for a fill to read as a level, short enough not to own the screen. */
const PANEL_HEIGHT = 168;

/**
 * A visible sliver at the very bottom once anything is logged.
 *
 * Without it a 2% day is indistinguishable from an empty one, and "I did drink
 * something today" is exactly the fact the panel exists to show.
 */
const MINIMUM_VISIBLE_FILL = 0.045;

/**
 * Today's hydration as a water level.
 *
 * The panel itself fills from the bottom as the day progresses — an abstract
 * surface rising behind the numbers rather than a drawing of a container.
 * That choice is deliberate: a bottle, a glass, or eight cup icons all imply a
 * vessel of a fixed size, and VITA's goal is whatever the user chose, in
 * whichever of four units they think in. A level has no implied capacity.
 *
 * The fill is low-alpha with a brighter line at the surface. The line is what
 * makes a small amount legible, and keeping the fill faint is what lets the
 * text sit on top at normal contrast in both themes instead of needing its own
 * treatment at every fill height.
 *
 * **One visual, one number.** The total is the only large figure on the
 * screen; the goal, the remainder, and the percentage share one quiet line
 * beneath it. Repeating the same fact at three sizes is what the Design
 * System's density rule — *size communicates importance, not availability* —
 * exists to prevent.
 */
export function WaterLevelPanel({ today, onEditGoal }: Props) {
  const { surfaces, scheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const fill = useRef(new Animated.Value(0)).current;

  // No goal means no proportion to show, so the panel stays a plain surface
  // and reports the day's total. An empty vessel would read as a failure to
  // fill something, which is not what "you haven't set a goal" means.
  const level = today.hasGoal
    ? today.progress > 0
      ? Math.max(MINIMUM_VISIBLE_FILL, today.progress)
      : 0
    : 0;

  useEffect(() => {
    if (reducedMotion) {
      fill.setValue(level);
      return;
    }
    Animated.timing(fill, {
      toValue: level,
      // Long enough to read as water settling, short enough to stay out of
      // the way of someone logging two drinks in a row.
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animates height
    }).start();
  }, [fill, level, reducedMotion]);

  const height = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  // Dark mode needs a touch more alpha to separate from a near-black card.
  const fillColor = scheme === 'dark' ? 'rgba(47,128,237,0.26)' : 'rgba(47,128,237,0.16)';

  /**
   * One line, three states, deliberately parallel: the changing part first,
   * the goal second. An earlier draft read "16 fl oz over Goal 64 fl oz",
   * which stacks two senses of "goal" into one phrase and parses badly.
   *
   * Going over is stated plainly and without comment. It is a fact about the
   * day, not something to congratulate or caution about — VITA has no opinion
   * on how much water is too much.
   */
  const context = !today.hasGoal
    ? 'No daily goal set yet'
    : today.overMl !== null && today.overMl > 0
      ? `${today.overLabel} over · Goal ${today.goalLabel}`
      : today.isGoalMet
        ? `Goal reached · ${today.goalLabel}`
        : `${today.remainingLabel} to go · Goal ${today.goalLabel}`;

  return (
    <Card style={styles.card}>
      {/*
        * The reserved height exists so a fill has room to read as a *level*.
        * Without a goal there is no fill and never will be, so reserving it
        * would just be a band of empty card — the "filling space because space
        * exists" failure the Design System density rule names directly.
        */}
      <View style={[styles.body, today.hasGoal && styles.bodyWithGoal]}>
        {/*
          * Decorative: every figure it encodes is stated in the text above it,
          * so assistive technology reads the numbers rather than a shape.
          */}
        <Animated.View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.fill, { height, backgroundColor: fillColor }]}
        >
          <View style={[styles.surfaceLine, { backgroundColor: palette.water }]} />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.headline}>
            <Text
              style={[styles.total, { color: surfaces.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
              accessibilityLabel={
                today.isLoading ? 'Loading today’s water' : `${today.totalLabel} logged today`
              }
            >
              {today.isLoading ? PENDING : today.totalLabel}
            </Text>
            <Text style={[styles.today, { color: surfaces.textTertiary }]}>TODAY</Text>
          </View>

          <Text style={[styles.context, { color: surfaces.textSecondary }]}>{context}</Text>

          {today.hasGoal ? (
            <Pressable
              onPress={onEditGoal}
              accessibilityRole="button"
              accessibilityLabel={`Daily goal ${today.goalLabel}, ${today.percent} percent reached. Edit goal`}
              hitSlop={8}
              style={styles.goalRow}
            >
              <Text style={[styles.percent, { color: palette.water }]}>{today.percent}%</Text>
              <Ionicons name="chevron-forward" size={14} color={surfaces.textTertiary} />
            </Pressable>
          ) : (
            <View style={styles.setGoal}>
              <Button label="Set a daily goal" variant="soft" color={palette.water} onPress={onEditGoal} />
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    // The fill runs to the card's edges, so its padding moves inside to
    // `content` and the rounded corners clip the animated layer.
    padding: 0,
    overflow: 'hidden',
  },
  body: {
    justifyContent: 'flex-end',
  },
  bodyWithGoal: {
    minHeight: PANEL_HEIGHT,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    top: undefined,
    justifyContent: 'flex-start',
  },
  surfaceLine: {
    height: 2,
    opacity: 0.85,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xs,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
  total: {
    ...typography.display,
    flexShrink: 1,
  },
  today: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  context: {
    ...typography.caption,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingTop: spacing.xs,
    minHeight: 28,
  },
  percent: {
    ...typography.captionMedium,
  },
  setGoal: {
    paddingTop: spacing.s,
    borderRadius: radii.control,
  },
});
