import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, SectionHeader, TextField } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { MIN_QUERY_LENGTH, parseMealSlot, useFoodSearch } from '../../../lib/nutrition';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Real multi-provider search. The screen knows nothing about USDA or Open
 * Food Facts — it renders `VitaFood`s that the provider layer has already
 * normalized, deduped, and ranked.
 */
export default function SearchFood() {
  const params = useLocalSearchParams<{ meal?: string }>();
  // Forwarded to each result so a food opened from a meal-specific flow
  // lands in that meal. Absent, Food Detail defaults by time of day.
  const meal = parseMealSlot(params.meal);
  const [query, setQuery] = useState('');
  const { status, results, error, diagnostics, retry } = useFoodSearch(query);
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Search Food" subtitle={meal ? `Adding to ${meal}` : undefined} back />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {status === 'idle' ? (
        <EmptyState
          icon="search-outline"
          title="Search for a food"
          body={`Type at least ${MIN_QUERY_LENGTH} characters to search.`}
        />
      ) : null}

      {status === 'searching' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
          <Text style={[styles.hint, { color: surfaces.textTertiary }]}>Searching…</Text>
        </View>
      ) : null}

      {status === 'results' ? (
        <>
          <SectionHeader title="Results" />
          {results.map((food) => (
            <FoodRow key={food.vitaId} food={food} meal={meal} />
          ))}
        </>
      ) : null}

      {status === 'empty' ? (
        <EmptyState icon="search-outline" title="No matching foods" body="Try a different name, or add it manually." />
      ) : null}

      {status === 'error' ? (
        <View style={styles.stateBlock}>
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load results"
            body={error ?? 'Check your connection and try again.'}
          />
          <Button label="Try again" variant="soft" onPress={retry} />
        </View>
      ) : null}

      {status === 'unconfigured' ? (
        <EmptyState
          icon="construct-outline"
          title="Food search isn't set up yet"
          body="No food data provider is configured for this build."
        />
      ) : null}

      {/* Dev-only provider diagnostics — a category and a stage, never a key. */}
      {__DEV__ && diagnostics.length > 0 ? (
        <Text style={[styles.diagnostics, { color: surfaces.textTertiary }]}>{diagnostics.join('\n')}</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.xxl,
  },
  hint: {
    ...typography.caption,
  },
  stateBlock: {
    gap: spacing.m,
  },
  diagnostics: {
    ...typography.micro,
    textAlign: 'center',
  },
});
