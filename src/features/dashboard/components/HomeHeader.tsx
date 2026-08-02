import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../../components/ui';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { Greeting } from '../greeting';

type Props = {
  greeting: Greeting;
  firstName: string;
};

const HEADLINE = 'Build with intention.';
const SUPPORTING_LINE = 'YOUR DAY, YOUR DIRECTION.';

/**
 * Home's header + greeting text (founders, 2026-07-18 clean redesign) —
 * replaces DashboardHero. No longer sits over a photo background, so it
 * carries no text-shadow/per-period-offset legibility logic; colors come
 * straight from the active theme's surface text tokens.
 */
export function HomeHeader({ greeting, firstName }: Props) {
  const insets = useSafeAreaInsets();
  const { scheme, surfaces } = useTheme();
  const tone = scheme === 'dark' ? 'light' : 'dark';

  return (
    <View style={{ paddingTop: insets.top + spacing.s }}>
      <ScreenHeader title="VITA" brand settings tone={tone} markColor={palette.gold} />

      <View style={styles.greeting}>
        <Text style={[styles.greetingLine, { color: palette.gold }]} numberOfLines={1}>
          {greeting.label.toUpperCase()}, {firstName.toUpperCase()}
        </Text>
        <Text style={[styles.headline, { color: surfaces.text }]} numberOfLines={2}>
          {HEADLINE}
        </Text>
        <Text style={[styles.subline, { color: surfaces.textTertiary }]} numberOfLines={1}>
          {SUPPORTING_LINE}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    marginTop: spacing.xl,
    marginBottom: spacing.l,
  },
  greetingLine: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subline: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.6,
    marginTop: 8,
  },
});
