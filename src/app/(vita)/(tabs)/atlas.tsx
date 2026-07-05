import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen, ScreenHeader } from '../../../components/ui';
import { palette, spacing, typography } from '../../../theme/tokens';

/**
 * Version 1 scope (founder decision): Atlas is a polished Work in Progress
 * experience only. AI coaching ships in a future release.
 */
export default function Atlas() {
  return (
    <Screen dockClearance scroll={false}>
      <View style={styles.header}>
        <ScreenHeader title="Atlas" settings />
      </View>
      <View style={styles.center}>
        <View style={styles.orb}>
          <Ionicons name="sparkles" size={44} color={palette.peptide} />
        </View>
        <Text style={styles.wip}>WORK IN PROGRESS</Text>
        <Text style={styles.body}>
          Atlas is being built to be your ultimate{'\n'}AI Health Coach.
        </Text>
        <Text style={styles.soon}>Coming soon.</Text>
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
    paddingBottom: spacing.xxxl * 2,
  },
  orb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.peptideSoft,
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
    color: palette.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  soon: {
    ...typography.caption,
    color: palette.textTertiary,
  },
});
