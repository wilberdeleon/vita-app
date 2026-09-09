import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MealSlot, VitaFood } from '../../../lib/nutrition';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { foodRowView } from '../foodRow';
import { FavoriteButton } from './FavoriteButton';
import { FoodAvatar } from './FoodAvatar';

/** The avatar Fuel Home's meal rows draw. One size, so lists match. */
const AVATAR = 32;

type Props = {
  food: VitaFood;
  /**
   * Carried through to Food Detail so a food opened from a meal-specific flow
   * lands in that meal. Unset, Food Detail seeds the meal from the time of day.
   */
  meal?: MealSlot;
  /** The hairline above. Off for the first row in a list. */
  divided?: boolean;
  /** Hidden on the Favorites screen itself, where every row is favorited. */
  showFavorite?: boolean;
};

/**
 * **One food, one row — search results, Recents, Favorites, My Foods.**
 *
 * ## Why this replaced `FoodRow`
 *
 * `FoodRow` was built on `ListRow`, which draws a filled card with a border
 * and a shadow. That was VITA's row language in Sprint 2; Fuel Home stopped
 * using it in 5.6B, so by the time Fuel Home locked, a search result and a
 * logged food — the *same food* — were a card and a bare row. The founder's
 * visual-consistency contract is explicit that equivalent patterns reuse
 * equivalent presentation, so this row is Fuel Home's meal row: direct on the
 * background, a hairline above it, the same 32pt avatar, the same type.
 *
 * The Favorites screen additionally wrapped `FoodRow` in a flex row to hang an
 * external heart off it — a fourth variant of the same thing. The heart is a
 * prop here, and there is one implementation.
 *
 * ## The picture comes from the shared resolver
 *
 * `FoodAvatar` runs `foodVisual`'s three tiers — real product photograph, then
 * VITA's own category drawing, then the honest generic. **No screen decides
 * which tier applies**, which is what keeps a banana looking like a banana in
 * Search, in Recents, in the log and in the editor rather than in whichever
 * ones remembered the rule.
 *
 * ## Text wraps; the name is never cropped
 *
 * A long product name is information, so it carries no line limit at all: a
 * food called *Organic sprouted whole grain sourdough* reads in full at every
 * text size instead of becoming an ellipsis. The supporting line takes two
 * lines, and nothing here pins a row height.
 *
 * ## What it deliberately does not do
 *
 * No macros — recognition first, and Food Detail owns the nutrition. **No
 * provider badge**: whether a food came from USDA or Open Food Facts is an
 * implementation detail, and `VitaFood` is the UI's contract. No score, no
 * grade, no "better choice" marker, and no one-tap log — the serving, the
 * amount and the meal are chosen in Food Detail, which is the correctness
 * checkpoint.
 */
export function FoodListRow({ food, meal, divided = false, showFavorite = true }: Props) {
  const { surfaces } = useTheme();
  const view = foodRowView(food);

  return (
    <View style={[divided && styles.divided, divided && { borderTopColor: surfaces.border }]}>
      <Pressable
        onPress={() =>
          router.push(
            `/fuel/food/${encodeURIComponent(food.vitaId)}${meal ? `?meal=${encodeURIComponent(meal)}` : ''}`,
          )
        }
        accessibilityRole="button"
        accessibilityLabel={view.spoken}
        accessibilityHint="Opens this food"
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <FoodAvatar food={food} size={AVATAR} />

        <View style={styles.text}>
          {/*
            * No line limit at all on the name.
            *
            * It is the row's subject, and the device pass caught
            * `Clif Bar Cool Mint…` at accessibility sizes with a two-line cap
            * — an ellipsis in the one string a person is scanning for. The
            * supporting line below it may cap; this may not.
            */}
          <Text style={[styles.name, { color: surfaces.text }]}>{view.name}</Text>
          {view.detail ? (
            <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={2}>
              {view.detail}
            </Text>
          ) : null}
        </View>

        {view.calories ? (
          <Text style={[styles.calories, { color: surfaces.textSecondary }]}>{view.calories}</Text>
        ) : null}

        {/*
          * Nested inside the row's own `Pressable`, this wins the touch by
          * React Native's responder rules — so tapping the heart favourites
          * the food and does *not* open it.
          */}
        {showFavorite ? <FavoriteButton food={food} size={19} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.s,
    minHeight: 48,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.body,
  },
  detail: {
    ...typography.caption,
  },
  calories: {
    ...typography.bodyMedium,
  },
});
