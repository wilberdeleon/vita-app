/**
 * The automatic unit conversion, on both surfaces.
 *
 * The behaviour under test is the one the founder specified after three
 * rejected designs: enter a vial and a reconstitution volume, and the
 * relationship between mass and syringe units appears **with nothing else
 * entered**. There is no amount field, no unit toggle inside the conversion,
 * and no button — so every assertion below stops after typing the two vial
 * numbers.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// `mock`-prefixed so Babel allows the hoisted factory to close over it.
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: () => undefined },
  useLocalSearchParams: () => ({}),
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import StandalonePeptideCalculator from '../../../app/(vita)/settings/tools/peptide-calculator';
import Tools from '../../../app/(vita)/settings/tools/index';
import { SetupForm } from '../components/SetupForm';
import { ThemeProvider } from '../../../theme/ThemeProvider';

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement): Promise<ReactTestRenderer> {
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>{element}</ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  mockPush.mockClear();
  if (tree) await act(async () => tree.unmount());
});

/** One string per `Text` node — children concatenated, as the line reads. */
function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children
      .filter((child): child is string | number => typeof child === 'string' || typeof child === 'number')
      .join('');
  });
}

function screen(tree: ReactTestRenderer): string {
  return texts(tree).join(' ');
}

/** Finds a field by its accessibility label and types into it. */
async function type(tree: ReactTestRenderer, label: RegExp, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => label.test(String(node.props.accessibilityLabel ?? '')));
  if (!field) throw new Error(`no field matching ${label} on screen`);
  await act(async () => field.props.onChangeText(value));
}

/** Presses a segmented option within a named group — "Vial unit, mcg". */
async function selectUnit(tree: ReactTestRenderer, group: string, unit: string) {
  const segment = tree.root.find(
    (node) =>
      node.props?.accessibilityRole === 'button' &&
      node.props?.accessibilityLabel === `${group}, ${unit}`,
  );
  await act(async () => segment.props.onPress());
}

function control(tree: ReactTestRenderer, label: string) {
  return tree.root
    .findAll((node) => typeof node.props?.onPress === 'function')
    .find((node) =>
      node.findAllByType(Text).some((text) => {
        const children = Array.isArray(text.props.children) ? text.props.children : [text.props.children];
        return children.join('').trim() === label;
      }),
    );
}

/** Types only the vial and the water — deliberately nothing else. */
async function enterVial(tree: ReactTestRenderer, vial: string, water: string) {
  await type(tree, /^Vial amount/, vial);
  await type(tree, /reconstitution volume/i, water);
}

const SURFACES: Array<[string, () => Promise<ReactTestRenderer>]> = [
  ['inline setup form', () => mount(<SetupForm onChange={() => undefined} />)],
  ['standalone tool', () => mount(<StandalonePeptideCalculator />)],
];

