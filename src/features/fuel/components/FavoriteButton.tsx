import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useNutrition, type VitaFood } from '../../../lib/nutrition';
import { palette } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  food: VitaFood;
  size?: number;
};

/**
 * The favorite toggle, wherever a food is shown.
 *
 * State comes from the shared nutrition store rather than local component
 * state, which is what keeps Search, Food Detail, and the Favorites screen
 * in agreement without any of them refreshing or knowing about each other.
 *
 * Filled orange means favorited; a hollow tertiary outline means not. The
 * nutrition domain color is used deliberately — a red heart would read as a
 * different, unrelated signal next to the macro colors.
 */
export function FavoriteButton({ food, size = 22 }: Props) {
  const { isFavorite, toggleFavorite } = useNutrition();
  const { surfaces } = useTheme();
  const favorited = isFavorite(food.vitaId);

  return (
    <Pressable
      hitSlop={12}
      onPress={() => {
        void toggleFavorite(food);
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: favorited }}
      accessibilityLabel={favorited ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
    >
      <Ionicons
        name={favorited ? 'heart' : 'heart-outline'}
        size={size}
        color={favorited ? palette.primary : surfaces.textTertiary}
      />
    </Pressable>
  );
}
