import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../theme/tokens';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Defaults to 'dark' (unchanged everywhere else). 'light' for use over a dark glass/photo background. */
  tone?: 'dark' | 'light';
};

export function SectionHeader({ title, actionLabel, onAction, tone = 'dark' }: Props) {
  const light = tone === 'light';
  return (
    <View style={styles.row}>
      <Text style={[styles.title, light && styles.titleLight]}>{title.toUpperCase()}</Text>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={[styles.action, light && styles.actionLight]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.s,
  },
  title: {
    ...typography.micro,
    color: palette.textTertiary,
    letterSpacing: 0.8,
  },
  titleLight: {
    color: palette.textOnColor,
    opacity: 0.8,
  },
  action: {
    ...typography.captionMedium,
    fontWeight: '600',
    color: palette.ink,
  },
  actionLight: {
    color: palette.textOnColor,
  },
});
