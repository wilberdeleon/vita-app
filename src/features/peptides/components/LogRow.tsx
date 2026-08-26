import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { formatClockTime, formatLogDateLong } from '../../../lib/daily';
import { formatMcg, formatSyringeUnits, type PeptideLogEntry } from '../../../lib/peptides';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  entry: PeptideLogEntry;
  /** Omitted inside a day-grouped list, where the date is already the header. */
  showDate?: boolean;
  onPress?: () => void;
};

/**
 * One recorded administration, compact.
 *
 * **The amount leads, in the unit it was written in.** Someone who logged
 * `500 mcg` sees 500 mcg forever — rewriting it as `0.5 mg` would be
 * arithmetically identical and would still be putting words in their mouth.
 *
 * The syringe units sit beside it as support, and are simply **absent** when
 * no conversion was saved. A `— units` placeholder would imply a number went
 * missing; nothing was missing, there was just no vial to convert against.
 *
 * The site, when one was recorded, shares the time line rather than adding a
 * third — a history that grows a row taller for every optional field becomes
 * a table, and this is meant to be scannable.
 */
export function LogRow({ entry, showDate = false, onPress }: Props) {
  const { surfaces } = useTheme();

  const amount = formatMcg(entry.amount.amountMcg, entry.amount.authoredUnit);
  const units = entry.calculationSnapshot
    ? formatSyringeUnits(entry.calculationSnapshot.calculatedUnits)
    : null;
  const time = formatClockTime(entry.loggedAt);
  const when = showDate ? `${formatLogDateLong(entry.logDate)} · ${time}` : time;
  const meta = entry.site ? `${entry.site.label} · ${when}` : when;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`${amount}${units ? `, ${units}` : ''}${entry.site ? `, ${entry.site.label}` : ''}, ${when}`}
      style={[styles.row, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
      pressedScale={0.98}
    >
      <View style={styles.text}>
        <View style={styles.amountLine}>
          <Text style={[styles.amount, { color: surfaces.text }]}>{amount}</Text>
          {units ? (
            <Text style={[styles.units, { color: surfaces.textSecondary }]}>· {units}</Text>
          ) : null}
        </View>
        <Text style={[styles.when, { color: surfaces.textTertiary }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>

      {/* A note is signalled, never previewed — a truncated sentence in a list
          row is noise, and the detail screen is one tap away. */}
      {entry.notes ? (
        <Ionicons name="document-text-outline" size={15} color={surfaces.textTertiary} />
      ) : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  amountLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  amount: {
    ...typography.bodyMedium,
  },
  units: {
    ...typography.body,
  },
  when: {
    ...typography.caption,
  },
});
