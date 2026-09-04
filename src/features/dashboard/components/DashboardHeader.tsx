import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { Greeting } from '../greeting';

type Props = {
  greeting: Greeting;
  firstName: string;
  /** Today, as a person reads it — "Wednesday, September 3". */
  dateLabel: string;
};

/**
 * The top of Home: who, when, and nothing else.
 *
 * **Both slogans are gone.** `Build with intention.` sat at 34px/800 — the
 * largest type anywhere in the app — and `YOUR DAY, YOUR DIRECTION.` beneath
 * it. The most visually dominant element on VITA's home screen was a line
 * that said nothing about the user's day. Neither was replaced with another
 * slogan; the space they held now belongs to the modules below.
 *
 * **The greeting stays and stays time-aware** — morning, afternoon, evening,
 * night, re-evaluated every minute so a screen left open across a boundary
 * flips on its own. It is the one piece of warmth on the screen and the
 * founders asked for it explicitly.
 *
 * **The name comes from `useAuth()`, not from a Dashboard fixture.** That is
 * the app's identity boundary: it reports a mock user today and a real one
 * when Supabase auth lands, and Home will not need to change. The fixture it
 * replaces was a Dashboard-owned constant, which is a different and worse
 * thing — a screen inventing a fact about the user.
 *
 * The date is a genuinely useful line and costs one row. It is deliberately
 * quiet: it orients, it is not the subject.
 */
export function DashboardHeader({ greeting, firstName, dateLabel }: Props) {
  const insets = useSafeAreaInsets();
  const { scheme, surfaces } = useTheme();
  const tone = scheme === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ paddingTop: insets.top + spacing.s }}>
      <ScreenHeader title="VITA" brand settings tone={tone} markColor={palette.gold} />

      <View style={styles.greeting}>
        <Text style={[styles.line, { color: surfaces.text }]} numberOfLines={2}>
          {greeting.label}, {firstName}.
        </Text>
        <Text style={[styles.date, { color: surfaces.textTertiary }]} numberOfLines={1}>
          {dateLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  line: {
    /**
     * Large enough to be the screen's opening statement, small enough not to
     * be its subject. The old headline ran to 34/800 for a slogan; the
     * subject of Home is what the modules say, not the salutation.
     */
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  date: {
    ...typography.caption,
  },
});
