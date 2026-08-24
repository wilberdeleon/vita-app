import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import type { DevelopmentStatus } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  status: DevelopmentStatus;
};

/**
 * Where a compound actually sits in development.
 *
 * Replaces the binary "Not FDA-approved", which is true of most of this
 * catalog and tells a reader nothing about whether anyone is still working on
 * the compound, whether it has been through human trials, or whether its
 * programme was abandoned years ago.
 *
 * **A stated plan is rendered as a plan.** "Lilly has said it plans to submit…"
 * is a fact about a company's announcement; "approval expected" would be a
 * prediction VITA has no standing to make. A content test rejects the latter.
 *
 * The date is not decoration — pipeline facts expire, and a phase stated
 * without one is asserting permanent truth about something that changes.
 * Deliberately compact: no timeline graphic, no pipeline visualization.
 */
export function DevelopmentStatusBlock({ status }: Props) {
  const { surfaces } = useTheme();

  return (
    <Card style={styles.card}>
      <View style={styles.headRow}>
        <Text style={[styles.stage, { color: palette.peptide }]}>{status.label}</Text>
        {status.lastUpdated ? (
          <Text style={[styles.updated, { color: surfaces.textTertiary }]}>
            Updated {status.lastUpdated}
          </Text>
        ) : null}
      </View>

      {status.summary ? (
        <Text style={[styles.summary, { color: surfaces.textSecondary }]}>{status.summary}</Text>
      ) : null}

      {status.nextMilestone ? (
        <View style={[styles.milestone, { borderTopColor: surfaces.border }]}>
          <Text style={[styles.milestoneLabel, { color: surfaces.textTertiary }]}>NEXT MILESTONE</Text>
          <Text style={[styles.summary, { color: surfaces.textSecondary }]}>{status.nextMilestone}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.s,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  stage: {
    ...typography.bodyMedium,
    flexShrink: 1,
  },
  updated: {
    ...typography.micro,
  },
  summary: {
    ...typography.body,
  },
  milestone: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  milestoneLabel: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
});
