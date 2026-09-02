import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { ClassificationChip } from '../../../../features/peptides/components/ClassificationChip';
import { SetupForm, type SetupFormValue } from '../../../../features/peptides/components/SetupForm';
import { formatLabel, usePeptideContext, useResolvedSetup } from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * Editing one setup.
 *
 * `id`, `definitionId`, and `createdAt` are never touched. Re-pointing a setup
 * at a different compound would silently rewrite what its future history
 * refers to; a user who wants to track something else creates another setup.
 *
 * **Configuration only** (slice 3.9). Logging, history, pausing and removing
 * moved to the routine screen, which is what opening a peptide now lands on.
 * This surface exists for the occasional act of changing a vial or a
 * schedule, and saving it is what turns a newly added peptide into a running
 * routine — there is no separate Activate step.
 *
 * Deactivation lives here rather than as a swipe on the list, because it is
 * occasional and reversible. It **never deletes anything** — every field
 * survives, and once logging exists the setup's history is independent of
 * whether it is currently active.
 */
export default function EditPeptideSetup() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const { updateSetup, completeSetup } = usePeptideContext();
  const resolved = useResolvedSetup(setupId);
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [value, setValue] = useState<SetupFormValue>({});
  const [isValid, setIsValid] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * Reset the draft when a different setup is opened. `/peptides/setup/[id]`
   * is one route, so navigating between setups updates params without
   * remounting — the same trap the water entry editor and Fuel's entry editor
   * both guard against.
   */
  useEffect(() => {
    setValue({});
    setIsValid(true);
    setSaving(false);
  }, [setupId]);

  if (!resolved) {
    return (
      <Screen>
        <ScreenHeader title="Routine Setup" back />
        <EmptyState
          icon="help-circle-outline"
          title="This setup is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const { setup, definition } = resolved;

  const needsSetup = setup.routineState === 'needs-setup';

  /**
   * Saving is what makes a new routine active.
   *
   * There is deliberately no separate Activate button: someone who has just
   * filled in their vial, their water and their schedule has finished setting
   * the routine up, and asking them to confirm that again would be a step
   * that exists only because the data model wanted one.
   *
   * An already-configured routine keeps whatever state it had — saving an
   * edit must never quietly un-pause a paused routine.
   */
  const save = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    if (needsSetup) {
      await completeSetup(setup.id, value);
      showToast({ message: `${definition.name} is ready` });
    } else {
      await updateSetup(setup.id, value);
      showToast({ message: `Updated · ${definition.name}` });
    }
    router.back();
  };

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Routine Setup" back />

      <Text style={[styles.name, { color: surfaces.text }]}>{definition.name}</Text>
      <ClassificationChip classification={definition.classification} />
      {/* Title-cased like every other place the catalog's category is shown.
          This one rendered the stored string exactly as authored, so the same
          compound read "Melanocortin agonist" here and "Melanocortin Agonist"
          one screen back. */}
      {definition.category ? (
        <Text style={[styles.category, { color: surfaces.textTertiary }]}>
          {formatLabel(definition.category)}
        </Text>
      ) : null}

      {needsSetup ? (
        <Text style={[styles.inactive, { color: surfaces.textTertiary }]}>
          Set this up and it moves into your active routines.
        </Text>
      ) : setup.routineState === 'inactive' ? (
        <Text style={[styles.inactive, { color: surfaces.textTertiary }]}>
          This routine is paused. Its details are kept exactly as you left them.
        </Text>
      ) : null}

      {/* Keyed on the setup so the form's own draft state rebuilds when a
          different setup is opened, rather than carrying the previous one. */}
      <SetupForm
        key={setup.id}
        initial={setup}
        onChange={(next, valid) => {
          setValue(next);
          setIsValid(valid);
        }}
      />

      <Button
        label={needsSetup ? 'Save Setup' : 'Save Changes'}
        color={palette.peptide}
        disabled={!isValid || saving}
        onPress={() => void save()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    ...typography.heading,
  },
  category: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  inactive: {
    ...typography.caption,
  },
});
