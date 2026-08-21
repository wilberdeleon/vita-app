import { Image, StyleSheet, View } from 'react-native';
import { IconBadge } from '../../../components/ui';
import { radii } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { resolveFoodVisual, type PicturableFood } from '../foodVisual';

type Props = {
  food: PicturableFood;
  size?: number;
};

/**
 * A food's picture, wherever a food appears.
 *
 * The single renderer for the three-tier visual: real product image →
 * category visual → generic treatment. Screens hand it a food and get the
 * right answer; none of them decides which tier applies, which is what
 * keeps a banana looking like a banana in Search, Recents, Favorites, the
 * log, and the editor rather than in whichever ones remembered the rule.
 *
 * Same footprint in every tier — one circle of `size` — so a list of foods
 * has a straight edge no matter which tier each row resolved to.
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

  return <IconBadge icon={visual.icon} color={visual.color} size={size} />;
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.pill,
    // Clips the photo to the same circle the icon badge draws.
    overflow: 'hidden',
  },
});
