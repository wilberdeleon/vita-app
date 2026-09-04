import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../../../components/ui';
import { VitaMark } from '../../../components/shell/VitaMark';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { Greeting } from '../greeting';

type Props = {
  greeting: Greeting;
  firstName: string;
  /** Today, compact — "Thu, Sep 3". */
  dateLabel: string;
  /** The one factual line, or null when there is nothing worth saying. */
  summary: string | null;
  onCustomize: () => void;
};

/**
 * The top of Home: who, when, what today holds, and the two controls.
 *
 * **The greeting is context, not a headline** (founder review of 5.3). It ran
 * at 26px and still dominated the first viewport; it is now an eyebrow — small,
 * uppercase, in the brand gold — which is the weight a salutation earns. The
 * space that bought goes to the summary line and the modules below.
 *
 * It stays time-aware, and it is still the only warmth on the screen.
 *
 * **The line under it is a fact, never encouragement.** `1 routine scheduled ·
 * 28 fl oz to go` is worth reading; `Stay on track` is not, and neither is a
 * score assembled out of numbers held for other purposes. When the domains
 * have nothing to report the line is simply absent — see `dailySummary.ts`.
 *
 * **The date is a chip, and deliberately inert.** It reads as a small utility
 * because that is what it is: there is no calendar destination in VITA, and
 * styling it as a button that goes nowhere would be the dead-affordance
 * problem Settings was cleaned of in slice 4.1. It is a label with a border,
 * announced as text.
 *
 * **Two controls, and they are different things.** Settings stays top-right,
 * exactly where the founders fixed it. *Customize* sits beside it and changes
 * this screen only — it is not a second settings entry, and the header itself
 * (branding, greeting, date, Settings) is structural and cannot be hidden.
 */
export function DashboardHeader({ greeting, firstName, dateLabel, summary, onCustomize }: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces } = useTheme();

  return (
    <View style={{ paddingTop: insets.top + spacing.s }}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <VitaMark size={30} color={palette.gold} />
          <Text style={[styles.wordmark, { color: surfaces.text }]}>VITA</Text>
        </View>

        <View style={styles.controls}>
          <PressableScale
            onPress={onCustomize}
            hitSlop={10}
            accessibilityLabel="Customize Home"
            accessibilityHint="Choose which sections appear and their order"
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

      <View style={styles.context}>
        <View style={styles.contextText}>
          <Text style={[styles.greeting, { color: palette.gold }]} numberOfLines={1}>
            {greeting.label.toUpperCase()}, {firstName.toUpperCase()}
          </Text>
          {summary ? (
            <Text style={[styles.summary, { color: surfaces.text }]} numberOfLines={2}>
              {summary}
            </Text>
          ) : null}
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
    minHeight: 44,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  wordmark: {
    ...typography.title,
    fontSize: 22,
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
  context: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.m,
    marginTop: spacing.l,
  },
  contextText: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    ...typography.micro,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  summary: {
    ...typography.bodyMedium,
    fontWeight: '600',
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
