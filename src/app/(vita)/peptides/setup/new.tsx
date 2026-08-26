import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, useToast } from '../../../../components/ui';
import { ClassificationChip } from '../../../../features/peptides/components/ClassificationChip';
import { SetupForm, type SetupFormValue } from '../../../../features/peptides/components/SetupForm';
import { usePeptideContext } from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * Creating a setup for a definition the user already chose.
 *
 * A static route rather than `[id]` with a magic `'new'` value, so each route
 * corresponds to one real workflow and neither has to branch on the other's
 * case.
 */
export default function NewPeptideSetup() {
  const { definitionId } = useLocalSearchParams<{ definitionId: string }>();
  const resolvedId = decodeURIComponent(definitionId ?? '');

  const { findDefinition, addSetup } = usePeptideContext();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [value, setValue] = useState<SetupFormValue>({});
  const [isValid, setIsValid] = useState(true);
  const [saving, setSaving] = useState(false);

  const definition = findDefinition(resolvedId);

  if (!definition) {
    return (
      <Screen keyboardAware>
        <ScreenHeader title="New Setup" back />
        <EmptyState
          icon="help-circle-outline"
          title="That peptide isn't available"
          body="Pick one from the catalog to continue."
        />
      </Screen>
    );
  }

  const save = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    const setup = await addSetup(definition.id, value);
    showToast({ message: `Added · ${value.displayName?.trim() || definition.name}` });

    /**
     * Land on the new setup, not back on the list.
     *
     * Founder QA on slice 3.8 reported that injection site "was not appearing
     * in the Log Peptide flow" — from the New Setup screen, which is where
     * dismissing to the list leaves you looking. Site selection is not a
     * setup field and correctly is not there; the real problem was that the
     * next step had no visible path from where the user actually was.
     *
     * Opening the setup puts **Log Peptide** — its first action — directly in
     * front of someone who has just finished saying what they are tracking.
     */
    router.dismissAll();
    router.push(`/peptides/setup/${encodeURIComponent(setup.id)}`);
  };

  return (
    <Screen>
      <ScreenHeader title="New Setup" back />

      <Text style={[styles.name, { color: surfaces.text }]}>{definition.name}</Text>
      <ClassificationChip classification={definition.classification} />
      {definition.category ? (
        <Text style={[styles.category, { color: surfaces.textTertiary }]}>{definition.category}</Text>
      ) : null}

      <Text style={[styles.note, { color: surfaces.textTertiary }]}>
        Everything below is optional. Add only what you actually track.
      </Text>

      <SetupForm
        onChange={(next, valid) => {
          setValue(next);
          setIsValid(valid);
        }}
      />

      <Button
        label="Save Setup"
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
  note: {
    ...typography.caption,
  },
});
