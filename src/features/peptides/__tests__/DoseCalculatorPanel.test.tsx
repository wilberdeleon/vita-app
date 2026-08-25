/**
 * Both calculator surfaces, driven the way a user drives them.
 *
 * Slice 3.6 shipped 605 green tests around a calculator the founder could not
 * use. The gap was that nothing ever exercised the calculator *through the
 * screen that hosts it* — the tests reached past the form into a component
 * with values already in place. So these tests start where a user starts: an
 * empty form, and text typed into fields, with no setup saved.
 *
 * The rule followed here: **never hand the component a value the UI would
 * have had to produce.** Every number below arrives through `onChangeText` on
 * a field found in the rendered tree.
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

/** Presses a segmented option within a named group — "Amount unit, mcg". */
async function selectUnit(tree: ReactTestRenderer, group: string, unit: string) {
  const segment = tree.root.find(
    (node) =>
      node.props?.accessibilityRole === 'button' &&
      node.props?.accessibilityLabel === `${group}, ${unit}`,
  );
  await act(async () => segment.props.onPress());
}

/** Presses a control by the text rendered inside it. */
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

async function press(tree: ReactTestRenderer, label: string) {
  const target = control(tree, label);
  if (!target) throw new Error(`no "${label}" control on screen`);
  await act(async () => target.props.onPress());
}

describe('inline — a brand new setup, nothing saved', () => {
  /** A blank form, exactly as "Track this peptide" opens it. */
  async function blankForm() {
    return mount(<SetupForm onChange={() => undefined} />);
  }

  it('calculates from draft text with no save anywhere', async () => {
    const tree = await blankForm();

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');

    expect(screen(tree)).toContain('20 units');
    expect(screen(tree)).toContain('Equivalent volume · 0.2 mL');
    expect(screen(tree)).toContain('Concentration · 10 mg/mL');
  });

  it('recalculates the moment the reconstitution changes', async () => {
    const tree = await blankForm();

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');

    await type(tree, /reconstitution volume/i, '1');
    expect(screen(tree)).toContain('10 units');
    expect(screen(tree)).toContain('20 mg/mL');
  });

  it('recalculates the moment the amount changes', async () => {
    const tree = await blankForm();

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '1');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('10 units');

    await type(tree, /^Amount,/, '1');
    expect(screen(tree)).toContain('5 units');
  });

  it('recalculates when the vial amount changes', async () => {
    const tree = await blankForm();

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');

    await type(tree, /^Vial amount/, '10');
    expect(screen(tree)).toContain('40 units');
  });

  it('shows the calculator section before the vial is filled in', async () => {
    const tree = await blankForm();

    // The section must not hide — a user who has not entered a vial should
    // still see that a calculator exists, and what it needs.
    expect(texts(tree)).toContain('UNIT CALCULATOR');
    expect(screen(tree)).toContain('Add vial amount and reconstitution volume above');
  });

  it('never persists the amount through the form’s onChange', async () => {
    // The single most important guarantee: `Save setup` writes what onChange
    // last emitted, and the amount must never appear in it.
    const emitted: unknown[] = [];
    const tree = await mount(<SetupForm onChange={(value) => emitted.push(value)} />);

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');

    expect(screen(tree)).toContain('20 units');
    expect(emitted.length).toBeGreaterThan(0);
    for (const value of emitted) {
      expect(JSON.stringify(value)).not.toContain('amountBeingUsed');
      expect(Object.keys(value as object)).not.toContain('amount');
    }
  });
});