describe.each(SURFACES)('%s', (_name, render) => {
  it('shows the conversion from the vial alone, with nothing else entered', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('updates when the reconstitution changes, still with no other input', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');
    expect(screen(tree)).toContain('1 mg = 10 units');

    await type(tree, /reconstitution volume/i, '2');
    expect(screen(tree)).toContain('1 mg = 20 units');
  });

  it('updates when the vial amount changes', async () => {
    const tree = await render();
    await enterVial(tree, '10', '2');
    expect(screen(tree)).toContain('1 mg = 20 units');

    await type(tree, /^Vial amount/, '20');
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('renders a compact reference table', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    const rendered = screen(tree);
    expect(rendered).toContain('AMOUNT');
    expect(rendered).toContain('SYRINGE UNITS');
    // The founder's worked example: 0.5/1/2/3/4/5 mg against 5/10/…/50 units.
    for (const [amount, units] of [
      ['0.5 mg', '5 units'],
      ['1 mg', '10 units'],
      ['2 mg', '20 units'],
      ['3 mg', '30 units'],
      ['4 mg', '40 units'],
      ['5 mg', '50 units'],
    ]) {
      expect(texts(tree)).toContain(amount);
      expect(texts(tree)).toContain(units);
    }
  });

  it('shows the concentration and the U-100 assumption', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    expect(screen(tree)).toContain('Concentration · 10 mg/mL');
    expect(screen(tree)).toContain('Using U-100 · 100 units/mL');
  });

  it('asks for the vial before it has one, and nothing more', async () => {
    const tree = await render();
    // A field-weight label under the vial, not a section header of its own.
    expect(texts(tree)).toContain('Unit conversion');
    expect(texts(tree)).not.toContain('UNIT CONVERSION');
    expect(screen(tree)).toContain(
      'Enter vial amount and reconstitution volume to see the unit conversion.',
    );
    expect(screen(tree)).not.toContain('units/mL');
  });

  it('replaces the helper as soon as both numbers are valid', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');
    expect(screen(tree)).not.toContain('Enter vial amount and reconstitution volume');
  });

  it('never gates the conversion behind an amount', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    // The retired model asked for a target amount before showing anything.
    const rendered = screen(tree);
    for (const gone of ['Amount being used', 'Amount to convert', 'CALCULATED SYRINGE AMOUNT']) {
      expect(rendered).not.toContain(gone);
    }
    // And the reference is already there without touching the custom field.
    expect(rendered).toContain('1 mg = 10 units');
  });

  it('offers the custom field only once a concentration exists', async () => {
    const tree = await render();
    expect(screen(tree)).not.toContain('CUSTOM CONVERSION');

    await enterVial(tree, '10', '1');
    expect(screen(tree)).toContain('CUSTOM CONVERSION');
  });

  it('picks a legible landmark when one whole milligram is off the barrel', async () => {
    /**
     * Rewritten in 3.10A. This used to reach the low-concentration case by
     * toggling the vial to mcg — a control that no longer exists on either
     * surface — and had been silently early-returning ever since, asserting
     * nothing at all. The behaviour it was guarding is real and still
     * reachable: it just takes a genuinely small milligram vial now.
     *
     * 0.5 mg in 2 mL is 250 mcg/mL, so one whole milligram would be 400 units
     * — far off the end of a syringe. The reference drops to a landmark that
     * can actually be drawn rather than headlining a number nobody can use.
     */
    const tree = await render();
    await enterVial(tree, '0.5', '2');

    expect(screen(tree)).toContain('0.05 mg = 20 units');
    expect(screen(tree)).toContain('Concentration · 0.25 mg/mL');
    // And every row it offers is drawable.
    expect(screen(tree)).not.toContain('400 units');
  });

  it('never marks a row as recommended', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    const rendered = screen(tree)
      .toLowerCase()
      // The setup form's own disclaimer — "a display preference, not a
      // recommended amount" — is the opposite of a recommendation and
      // predates this slice. Removed so it cannot mask a real one.
      .replace('a display preference, not a recommended amount.', '');
    for (const phrase of ['recommended', 'suggested', 'typical', 'standard', 'starting', 'ideal', 'protocol']) {
      expect(rendered).not.toContain(phrase);
    }
  });

  it('handles invalid vial input without producing a conversion', async () => {
    const tree = await render();
    for (const [vial, water] of [
      ['0', '1'],
      ['-5', '1'],
      ['10', '0'],
      ['10', '-1'],
      ['abc', '1'],
      ['10', 'abc'],
    ]) {
      await enterVial(tree, vial, water);
      const rendered = screen(tree);
      expect(rendered).toContain('Enter vial amount and reconstitution volume');
      expect(rendered).not.toContain('NaN');
      expect(rendered).not.toContain('Infinity');
    }
  });

  it('recovers immediately once the numbers are valid again', async () => {
    const tree = await render();
    await enterVial(tree, '10', '0');
    expect(screen(tree)).toContain('Enter vial amount and reconstitution volume');

    await type(tree, /reconstitution volume/i, '1');
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('handles decimals', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1.5');

    // 10 mg in 1.5 mL is 6.67 mg/mL, so 1 mg is 15 units.
    expect(screen(tree)).toContain('1 mg = 15 units');
  });

  it('keeps the Done accessory on both numeric fields', async () => {
    const tree = await render();
    const numeric = tree.root
      .findAllByType(TextInput)
      .filter((node) => node.props.keyboardType === 'decimal-pad');

    for (const field of numeric) {
      expect(field.props.inputAccessoryViewID).toBe('vita-numeric-done');
    }
    expect(control(tree, 'Done')).toBeDefined();
  });
});

