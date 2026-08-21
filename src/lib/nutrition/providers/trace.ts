/**
 * Development-only console trace of a single barcode scan, end to end.
 *
 * Physical-device QA reported a scanned bottle resolving to an unrelated
 * product while the same barcode resolved correctly in every standalone
 * test. Closing that gap needed the *actual* value the camera produced on
 * the device, which nothing was recording.
 *
 * It answered the question: the cause is an upstream Open Food Facts record
 * filed under one company's barcode carrying another company's product. So
 * the on-screen trace panel is gone — a debug block does not belong in
 * founder QA once it has done its job — and what remains is the console
 * log, which costs nothing and still tells the whole story when a scan
 * misbehaves. The "Not the right product?" recovery is now the user-facing
 * answer to a wrong result.
 *
 * Every writer is guarded by `__DEV__`, so none of this exists in a
 * production build. Never record credentials or raw provider payloads —
 * stage names, barcode values, and food identities only.
 */

/** Marks the start of a scan in the log, so one scan reads as one block. */
export function beginBarcodeTrace(): void {
  if (!__DEV__) return;
  console.log('[barcode] ── new scan ──────────────────────────────');
}

export function traceBarcode(stage: string, detail: string): void {
  if (!__DEV__) return;
  console.log(`[barcode] ${stage}: ${detail}`);
}
