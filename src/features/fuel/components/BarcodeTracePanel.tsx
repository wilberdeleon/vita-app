import { StyleSheet, Text, View } from 'react-native';
import { getBarcodeTrace } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Development-only readout of the last barcode scan.
 *
 * Exists because a physical device reported a scan resolving to the wrong
 * product while the same barcode resolved correctly in a standalone test —
 * a gap only the device's own scanned value can close. Renders nothing
 * outside `__DEV__` and nothing when no scan has happened this session.
 *
 * Remove once the barcode path is signed off on device.
 */
export function BarcodeTracePanel() {
  const { surfaces } = useTheme();
  if (!__DEV__) return null;

  const trace = getBarcodeTrace();
  if (trace.length === 0) return null;

  return (
    <View style={[styles.root, { borderColor: palette.primary, backgroundColor: surfaces.card }]}>
      <Text style={[styles.title, { color: palette.primary }]}>SCAN TRACE (dev only)</Text>
      {trace.map((step, index) => (
        <Text key={`${step.stage}-${index}`} style={[styles.line, { color: surfaces.textSecondary }]}>
          {step.stage} = {step.detail}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radii.control,
    borderStyle: 'dashed',
    padding: spacing.m,
    gap: 2,
  },
  title: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  line: {
    ...typography.micro,
  },
});
