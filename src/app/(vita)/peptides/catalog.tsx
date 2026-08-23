import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, Screen, ScreenHeader, SectionHeader, TextField } from '../../../components/ui';
import { ClassificationChip } from '../../../features/peptides/components/ClassificationChip';
import { searchCatalog, usePeptideContext, type PeptideDefinition } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Choosing what to track.
 *
 * The catalog exists to stop people retyping names and to give every setup a
 * structured identity — **not** to suggest what anyone should take. Entries are
 * alphabetical, with no ranking, no popularity, and no goal tags.
 *
 * Search is local, synchronous, and substring-based. Eighteen entries need no
 * index, no ranking, and certainly no network call.
 *
 * Replaces the Sprint 0 `examples.tsx`, whose rows called `router.back()`
 * without selecting anything.
 */
export default function PeptideCatalog() {
  const { customDefinitions } = usePeptideContext();
  const { surfaces } = useTheme();
  const [query, setQuery] = useState('');

  const catalogResults = useMemo(() => searchCatalog(query), [query]);

  const customResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const sorted = [...customDefinitions].sort((a, b) => a.name.localeCompare(b.name));
    if (trimmed.length === 0) return sorted;
    return sorted.filter((definition) => definition.name.toLowerCase().includes(trimmed));
  }, [customDefinitions, query]);

  const select = (definition: PeptideDefinition) => {
    router.push(`/peptides/setup/new?definitionId=${encodeURIComponent(definition.id)}`);
  };

  const nothingFound = catalogResults.length === 0 && customResults.length === 0;

  return (
    <Screen>
      <ScreenHeader title="Select Peptide" back />

      <TextField
        placeholder="Search peptides"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search peptides by name"
      />

      <Card style={styles.panel}>
        <Pressable
          onPress={() => router.push('/peptides/custom')}
          accessibilityRole="button"
          accessibilityLabel="Add a custom peptide not in this list"
          style={styles.row}
        >
          <Ionicons name="add-circle-outline" size={20} color={palette.peptide} />
          <View style={styles.body}>
            <Text style={[styles.name, { color: surfaces.text }]}>Custom</Text>
            <Text style={[styles.detail, { color: surfaces.textTertiary }]}>
              Track something that isn't listed
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
        </Pressable>
      </Card>

      {customResults.length > 0 ? (
        <>
          <SectionHeader title="Your peptides" />
          <DefinitionPanel definitions={customResults} onSelect={select} />
        </>
      ) : null}

      <SectionHeader title="Catalog" />
      {catalogResults.length > 0 ? (
        <DefinitionPanel definitions={catalogResults} onSelect={select} />
      ) : null}

      {nothingFound ? (
        <EmptyState
          icon="search-outline"
          title="No matches"
          body="Add it as a Custom peptide instead."
        />
      ) : null}
    </Screen>
  );
}

function DefinitionPanel({
  definitions,
  onSelect,
}: {
  definitions: readonly PeptideDefinition[];
  onSelect: (definition: PeptideDefinition) => void;
}) {
  const { surfaces } = useTheme();

  return (
    <Card style={styles.panel}>
      {definitions.map((definition, index) => (
        <View
          key={definition.id}
          style={[index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
        >
          <Pressable
            onPress={() => onSelect(definition)}
            accessibilityRole="button"
            accessibilityLabel={[
              definition.name,
              definition.classification === 'approved-medication'
                ? 'approved medication'
                : definition.classification === 'research-compound'
                  ? 'research compound'
                  : 'custom entry',
              definition.category,
            ]
              .filter(Boolean)
              .join('. ')}
            style={styles.row}
          >
            <View style={styles.body}>
              <View style={styles.titleRow}>
                <Text style={[styles.name, { color: surfaces.text }]} numberOfLines={1}>
                  {definition.name}
                </Text>
                <ClassificationChip classification={definition.classification} />
              </View>
              {definition.category ? (
                <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={1}>
                  {definition.category}
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
          </Pressable>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingVertical: spacing.xs,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
  name: {
    ...typography.bodyMedium,
    flexShrink: 1,
  },
  detail: {
    ...typography.caption,
  },
});
