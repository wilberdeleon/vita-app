import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The three utilities, and their real routes.
 *
 * Every one goes somewhere that exists today. There is **no BMI tile, no
 * Reference tile and no Coming Soon** — slice 4.2 settled that a dead entry
 * is worse than a short list, and 5.8 owns BMI.
 *
 * The scanner route was read from the codebase rather than guessed: Fuel's
 * own quick actions push `/fuel/scan`, and this is the same production
 * screen with no new scanning work of any kind.
 *
 * Colour follows the domain each tool serves — the convention slice 4.2
 * established on the Tools hub, where a tool's icon colour tracks its domain
 * rather than the screen it sits on.
 */
const TOOLS = [
  {
    id: 'calculator',
    label: 'Calculator',
    spoken: 'Peptide Calculator',
    icon: 'calculator-outline',
    color: palette.peptide,
    route: '/tools/peptide-calculator',
  },
  {
    id: 'sites',
    label: 'Sites',
    spoken: 'Injection Sites',
    icon: 'body-outline',
    color: palette.peptide,
    route: '/tools/injection-sites',
  },
  {
    id: 'scanner',
    label: 'Scan',
    spoken: 'Food Scanner',
    icon: 'barcode-outline',
    color: palette.primary,
    route: '/fuel/scan',
  },
] as const;

/**
 * Quick Tools — the one place on Home where tiles are the right answer.
 *
 * Everything else on this screen is state you read; these are three things
 * you *do*, and a row of small tactile targets is what a utility drawer
 * should look like. That is not the launcher the founders ruled against: the
 * launcher risk was the five *domains* rendered as equal icon cards, which
 * would have replaced meaningful state with navigation. Utilities have no
 * state to replace.
 *
 * Three across, sized by flex so they hold at the narrowest supported width.
 * **There is no fourth tile**, because there is no fourth tool — padding the
 * row for symmetry is how a Coming Soon gets invented.
 */
export function QuickTools() {
  const { surfaces } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: surfaces.textTertiary }]}>QUICK TOOLS</Text>
        {/*
          * The full destination stays reachable without a second module
          * competing with the tiles: three shortcuts and one quiet link, not
          * a Quick Tools section *and* a Tools row saying much the same
          * thing. Settings still lists Tools & Reference too.
          */}
        <PressableScale
          onPress={() => router.push('/tools')}
          hitSlop={8}
          accessibilityLabel="All tools"
          accessibilityHint="Opens Tools and Reference"
        >
          <Text style={[styles.all, { color: surfaces.textSecondary }]}>All tools</Text>
        </PressableScale>
      </View>

      <View style={styles.row}>
        {TOOLS.map((tool) => (
          // Wrapped: `PressableScale` applies its style to an inner view, so
          // a flex basis handed to it never reaches this row.
          <View key={tool.id} style={styles.slot}>
            <PressableScale
              style={[styles.tile, { borderColor: surfaces.border }]}
              onPress={() => router.push(tool.route)}
              accessibilityLabel={tool.spoken}
              accessibilityHint={`Opens ${tool.spoken}`}
            >
              <Ionicons name={tool.icon} size={19} color={tool.color} />
              <Text style={[styles.label, { color: surfaces.text }]} numberOfLines={1}>
                {tool.label}
              </Text>
            </PressableScale>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  all: {
    ...typography.caption,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  slot: {
    flex: 1,
  },
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingVertical: spacing.m,
    minHeight: 62,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
