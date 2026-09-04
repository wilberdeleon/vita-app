import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { TodayRoutine } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  /** Routines scheduled today, exactly as `usePeptides()` groups them. */
  today: readonly TodayRoutine[];
  /** True when the user has no routines at all yet. */
  isEmpty: boolean;
  isLoading: boolean;
  onOpen: () => void;
};

/**
 * Peptides on Home — what today asks of you, stated as fact.
 *
 * **Deliberately not a ring and not a bar.** Water is a ring, Fuel is a bar,
 * and this is a count with a row of day marks. Three domains that behave
 * nothing alike should not read as the same module in three colours — that
 * sameness is the whole diagnosis Sprint 5 exists to fix.
 *
 * ## The wording is load-bearing
 *
 * Every rule Sprint 3 set for Peptides applies here and none of them is
 * softened for a summary:
 *
 * - **"Scheduled", never "due"** in the sense of an obligation. A schedule is
 *   what the user planned, not something VITA is enforcing.
 * - **An unanswered day is unanswered.** No *missed*, no *late*, no
 *   *overdue*, and never converted to *skipped* — absence of a response is
 *   not a response, which is a distinction the domain draws explicitly.
 * - **Nothing is scored.** No adherence, no streak, no percentage, no
 *   compliance language of any kind.
 *
 * The marks are a factual tally of today: taken, skipped, and unanswered,
 * each drawn once per routine. Colour alone never carries them — the count
 * line says the same thing in words, because a row of coloured dots is
 * meaningless to a screen reader and to anyone who cannot separate the hues.
 *
 * **This module stays compact on purpose.** Slice 5.4 redesigns Peptides
 * Home; building that here first would mean building it twice.
 */
export function PeptidesModule({ today, isEmpty, isLoading, onOpen }: Props) {
  const { surfaces } = useTheme();

  const taken = today.filter((item) => item.mark === 'taken').length;
  const skipped = today.filter((item) => item.mark === 'skipped').length;
  const unanswered = today.length - taken - skipped;

  const headline = isLoading
    ? '—'
    : today.length === 0
      ? isEmpty
        ? 'No routines yet'
        : 'Nothing scheduled'
      : unanswered > 0
        ? `${unanswered} scheduled`
        : 'All answered';

  const detail = isLoading
    ? ''
    : today.length === 0
      ? isEmpty
        ? 'Add one to start tracking'
        : 'Nothing scheduled today'
      : [taken > 0 ? `${taken} taken` : null, skipped > 0 ? `${skipped} skipped` : null]
          .filter(Boolean)
          .join(' · ') || 'Not answered yet';

  return (
    <PressableScale
      style={[styles.module, { borderColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel={`Peptides, ${headline}${detail ? `, ${detail}` : ''}. Opens Peptides`}
    >
      <View style={styles.head}>
        <Ionicons name="medical" size={15} color={palette.peptide} />
        <Text style={[styles.title, { color: surfaces.textSecondary }]}>Peptides</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.headline, { color: surfaces.text }]} numberOfLines={1} adjustsFontSizeToFit>
          {headline}
        </Text>

        {today.length > 0 ? (
          <View
            style={styles.marks}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {today.map((item) => (
              <View
                key={item.setup.id}
                style={[
                  styles.mark,
                  item.mark === 'taken'
                    ? { backgroundColor: palette.peptide }
                    : item.mark === 'skipped'
                      ? { backgroundColor: palette.routineSkipped }
                      : { borderWidth: 1, borderColor: surfaces.textTertiary },
                ]}
              />
            ))}
          </View>
        ) : null}

        <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={2}>
          {detail}
        </Text>
      </View>

      <View style={[styles.action, { borderTopColor: surfaces.border }]}>
        <View style={styles.actionInner}>
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>
            {isEmpty ? 'Add peptide' : 'View'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color={surfaces.textTertiary} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  module: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.card,
    paddingTop: spacing.m,
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
  },
  title: {
    ...typography.captionMedium,
  },
  body: {
    alignItems: 'center',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    // Holds the module level with Water's ring so the pair reads as a row
    // rather than as two unrelated blocks of different height.
    minHeight: 78,
    justifyContent: 'center',
  },
  headline: {
    ...typography.heading,
    textAlign: 'center',
  },
  marks: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mark: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  detail: {
    ...typography.caption,
    textAlign: 'center',
  },
  action: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
