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

  it('has no amount input anywhere', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    // Exactly two numeric fields: the vial and the water.
    const numeric = tree.root
      .findAllByType(TextInput)
      .filter((node) => node.props.keyboardType === 'decimal-pad');
    expect(numeric).toHaveLength(2);

    for (const field of numeric) {
      expect(String(field.props.accessibilityLabel)).not.toMatch(/^Amount/);
    }
    const rendered = screen(tree);
    for (const gone of ['Amount being used', 'Amount to convert', 'CALCULATED SYRINGE AMOUNT']) {
      expect(rendered).not.toContain(gone);
    }
  });

  it('has no unit toggle inside the conversion section', async () => {
    const tree = await render();
    await enterVial(tree, '10', '1');

    const toggles = tree.root.findAll(
      (node) =>
        node.props?.accessibilityRole === 'button' &&
        /^Amount unit,/.test(String(node.props?.accessibilityLabel ?? '')),
    );
    expect(toggles).toHaveLength(0);
  });

  it('recomputes when the vial unit changes', async () => {
    const tree = await render();
    await enterVial(tree, '5000', '2');
    await selectUnit(tree, 'Vial unit', 'mcg');

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

  it('sits between the vial and the preferred unit', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    const headings = texts(tree).filter((line) =>
      ['NAME', 'VIAL', 'UNIT CONVERSION', 'PREFERRED UNIT', 'SCHEDULE'].includes(line),
    );
    expect(headings).toEqual(['NAME', 'VIAL', 'UNIT CONVERSION', 'PREFERRED UNIT', 'SCHEDULE']);
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
