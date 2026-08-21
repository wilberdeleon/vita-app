import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, EmptyState, Screen, ScreenHeader } from '../../../components/ui';
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

/**
 * Barcode types worth scanning for packaged food. Restricting the set keeps
 * the detector from firing on QR codes and shipping labels that are never
 * groceries.
 */
const FOOD_BARCODE_TYPES = ['upc_a', 'upc_e', 'ean13', 'ean8'] as const;

type ScanState =
  | { phase: 'scanning' }
  | { phase: 'looking-up'; gtin: string }
  | { phase: 'not-found'; gtin: string }
  | { phase: 'error'; gtin: string; diagnostics: string[] };

/**
 * Real barcode scanning, on the Expo Go + physical iPhone workflow — no
 * development build and no Xcode.
 *
 * The gallery control from the original mock stays removed: scanning a
 * barcode out of a photo is QR-only on iOS, so that button could never do
 * what it appeared to promise.
 */
export default function ScanBarcode() {
  const params = useLocalSearchParams<{ meal?: string }>();
  /**
   * Carried through every exit from this screen — the resolved product, and
   * the search/manual fallbacks — so a scan started from a meal row still
   * lands in that meal when the barcode misses.
   */
  const meal = parseMealSlot(params.meal);
  const mealSuffix = meal ? `?meal=${encodeURIComponent(meal)}` : '';

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ phase: 'scanning' });
  const [torch, setTorch] = useState(false);

  /**
   * The single most important line in this screen.
   *
   * `onBarcodeScanned` fires continuously — many times per second — for as
   * long as a code stays in frame. A `useState` flag is NOT sufficient:
   * React batches updates, so several callbacks slip through before the
   * re-render lands, each firing its own lookup and its own navigation. A
   * ref flips synchronously on the very first detection.
   */
  const locked = useRef(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const unlock = useCallback(() => {
    locked.current = false;
    setState({ phase: 'scanning' });
  }, []);

  const lookup = useCallback(async (gtin: string) => {
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
      const href = `/fuel/food/${encodeURIComponent(result.food.vitaId)}${mealSuffix}`;
      traceBarcode('navigate.href', href);
      // `replace`, not `push`: backing out of Food Detail should return to
      // the Log Food picker, not to a frozen scanner mid-lookup.
      router.replace(href);
      return;
    }

    if (result.status === 'error') {
      setState({
        phase: 'error',
        gtin,
        diagnostics: result.outcomes
          .filter((outcome) => !outcome.ok)
          .map((outcome) => `${outcome.provider}: ${outcome.error?.kind ?? 'unknown'} @ ${outcome.error?.stage ?? '?'}`),
      });
      return;
    }

    // 'not-found' and 'no-providers' both mean there is nothing to open.
    setState({ phase: 'not-found', gtin });
  }, [mealSuffix]);

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
       * genuinely owns it — an unrelated product that every downstream
       * identity check will happily confirm. This says whether that
       * happened. It does not reject the scan: the symbology already
       * validates its own check digit in hardware, so a failure here would
       * more likely mean our parsing is wrong than that the scan is, and
       * blocking the primary flow on an unproven theory is the wrong trade
       * while the real cause is still being confirmed on device.
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

  /* ── permission states ────────────────────────────────────────────── */

  if (!permission) {
    return (
      <Screen>
        <ScreenHeader title="Scan Barcode" back close />
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
        <ScreenHeader title="Scan Barcode" back close />
        <EmptyState
          icon="camera-outline"
          title={blocked ? 'Camera access is off' : 'Scan a barcode'}
          body={
            blocked
              ? 'VITA needs the camera to read barcodes. You can turn it back on in Settings.'
              : 'VITA uses the camera to read food barcodes so you can log packaged foods without typing.'
          }
        />
        <Button
          label={blocked ? 'Open Settings' : 'Allow camera'}
          onPress={() => {
            if (blocked) void Linking.openSettings();
            else void requestPermission();
          }}
        />
        <Button label="Search instead" variant="soft" onPress={() => router.replace(`/fuel/search${mealSuffix}`)} />
      </Screen>
    );
  }

  /* ── recovery states ──────────────────────────────────────────────── */

  if (state.phase === 'not-found' || state.phase === 'error') {
    const isError = state.phase === 'error';
    return (
      <Screen>
        <ScreenHeader title="Scan Barcode" back close />
        <EmptyState
          icon={isError ? 'cloud-offline-outline' : 'help-circle-outline'}
          title={isError ? "Couldn't look that up" : 'Product not found'}
          body={
            isError
              ? 'Check your connection and try again.'
              : "We couldn't find that barcode in our food databases. You can still add it manually."
          }
        />
        {isError ? <Button label="Try again" onPress={() => void lookup(state.gtin)} /> : null}
        <Button label="Scan again" variant={isError ? 'soft' : 'filled'} onPress={unlock} />
        <Button label="Search food" variant="soft" onPress={() => router.replace(`/fuel/search${mealSuffix}`)} />
        <Button label="Add manually" variant="soft" onPress={() => router.replace(`/fuel/manual${mealSuffix}`)} />
        {__DEV__ && isError && state.diagnostics.length > 0 ? (
          <Text style={styles.diagnostics}>{state.diagnostics.join('\n')}</Text>
        ) : null}
      </Screen>
    );
  }

  /* ── live scanner ─────────────────────────────────────────────────── */

  const busy = state.phase === 'looking-up';

  return (
    <View style={styles.camera}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: [...FOOD_BARCODE_TYPES] }}
        // Detaching the handler while a lookup runs is a second guard
        // alongside the ref — belt and braces against a very fast device.
        onBarcodeScanned={busy ? undefined : handleScan}
      />

      <View style={[styles.scrim, busy && styles.scrimBusy]} pointerEvents="none" />
      <ScannerFrame busy={busy} />

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

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
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
