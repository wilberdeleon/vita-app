import { StyleSheet, Text, View } from 'react-native';
import { Chip, SectionHeader, Stepper } from '../../../components/ui';
import {
  formatQuantity,
  pluralizeUnit,
  type MealSlot,
  type ServingOption,
} from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { MealPicker } from './MealPicker';

type Props = {
  servings: ServingOption[];
  servingIndex: number;
  onServingChange: (index: number) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  meal: MealSlot;
  onMealChange: (meal: MealSlot) => void;
};

/** Half a serving is the smallest portion worth logging; 99 is a sane ceiling. */
const QUANTITY_STEP = 0.5;
const MIN_QUANTITY = 0.5;
const MAX_QUANTITY = 99;

/**
 * The three decisions that turn a food definition into a log entry: which
 * serving, how many, which meal.
 *
 * Extracted as its own component because editing an existing entry needs
 * exactly the same three controls with exactly the same arithmetic. Building
 * this into the Food Detail screen would have guaranteed a second, subtly
 * different editor later.
 *
 * The serving picker only appears when the food actually offers a choice.
 * Custom foods carry one serving today; provider foods will carry several,
 * and nothing here assumes either.
 */
export function PortionEditor({
  servings,
  servingIndex,
  onServingChange,
  quantity,
  onQuantityChange,
  meal,
  onMealChange,
}: Props) {
  const { surfaces } = useTheme();
  const serving = servings[servingIndex] ?? servings[0];
  const unitLabel = quantity === 1 ? serving.unit : pluralizeUnit(serving.unit);

  return (
    <View style={styles.root}>
      {servings.length > 1 ? (
        <View>
          <SectionHeader title="Serving" />
          <View style={styles.servingRow}>
            {servings.map((option, index) => (
              <Chip
                key={`${option.label}-${index}`}
                label={option.label}
                selected={index === servingIndex}
                color={palette.primary}
                onPress={() => onServingChange(index)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionHeader title="Quantity" />
        <View style={[styles.quantityRow, { borderColor: surfaces.border, backgroundColor: surfaces.card }]}>
          <View style={styles.servingLabel}>
            <Text style={[styles.servingText, { color: surfaces.text }]} numberOfLines={1}>
              {serving.label}
            </Text>
            {servings.length === 1 ? (
              <Text style={[styles.servingHint, { color: surfaces.textTertiary }]}>Serving size</Text>
            ) : null}
          </View>
          <Stepper
            value={quantity}
            onChange={onQuantityChange}
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            step={QUANTITY_STEP}
            suffix={unitLabel}
            formatValue={formatQuantity}
          />
        </View>
      </View>

      <View>
        <SectionHeader title="Add to" />
        <MealPicker value={meal} onChange={onMealChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.l,
  },
  servingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  servingLabel: {
    flexShrink: 1,
    gap: 2,
  },
  servingText: {
    ...typography.bodyMedium,
  },
  servingHint: {
    ...typography.caption,
  },
});
