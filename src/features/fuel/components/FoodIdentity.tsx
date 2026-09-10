import { StyleSheet, Text, View } from 'react-native';
import type { VitaFood } from '../../../lib/nutrition';
import { foodIdentity } from '../foodFacts';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { FoodAvatar } from './FoodAvatar';

/** Larger than a list row's 32, small enough not to become a hero card. */
const AVATAR = 48;

type Props = {
  food: VitaFood;
  /** The serving currently selected, appended to the supporting line. */
  servingLabel?: string | null;
  /** Provenance, shown only where it earns its place — see Food Detail. */
  footnote?: string | null;
};

/**
 * **Which food this is** — the same object the row in Search was.
 *
 * ## Why it is not a hero
 *
 * It used to be: a 64pt picture centred over a centred title over centred grey
 * metadata, which is the composition every 2019 food app used and the one
 * thing on the screen that could not have come from anywhere else in VITA. The
 * founder's consistency contract asks the opposite question — *does this look
 * like the row I just tapped?* — so it is now the row's own geometry, one size
 * up: the picture on the left, the name beside it, the supporting line beneath
 * it, left-aligned and direct on the background.
 *
 * ## The picture comes from the shared resolver
 *
 * `FoodAvatar` runs `foodVisual`'s three tiers — real product photograph, then
 * VITA's own category drawing, then the honest generic — which is the same
 * component and the same tiers Search, Recents, Favorites and the meal rows
 * use. **No screen decides which tier applies**, so a banana is the same
 * banana in the list and on the screen the list opens, and a food whose image
 * URL is dead falls back to art rather than to a dead grey rectangle. §62,
 * §72.
 *
 * ## The name is never cropped
 *
 * It carries no line limit at all — the same ruling `FoodListRow` records
 * after the device pass caught `Clif Bar Cool Mint…` under a two-line cap. It
 * is the one string a person is reading to confirm they opened the right
 * thing. A long name wraps and the row grows; the picture stays put.
 *
 * ## Absent data is absent
 *
 * `foodIdentity` joins only the parts that exist, so a food with no brand
 * reads `1 container` rather than `undefined · 1 container`, and one with
 * neither shows the name alone. §73.
 */
export function FoodIdentity({ food, servingLabel, footnote }: Props) {
  const { surfaces } = useTheme();
  const identity = foodIdentity(food, servingLabel);

  return (
    <View style={styles.row} testID="food-identity">
      <FoodAvatar food={food} size={AVATAR} />

      <View
        style={styles.text}
        accessible
        accessibilityRole="text"
        accessibilityLabel={identity.spoken}
      >
        <Text style={[styles.name, { color: surfaces.text }]}>{identity.name}</Text>
        {identity.detail ? (
          <Text style={[styles.detail, { color: surfaces.textTertiary }]}>{identity.detail}</Text>
        ) : null}
        {/*
          * Quiet, and at the bottom. Whether a food came from Open Food Facts
          * or USDA is architecture; it is shown only where it makes an
          * incorrect-product report actionable, and it is never the subject of
          * the screen. §44.
          */}
        {footnote ? (
          <Text style={[styles.footnote, { color: surfaces.textTertiary }]}>{footnote}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    // One step above the list row's `body`, which is as far as a detail screen
    // needs to go to say "this is the subject" without becoming a banner.
    ...typography.bodyMedium,
    fontSize: 20,
    fontWeight: '600',
  },
  detail: {
    ...typography.caption,
  },
  footnote: {
    ...typography.micro,
    marginTop: 2,
  },
});
