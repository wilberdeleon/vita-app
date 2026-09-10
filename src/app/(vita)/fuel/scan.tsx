import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, PressableScale, Screen, ScreenHeader } from '../../../components/ui';
import { MealContext } from '../../../features/fuel/components/MealContext';
import { ScannerFrame } from '../../../features/fuel/components/ScannerFrame';
import {
  beginBarcodeTrace,
  isValidGtin,
  lookupBarcodeAcrossProviders,
  normalizeGtin,
  parseMealSlot,
  rememberFoods,
  traceBarcode,
} from '../../../lib/nutrition';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Barcode types worth scanning for packaged food. Restricting the set keeps the
 * detector from firing on QR codes and shipping labels that are never
 * groceries.
 */
const FOOD_BARCODE_TYPES = ['upc_a', 'upc_e', 'ean13', 'ean8'] as const;

type ScanState =
  | { phase: 'scanning' }
  | { phase: 'looking-up'; gtin: string }
  | { phase: 'not-found'; gtin: string }
  | { phase: 'error'; gtin: string; diagnostics: string[] };

/**
 * **Barcode lookup.** Real scanning, on the Expo Go + physical iPhone
 * workflow — no development build and no Xcode.
 *
 * ## What the scanner is, and what it is not
 *
 * It finds a product from its barcode and feeds it into the food-selection
 * flow every other path uses. That is the whole boundary. It is **not** a food
 * grader, a health scanner, a VITA Score, an ingredient-risk analyser or a
 * recommender — the product-scanner idea remains deferred and is not what this
 * screen is becoming. §19, §84, §86.
 *
 * The gallery control from the original mock stays removed: scanning a barcode
 * out of a photo is QR-only on iOS, so that button could never do what it
 * appeared to promise.
 *
 * ## What 5.6D changed
 *
 * The camera, the lock, the lookup and the normalization are untouched. What
 * changed is that the screen now belongs to Fuel: sentence-case `Scan
 * barcode`, the meal stated in **Fuel Home's own identity** rather than not at
 * all, and the recovery states in the outlined-action language Add Food locked
 * in — instead of a stack of three and four full-width buttons, which is what
 * Sprint 2 left here. §20, §24, §28, §29, §65.
 *
 * The frame itself is deliberately still: no laser, no pulse, no sweep.
 * Nothing on this screen animates, so there is nothing for Reduce Motion to
 * turn off, and motion unification belongs to 5.8. §22, §79.
 */
