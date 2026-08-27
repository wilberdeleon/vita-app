/**
 * The setup form's lower half.
 *
 * Schedule, start date, notes, and the save controls sit below the fold on a
 * scrolling screen, and the simulator cannot be scrolled without taps — so
 * this is where they are actually verified rather than by screenshot. Rendered
 * with the `react-test-renderer` `jest-expo` already ships.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { createPeptideSetup, vialFrom, type PeptideSetup } from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { SetupForm, type SetupFormValue } from '../components/SetupForm';

let latest: { value: SetupFormValue; isValid: boolean } | null = null;
let mounted: ReactTestRenderer | null = null;

async function render(initial?: PeptideSetup): Promise<ReactTestRenderer> {
  latest = null;
  await act(async () => {
    mounted = create(
      <ThemeProvider>
        <SetupForm
          initial={initial}
          onChange={(value, isValid) => {
            latest = { value, isValid };
          }}
        />
      </ThemeProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
});

/** Every string the form renders, flattened. */
function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).flatMap((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.filter((child): child is string => typeof child === 'string');
  });
}

/**
 * A tappable node by the name a screen reader would announce.
 *
 * React Native composes a pressable's label from its child text when no
 * explicit `accessibilityLabel` is set, which is how the segmented control and
 * most chips get their names — so this matches either. The weekday chips *do*
 * carry an explicit label, because "Mon" alone is poor to hear.
 */
function control(tree: ReactTestRenderer, label: string) {
  return tree.root.find((node) => {
    if (node.props?.accessibilityRole !== 'button') return false;
    if (typeof node.props?.onPress !== 'function') return false;
    if (node.props.accessibilityLabel === label) return true;
    if (node.props.accessibilityLabel !== undefined) return false;
    return node
      .findAllByType(Text)
      .flatMap((text) =>
        (Array.isArray(text.props.children) ? text.props.children : [text.props.children]).filter(
          (child: unknown): child is string => typeof child === 'string',
        ),
      )
      .join(' ')
      .trim() === label;
  });
}

/** A text input by its accessible name. */
function field(tree: ReactTestRenderer, label: string) {
  return tree.root.find(
    (node) => node.props?.accessibilityLabel === label && typeof node.props?.onChangeText === 'function',
  );
}

async function type(tree: ReactTestRenderer, label: string, text: string) {
  await act(async () => {
    field(tree, label).props.onChangeText(text);
  });
}

describe('schedule', () => {
  it('offers the four supported kinds and none of them say "due"', async () => {
    const tree = await render();
    const rendered = texts(tree);

    // User-facing wording since slice 3.5A: "Days" and "Every N" were
    // programmer language that had leaked onto the screen.
    for (const option of ['Daily', 'Selected days', 'Every X days', 'As needed']) {
      expect(rendered).toContain(option);
    }
    expect(rendered.join(' ').toLowerCase()).not.toContain('due');
  });

  it('starts with no schedule, which is a valid setup', async () => {
    const tree = await render();
    await type(tree, 'Notes, optional', 'touch the form');
    expect(latest?.value.schedule).toBeUndefined();
    expect(latest?.isValid).toBe(true);
  });

  it('emits a daily schedule when Daily is chosen', async () => {
    const tree = await render();
    await act(async () => {
      control(tree, 'Daily').props.onPress();
    });
    expect(latest?.value.schedule).toEqual({ kind: 'daily' });
  });

  it('shows weekday chips only after Days is chosen, with spoken full names', async () => {
    const tree = await render();
    expect(texts(tree)).not.toContain('Mon');

    await act(async () => {
      control(tree, 'Selected days').props.onPress();
    });

    expect(texts(tree)).toContain('Mon');
    // "M"/"Mon" is fine to read and poor to hear.
    expect(control(tree, 'Monday')).toBeDefined();
    expect(control(tree, 'Saturday')).toBeDefined();
  });

  it('emits chosen weekdays in week order regardless of tap order', async () => {
    const tree = await render();
    await act(async () => {
      control(tree, 'Selected days').props.onPress();
    });
    await act(async () => {
      control(tree, 'Friday').props.onPress();
    });
    await act(async () => {
      control(tree, 'Monday').props.onPress();
    });

    expect(latest?.value.schedule).toEqual({ kind: 'daysOfWeek', days: [1, 5] });
  });

  it('treats "Selected days" with nothing chosen as no schedule rather than an empty set', async () => {
    const tree = await render();
    await act(async () => {
      control(tree, 'Selected days').props.onPress();
    });
    expect(latest?.value.schedule).toBeUndefined();
  });

  it('seeds from an existing schedule', async () => {
    const setup = createPeptideSetup('catalog:bpc-157', {
      schedule: { kind: 'daysOfWeek', days: [2, 4] },
    });
    const tree = await render(setup);

    // The day chips are already visible, and the chosen ones are selected.
    expect(control(tree, 'Tuesday').props.accessibilityState.selected).toBe(true);
    expect(control(tree, 'Thursday').props.accessibilityState.selected).toBe(true);
    expect(control(tree, 'Monday').props.accessibilityState.selected).toBe(false);
  });
});

