import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { IconBadge } from './IconBadge';
import { PressableScale } from './PressableScale';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  /** Trailing text, e.g. "300 cal" or "5 / 8 cups". */
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
  /** Trailing element overriding value/chevron (e.g. a heart icon). */
  trailing?: React.ReactNode;
  /**
   * Leading element overriding the icon badge — used where the row shows a
   * real product photograph rather than a glyph. `icon` is ignored when
   * this is set.
   */
  leading?: React.ReactNode;
};

/** Card-style row — meals, log entries, settings items. */
export function ListRow({
  icon,
  iconColor = palette.primary,
  title,
  subtitle,
  value,
  chevron = false,
  onPress,
  trailing,
  leading,
}: Props) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
      pressedScale={0.98}
    >
      {leading ?? (icon ? <IconBadge icon={icon} color={iconColor} /> : null)}
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: surfaces.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: surfaces.textTertiary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        <View style={styles.trailing}>
          {value ? <Text style={[styles.value, { color: surfaces.textSecondary }]}>{value}</Text> : null}
          {chevron ? <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} /> : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderRadius: radii.card,
    borderWidth: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    ...shadows.card,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
  },
  subtitle: {
    ...typography.caption,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.caption,
  },
});
