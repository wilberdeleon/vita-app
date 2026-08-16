import { StyleSheet, Text, View } from 'react-native';
import { VitaMark } from '../../components/shell/VitaMark';
import { palette, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Dormant. Real sign-in ships with the authentication sprint; this screen
 * exists so the (auth) route group and gate architecture are in place.
 */
export default function SignIn() {
  const { scheme, surfaces } = useTheme();
  const markColor = scheme === 'dark' ? surfaces.text : palette.ink;

  return (
    <View style={[styles.container, { backgroundColor: surfaces.background }]}>
      <VitaMark size={120} color={markColor} />
      <Text style={[styles.wordmark, { color: markColor }]}>VITA</Text>
      <Text style={[styles.note, { color: surfaces.textTertiary }]}>Sign in arrives in a later sprint.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  wordmark: {
    ...typography.display,
    letterSpacing: 10,
  },
  note: {
    ...typography.caption,
    marginTop: spacing.m,
  },
});
