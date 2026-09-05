import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { ResolvedSetup } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  pending: readonly ResolvedSetup[];
  onOpen: (item: ResolvedSetup) => void;
};

/**
 * Routines that were added but never configured — one quiet line.
 *
 * **It used to be a section header, a card, and a row per routine.** For what
 * is usually a single unfinished item, that was three levels of chrome
 * competing with Today. It is now one notice.
 *
 * **Unfinished, not wrong.** No warning colour, no alert glyph, no urgency:
 * nothing has gone bad, the user simply has not finished something. The
 * feature colour marks it as actionable and that is all.
 *
 * With more than one pending, the line states the count and opens the first;
 * finishing it decrements the count and the notice stays for the next. The
 * spoken hint always names the routine being opened, so a screen-reader user
 * is never taken somewhere unannounced.
 */
export function NeedsSetupNotice({ pending, onOpen }: Props) {
  const { surfaces } = useTheme();
  if (pending.length === 0) return null;

  const first = pending[0];
  const label =
    pending.length === 1 ? `Finish setting up ${first.name}` : `${pending.length} routines need setup`;

  return (
    <PressableScale
      onPress={() => onOpen(first)}
      style={[styles.notice, { borderColor: surfaces.border }]}
      accessibilityLabel={label}
      accessibilityHint={`Opens setup for ${first.name}`}
    >
      <View style={[styles.dot, { backgroundColor: palette.peptide }]} />
      <Text style={[styles.label, { color: surfaces.text }]} numberOfLines={2}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.control,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 48,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    flex: 1,
  },
});