describe('inline — an existing setup', () => {
  const SAVED = {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: 20_000, authored: { amount: 20, unit: 'mg' as const } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg' as const,
    preferredEntryMode: 'mass' as const,
    active: true,
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  };

  it('prefills the vial and leaves the amount blank', async () => {
    const tree = await mount(<SetupForm initial={SAVED} onChange={() => undefined} />);

    const amountField = tree.root
      .findAllByType(TextInput)
      .find((node) => /^Amount,/.test(String(node.props.accessibilityLabel ?? '')));
    expect(amountField?.props.value).toBe('');
    expect(screen(tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
  });

  it('calculates from the saved vial once an amount is typed', async () => {
    const tree = await mount(<SetupForm initial={SAVED} onChange={() => undefined} />);
    await type(tree, /^Amount,/, '2');

    expect(screen(tree)).toContain('20 units');
  });
});

describe('the founder’s pinned cases, through the UI', () => {
  const CASES: Array<[string, string, string, string, string]> = [
    ['20 mg / 2 mL / 2 mg', '20', '2', '2', '20 units'],
    ['10 mg / 1 mL / 2 mg', '10', '1', '2', '20 units'],
    ['10 mg / 2 mL / 2 mg', '10', '2', '2', '40 units'],
  ];

  for (const [label, vial, water, amount, expected] of CASES) {
    it(label, async () => {
      const tree = await mount(<SetupForm onChange={() => undefined} />);
      await type(tree, /^Vial amount/, vial);
      await type(tree, /reconstitution volume/i, water);
      await type(tree, /^Amount,/, amount);
      expect(screen(tree)).toContain(expected);
    });
  }

  it('5 mg / 2 mL / 500 mcg → 20 units', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    await type(tree, /^Vial amount/, '5');
    await type(tree, /reconstitution volume/i, '2');
    await selectUnit(tree, 'Amount unit', 'mcg');
    await type(tree, /^Amount,/, '500');
    expect(screen(tree)).toContain('20 units');
  });

  it('10 mg / 1 mL / 250 mcg → 2.5 units', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /reconstitution volume/i, '1');
    await selectUnit(tree, 'Amount unit', 'mcg');
    await type(tree, /^Amount,/, '250');
    expect(screen(tree)).toContain('2.5 units');
  });
});

describe('standalone tool', () => {
  it('starts completely blank', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);

    for (const field of tree.root.findAllByType(TextInput)) {
      expect(field.props.value).toBe('');
    }
    expect(screen(tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
  });

  it('calculates 20 mg / 2 mL / 2 mg → 20 units with no peptide involved', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');

    const rendered = screen(tree);
    expect(rendered).toContain('20 units');
    expect(rendered).toContain('Equivalent volume · 0.2 mL');
    expect(rendered).toContain('Concentration · 10 mg/mL');
  });

  it('5 mg / 2 mL / 500 mcg → 20 units', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);

    await type(tree, /^Vial amount/, '5');
    await type(tree, /reconstitution volume/i, '2');
    await selectUnit(tree, 'Amount unit', 'mcg');
    await type(tree, /^Amount,/, '500');

    expect(screen(tree)).toContain('20 units');
  });

  it('recomputes live as inputs change', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);

    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');

    await type(tree, /reconstitution volume/i, '4');
    expect(screen(tree)).toContain('40 units');
    expect(screen(tree)).toContain('5 mg/mL');
  });

  it('needs no catalog, definition or setup to work', async () => {
    // Rendered with no PeptideProvider at all — proving it depends on none of
    // the tracking machinery. It would throw on mount if it did.
    const tree = await mount(<StandalonePeptideCalculator />);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /reconstitution volume/i, '1');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');
  });
});

