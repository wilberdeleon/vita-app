import { StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing, typography } from '../../../theme/tokens';

type Props = {
  /** Dimmed while a lookup is running, so the frame reads as "holding". */
  busy?: boolean;
};

const FRAME_SIZE = 250;
const CORNER = 34;
const STROKE = 3;

/**
 * The scanner's viewfinder chrome.
 *
 * Four corner brackets rather than a full rectangle — the brackets imply the
 * target area without drawing a box over the thing the user is trying to
 * see. Brand orange on a dimmed surround, which is the same nutrition accent
 * used everywhere else in Fuel; nothing here is a new visual language.
 *
 * The camera feed is deliberately left to dominate. No gradients, no
 * animated laser line, no product chrome.
 */
export function ScannerFrame({ busy = false }: Props) {
  const tint = busy ? palette.textOnColor : palette.primary;

  return (
    <View style={styles.root} pointerEvents="none">
      <View style={styles.frame}>
        <View style={[styles.corner, styles.topLeft, { borderColor: tint }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: tint }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: tint }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: tint }]} />
      </View>
      <Text style={styles.hint}>
        {busy ? 'Looking up product…' : 'Align the barcode within the frame'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 0.62,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: STROKE,
    borderLeftWidth: STROKE,
    borderTopLeftRadius: radii.chip,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: STROKE,
    borderRightWidth: STROKE,
    borderTopRightRadius: radii.chip,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: STROKE,
    borderLeftWidth: STROKE,
    borderBottomLeftRadius: radii.chip,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: STROKE,
    borderRightWidth: STROKE,
    borderBottomRightRadius: radii.chip,
  },
  hint: {
    ...typography.captionMedium,
    // Fixed white: this sits over a live camera feed, not a theme surface.
    color: palette.textOnColor,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
});
