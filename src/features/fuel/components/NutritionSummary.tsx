import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/ui';
import { MACROS, formatAmount, formatCalories, type NutritionFacts } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  nutrition: NutritionFacts;
  /** e.g. "1.5 servings" — what these numbers are for. */
  portionLabel: string;
};

/**
 * The four numbers the logging decision actually turns on, for the portion
 * currently selected.
 *
 * Calories lead because that is what the day's headline is measured in;
 * macros sit beneath in their permanent domain colors. Everything else the
 * food knows lives in the collapsible detail list below it, so this stays
 * scannable at a glance rather than becoming a nutrition label.
 */
export function NutritionSummary({ nutrition, portionLabel }: Props) {
  const { surfaces } = useTheme();

  return (
    <Card>
      <Text style={[styles.kicker, { color: surfaces.textTertiary }]}>{portionLabel.toUpperCase()}</Text>
      <View style={styles.calorieRow}>
        <Text style={[styles.calories, { color: surfaces.text }]}>{formatCalories(nutrition.calories)}</Text>
        <Text style={[styles.calorieUnit, { color: surfaces.textTertiary }]}>kcal</Text>
      </View>
      <View style={[styles.macros, { borderTopColor: surfaces.border }]}>
        {MACROS.map((macro) => (
          <View key={macro.key} style={styles.macro}>
            <View style={[styles.dot, { backgroundColor: palette[macro.key] }]} />
            <Text style={[styles.macroValue, { color: surfaces.text }]}>
              {formatAmount(nutrition[macro.key])}
              {macro.unit}
            </Text>
            <Text style={[styles.macroLabel, { color: surfaces.textTertiary }]}>{macro.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginBottom: spacing.s,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  calories: {
    ...typography.display,
  },
  calorieUnit: {
    ...typography.captionMedium,
  },
  macros: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.l,
    paddingTop: spacing.l,
  },
  macro: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  macroLabel: {
    ...typography.micro,
  },
});
