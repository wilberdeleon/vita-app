import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { IconBadge } from './IconBadge';
import { PressableScale } from './PressableScale';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * The glyph's colour. Unset, `'card'` takes Fuel orange (unchanged at
   * every existing call site) and `'flat'` takes the theme's secondary text
   * — because a flat row's natural home is Settings, where orange would
   * claim a Fuel identity that a preference does not have.
   */
  iconColor?: string;
  title: string;
  subtitle?: string;
  /** Trailing text, e.g. "300 cal" or "24 fl oz". */
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
  /** Spoken after the title — e.g. what opening the row does. */
  accessibilityHint?: string;
  /** Trailing element overriding value/chevron (e.g. a heart icon). */
  trailing?: React.ReactNode;
  /**
   * Leading element overriding the icon badge — used where the row shows a
   * real product photograph rather than a glyph. `icon` is ignored when
   * this is set.
   */
  leading?: React.ReactNode;
  /**
   * `'card'` — the original: a rounded, bordered, shadowed surface. Every
   * caller that existed before 2026-09-15 gets it, so no screen changes.
   *
   * `'flat'` — the same row, **direct on the background**, separated from its
   * neighbour by a hairline instead of by air.
   *
   * ## Why the variant exists
   *
   * A card is the right container for a row you might act on in isolation —
   * a meal, a logged food, a search result. It is the wrong one for a *list*
   * of them: eight cards in a column is eight floating objects, which is the
   * "card soup" the Sprint 5 identity work exists to remove. Settings was
   * the clearest case in the app — six rounded, shadowed cards carrying six
   * short facts, filling a whole screen.
   *
   * This was scheduled rather than invented: the Migration Guide has listed
   * *"a flat in-panel `ListRow` variant — today each row carries its own
   * border and shadow, so a list reads as a stack of cards"* as 5.7's work
   * since slice 5.1.
   *
   * The geometry is **not new either.** It is the row Peptides Home's *Your
   * routines* region has drawn since 5.4 and Fuel Home's meals since 5.6B —
   * hairline top rule, `spacing.m` vertical padding, a 56pt floor, a 16pt
   * tertiary chevron — lifted here so the two stop being the same design
   * written out twice. The leading hairline is deliberate: it reads as the
   * group's opening rule, exactly as it does on Peptides.
   */
  variant?: 'card' | 'flat';
};

/** A row — a meal, a log entry, a setting. Card by default, flat in a list. */
export function ListRow({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  chevron = false,
  onPress,
  accessibilityHint,
  trailing,
  leading,
  variant = 'card',
}: Props) {
  const { surfaces } = useTheme();
  const flat = variant === 'flat';
  const glyph = iconColor ?? (flat ? surfaces.textSecondary : palette.primary);

  return (
    <PressableScale
      onPress={onPress}
      disabled={!onPress}
      accessibilityHint={accessibilityHint}
      style={
        flat
          ? [styles.flatRow, { borderTopColor: surfaces.border }]
          : [styles.row, { backgroundColor: surfaces.card, borderColor: surfaces.border }]
      }
      pressedScale={flat ? 0.99 : 0.98}
    >
      {/* A flat row takes the bare glyph. The orb is what made a row a card
          in miniature, and at 36pt it was the loudest thing in it. */}
      {leading ?? (icon === undefined ? null : flat ? (
        <Ionicons name={icon} size={19} color={glyph} />
      ) : (
        <IconBadge icon={icon} color={glyph} />
      ))}
      <View style={styles.textBlock}>
        {/*
          * A flat row lets its title wrap to two lines; a card still caps at
          * one. Settings titles are the shortest strings in the app at the
          * default text size and among the longest at accessibility sizes,
          * and §32 forbids clipping a value to protect a layout. Two lines is
          * what the locked Peptides row allows, for the same reason.
          */}
        <Text style={[styles.title, { color: surfaces.text }]} numberOfLines={flat ? 2 : 1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: surfaces.textTertiary }]} numberOfLines={flat ? 2 : 1}>
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
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    /* The same 56pt floor the locked Peptides and Fuel rows keep, so a
       one-line row and a two-line row still scan as one list. */
    minHeight: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
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
