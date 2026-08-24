import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Chip, EmptyState, Screen, ScreenHeader, SectionHeader, TextField } from '../../../components/ui';
import { CategorySelector } from '../../../features/peptides/components/CategorySelector';
import { ClassificationChip } from '../../../features/peptides/components/ClassificationChip';
import {
  classificationSpoken,
  formatLabel,
  searchCatalog,
  usePeptideContext,
  type AreaFilter,
  type CatalogFilter,
  type PeptideDefinition,
} from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Choosing what to track, from a library rather than a short list.
 *
 * The catalog grew substantially in slice 3.5A, so scrolling alone is no
 * longer discovery. Search matches **names, aliases, and categories** — someone
 * who knows a compound as "PT-141", "Ozempic", or "Mod GRF 1-29" will type
 * that, and a name-only search would tell them VITA doesn't have it when it
 * does. Typing "GLP-1" finds the whole class.
 *
 * Filters are regulatory and chemical — Approved, Research, Blend — and
 * deliberately **not** goal-based. "Weight loss" or "muscle" as a primary
 * taxonomy would turn browsing into a recommendation; the detail pages carry
 * what each compound has been studied for without the catalog sorting people
 * toward an outcome.
 *
 * A row opens the compound's reference page rather than jumping straight into
 * a setup: with a library this size, knowing what something *is* comes before
 * deciding to track it.
 */
const FILTERS: { value: CatalogFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'research', label: 'Research' },
  { value: 'blend', label: 'Blends' },
];

export default function PeptideCatalog() {
  const { customDefinitions } = usePeptideContext();
  const { surfaces } = useTheme();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const [area, setArea] = useState<AreaFilter>('all');

  const catalogResults = useMemo(() => searchCatalog(query, filter, area), [query, filter, area]);

  const customResults = useMemo(() => {
    // Custom entries are neither approved nor research, so the regulatory
    // filters exclude them rather than mislabelling them. They carry no
    // research area either, so any area filter excludes them too — inventing
    // one for a name the user typed would be guessing on their behalf.
    if (filter === 'approved' || filter === 'research' || area !== 'all') return [];
    const trimmed = query.trim().toLowerCase();
    const sorted = [...customDefinitions].sort((a, b) => a.name.localeCompare(b.name));
    const byBlend = filter === 'blend' ? sorted.filter((d) => d.compoundType === 'blend') : sorted;
    if (trimmed.length === 0) return byBlend;
    return byBlend.filter((definition) => definition.name.toLowerCase().includes(trimmed));
  }, [customDefinitions, query, filter, area]);

  const nothingFound = catalogResults.length === 0 && customResults.length === 0;

  return (
    <Screen>
      <ScreenHeader title="Select Peptide" back />

      <TextField
        placeholder="Search name, alias, or class"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search peptides by name, alias, or class"
      />

      <View style={styles.filters}>
        {FILTERS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={filter === option.value}
            color={palette.peptide}
            accessibilityLabel={`Filter: ${option.label}`}
            onPress={() => setFilter(option.value)}
          />
        ))}
      </View>

      <CategorySelector value={area} onChange={setArea} />

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
          <DefinitionPanel definitions={customResults} />
        </>
      ) : null}

      {catalogResults.length > 0 ? (
        <>
          <SectionHeader title={`Catalog · ${catalogResults.length}`} />
          <DefinitionPanel definitions={catalogResults} />
        </>
      ) : null}

      {nothingFound ? (
        <EmptyState
          icon="search-outline"
          title="No matches"
          body={
            area === 'all'
              ? 'Add it as a Custom peptide instead.'
              : 'Try clearing the category, or add it as a Custom peptide.'
          }
        />
      ) : null}
    </Screen>
  );
}

function DefinitionPanel({ definitions }: { definitions: readonly PeptideDefinition[] }) {
  const { surfaces } = useTheme();

  return (
    <Card style={styles.panel}>
      {definitions.map((definition, index) => {
        /**
         * One descriptor, not four.
         *
         * Category plus aliases plus mechanism produced lines like
         * "Pro-apoptotic peptidomimetic · FTPP · Prohibitin-targeting p…" —
         * three facts competing for a space that fits one, and truncating
         * mid-word. The category alone is the identifying line; the detail
         * page carries aliases and everything else with room to show them.
         */
        const detail = definition.category ? formatLabel(definition.category) : '';

        return (
          <View
            key={definition.id}
            style={[index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
          >
            <Pressable
              onPress={() => router.push(`/peptides/catalog/${encodeURIComponent(definition.id)}`)}
              accessibilityRole="button"
              accessibilityLabel={[
                definition.name,
                classificationSpoken(definition.classification),
                detail,
                'View details',
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
                {detail ? (
                  <Text style={[styles.detail, { color: surfaces.textTertiary }]} numberOfLines={1}>
                    {detail}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
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
