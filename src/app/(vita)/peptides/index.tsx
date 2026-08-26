import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button, EmptyState, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { PeptideRowPanel } from '../../../features/peptides/components/PeptideRowPanel';
import { usePeptides } from '../../../lib/peptides';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Peptides — the user's own setups.
 *
 * Replaces the Sprint 0 placeholder wholesale. Gone with it: the `1 / 3
 * logged` counter, the "goal", and the Morning/Midday/Evening slots — none of
 * which were real. A peptide schedule is per-setup and often weekly, and VITA
 * never had a "daily peptide goal" to be at 1 of 3 of.
 *
 * **Real activity since slice 3.7.** A row shows how many administrations
 * were actually recorded today, from the log — never that one was expected,
 * due, or missed. Scheduled and logged stay separate concepts, and VITA does
 * not score one against the other.
 */
export default function Peptides() {
  const peptides = usePeptides();
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Peptides" back />

      {peptides.error ? (
        <Text style={[styles.error, { color: palette.fat }]}>{peptides.error}</Text>
      ) : null}

      {peptides.isEmpty && !peptides.isLoading ? (
        <EmptyState
          icon="flask-outline"
          title="No peptides added yet"
          body="Add one to track your own setup."
        />
      ) : (
        <>
          {peptides.active.length > 0 ? (
            <>
              <SectionHeader title="Active" />
              <PeptideRowPanel setups={peptides.active} />
            </>
          ) : null}

          {/* Everything is deactivated — a real state, and not the same as
              having nothing set up. */}
          {peptides.active.length === 0 && !peptides.isLoading && !peptides.isEmpty ? (
            <EmptyState
              icon="flask-outline"
              title="Nothing active right now"
              body="Your inactive setups are below, ready when you are."
            />
          ) : null}
        </>
      )}

      <Button
        label="Add Peptide"
        icon="add"
        color={palette.peptide}
        onPress={() => router.push('/peptides/catalog')}
      />

      {peptides.inactive.length > 0 ? (
        <>
          <SectionHeader title="Inactive" />
          <PeptideRowPanel setups={peptides.inactive} />
        </>
      ) : null}

      {/*
        * Enough framing to remove ambiguity about what this feature is, and no
        * more. The full safety-copy pass is slice 3.9; a warning on every row
        * would be both alarmist and, by repetition, invisible.
        */}
      <Text style={[styles.footer, { color: surfaces.textTertiary }]}>
        Peptides is for tracking what you choose to record. VITA doesn't provide dosing or treatment
        recommendations.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: {
    ...typography.caption,
  },
  footer: {
    ...typography.caption,
    marginTop: spacing.s,
  },
});
