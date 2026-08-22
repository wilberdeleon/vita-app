import { StyleSheet, View } from 'react-native';
import { Chip } from '../../../components/ui';
import { MEAL_SLOTS, type MealSlot } from '../../../lib/nutrition';
import { palette, spacing } from '../../../theme/tokens';

type Props = {
  value: MealSlot;
  onChange: (slot: MealSlot) => void;
};

/**
 * Which meal an entry belongs to.
 *
 * Built from the existing `Chip` primitive rather than a new control — four
 * options is a row of chips, not a picker, and it keeps Fuel on the same
 * visual language as the rest of the app. Always shows a selection: the
 * caller seeds it from the time of day, so the common case is confirming
 * rather than choosing.
 */
export function MealPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {MEAL_SLOTS.map((slot) => (
        <Chip
          key={slot}
          label={slot}
          selected={slot === value}
          color={palette.primary}
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
