/**
 * The calculator screen, end to end through a real render.
 *
 * The arithmetic is proven in `lib/peptides/__tests__/dose.test.ts`. What is
 * proven here is everything between the maths and the user: that the screen
 * reads the saved setup instead of inventing inputs, that it refuses rather
 * than guesses when the setup is incomplete, that editing the setup changes
 * the answer, and that using it writes nothing.
 *
 * This matters more than usual because the whole screen is unreachable in the
 * simulator — it needs taps to enter an amount, and taps are unavailable.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// `mock`-prefixed so Babel allows the hoisted factory to close over these.
const mockPush = jest.fn();
let mockRouteId = '';
jest.mock('expo-router', () => ({
  // Wrapped rather than passed directly: `jest.mock` is hoisted above the
  // `const` above, so the factory would otherwise capture it while undefined.
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: () => undefined,
  },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import DoseCalculator from '../../../app/(vita)/peptides/setup/[id]/calculator';
import type { PeptideRepository } from '../../../lib/peptides/data/PeptideRepository';
import { PeptideProvider, toMcg, type PeptideSetup } from '../../../lib/peptides';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const NOW = '2026-08-24T10:00:00.000Z';

/** A setup with the founder's reference vial: 10 mg in 1 mL. */
function setupFixture(overrides: Partial<PeptideSetup> = {}): PeptideSetup {
  return {
    id: 'setup-1',
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(10, 'mg'), authored: { amount: 10, unit: 'mg' } },
    reconstitutionMl: 1,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    active: true,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

/** In-memory repository — the same injectable seam the provider tests use. */
function repositoryWith(setups: PeptideSetup[]) {
  const writes: string[] = [];
  const repository: PeptideRepository = {
    async getSetups() {
      return [...setups];
    },
    async saveSetups(next) {
      writes.push(`setups:${next.length}`);
      setups = [...next];
    },
    async getCustomDefinitions() {
      return [];
    },
    async saveCustomDefinitions() {
      writes.push('definitions');
    },
  };
  return { repository, writes };
}

let mounted: ReactTestRenderer | null = null;

async function render(
  setups: PeptideSetup[],
  setupId = 'setup-1',
): Promise<{ tree: ReactTestRenderer; writes: string[] }> {
  const { repository, writes } = repositoryWith(setups);
  mockRouteId = encodeURIComponent(setupId);
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <PeptideProvider repository={repository}>
            <DoseCalculator />
          </PeptideProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return { tree: mounted!, writes };
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  mockPush.mockClear();
  if (tree) await act(async () => tree.unmount());
});

/**
 * What each `Text` node actually renders, as one string per node.
 *
 * Interpolated content arrives as several children (`'Equivalent to '`, then
 * `'0.2 mL'`), and numbers arrive as numbers — so children are concatenated
 * within a node rather than flattened across the tree, which is what the
 * reader sees on the line.
 */
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

/** Types into the amount field the way a user would. */
async function enterAmount(tree: ReactTestRenderer, value: string) {
  const input = tree.root.findAllByType(TextInput)[0];
  await act(async () => input.props.onChangeText(value));
}

/**
 * Finds a pressable by the text rendered inside it.
 *
 * By descendant `Text` rather than by serialising `props.children` — React
 * elements hold circular references (a context object points back at its own
 * Provider), so `JSON.stringify` throws on them.
 */
function control(tree: ReactTestRenderer, label: string) {
  return tree.root
    // Any pressable, not only ones declaring `accessibilityRole="button"` —
    // the shared `Button` does not set that role (a pre-existing app-wide gap,
    // out of this slice's boundary), while `SegmentedTabs` does.
    .findAll((node) => typeof node.props?.onPress === 'function')
    .find((node) =>
      node
        .findAllByType(Text)
        .some((text) => texts({ root: text } as ReactTestRenderer).join('').trim() === label),
    );
}

/** Presses the mg / mcg segment. */
async function selectUnit(tree: ReactTestRenderer, unit: string) {
  const segment = control(tree, unit);
  if (!segment) throw new Error(`no "${unit}" control on screen`);
  await act(async () => segment.props.onPress());
}

