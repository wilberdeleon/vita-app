import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, ListRow, Screen, ScreenHeader } from '../../../components/ui';
import { spacing } from '../../../theme/tokens';

export default function LogFoodOptions() {
  return (
    <Screen>
      <ScreenHeader title="Log Food" back close />

      <ListRow
        icon="barcode-outline"
        title="Scan Barcode"
        subtitle="Scan a product barcode"
        chevron
        onPress={() => router.push('/fuel/scan')}
      />
      <ListRow
        icon="search-outline"
        title="Search Food"
        subtitle="Search our database"
        chevron
        onPress={() => router.push('/fuel/search')}
      />
      <ListRow
        icon="create-outline"
        title="Add Manually"
        subtitle="Enter nutrition info"
        chevron
        onPress={() => router.push('/fuel/manual')}
      />

      <View style={styles.quickRow}>
        <View style={styles.quickButton}>
          <Button label="Recent Foods" variant="soft" onPress={() => router.push('/fuel/recent')} />
        </View>
        <View style={styles.quickButton}>
          <Button label="Favorites" variant="soft" onPress={() => router.push('/fuel/favorites')} />
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
