import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Screen, ScreenHeader, SectionHeader, SegmentedTabs, TextField } from '../../../components/ui';
import { palette, spacing } from '../../../theme/tokens';

const DOSE_UNITS = ['mg', 'mcg'] as const;

export default function AddPeptide() {
  const [unitIndex, setUnitIndex] = useState(0);

  return (
    <Screen>
      <ScreenHeader title="Add Peptide" back close />

      <TextField label="Peptide Name" placeholder="Search or enter peptide name" />

      <SectionHeader
        title="Dosage"
        actionLabel="View examples"
        onAction={() => router.push('/peptides/examples')}
      />
      <View style={styles.doseRow}>
        <View style={styles.doseField}>
          <TextField placeholder="2.5" keyboardType="numeric" />
        </View>
        <View style={styles.doseUnit}>
          <SegmentedTabs
            options={DOSE_UNITS}
            selectedIndex={unitIndex}
            onChange={setUnitIndex}
            activeColor={palette.peptide}
          />
        </View>
      </View>

      <TextField label="Time" placeholder="8:00 AM" />
      <TextField
        label="Additional Notes (optional)"
        placeholder="e.g. take on an empty stomach"
        multiline
        numberOfLines={3}
        style={styles.notes}
      />

      <Button label="Save Peptide" color={palette.peptide} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  doseRow: {
    flexDirection: 'row',
    gap: spacing.m,
    alignItems: 'center',
  },
  doseField: {
    flex: 1,
  },
  doseUnit: {
    width: 140,
  },
  notes: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
