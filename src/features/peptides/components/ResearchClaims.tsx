import { StyleSheet, Text, View } from 'react-native';
import { evidenceLabel, type ResearchClaim } from '../../../lib/peptides';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  claims: readonly ResearchClaim[];
};

/**
 * What a compound is researched or commonly claimed to do, in plain English.
 *
 * The section exists because a technically correct mechanism paragraph can
 * leave an ordinary reader with no idea why anyone tracks the compound —
 * "inhibits nicotinamide N-methyltransferase" is accurate and answers nothing.
 * Claims answer *what*; the mechanism section below answers *how*.
 *
 * **The evidence label sits on each claim, not on the page.** One compound can
 * have strong human evidence for one effect and vendor folklore for another,
 * and a single page-level badge would launder the second into the first.
 *
 * Short labelled blocks rather than one long paragraph — the founder's note
 * was that these pages read as walls of grey text, and a 180-word paragraph
 * covering three separate effects is exactly that.
 */
export function ResearchClaims({ claims }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.list}>
      {claims.map((claim) => (
        <View key={claim.title} style={styles.claim}>
          <View style={styles.headingRow}>
            <Text style={[styles.title, { color: surfaces.text }]}>{claim.title}</Text>
            {claim.evidenceLevel ? (
              <Text style={[styles.evidence, { color: surfaces.textTertiary }]}>
                {evidenceLabel(claim.evidenceLevel)}
              </Text>
            ) : null}
          </View>
          {claim.summary ? (
            <Text style={[styles.summary, { color: surfaces.textSecondary }]}>{claim.summary}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.l,
    marginTop: -spacing.xs,
  },
  claim: {
    gap: spacing.xs,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  title: {
    ...typography.bodyMedium,
    flexShrink: 1,
  },
  evidence: {
    ...typography.micro,
    textAlign: 'right',
    flexShrink: 1,
  },
  summary: {
    ...typography.body,
  },
});
