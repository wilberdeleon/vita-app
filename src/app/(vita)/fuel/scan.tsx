import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, radii, spacing, typography } from '../../../theme/tokens';

/**
 * Static visual mock of the barcode scanner — no camera permission or
 * scanning logic yet. Real scanning ships with Sprint 2 (Fuel).
 */
export default function ScanBarcode() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.frameArea, { paddingTop: insets.top + spacing.xxxl }]}>
        <View style={styles.frame}>
          <View style={styles.barcodeLines}>
            {BARCODE_WIDTHS.map((width, index) => (
              <View key={index} style={[styles.line, { width }]} />
            ))}
          </View>
        </View>
        <Text style={styles.caption}>Align barcode within the frame</Text>
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Pressable style={styles.control} hitSlop={8}>
          <Ionicons name="flash-outline" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.control} hitSlop={8}>
          <Ionicons name="images-outline" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.control} hitSlop={8} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const BARCODE_WIDTHS = [3, 6, 2, 8, 4, 2, 7, 3, 5, 2, 6, 8, 3, 2, 5, 7, 2, 4, 6, 3];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
  },
  frameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  frame: {
    width: 280,
    height: 170,
    borderRadius: radii.card,
    borderWidth: 3,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeLines: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 90,
  },
  line: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  caption: {
    ...typography.body,
    color: '#FFFFFF',
    opacity: 0.85,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  control: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
