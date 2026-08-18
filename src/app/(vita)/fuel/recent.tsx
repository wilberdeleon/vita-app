import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { useRecentFoods } from '../../../lib/nutrition';
import { palette, spacing } from '../../../theme/tokens';

/**
 * Foods the user has actually logged, most recent first, one row per food.
 * Derived from the log itself rather than a parallel list — see
 * `useRecentFoods`.
 */
export default function RecentFoods() {
  const { recents, isLoading } = useRecentFoods();

  return (
    <Screen>
      <ScreenHeader title="Recent Foods" back />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
        </View>
      ) : recents.length > 0 ? (
        <>
          <SectionHeader title="Recently logged" />
          {recents.map((recent) => (
            <FoodRow key={recent.food.vitaId} food={recent.food} />
          ))}
        </>
      ) : (
        <View style={styles.emptyBlock}>
          <EmptyState
            icon="time-outline"
            title="No recent foods yet"
            body="Foods you log will show up here so you can log them again in seconds."
          />
          <Button label="Search foods" variant="soft" onPress={() => router.push('/fuel/search')} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  emptyBlock: {
    gap: spacing.m,
  },
});
