import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { WaterToday } from '../../../lib/water';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { WaterVessel } from './WaterVessel';

type Props = {
  today: WaterToday;
  onSetGoal: () => void;
};

/**
 * Today's hydration, as the screen's subject.
 *
 * **Direct on the background — no card.** This is the surface role slice 5.1
 * made the default, and the object is strong enough to hold the screen
 * without one drawn around it. The panel this replaces was a `Card` holding
 * an abstract fill; what changed is the presentation, not a single number
 * behind it.
 *
 * **One display-size figure, and it is the percentage.** The goal, the
 * remainder and the total share one quiet line beneath it. Repeating the same
 * fact at three sizes is what the density rule — *size communicates
 * importance, not availability* — exists to prevent, and the earlier panel's
 * three-line readout was carrying the goal twice.
 *
 * ## The four states, and why each reads the way it does
 *
 * **No goal.** The vessel goes latent and there is no percentage at all,
 * because a percentage of nothing is not a number. The day's real total still
 * shows — someone can log for a week and decide their target afterwards, and
 * Water has always allowed that. A quiet *Set a daily goal* sits underneath.
 * What this must never do is render an empty vessel at 0%, which says the
 * user is failing a goal they never chose.
 *
 * **Under.** Percentage, then what is left and what it is out of.
 *
 * **Met.** *Goal reached*, stated plainly and without congratulation. The
 * vessel's own edge turns brand gold. VITA has no opinion about hydration
 * beyond the number the user set.
 *
 * **Over.** The vessel stays full — liquid never spills outside it — and the
 * line reports the real total against the goal. Going over is a fact about
 * the day, not a fault and not an achievement.
 */
export function WaterHero({ today, onSetGoal }: Props) {
  const { surfaces } = useTheme();

  const { hasGoal, percent, isGoalMet, overMl, totalLabel, goalLabel, remainingLabel } = today;

  /**
   * `null` while loading, so the vessel is latent rather than briefly
   * claiming an empty day. A goal that has not been read yet is not a goal
   * that does not exist.
   */
  const level =
    today.isLoading || !hasGoal || percent === null
      ? null
      : // Unclamped on purpose — the vessel clamps its own fill and announces
        // the true percentage, so it agrees with the readout beside it.
        percent / 100;

  const context = !hasGoal
    ? 'No daily goal set yet'
    : overMl !== null && overMl > 0
      ? `${totalLabel} · Goal ${goalLabel}`
      : isGoalMet
        ? `Goal reached · ${goalLabel}`
        : `${remainingLabel} to go · ${goalLabel} goal`;

  return (
    <View style={styles.root}>
      <WaterVessel progress={level} width={116} accessibilityLabel="Hydration" />

      <View style={styles.readout}>
        {hasGoal && percent !== null ? (
          <Text style={[styles.headline, { color: surfaces.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {percent}%
          </Text>
        ) : (
          /*
           * With no goal the day's total *is* the headline. It is the only
           * true number available, and showing it keeps logging useful before
           * a target exists.
           */
          <Text style={[styles.headline, { color: surfaces.text }]} numberOfLines={1} adjustsFontSizeToFit>
            {today.isLoading ? '—' : totalLabel}
          </Text>
        )}

        <Text style={[styles.context, { color: surfaces.textSecondary }]}>{context}</Text>
      </View>

      {hasGoal ? (
        <PressableScale
          onPress={onSetGoal}
          accessibilityLabel={`Daily goal ${goalLabel}. Edit goal`}
          style={styles.goalLink}
          hitSlop={8}
        >
          <Text style={[styles.goalLinkLabel, { color: surfaces.textTertiary }]}>Edit goal</Text>
        </PressableScale>
      ) : (
        <PressableScale
          onPress={onSetGoal}
          haptic="selection"
          accessibilityLabel="Set a daily goal"
          style={[styles.setGoal, { borderColor: surfaces.border }]}
        >
          <Text style={[styles.setGoalLabel, { color: surfaces.text }]}>Set a daily goal</Text>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.l,
  },
  readout: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  headline: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  context: {
    ...typography.caption,
    textAlign: 'center',
  },
  goalLink: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    minHeight: 28,
  },
  goalLinkLabel: {
    ...typography.caption,
  },
  setGoal: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    minHeight: 40,
    justifyContent: 'center',
  },
  setGoalLabel: {
    ...typography.captionMedium,
  },
});
