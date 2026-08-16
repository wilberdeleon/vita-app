import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Explicit override. Unset, the label follows the active theme's tertiary
   * text color. 'light' forces the white treatment for use over a dark
   * glass/photo background regardless of theme.
   */
  tone?: 'dark' | 'light';
};

export function SectionHeader({ title, actionLabel, onAction, tone = 'dark' }: Props) {
  const { scheme, surfaces } = useTheme();
  const light = tone === 'light';
  // Ink is the brand's structural accent in light mode; on a near-black
  // background it disappears, so the action falls back to primary text.
  const actionColor = scheme === 'dark' ? surfaces.text : palette.ink;

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: surfaces.textTertiary }, light && styles.titleLight]}>
        {title.toUpperCase()}
      </Text>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={[styles.action, { color: actionColor }, light && styles.actionLight]}>{actionLabel}</Text>
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
    letterSpacing: 0.8,
  },
  titleLight: {
    color: palette.textOnColor,
    opacity: 0.8,
  },
  action: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
  actionLight: {
    color: palette.textOnColor,
  },
});
