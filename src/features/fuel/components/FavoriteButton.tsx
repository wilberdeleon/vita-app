import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useNutrition, type VitaFood } from '../../../lib/nutrition';
import { palette, radii, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  food: VitaFood;
  size?: number;
  /**
   * Draws the heart on a faint circular surface so it reads as a button
   * rather than an icon. On for list rows, where physical-device QA found
   * a bare outline heart went unnoticed entirely; off in the Food Detail
   * header, where it sits alongside the back chevron and reads as a control
   * from position alone.
   */
  withSurface?: boolean;
};

/**
 * The favorite toggle, wherever a food is shown.
 *
 * State comes from the shared nutrition store rather than local component
 * state, which is what keeps Search, Recents, Food Detail, and the Favorites
 * screen in agreement without any of them refreshing or knowing about each
 * other.
 *
 * Filled orange means favorited; an outline means not. The nutrition domain
 * color is used deliberately — a red heart would read as a different,
 * unrelated signal next to the macro colors.
 *
 * Nested inside a row's own `Pressable`, this one wins the touch by React
 * Native's responder rules, so tapping the heart toggles the favorite and
 * does **not** open Food Detail.
 */
export function FavoriteButton({ food, size = 22, withSurface = false }: Props) {
  const { isFavorite, toggleFavorite } = useNutrition();
  const { surfaces } = useTheme();
  const favorited = isFavorite(food.vitaId);

  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        void toggleFavorite(food);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: favorited }}
      accessibilityLabel={favorited ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
      style={
        withSurface
          ? [
              styles.surface,
              {
                backgroundColor: favorited ? `${palette.primary}1F` : surfaces.track,
                borderColor: favorited ? `${palette.primary}40` : 'transparent',
              },
            ]
          : undefined
      }
    >
      <Ionicons
        name={favorited ? 'heart' : 'heart-outline'}
        size={size}
        // Secondary rather than tertiary: at tertiary the outline heart is
        // faint enough on a dark card that QA missed it was a control.
        color={favorited ? palette.primary : surfaces.textSecondary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  surface: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
});
