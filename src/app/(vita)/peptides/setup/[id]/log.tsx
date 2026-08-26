import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import {
  Button,
  EmptyState,
  NumericKeyboardAccessory,
  Screen,
  ScreenHeader,
  useToast,
} from '../../../../../components/ui';
import { LogForm } from '../../../../../features/peptides/components/LogForm';
import { usePeptideContext, useResolvedSetup, type PeptideLogDraft } from '../../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../../theme/tokens';
import { useTheme } from '../../../../../theme/ThemeProvider';

/**
 * Recording an administration.
 *
 * A separate route from the setup editor on purpose: a setup is
 * *configuration* that persists, a log is an *event* that happened. Folding
 * the two together would make saving a setup feel like it was recording a
 * dose — and would make this screen slower than it needs to be, when the
 * whole point is open, type a number, save.
 *
 * The conversion snapshot is taken by the provider at save time, from the
 * setup as it stands now. Nothing here is recomputed on read afterwards.
 */
export default function LogPeptide() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setupId = decodeURIComponent(id ?? '');

  const { addLog } = usePeptideContext();
  const resolved = useResolvedSetup(setupId);
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [draft, setDraft] = useState<PeptideLogDraft | null>(null);
  const [saving, setSaving] = useState(false);

  if (!resolved) {
    return (
      <Screen>
        <ScreenHeader title="Log" back />
        <EmptyState
          icon="help-circle-outline"
          title="This setup is no longer available"
          body="It may have been removed already."
        />
      </Screen>
    );
  }

  const { setup, name } = resolved;

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    await addLog(setup.id, draft);
    showToast({ message: `Logged · ${name}` });
    router.back();
  };

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Log" back />

      <Text style={[styles.name, { color: surfaces.text }]}>{name}</Text>
      <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>Log Peptide</Text>

      <LogForm
        context={{
          vialAmountMcg: setup.vial?.amountMcg,
          reconstitutionMl: setup.reconstitutionMl,
          unitsPerMl: setup.syringe?.unitsPerMl,
          vialUnit: setup.vial?.authored.unit ?? setup.preferredDoseUnit,
        }}
        preferredUnit={setup.preferredDoseUnit}
        onChange={setDraft}
      />

      <Button
        label="Save log"
        color={palette.peptide}
        disabled={!draft || saving}
        onPress={() => void save()}
      />

      <NumericKeyboardAccessory />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
});
