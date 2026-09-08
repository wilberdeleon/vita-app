import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { FoodEntry } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { dayStripItems, spokenStripItem } from '../dayStrip';
import { mealAccent } from '../mealAccent';
import { FoodAvatar } from './FoodAvatar';

type Props = {
  entries: readonly FoodEntry[];
  onOpenEntry: (entryId: string) => void;
};

/** The avatar at default text size. Grows with the system scale. */
const NODE = 48;

/** The empty day's resting marker — smaller, because it marks an absence. */
const RESTING_NODE = 32;

/**
 * **Fuel's identity object** — today's food, along today.
 *
 * ## Why a strip of food and not a calorie ring
 *
 * Water has a vessel that fills. Peptides has a timeline of discrete states.
 * Fuel had a calorie ring, which is the one object every calorie counter
 * ever built already has, and which answers *how am I scoring* rather than
 * the question this screen exists for: **what did I eat today?**
 *
 * The strip is built from the food artwork VITA already owns —
 * `foodVisual` resolves a real product photograph first and falls back to a
 * hand-drawn category illustration, with an honest generic when the name
 * says nothing reliable. That resolver is the most distinctive asset in the
 * Fuel codebase and was previously used at 36pt inside list rows while a
 * ring took the top of the screen.
 *
 * ## Structure
 *
 * A hairline rail with the day's foods placed along it in the order they
 * were logged, each with the time beneath. The rail is the same device the
 * Peptides week strip uses and is proven in both themes: **one neutral
 * weight end to end — it does not fill, and it carries no proportion of
 * anything.** Nothing here is a progress bar in disguise.
 *
 * A small meal marker sits above the first item of each meal, so breakfast
 * and lunch are legible as blocks without labelling every single item.
 *
 * ## It scrolls rather than compresses
 *
 * A fifteen-item day is a real day. The strip scrolls horizontally so no
 * food is ever silently dropped, shrunk past legibility, or hidden behind a
 * "+9" — the record has to be complete to be a record.
 *
 * ## Empty is a state, not a failure — and a small one
 *
 * An empty day shows the rail and one resting marker rather than a wall of
 * zeroes. It is deliberately **slighter than the strip with food in it**: from
 * 5.6B.2 the Nutrition section above already says `No food logged today` in
 * words, and Meals below lists four slots with nothing in them, so a
 * full-height empty hero here would be the third statement of the same fact
 * and the void the founder's device review objected to. A short resting rail
 * marks where the day will be drawn and gets out of the way.
 */
export function DayStrip({ entries, onOpenEntry }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();

  /* Grows with the text, like the Peptides nodes — a fixed avatar beside
     30pt type reads as an afterthought. */
  const scale = Math.min(Math.max(fontScale, 1), 1.6);
  const node = Math.round(NODE * scale);
  /* The resting marker is a placeholder, not a food: two thirds of the size,
     so an untouched day reads as a thin line rather than an empty hero. */
  const restingNode = Math.round(RESTING_NODE * scale);
  const items = dayStripItems(entries);

  if (items.length === 0) {
    return (
      <View
        style={styles.empty}
        accessible
        accessibilityRole="text"
        accessibilityLabel="Nothing logged yet today"
      >
        <View style={[styles.emptyRail, { backgroundColor: surfaces.border }]} />
        <View
          style={[
            styles.restingNode,
            {
              width: restingNode,
              height: restingNode,
              borderRadius: restingNode / 2,
              borderColor: surfaces.border,
              backgroundColor: surfaces.background,
            },
          ]}
        >
          <Ionicons name="restaurant-outline" size={restingNode * 0.45} color={surfaces.textTertiary} />
        </View>
        <View style={[styles.emptyRail, { backgroundColor: surfaces.border }]} />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.track}
      accessibilityLabel="Today's food, in the order it was logged"
    >
      {items.map((item, index) => (
        <View key={item.entry.id} style={styles.cell}>
          {/*
            * The meal, marked once where it begins rather than on every item
            * — four repetitions of "Breakfast" is noise, not context.
            *
            * Tinted with Fuel's own meal language: breakfast reads as
            * sunrise, lunch as midday, dinner as a deeper sunset, and snacks
            * deliberately breaks the sequence because a snack happens at any
            * hour. One word of colour, and the day reads as a day.
            */}
          <Text
            style={[
              styles.meal,
              { color: item.startsMeal ? mealAccent(item.meal).color : 'transparent' },
            ]}
            numberOfLines={1}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {item.startsMeal ? item.meal : '·'}
          </Text>

          <View style={styles.nodeRow}>
            {/* Two halves rather than one line behind everything, so the
                rail needs no measurement and survives any text size. */}
            <View
              style={[
                styles.rail,
                { backgroundColor: index === 0 ? 'transparent' : surfaces.border },
              ]}
            />
            <Pressable
              onPress={() => onOpenEntry(item.entry.id)}
              accessibilityRole="button"
              accessibilityLabel={spokenStripItem(item)}
              accessibilityHint="Opens this entry"
              style={({ pressed }) => [styles.node, pressed && styles.pressed]}
            >
              <FoodAvatar food={item.entry} size={node} />
            </Pressable>
            <View
              style={[
                styles.rail,
                { backgroundColor: index === items.length - 1 ? 'transparent' : surfaces.border },
              ]}
            />
          </View>

          <Text style={[styles.time, { color: surfaces.textTertiary }]} numberOfLines={1}>
            {item.timeLabel}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  track: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  cell: {
    alignItems: 'center',
    gap: 2,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rail: {
    height: StyleSheet.hairlineWidth,
    width: spacing.m,
  },
  node: {
    // The avatar paints over the rail, so the line is interrupted by the
    // food rather than drawn through it.
    borderRadius: 999,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.6,
  },
  meal: {
    ...typography.micro,
    letterSpacing: 0.4,
  },
  time: {
    ...typography.micro,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // No vertical padding at all: the section gap above and below is the
    // whole of the empty strip's footprint.
  },
  emptyRail: {
    height: StyleSheet.hairlineWidth,
    // Longer than the segments between foods — with one marker there is
    // nothing to space, so the rail reads as the day rather than as a gap.
    flex: 1,
  },
  restingNode: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
