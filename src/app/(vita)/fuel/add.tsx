import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import {
  EmptyState,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  TextField,
} from '../../../components/ui';
import { FoodListRow } from '../../../features/fuel/components/FoodListRow';
import { MealContext } from '../../../features/fuel/components/MealContext';
import {
  foodFromEntry,
  parseMealSlot,
  useFoodSearch,
  useNutrition,
  useRecentFoods,
  type VitaFood,
} from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/** How many of each list the idle screen shows before Search takes over. */
const IDLE_LIMIT = 5;

/**
 * **Add food** — search first, with what you already eat underneath it.
 *
 * ## What this replaced
 *
 * A menu. Tapping *Add food* used to open a list of five destinations — Scan
 * Barcode, Search Food, Add Manually, Recent Foods, Favorites — so reaching a
 * food took two taps before any typing, and search, the thing almost everyone
 * wants, was a row in a card. The founder's instruction for 5.6C was that the
 * first step must not be another menu.
 *
 * So the search field is the subject of the screen, and the two lists that
 * make logging fast — what you logged recently, what you favourited — sit
 * directly beneath it as **real rows you can tap**, not as buttons that open
 * screens containing rows you can tap. Scan and Manual stay, as two small
 * neutral actions rather than two cards.
 *
 * ## Idle, then active
 *
 * With an empty query the screen is Recent and Favorites. The moment a query
 * exists, results replace both — nobody should scroll past yesterday's lunch
 * to reach what they just typed. `/fuel/recent` and `/fuel/favorites` still
 * exist as full lists and render the same rows.
 *
 * ## Everything here is real
 *
 * Recents are derived from the food log itself, favourites from the user's own
 * stored list. Neither is padded, neither is suggested, and a section with
 * nothing in it does not appear at all. **No food is recommended, ranked
 * against a goal, scored or graded** — search relevance is the provider
 * layer's, and Fuel has no opinion about what anyone should eat.
 *
 * ## The meal survives
 *
 * Opened from a meal's `+`, this carries `?meal=` into search results,
 * recents, favourites, the scanner and manual entry, so the meal someone
 * already chose is never asked for twice. The context line uses **Fuel Home's
 * own meal identity** rather than a second one — see `MealContext`.
 */
