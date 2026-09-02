import { StyleSheet, Text, View } from 'react-native';
import { formatEvidenceContext, type ResearchClaim } from '../../../lib/peptides';
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
 * **The claim leads; the qualifier follows** (slice 3.5D). The evidence line
 * moved out of the title row and under the summary, because a claim whose
 * heading shares its line with "Mainly Preclinical Research" reads as a
 * disclaimer with a title attached. A reader should learn what a compound is
 * researched to do first, and how mature that research is second — in that
 * order, on the page as well as in the copy.
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
          <Text style={[styles.title, { color: surfaces.text }]}>{claim.title}</Text>
          {claim.summary ? (
            <Text style={[styles.summary, { color: surfaces.textSecondary }]}>{claim.summary}</Text>
          ) : null}
          {claim.evidenceLevel ? (
            <Text style={[styles.evidence, { color: surfaces.textTertiary }]}>
              {formatEvidenceContext(claim.evidenceLevel)}
            </Text>
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
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
  },
  /** Sits under the summary, quiet enough to read as an annotation. */
  evidence: {
    ...typography.micro,
    marginTop: 4,
  },
  summary: {
    ...typography.body,
  },
});