export default function ScanBarcode() {
  const params = useLocalSearchParams<{ meal?: string }>();
  /**
   * Carried through every exit from this screen — the resolved product, and the
   * search/manual fallbacks — so a scan started from a meal row still lands in
   * that meal when the barcode misses. §30.
   */
  const meal = parseMealSlot(params.meal);
  const mealSuffix = meal ? `?meal=${encodeURIComponent(meal)}` : '';
  /**
   * Marks the Food Detail this scan opens as barcode-originated, so it can
   * offer the "Not the right product?" recovery. Carried as a route parameter
   * rather than inferred from the provider — an Open Food Facts result arrives
   * from ordinary Search just as often, and does not need it.
   */
  const detailSuffix = `${mealSuffix}${mealSuffix ? '&' : '?'}from=scan`;

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ phase: 'scanning' });
  const [torch, setTorch] = useState(false);

  /**
   * The single most important line in this screen.
   *
   * `onBarcodeScanned` fires continuously — many times per second — for as long
   * as a code stays in frame. A `useState` flag is NOT sufficient: React
   * batches updates, so several callbacks slip through before the re-render
   * lands, each firing its own lookup and its own navigation. A ref flips
   * synchronously on the very first detection. §81, and a test holds it.
   */
  const locked = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const unlock = useCallback(() => {
    locked.current = false;
    setState({ phase: 'scanning' });
  }, []);

  const lookup = useCallback(
    async (gtin: string) => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;

      setState({ phase: 'looking-up', gtin });

      const result = await lookupBarcodeAcrossProviders(gtin, abort.signal);

      traceBarcode('lookup.status', result.status);

      if (result.status === 'found') {
        traceBarcode('provider', result.provider);
        traceBarcode('food.name', result.food.name);
        traceBarcode('food.returnedGtin', String(result.food.barcode ?? 'none'));
        traceBarcode('food.vitaId', result.food.vitaId);
        // Seed the cache so Food Detail resolves it, and so Favorites and
        // Recents can reach it later without another request.
        rememberFoods([result.food]);
        const href = `/fuel/food/${encodeURIComponent(result.food.vitaId)}${detailSuffix}`;
        traceBarcode('navigate.href', href);
        // `replace`, not `push`: backing out of Food Detail should return to
        // Add Food, not to a frozen scanner mid-lookup.
        router.replace(href);
        return;
      }

      if (result.status === 'error') {
        setState({
          phase: 'error',
          gtin,
          diagnostics: result.outcomes
            .filter((outcome) => !outcome.ok)
            .map(
              (outcome) =>
                `${outcome.provider}: ${outcome.error?.kind ?? 'unknown'} @ ${outcome.error?.stage ?? '?'}`,
            ),
        });
        return;
      }

      // 'not-found' and 'no-providers' both mean there is nothing to open.
      setState({ phase: 'not-found', gtin });
    },
    [detailSuffix],
  );

  const handleScan = useCallback(
    (result: BarcodeScanningResult) => {
      if (locked.current) return;

      beginBarcodeTrace();
      traceBarcode('camera.raw', String(result.data));
      traceBarcode('camera.type', String(result.type));
      traceBarcode('camera.digits', String(String(result.data).replace(/\D/g, '').length));

      const gtin = normalizeGtin(result.data);
      traceBarcode('normalized', gtin ?? 'REJECTED (not a usable GTIN)');
      /**
       * The GS1 mod-10 check digit, recorded but **not enforced**.
       *
       * A camera that misreads one digit produces a different, entirely
       * valid-looking barcode, and a lookup of that code returns whatever
       * genuinely owns it — an unrelated product that every downstream identity
       * check will happily confirm. This says whether that happened. It does
       * not reject the scan: the symbology already validates its own check
       * digit in hardware, so a failure here would more likely mean our parsing
       * is wrong than that the scan is, and blocking the primary flow on an
       * unproven theory is the wrong trade while the real cause is still being
       * confirmed on device.
       */
      traceBarcode('gtin.checkDigit', isValidGtin(result.data) ? 'valid' : 'INVALID — likely misread');
      // A code that isn't a usable GTIN is ignored without locking, so the
      // scanner keeps looking instead of dead-ending on a stray label.
      if (!gtin) return;

      locked.current = true;
      setTorch(false);
      void lookup(gtin);
    },
    [lookup],
  );

  /* ── permission states ──────────────────────────────────────────────── */

  if (!permission) {
    return (
      <Screen>
        <ScreenHeader title="Scan barcode" back close />
        <View style={styles.centered}>
          <ActivityIndicator color={palette.primary} />
        </View>
      </Screen>
    );
  }

  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <Screen>
        <ScreenHeader title="Scan barcode" back close />
        {meal ? <MealContext meal={meal} /> : null}
        <EmptyState
          icon="camera-outline"
          title={blocked ? 'Camera access is off' : 'Scan a barcode'}
          body={
            blocked
              ? 'Camera access is needed to scan a barcode. You can turn it on in Settings.'
              : 'Camera access is needed to scan a barcode. Nothing is recorded — the camera only reads the code.'
          }
        />
        {/*
          * Two neutral outlined actions, the language Add Food locked in —
          * not a stack of full-width buttons, and never a giant warning card.
          * There is always another way to add a food. §24, §25, §65.
          */}
        <Recovery
          actions={[
            blocked
              ? { icon: 'settings-outline', label: 'Settings', spoken: 'Open Settings', run: () => void Linking.openSettings() }
              : { icon: 'camera-outline', label: 'Allow camera', spoken: 'Allow camera access', run: () => void requestPermission() },
            { icon: 'search-outline', label: 'Search', spoken: 'Search foods instead', run: () => router.replace(`/fuel/search${mealSuffix}`) },
            { icon: 'create-outline', label: 'Manual', spoken: 'Enter a food manually', run: () => router.replace(`/fuel/manual${mealSuffix}`) },
          ]}
        />
      </Screen>
    );
  }

  /* ── recovery states ────────────────────────────────────────────────── */

  if (state.phase === 'not-found' || state.phase === 'error') {
    const isError = state.phase === 'error';
    return (
      <Screen>
        <ScreenHeader title="Scan barcode" back close />
        {meal ? <MealContext meal={meal} /> : null}
        <EmptyState
          icon={isError ? 'cloud-offline-outline' : 'help-circle-outline'}
          /*
           * Two different facts, said differently. "Not found" means the
           * databases do not have this product; "couldn't look it up" means we
           * never got an answer. Neither blames the user, and neither names a
           * provider, an endpoint or a status code. §28, §29.
           */
          title={isError ? "Couldn't look up this barcode" : 'Food not found'}
          body={
            isError
              ? 'Check your connection and try again.'
              : 'Try searching for it or enter it manually.'
          }
        />
        <Recovery
          actions={[
            ...(isError
              ? [{ icon: 'refresh-outline' as const, label: 'Try again', spoken: 'Try the lookup again', run: () => void lookup(state.gtin) }]
              : []),
            { icon: 'barcode-outline', label: 'Scan again', spoken: 'Scan another barcode', run: unlock },
            { icon: 'search-outline', label: 'Search', spoken: 'Search foods instead', run: () => router.replace(`/fuel/search${mealSuffix}`) },
            { icon: 'create-outline', label: 'Manual', spoken: 'Enter a food manually', run: () => router.replace(`/fuel/manual${mealSuffix}`) },
          ]}
        />
        {__DEV__ && isError && state.diagnostics.length > 0 ? (
          <Text style={styles.diagnostics}>{state.diagnostics.join('\n')}</Text>
        ) : null}
      </Screen>
    );
  }

  /* ── live scanner ───────────────────────────────────────────────────── */

  const busy = state.phase === 'looking-up';

  return (
    <View style={styles.camera}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: [...FOOD_BARCODE_TYPES] }}
        // Detaching the handler while a lookup runs is a second guard alongside
        // the ref — belt and braces against a very fast device.
        onBarcodeScanned={busy ? undefined : handleScan}
      />

      <View style={[styles.scrim, busy && styles.scrimBusy]} pointerEvents="none" />
      <ScannerFrame busy={busy} meal={meal} />

      {busy ? (
        <View style={styles.busyBadge}>
          <ActivityIndicator color={palette.textOnColor} />
        </View>
      ) : null}

      <View style={styles.controls}>
        <Pressable
          style={styles.control}
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <Ionicons name="close" size={24} color={palette.textOnColor} />
        </Pressable>

        <Pressable
          style={[styles.control, torch && styles.controlActive]}
          onPress={() => setTorch((value) => !value)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityState={{ selected: torch }}
          accessibilityLabel={torch ? 'Turn flashlight off' : 'Turn flashlight on'}
        >
          <Ionicons
            name={torch ? 'flashlight' : 'flashlight-outline'}
            size={22}
            color={torch ? palette.ink : palette.textOnColor}
          />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * The way forward when the camera cannot help — Add Food's own action
 * language, wrapped so the flex actually reaches the row.
 *
 * `PressableScale` applies its `style` to an inner animated view, so a `flex`
 * handed to it never arrives: the trap recorded in the Migration Guide, found
 * on device in 5.6C, and worked around at every other call site the same way.
 * The primitive's own fix belongs to a later slice. §93.
 */
function Recovery({
  actions,
}: {
  actions: { icon: keyof typeof Ionicons.glyphMap; label: string; spoken: string; run: () => void }[];
}) {
  const { surfaces } = useTheme();

  return (
    <View style={styles.actions}>
      {actions.map((action) => (
        <View key={action.label} style={styles.cell}>
          <PressableScale
            onPress={action.run}
            accessibilityLabel={action.spoken}
            style={[styles.action, { borderColor: surfaces.border }]}
          >
            <Ionicons name={action.icon} size={17} color={palette.primary} />
            <Text style={[styles.actionLabel, { color: surfaces.text }]}>{action.label}</Text>
          </PressableScale>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scrimBusy: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  busyBadge: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
  },
  controls: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.xxxl * 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  control: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  controlActive: {
    backgroundColor: palette.textOnColor,
  },
  /* Add Food's action row, value for value. */
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  cell: {
    flexGrow: 1,
    flexBasis: 130,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 44,
  },
  actionLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    flexShrink: 1,
  },
  diagnostics: {
    ...typography.micro,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  centered: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
});
