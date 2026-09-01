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
    expect(texts(tree)).toContain('UNIT CONVERSION');
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

  it('reads an mcg-authored vial at a legible scale', async () => {
    const tree = await render();
    if (!tree.root.findAll((n) => n.props?.accessibilityLabel === 'Vial unit').length) return;
    await selectUnit(tree, 'Vial unit', 'mcg');
    await enterVial(tree, '5000', '2');

    // 5000 mcg in 2 mL is 2500 mcg/mL. "1 mcg" would be four hundredths of a
    // unit, so the reference picks a legible landmark instead — 500 mcg reads
    // as 20 units, comfortably mid-barrel.
    expect(screen(tree)).toContain('500 mcg = 20 units');
    expect(texts(tree)).toContain('250 mcg');
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
 * The vial unit toggle now belongs to the standalone calculator alone.
 *
 * Slice 3.9A removed it from Routine Setup, where the wrong answer persists
 * and is off by a thousand in every syringe number derived from it. The
 * calculator is a scratch surface — nothing it holds is saved, so a mistaken
 * unit is visible and disposable — and mg/mcg flexibility is genuinely useful
 * for someone holding a vial labelled either way.
 */
describe.each([SURFACES[1]])('%s — vial unit toggle', (_name, render) => {
  function vialValue(tree: ReactTestRenderer) {
    return tree.root
      .findAllByType(TextInput)
      .find((node) => /^Vial amount/.test(String(node.props.accessibilityLabel ?? '')))?.props.value;
  }

  it('restates 20 mg as 20000 mcg, preserving the ratio', async () => {
    const tree = await render();
    await enterVial(tree, '20', '2');
    expect(screen(tree)).toContain('1 mg = 10 units');
    expect(screen(tree)).toContain('Concentration · 10 mg/mL');

    await selectUnit(tree, 'Vial unit', 'mcg');
    expect(vialValue(tree)).toBe('20000');

    /**
     * The reference is written in whatever unit the vial is authored in, so
     * the headline restates itself at an mcg-appropriate scale. What must not
     * move is the underlying ratio: 10 mg/mL is 10000 mcg/mL, and 1 mg still
     * comes to 10 units.
     */
    expect(screen(tree)).toContain('Concentration · 10000 mcg/mL');

    // The custom field keeps its own unit — seeded once, then independent, so
    // toggling the vial cannot silently reinterpret something typed here.
    await selectUnit(tree, 'Custom amount unit', 'mcg');
    await type(tree, /^Custom amount,/, '1000');
    expect(screen(tree)).toContain('= 10 units');
  });

  it('round-trips back to 20 mg with no drift', async () => {
    const tree = await render();
    await enterVial(tree, '20', '2');
    await selectUnit(tree, 'Vial unit', 'mcg');
    await selectUnit(tree, 'Vial unit', 'mg');

    expect(vialValue(tree)).toBe('20');
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  it('leaves a blank or half-typed vial alone', async () => {
    const tree = await render();
    await selectUnit(tree, 'Vial unit', 'mcg');
    expect(vialValue(tree)).toBe('');

    await type(tree, /^Vial amount/, '1.');
    await selectUnit(tree, 'Vial unit', 'mg');
    expect(vialValue(tree)).toBe('1.');
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

  it('sits directly beneath the vial it is derived from', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    const headings = texts(tree).filter((line) =>
      ['NAME', 'VIAL', 'UNIT CONVERSION', 'PREFERRED UNIT', 'SCHEDULE'].includes(line),
    );
    /**
     * NAME went in 3.9 (a routine is named by its definition) and PREFERRED
     * UNIT in 3.9A — it asked, out of context and up front, a question that
     * only matters beside the amount being recorded. What is left is the
     * vial, what it converts to, and when.
     */
    expect(headings).toEqual(['VIAL', 'UNIT CONVERSION', 'SCHEDULE']);
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
