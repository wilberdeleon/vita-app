import { useState } from 'react';
import { EmptyState, Screen, ScreenHeader, SectionHeader, TextField } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { searchFixtureFoods } from '../../../features/fuel/fixtureCatalog';

/**
 * Interim search over the placeholder catalog. Real multi-provider search —
 * USDA + Open Food Facts, normalized, deduped, ranked, debounced — lands in
 * slice 2.6. The results already flow through the normalized model, so that
 * slice replaces the data source without touching this screen's shape.
 */
export default function SearchFood() {
  const [query, setQuery] = useState('');
  const results = searchFixtureFoods(query);
  const hasQuery = query.trim().length > 0;

  return (
    <Screen>
      <ScreenHeader title="Search Food" back />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {results.length > 0 ? (
        <>
          <SectionHeader title="Results" />
          {results.map((food) => (
            <FoodRow key={food.vitaId} food={food} />
          ))}
        </>
      ) : hasQuery ? (
        <EmptyState icon="search-outline" title="No matching foods" body="Try a different name, or add it manually." />
      ) : (
        <EmptyState icon="search-outline" title="Search for a food" body="Find something to log, then choose your serving." />
      )}
    </Screen>
  );
}
