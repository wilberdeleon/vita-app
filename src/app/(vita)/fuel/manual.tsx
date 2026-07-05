import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Screen, ScreenHeader, TextField } from '../../../components/ui';
import { spacing } from '../../../theme/tokens';

export default function AddFoodManually() {
  return (
    <Screen>
      <ScreenHeader title="Add Food" back close />

      <TextField label="Food Name" placeholder="Enter food name" />
      <View style={styles.row}>
        <View style={styles.grow}>
          <TextField label="Serving Size" placeholder="1" keyboardType="numeric" />
        </View>
        <View style={styles.grow}>
          <TextField label="Unit" placeholder="serving" />
        </View>
      </View>

      <Card style={styles.nutritionCard}>
        <TextField label="Calories (kcal)" placeholder="0" keyboardType="numeric" />
        <TextField label="Protein (g)" placeholder="0" keyboardType="numeric" />
        <TextField label="Carbs (g)" placeholder="0" keyboardType="numeric" />
        <TextField label="Fat (g)" placeholder="0" keyboardType="numeric" />
        <TextField label="Sodium (mg)" placeholder="0" keyboardType="numeric" />
      </Card>

      <Button label="Save Food" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  grow: {
    flex: 1,
  },
  nutritionCard: {
    gap: spacing.m,
  },
});
