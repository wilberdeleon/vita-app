import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../theme/tokens';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
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
  action: {
    ...typography.captionMedium,
    fontWeight: '600',
    color: palette.ink,
  },
});
