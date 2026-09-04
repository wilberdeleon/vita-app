import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../../../components/ui';
import { VitaMark } from '../../../components/shell/VitaMark';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { Greeting } from '../greeting';
import type { Quote } from '../quote';

type Props = {
  greeting: Greeting;
  firstName: string;
  /** Today, compact — "Thu, Sep 3". */
  dateLabel: string;
  quote: Quote;
  onCustomize: () => void;
};

/**
 * The top of Home: branding, greeting, a line of character, and the date.
 *
 * **One composition, not three stacked blocks** (founder review of 5.3A). The
 * greeting sat a full 20pt below the wordmark, which read as two unrelated
 * headers; the whole group is now tight enough to scan as a unit.
 *
 * **The greeting stays an eyebrow.** Small, uppercase, gold, time-aware. It
 * was a 26px headline in 5.3 and that was the first thing the founders
 * rejected; it is not going back.
 *
 * **The quote is where VITA's personality lives now**, which is exactly why
 * nothing else on the screen tries to have any. A quote someone is on record
 * as having said is content; `Stay on track` is the app commenting on your
 * behaviour, and that is the thing that has been removed twice. The
 * attribution is deliberately much quieter than the line — it credits without
 * competing.
 *
 * **The date chip is inert and announced as text.** VITA has no calendar
 * destination, and styling a control that goes nowhere is the dead-affordance
 * problem slice 4.1 cleaned out of Settings.
 *
 * **Two controls, and they are different things.** Settings stays top-right
 * where the founders fixed it; `•••` changes this screen only. The header
 * itself is structural and cannot be hidden or reordered.
 */
export function DashboardHeader({ greeting, firstName, dateLabel, quote, onCustomize }: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces } = useTheme();

  return (
    <View style={{ paddingTop: insets.top + spacing.xs }}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <VitaMark size={28} color={palette.gold} />
          <Text style={[styles.wordmark, { color: surfaces.text }]}>VITA</Text>
        </View>

        <View style={styles.controls}>
          <PressableScale
            onPress={onCustomize}
            hitSlop={10}
            accessibilityLabel="Customize Home"
            accessibilityHint="Choose which sections appear, their size and their order"
            style={styles.control}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={surfaces.text} />
          </PressableScale>

          <PressableScale
            onPress={() => router.push('/settings')}
            hitSlop={10}
            accessibilityLabel="Settings"
            style={styles.control}
          >
            <Ionicons name="settings-outline" size={20} color={surfaces.text} />
          </PressableScale>
        </View>
      </View>

      {/* Tight to the bar above — the founders' specific note on 5.3A. */}
      <Text style={[styles.greeting, { color: palette.gold }]} numberOfLines={1}>
        {greeting.label.toUpperCase()}, {firstName.toUpperCase()}
      </Text>

      <View style={styles.row}>
        <View
          style={styles.quoteBlock}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${quote.text} — ${quote.attribution}`}
        >
          <Text style={[styles.quote, { color: surfaces.text }]}>{quote.text}</Text>
          <Text style={[styles.attribution, { color: surfaces.textTertiary }]}>
            {quote.attribution}
          </Text>
        </View>

        <View
          style={[styles.dateChip, { borderColor: surfaces.border }]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Today, ${dateLabel}`}
        >
          <Ionicons name="calendar-outline" size={13} color={surfaces.textTertiary} />
          <Text style={[styles.dateLabel, { color: surfaces.textSecondary }]}>{dateLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  wordmark: {
    ...typography.title,
    fontSize: 21,
    letterSpacing: 5,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.l,
  },
  control: {
    minWidth: 28,
    alignItems: 'center',
  },
  greeting: {
    ...typography.micro,
    letterSpacing: 1.2,
    fontWeight: '600',
    marginTop: spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.m,
    marginTop: spacing.xs,
  },
  quoteBlock: {
    flex: 1,
    gap: 1,
  },
  quote: {
    ...typography.heading,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  attribution: {
    ...typography.caption,
    fontSize: 12,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
  },
  dateLabel: {
    ...typography.caption,
  },
});