describe('validation, on both surfaces', () => {
  const surfaces: Array<[string, () => Promise<ReactTestRenderer>]> = [
    ['inline', () => mount(<SetupForm onChange={() => undefined} />)],
    ['standalone', () => mount(<StandalonePeptideCalculator />)],
  ];

  for (const [name, render] of surfaces) {
    describe(name, () => {
      async function ready() {
        const tree = await render();
        await type(tree, /^Vial amount/, '10');
        await type(tree, /reconstitution volume/i, '1');
        return tree;
      }

      it('says nothing while the amount is blank', async () => {
        const tree = await ready();
        expect(screen(tree)).not.toContain('Amount must be greater than zero.');
        expect(screen(tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
      });

      it('names a zero amount', async () => {
        const tree = await ready();
        await type(tree, /^Amount,/, '0');
        expect(screen(tree)).toContain('Amount must be greater than zero.');
      });

      it('recovers immediately from an invalid amount', async () => {
        const tree = await ready();
        await type(tree, /^Amount,/, 'abc');
        expect(screen(tree)).toContain('Amount must be greater than zero.');

        await type(tree, /^Amount,/, '2');
        expect(screen(tree)).toContain('20 units');
        expect(screen(tree)).not.toContain('Amount must be greater than zero.');
      });

      it('never renders NaN or Infinity', async () => {
        const tree = await ready();
        for (const junk of ['abc', '-', '--', '1e', 'Infinity', '.', '']) {
          await type(tree, /^Amount,/, junk);
          expect(screen(tree)).not.toContain('NaN');
          expect(screen(tree)).not.toContain('Infinity');
        }
      });

      it('accepts decimals', async () => {
        const tree = await ready();
        await type(tree, /^Amount,/, '1.25');
        expect(screen(tree)).toContain('12.5 units');
      });

      it('notes an amount larger than the vial, and still calculates it', async () => {
        const tree = await ready();
        await type(tree, /^Amount,/, '12');

        const rendered = screen(tree);
        expect(rendered).toContain('120 units');
        expect(rendered).toContain('1.2 mL');
        expect(rendered).toContain('greater than the total vial amount entered');
        for (const advice of ['split', 'two injections', 'maximum', 'too much']) {
          expect(rendered.toLowerCase()).not.toContain(advice);
        }
      });

      it('offers no recommendation language', async () => {
        const tree = await ready();
        await type(tree, /^Amount,/, '2');
        const rendered = screen(tree)
          .toLowerCase()
          // The setup form's own disclaimer — "a display preference, not a
          // recommended amount" — is the opposite of a recommendation, and
          // predates this slice. Removed so it cannot mask a real one.
          .replace('a display preference, not a recommended amount.', '');
        for (const phrase of ['recommended', 'suggested', 'ideal', 'typical dose', 'starting dose', 'protocol']) {
          expect(rendered).not.toContain(phrase);
        }
      });
    });
  }
});

describe('switching mg ⇄ mcg restates the same amount', () => {
  /**
   * The most dangerous thing this screen could do is reinterpret a number
   * when its unit changes — turning `2 mg` into `2 mcg` would silently move
   * the amount by a factor of a thousand while the digits sat still. So the
   * value is converted and the answer must not budge.
   */
  async function ready() {
    const tree = await mount(<StandalonePeptideCalculator />);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /reconstitution volume/i, '1');
    return tree;
  }

  function amountValue(tree: ReactTestRenderer) {
    return tree.root
      .findAllByType(TextInput)
      .find((node) => /^Amount,/.test(String(node.props.accessibilityLabel ?? '')))?.props.value;
  }

  it('2 mg becomes 2000 mcg, and the result is unchanged', async () => {
    const tree = await ready();
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');

    await selectUnit(tree, 'Amount unit', 'mcg');
    expect(amountValue(tree)).toBe('2000');
    expect(screen(tree)).toContain('20 units');
  });

  it('round-trips back to 2 mg with the result still unchanged', async () => {
    const tree = await ready();
    await type(tree, /^Amount,/, '2');
    await selectUnit(tree, 'Amount unit', 'mcg');
    await selectUnit(tree, 'Amount unit', 'mg');

    expect(amountValue(tree)).toBe('2');
    expect(screen(tree)).toContain('20 units');
  });

  it('500 mcg becomes 0.5 mg', async () => {
    const tree = await ready();
    await selectUnit(tree, 'Amount unit', 'mcg');
    await type(tree, /^Amount,/, '500');
    expect(screen(tree)).toContain('5 units');

    await selectUnit(tree, 'Amount unit', 'mg');
    expect(amountValue(tree)).toBe('0.5');
    expect(screen(tree)).toContain('5 units');
  });

  it('leaves a blank field blank rather than writing a number into it', async () => {
    const tree = await ready();
    await selectUnit(tree, 'Amount unit', 'mcg');
    expect(amountValue(tree)).toBe('');
  });

  it('leaves half-typed text alone', async () => {
    const tree = await ready();
    await type(tree, /^Amount,/, '1.');
    await selectUnit(tree, 'Amount unit', 'mcg');
    // Converting mid-number would destroy what the user was writing.
    expect(amountValue(tree)).toBe('1.');
  });

  it('does not follow the setup’s Preferred unit once shown', async () => {
    // Preferred unit seeds the calculator and nothing more — otherwise
    // changing it lower down the form would reinterpret a typed amount.
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    await type(tree, /^Vial amount/, '10');
    await type(tree, /reconstitution volume/i, '1');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');

    await selectUnit(tree, 'Preferred unit', 'mcg');
    expect(screen(tree)).toContain('20 units');
  });
});

describe('clearing the amount', () => {
  it('clears the result and recovers on re-entry, with no reload', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);
    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');

    await type(tree, /^Amount,/, '');
    expect(screen(tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
    expect(screen(tree)).not.toContain('Amount must be greater than zero.');

    await type(tree, /^Amount,/, '2');
    expect(screen(tree)).toContain('20 units');
  });
});

describe('syringe units are the only output', () => {
  it('never shows the amount converted into mcg as a second result', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);
    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');

    const rendered = screen(tree);
    expect(rendered).toContain('20 units');
    // The canonical micrograms stay inside the domain. 2 mg is 2000 mcg, and
    // that number must not surface anywhere as an output. ("mcg" itself is
    // legitimately on screen — it is one half of the input unit selector.)
    expect(rendered).not.toContain('2000');
    expect(rendered).not.toContain('mcg/mL');
    expect(rendered).not.toMatch(/=\s*\d+\s*mcg/);
  });

  it('offers no reverse units-to-mass conversion in the UI', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);
    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');

    const rendered = screen(tree).toLowerCase();
    for (const phrase of ['1 unit =', 'per unit', 'units to', 'reverse']) {
      expect(rendered).not.toContain(phrase);
    }
  });

  it('shows one large number and supporting lines, not competing results', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);
    await type(tree, /^Vial amount/, '20');
    await type(tree, /reconstitution volume/i, '2');
    await type(tree, /^Amount,/, '2');

    const rendered = screen(tree);
    expect(rendered).toContain('20 units');
    expect(rendered).toContain('Equivalent volume · 0.2 mL');
    expect(rendered).toContain('Concentration · 10 mg/mL');
    expect(rendered).toContain('Using U-100 · 100 units/mL');
  });
});

