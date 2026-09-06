import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  EmptyState,
  PressableScale,
  Screen,
  ScreenHeader,
  useToast,
} from '../../../../components/ui';
import { ClassificationChip } from '../../../../features/peptides/components/ClassificationChip';
import { SetupForm, type SetupFormValue } from '../../../../features/peptides/components/SetupForm';
import { formatLabel, usePeptideContext, useResolvedSetup } from '../../../../lib/peptides';
import { spacing, typography } from '../../../../theme/tokens';
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
      {/*
        * A routine that has never been configured opens with Preparation
        * expanded — that section is why the screen exists for it. One that is
        * already running opens on the fields people actually change.
        */}
      <SetupForm
        key={setup.id}
        mode={needsSetup ? 'new' : 'edit'}
        initial={setup}
        onChange={(next, valid) => {
          setValue(next);
          setIsValid(valid);
        }}
      />

      {/*
        * Neutral, like Water's primary action.
        *
        * VITA's colour rule since 5.1: the primary control is the app's one
        * neutral treatment and the feature colour is carried by the objects
        * and state around it. A saturated purple block across the bottom of
        * every setup screen was the feature colour doing a job it had not
        * earned — and it is violet that marks the routine's state everywhere
        * else, which is weaker for being everywhere.
        *
        * Behaviour is unchanged: same guard, same disabled condition, same
        * call. A `PressableScale` rather than `Button` because this needs an
        * explicit spoken label and `Button` takes none.
        */}
      <PressableScale
        onPress={() => void save()}
        disabled={!isValid || saving}
        haptic="selection"
        style={[
          styles.save,
          { backgroundColor: surfaces.text },
          (!isValid || saving) && styles.saveDisabled,
        ]}
        accessibilityLabel={needsSetup ? 'Save Setup' : 'Save Changes'}
      >
        <Text style={[styles.saveLabel, { color: surfaces.background }]}>
          {needsSetup ? 'Save Setup' : 'Save Changes'}
        </Text>
      </PressableScale>
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
  save: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 14,
    minHeight: 50,
  },
  saveDisabled: {
    opacity: 0.4,
  },
  saveLabel: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
  },
});
