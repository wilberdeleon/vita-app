import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen, ScreenHeader, SectionHeader, TextField } from '../../../components/ui';
import { FoodRow } from '../../../features/fuel/components/FoodRow';
import { searchFoods } from '../../../features/fuel/api';
import { palette, spacing, typography } from '../../../theme/tokens';

export default function SearchFood() {
  const [query, setQuery] = useState('big mac');
  const results = searchFoods(query);

  return (
    <Screen>
      <ScreenHeader title="Search Food" back />
      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder="Search foods"
        autoCorrect={false}
        returnKeyType="search"
      />
      {results.length > 0 ? (
        <>
          <SectionHeader title="Results" />
          {results.map((food) => (
            <FoodRow key={food.id} food={food} />
          ))}
        </>
      ) : (
        <Text style={styles.empty}>
          {query.trim() ? 'No foods matched your search.' : 'Search our database to log a food.'}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...typography.caption,
    color: palette.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xxxl,
  },
});
