/**
 * GTIN (barcode) normalization.
 *
 * The same physical product carries different-length codes depending on the
 * standard: UPC-E (8), UPC-A (12), EAN-13 (13), GTIN-14 (14). They are the
 * *same* number with different leading-zero padding, so comparing the raw
 * strings finds no match between a USDA `gtinUpc` of "028400157827" and an
 * Open Food Facts `code` of "0028400157827".
 *
 * Everything is therefore normalized to 14 digits before comparison, which
 * makes barcode the strongest identity signal for deduplication and will be
 * reused unchanged by the barcode-scanning slice.
 */

/** A GTIN normalized to its canonical 14-digit form. */
export type Gtin = string;

const DIGITS_ONLY = /\D/g;

/**
 * The standards run 8 (UPC-E) to 14 (GTIN-14), and everything between is
 * accepted rather than just the four canonical lengths.
 *
 * The reason is leading zeros. A barcode that passes through a JSON number,
 * a spreadsheet, or a loosely-typed provider field loses them — UPC-A
 * "028400157827" arrives as 28400157827, eleven digits. Rejecting that as a
 * non-standard length would reintroduce precisely the mismatch this module
 * exists to prevent, so any 8–14 digit run is zero-padded back to 14.
 * Below 8 is too short to be a product code and stays rejected.
 */
const MIN_DIGITS = 8;
const MAX_DIGITS = 14;

/**
 * Normalizes any accepted barcode representation to 14 digits.
 * Returns `null` for anything that isn't a usable barcode, so callers can
 * tell "no barcode" apart from "barcode we failed to parse".
 */
export function normalizeGtin(raw: string | number | null | undefined): Gtin | null {
  if (raw === null || raw === undefined) return null;

  const digits = String(raw).replace(DIGITS_ONLY, '');
  if (digits.length === 0) return null;

  // Providers sometimes pad beyond 14 with zeros; strip those before
  // validating length, but never strip a leading zero that is part of a
  // legitimate 8/12/13-digit code.
  const trimmed = digits.length > MAX_DIGITS ? digits.replace(/^0+/, '') : digits;
  if (trimmed.length > MAX_DIGITS || trimmed.length < MIN_DIGITS) return null;

  return trimmed.padStart(MAX_DIGITS, '0');
}

/** True when two barcodes refer to the same GTIN, whatever form they arrived in. */
export function gtinEquals(a: string | number | null | undefined, b: string | number | null | undefined): boolean {
  const left = normalizeGtin(a);
  const right = normalizeGtin(b);
  return left !== null && left === right;
}

/**
 * GS1 mod-10 check digit validation.
 *
 * Deliberately NOT enforced by `normalizeGtin`: real-world catalogues carry
 * codes that fail this check, and silently dropping a product the user can
 * see in their hand would be worse than showing it. Exposed for the barcode
 * slice, where a failed check is a useful signal that a scan misread.
 */
export function isValidGtin(raw: string | number | null | undefined): boolean {
  const gtin = normalizeGtin(raw);
  if (!gtin) return false;

  let sum = 0;
  // Weights alternate 3,1,3,1… from the rightmost digit before the check digit.
  for (let i = 0; i < 13; i += 1) {
    const digit = Number(gtin[12 - i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(gtin[13]);
}
