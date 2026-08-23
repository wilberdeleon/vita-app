import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../../components/ui';
import { ClassificationChip } from '../../../../features/peptides/components/ClassificationChip';
import {
  evidenceLabel,
  resolveBlendComponents,
  usePeptideContext,
  type ResearchReference,
} from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * A factual reference page for one compound.
 *
 * Answers the four questions a user actually has — what is this, what does it
 * target, what has it been studied for, and how solid is the evidence — and
 * treats regulatory status as one line among those rather than as the whole
 * page. A screen that leads with FDA status reads like a compliance database;
 * this one leads with what the compound is.
 *
 * **"Studied for", never "used for".** The distinction is the point: the app
 * is reporting what research has examined, not what anyone does with a
 * compound or should.
 */
export default function PeptideDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const definitionId = decodeURIComponent(id ?? '');

  const { findDefinition } = usePeptideContext();
  const { surfaces } = useTheme();

  const definition = findDefinition(definitionId);

  if (!definition) {
    return (
      <Screen>
        <ScreenHeader title="Peptide" back />
        <EmptyState icon="help-circle-outline" title="That peptide isn't available" />
      </Screen>
    );
  }

  const research = definition.research;
  const components = resolveBlendComponents(definition, findDefinition);
  const isResearch = definition.classification === 'research-compound';

  return (
    <Screen>
      <ScreenHeader title="Peptide" back />

      <View style={styles.header}>
        <Text style={[styles.name, { color: surfaces.text }]}>{definition.name}</Text>
        <View style={styles.chipRow}>
          <ClassificationChip classification={definition.classification} />
          {isResearch ? (
            <Text style={[styles.statusLine, { color: surfaces.textTertiary }]}>Not FDA-approved</Text>
          ) : null}
        </View>
        {definition.category ? (
          <Text style={[styles.category, { color: surfaces.textSecondary }]}>{definition.category}</Text>
        ) : null}
      </View>

      {definition.aliases && definition.aliases.length > 0 ? (
        <>
          <SectionHeader title="Also known as" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>
            {definition.aliases.join(' · ')}
          </Text>
        </>
      ) : null}

      {components.length > 0 ? (
        <>
          <SectionHeader title="Components" />
          <Card style={styles.panel}>
            {components.map((component, index) => (
              <View
                key={component.definition.id}
                style={[index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
              >
                <Pressable
                  onPress={() =>
                    router.push(`/peptides/catalog/${encodeURIComponent(component.definition.id)}`)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${component.definition.name}. ${component.definition.category ?? ''}. View details`}
                  style={styles.componentRow}
                >
                  <View style={styles.componentBody}>
                    <Text style={[styles.componentName, { color: surfaces.text }]}>
                      {component.definition.name}
                    </Text>
                    {component.definition.category ? (
                      <Text style={[styles.componentDetail, { color: surfaces.textTertiary }]}>
                        {component.definition.category}
                      </Text>
                    ) : null}
                  </View>
                  {component.amount !== undefined && component.unit ? (
                    <Text style={[styles.componentDetail, { color: surfaces.textSecondary }]}>
                      {component.amount} {component.unit}
                    </Text>
                  ) : null}
                  <Ionicons name="chevron-forward" size={14} color={surfaces.textTertiary} />
                </Pressable>
              </View>
            ))}
          </Card>
          {/*
            * Stated up front rather than buried: a blend name identifies which
            * compounds are present, not how much of each. The user's own setup
            * owns what is actually in their vial.
            */}
          <Text style={[styles.note, { color: surfaces.textTertiary }]}>
            Amounts aren't standardized for this name and vary between suppliers. Your own setup records
            what's in your vial.
          </Text>
        </>
      ) : null}

      {research?.summary ? (
        <>
          <SectionHeader title="About" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>{research.summary}</Text>
        </>
      ) : null}

      {research?.studiedFor && research.studiedFor.length > 0 ? (
        <>
          <SectionHeader title="Studied for" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>
            {research.studiedFor.join(' · ')}
          </Text>
        </>
      ) : null}

      {research?.targets && research.targets.length > 0 ? (
        <>
          <SectionHeader title="Targets" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>
            {research.targets.join(' · ')}
          </Text>
        </>
      ) : null}

      {research?.evidenceLevel || research?.researchStatus ? (
        <>
          <SectionHeader title="Research status" />
          {research.evidenceLevel ? (
            <Text style={[styles.evidence, { color: palette.peptide }]}>
              {evidenceLabel(research.evidenceLevel)}
            </Text>
          ) : null}
          {research.researchStatus ? (
            <Text style={[styles.body, { color: surfaces.textSecondary }]}>{research.researchStatus}</Text>
          ) : null}
          {research.blendCaveat ? (
            <Text style={[styles.note, { color: surfaces.textTertiary }]}>
              Research context here comes from the individual components. The combination itself may not
              have been studied as a single formulation.
            </Text>
          ) : null}
        </>
      ) : null}

      {!research?.summary ? (
        /*
         * Honest about a gap rather than filling it. A definition with no
         * reviewed summary still has a real identity worth tracking; inventing
         * prose to make the page look complete is the failure mode this
         * avoids.
         */
        <Text style={[styles.note, { color: surfaces.textTertiary }]}>
          No reviewed research summary yet for this entry. Its name and status are still recorded so you
          can track it.
        </Text>
      ) : null}

      {research?.references && research.references.length > 0 ? (
        <>
          <SectionHeader title="Sources" />
          <Card style={styles.panel}>
            {research.references.map((reference, index) => (
              <View
                key={reference.label}
                style={[index > 0 && styles.divided, index > 0 && { borderTopColor: surfaces.border }]}
              >
                <ReferenceRow reference={reference} />
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <Button
        label="Track this peptide"
        icon="add"
        color={palette.peptide}
        onPress={() =>
          router.push(`/peptides/setup/new?definitionId=${encodeURIComponent(definition.id)}`)
        }
      />

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Information is for tracking and educational reference only. VITA does not recommend peptides,
        dosing, or treatment.
      </Text>
    </Screen>
  );
}

/**
 * One source pointer.
 *
 * These open a search in an authoritative database rather than a specific
 * citation — see `data/definitions/seed.ts` for why. A row with no URL still
 * renders, as a plain label, so a source can be named without pretending to
 * link somewhere.
 */
function ReferenceRow({ reference }: { reference: ResearchReference }) {
  const { surfaces } = useTheme();

  if (!reference.url) {
    return (
      <View style={styles.componentRow}>
        <Text style={[styles.componentName, { color: surfaces.textSecondary }]}>{reference.label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => void Linking.openURL(reference.url!)}
      accessibilityRole="link"
      accessibilityLabel={`${reference.label}. Opens in your browser`}
      style={styles.componentRow}
    >
      <Text style={[styles.componentName, { color: surfaces.text }]}>{reference.label}</Text>
      <Ionicons name="open-outline" size={14} color={surfaces.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.s,
  },
  name: {
    ...typography.display,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
  statusLine: {
    ...typography.caption,
  },
  category: {
    ...typography.bodyMedium,
  },
  body: {
    ...typography.body,
    marginTop: -spacing.xs,
  },
  evidence: {
    ...typography.captionMedium,
    marginTop: -spacing.xs,
  },
  note: {
    ...typography.caption,
  },
  panel: {
    paddingVertical: spacing.xs,
  },
  divided: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    minHeight: 44,
  },
  componentBody: {
    flex: 1,
    gap: 2,
  },
  componentName: {
    ...typography.bodyMedium,
    flexShrink: 1,
  },
  componentDetail: {
    ...typography.caption,
  },
});
