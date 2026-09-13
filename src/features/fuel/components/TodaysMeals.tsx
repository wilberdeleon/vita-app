import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatCalories,
  formatPortion,
  type FoodEntry,
  type MealSlot,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { mealGroups } from '../dayStrip';
import { mealAccent } from '../mealAccent';
import { FoodAvatar } from './FoodAvatar';

type Props = {
  entries: readonly FoodEntry[];
  onOpenEntry: (entryId: string) => void;
  onAddToMeal: (meal: MealSlot) => void;
};

/**
 * The four meals, compact and collapsible.
 *
 * ## What changed, twice
 *
 * The original was one card containing four rows, each saying *Breakfast ·
 * No foods logged · + Add food* whether or not anything had happened —
 * heavy, and on an untouched day a list of four things not done. 5.6B
 * removed the empty slots entirely, which went too far: the founder's review
 * was that the structure people navigate by had gone with the weight.
 *
 * **The slots are back; the bulk is not.** All four appear as one compact
 * line each, direct on the background with hairline dividers. A meal with
 * food shows its subtotal and opens; an empty one shows what it is and a
 * `+`.
 *
 * ## Collapsed by default
 *
 * The founder specifically asked to be able to minimise them. Every meal
 * starts closed — the Day Strip above already answers *what did I eat*, so
 * this section exists to answer *what exactly was in one meal*, which is a
 * question you ask about one meal at a time. Opening one is a tap; the state
 * is session-local, because which meal a person had folded open is not a
 * preference worth carrying across launches.
 */
export function TodaysMeals({ entries, onOpenEntry, onAddToMeal }: Props) {
  const { surfaces, scheme } = useTheme();
  const [open, setOpen] = useState<Partial<Record<MealSlot, boolean>>>({});
  const meals = mealGroups(entries);

  return (
    <View style={styles.section}>
      {meals.map((meal, index) => {
        const logged = meal.entries.length > 0;
        const expanded = logged && Boolean(open[meal.slot]);
        const accent = mealAccent(meal.slot, scheme);

        return (
          <View
            key={meal.slot}
            style={[
              index > 0 && styles.divided,
              index > 0 && { borderTopColor: surfaces.border },
            ]}
          >
            <Pressable
              onPress={() =>
                logged
                  ? setOpen((current) => ({ ...current, [meal.slot]: !current[meal.slot] }))
                  : onAddToMeal(meal.slot)
              }
              accessibilityRole="button"
              accessibilityState={logged ? { expanded } : undefined}
              accessibilityLabel={
                logged
                  ? `${meal.slot}. ${formatCalories(meal.calories)} calories. ${
                      meal.entries.length === 1 ? '1 food' : `${meal.entries.length} foods`
                    }. ${expanded ? 'Expanded' : 'Collapsed'}.`
                  : `${meal.slot}. No foods logged. Add food to ${meal.slot}`
              }
              accessibilityHint={
                logged ? (expanded ? 'Collapses the meal' : 'Expands the meal') : undefined
              }
              style={({ pressed }) => [styles.heading, pressed && styles.pressed]}
            >
              {/*
                * The time of day, in one small glyph.
                *
                * Restored in 5.6B.4: the rows had become structurally right
                * and visually dead, and a day reads better when breakfast
                * looks like morning. It is **decorative** — the meal's name is
                * right beside it and says the same thing — so it is hidden
                * from assistive technology rather than announced twice. Small
                * on purpose: the name stays the subject, and nothing about
                * the row's height or rhythm changed to make room for it.
                */}
              <Ionicons
                name={accent.icon}
                size={16}
                color={accent.color}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />

              <Text style={[styles.slot, { color: surfaces.text }]}>{meal.slot}</Text>

              {/*
                * The summary and its chevron travel together, and the row
                * wraps between the name and this group rather than squeezing
                * either.
                *
                * The 5.6B.4 device pass found `Br`, `L`, `D` and `S` at
                * accessibility sizes: the summary held `flex: 1`, the name got
                * whatever was left, and a single word in a box too narrow to
                * hold it is clipped rather than wrapped. The name is the row's
                * subject and never shrinks now; the summary drops to a second
                * line when the two no longer fit side by side.
                */}
              <View style={styles.trailing}>
                <Text style={[styles.meta, { color: surfaces.textTertiary }]}>
                  {logged
                    ? `${formatCalories(meal.calories)} cal · ${meal.entries.length === 1 ? '1 food' : `${meal.entries.length} foods`}`
                    : 'No foods logged'}
                </Text>

                {logged ? (
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={surfaces.textTertiary}
                  />
                ) : (
                  <Ionicons name="add" size={17} color={palette.primary} />
                )}
              </View>
            </Pressable>

            {expanded ? (
              <View style={styles.entries}>
                {meal.entries.map((entry) => (
                  <Pressable
                    key={entry.id}
                    onPress={() => onOpenEntry(entry.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${entry.name}, ${formatPortion(
                      entry.serving.quantity,
                      entry.serving.label,
                    )}, ${formatCalories(entry.nutrition.calories)} calories`}
                    accessibilityHint="Opens this entry"
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  >
                    <FoodAvatar food={entry} size={32} />
                    <View style={styles.rowText}>
                      {/*
                        * No line limit on the name.
                        *
                        * 5.6E found this cropping a 74-character provider name to
                        * one line — the identical defect the founder rejected on
                        * `FoodListRow` in 5.6C (`Clif Bar Cool Mint…`). The same
                        * food read in full in Search and as an ellipsis once it
                        * was in a meal, which is exactly what the one-food-row
                        * ruling forbids, and at accessibility text sizes it left
                        * a few characters of the string a person is scanning for.
                        *
                        * The row is `minHeight`, never a fixed height, so it
                        * simply grows. The supporting serving line below still
                        * caps at one — a secondary line may; the subject may not.
                        */}
                      <Text style={[styles.name, { color: surfaces.text }]}>{entry.name}</Text>
                      <Text style={[styles.serving, { color: surfaces.textTertiary }]} numberOfLines={1}>
                        {formatPortion(entry.serving.quantity, entry.serving.label)}
                      </Text>
                    </View>
                    <Text style={[styles.calories, { color: surfaces.textSecondary }]}>
                      {formatCalories(entry.nutrition.calories)}
                    </Text>
                  </Pressable>
                ))}

                {/* Meal-aware add, kept secondary to the screen's own action. */}
                <Pressable
                  onPress={() => onAddToMeal(meal.slot)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add food to ${meal.slot}`}
                  style={({ pressed }) => [styles.addRow, pressed && styles.pressed]}
                >
                  <Ionicons name="add" size={15} color={palette.primary} />
                  <Text style={[styles.addLabel, { color: palette.primary }]}>Add food</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    // No card: rows own their spacing and dividers run the full width, the
    // way a settings list reads without being put in a box.
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    // Wraps rather than crops — see the note in the row. At ordinary text
    // sizes this is a single line and nothing about the rhythm changes.
    flexWrap: 'wrap',
    columnGap: spacing.s,
    paddingVertical: spacing.m,
    minHeight: 48,
  },
  pressed: {
    opacity: 0.6,
  },
  slot: {
    ...typography.bodyMedium,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    // Takes the right edge when there is room and drops to its own line when
    // there is not. Never squeezes the name.
    marginLeft: 'auto',
  },
  meta: {
    ...typography.caption,
    textAlign: 'right',
  },
  entries: {
    paddingBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 48,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.body,
  },
  serving: {
    ...typography.caption,
  },
  calories: {
    ...typography.bodyMedium,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.s,
    minHeight: 40,
  },
  addLabel: {
    ...typography.captionMedium,
  },
});
