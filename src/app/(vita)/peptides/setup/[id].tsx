import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, SectionHeader, useToast } from '../../../../components/ui';
import { ClassificationChip } from '../../../../features/peptides/components/ClassificationChip';
import { LogRow } from '../../../../features/peptides/components/LogRow';
import { SetupForm, type SetupFormValue } from '../../../../features/peptides/components/SetupForm';
import { usePeptideContext, useResolvedSetup } from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/** How many recent administrations the setup screen shows before deferring. */
const RECENT_LOG_COUNT = 3;

/**
 * Editing one setup.
 *
 * `id`, `definitionId`, and `createdAt` are never touched. Re-pointing a setup
 * at a different compound would silently rewrite what its future history
 * refers to; a user who wants to track something else creates another setup.
 *
 * Deactivation lives here rather than as a swipe on the list, because it is
 * occasional and reversible. It **never deletes anything** — every field
 * survives, and once logging exists the setup's history is independent of
 * whether it is currently active.
 */
export default function EditPeptideSetup() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const { updateSetup, setSetupActive, logsForSetup } = usePeptideContext();
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
        <ScreenHeader title="Setup" back />
        <EmptyState
          icon="help-circle-outline"
          title="This setup is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const { setup, definition, name } = resolved;

  const allLogs = logsForSetup(setup.id);
  const recent = allLogs.slice(0, RECENT_LOG_COUNT);

  const save = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    await updateSetup(setup.id, value);
    showToast({ message: `Updated · ${value.displayName?.trim() || definition.name}` });
    router.back();
  };

  const toggleActive = async () => {
    const nextActive = !setup.active;
    await setSetupActive(setup.id, nextActive);
    showToast({ message: nextActive ? `Reactivated · ${name}` : `Moved to inactive · ${name}` });
    router.back();
  };

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Setup" back />

      <Text style={[styles.name, { color: surfaces.text }]}>{definition.name}</Text>
      <ClassificationChip classification={definition.classification} />
      {definition.category ? (
        <Text style={[styles.category, { color: surfaces.textTertiary }]}>{definition.category}</Text>
      ) : null}

      {!setup.active ? (
        <Text style={[styles.inactive, { color: surfaces.textTertiary }]}>
          This setup is inactive. Its details are kept exactly as you left them.
        </Text>
      ) : null}

      {/*
        * Logging comes before configuration, because it is what someone opens
        * this screen to do. Editing a vial is occasional; recording a dose is
        * the daily act.
        */}
      <Button
        label="Log Peptide"
        icon="add"
        color={palette.peptide}
        onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/log`)}
      />

      {recent.length > 0 ? (
        <>
          <SectionHeader title="Recent logs" />
          {recent.map((entry) => (
            <LogRow
              key={entry.id}
              entry={entry}
              showDate
              onPress={() => router.push(`/peptides/log/${encodeURIComponent(entry.id)}`)}
            />
          ))}
          {/* The last few, not the whole log — a setup screen is configuration
              with a glance at activity, not a history viewer. */}
          {allLogs.length > recent.length ? (
            <Button
              label={`View all history (${allLogs.length})`}
              variant="soft"
              color={palette.peptide}
              onPress={() => router.push(`/peptides/setup/${encodeURIComponent(setup.id)}/history`)}
            />
          ) : null}
        </>
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
        label="Save changes"
        color={palette.peptide}
        disabled={!isValid || saving}
        onPress={() => void save()}
      />


      <Button
        label={setup.active ? 'Move to inactive' : 'Reactivate'}
        variant="soft"
        color={palette.peptide}
        onPress={() => void toggleActive()}
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
