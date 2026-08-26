import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../../components/ui';
import { ClassificationChip } from '../../../../features/peptides/components/ClassificationChip';
import { DevelopmentStatusBlock } from '../../../../features/peptides/components/DevelopmentStatusBlock';
import { InfoTags } from '../../../../features/peptides/components/InfoTags';
import { Mechanisms } from '../../../../features/peptides/components/Mechanisms';
import { ResearchClaims } from '../../../../features/peptides/components/ResearchClaims';
import { RoutineCta } from '../../../../features/peptides/components/RoutineCta';
import {
  evidenceLabel,
  formatLabel,
  resolveBlendComponents,
  usePeptideContext,
  useRoutineForDefinition,
  type ResearchReference,
} from '../../../../lib/peptides';
import { useToast } from '../../../../components/ui';
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

  const { findDefinition, addToRoutine } = usePeptideContext();
  const routine = useRoutineForDefinition(definitionId);
  const { showToast } = useToast();
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
  const isBlend = definition.compoundType === 'blend';

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
          <Text style={[styles.category, { color: surfaces.textSecondary }]}>
            {formatLabel(definition.category)}
          </Text>
        ) : null}
      </View>

      {/*
        * The action sits with the identity, not after the research.
        *
        * These pages run to claims, mechanisms, studied-for, targets,
        * development status and sources. Founder QA found the old CTA at the
        * bottom of all that, which meant deciding to track something required
        * scrolling past everything you had already decided about. It is the
        * first thing under the name now, and it states what tapping it does.
        */}
      <RoutineCta
        state={routine?.routineState}
        onPress={async () => {
          if (routine) {
            router.push(
              routine.routineState === 'needs-setup'
                ? `/peptides/setup/${encodeURIComponent(routine.setup.id)}`
                : `/peptides/routine/${encodeURIComponent(routine.setup.id)}`,
            );
            return;
          }
          // Adding is not configuring. A shell is created and the user goes
          // back to their list; Setup happens when they are ready.
          await addToRoutine(definition.id);
          showToast({ message: `${definition.name} added to your routine.` });
          router.back();
        }}
      />

      {definition.aliases && definition.aliases.length > 0 ? (
        <>
          <SectionHeader title="Also known as" />
          {/* Brand names and development codes are already correctly cased by
              their authors, so `formatLabel` leaves them untouched. */}
          <InfoTags values={definition.aliases} label="Also known as" />
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
                  accessibilityLabel={`${component.definition.name}. ${
                    component.definition.category ? formatLabel(component.definition.category) : ''
                  }. View details`}
                  style={styles.componentRow}
                >
                  <View style={styles.componentBody}>
                    <Text style={[styles.componentName, { color: surfaces.text }]}>
                      {component.definition.name}
                    </Text>
                    {component.definition.category ? (
                      <Text style={[styles.componentDetail, { color: surfaces.textTertiary }]}>
                        {formatLabel(component.definition.category)}
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
        </>
      ) : null}

      {research?.overview ? (
        <>
          <SectionHeader title="About" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>{research.overview}</Text>
        </>
      ) : null}

      {/*
        * What it is claimed or researched to do, before how it works. A reader
        * who wants the mechanism will scroll; a reader who wants to know why
        * anyone tracks the compound should not have to.
        */}
      {research?.claims && research.claims.length > 0 ? (
        <>
          <SectionHeader title="Research claims" />
          <ResearchClaims claims={research.claims} />
        </>
      ) : null}

      {research?.mechanisms && research.mechanisms.length > 0 ? (
        <>
          <SectionHeader title="How it works" />
          <Mechanisms mechanisms={research.mechanisms} />
        </>
      ) : null}

      {/*
        * A blend's own section, separate from About. The formulation caveat is
        * a fact about the *name*, not about the research, and mixing it into
        * the research paragraph was part of what made these pages read long.
        */}
      {isBlend ? (
        <>
          <SectionHeader title="Formulation" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>
            Ratios may vary between suppliers. Your setup records the actual contents of your vial.
          </Text>
        </>
      ) : null}

      {research?.studiedFor && research.studiedFor.length > 0 ? (
        <>
          <SectionHeader title="Studied for" />
          <InfoTags values={research.studiedFor} label="Studied for" />
        </>
      ) : null}

      {research?.targets && research.targets.length > 0 ? (
        <>
          <SectionHeader title="Targets" />
          <InfoTags values={research.targets} label="Targets" />
        </>
      ) : null}

      {/*
        * "Approval status" for an approved medicine, "Development status"
        * otherwise — the same block answering the question each reader
        * actually has. An approved drug has no phase to report, and inventing
        * one would be nonsense.
        */}
      {research?.developmentStatus ? (
        <>
          <SectionHeader
            title={
              definition.classification === 'approved-medication' ? 'Approval status' : 'Development status'
            }
          />
          <DevelopmentStatusBlock status={research.developmentStatus} />
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
        </>
      ) : null}

      {/*
        * Its own section rather than a third paragraph tacked under Research
        * Status. Previously a blend page said "not FDA-approved" in the header,
        * again in the status line, and carried two more caveats below it —
        * four restatements of roughly one idea.
        */}
      {research?.blendCaveat ? (
        <>
          <SectionHeader title="Research context" />
          <Text style={[styles.body, { color: surfaces.textSecondary }]}>
            Research evidence primarily comes from the individual components; the combined formulation
            may not have been studied directly.
          </Text>
        </>
      ) : null}

      {!research?.overview ? (
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
