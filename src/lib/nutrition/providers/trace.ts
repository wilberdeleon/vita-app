/**
 * Development-only trace of a single barcode scan, end to end.
 *
 * Physical-device QA reported a scanned bottle resolving to an unrelated
 * product, while the same barcode resolved correctly in a standalone
 * provider test. That gap can only be closed with the *actual* value the
 * camera produced on the device — which nothing was recording.
 *
 * This keeps the last scan's stages in memory so the running app can show
 * them. It is a diagnostic aid, not product behavior: every writer is
 * guarded by `__DEV__`, the buffer holds one scan, and nothing here is
 * rendered in a production build.
 *
 * Never record credentials or raw provider payloads — stage names, barcode
 * values, and food identities only.
 */

export type BarcodeTraceStage = {
  stage: string;
  detail: string;
};

let trace: BarcodeTraceStage[] = [];

/** Starts a new trace, discarding the previous scan's. */
export function beginBarcodeTrace(): void {
  if (!__DEV__) return;
  trace = [];
}

export function traceBarcode(stage: string, detail: string): void {
  if (!__DEV__) return;
  trace.push({ stage, detail });
  console.log(`[barcode] ${stage}: ${detail}`);
}

export function getBarcodeTrace(): BarcodeTraceStage[] {
  return __DEV__ ? trace : [];
}
