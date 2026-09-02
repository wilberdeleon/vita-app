import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  NumericKeyboardAccessory,
  Screen,
  ScreenHeader,
  SectionHeader,
  useToast,
} from '../../../../components/ui';
import { contextFromSnapshot, LogForm } from '../../../../features/peptides/components/LogForm';
import { formatClockTime, formatLogDateLong } from '../../../../lib/daily';
import {
  formatConcentration,
  formatMcg,
  usePeptideContext,
  type PeptideLogDraft,
} from '../../../../lib/peptides';
import { palette, spacing, typography } from '../../../../theme/tokens';
import { useTheme } from '../../../../theme/ThemeProvider';

/**
 * One recorded administration — read, edit, or delete.
 *
 * Keyed by the entry rather than nested under its setup, because an entry is
 * a durable record in its own right: it survives the setup being deactivated,
 * and a history row anywhere in the app can link straight to it.
 *
 * **Edits keep the entry's original conversion context.** Changing 2 mg to
 * 1 mg on a log from a 20 mg / 2 mL vial recomputes against *that* vial, not
 * today's. Correcting a typo must not silently re-date the arithmetic.
 */
export default function PeptideLogDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = decodeURIComponent(id ?? '');

  const { findLog, findDefinition, updateLog, deleteLog, restoreLog } = usePeptideContext();
  const { showToast } = useToast();
  const { surfaces } = useTheme();

  const [draft, setDraft] = useState<PeptideLogDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const entry = findLog(entryId);

  if (!entry) {
    return (
      <Screen>
        <ScreenHeader title="Log" back />
        <EmptyState
          icon="help-circle-outline"
          title="This log is no longer available"
          body="It may have been deleted already."
        />
      </Screen>
    );
  }

  const definition = findDefinition(entry.definitionId);
  const name = definition?.name ?? 'Peptide';
  const snapshot = entry.calculationSnapshot;
  const vialUnit = entry.amount.authoredUnit;

  const save = async () => {
    if (!draft || saving) return;
    setSaving(true);
    await updateLog(entry.id, draft);
    showToast({ message: 'Log updated' });
    router.back();
  };

  /**
   * Deleting a health record is deliberate, so it asks — and then offers Undo
   * anyway, reusing Water's toast. Between a confirmation and a reversal, the
   * reversal is what actually protects someone who meant to tap the row above.
   */
  const confirmDelete = () => {
    Alert.alert('Delete this log entry?', 'This removes it from your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const removed = entry;
            await deleteLog(entry.id);
            showToast({
              message: 'Peptide log deleted',
              actionLabel: 'Undo',
              onAction: () => void restoreLog(removed),
            });
            router.back();
          })();
        },
      },
    ]);
  };

  return (
    <Screen keyboardAware>
      <ScreenHeader title="Log" back />

      <Text style={[styles.name, { color: surfaces.text }]}>{name}</Text>
      <Text style={[styles.subtitle, { color: surfaces.textTertiary }]}>
        {formatLogDateLong(entry.logDate)} · {formatClockTime(entry.loggedAt)}
      </Text>

      <LogForm
        context={contextFromSnapshot(snapshot, vialUnit)}
        initial={{
          amount: entry.amount.authoredAmount,
          unit: entry.amount.authoredUnit,
          loggedAt: entry.loggedAt,
          notes: entry.notes,
          site: entry.site,
        }}
        onChange={setDraft}
      />

      {/*
        * Why this entry says what it says. Years later, "2 mg = 20 units" is
        * inexplicable without the vial it was drawn from — so the vial travels
        * with the record. Kept small: it explains the row, it is not the row.
        */}
      {snapshot ? (
        <>
          <SectionHeader title="Conversion used" />
          <Card style={styles.snapshot}>
            {[
              ['Vial', formatMcg(snapshot.vialAmountMcg, vialUnit)],
              ['Reconstitution', `${snapshot.reconstitutionMl} mL`],
              ['Concentration', formatConcentration(
                snapshot.vialAmountMcg / snapshot.reconstitutionMl,
                vialUnit,
              )],
              ['Syringe scale', `U-100 · ${snapshot.unitsPerMl} units/mL`],
            ].map(([label, value]) => (
              <View
                key={label}
                style={styles.snapshotRow}
                accessible
                accessibilityRole="text"
                accessibilityLabel={`${label}: ${value}`}
              >
                <Text style={[styles.snapshotLabel, { color: surfaces.textSecondary }]}>{label}</Text>
                <Text style={[styles.snapshotValue, { color: surfaces.text }]}>{value}</Text>
              </View>
            ))}
            <Text style={[styles.snapshotNote, { color: surfaces.textTertiary }]}>
              Saved with this entry. Changing your setup later does not change this record.
            </Text>
          </Card>
        </>
      ) : null}

      <Button
        label="Save changes"
        color={palette.peptide}
        disabled={!draft || saving}
        onPress={() => void save()}
      />
      <Button label="Delete log" variant="soft" color={palette.fat} onPress={confirmDelete} />

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
  snapshot: {
    gap: spacing.xs,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  snapshotLabel: {
    ...typography.caption,
  },
  snapshotValue: {
    ...typography.captionMedium,
  },
  snapshotNote: {
    ...typography.micro,
    marginTop: spacing.xs,
  },
});
