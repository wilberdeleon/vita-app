import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { IconBadge, PressableScale } from '../../../components/ui';
import { palette, radii, shadows, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The two things a person opens Fuel to do, stated outright.
 *
 * Before this, logging food started behind a row labelled "Food Log" —
 * which names a *record*, not an action, and gave no clue that it was the
 * way in. Now the primary action is the loudest element below the summary
 * and says exactly what it does.
 *
 * The primary reads as primary through fill, not through size: making it
 * taller or wider would add back the bulk this redesign exists to remove,
 * and a filled orange card beside a plain one is already an unmissable
 * difference. Scan sits alongside rather than beneath it because it is a
 * peer route into the same flow, just a less frequent one.
 *
 * Labels use `adjustsFontSizeToFit` rather than shorter wording: the
 * approved copy is "Scan Barcode / Quick scan a product", and on an
 * SE-class screen a half-width card is about 150pt. Shrinking a point or
 * two on the narrowest devices keeps the approved copy intact where
 * rewording it to fit would not.
 *
 * No meal is preselected from here, deliberately: these are the screen's
 * general-purpose entry points, and Food Detail still seeds the meal from
 * the time of day. Logging *into a specific meal* is what the `+ Add food`
 * row on each meal is for.
 *
 * Both routes already exist. Nothing here is a new flow: Log Food opens the
 * existing picker, Scan opens the existing scanner.
 */
export function FuelQuickActions() {
  const { surfaces } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.column}>
        <PressableScale
          onPress={() => router.push('/fuel/add')}
          pressedScale={0.98}
          style={[styles.action, styles.primary]}
          accessibilityRole="button"
          accessibilityLabel="Log food — search, scan, or add"
        >
          <View style={styles.primaryBadge}>
            <Ionicons name="add" size={22} color={palette.textOnColor} />
          </View>
          <View style={styles.text}>
            <Text
              style={[styles.title, { color: palette.textOnColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Log Food
            </Text>
            <Text
              style={[styles.subtitle, styles.subtitleOnColor]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Search, scan, or add
            </Text>
          </View>
        </PressableScale>
      </View>

      <View style={styles.column}>
        <PressableScale
          onPress={() => router.push('/fuel/scan')}
          pressedScale={0.98}
          style={[styles.action, styles.secondary, { backgroundColor: surfaces.card, borderColor: surfaces.border }]}
          accessibilityRole="button"
          accessibilityLabel="Scan barcode — quick scan a product"
        >
          <IconBadge icon="barcode-outline" size={38} />
          <View style={styles.text}>
            <Text
              style={[styles.title, { color: surfaces.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Scan Barcode
            </Text>
            <Text
              style={[styles.subtitle, { color: surfaces.textTertiary }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Quick scan a product
            </Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  /**
   * The flex lives here, not on the card. PressableScale applies `style` to
   * its inner Animated.View, so a flex value passed to it would sit inside
   * a content-sized Pressable and never distribute across the row.
   */
  column: {
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderRadius: radii.card,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    ...shadows.card,
  },
  primary: {
    backgroundColor: palette.primary,
  },
  secondary: {
    borderWidth: 1,
  },
  primaryBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  text: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.micro,
  },
  subtitleOnColor: {
    color: 'rgba(255,255,255,0.85)',
  },
});
