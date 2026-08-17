import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  /** One short line. Describes the state, never scolds about it. */
  title: string;
  /** Optional second line — what to do about it, if there's something to do. */
  body?: string;
};

/**
 * The shared empty state. Sprint 2 introduces real data, which means real
 * empty days — and an empty day should look like a designed state rather
 * than a screen that failed to load.
 *
 * Deliberately quiet: tertiary text, an outline glyph, no illustration and
 * no call to action shouting at the user. Logging nothing yet is a normal
 * moment in a normal day, not a failure to correct — the same reasoning
 * behind VITA's no-guilt-mechanics rule.
 */
export function EmptyState({ icon, title, body }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.root}>
      <Ionicons name={icon} size={26} color={surfaces.textTertiary} />
      <Text style={[styles.title, { color: surfaces.textSecondary }]}>{title}</Text>
      {body ? <Text style={[styles.body, { color: surfaces.textTertiary }]}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.l,
  },
  title: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  body: {
    ...typography.caption,
    textAlign: 'center',
  },
});
