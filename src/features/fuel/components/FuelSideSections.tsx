import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale, ProgressBar } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Water and Peptides, as Fuel sees them.
 *
 * ## Why they are back
 *
 * 5.6B removed them on the reasoning that cross-domain overview is Home's
 * job. The founder's device review reversed that: they are useful *here*,
 * beside the day's food, because hydration and a peptide routine are part of
 * the same daily picture as eating.
 *
 * **What does not come back is the shape they had.** They were two tiles
 * with borders, shadows and a progress bar that had nothing to fill — the
 * card soup the redesign removed. These are section headings with one line
 * of real state and one action, direct on the background like everything
 * else on the screen.
 *
 * ## They are awareness, not a second copy of the feature
 *
 * Fuel does not embed the Water sheet or the Peptides Today list. Water
 * offers one *Add* into the existing flow; Peptides offers a way through.
 * **Nothing here mutates peptide data** — this slice only reads it.
 */

type SectionProps = {
  title: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** The one line of state this section reports. */
  value: string;
  spoken: string;
  /** `null` when there is no goal to fill — an empty track is not a state. */
  progress: number | null;
  actionLabel: string;
  onAction: () => void;
};

function FeatureSection({
  title,
  accent,
  icon,
  value,
  spoken,
  progress,
  actionLabel,
  onAction,
}: SectionProps) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Ionicons name={icon} size={14} color={accent} />
        <Text style={[styles.title, { color: surfaces.textSecondary }]}>{title}</Text>
      </View>

      <View style={styles.row}>
        <Text
          style={[styles.value, { color: surfaces.text }]}
          numberOfLines={2}
          accessible
          accessibilityRole="text"
          accessibilityLabel={spoken}
        >
          {value}
        </Text>

        <PressableScale
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.action}
        >
          <Text style={[styles.actionLabel, { color: accent }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color={accent} />
        </PressableScale>
      </View>

      {progress === null ? null : (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressBar progress={progress} height={3} color={accent} />
        </View>
      )}
    </View>
  );
}

type WaterProps = {
  /** `3 / 8 cups`, or `3 cups today` with no goal. */
  label: string;
  spoken: string;
  progress: number | null;
  onAdd: () => void;
};

export function WaterSection({ label, spoken, progress, onAdd }: WaterProps) {
  return (
    <FeatureSection
      title="WATER"
      accent={palette.water}
      icon="water"
      value={label}
      spoken={spoken}
      progress={progress}
      actionLabel="Add"
      onAction={onAdd}
    />
  );
}

type PeptidesProps = {
  label: string;
  spoken: string;
  onOpen: () => void;
};

export function PeptidesSection({ label, spoken, onOpen }: PeptidesProps) {
  return (
    <FeatureSection
      title="PEPTIDES"
      accent={palette.peptide}
      icon="medical-outline"
      value={label}
      spoken={spoken}
      /* No goal exists for a day of peptides, so there is nothing to fill —
         the bar that used to sit here was permanently empty. */
      progress={null}
      actionLabel="View"
      onAction={onOpen}
    />
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.micro,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  value: {
    ...typography.bodyMedium,
    fontSize: 17,
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLabel: {
    ...typography.captionMedium,
  },
});
