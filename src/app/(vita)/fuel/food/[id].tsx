import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, IconBadge, Screen, ScreenHeader, Stepper } from '../../../../components/ui';
import { getFoodById } from '../../../../features/fuel/api';
import { palette, spacing, typography } from '../../../../theme/tokens';

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

  if (!food) {
    return (
      <Screen>
        <ScreenHeader title="Food" back />
        <Text style={styles.missing}>This food is no longer available.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title={food.name} back />

      <View style={styles.hero}>
        <IconBadge icon="fast-food-outline" size={72} />
        <Text style={styles.kcal}>{food.kcal * servings} kcal</Text>
        <Text style={styles.perServing}>
          {food.brand ? `${food.brand} · ` : ''}
          {food.perServing}
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>NUTRITIONAL COMPONENTS</Text>
        {NUTRITION_LABELS.map(([key, label, unit]) => (
          <View key={key} style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>{label}</Text>
            <Text style={styles.nutritionValue}>
              {food.nutrition[key] * servings}
              {unit}
            </Text>
          </View>
        ))}
      </Card>

      <View style={styles.servingRow}>
        <Stepper value={servings} onChange={setServings} suffix={servings === 1 ? 'serving' : 'servings'} />
        <Text style={styles.total}>{food.kcal * servings} kcal total</Text>
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
    color: palette.text,
    marginTop: spacing.s,
  },
  perServing: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  sectionTitle: {
    ...typography.micro,
    color: palette.textTertiary,
    letterSpacing: 0.8,
    marginBottom: spacing.s,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.hairline,
  },
  nutritionLabel: {
    ...typography.body,
    color: palette.textSecondary,
  },
  nutritionValue: {
    ...typography.bodyMedium,
    color: palette.text,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  total: {
    ...typography.bodyMedium,
    color: palette.text,
  },
  missing: {
    ...typography.body,
    color: palette.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