describe.each(SURFACES)('%s — custom conversion', (_name, render) => {
  /** The optional field for an amount the generated table does not cover. */
  async function ready(vial: string, water: string) {
    const tree = await render();
    await enterVial(tree, vial, water);
    return tree;
  }

  function customValue(tree: ReactTestRenderer) {
    return tree.root
      .findAllByType(TextInput)
      .find((node) => /^Custom amount,/.test(String(node.props.accessibilityLabel ?? '')))?.props
      .value;
  }

  it('converts 2 mg to 20 units on a 10 mg / 1 mL vial', async () => {
    const tree = await ready('10', '1');
    await type(tree, /^Custom amount,/, '2');
    expect(screen(tree)).toContain('= 20 units');
  });

  it('converts 500 mcg to 20 units on a 5 mg / 2 mL vial', async () => {
    const tree = await ready('5', '2');
    await selectUnit(tree, 'Custom amount unit', 'mcg');
    await type(tree, /^Custom amount,/, '500');
    expect(screen(tree)).toContain('= 20 units');
  });

  it('handles an amount the generated table never reaches', async () => {
    // A 1 mg / 1 mL vial tables single-digit units; 200 mcg is off the end of
    // it, which is the whole reason this field exists.
    const tree = await ready('1', '1');
    await selectUnit(tree, 'Custom amount unit', 'mcg');
    await type(tree, /^Custom amount,/, '200');
    expect(screen(tree)).toContain('= 20 units');
  });

  it('restates the amount when its unit changes, leaving the result alone', async () => {
    const tree = await ready('10', '1');
    await type(tree, /^Custom amount,/, '0.5');
    expect(screen(tree)).toContain('= 5 units');

    await selectUnit(tree, 'Custom amount unit', 'mcg');
    expect(customValue(tree)).toBe('500');
    expect(screen(tree)).toContain('= 5 units');

    await selectUnit(tree, 'Custom amount unit', 'mg');
    expect(customValue(tree)).toBe('0.5');
    expect(screen(tree)).toContain('= 5 units');
  });

  it('stays silent while blank, and never blocks the reference', async () => {
    const tree = await ready('10', '1');
    expect(screen(tree)).toContain('1 mg = 10 units');
    expect(screen(tree)).not.toContain('Enter an amount greater than zero.');
    expect(customValue(tree)).toBe('');
  });

  it('names a zero or malformed amount without losing the reference', async () => {
    const tree = await ready('10', '1');
    for (const junk of ['0', '-2', 'abc']) {
      await type(tree, /^Custom amount,/, junk);
      expect(screen(tree)).toContain('Enter an amount greater than zero.');
      // The automatic reference is unaffected by a bad custom value.
      expect(screen(tree)).toContain('1 mg = 10 units');
      expect(screen(tree)).not.toContain('NaN');
      expect(screen(tree)).not.toContain('Infinity');
    }
  });

  it('recovers as soon as the amount is valid', async () => {
    const tree = await ready('10', '1');
    await type(tree, /^Custom amount,/, '0');
    await type(tree, /^Custom amount,/, '2');
    expect(screen(tree)).toContain('= 20 units');
    expect(screen(tree)).not.toContain('Enter an amount greater than zero.');
  });

  it('shows fractional units without false precision', async () => {
    const tree = await ready('10', '1');
    await type(tree, /^Custom amount,/, '1.25');
    expect(screen(tree)).toContain('= 12.5 units');
  });

  it('calculates past a full barrel without advising on it', async () => {
    const tree = await ready('10', '1');
    await type(tree, /^Custom amount,/, '12');

    const rendered = screen(tree);
    expect(rendered).toContain('= 120 units');
    for (const advice of ['split', 'two injections', 'maximum', 'capacity']) {
      expect(rendered.toLowerCase()).not.toContain(advice);
    }
  });

  it('carries the Done accessory', async () => {
    const tree = await ready('10', '1');
    const field = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Custom amount,/.test(String(node.props.accessibilityLabel ?? '')));
    expect(field?.props.keyboardType).toBe('decimal-pad');
    expect(field?.props.inputAccessoryViewID).toBe('vita-numeric-done');
  });
});

