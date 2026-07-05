import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Chip, Screen, ScreenHeader, SectionHeader, SegmentedTabs, TextField } from '../../../components/ui';
import { BOTTLE_SIZES_OZ, QUICK_CUPS } from '../../../features/water/mock';
import { palette, spacing, typography } from '../../../theme/tokens';

const UNITS = ['Cups', 'Ounces'] as const;

export default function AddWater() {
  const [unitIndex, setUnitIndex] = useState(0);
  const [amount, setAmount] = useState<number | null>(null);
  const [custom, setCustom] = useState('');

  const isCups = unitIndex === 0;
  const options = isCups ? QUICK_CUPS : BOTTLE_SIZES_OZ;
  const unitLabel = isCups ? (amount === 1 ? 'cup' : 'cups') : 'oz';
  const displayAmount = amount ?? (custom ? Number(custom) || 0 : 0);

  const selectUnit = (index: number) => {
    setUnitIndex(index);
    setAmount(null);
    setCustom('');
  };

  return (
    <Screen>
      <ScreenHeader title="Add Water" back />

      <SegmentedTabs options={UNITS} selectedIndex={unitIndex} onChange={selectUnit} activeColor={palette.water} />

      <View style={styles.display}>
        <Text style={styles.amount}>{displayAmount || '—'}</Text>
        <Text style={styles.unit}>{displayAmount ? unitLabel : 'Choose an amount'}</Text>
      </View>

      <SectionHeader title={isCups ? 'Quick add' : 'Common bottle sizes'} />
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option}
            label={`${option} ${isCups ? (option === 1 ? 'cup' : 'cups') : 'oz'}`}
            selected={amount === option}
            color={palette.water}
            onPress={() => {
              setAmount(option);
              setCustom('');
            }}
          />
        ))}
      </View>

      <SectionHeader title="Custom amount" />
      <TextField
        placeholder={isCups ? 'Enter cups' : 'Enter ounces'}
        keyboardType="numeric"
        value={custom}
        onChangeText={(text) => {
          setCustom(text);
          setAmount(null);
        }}
      />

      <Button label="+ Add Water" color={palette.water} onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  display: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.s,
  },
  amount: {
    fontSize: 44,
    fontWeight: '700',
    color: palette.text,
  },
  unit: {
    ...typography.caption,
    color: palette.textTertiary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
});
