import type { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, IconBadge, ProgressBar } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  /** Domain color — blue for water, purple for peptides. */
  color: string;
  title: string;
  /** The one figure worth reading at a glance, e.g. "5 of 8 cups". */
  value: string;
  /** 0..1 */
  progress: number;
  /** Right-aligned percent, omitted where a percentage would be meaningless. */
  percentLabel?: string;
  actionLabel: string;
  onAction: () => void;
};

/**
 * A secondary tracker on the Fuel landing screen — Hydration or Peptides.
 *
 * Half width, and that is the whole point. These used to be full-width rows
 * carrying the same visual weight as food, which made Fuel read as a menu
 * of four equal features rather than a nutrition screen. Their proportion
 * now says "secondary" on its own, so nothing else has to: same card
 * material, same radius, same type scale as everything above, just half the
 * room and one number each.
 *
 * Purely presentational — it takes numbers and a callback. Water and
 * Peptides are separate features, and Fuel does not import from either
 * (CLAUDE.md rule 4); the Fuel *route* reads both feature APIs and passes
 * plain values down.
 *
 * This is not the deferred Water or Peptide sprint. Nothing here configures
 * a goal, changes a unit, or adds history — it is a summary and a door.
 */
export function FuelTrackerCard({
  icon,
  color,
  title,
  value,
  progress,
  percentLabel,
  actionLabel,
  onAction,
}: Props) {
  const { surfaces } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <IconBadge icon={icon} color={color} size={32} />
        <Text style={[styles.title, { color: surfaces.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Text
        style={[styles.value, { color: surfaces.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Text>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <ProgressBar progress={progress} color={color} height={6} />
        </View>
        {percentLabel ? (
          <Text style={[styles.percent, { color: surfaces.textTertiary }]}>{percentLabel}</Text>
        ) : null}
      </View>

      <Button label={actionLabel} variant="soft" color={color} onPress={onAction} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.s,
    /**
     * The two cards sit side by side and stretch to a shared height, but
     * their content is not identical — only one of them shows a percentage.
     * Distributing rather than stacking keeps both action buttons on the
     * same line instead of leaving a dead gap under the shorter card.
     */
    justifyContent: 'space-between',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  title: {
    ...typography.captionMedium,
    flex: 1,
  },
  value: {
    ...typography.heading,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  progressTrack: {
    flex: 1,
  },
  percent: {
    ...typography.micro,
  },
});
