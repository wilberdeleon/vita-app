import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../theme/tokens';

/**
 * Dormant. Real sign-in ships with the authentication sprint; this screen
 * exists so the (auth) route group and gate architecture are in place.
 */
export default function SignIn() {
  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>VITA</Text>
      <Text style={styles.note}>Sign in arrives in a later sprint.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  wordmark: {
    ...typography.display,
    color: palette.primary,
    letterSpacing: 6,
  },
  note: {
    ...typography.caption,
    color: palette.textTertiary,
  },
});
