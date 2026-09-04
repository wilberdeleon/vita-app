import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale } from '../../../components/ui';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { QUICK_TOOL_REGISTRY, visibleTools, type QuickToolsPrefs } from '../quickTools';
import { TYPE, isCompactSquare, toolTileHeight } from '../widget';

type Props = {
  tools: QuickToolsPrefs;
};

/**
 * Quick Tools — the one place on Home where tiles are the right answer.
 *
 * Everything else on this screen is state you read; these are things you *do*,
 * and a row of small tactile targets is what a utility drawer looks like. That
 * is not the launcher the founders ruled against: the launcher risk was the
 * five *domains* rendered as equal icon cards, replacing meaningful state with
 * navigation. Utilities have no state to replace.
 *
 * **Every tile is the same size**, like the square widgets above, so the row
 * reads as a set. Which tools appear and in what order is the user's — see
 * `quickTools.ts` — and the section disappears entirely rather than showing a
 * heading over nothing if they hide all three.
 *
 * **No BMI, no Reference, no Coming Soon.** Slice 4.2 settled that a dead
 * entry is worse than a short list, and 5.8 owns BMI.
 */
export function QuickTools({ tools }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const shown = visibleTools(tools);
  const tileHeight = toolTileHeight(fontScale);
  /* A second line beats a clipped word — the tiles stay equal either way. */
  const labelLines = isCompactSquare(fontScale) ? 2 : 1;

  if (shown.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: surfaces.textTertiary }]}>QUICK TOOLS</Text>
        {/*
          * The full destination stays reachable without a second module
          * competing with the tiles — three shortcuts and one quiet link, not
          * a Quick Tools section *and* a Tools row saying much the same thing.
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
        {shown.map((id) => {
          const tool = QUICK_TOOL_REGISTRY[id];
          return (
            // Wrapped: `PressableScale` applies its style to an inner view, so
            // a flex basis handed to it never reaches this row.
            <View key={id} style={styles.slot}>
              <PressableScale
                style={[styles.tile, { borderColor: surfaces.border, height: tileHeight }]}
                onPress={() => router.push(tool.route)}
                accessibilityLabel={tool.name}
                accessibilityHint={tool.hint}
              >
                <Ionicons name={tool.icon} size={19} color={tool.color} />
                <Text style={[styles.label, { color: surfaces.text }]} numberOfLines={labelLines}>
                  {tool.label}
                </Text>
              </PressableScale>
            </View>
          );
        })}
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
    fontSize: TYPE.sectionHeading,
    letterSpacing: 0.8,
  },
  all: {
    ...typography.caption,
    fontSize: TYPE.quietLink,
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
    paddingHorizontal: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontSize: TYPE.toolLabel,
    fontWeight: '600',
    textAlign: 'center',
  },
});
