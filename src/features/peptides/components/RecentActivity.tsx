import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { formatClockTime, formatLogDateShort, isToday, shiftLogDate, todayLogDate } from '../../../lib/daily';
import { formatMcg, formatSyringeUnits, type PeptideLogEntry } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  entries: readonly PeptideLogEntry[];
  onOpenEntry: (id: string) => void;
  onViewAll: () => void;
  onAdd: () => void;
};

/** How many administrations the routine screen shows before deferring. */
export const RECENT_LIMIT = 2;

/** `Today`, `Yesterday`, or a short date. */
function whenLabel(entry: PeptideLogEntry): string {
  const time = formatClockTime(entry.loggedAt);
  if (isToday(entry.logDate)) return `Today · ${time}`;
  if (entry.logDate === shiftLogDate(todayLogDate(), -1)) return `Yesterday · ${time}`;
  return `${formatLogDateShort(entry.logDate)} · ${time}`;
}

/**
 * The last one or two administrations — *Recent activity*, not *Recent history*.
 *
 * ## What it replaced
 *
 * Three `LogRow` cards, each a filled rounded pill, stacked under a section
 * header, with *View All History* and *Add Log* sitting beneath them at
 * identical weight. The founders' review was that it read as visually messy,
 * and it was: three cards is more history than a routine screen owes you, and
 * two links of equal prominence make you read both to find out which is which.
 *
 * **Two rows, dividers instead of containers.** A log is a line of
 * information, not an object; giving each one a card made the section as
 * heavy as Today. `LogRow`'s card treatment is still what the full history
 * screen uses, where the rows *are* the content.
 *
 * **`+` for adding, a link for the rest.** Manual logging stays — backdated
 * entries, unscheduled doses and as-needed routines all need it — but it is a
 * compact control in the header rather than a peer of *View all*. Discoverable,
 * and no longer competing.
 *
 * Each row still opens its own entry, exactly as before.
 */
export function RecentActivity({ entries, onOpenEntry, onViewAll, onAdd }: Props) {
  const { surfaces } = useTheme();
  const recent = entries.slice(0, RECENT_LIMIT);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: surfaces.text }]}>Recent activity</Text>
        <PressableScale
          onPress={onAdd}
          hitSlop={10}
          accessibilityLabel="Add log"
          accessibilityHint="Records an administration for any day"
          style={styles.add}
        >
          <Ionicons name="add" size={20} color={palette.peptide} />
        </PressableScale>
      </View>

      {recent.length === 0 ? (
        // Compact and factual — an empty history is not an event.
        <Text style={[styles.empty, { color: surfaces.textTertiary }]}>No activity yet</Text>
      ) : (
        <View>
          {recent.map((entry, index) => {
            const amount = formatMcg(entry.amount.amountMcg, entry.amount.authoredUnit);
            const units = entry.calculationSnapshot
              ? formatSyringeUnits(entry.calculationSnapshot.calculatedUnits)
              : null;
            const when = whenLabel(entry);

            return (
              <PressableScale
                key={entry.id}
                onPress={() => onOpenEntry(entry.id)}
                style={[
                  styles.row,
                  index > 0 && styles.divided,
                  index > 0 && { borderTopColor: surfaces.border },
                ]}
                accessibilityLabel={`${amount}${units ? `, ${units}` : ''}${
                  entry.site ? `, ${entry.site.label}` : ''
                }, ${when}`}
                accessibilityHint="Opens this log"
              >
                <View style={styles.rowText}>
                  <Text style={[styles.amount, { color: surfaces.text }]} numberOfLines={1}>
                    {amount}
                    {units ? (
                      <Text style={[styles.units, { color: surfaces.textSecondary }]}> · {units}</Text>
                    ) : null}
                  </Text>
                  <Text style={[styles.when, { color: surfaces.textTertiary }]} numberOfLines={2}>
                    {entry.site ? `${entry.site.label} · ${when}` : when}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={surfaces.textTertiary} />
              </PressableScale>
            );
          })}
        </View>
      )}

      {entries.length > 0 ? (
        <PressableScale
          onPress={onViewAll}
          hitSlop={8}
          accessibilityLabel="View all history"
          style={styles.link}
        >
          <Text style={[styles.linkLabel, { color: palette.peptide }]}>View all history</Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    minHeight: 32,
  },
  title: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  add: {
    minWidth: 32,
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 52,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  amount: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
  units: {
    ...typography.caption,
    fontSize: 14,
    fontWeight: '400',
  },
  when: {
    ...typography.caption,
    fontSize: 13.5,
  },
  empty: {
    ...typography.caption,
    fontSize: 14,
    paddingVertical: spacing.s,
  },
  link: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  linkLabel: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
});
