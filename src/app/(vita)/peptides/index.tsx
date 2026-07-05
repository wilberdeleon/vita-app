import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card, ProgressBar, Screen, ScreenHeader, SectionHeader } from '../../../components/ui';
import { getPeptideToday } from '../../../features/peptides/api';
import { palette, spacing, typography } from '../../../theme/tokens';

export default function PeptideLog() {
  const today = getPeptideToday();
  const progress = today.logged / today.goal;

  return (
    <Screen>
      <ScreenHeader title="Peptide Log" back />

      <Card>
        <Text style={styles.count}>
          {today.logged} / {today.goal} logged
        </Text>
        <Text style={styles.hint}>Track your peptides and stay consistent.</Text>
      </Card>

      <SectionHeader title="Today's Goal" />
      <Card style={styles.goalCard}>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>
            {today.logged} / {today.goal}
          </Text>
          <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} color={palette.peptide} />
      </Card>

      <SectionHeader title="Today" />
      {today.slots.map((slot) => (
        <Card key={slot.id} style={styles.slotRow}>
          <Ionicons
            name={slot.logged > 0 ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={slot.logged > 0 ? palette.peptide : palette.textTertiary}
          />
          <Text style={styles.slotLabel}>{slot.label}</Text>
          <Text style={styles.slotValue}>{slot.logged} logged</Text>
        </Card>
      ))}

      <Button label="+ Add Peptide" color={palette.peptide} onPress={() => router.push('/peptides/add')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: {
    ...typography.heading,
    color: palette.text,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: palette.textTertiary,
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
    color: palette.text,
  },
  percent: {
    ...typography.captionMedium,
    color: palette.textSecondary,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  slotLabel: {
    ...typography.bodyMedium,
    color: palette.text,
    flex: 1,
  },
  slotValue: {
    ...typography.caption,
    color: palette.textTertiary,
  },
});