describe('the founder’s worked examples, through the screen', () => {
  it('10 mg vial, 1 mL water, 2 mg → 20 units', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '2');

    expect(screen(tree)).toContain('20 units');
    expect(screen(tree)).toContain('Equivalent to 0.2 mL');
  });

  it('shows the working, not just the answer', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '2');

    expect(screen(tree)).toContain('10 mg/mL · 2 mg = 0.2 mL = 20 units');
  });

  it('10 mg vial, 2 mL water, 2 mg → 40 units', async () => {
    const { tree } = await render([setupFixture({ reconstitutionMl: 2 })]);
    await enterAmount(tree, '2');

    expect(screen(tree)).toContain('40 units');
  });

  it('an mcg-authored vial: 5000 mcg, 2 mL, 500 mcg → 20 units', async () => {
    const { tree } = await render([
      setupFixture({
        vial: { amountMcg: 5000, authored: { amount: 5000, unit: 'mcg' } },
        reconstitutionMl: 2,
        preferredDoseUnit: 'mcg',
      }),
    ]);
    await enterAmount(tree, '500');

    expect(screen(tree)).toContain('20 units');
  });

  it('a decimal amount: 250 mcg → 2.5 units', async () => {
    const { tree } = await render([setupFixture({ preferredDoseUnit: 'mcg' })]);
    await enterAmount(tree, '250');

    expect(screen(tree)).toContain('2.5 units');
  });

  it('recalculates when the unit is switched', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '2');
    expect(screen(tree)).toContain('20 units');

    // The same "2" now means 2 mcg, not 2 mg.
    await selectUnit(tree, 'mcg');
    expect(screen(tree)).not.toContain('20 units');
    expect(screen(tree)).toContain('0 units');
  });
});

describe('setup integration', () => {
  it('prefills the vial and water from the saved setup', async () => {
    const { tree } = await render([setupFixture()]);
    const rendered = screen(tree);

    expect(rendered).toContain('10 mg');
    expect(rendered).toContain('1 mL');
    expect(rendered).toContain('10 mg/mL');
  });

  it('shows the U-100 scale as context', async () => {
    const { tree } = await render([setupFixture()]);
    expect(screen(tree)).toContain('U-100 · 100 units/mL');
  });

  it('names the tracked compound, honouring a display name', async () => {
    const { tree } = await render([setupFixture({ displayName: 'My second vial' })]);
    expect(texts(tree)).toContain('My second vial');
    expect(texts(tree)).toContain('Dose / Unit Calculator');
  });

  it('derives from current setup state rather than a cached concentration', async () => {
    // The same setup id, re-rendered after its water volume changed.
    const first = await render([setupFixture()]);
    await enterAmount(first.tree, '2');
    expect(screen(first.tree)).toContain('20 units');
    await act(async () => first.tree.unmount());
    mounted = null;

    const second = await render([setupFixture({ reconstitutionMl: 2 })]);
    await enterAmount(second.tree, '2');
    expect(screen(second.tree)).toContain('40 units');
    expect(screen(second.tree)).toContain('5 mg/mL');
  });

  it('defaults the amount unit to the setup’s preference', async () => {
    const { tree } = await render([setupFixture({ preferredDoseUnit: 'mcg' })]);
    const input = tree.root.findAllByType(TextInput)[0];
    expect(input.props.accessibilityLabel).toBe('Amount being used, in mcg');
  });
});