export default function AddFood() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const meal = parseMealSlot(params.meal);
  const suffix = meal ? `?meal=${encodeURIComponent(meal)}` : '';

  const [query, setQuery] = useState('');
  const { status, results, retry } = useFoodSearch(query);
  const { favorites, findFood, entries } = useNutrition();
  const { recents } = useRecentFoods();
  const { surfaces } = useTheme();

  const searching = query.trim().length > 0;

  /*
   * A favourite stores its own definition where the provider's terms allow
   * it; where they do not, the identity is kept and the food is rebuilt from
   * the user's own logging history. The row renders the same either way.
   */
  const favoriteFoods = favorites
    .map((favorite) => {
      const stored = findFood(favorite.vitaId);
      if (stored) return stored;
      const entry = entries.find((candidate) => candidate.foodRef.vitaFoodId === favorite.vitaId);
      return entry ? foodFromEntry(entry) : undefined;
    })
    .filter((food): food is VitaFood => Boolean(food))
    .slice(0, IDLE_LIMIT);

  const recentFoods = recents.slice(0, IDLE_LIMIT).map((recent) => recent.food);

  const action = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    spoken: string,
    onPress: () => void,
  ) => (
    /*
     * The cell carries the flex, not the button.
     *
     * `PressableScale` applies its `style` to an inner animated view, so a
     * `flex` handed to it never reaches this row — the trap recorded in the
     * Migration Guide and worked around at seven other call sites. The
     * primitive's own fix belongs to 5.7; this is the same wrapper everywhere
     * else uses.
     */
    <View style={styles.cell}>
      <PressableScale
        onPress={onPress}
        accessibilityLabel={spoken}
        style={[styles.action, { borderColor: surfaces.border }]}
      >
        <Ionicons name={icon} size={17} color={palette.primary} />
        <Text style={[styles.actionLabel, { color: surfaces.text }]}>{label}</Text>
      </PressableScale>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader title="Add food" back close />
      {meal ? <MealContext meal={meal} /> : null}

      {/*
        * The subject of the screen. The app's ordinary input, not a special
        * search treatment — `TextField` is what every other VITA field is.
        *
        * Deliberately **not** autofocused: the keyboard would cover Recent
        * and Favorites, which are the fastest path for a returning user and
        * the reason this screen shows them at all. The field is the first
        * thing on the screen and one tap away.
        */}
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel="Search foods"
      />

      <View style={styles.actions}>
        {action('barcode-outline', 'Scan', 'Scan a barcode', () =>
          router.push(`/fuel/scan${suffix}`),
        )}
        {action('create-outline', 'Manual', 'Enter a food manually', () =>
          router.push(`/fuel/manual${suffix}`),
        )}
      </View>

      {searching ? (
        <SearchResults status={status} results={results} meal={meal} retry={retry} suffix={suffix} />
      ) : (
        <>
          {recentFoods.length > 0 ? (
            <View>
              <SectionHeader title="Recent" actionLabel="All" onAction={() => router.push(`/fuel/recent${suffix}`)} />
              {recentFoods.map((food, index) => (
                <FoodListRow key={food.vitaId} food={food} meal={meal} divided={index > 0} />
              ))}
            </View>
          ) : null}

          {favoriteFoods.length > 0 ? (
            <View>
              <SectionHeader
                title="Favorites"
                actionLabel="All"
                onAction={() => router.push(`/fuel/favorites${suffix}`)}
              />
              {/*
                * The heart stays here, unlike on the full Favorites screen.
                * Two reasons, both found on device: this section sits directly
                * beneath Recent, and without the heart the two sections'
                * calorie columns did not line up; and a favourite listed
                * beside a recent is exactly where someone would want to
                * un-favourite it.
                */}
              {favoriteFoods.map((food, index) => (
                <FoodListRow key={food.vitaId} food={food} meal={meal} divided={index > 0} />
              ))}
            </View>
          ) : null}

          {/* Nothing logged and nothing favourited — a real first day. */}
          {recentFoods.length === 0 && favoriteFoods.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="Nothing logged yet"
              body="Search for a food, or scan a barcode."
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}

/**
 * The five states a search can be in, and nothing about who answered it.
 *
 * **Providers stay invisible.** One source failing while another returns is a
 * successful search, so a partial failure renders results and says nothing;
 * only a total failure becomes a state, and it says so in plain words with no
 * status code, endpoint or provider name in it.
 */
function SearchResults({
  status,
  results,
  meal,
  retry,
  suffix,
}: {
  status: ReturnType<typeof useFoodSearch>['status'];
  results: ReturnType<typeof useFoodSearch>['results'];
  meal: ReturnType<typeof parseMealSlot>;
  retry: () => void;
  suffix: string;
}) {
  const { surfaces } = useTheme();

  if (status === 'searching') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (status === 'results') {
    return (
      <View>
        {results.map((food, index) => (
          <FoodListRow key={food.vitaId} food={food} meal={meal} divided={index > 0} />
        ))}
      </View>
    );
  }

  if (status === 'empty') {
    return (
      <View style={styles.state}>
        <EmptyState
          icon="search-outline"
          title="No foods found"
          body="Try another search or enter it manually."
        />
        <PressableScale
          onPress={() => router.push(`/fuel/manual${suffix}`)}
          accessibilityLabel="Enter a food manually"
          style={[styles.action, styles.centeredAction, { borderColor: surfaces.border }]}
        >
          <Ionicons name="create-outline" size={17} color={palette.primary} />
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>Manual</Text>
        </PressableScale>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.state}>
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't search right now"
          body="Check your connection and try again."
        />
        <PressableScale
          onPress={retry}
          accessibilityLabel="Try again"
          style={[styles.action, styles.centeredAction, { borderColor: surfaces.border }]}
        >
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>Try again</Text>
        </PressableScale>
      </View>
    );
  }

  if (status === 'unconfigured') {
    return (
      <EmptyState
        icon="construct-outline"
        title="Food search isn't set up yet"
        body="No food data provider is configured for this build."
      />
    );
  }

  /* `idle` — the query is shorter than the provider layer's floor. */
  return null;
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    // Wraps at accessibility text sizes, where two labels no longer fit side
    // by side. The 5.6C device pass found `Sc` and `Ma:` here.
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  cell: {
    // Grows to share the row, and takes a whole one once the labels need it.
    flexGrow: 1,
    flexBasis: 130,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 44,
    // Neutral by default; the orange is on the glyph alone. The same
    // restraint Fuel Home's `Add food` uses.
  },
  centeredAction: {
    alignSelf: 'center',
  },
  actionLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    // Wraps inside the button rather than being clipped by it.
    flexShrink: 1,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  state: {
    gap: spacing.m,
  },
});