describe('start date', () => {
  it('accepts a real date', async () => {
    const tree = await render();
    await type(tree, 'Start date, optional, year dash month dash day', '2026-08-23');
    expect(latest?.isValid).toBe(true);
    expect(latest?.value.startDate).toBe('2026-08-23');
  });

  it('rejects an impossible calendar date rather than storing it', async () => {
    const tree = await render();
    await type(tree, 'Start date, optional, year dash month dash day', '2026-02-30');

    expect(latest?.isValid).toBe(false);
    expect(latest?.value.startDate).toBeUndefined();
    expect(texts(tree)).toContain('Use a real date in YYYY-MM-DD form.');
  });

  it('rejects a malformed date', async () => {
    const tree = await render();
    await type(tree, 'Start date, optional, year dash month dash day', 'yesterday');
    expect(latest?.isValid).toBe(false);
  });

  it('treats an empty start date as valid — it is optional', async () => {
    const tree = await render();
    await type(tree, 'Start date, optional, year dash month dash day', '');
    expect(latest?.isValid).toBe(true);
    expect(latest?.value.startDate).toBeUndefined();
  });

  it('fills today from the shortcut', async () => {
    const tree = await render();
    await act(async () => {
      control(tree, 'Today').props.onPress();
    });
    expect(latest?.value.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(latest?.isValid).toBe(true);
  });
});

describe('vial', () => {
  it('emits both representations of the amount', async () => {
    const tree = await render();
    await type(tree, 'Vial amount in milligrams, optional', '10');

    expect(latest?.value.vial?.amountMcg).toBe(10000);
    expect(latest?.value.vial?.authored).toEqual({ amount: 10, unit: 'mg' });
  });

  /**
   * A half-typed optional field invalidates the form rather than being
   * silently dropped — saving "10" as no vial at all because the user hadn't
   * finished typing would lose data they believe they entered.
   */
  it('is invalid while a partially typed amount cannot be parsed', async () => {
    const tree = await render();
    await type(tree, 'Vial amount in milligrams, optional', '-');

    expect(latest?.isValid).toBe(false);
    expect(texts(tree)).toContain('Enter a number greater than zero.');
  });

  it('is valid again once the field is cleared', async () => {
    const tree = await render();
    await type(tree, 'Vial amount in milligrams, optional', 'abc');
    expect(latest?.isValid).toBe(false);

    await type(tree, 'Vial amount in milligrams, optional', '');
    expect(latest?.isValid).toBe(true);
    expect(latest?.value.vial).toBeUndefined();
  });

  it('seeds from an existing setup', async () => {
    const setup = createPeptideSetup('catalog:bpc-157', {
      vial: vialFrom({ amount: 5, unit: 'mg' }),
      reconstitutionMl: 2,
    });
    const tree = await render(setup);

    expect(field(tree, 'Vial amount in milligrams, optional').props.value).toBe('5');
    expect(field(tree, 'Reconstitution volume in millilitres, optional').props.value).toBe('2');
  });

  it('shows a vial authored in mcg at a legible milligram scale', async () => {
    // Slice 3.9A: the vial field is milligrams only. A setup saved as
    // 5000 mcg must read as 5, not as 5000 — which on the next save would
    // silently become a five-gram vial and put every syringe number out by a
    // factor of a thousand.
    const setup = createPeptideSetup('catalog:bpc-157', {
      vial: vialFrom({ amount: 5000, unit: 'mcg' }),
    });
    const tree = await render(setup);

    expect(field(tree, 'Vial amount in milligrams, optional').props.value).toBe('5');
  });

  it('offers no vial unit toggle at all', async () => {
    // The wrong answer was catastrophic and invisible, so the question is
    // gone rather than defaulted.
    const tree = await render();
    expect(texts(tree)).toContain('Vial Amount (MG)');
    expect(
      tree.root.findAll((node) => node.props?.accessibilityLabel === 'Vial unit'),
    ).toHaveLength(0);
  });
});

describe('framing', () => {
  it('says the preferred unit is a display preference, not a recommendation', async () => {
    const tree = await render();
    expect(texts(tree).join(' ')).toContain('not a recommended amount');
  });

  /**
   * Founder decision, slice 3.5B: people were being asked to choose between
   * U-100, U-50 and U-40 when what they see on the box is a *capacity*
   * (0.3 mL, 0.5 mL, 1 mL), which is a different thing entirely. V1 assumes
   * the ordinary U-100 scale and the calculator will state that assumption
   * beside its result.
   */
  it('no longer asks the user to choose a syringe scale', async () => {
    const tree = await render();
    const rendered = texts(tree).join(' ');
    expect(rendered).not.toContain('U-100');
    expect(rendered).not.toContain('units/mL');
    expect(rendered).not.toContain('SYRINGE');
  });

  it('still records a syringe density on the setup it emits', async () => {
    // The value stays on the model so slice 3.6 has it and another scale can
    // be supported later without a migration.
    const tree = await render();
    await type(tree, 'Notes, optional', 'touch the form');
    expect(latest?.value.syringe?.unitsPerMl).toBe(100);
  });

  it('never asks for a typical, recommended, or standard dose', async () => {
    const tree = await render();
    const rendered = texts(tree).join(' ').toLowerCase();
    for (const word of ['typical dose', 'recommended dose', 'standard dose', 'suggested dose']) {
      expect(rendered).not.toContain(word);
    }
  });
});
