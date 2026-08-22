import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { traceBarcode, type VitaFood } from '../../../lib/nutrition';
import { palette, typography } from '../../../theme/tokens';

type Props = {
  food: VitaFood;
  /** Carried through so a retry lands in the meal the user already chose. */
  mealSuffix: string;
};

/** Provider ids as a person should read them, for the provenance line. */
const SOURCE_LABELS: Record<VitaFood['source'], string> = {
  openfoodfacts: 'Open Food Facts',
  usda: 'USDA FoodData Central',
  fatsecret: 'FatSecret',
  'vita-custom': 'your own foods',
};

export function providerLabel(food: VitaFood): string {
  return SOURCE_LABELS[food.source];
}

/**
 * The escape hatch for a barcode that resolved to the wrong product.
 *
 * It exists because a barcode lookup can be exactly correct and still be
 * wrong: the Kroger investigation found an Open Food Facts record filed
 * under Kroger's own company prefix carrying Hillshire Farm's name, brand,
 * and imagery. VITA asked for that code and got back that code, so every
 * identity check passed. **No client-side rule can catch a database that is
 * wrong about itself**, so instead of pretending otherwise, the product
 * gives the user a way out.
 *
 * Shown only on a Food Detail reached from the scanner. Origin travels as a
 * route parameter rather than being inferred from the provider, because an
 * Open Food Facts result arrives from ordinary Search just as often and
 * does not need this.
 *
 * Every option routes into a flow that already exists — nothing here logs
 * food, and nothing creates a second way to do something the app can
 * already do.
 */
export function WrongProductAction({ food, mealSuffix }: Props) {
  const options = [
    { label: 'Search for food', run: () => router.replace(`/fuel/search${mealSuffix}`) },
    { label: 'Scan again', run: () => router.replace(`/fuel/scan${mealSuffix}`) },
    { label: 'Add manually', run: () => router.replace(`/fuel/manual${mealSuffix}`) },
    { label: 'Report incorrect product', run: () => report(food) },
  ];

  const present = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: food.name,
          message: `Scanned barcode ${food.barcode ?? 'unknown'} · from ${providerLabel(food)}`,
          options: [...options.map((option) => option.label), 'Cancel'],
          cancelButtonIndex: options.length,
        },
        (index) => options[index]?.run(),
      );
      return;
    }

    // Android has no native sheet in Expo Go; an alert carries the same
    // choices rather than shipping a bespoke modal for a secondary path.
    Alert.alert(food.name, `Scanned barcode ${food.barcode ?? 'unknown'} · from ${providerLabel(food)}`, [
      ...options.map((option) => ({ text: option.label, onPress: option.run })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <Pressable onPress={present} hitSlop={10} accessibilityRole="button">
      <Text style={styles.label}>Not the right product?</Text>
    </Pressable>
  );
}

/**
 * Incorrect-product reporting, honestly incomplete.
 *
 * There is no reporting backend, so nothing is transmitted and the dialog
 * says so in as many words. Claiming a report had been filed would be worse
 * than not offering the option at all — the user would stop looking for
 * another way to fix it. The identity is written to the development log so
 * a device report can still be acted on by hand, and the real submission
 * path is recorded as deferred.
 */
function report(food: VitaFood): void {
  traceBarcode('report.vitaId', food.vitaId);
  traceBarcode('report.gtin', food.barcode ?? 'none');
  traceBarcode('report.provider', food.source);
  traceBarcode('report.name', food.brand ? `${food.name} (${food.brand})` : food.name);

  Alert.alert(
    'Reporting isn’t connected yet',
    `Nothing was sent. VITA can’t submit corrections to ${providerLabel(food)} yet — that’s coming.\n\n` +
      `For now, note this and send it over:\n\n` +
      `Barcode: ${food.barcode ?? 'unknown'}\n` +
      `Shows as: ${food.brand ? `${food.name} — ${food.brand}` : food.name}\n` +
      `Source: ${providerLabel(food)}`,
    [{ text: 'OK' }],
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.captionMedium,
    fontWeight: '600',
    color: palette.primary,
    textAlign: 'center',
  },
});
