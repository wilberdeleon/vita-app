import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { IconBadge, PressableScale } from '../../../components/ui';
import {
  entryServingLabel,
  foodFromEntry,
  formatCalories,
  readCachedFoodSync,
  useNutrition,
  type FoodEntry,
} from '../../../lib/nutrition';
import { radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  entry: FoodEntry;
  /** Tint for the leading placeholder, so a food reads as part of its meal. */
  accentColor: string;
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
 * Contextual visuals, cheaply: if the food's definition is already resolved
 * in memory — it is a custom food, a favorite, or a search/scan populated
 * the food cache this session — its real product image is shown. Otherwise
 * a tinted glyph.
 *
 * Both lookups are free: `findFood` scans the in-memory custom/favorite
 * arrays and `readCachedFoodSync` is a Map `get`. Neither touches the
 * network or storage, which is the point — a list row must not do I/O per
 * item. The tradeoff is that the memo is session-scoped, so after a cold
 * start a previously-scanned food falls back to the glyph until something
 * resolves it again. That is deliberate for this slice: an icon is a fine
 * answer, and per-row async reads would be real machinery in exchange for a
 * decoration. A persistent image treatment can come with the Food
 * Illustration pass.
 */
export function MealFoodRow({ entry, accentColor }: Props) {
  const { surfaces } = useTheme();
  const { findFood } = useNutrition();

  const resolved = findFood(entry.foodRef.vitaFoodId) ?? readCachedFoodSync(entry.foodRef.vitaFoodId);
  const imageUrl = resolved?.imageUrl;

  // Built from the entry's own stored snapshot rather than the resolved
  // food, so a logged food stays favorite-able offline and long after any
  // provider cache has expired.
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
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { backgroundColor: surfaces.track }]}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <IconBadge icon="fast-food-outline" size={36} color={accentColor} />
      )}

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
  image: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
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
