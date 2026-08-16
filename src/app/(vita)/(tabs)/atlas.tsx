import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, ScreenHeader } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Version 1 scope (founder decision): Atlas is a polished Work in Progress
 * experience only. AI coaching ships in a future release.
 */
export default function Atlas() {
  const { surfaces } = useTheme();

  return (
    <Screen dockClearance scroll={false}>
      <View style={styles.header}>
        <ScreenHeader title="Atlas" settings />
      </View>
      <View style={styles.center}>
        {/* A 10% tint of Atlas purple rather than the fixed pastel
            `peptideSoft`, which glares as a bright blob on a black screen. */}
        <View style={[styles.orb, { backgroundColor: `${palette.peptide}1A` }]}>
          <Ionicons name="sparkles" size={44} color={palette.peptide} />
        </View>
        <Text style={styles.wip}>WORK IN PROGRESS</Text>
        <Text style={[styles.body, { color: surfaces.text }]}>
          Atlas is being built to be your ultimate{'\n'}AI Health Coach.
        </Text>
        <Text style={[styles.soon, { color: surfaces.textTertiary }]}>Coming soon.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.xxxl,
  },
  orb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  wip: {
    ...typography.captionMedium,
    color: palette.peptide,
    letterSpacing: 1.5,
  },
  body: {
    ...typography.heading,
    textAlign: 'center',
    lineHeight: 24,
  },
  soon: {
    ...typography.caption,
  },
});
