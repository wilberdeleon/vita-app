import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { TodayRoutine } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  today: readonly TodayRoutine[];
  isEmpty: boolean;
  isLoading: boolean;
  onOpen: () => void;
};

/**
 * Peptides on Home — what today holds, named.
 *
 * **Reshaped and made more useful after the 5.3 founder review.** It was a
 * tall box saying only how many were scheduled; it is now a strip that also
 * names the routine and its amount when there is exactly one thing
 * outstanding, which is the common case and the one where a name saves a tap.
 * With several outstanding it summarises and lets Today's Schedule carry the
 * list — a Dashboard module is not the place for a full routine roster.
 *
 * ## The wording rules are Sprint 3's, unchanged
 *
 * - **"Scheduled", never "due"** as an obligation. A schedule is what the
 *   user planned, not something VITA enforces.
 * - **An unanswered day stays unanswered** — never *missed*, *late* or
 *   *overdue*, and never converted to *skipped*. Absence of a response is not
 *   a response.
 * - **Nothing is scored.** No adherence, no streak, no percentage.
 * - **The amount shown is the user's own routine amount**, read back from
 *   what they configured. It is not a recommendation, and VITA has none.
 *
 * The violet dot marks that something is outstanding; the words say so too,
 * because colour alone is not a state a screen reader or a colour-blind user
 * can read.
 */
export function PeptidesModule({ today, isEmpty, isLoading, onOpen }: Props) {
  const { surfaces } = useTheme();

  const unanswered = today.filter((item) => item.mark === 'unconfirmed');
  const only = unanswered.length === 1 ? unanswered[0] : null;

  const value = isLoading
    ? '—'
    : today.length === 0
      ? isEmpty
        ? 'No routines yet'
        : 'Nothing scheduled'
      : unanswered.length === 0
        ? 'All answered'
        : unanswered.length === 1
          ? '1 scheduled'
          : `${unanswered.length} scheduled`;

  /** The routine's own configured amount, e.g. `1 mg`. Never a suggestion. */
  const amount = only?.setup.routineAmount
    ? `${only.setup.routineAmount.authored.amount} ${only.setup.routineAmount.authored.unit}`
    : null;

  /*
   * Only shown when it adds something the value line does not already say.
   * `No routines yet · Add one to start tracking` is one fact written twice,
   * and on a strip it truncates the second half into nonsense.
   */
  const detail = isLoading || today.length === 0
    ? null
    : only
      ? [only.name, amount].filter(Boolean).join(' · ')
      : `${today.length} today`;

  return (
    <PressableScale
      style={[styles.strip, { borderColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel={`Peptides, ${value}${detail ? `, ${detail}` : ''}. ${
        isEmpty ? 'Opens Peptides to add one' : 'Opens Peptides'
      }`}
    >
      <View style={[styles.badge, { backgroundColor: `${palette.peptide}1A` }]}>
        <Ionicons name="medical" size={16} color={palette.peptide} />
        {unanswered.length > 0 ? (
          <View
            style={[styles.dot, { backgroundColor: palette.peptide, borderColor: surfaces.background }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        ) : null}
      </View>

      <View style={styles.text}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Peptides</Text>
        <Text style={[styles.value, { color: surfaces.text }]} numberOfLines={1}>
          {value}
          {detail ? <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {detail}</Text> : null}
        </Text>
      </View>

      <Text style={[styles.link, { color: surfaces.textTertiary }]}>
        {isEmpty ? 'Add' : 'View'}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: radii.card,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    minHeight: 64,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  value: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontWeight: '400',
  },
  link: {
    ...typography.captionMedium,
  },
});
