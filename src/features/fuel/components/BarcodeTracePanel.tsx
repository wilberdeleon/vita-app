import { Platform, StyleSheet, Text, View } from 'react-native';
import { getBarcodeTrace } from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Development-only readout of the last barcode scan, end to end.
 *
 * Exists because a physical device reports a scan resolving to the wrong
 * product while the same barcode resolves correctly in every standalone
 * test — a gap only the device's own scanned value can close. It renders on
 * Food Detail *and* Edit Entry, because the wrong product has now been seen
 * on both.
 *
 * Built to be screenshotted: stage names left, values right, monospaced so
 * digits line up and a 14-digit GTIN can be read off a photo without
 * transcription errors. Values are selectable so they can also be copied.
 *
 * Renders nothing outside `__DEV__` and nothing before a scan has happened
 * this session. Carries barcode values and food identities only — never a
 * key, a header, or a raw provider payload.
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
      <Text style={[styles.title, { color: palette.primary }]}>SCAN TRACE — DEV ONLY</Text>
      <Text style={[styles.hint, { color: surfaces.textTertiary }]}>
        Screenshot this whole block and send it.
      </Text>

      {trace.map((step, index) => (
        <View key={`${step.stage}-${index}`} style={styles.row}>
          <Text style={[styles.stage, { color: surfaces.textTertiary }]} numberOfLines={1}>
            {step.stage}
          </Text>
          <Text style={[styles.detail, { color: surfaces.text }]} selectable>
            {step.detail}
          </Text>
        </View>
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
    gap: spacing.xs,
  },
  title: {
    ...typography.micro,
    letterSpacing: 0.8,
  },
  hint: {
    ...typography.micro,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s,
  },
  stage: {
    ...typography.micro,
    // Fixed column so every value starts at the same x — the difference
    // between a readable photo and a wall of text.
    width: 118,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  detail: {
    ...typography.micro,
    flex: 1,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
});
