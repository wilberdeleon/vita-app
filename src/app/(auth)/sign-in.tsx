import { StyleSheet, Text, View } from 'react-native';
import { VitaMark } from '../../components/shell/VitaMark';
import { palette, spacing, typography } from '../../theme/tokens';

/**
 * Dormant. Real sign-in ships with the authentication sprint; this screen
 * exists so the (auth) route group and gate architecture are in place.
 */
export default function SignIn() {
  return (
    <View style={styles.container}>
      <VitaMark size={120} />
      <Text style={styles.wordmark}>VITA</Text>
      <Text style={styles.note}>Sign in arrives in a later sprint.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  wordmark: {
    ...typography.display,
    color: palette.ink,
    letterSpacing: 10,
  },
  note: {
    ...typography.caption,
    color: palette.textTertiary,
    marginTop: spacing.m,
  },
});
