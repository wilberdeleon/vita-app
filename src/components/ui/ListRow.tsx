import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';
import { IconBadge } from './IconBadge';
import { PressableScale } from './PressableScale';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  /** Trailing text, e.g. "300 kcal" or "5 / 8 cups". */
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
  /** Trailing element overriding value/chevron (e.g. a heart icon). */
  trailing?: React.ReactNode;
};

/** Card-style row — meals, log entries, settings items. */
export function ListRow({ icon, iconColor = palette.primary, title, subtitle, value, chevron = false, onPress, trailing }: Props) {
  return (
    <PressableScale onPress={onPress} disabled={!onPress} style={styles.row} pressedScale={0.98}>
      {icon ? <IconBadge icon={icon} color={iconColor} /> : null}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {trailing ?? (
        <View style={styles.trailing}>
          {value ? <Text style={styles.value}>{value}</Text> : null}
          {chevron ? <Ionicons name="chevron-forward" size={16} color={palette.textTertiary} /> : null}
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
    backgroundColor: palette.card,
    borderRadius: radii.card,
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
    color: palette.text,
  },
  subtitle: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.caption,
    color: palette.textSecondary,
  },
});