/**
 * The vial is milligrams on **both** surfaces (founder decision, 3.10A).
 *
 * Slice 3.9A removed the toggle from Routine Setup, where a wrong answer
 * persists and is out by a factor of a thousand in every syringe number
 * derived from it. The standalone calculator kept one on the argument that
 * nothing it holds is saved, so a mistake there was disposable. The Sprint 3
 * closeout audit disagreed — the mistake is not *visible*, since a mcg vial
 * produces a table that looks entirely coherent and is wrong by 1000×, and
 * the user acts on the number rather than on whether it was stored — and the
 * founder ruled the vial MG-only everywhere.
 *
 * **The Custom Amount keeps mg and mcg.** That is the amount being converted,
 * not the vial size, and micrograms are an ordinary way to state it.
 */
describe.each(SURFACES)('%s — the vial is milligrams, and only milligrams', (_name, render) => {
  it('labels the vial in uppercase MG', async () => {
    const tree = await render();
    expect(screen(tree)).toContain('Vial Amount (MG)');
  });

  it('offers no vial unit control at all', async () => {
    const tree = await render();
    const vialUnitControls = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /^Vial unit,/.test(String(node.props?.accessibilityLabel ?? '')),
    );
    expect(vialUnitControls).toHaveLength(0);
    expect(screen(tree)).not.toContain('Vial Amount (MCG)');
  });

  it('asks for the vial in milligrams for assistive technology too', async () => {
    const tree = await render();
    const field = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Vial amount/.test(String(node.props.accessibilityLabel ?? '')));
    // Setup adds ", optional" because the field genuinely is; the calculator
    // does not. What both must say is *milligrams*, and never micrograms.
    expect(field?.props.accessibilityLabel).toMatch(/^Vial amount in milligrams/);
    expect(field?.props.accessibilityLabel).not.toMatch(/microgram|mcg/i);
  });

  it('reads a typed vial as milligrams — 20 in 2 mL is 10 mg/mL', async () => {
    // The whole point of removing the toggle: there is now exactly one way to
    // read the number in that field.
    const tree = await render();
    await enterVial(tree, '20', '2');
    expect(screen(tree)).toContain('Concentration · 10 mg/mL');
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('still converts a Custom Amount entered in micrograms', async () => {
    // 5 mg in 2 mL is 2.5 mg/mL, so 500 mcg is 0.2 mL — 20 units.
    const tree = await render();
    await enterVial(tree, '5', '2');
    await selectUnit(tree, 'Custom amount unit', 'mcg');
    await type(tree, /^Custom amount,/, '500');
    expect(screen(tree)).toContain('= 20 units');
  });

  it('keeps mg and mcg on the Custom Amount, which is not the vial', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');
    const options = tree.root.findAll(
      (node) =>
        typeof node.props?.onPress === 'function' &&
        /^Custom amount unit,/.test(String(node.props?.accessibilityLabel ?? '')),
    );
    expect(options.map((node) => node.props.accessibilityLabel).sort()).toEqual([
      'Custom amount unit, mcg',
      'Custom amount unit, mg',
    ]);
  });
});

describe('the setup form persists milligrams and nothing else', () => {
  it('emits canonical micrograms from a milligram vial', async () => {
    const emitted: Array<Record<string, unknown>> = [];
    const tree = await mount(
      <SetupForm onChange={(value) => emitted.push(value as Record<string, unknown>)} />,
    );

    await enterVial(tree, '20', '2');
    const vial = emitted.at(-1)?.vial as
      | { amountMcg: number; authored: { amount: number; unit: string } }
      | undefined;

    // 20 on screen, 20000 on disk, authored as mg — the UI simplification
    // never touched the maths.
    expect(vial?.amountMcg).toBe(20_000);
    expect(vial?.authored).toEqual({ amount: 20, unit: 'mg' });
  });

  it('has no vial unit control to get wrong', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    expect(
      tree.root.findAll((node) => node.props?.accessibilityLabel === 'Vial unit'),
    ).toHaveLength(0);
  });

  it('never emits the custom amount', async () => {
    const emitted: Array<Record<string, unknown>> = [];
    const tree = await mount(
      <SetupForm onChange={(value) => emitted.push(value as Record<string, unknown>)} />,
    );
    await enterVial(tree, '10', '1');
    await type(tree, /^Custom amount,/, '2');

    expect(screen(tree)).toContain('= 20 units');
    for (const value of emitted) {
      expect(Object.keys(value)).not.toContain('customAmount');
      expect(JSON.stringify(value)).not.toContain('"2"');
    }
  });
});

