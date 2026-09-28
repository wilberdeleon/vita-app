import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useNutrition, type VitaFood } from '../../../lib/nutrition';
import { motion, palette, radii, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { useReducedMotion } from '../../../theme/useReducedMotion';

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
  const reducedMotion = useReducedMotion();
  const favorited = isFavorite(food.vitaId);

  /**
   * A single quick pulse when the state actually changes (slice 5.8C).
   *
   * **Driven by the stored state, not by the press.** `toggleFavorite` is
   * async and can fail; a pulse fired on tap would celebrate a favourite
   * that was never saved. Watching `favorited` means the heart answers only
   * when something really changed — and it pulses on removal too, because
   * un-favouriting is equally a thing the user did.
   *
   * **It skips the first render.** Without that, opening a list of saved
   * foods would set every heart beating at once, which is precisely the
   * spectacle this is not.
   *
   * 1 → 1.08 → 1, twice `motion.duration.press`. No bounce, no repeat, no
   * particles. The founder should almost miss it.
   *
   * **No haptic.** The state change is already visible — a filled heart and
   * a tinted surface — and a list of foods is somewhere a finger wanders.
   * The authorization prefers none where there is doubt, and there is.
   */
  const pulse = useRef(new Animated.Value(1)).current;
  const settled = useRef(false);

  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }
    if (reducedMotion) return;

    const animation = Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1.08,
        duration: motion.duration.press,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: motion.duration.press,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => {
      animation.stop();
      // A pulse interrupted mid-flight must not leave the heart enlarged.
      pulse.setValue(1);
    };
  }, [favorited, pulse, reducedMotion]);

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
      {/* The pulse wraps the glyph only: the pressable, its hit area and the
          surface behind it are untouched, so nothing about the control's
          geometry or its responder behaviour changes. */}
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Ionicons
          name={favorited ? 'heart' : 'heart-outline'}
          size={size}
          // Secondary rather than tertiary: at tertiary the outline heart is
          // faint enough on a dark card that QA missed it was a control.
          color={favorited ? palette.primary : surfaces.textSecondary}
        />
      </Animated.View>
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
