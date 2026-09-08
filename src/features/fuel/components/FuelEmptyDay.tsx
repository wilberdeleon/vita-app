import { StyleSheet, Text, View } from 'react-native';
import { formatCalories, type NutritionTargets } from '../../../lib/nutrition';
import { typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  /** The user's own goals, when they have any. `null` shows nothing. */
  targets: NutritionTargets | null;
};

/** `1,800 calorie goal · 180 g protein goal` — whichever were set. */
function goalLine(targets: NutritionTargets | null): string | null {
  if (!targets) return null;
  const parts: string[] = [];
  if (targets.calories !== undefined) parts.push(`${formatCalories(targets.calories)} calorie goal`);
  if (targets.protein !== undefined) parts.push(`${targets.protein} g protein goal`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * An untouched day, said once.
 *
 * The founder's note was specific: a screen whose hero is `0 Calories ·
 * Protein 0 · Carbs 0 · Fat 0` is a scoreboard for a game nobody has played
 * yet. The Day Strip sits above this in its resting state, and this is the
 * one line that explains it plus the one action that changes it.
 *
 * Deliberately small. An empty state that fills the screen is a card by
 * another name, and the screen should feel unhurried when there is nothing
 * on it rather than apologetic.
 *
 * **Goals are stated, never scored.** Someone who has set a goal should be
 * able to see it here — but as the figure they chose, not as `0 / 1,800` and
 * `0%`, which is a progress report on a day that has not started. Add Food
 * stays the obvious thing to do.
 */
export function FuelEmptyDay({ targets }: Props) {
  const { surfaces } = useTheme();
  const goals = goalLine(targets);

  return (
    <View style={styles.block}>
      <Text style={[styles.title, { color: surfaces.text }]}>Nothing logged yet</Text>
      <Text style={[styles.body, { color: surfaces.textTertiary }]}>
        Add your first food to build today's Fuel view.
      </Text>
      {goals ? (
        <Text style={[styles.goals, { color: surfaces.textTertiary }]}>{goals}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 2,
  },
  title: {
    ...typography.bodyMedium,
    fontSize: 16,
  },
  body: {
    ...typography.caption,
  },
  goals: {
    ...typography.caption,
    marginTop: 6,
  },
});
