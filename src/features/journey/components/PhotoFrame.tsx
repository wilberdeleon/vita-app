import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { radii } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  width: number;
  /**
   * Spoken description. For the 6.3 `__DEV__` placeholders this says so —
   * "Development progress photo placeholder, Sat, Oct 12" — and never
   * pretends to describe a body. Omitted for the empty-state frame, which is
   * decorative.
   */
  accessibilityLabel?: string;
  /** The empty-state frame: dashed and quiet, a place rather than a photo. */
  empty?: boolean;
};

/**
 * A progress photo's frame — portrait 3:4, the shape a phone takes a
 * full-length photo in. Neutral by design: photography is private history,
 * so the frame stays out of the way and Journey gold is not painted on it.
 *
 * In 6.3 it never holds an image. 6.5 puts real photos inside this geometry.
 */
export function PhotoFrame({ width, accessibilityLabel, empty = false }: Props) {
  const { surfaces } = useTheme();
  const labelled = Boolean(accessibilityLabel);
  return (
    <View
      accessible={labelled}
      accessibilityRole={labelled ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={labelled ? 'yes' : 'no-hide-descendants'}
      accessibilityElementsHidden={!labelled}
      style={[
        styles.frame,
        // The empty frame's dashes take tertiary text: the hairline border vanished on cream.
        { width, height: Math.round((width * 4) / 3), borderColor: empty ? surfaces.textTertiary : surfaces.border },
        empty ? styles.empty : { backgroundColor: surfaces.track },
      ]}
    >
      <Ionicons name="image-outline" size={Math.min(28, Math.round(width / 4))} color={surfaces.textTertiary} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.chip,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  empty: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
});
