import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, ListRow, Screen, ScreenHeader } from '../../../components/ui';
import { parseMealSlot } from '../../../lib/nutrition';
import { spacing } from '../../../theme/tokens';

/**
 * The way into logging, unchanged in shape.
 *
 * What is new is that it can carry a meal. Fuel's meal rows open this with
 * `?meal=Lunch`, and every route below forwards it, so the meal the user
 * already chose survives all the way to Food Detail instead of being asked
 * for a second time. Opened without one — from the Log Food button, or a
 * deep link — nothing changes: Food Detail seeds the meal from the time of
 * day exactly as before.
 */
export default function LogFoodOptions() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal = parseMealSlot(params.meal);
  const suffix = meal ? `?meal=${encodeURIComponent(meal)}` : '';

  return (
    <Screen>
      <ScreenHeader title="Log Food" subtitle={meal ? `Adding to ${meal}` : undefined} back close />

      <ListRow
        icon="barcode-outline"
        title="Scan Barcode"
        subtitle="Scan a product barcode"
        chevron
        onPress={() => router.push(`/fuel/scan${suffix}`)}
      />
      <ListRow
        icon="search-outline"
        title="Search Food"
        subtitle="Search our database"
        chevron
        onPress={() => router.push(`/fuel/search${suffix}`)}
      />
      <ListRow
        icon="create-outline"
        title="Add Manually"
        subtitle="Enter nutrition info"
        chevron
        onPress={() => router.push(`/fuel/manual${suffix}`)}
      />

      <View style={styles.quickRow}>
        <View style={styles.quickButton}>
          <Button label="Recent Foods" variant="soft" onPress={() => router.push(`/fuel/recent${suffix}`)} />
        </View>
        <View style={styles.quickButton}>
          <Button label="Favorites" variant="soft" onPress={() => router.push(`/fuel/favorites${suffix}`)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.s,
  },
  quickButton: {
    flex: 1,
  },
});
