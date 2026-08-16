import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { getPeptideToday } from '../../../features/peptides/api';
import { palette, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

export default function PeptideLog() {
  const today = getPeptideToday();
  const progress = today.logged / today.goal;
  const { surfaces } = useTheme();

  return (
    <Screen>
      <ScreenHeader title="Peptide Log" back />

      <Card>
        <Text style={[styles.count, { color: surfaces.text }]}>
          {today.logged} / {today.goal} logged
        </Text>
        <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
          Track your peptides and stay consistent.
        </Text>
      </Card>

      <SectionHeader title="Today's Goal" />
      <Card style={styles.goalCard}>
        <View style={styles.goalRow}>
          <Text style={[styles.goalLabel, { color: surfaces.text }]}>
            {today.logged} / {today.goal}
          </Text>
          <Text style={[styles.percent, { color: surfaces.textSecondary }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} color={palette.peptide} />
      </Card>

      <SectionHeader title="Today" />
      {today.slots.map((slot) => (
        <Card key={slot.id} style={styles.slotRow}>
          <Ionicons
            name={slot.logged > 0 ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={slot.logged > 0 ? palette.peptide : surfaces.textTertiary}
          />
          <Text style={[styles.slotLabel, { color: surfaces.text }]}>{slot.label}</Text>
          <Text style={[styles.slotValue, { color: surfaces.textTertiary }]}>{slot.logged} logged</Text>
        </Card>
      ))}

      <Button label="+ Add Peptide" color={palette.peptide} onPress={() => router.push('/peptides/add')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
  },
  goalCard: {
    gap: spacing.m,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  goalLabel: {
    ...typography.heading,
  },
  percent: {
    ...typography.captionMedium,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  slotLabel: {
    ...typography.bodyMedium,
    flex: 1,
  },
  slotValue: {
    ...typography.caption,
  },
});
