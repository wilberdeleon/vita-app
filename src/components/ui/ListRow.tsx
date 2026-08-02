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
  /**
   * Defaults to 'card' (unchanged everywhere else): its own white
   * background/radius/shadow. 'none' renders a transparent row with light
   * text, for callers (currently only the Home dashboard) who provide their
   * own surface, e.g. several rows inside one GlassSurface.
   */
  surface?: 'card' | 'none';
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
  surface = 'card',
}: Props) {
  const light = surface === 'none';
  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, light && styles.rowLight]}
      pressedScale={0.98}
    >
      {icon ? <IconBadge icon={icon} color={iconColor} /> : null}
      <View style={styles.textBlock}>
        <Text style={[styles.title, light && styles.titleLight]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, light && styles.subtitleLight]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        <View style={styles.trailing}>
          {value ? <Text style={[styles.value, light && styles.valueLight]}>{value}</Text> : null}
          {chevron ? (
            <Ionicons name="chevron-forward" size={16} color={light ? palette.textOnColor : palette.textTertiary} />
          ) : null}
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
  // Zero padding here (founders, 2026-07-18 surface-composition redesign) —
  // each meal now gets its OWN GlassSurface wrapper on Home, which owns the
  // padding instead, so this only needs to clear the old opaque row look.
  // Only reachable via surface="none", exclusive to Home, so Fuel/Settings/
  // Peptides rows (surface="card") are unaffected.
  rowLight: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
    color: palette.text,
  },
  titleLight: {
    color: palette.textOnColor,
  },
  subtitle: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  subtitleLight: {
    color: palette.textOnColor,
    opacity: 0.7,
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
  valueLight: {
    color: palette.textOnColor,
    opacity: 0.85,
  },
});
