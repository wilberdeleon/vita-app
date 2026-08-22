import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card, IconBadge, PressableScale } from '../../../components/ui';
import {
  MEAL_SLOTS,
  formatCalories,
  type MealSlot,
  type MealSummary,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { mealAccent } from '../mealAccent';
import { MealFoodRow } from './MealFoodRow';

type Props = {
  /** All four slots, in canonical order, empty ones included. */
  meals: MealSummary[];
  /** True until the day's entries have been read from storage. */
  isLoading: boolean;
};

function addFoodHref(slot: MealSlot): string {
  return `/fuel/add?meal=${encodeURIComponent(slot)}`;
}

/**
 * Today's four meals, and what is actually in them — the core of the
 * redesign.
 *
 * The structural decision here is that **meals are rows in one panel, not
 * four cards**. That single change is what removes the screen's dead-zone
 * feeling: an untouched Lunch costs one 56pt row instead of a card with its
 * own border, shadow, and padding, which leaves the space for the thing
 * that actually earns it — the foods a person has eaten. Previously you had
 * to open Food Log to see any of that.
 *
 * Meals with entries default to expanded. The point of the section is
 * answering "what have I eaten today" without navigating, and a collapsed
 * default would put that answer one tap away again. Collapsing stays
 * available for a long day; the state is a plain object of booleans,
 * deliberately not persisted — which meal is folded shut is not a
 * preference worth remembering across launches.
 *
 * Every `+ Add food` carries its own meal, so the logging flow opens with
 * that meal already selected.
 */
export function TodayMealsPanel({ meals, isLoading }: Props) {
  const { surfaces } = useTheme();
  const [collapsed, setCollapsed] = useState<Partial<Record<MealSlot, boolean>>>({});

  if (isLoading) {
    /**
     * Four labelled rows with no numbers, rather than a spinner or a
     * collapsed placeholder. Storage hydration is fast, and the structure
     * of the day is already known — only the figures are pending, so only
     * the figures wait.
     */
    return (
      <Card style={styles.panel}>
        {MEAL_SLOTS.map((slot, index) => {
          const accent = mealAccent(slot);
          return (
            <View key={slot}>
              {index > 0 ? <View style={[styles.divider, { backgroundColor: surfaces.border }]} /> : null}
              <View style={styles.header}>
                <IconBadge icon={accent.icon} color={accent.color} size={36} />
                <View style={styles.headerText}>
                  <Text style={[styles.slot, { color: surfaces.text }]}>{slot}</Text>
                  <Text style={[styles.summary, { color: surfaces.textTertiary }]}>—</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>
    );
  }

  return (
    <Card style={styles.panel}>
      {meals.map((meal, index) => {
        const accent = mealAccent(meal.slot);
        const logged = meal.itemCount > 0;
        const open = logged && !collapsed[meal.slot];

        return (
          <View key={meal.slot}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: surfaces.border }]} /> : null}

            <PressableScale
              pressedScale={0.995}
              onPress={() =>
                logged
                  ? setCollapsed((current) => ({ ...current, [meal.slot]: !current[meal.slot] }))
                  : router.push(addFoodHref(meal.slot))
              }
              style={styles.header}
              accessibilityRole="button"
              accessibilityState={logged ? { expanded: open } : undefined}
              accessibilityLabel={
                logged
                  ? `${meal.slot}, ${meal.itemCount} items, ${formatCalories(meal.nutrition.calories)} Calories`
                  : `Add food to ${meal.slot}`
              }
            >
              <IconBadge icon={accent.icon} color={accent.color} size={36} />
              <View style={styles.headerText}>
                <Text style={[styles.slot, { color: surfaces.text }]} numberOfLines={1}>
                  {meal.slot}
                </Text>
                <Text style={[styles.summary, { color: surfaces.textTertiary }]} numberOfLines={1}>
                  {logged
                    ? `${meal.itemCount === 1 ? '1 item' : `${meal.itemCount} items`} · ${formatCalories(meal.nutrition.calories)} Calories`
                    : 'No foods logged'}
                </Text>
              </View>

              {logged ? (
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={surfaces.textTertiary} />
              ) : (
                <Text style={styles.addInline}>+ Add food</Text>
              )}
            </PressableScale>

            {open ? (
              <View style={styles.entries}>
                <View style={[styles.divider, { backgroundColor: surfaces.border }]} />
                {meal.entries.map((entry) => (
                  <MealFoodRow key={entry.id} entry={entry} />
                ))}
                <PressableScale
                  pressedScale={0.99}
                  onPress={() => router.push(addFoodHref(meal.slot))}
                  style={styles.addRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Add food to ${meal.slot}`}
                >
                  <Ionicons name="add" size={16} color={palette.primary} />
                  <Text style={styles.addLabel}>Add food</Text>
                </PressableScale>
              </View>
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  /**
   * Zero padding on the card itself: rows own their spacing, so a divider
   * can run the full width of the panel the way it does in a settings list.
   */
  panel: {
    padding: 0,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    minHeight: 56,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  slot: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  summary: {
    ...typography.caption,
  },
  addInline: {
    ...typography.captionMedium,
    fontWeight: '600',
    color: palette.primary,
  },
  entries: {
    // Indented past the meal's icon badge so foods read as belonging to the
    // meal above them rather than as siblings of it.
    paddingLeft: spacing.l,
    paddingRight: spacing.l,
    paddingBottom: spacing.s,
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
    fontWeight: '600',
    color: palette.primary,
  },
});
