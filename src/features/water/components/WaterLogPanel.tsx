import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState } from '../../../components/ui';
import { formatEntered, type WaterEntry } from '../../../lib/water';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  entries: readonly WaterEntry[];
  isLoading: boolean;
  onDelete: (entry: WaterEntry) => void;
};

/**
 * Today's drinks — rows in one panel, not a card each.
 *
 * That is the Design System's conclusion from Fuel's refinement slice: where
 * a screen shows several peer items, a card per item spends its border,
 * shadow, and padding on emptiness. Water logs are short lines — an amount
 * and a time — so a card around each would be almost entirely padding.
 *
 * **Each row shows what the user typed**, not the canonical millilitres. Some
 * of these are `1 cup` and some are `500 mL`, and rewriting them into one unit
 * would quietly discard the snapshot the entry stores precisely so it can't
 * be. The canonical value is implementation detail and never appears here.
 *
 * Tapping the row opens the editor; delete is an explicit trailing control
 * rather than a swipe, matching the Food Log. Swipe is invisible until
 * discovered, and the Undo toast makes a confirm dialog unnecessary — the
 * action is reversible, so it does not need a gate in front of it.
 */
export function WaterLogPanel({ entries, isLoading, onDelete }: Props) {
  const { surfaces } = useTheme();

  if (entries.length === 0) {
    return isLoading ? null : (
      <EmptyState
        icon="water-outline"
        title="No water logged yet"
        body="Add your first drink of the day."
      />
    );
  }

  return (
    <Card style={styles.panel}>
      {entries.map((entry, index) => {
        const amount = formatEntered(entry.enteredAmount, entry.enteredUnit);
        return (
          <View
            key={entry.id}
            style={[index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
          >
            <View style={styles.row}>
              <Pressable
                onPress={() => router.push(`/water/entry/${encodeURIComponent(entry.id)}`)}
                accessibilityRole="button"
                accessibilityLabel={`${amount} at ${timeLabel(entry.loggedAt)}. Edit`}
                style={styles.body}
              >
                <Ionicons name="water" size={18} color={palette.water} />
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
          </View>
        );
      })}
    </Card>
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
  panel: {
    paddingVertical: spacing.xs,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    // Keeps the tap target comfortable even when the text is short.
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
