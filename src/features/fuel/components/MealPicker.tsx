import { StyleSheet, View } from 'react-native';
import { Chip } from '../../../components/ui';
import { MEAL_SLOTS, type MealSlot } from '../../../lib/nutrition';
import { spacing } from '../../../theme/tokens';

type Props = {
  value: MealSlot;
  onChange: (slot: MealSlot) => void;
};

/**
 * Which meal an entry belongs to.
 *
 * Built from the existing `Chip` primitive rather than a new control — four
 * options is a row of chips, not a picker, and it keeps Fuel on the same
 * visual language as the rest of the app. Always shows a selection: the caller
 * seeds it from the meal the user came from, or from the time of day, so the
 * common case is confirming rather than choosing.
 *
 * ## Every chip says what it does
 *
 * Each carries an explicit accessible name. Before 5.6D these were four
 * pressables with **no accessible name at all** — `Chip` speaks its
 * `accessibilityLabel` and nothing else, and this caller passed none, so
 * VoiceOver announced four unlabelled buttons on the one control that decides
 * where a food is logged. §77, §78.
 *
 * ## The identity lives above, not here
 *
 * The chips stay in the app's neutral selected fill rather than each taking
 * its meal's accent. The meal's glyph and colour are stated once, by
 * `MealContext` at the top of the screen, which follows the selection — so
 * choosing Dinner turns the line above into the moon in dusk rose, the same
 * mark the Dinner row on Fuel Home carries. One statement of identity per
 * screen is the point of §63; four tinted chips restating it would also have
 * meant white labels on brand gold, which is the light-mode contrast failure
 * `mealAccent` exists to avoid.
 */
export function MealPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MEAL_SLOTS.map((slot) => (
        <Chip
          key={slot}
          label={slot}
          selected={slot === value}
          accessibilityLabel={`Meal: ${slot}`}
          onPress={() => onChange(slot)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
});
