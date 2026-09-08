import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PressableScale } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

type Props = {
  dateLabel: string;
  onScan: () => void;
  onSettings: () => void;
  /** Rendered instead of the utilities while sections are being arranged. */
  arranging?: boolean;
  onDoneArranging?: () => void;
};

/**
 * Fuel's header — the same language as Home, not the same content.
 *
 * ## Why it is not a copy of the Dashboard header
 *
 * Home opens the app: it carries the wordmark, the greeting and the quote
 * because it is the front door and has no subject of its own. **Fuel is a
 * feature screen with a subject**, and that subject is the day's food
 * directly beneath this. Repeating the wordmark here would say nothing, and
 * a food quote would be inspirational filler in the one screen that has real
 * content to lead with — so there is none.
 *
 * What is shared is the *language*: the title, the outlined date chip in the
 * same shape and weight Home uses, and small neutral icon controls. The
 * screen reads as the same app without imitating the layout.
 *
 * The scanner lives here as one icon. It used to be a full-width filled card
 * beside Log Food — two competing calls to action for the same task, one of
 * which is used far less often.
 *
 * **The date sits on the utility side** (founder note, 5.6B.1), the way
 * Home's contextual chip does, rather than hanging under the title on a row
 * of its own — which left the title stranded and the right side empty.
 */
export function FuelHeader({
  dateLabel,
  onScan,
  onSettings,
  arranging = false,
  onDoneArranging,
}: Props) {
  const insets = useSafeAreaInsets();
  const { surfaces } = useTheme();

  return (
    <View style={{ paddingTop: insets.top + spacing.xs }}>
      <View style={styles.bar}>
        {/*
          * Mark plus word, the same lockup Home uses — Home pairs a gold
          * `VitaMark` with a neutral wordmark, so Fuel pairs its flame with
          * a neutral title. The colour identifies the feature; it does not
          * paint the word.
          */}
        <View style={styles.brand}>
          <Ionicons name="flame" size={22} color={palette.primary} />
          <Text style={[styles.title, { color: surfaces.text }]}>Fuel</Text>
        </View>

        {arranging ? (
          <PressableScale
            onPress={onDoneArranging}
            hitSlop={10}
            accessibilityLabel="Done arranging Fuel"
            style={styles.control}
          >
            <Text style={[styles.done, { color: surfaces.text }]}>Done</Text>
          </PressableScale>
        ) : (
          <View style={styles.controls}>
            {/* The same chip Home uses for the date — shape, border, weight
                — and on the same side of the bar. */}
            <View
              style={[styles.dateChip, { borderColor: surfaces.border }]}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Today, ${dateLabel}`}
            >
              <Ionicons name="calendar-outline" size={13} color={surfaces.textTertiary} />
              <Text style={[styles.dateLabel, { color: surfaces.textSecondary }]}>{dateLabel}</Text>
            </View>

            <PressableScale
              onPress={onScan}
              hitSlop={10}
              accessibilityLabel="Scan a barcode"
              accessibilityHint="Opens the barcode scanner"
              style={styles.control}
            >
              <Ionicons name="barcode-outline" size={20} color={surfaces.text} />
            </PressableScale>

            <PressableScale
              onPress={onSettings}
              hitSlop={10}
              accessibilityLabel="Settings"
              style={styles.control}
            >
              <Ionicons name="settings-outline" size={20} color={surfaces.text} />
            </PressableScale>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexShrink: 1,
  },
  title: {
    ...typography.title,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  control: {
    padding: spacing.xs,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
  },
  dateLabel: {
    ...typography.caption,
    fontSize: 13.5,
  },
  done: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
});
