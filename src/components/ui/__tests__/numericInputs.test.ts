/**
 * The numeric keyboard is an input-system behaviour, not a screen's problem.
 *
 * iOS's number pads have no return key. A numeric field without an
 * `InputAccessoryView` therefore traps the keyboard on screen, hiding the
 * value just typed and the control that would save it. Founder device QA
 * found that three times across three slices — the calculator in 5.2, the
 * `TakenSheet` in 5.5, and a Water field in 5.5C — and each was patched at
 * the screen where it was found.
 *
 * The cause was that the Done bar was opt-in: `NumericField` pointed at a
 * shared `nativeID` that each screen had to remember to register. Slice 5.5C
 * moved the bar inside the primitive, so the only way to get a number pad is
 * to get a Done key with it.
 *
 * **This file is the audit that keeps it that way.** It is a source scan
 * rather than a render, because the failure it guards against is a screen
 * that quietly opens a raw `TextInput` with a numeric `keyboardType` — which
 * no render test would think to look for, since nobody writes a test for a
 * field they forgot about.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const SOURCE_ROOT = join(__dirname, '..', '..', '..');

/** The one file allowed to name a numeric keyboard: the primitive itself. */
const PRIMITIVE = join('components', 'ui', 'NumericField.tsx');

/**
 * Keyboards with no return key. `numbers-and-punctuation` is deliberately
 * absent — it is a full keyboard that happens to lead with digits, it has a
 * return key, and it needs no accessory.
 */
const PADS = ['decimal-pad', 'number-pad', 'numeric', 'phone-pad'];

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) found.push(full);
  }
  return found;
}

describe('numeric input audit', () => {
  const files = sourceFiles(SOURCE_ROOT);

  it('finds the app source, so a passing scan means something', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('declares a number pad in exactly one place', () => {
    const offenders = files.filter((file) => {
      if (file.endsWith(PRIMITIVE)) return false;
      const source = readFileSync(file, 'utf8');
      return PADS.some((pad) => source.includes(`keyboardType="${pad}"`));
    });

    /*
     * A failure here is not a style violation. It is a screen whose keyboard
     * a user cannot dismiss — use `NumericField`, which brings its own Done.
     */
    expect(offenders.map((file) => file.slice(SOURCE_ROOT.length + 1))).toEqual([]);
  });

  it('leaves no screen rendering an accessory bar of its own', () => {
    const offenders = files.filter((file) => {
      if (file.endsWith(PRIMITIVE)) return false;
      return readFileSync(file, 'utf8').includes('<InputAccessoryView');
    });

    // Fifteen screen-specific bars is the pattern this replaced; a stray one
    // is a bar registered under an id no field points at.
    expect(offenders.map((file) => file.slice(SOURCE_ROOT.length + 1))).toEqual([]);
  });
});
