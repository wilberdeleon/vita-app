import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { NutritionFacts } from '../../../lib/nutrition';
import { macroAccent } from '../macroAccent';
import { servingFacts } from '../foodFacts';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  nutrition: NutritionFacts;
  /** The serving these figures describe — `1 container`. */
  servingLabel: string;
  /** How many of it. The portion line pluralises for both. */
  quantity: number;
};

/**
 * **What this food contains, at the portion chosen** — in Fuel Home's exact
 * macro language.
 *
 * ## Why it looks like the Nutrition section and is not that component
 *
 * The colours, the uppercase eyebrow, the neutral figure and the type sizes
 * are Fuel Home's, deliberately and precisely: they come from `macroAccent`,
 * the same function `NutritionContext` calls, so Protein cannot be one violet
 * on Fuel Home and a different one here. That is the founder's §64.
 *
 * What it does **not** share is the goal machinery, and that is the whole
 * reason this is a separate component rather than a reuse of Fuel Home's
 * `Macro`. Fuel Home's protein column can carry `/ 150 g` and a rail; this one
 * never can. **A food is not measured against a person's day** — §37 and §45 —
 * because an item-level target is one short step from telling someone whether
 * they should eat the thing they are looking at, and VITA does not do that.
 * There is no denominator, no remainder, no percentage, no rail, no score and
 * no grade anywhere in this component, and none can be added to it.
 *
 * Fuel Home stays untouched; it is locked. This is the small, narrow
 * extraction §92 permits, shared by Food Detail, Edit Entry and the manual
 * form's own preview — not a nutrition framework.
 *
 * ## Colour identifies; it never judges
 *
 * The accent is on the small label only. The figure stays neutral and
 * high-contrast in both schemes, which is the same limit Fuel Home sets on how
 * far identity is allowed to go before it starts reading as a status. Nothing
 * here is green or red: those are a verdict and an error respectively, and
 * neither is a macronutrient.
 *
 * ## A value the provider never gave stays absent
 *
 * `—` rather than `0`, because a food with unlisted fat is not a food with no
 * fat, and rendering the second is a lie the reader cannot detect. Never
 * `NaN`, never the word `undefined`.
 */
export function FoodFacts({ nutrition, servingLabel, quantity }: Props) {
  const { surfaces, scheme } = useTheme();
  const { fontScale } = useWindowDimensions();
  const facts = servingFacts(nutrition, servingLabel, quantity);

  return (
    <View style={styles.section} testID="food-facts">
      <Text style={[styles.portion, { color: surfaces.textTertiary }]}>
        {facts.portion.toUpperCase()}
      </Text>

      <View
        style={styles.calorieRow}
        accessible
        accessibilityRole="text"
        accessibilityLabel={
          facts.calories
            ? `${facts.calories} calories in ${facts.portion}.`
            : `Calories not listed for ${facts.portion}.`
        }
      >
        <Text
          style={[
            styles.calories,
            { color: surfaces.text },
            /*
             * A ratio, not a fixed point value. RN scales `fontSize` with the
             * system text setting and leaves `lineHeight` in raw points, so a
             * constant becomes a ceiling the digits grow through and land on
             * the caption — the 5.6B.4 device defect, in the same figure.
             */
            { lineHeight: Math.round(37 * fontScale) },
          ]}
        >
          {facts.calories ?? '—'}
        </Text>
        {/*
          * The bare word. **Not `Calories consumed`** — that is Fuel Home's
          * sentence about the day, and this food has not been eaten yet. §35.
          */}
        <Text style={[styles.caption, { color: surfaces.textSecondary }]}>{facts.caption}</Text>
      </View>

      <View style={[styles.macros, { borderTopColor: surfaces.border }]}>
        {facts.macros.map((macro) => (
          <View
            key={macro.key}
            style={styles.macro}
            accessible
            accessibilityRole="text"
            accessibilityLabel={macro.spoken}
            testID={`food-macro-${macro.key}`}
          >
            <Text
              style={[styles.macroLabel, { color: macroAccent(macro.key, scheme) }]}
              numberOfLines={1}
            >
              {macro.label}
            </Text>
            <Text style={[styles.macroValue, { color: surfaces.text }]} numberOfLines={2}>
              {macro.value ?? '—'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  portion: {
    // The same uppercase micro eyebrow `SectionHeader` draws, so this line
    // belongs to the same family as `NUTRITION` on Fuel Home.
    ...typography.micro,
    letterSpacing: 0.8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  calories: {
    ...typography.display,
    letterSpacing: -0.6,
  },
  caption: {
    ...typography.captionMedium,
    fontSize: 15,
  },
  macros: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.s,
    paddingTop: spacing.m,
  },
  macro: {
    flex: 1,
    gap: 2,
  },
  macroLabel: {
    // Fuel Home's macro eyebrow, value for value.
    ...typography.micro,
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  macroValue: {
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: '600',
  },
});