describe('the inline surface specifically', () => {
  it('needs no saved setup', async () => {
    // A brand-new form, exactly as "Track this peptide" opens it.
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    await enterVial(tree, '10', '1');
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('reads a saved setup’s vial without any further input', async () => {
    const tree = await mount(
      <SetupForm
        initial={{
          id: 'setup-1',
          definitionId: 'catalog:retatrutide',
          vial: { amountMcg: 20_000, authored: { amount: 20, unit: 'mg' } },
          reconstitutionMl: 2,
          preferredDoseUnit: 'mg',
          preferredEntryMode: 'mass',
          routineState: 'active',
          active: true,
          createdAt: '2026-08-25T10:00:00.000Z',
          updatedAt: '2026-08-25T10:00:00.000Z',
        }}
        onChange={() => undefined}
      />,
    );

    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('persists nothing from the conversion', async () => {
    const emitted: unknown[] = [];
    const tree = await mount(<SetupForm onChange={(value) => emitted.push(value)} />);
    await enterVial(tree, '10', '1');

    expect(screen(tree)).toContain('1 mg = 10 units');
    for (const value of emitted) {
      const keys = Object.keys(value as object);
      expect(keys).not.toContain('amount');
      expect(keys).not.toContain('syringeUnits');
      expect(keys).not.toContain('conversion');
    }
  });

  it('sits inside the vial group rather than beside it', async () => {
    /**
     * The founder's §9–11 hierarchy, asserted as a shape rather than as a
     * screenshot: **three** section headers, in order, and nothing else
     * shouting at that weight.
     *
     * NAME went in 3.9 (a routine is named by its definition) and PREFERRED
     * UNIT in 3.9A — it asked, out of context and up front, a question that
     * only matters beside the amount being recorded. SCHEDULE, REMINDER and
     * START DATE were demoted to field labels in 3.10A: they are fields of
     * the routine, not groups of their own, and seven equally loud headings
     * made a setup form read like five stacked modules.
     */
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    const headings = texts(tree).filter((line) => line === line.toUpperCase() && /^[A-Z ]{3,}$/.test(line));
    expect(headings).toEqual(['VIAL', 'ROUTINE', 'NOTES']);
  });

  it('keeps every routine control present, just no longer shouting', async () => {
    // The hierarchy change must not have removed anything (§13).
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    const rendered = screen(tree);
    for (const label of [
      'Vial Amount (MG)',
      'Reconstitution Volume (ML)',
      'Unit conversion',
      'Amount (MG)',
      'Schedule',
      'Reminder',
      'Start date',
    ]) {
      expect(rendered).toContain(label);
    }
  });
});

describe('the standalone surface specifically', () => {
  it('works with no provider, catalog, definition or setup', async () => {
    // Rendered with no PeptideProvider at all — it would throw on mount if it
    // depended on any of the tracking machinery.
    const tree = await mount(<StandalonePeptideCalculator />);
    await enterVial(tree, '20', '2');
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('starts blank', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);
    for (const field of tree.root.findAllByType(TextInput)) {
      expect(field.props.value).toBe('');
    }
  });
});

describe('Tools destination', () => {
  it('lists the peptide calculator and opens it', async () => {
    const tree = await mount(<Tools />);
    expect(screen(tree)).toContain('Peptide Calculator');

    const row = control(tree, 'Peptide Calculator');
    await act(async () => row!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/settings/tools/peptide-calculator');
  });
});

/* ── §3.10 audit — one question, one wording ────────────────────────────── */

/**
 * The two surfaces ask for the same two numbers, so they must ask in the same
 * words.
 *
 * Slice 3.9A rewrote the setup form's reconstitution label — "Bacteriostatic
 * Water / Reconstitution (mL)" named one number twice in a line and made the
 * form read as technical — and moved the detail into a helper underneath. The
 * standalone calculator kept the old label for two slices, so the same
 * measurement had two names and two casings depending on where you asked.
 */
describe.each(SURFACES)('%s — asks in the product’s own words', (_name, render) => {
  it('names the vial in uppercase MG, as the founder specified', async () => {
    const tree = await render();
    expect(screen(tree)).toContain('Vial Amount (MG)');
  });

  it('names the water as a volume, in uppercase ML', async () => {
    const tree = await render();
    expect(screen(tree)).toContain('Reconstitution Volume (ML)');
  });

  it('puts the diluent in a helper line rather than in the label', async () => {
    const tree = await render();
    const rendered = screen(tree);
    expect(rendered).toContain('Bacteriostatic water added to the vial.');
    expect(rendered).not.toContain('Bacteriostatic Water / Reconstitution');
  });

  it('carries no slash-joined double name anywhere on the screen', async () => {
    const tree = await render();
    expect(screen(tree)).not.toMatch(/\w+ \/ \w+ \(m[lL]\)/);
  });
});

/**
 * The unit-casing convention, stated once and pinned.
 *
 * A **configuration field label** names its unit in caps — `(MG)`, `(ML)` —
 * and every **displayed value** stays lowercase — `2 mg`, `20 units`,
 * `1.2 mL`. Setup carried both styles four lines apart before the audit:
 * "Vial Amount (MG)" above "Amount (mg)".
 */
describe('units are cased by role, not by accident', () => {
  it('caps the unit in every configuration label on the setup form', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    const rendered = screen(tree);
    expect(rendered).toContain('Vial Amount (MG)');
    expect(rendered).toContain('Reconstitution Volume (ML)');
    expect(rendered).toContain('Amount (MG)');
    expect(rendered).not.toContain('Amount (mg)');
  });

  it('leaves displayed values in lowercase, where they belong', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    await enterVial(tree, '10', '1');
    const rendered = screen(tree);
    expect(rendered).toContain('1 mg = 10 units');
    expect(rendered).toContain('10 mg/mL');
    // The reference table is values, so it must not shout.
    expect(rendered).not.toContain('1 MG');
  });
});

/* ── §6 the founder's canonical examples, on both surfaces ──────────────── */

/**
 * The four worked examples, asserted through the real screens rather than
 * through the arithmetic underneath them.
 *
 * `dose.test.ts` already proves the maths. This proves the maths reaches the
 * user — which, after PT-141, is the distinction this codebase takes
 * seriously. All four are stated in milligrams, because that is now the only
 * way a vial can be entered on either surface.
 */
describe.each(SURFACES)('%s — the canonical conversions', (_name, render) => {
  it.each([
    ['10', '1', '1 mg = 10 units', 'Concentration · 10 mg/mL'],
    ['10', '2', '1 mg = 20 units', 'Concentration · 5 mg/mL'],
    ['20', '2', '1 mg = 10 units', 'Concentration · 10 mg/mL'],
  ])('%s MG in %s ML gives %s', async (vial, water, headline, concentration) => {
    const tree = await render();
    await enterVial(tree, vial, water);
    const rendered = screen(tree);
    expect(rendered).toContain(headline);
    expect(rendered).toContain(concentration);
  });

  it('5 MG / 2 ML with a 500 mcg custom amount gives 20 units', async () => {
    const tree = await render();
    await enterVial(tree, '5', '2');
    await selectUnit(tree, 'Custom amount unit', 'mcg');
    await type(tree, /^Custom amount,/, '500');
    expect(screen(tree)).toContain('= 20 units');
  });

  it('states the U-100 assumption it is built on', async () => {
    // 100 units = 1 mL. Every number above depends on it, so it is said out
    // loud rather than assumed silently.
    const tree = await render();
    await enterVial(tree, '10', '1');
    expect(screen(tree)).toContain('Using U-100 · 100 units/mL');
  });

  it('never renders the same amount twice in the reference table', async () => {
    // The 3.10 duplicate-row guard, checked on the screen rather than in the
    // model — the mcg path that produced it is gone, and this keeps it gone.
    for (const [vial, water] of [['10', '1'], ['10', '2'], ['20', '2'], ['5', '2'], ['0.5', '1']]) {
      const tree = await render();
      await enterVial(tree, vial, water);
      const amounts = texts(tree).filter((t) => /^\d+(\.\d+)? (mg|mcg)$/.test(t));
      expect(new Set(amounts).size).toBe(amounts.length);
      await act(async () => tree.unmount());
    }
  });
});
