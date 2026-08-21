import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import {
  entryServingLabel,
  foodFromEntry,
  formatCalories,
  type FoodEntry,
} from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { FavoriteButton } from './FavoriteButton';
import { FoodAvatar } from './FoodAvatar';

type Props = {
  entry: FoodEntry;
};

/**
 * One logged food, inside its meal on the Fuel landing screen.
 *
 * Compact by design: this is a row in a panel, not a card. The meal it
 * belongs to already provides the container, and giving each food its own
 * card is exactly what made the previous screen feel like a stack of
 * boxes. Hierarchy here comes from indentation and type scale.
 *
 * The row body opens the existing Edit Entry flow — the same destination
 * the Food Log's rows use. The heart toggles favorite in place without
 * navigating: nested inside the row's own Pressable, it wins the touch by
 * React Native's responder rules.
 *
 * The food's picture comes from the entry's own stored snapshot via the
 * shared resolver — no lookup, no cache read, and no network from a list
 * row. Earlier this row consulted the in-memory provider cache, which is
 * session-scoped, so a scanned product showed its photo right after the
 * scan and a generic glyph after the next launch. The image now lives on
 * the entry alongside the name and nutrition it was already denormalizing,
 * for exactly the same reason.
 */
export function MealFoodRow({ entry }: Props) {
  const { surfaces } = useTheme();

  // Built from the entry's own stored snapshot, so a logged food stays
  // favorite-able — and picturable — offline and long after any provider
  // cache has expired.
  const food = foodFromEntry(entry);
  const detail = entry.brand ? `${entry.brand} · ${entryServingLabel(entry)}` : entryServingLabel(entry);

  return (
    <PressableScale
      onPress={() => router.push(`/fuel/entry/${encodeURIComponent(entry.id)}`)}
      pressedScale={0.99}
      style={styles.row}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${entry.name}`}
    >
      <FoodAvatar food={food} size={36} />

      <View style={styles.text}>
        <Text style={[styles.name, { color: surfaces.text }]} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={1}>
          {detail}
        </Text>
      </View>

      <Text style={[styles.calories, { color: surfaces.textSecondary }]} numberOfLines={1}>
        {formatCalories(entry.nutrition.calories)} cal
      </Text>
      <FavoriteButton food={food} size={17} withSurface />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.bodyMedium,
  },
  detail: {
    ...typography.caption,
  },
  calories: {
    ...typography.caption,
  },
});
