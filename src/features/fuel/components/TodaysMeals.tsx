import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatCalories,
  formatPortion,
  type FoodEntry,
  type MealSlot,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { loggedMeals } from '../dayStrip';
import { FoodAvatar } from './FoodAvatar';

type Props = {
  entries: readonly FoodEntry[];
  onOpenEntry: (entryId: string) => void;
  onAddToMeal: (meal: MealSlot) => void;
};

/**
 * What was eaten, by meal — direct on the background.
 *
 * ## What this replaces
 *
 * One card containing four rows, each of which said *Breakfast · No foods
 * logged · + Add food* whether or not anything had happened. On an untouched
 * day that is a list of four things the user has not done, wrapped in a
 * surface, taking the middle of the screen. The founder's review named it as
 * too administrative and too heavy, and it is where most of Fuel's card
 * weight lived.
 *
 * **Only meals with food appear.** An empty slot is not information; it is
 * the absence of information, and Add Food is how you reach one. The meal
 * heading carries its own subtotal, which is the one derived figure a meal
 * genuinely has.
 *
 * ## No card
 *
 * Section heading, rows, hairline dividers, background. The same treatment
 * Peptides' routine list and Water's entries arrived at — a list reads as a
 * list without being put in a box.
 */
export function TodaysMeals({ entries, onOpenEntry, onAddToMeal }: Props) {
  const { surfaces } = useTheme();
  const meals = loggedMeals(entries);

  if (meals.length === 0) return null;

  return (
    <View style={styles.section}>
      {meals.map((meal) => (
        <View key={meal.slot} style={styles.meal}>
          <View style={styles.heading}>
            <Text style={[styles.slot, { color: surfaces.text }]} numberOfLines={1}>
              {meal.slot}
            </Text>
            <Text style={[styles.total, { color: surfaces.textTertiary }]}>
              {formatCalories(meal.calories)} cal
            </Text>
            {/*
              * Meal-aware add, kept deliberately quiet — it is a shortcut,
              * not a peer of the screen's one primary action.
              */}
            <Pressable
              onPress={() => onAddToMeal(meal.slot)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Add food to ${meal.slot}`}
              style={({ pressed }) => [styles.add, pressed && styles.pressed]}
            >
              <Ionicons name="add" size={16} color={palette.primary} />
            </Pressable>
          </View>

          {meal.entries.map((entry, index) => (
            <Pressable
              key={entry.id}
              onPress={() => onOpenEntry(entry.id)}
              accessibilityRole="button"
              accessibilityLabel={`${entry.name}, ${formatPortion(
                entry.serving.quantity,
                entry.serving.label,
              )}, ${formatCalories(entry.nutrition.calories)} calories`}
              accessibilityHint="Opens this entry"
              style={({ pressed }) => [
                styles.row,
                index > 0 && { borderTopColor: surfaces.border, borderTopWidth: StyleSheet.hairlineWidth },
                pressed && styles.pressed,
              ]}
            >
              <FoodAvatar food={entry} size={34} />
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: surfaces.text }]} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={[styles.serving, { color: surfaces.textTertiary }]} numberOfLines={1}>
                  {formatPortion(entry.serving.quantity, entry.serving.label)}
                </Text>
              </View>
              <Text style={[styles.calories, { color: surfaces.textSecondary }]}>
                {formatCalories(entry.nutrition.calories)}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.l,
  },
  meal: {
    gap: spacing.xs,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  slot: {
    ...typography.bodyMedium,
    flexShrink: 1,
  },
  total: {
    ...typography.caption,
    flex: 1,
  },
  add: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 52,
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
});
