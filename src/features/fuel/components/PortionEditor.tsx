import { StyleSheet, Text, View } from 'react-native';
import { Chip, SectionHeader, Stepper } from '../../../components/ui';
import { formatQuantity, type MealSlot, type ServingOption } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
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
 * Shared by Food Detail and Edit Entry since slice 2.3, because editing an
 * existing entry needs exactly the same three controls with exactly the same
 * arithmetic, and building them into one screen would have guaranteed a
 * second, subtly different editor later.
 *
 * ## What 5.6D changed, and what it did not
 *
 * **The controls are unchanged.** Same `Chip` for a serving, same `Stepper`
 * for the amount, same steps, same bounds, same `formatQuantity`. Nothing
 * about the model or the arithmetic moved.
 *
 * What changed is the surround. The quantity row was a bordered, filled card —
 * a card inside a screen that was already three cards deep — and Fuel Home
 * stopped speaking that way in 5.6B. It is now direct on the background under
 * the same uppercase `SectionHeader` the rest of Fuel uses, separated by the
 * same hairline. §66, §67, §68.
 *
 * ## Serving labels are the provider's, not ours
 *
 * A serving picker appears only when the food genuinely offers a choice; one
 * serving is not a choice, and a picker with a single option is furniture. The
 * labels are whatever the provider gave — `1 bar (68 g)`, `100 g` — and
 * nothing here invents a serving a food does not have. §38.
 *
 * The row wraps rather than truncating: a provider label is a phrase, not a
 * unit noun, and at accessibility text sizes the amount control drops beneath
 * it instead of squeezing it. §70, §71.
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
                accessibilityLabel={`Serving: ${option.label}`}
                onPress={() => onServingChange(index)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionHeader title="Amount" />
        <View style={[styles.quantityRow, { borderTopColor: surfaces.border }]}>
          <View style={styles.servingLabel}>
            {/*
              * No line cap. The serving is a fact about what is being logged,
              * and a provider phrase clipped to `1 bar (6…` is the same defect
              * `FoodListRow` records for a food's name.
              */}
            <Text style={[styles.servingText, { color: surfaces.text }]}>{serving.label}</Text>
            <Text style={[styles.servingHint, { color: surfaces.textTertiary }]}>
              {quantity === 1 ? 'One serving' : `× ${formatQuantity(quantity)}`}
            </Text>
          </View>
          {/*
            No suffix on the stepper: the serving's own label sits to the left,
            and provider labels are full phrases ("1 bar (68 g)") rather than
            unit nouns, so appending one reads as "1 1 bar (68 g)".
          */}
          <Stepper
            value={quantity}
            onChange={onQuantityChange}
            min={MIN_QUANTITY}
            max={MAX_QUANTITY}
            step={QUANTITY_STEP}
            formatValue={formatQuantity}
          />
        </View>
      </View>

      <View>
        <SectionHeader title="Meal" />
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
    // Wraps at accessibility text sizes rather than crushing the label — the
    // same treatment Add Food's Scan/Manual row needed on device in 5.6C.
    flexWrap: 'wrap',
    gap: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
  },
  servingLabel: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    gap: 2,
  },
  servingText: {
    ...typography.bodyMedium,
    fontSize: 17,
  },
  servingHint: {
    ...typography.caption,
  },
});
