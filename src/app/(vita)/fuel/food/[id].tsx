import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, IconBadge, Screen, ScreenHeader, Stepper } from '../../../../components/ui';
import { getFoodById } from '../../../../features/fuel/api';
import { spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

const NUTRITION_LABELS = [
  ['totalCarbs', 'Total Carbs', 'g'],
  ['totalFat', 'Total Fat', 'g'],
  ['saturatedFat', 'Saturated Fat', 'g'],
  ['totalSugars', 'Total Sugars', 'g'],
  ['protein', 'Protein', 'g'],
  ['sodium', 'Sodium', 'mg'],
] as const;

export default function FoodDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [servings, setServings] = useState(1);
  const food = getFoodById(id);
  const { surfaces } = useTheme();

  if (!food) {
    return (
      <Screen>
        <ScreenHeader title="Food" back />
        <Text style={[styles.missing, { color: surfaces.textTertiary }]}>This food is no longer available.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title={food.name} back />

      <View style={styles.hero}>
        <IconBadge icon="fast-food-outline" size={72} />
        <Text style={[styles.kcal, { color: surfaces.text }]}>{food.kcal * servings} kcal</Text>
        <Text style={[styles.perServing, { color: surfaces.textTertiary }]}>
          {food.brand ? `${food.brand} · ` : ''}
          {food.perServing}
        </Text>
      </View>

      <Card>
        <Text style={[styles.sectionTitle, { color: surfaces.textTertiary }]}>NUTRITIONAL COMPONENTS</Text>
        {NUTRITION_LABELS.map(([key, label, unit]) => (
          <View key={key} style={[styles.nutritionRow, { borderBottomColor: surfaces.border }]}>
            <Text style={[styles.nutritionLabel, { color: surfaces.textSecondary }]}>{label}</Text>
            <Text style={[styles.nutritionValue, { color: surfaces.text }]}>
              {food.nutrition[key] * servings}
              {unit}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.servingRow}>
        <Stepper value={servings} onChange={setServings} suffix={servings === 1 ? 'serving' : 'servings'} />
        <Text style={[styles.total, { color: surfaces.text }]}>{food.kcal * servings} kcal total</Text>
      </View>

      <Button label="+ Add to Log" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.s,
  },
  kcal: {
    ...typography.title,
    marginTop: spacing.s,
  },
  perServing: {
    ...typography.caption,
  },
  sectionTitle: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginBottom: spacing.s,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nutritionLabel: {
    ...typography.body,
  },
  nutritionValue: {
    ...typography.bodyMedium,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    ...typography.bodyMedium,
  },
  missing: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
