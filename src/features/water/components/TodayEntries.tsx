import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { formatEntered, type WaterEntry } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  entries: readonly WaterEntry[];
  isLoading: boolean;
  onDelete: (entry: WaterEntry) => void;
};

/**
 * Today's drinks, disclosed rather than always open.
 *
 * **Every capability the panel this replaces had is still here** — tap a row
 * to edit, an explicit trailing control to remove, Undo through the caller's
 * toast. Nothing was dropped to make the screen tidier; the list is simply no
 * longer the second-largest thing on it.
 *
 * **Collapsed by default, and the header still answers the question.** "3
 * drinks" is what most people want from this section most of the time; the
 * individual rows are for the moment something looks wrong. That is the
 * progressive-disclosure rule from slice 5.1: the immediate fact stays
 * visible, the detail collapses.
 *
 * **Each row shows what the user typed**, not the canonical millilitres. Some
 * of these are `1 cup` and some are `500 mL`, and rewriting them into one
 * unit would discard the snapshot the entry stores precisely so it cannot be
 * — including for a drink logged in a unit the user no longer displays in.
 *
 * Delete is an explicit trailing control rather than a swipe, matching the
 * Food Log: swipe is invisible until discovered, and the Undo toast makes a
 * confirmation dialog unnecessary because the action is already reversible.
 */
export function TodayEntries({ entries, isLoading, onDelete }: Props) {
  const { surfaces } = useTheme();
  const [open, setOpen] = useState(false);

  if (isLoading) return null;

  const count = entries.length;
  const summary = count === 0 ? 'Nothing logged yet' : count === 1 ? '1 drink' : `${count} drinks`;

  return (
    <View>
      <PressableScale
        onPress={() => setOpen((current) => !current)}
        disabled={count === 0}
        accessibilityLabel={`Today's log, ${summary}`}
        accessibilityHint={count === 0 ? undefined : open ? 'Collapses the list' : 'Expands the list'}
        accessibilityState={{ expanded: open }}
        style={styles.header}
      >
        <Text style={[styles.title, { color: surfaces.text }]}>Today's log</Text>
        <Text style={[styles.summary, { color: surfaces.textTertiary }]}>{summary}</Text>
        {count > 0 ? (
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={surfaces.textTertiary}
          />
        ) : null}
      </PressableScale>

      {open && count > 0 ? (
        <View style={styles.list}>
          {entries.map((entry) => {
            const amount = formatEntered(entry.enteredAmount, entry.enteredUnit);
            return (
              <View
                key={entry.id}
                style={[styles.row, { borderTopColor: surfaces.border }]}
              >
                <Pressable
                  onPress={() => router.push(`/water/entry/${encodeURIComponent(entry.id)}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`${amount} at ${timeLabel(entry.loggedAt)}. Edit`}
                  style={styles.rowBody}
                >
                  <Ionicons name="water" size={16} color={palette.water} />
                  <Text style={[styles.amount, { color: surfaces.text }]}>{amount}</Text>
                  <Text style={[styles.time, { color: surfaces.textTertiary }]}>
                    {timeLabel(entry.loggedAt)}
                  </Text>
                </Pressable>

                <Pressable
                  hitSlop={10}
                  onPress={() => onDelete(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${amount}`}
                >
                  <Ionicons name="close-circle" size={20} color={surfaces.textTertiary} />
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

/**
 * The clock time a drink was logged, e.g. `2:15 PM`.
 *
 * Hand-formatted rather than via `toLocaleTimeString`, matching the reasoning
 * already recorded for `formatLogDateLong`: Hermes' Intl support varies by
 * platform and engine build, and VITA is a US-English product today.
 */
export function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.s,
    minHeight: 44,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
    flex: 1,
  },
  summary: {
    ...typography.caption,
  },
  list: {
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    minHeight: 28,
  },
  amount: {
    ...typography.bodyMedium,
    flex: 1,
  },
  time: {
    ...typography.caption,
  },
});
