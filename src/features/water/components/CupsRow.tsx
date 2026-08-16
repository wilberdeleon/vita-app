import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { palette, spacing } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  filled: number;
  total: number;
};

/** Row of cup icons — filled cups in water blue, remaining as outlines. */
export function CupsRow({ filled, total }: Props) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <Ionicons
          key={index}
          name={index < filled ? 'water' : 'water-outline'}
          size={26}
          color={index < filled ? palette.water : surfaces.textTertiary}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.s,
    justifyContent: 'center',
  },
});
