import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { MonthCounts } from '../month';

type Props = {
  counts: MonthCounts;
  /**
   * What the counts are counting. One routine's days on the routine month
   * view; every routine's events on the Peptides-level one — which are
   * genuinely different units, and saying so is cheaper than letting someone
   * assume.
   */
  caption?: string;
};

/**
 * What the month held, counted — and nothing about whether that was good.
 *
 * ## Three facts, and deliberately no fourth
 *
 * Taken, Skipped, No response. There is no total, no denominator, no
 * percentage, no adherence figure, no streak, no average, no best or worst
 * week and no score, because the counts are the user's to interpret. Someone
 * should be able to look at July and think *I only skipped twice* without
 * VITA telling them whether twice is a lot.
 *
 * Unscheduled days are counted as nothing at all. They are not a miss and not
 * a gap — there was no question asked, so there is no answer missing.
 *
 * ## Readable at a glance (founder direction, 5.5C §45)
 *
 * The first version of this was legible but small: a caption-weight label and
 * a 16pt count in a 40pt row, which the founder had to squint at. Everything
 * here is one step larger and the rows breathe, while the state colour stays
 * a 6pt dot — the numbers are the content, and turning them into hero
 * metrics would make a quiet record look like a scoreboard.
 *
 * ## One spoken sentence
 *
 * The rows are decorative to assistive technology and the group speaks once,
 * as a sentence. Three separate stops for "dot, Taken, 2" is worse than
 * *"Month summary. 2 taken. 0 skipped. 13 no response."*
 */
export function MonthSummary({ counts, caption }: Props) {
  const { surfaces } = useTheme();

  const total = counts.taken + counts.skipped + counts.noResponse;

  return (
    <View style={styles.summary}>
      <Text style={[styles.title, { color: surfaces.text }]}>Month summary</Text>
      {caption ? (
        <Text style={[styles.caption, { color: surfaces.textTertiary }]}>{caption}</Text>
      ) : null}

      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Month summary. ${counts.taken} taken. ${counts.skipped} skipped. ${counts.noResponse} no response.`}
      >
        <Row label="Taken" value={counts.taken} tone={palette.peptide} first />
        <Row label="Skipped" value={counts.skipped} tone={palette.routineSkipped} />
        <Row label="No response" value={counts.noResponse} tone={surfaces.textTertiary} />
      </View>

      {total === 0 ? (
        <Text style={[styles.quiet, { color: surfaces.textTertiary }]}>
          No routine activity this month.
        </Text>
      ) : null}
    </View>
  );
}

function Row({
  label,
  value,
  tone,
  first = false,
}: {
  label: string;
  value: number;
  tone: string;
  first?: boolean;
}) {
  const { surfaces } = useTheme();
  return (
    <View
      style={[styles.row, !first && styles.divided, !first && { borderTopColor: surfaces.border }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: tone }]} />
        <Text style={[styles.label, { color: surfaces.text }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Text style={[styles.value, { color: surfaces.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.s,
  },
  title: {
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: '600',
  },
  caption: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 48,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexShrink: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...typography.body,
    fontSize: 17,
    flexShrink: 1,
  },
  value: {
    ...typography.bodyMedium,
    fontSize: 18,
    fontWeight: '600',
  },
  quiet: {
    ...typography.caption,
  },
});
