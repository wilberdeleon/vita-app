import { Image, StyleSheet, View } from 'react-native';
import { radii } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { resolveFoodVisual, type PicturableFood } from '../foodVisual';
import { FoodArt } from './FoodArt';

type Props = {
  food: PicturableFood;
  size?: number;
};

/**
 * A food's picture, wherever a food appears.
 *
 * The single renderer for the three-tier visual: real product image →
 * VITA category drawing → the neutral generic. Screens hand it a food and
 * get the right answer; none of them decides which tier applies, which is
 * what keeps a banana looking like a banana in Search, Recents, Favorites,
 * the log, and the editor rather than in whichever ones remembered the rule.
 *
 * Same footprint in every tier — one circle of `size` — so a list of foods
 * keeps a straight edge no matter which tier each row resolved to. The
 * drawing sits on the same faint tinted disc the rest of the app's leading
 * icons use, so a drawn food and a photographed one carry equal weight.
 */
export function FoodAvatar({ food, size = 36 }: Props) {
  const { surfaces } = useTheme();
  const visual = resolveFoodVisual(food);

  if (visual.kind === 'image') {
    return (
      <View style={[styles.frame, { width: size, height: size, backgroundColor: surfaces.track }]}>
        <Image
          source={{ uri: visual.uri }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.frame,
        styles.center,
        { width: size, height: size, backgroundColor: `${visual.color}1A` },
      ]}
    >
      <FoodArt art={visual.art} size={size * 0.58} color={visual.color} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.pill,
    // Clips a photo to the same circle the drawing sits in.
    overflow: 'hidden',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
