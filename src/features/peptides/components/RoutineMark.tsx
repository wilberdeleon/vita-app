import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { palette } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { RoutineDayMark } from '../../../lib/peptides';

type Props = {
  mark: RoutineDayMark;
  /** Diameter. The Today hero uses the larger one; routine rows the small. */
  size?: number;
};

/**
 * How one day reads, as a mark.
 *
 * ## This is Peptides' visual identity, and it comes from the domain
 *
 * Water is a vessel filling up because hydration is a continuous quantity.
 * Peptides is not: it is **discrete scheduled events, each with a state**, so
 * its motif is the state itself. `routineDayMarkSymbol` in the domain already
 * settled the vocabulary in slice 3.9 — a tick, a dash, an open ring — and
 * this draws exactly that vocabulary rather than inventing a second one.
 *
 * That is also why there is no hero illustration on this screen. A vial
 * render or a molecule graphic would be decoration standing in for identity;
 * these marks *are* the information, repeated down the screen, and Today is
 * the hero.
 *
 * ## Deliberately not a tick and a cross
 *
 * A cross reads as *wrong*, and skipping a peptide on purpose is not wrong.
 * The dash is neutral. The open ring says **nothing has been recorded** —
 * which is a different thing from skipped, and must never collapse into it.
 *
 * ## Nothing here is colour-only
 *
 * Each state has its own shape, and every place this appears also states the
 * status in words. Violet marks a recorded administration, amber a
 * deliberate skip, and an unanswered day is an outline in the feature colour
 * — present, unfilled, waiting.
 */
export function RoutineMark({ mark, size = 26 }: Props) {
  const { surfaces } = useTheme();

  const radius = size / 2;
  const glyph = Math.round(size * 0.55);

  if (mark === 'taken') {
    return (
      <View
        style={[styles.base, { width: size, height: size, borderRadius: radius, backgroundColor: palette.peptide }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="checkmark" size={glyph} color={palette.textOnColor} />
      </View>
    );
  }

  if (mark === 'skipped') {
    return (
      <View
        style={[
          styles.base,
          styles.outline,
          { width: size, height: size, borderRadius: radius, borderColor: palette.routineSkipped },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="remove" size={glyph} color={palette.routineSkipped} />
      </View>
    );
  }

  if (mark === 'unconfirmed') {
    return (
      <View
        style={[
          styles.base,
          styles.outline,
          { width: size, height: size, borderRadius: radius, borderColor: palette.peptide },
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  }

  // Not scheduled — the user's own plan does not cover this day, so there is
  // nothing to say. A faint outline holds the space without asserting a state.
  return (
    <View
      style={[
        styles.base,
        styles.outline,
        { width: size, height: size, borderRadius: radius, borderColor: surfaces.border },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 2,
  },
});
