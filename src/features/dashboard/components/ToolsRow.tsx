import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  onOpen: () => void;
};

/**
 * Tools, discoverable without turning Home into a launcher.
 *
 * **One row to one destination, not a grid of every utility.** The founder
 * ruling is precise on this: Tools gets a real presence on Home, and Home
 * does not become a screen of icons. So the tools are *named* — a person
 * scanning Home learns that a peptide calculator and injection sites exist —
 * but there is one tap target, and it goes to the hub that already owns them.
 *
 * Until now Tools was reachable only through Settings, which is a filing
 * decision rather than a discovery one: a calculator is not a preference, and
 * slice 4.2 already moved its *route* out of Settings for exactly that
 * reason. This finishes the thought on the surface people actually open.
 *
 * **Visually the quietest thing on the screen**, and that is the point.
 * Utilities are used occasionally; the domains above are used daily. Nothing
 * here is a metric, so nothing here competes with one.
 *
 * The subtitle names only what exists today. **No BMI row, no Reference row,
 * no Coming Soon** — slice 4.2 established that a dead entry is worse than a
 * short list, and 5.8 owns BMI.
 */
export function ToolsRow({ onOpen }: Props) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      style={[styles.row, { borderTopColor: surfaces.border }]}
      onPress={onOpen}
      accessibilityLabel="Tools and Reference. Peptide Calculator and Injection Sites"
      accessibilityHint="Opens tools and reference"
    >
      <Ionicons name="construct-outline" size={17} color={surfaces.textSecondary} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: surfaces.text }]}>Tools &amp; Reference</Text>
        <Text style={[styles.subtitle, { color: surfaces.textTertiary }]} numberOfLines={1}>
          Peptide Calculator · Injection Sites
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.l,
    // A hairline instead of a container: the row is separated from what is
    // above it without becoming another rounded rectangle.
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
  },
});
