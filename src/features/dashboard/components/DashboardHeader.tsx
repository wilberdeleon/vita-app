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
import { QUOTE_FONT, QUOTE_GOLD, daypartAccent } from '../widget';

type Props = {
  greeting: Greeting;
  firstName: string;
  /** Today, compact — "Thu, Sep 3". */
  dateLabel: string;
  quote: Quote;
  /** Home is being rearranged; the header offers the way out. */
  editing: boolean;
  onCustomize: () => void;
  onDoneEditing: () => void;
};

/**
 * The top of Home: branding, greeting, a line of character, and the date.
 *
 * **One composition, not three stacked blocks** (founder review of 5.3A). The
 * greeting sat a full 20pt below the wordmark, which read as two unrelated
 * headers; the whole group is now tight enough to scan as a unit.
 *
 * **The greeting stays an eyebrow, and now changes colour with the hour.**
 * Small, uppercase, time-aware — gold at sunrise, amber through the
 * afternoon, violet at dusk, indigo at night (`DAYPART_ACCENT`). It was a
 * 26px headline in 5.3 and that was the first thing the founders rejected; it
 * is not going back. The colour is decoration on words that already say the
 * time of day, so nothing is lost to a screen reader or to colour blindness.
 *
 * **The quote is where VITA's personality lives now**, which is exactly why
 * nothing else on the screen tries to have any. A quote someone is on record
 * as having said is content; `Stay on track` is the app commenting on your
 * behaviour, and that is the thing that has been removed twice. The
 * attribution is deliberately much quieter than the line — it credits without
 * competing — and is set on its own row with an em dash, the way a quotation
 * is actually attributed in print.
 *
 * **The quote is set in a classical serif** (`QUOTE_FONT`), italic, in a
 * restrained gold. That single typographic break is what makes it read as a
 * quotation rather than as more app copy, and it is the only place on Home
 * where the type changes. No new font ships: the face is one iOS already
 * carries.
 *
 * **The date chip is inert and announced as text.** VITA has no calendar
 * destination, and styling a control that goes nowhere is the dead-affordance
 * problem slice 4.1 cleaned out of Settings.
 *
 * **Two controls, and they are different things.** Settings stays top-right
 * where the founders fixed it; `•••` changes this screen only. The header
 * itself is structural and cannot be hidden or reordered.
 */
export function DashboardHeader({
  greeting,
  firstName,
  dateLabel,
  quote,
  editing,
  onCustomize,
  onDoneEditing,
}: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces, scheme } = useTheme();

  return (
    <View style={{ paddingTop: insets.top + spacing.xs }}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <VitaMark size={28} color={palette.gold} />
          <Text style={[styles.wordmark, { color: surfaces.text }]}>VITA</Text>
        </View>

        <View style={styles.controls}>
          {/*
            * While Home is being rearranged the header offers `Done` in place
            * of the two icons. A gesture-entered mode needs a visible,
            * labelled way out — tapping empty space is not discoverable, and
            * it is not reachable at all with VoiceOver.
            */}
          {editing ? (
            <PressableScale
              onPress={onDoneEditing}
              hitSlop={10}
              accessibilityLabel="Done rearranging Home"
              style={styles.done}
            >
              <Text style={[styles.doneLabel, { color: surfaces.text }]}>Done</Text>
            </PressableScale>
          ) : (
            <>
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
            </>
          )}
        </View>
      </View>

      {/* Tight to the bar above — the founders' specific note on 5.3A. */}
      <Text
        style={[styles.greeting, { color: daypartAccent(greeting.period, scheme) }]}
        numberOfLines={1}
      >
        {greeting.label.toUpperCase()}, {firstName.toUpperCase()}
      </Text>

      <View style={styles.row}>
        <View
          style={styles.quoteBlock}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`${quote.text} — ${quote.attribution}`}
        >
          <Text style={[styles.quote, { color: QUOTE_GOLD[scheme] }]}>{quote.text}</Text>
          <Text style={[styles.attribution, { color: surfaces.textTertiary }]}>
            — {quote.attribution}
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
    fontFamily: QUOTE_FONT,
    fontSize: 19,
    // A serif at this size does not need weight to carry; bolding it would
    // make the header shout, which is what the quote is here to avoid.
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0,
    lineHeight: 25,
  },
  attribution: {
    ...typography.caption,
    fontFamily: QUOTE_FONT,
    fontSize: 12,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  done: {
    paddingHorizontal: spacing.xs,
  },
  doneLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
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
