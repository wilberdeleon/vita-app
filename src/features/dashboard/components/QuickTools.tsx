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
 * `quickTools.ts`.
 *
 * ## Selecting none is a real answer (5.9B.1)
 *
 * It used to return `null` when every tool was deselected, which removed the
 * heading and the *All tools* link along with the tiles. The founder's ruling
 * is that an empty Quick Tools is a legitimate choice, so it now says so —
 * one quiet line, and the link out stays — because the state has to be
 * distinguishable from a bug and **must not strand anyone**: the way back to
 * the full directory, and to the customization sheet in the header, both
 * remain one tap away.
 *
 * Hiding the whole module is a different choice, made in Customize Home, and
 * that still removes this section entirely.
 *
 * **No Coming Soon and no placeholder tiles.** Slice 4.2 settled that a dead
 * entry is worse than a short list, and an empty row is not an invitation to
 * invent filler.
 */
export function QuickTools({ tools }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const shown = visibleTools(tools);
  const tileHeight = toolTileHeight(fontScale);
  /* A second line beats a clipped word — the tiles stay equal either way. */
  const labelLines = isCompactSquare(fontScale) ? 2 : 1;

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

      {shown.length === 0 ? (
        <Text style={[styles.empty, { color: surfaces.textTertiary }]}>
          No quick tools selected.
        </Text>
      ) : (
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
      )}
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
  /* One line where the tiles were. Deliberately not a card, a button or a
     call to action — the user chose this, and it only has to be legible. */
  empty: {
    ...typography.caption,
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
