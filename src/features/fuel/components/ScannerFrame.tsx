import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { MealSlot } from '../../../lib/nutrition';
import { mealAccent } from '../mealAccent';
import { palette, radii, spacing, typography } from '../../../theme/tokens';

type Props = {
  /** Dimmed while a lookup is running, so the frame reads as "holding". */
  busy?: boolean;
  /** The meal the scan is for, if it was started from one. */
  meal?: MealSlot | null;
};

const FRAME_SIZE = 250;
const CORNER = 34;
const STROKE = 3;

/**
 * The scanner's viewfinder chrome.
 *
 * Four corner brackets rather than a full rectangle — the brackets imply the
 * target area without drawing a box over the thing the user is trying to see.
 * Brand orange on a dimmed surround, which is the same nutrition accent used
 * everywhere else in Fuel; nothing here is a new visual language.
 *
 * The camera feed is deliberately left to dominate. **No gradients, no
 * animated laser line, no product chrome** — and nothing here moves, so there
 * is nothing for Reduce Motion to switch off. Motion unification is 5.8's.
 * §21, §22, §79.
 *
 * ## The frame is not the instruction
 *
 * A person who cannot see the brackets still needs to know what this screen
 * wants, so the scan region announces itself as one element — *Barcode
 * scanner. Center the barcode in the frame.* — rather than relying on a shape.
 * §75, §78.
 *
 * ## The meal, over the camera
 *
 * A scan started from Dinner shows the moon in dusk rose here, from the same
 * `mealAccent` mapping Fuel Home's meal rows and Add Food's context line read
 * — not a second badge, and not a scanner-only treatment. It sits over a dark
 * feed, so it takes the white label with the accent on the glyph rather than
 * `MealContext`'s theme-aware text, which would be invisible here. §20, §63,
 * §69.
 */
export function ScannerFrame({ busy = false, meal }: Props) {
  const tint = busy ? palette.textOnColor : palette.primary;
  const instruction = busy ? 'Looking up food…' : 'Center the barcode in the frame';

  return (
    <View style={styles.root} pointerEvents="none">
      {meal ? (
        <View style={styles.meal} accessible accessibilityRole="text" accessibilityLabel={`Adding to ${meal}`}>
          <Ionicons
            name={mealAccent(meal, 'dark').icon}
            size={15}
            /* The dark-scheme accent regardless of theme: the surface behind
               this is a camera feed, which is dark in both. */
            color={mealAccent(meal, 'dark').color}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Text style={styles.mealLabel}>{meal}</Text>
        </View>
      ) : null}

      <View
        style={styles.frame}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Barcode scanner. ${instruction}`}
      >
        <View style={[styles.corner, styles.topLeft, { borderColor: tint }]} />
        <View style={[styles.corner, styles.topRight, { borderColor: tint }]} />
        <View style={[styles.corner, styles.bottomLeft, { borderColor: tint }]} />
        <View style={[styles.corner, styles.bottomRight, { borderColor: tint }]} />
      </View>

      {/*
        * Factual, and about the mechanics of scanning. Never "discover how
        * healthy this is", "check your score", or "scan for better choices" —
        * the scanner reads a number off a package. §23.
        */}
      <Text style={styles.hint} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {instruction}
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
  meal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mealLabel: {
    ...typography.captionMedium,
    fontSize: 14,
    color: palette.textOnColor,
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
    color: palette.textOnColor,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
  },
});