describe('incomplete setups are refused, never guessed', () => {
  it('asks for a vial amount rather than assuming one', async () => {
    const { tree } = await render([setupFixture({ vial: undefined })]);
    const rendered = screen(tree);

    expect(rendered).toContain('Add your vial amount and reconstitution volume to use the calculator.');
    // Critically: no fabricated 10 mg / 1 mL default anywhere.
    expect(rendered).not.toContain('units');
    expect(rendered).not.toContain('mg/mL');
  });

  it('asks for a reconstitution volume rather than assuming one', async () => {
    const { tree } = await render([setupFixture({ reconstitutionMl: undefined })]);
    expect(screen(tree)).toContain('Add your vial amount and reconstitution volume');
    expect(screen(tree)).not.toContain('mg/mL');
  });

  it('offers a way to fix it', async () => {
    const { tree } = await render([setupFixture({ vial: undefined })]);
    const button = control(tree, 'Edit setup');
    if (!button) throw new Error('no "Edit setup" control on screen');
    await act(async () => button.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/peptides/setup/setup-1');
  });

  it('renders an empty state for a setup that no longer exists', async () => {
    const { tree } = await render([], 'setup-missing');
    expect(screen(tree)).toContain('no longer available');
  });
});

describe('invalid input never produces a number', () => {
  it('shows nothing at all before an amount is entered', async () => {
    const { tree } = await render([setupFixture()]);
    const rendered = screen(tree);

    expect(rendered).not.toContain('CALCULATED SYRINGE AMOUNT');
    // And no placeholder amount was invented on the user's behalf.
    const input = tree.root.findAllByType(TextInput)[0];
    expect(input.props.value).toBe('');
  });

  it('rejects zero with a neutral message', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '0');

    expect(screen(tree)).toContain('Enter an amount greater than zero.');
    expect(screen(tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
  });

  it('rejects a negative amount', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '-2');
    expect(screen(tree)).toContain('Enter an amount greater than zero.');
  });

  it('never leaks NaN or Infinity to the screen', async () => {
    const { tree } = await render([setupFixture()]);
    for (const junk of ['abc', '--', '1e', 'Infinity', '']) {
      await enterAmount(tree, junk);
      const rendered = screen(tree);
      expect(rendered).not.toContain('NaN');
      expect(rendered).not.toContain('Infinity');
    }
  });

  it('clears back to an empty state when the field is emptied', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '2');
    expect(screen(tree)).toContain('20 units');

    await enterAmount(tree, '');
    expect(screen(tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
    // An emptied field is not an error — it is where the user started.
    expect(screen(tree)).not.toContain('Enter an amount greater than zero.');
  });
});

describe('data-consistency notes', () => {
  it('mentions an amount larger than the vial without judging it', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '12');

    const rendered = screen(tree);
    expect(rendered).toContain('greater than the total vial amount saved in your setup');
    // Still calculated, not blocked.
    expect(rendered).toContain('120 units');
    expect(rendered).toContain('1.2 mL');
  });

  it('says nothing about how to administer a result over 100 units', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '12');

    const rendered = screen(tree).toLowerCase();
    for (const phrase of ['split', 'two injections', 'divide the dose', 'too much', 'maximum']) {
      expect(rendered).not.toContain(phrase);
    }
  });
});

describe('the calculator persists nothing', () => {
  it('writes no setups and no log entries while converting', async () => {
    const { tree, writes } = await render([setupFixture()]);

    await enterAmount(tree, '2');
    await selectUnit(tree, 'mcg');
    await enterAmount(tree, '500');

    expect(writes).toEqual([]);
  });

  it('forgets the amount when the screen goes away', async () => {
    const first = await render([setupFixture()]);
    await enterAmount(first.tree, '2');
    expect(screen(first.tree)).toContain('20 units');
    await act(async () => first.tree.unmount());
    mounted = null;

    const second = await render([setupFixture()]);
    const input = second.tree.root.findAllByType(TextInput)[0];
    expect(input.props.value).toBe('');
    expect(screen(second.tree)).not.toContain('CALCULATED SYRINGE AMOUNT');
  });
});

describe('no recommendation language', () => {
  it('never suggests, recommends, or names a dose for the user', async () => {
    const { tree } = await render([setupFixture()]);
    await enterAmount(tree, '2');

    const rendered = screen(tree).toLowerCase();
    for (const phrase of [
      'recommended',
      'suggested',
      'ideal',
      'typical dose',
      'starting dose',
      'target dose',
      'protocol',
      'take this amount',
      'you should',
      'safe',
      'optimal',
    ]) {
      expect(rendered).not.toContain(phrase);
    }
  });

  it('uses the approved label for the amount field', async () => {
    const { tree } = await render([setupFixture()]);
    // `SectionHeader` uppercases its title on screen.
    expect(texts(tree)).toContain('AMOUNT BEING USED');
  });

  it('does not offer a syringe capacity anywhere', async () => {
    const { tree } = await render([setupFixture()]);
    const rendered = screen(tree);

    // Capacity is a different property from graduation density; 3.5B removed
    // this control and it must not come back in the calculator.
    for (const capacity of ['0.3 mL syringe', '0.5 mL syringe', '1 mL syringe', '30-unit', '50-unit', '100-unit']) {
      expect(rendered).not.toContain(capacity);
    }
    expect(rendered).toContain('U-100');
  });
});
