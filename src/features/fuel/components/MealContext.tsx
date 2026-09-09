import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { MealSlot } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { mealAccent } from '../mealAccent';

/**
 * Which meal a food is being added to — **Fuel Home's own meal identity**.
 *
 * ## One mapping, not two
 *
 * The discovery screens used to say `Adding to Breakfast` as plain grey
 * subtitle text while Fuel Home drew a sunrise glyph in brand gold beside the
 * word. Same fact, two languages, one product. This reads the identity from
 * `mealAccent` — the same function the meal rows on Fuel Home call — so
 * Breakfast is sunrise, Lunch is the sun, **Dinner is the moon** and Snacks
 * is utensils on sage, here and there, in both schemes, permanently.
 *
 * Adding a second badge here would mean two files to change the next time a
 * meal's identity moves, and one of them would be forgotten.
 *
 * ## The glyph is decoration; the sentence is the label
 *
 * The icon carries no information the word beside it does not, so it is hidden
 * from assistive technology, and the pair speaks as `Adding to Breakfast`.
 */
export function MealContext({ meal }: { meal: MealSlot }) {
  const { surfaces, scheme } = useTheme();
  const accent = mealAccent(meal, scheme);

  return (
    <View style={styles.row} accessible accessibilityRole="text" accessibilityLabel={`Adding to ${meal}`}>
      <Ionicons
        name={accent.icon}
        size={15}
        color={accent.color}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <Text style={[styles.label, { color: surfaces.textSecondary }]}>{meal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  label: {
    ...typography.captionMedium,
    fontSize: 14,
  },
});