describe('numeric keyboard', () => {
  it('gives every numeric field a decimal pad and the Done accessory', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);

    const numeric = tree.root
      .findAllByType(TextInput)
      .filter((node) => node.props.keyboardType === 'decimal-pad');

    // Vial, reconstitution, amount.
    expect(numeric).toHaveLength(3);
    for (const field of numeric) {
      expect(field.props.inputAccessoryViewID).toBe('vita-numeric-done');
    }
  });

  it('wires the accessory on the setup form too', async () => {
    const tree = await mount(<SetupForm onChange={() => undefined} />);
    const numeric = tree.root
      .findAllByType(TextInput)
      .filter((node) => node.props.keyboardType === 'decimal-pad');

    expect(numeric.length).toBeGreaterThanOrEqual(3);
    for (const field of numeric) {
      expect(field.props.inputAccessoryViewID).toBe('vita-numeric-done');
    }
  });

  it('renders a Done control that dismisses the keyboard', async () => {
    const tree = await mount(<StandalonePeptideCalculator />);
    const done = control(tree, 'Done');
    expect(done).toBeDefined();

    const { Keyboard } = require('react-native');
    const dismiss = jest.spyOn(Keyboard, 'dismiss');
    await act(async () => done!.props.onPress());
    expect(dismiss).toHaveBeenCalled();
    dismiss.mockRestore();
  });
});

describe('Tools destination', () => {
  it('lists the peptide calculator and opens it', async () => {
    const tree = await mount(<Tools />);

    expect(screen(tree)).toContain('Peptide Calculator');
    expect(screen(tree)).toContain('Convert vial and water into syringe units');

    await press(tree, 'Peptide Calculator');
    expect(mockPush).toHaveBeenCalledWith('/settings/tools/peptide-calculator');
  });

  it('has no dead placeholder rows', async () => {
    const tree = await mount(<Tools />);
    const rows = tree.root.findAll(
      (node) => typeof node.props?.onPress === 'function' && node.props?.accessibilityRole === 'button',
    );
    // Only the calculator row is actionable; nothing is listed that goes nowhere.
    expect(rows.length).toBeGreaterThan(0);
    expect(screen(tree)).not.toContain('Coming soon');
  });
});
