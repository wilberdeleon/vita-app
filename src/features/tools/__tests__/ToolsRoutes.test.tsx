/**
 * Tools & Reference, driven through the screens a person actually uses.
 *
 * Slice 4.2 moved three routes and rewrote one screen. Two things need
 * proving and neither is provable from a helper test: that the destination
 * shows exactly the tools that exist and nothing that does not, and that the
 * migration preserved the two Sprint 3 tools rather than merely relocating
 * their files.
 *
 * The hub navigation assertion that used to live in `UnitConversion.test.tsx`
 * moved here — it was a Tools-destination concern sitting in a suite about
 * dose arithmetic — and is expanded rather than dropped.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    dismissTo: (...args: unknown[]) => mockDismissTo(...args),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import InjectionSites from '../../../app/(vita)/tools/injection-sites';
import PeptideCalculator from '../../../app/(vita)/tools/peptide-calculator';
import ToolsAndReference from '../../../app/(vita)/tools/index';
import BmiCalculator, { BMI_CATEGORY_COLORS, BMI_GOLD } from '../../../app/(vita)/tools/bmi-calculator';
import { Card, IconBadge, ListRow, PressableScale, ToastProvider } from '../../../components/ui';
import {
  DEFAULT_QUICK_TOOLS,
  QUICK_TOOL_REGISTRY,
  isToolHidden,
} from '../../dashboard/quickTools';
import { palette } from '../../../theme/tokens';
import { PeptideProvider } from '../../../lib/peptides';
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
        <ThemeProvider>
          <ToastProvider>
            <PeptideProvider>{element}</PeptideProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  mockBack.mockClear();
  mockPush.mockClear();
  if (tree) await act(async () => tree.unmount());
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children
      .filter((c): c is string | number => typeof c === 'string' || typeof c === 'number')
      .join('');
  });
}

const screen = (tree: ReactTestRenderer) => texts(tree).join(' ');
const rows = (tree: ReactTestRenderer) => tree.root.findAllByType(ListRow).map((node) => node.props);

/**
 * The computed style of a `Card`'s own root view — the surface tokens, not
 * the `style` prop handed in. Read while the tree is mounted: a
 * `ReactTestInstance` reaches into a live fiber and is worthless afterwards.
 */
function cardSurface(tree: ReactTestRenderer): Record<string, unknown> {
  const card = tree.root.findAllByType(Card)[0];
  expect(card).toBeTruthy();
  return { ...(StyleSheet.flatten(card.findAllByType(View)[0].props.style) as object) };
}

function control(tree: ReactTestRenderer, label: string | RegExp) {
  const matches = (value: unknown) =>
    typeof value === 'string' && (typeof label === 'string' ? value === label : label.test(value));

  return tree.root.findAll(
    (node) =>
      typeof node.type !== 'string' &&
      typeof node.props.onPress === 'function' &&
      (matches(node.props.accessibilityLabel) ||
        matches(node.props.title) ||
        (Array.isArray(node.props.children)
          ? node.props.children.some(matches)
          : matches(node.props.children))),
  )[0];
}

/* ── the hub ────────────────────────────────────────────────────────── */

describe('Tools & Reference hub', () => {
  it('is titled for the destination, not for the route', async () => {
    const tree = await mount(<ToolsAndReference />);
    expect(screen(tree)).toContain('Tools & Reference');
    expect(screen(tree)).not.toMatch(/tools\/index|Settings Tools|peptide-calculator/);
  });

  it('lists exactly the tools that exist', async () => {
    const tree = await mount(<ToolsAndReference />);
    expect(rows(tree).map((row) => row.title)).toEqual([
      'Peptide Calculator',
      'Injection Sites',
      'BMI Calculator',
    ]);
  });

  /**
   * The hub's founding rule, carried over from the screen it replaces:
   * nothing is listed before it works. A dead row is worse than a short list.
   */
  it.each([
    ['a food or product scanner', /scan(?!ner\b)[a-z]*\b/i],
    ['the Research Library', /research library/i],
    ['a Coming Soon placeholder', /coming soon|coming later/i],
  ])('advertises no %s', async (_label, pattern) => {
    const tree = await mount(<ToolsAndReference />);
    expect(screen(tree)).not.toMatch(pattern);
  });

  /**
   * BMI was on the forbidden list above until slice 5.9 built it. It is
   * listed now because it exists — and it still has to carry a real
   * destination, which is what kept it off the hub for five slices.
   */
  it('lists BMI only because it is now a real tool with a real route', async () => {
    const tree = await mount(<ToolsAndReference />);
    const row = rows(tree).find((item) => item.title === 'BMI Calculator');
    expect(row).toBeTruthy();
    expect(typeof row!.onPress).toBe('function');
    row!.onPress();
    expect(mockPush).toHaveBeenCalledWith('/tools/bmi-calculator');
  });

  /** No REFERENCE heading until slice 4.5 puts something real under it. */
  it('shows no empty Reference section', async () => {
    const tree = await mount(<ToolsAndReference />);
    const headings = texts(tree).filter((text) => text === text.toUpperCase() && text.trim().length > 0);
    expect(headings).toContain('TOOLS');
    expect(headings).not.toContain('REFERENCE');
  });

  /** The honesty invariant, same as Settings: a chevron implies a destination. */
  it('never draws a chevron on a row that does nothing', async () => {
    const tree = await mount(<ToolsAndReference />);
    for (const row of rows(tree)) {
      if (row.chevron) expect(typeof row.onPress).toBe('function');
    }
  });

  it('describes each tool without recommending anything', async () => {
    const tree = await mount(<ToolsAndReference />);
    const rendered = screen(tree);
    // No dosing, no "next site", no instruction — these are utilities and a
    // reference, and the copy has to read that way.
    expect(rendered).not.toMatch(/should|recommend|next site|rotate|dose your/i);
    // The calculator does arithmetic and the sites screen shows what you
    // recorded. Neither is a planner, and the hub may not imply one.
    expect(rendered).not.toMatch(
      /best site|safest site|suggested|typical dose|dose planner|treatment plan|protocol|titrat/i,
    );
  });

  /**
   * §18. Peptides' empty state carries a professional-guidance note because
   * that screen is where a routine begins. A directory of two utilities is
   * not, and repeating the warning here would be disclaimer clutter rather
   * than safety.
   */
  it('adds no second medical warning of its own', async () => {
    const tree = await mount(<ToolsAndReference />);
    expect(screen(tree)).not.toMatch(/consult|healthcare professional|before you begin|not medical/i);
  });

  it('states what each tool actually does', async () => {
    const tree = await mount(<ToolsAndReference />);
    const subtitles = rows(tree).map((row) => row.subtitle);
    // Repository truth: the calculator converts a vial and a reconstitution
    // volume into U-100 units, and Injection Sites really does hold a body
    // map, the site reference and recorded history.
    expect(subtitles[0]).toBe('Calculate U-100 syringe units from vial and reconstitution values');
    expect(subtitles[1]).toBe('Body map, site reference, and your recorded history');
    // Adult reference, stated as a reference. Not advice, and not a claim
    // that the tool says anything about what anyone should weigh.
    expect(subtitles[2]).toBe('Adult BMI reference from height and weight');
  });

  it('gives every row an accessible name and a hint', async () => {
    const tree = await mount(<ToolsAndReference />);
    for (const row of rows(tree)) {
      expect(row.title).toBeTruthy();
      expect(row.subtitle).toBeTruthy();
      expect(row.accessibilityHint).toBeTruthy();
    }
  });
});

/* ── 5.7C: the hub's identity ───────────────────────────────────────── */

/**
 * What 5.7C changed is presentation, and these pin the parts of it that a
 * later slice could undo without noticing: the grouping, the surface it
 * borrows, where the feature colour is allowed to land, and the agreement
 * with the locked Quick Tools row about what these two tools are called.
 */
describe('Tools Hub identity', () => {
  it('draws one group rather than a card per tool', async () => {
    const tree = await mount(<ToolsAndReference />);
    expect(rows(tree).map((row) => row.variant)).toEqual(['flat', 'flat', 'flat']);
    // One panel holding all of them, not one surface each — the invariant
    // a third tool is most likely to break by arriving in its own card.
    expect(tree.root.findAllByType(Card)).toHaveLength(1);
  });

  /** The panel is the shared card surface, not a hand-rolled lookalike. */
  it("borrows the app's card surface rather than restyling one", async () => {
    const tree = await mount(<ToolsAndReference />);
    const panel = cardSurface(tree);

    const reference = await mount(<Card />);
    const plain = cardSurface(reference);

    for (const key of ['backgroundColor', 'borderRadius', 'borderWidth', 'borderColor']) {
      expect(panel[key]).toBeDefined();
      expect(panel[key]).toEqual(plain[key]);
    }
    // The one deliberate override: the rows' own padding is the rhythm.
    expect(panel.paddingVertical).toBe(0);
  });

  /**
   * The panel already has a top edge. A hairline 12pt under it would be the
   * same line drawn twice, which is why the first row suppresses its rule
   * and every row after it keeps one.
   */
  it("opens the group on the panel's edge, not on a second rule", async () => {
    const tree = await mount(<ToolsAndReference />);
    const [first, ...rest] = rows(tree);
    expect(first.rule).toBe(false);
    for (const row of rest) expect(row.rule).not.toBe(false);
  });

  /**
   * §14/§15. Violet marks the glyph. It may not fill a row — the orb that
   * 5.7B removed from Settings is the same defect at a smaller size, and a
   * tinted row is that defect at a larger one.
   */
  it('spends the accent on the glyph and nowhere else', async () => {
    const tree = await mount(<ToolsAndReference />);
    // Each row carries its own accent — Peptides' violet for the two
    // peptide tools, brand gold for the one that belongs to no feature.
    // What is invariant is *where* the colour is allowed to land.
    const byTitle = Object.fromEntries(rows(tree).map((row) => [row.title, row.iconColor]));
    expect(byTitle['Peptide Calculator']).toBe(palette.peptide);
    expect(byTitle['Injection Sites']).toBe(palette.peptide);
    expect(byTitle['BMI Calculator']).toBe(BMI_GOLD.light);

    // Read the pressable's own style: `ListRow` hands it there, so this is
    // the node that would carry a violet fill if one had been added.
    const pressables = tree.root.findAllByType(PressableScale);
    expect(pressables.length).toBeGreaterThan(0);
    for (const node of pressables) {
      const style = StyleSheet.flatten(node.props.style) as Record<string, unknown> | undefined;
      expect(style).toBeTruthy();
      expect(style?.backgroundColor).toBeUndefined();
    }

    expect(tree.root.findAllByType(IconBadge)).toHaveLength(0);
  });

  /**
   * §14. Identity is shared with Dashboard's locked Quick Tools even though
   * the geometry deliberately is not — a full-screen directory is not a row
   * of tiles. Agreement is asserted rather than achieved by import: features
   * do not import each other, so only a test can hold the two together.
   */
  it.each([
    ['calculator', 'Peptide Calculator'],
    ['sites', 'Injection Sites'],
  ] as const)('calls %s what Quick Tools calls it', async (id, title) => {
    const tree = await mount(<ToolsAndReference />);
    const row = rows(tree).find((item) => item.title === title);
    const canonical = QUICK_TOOL_REGISTRY[id];

    expect(row).toBeTruthy();
    expect(row!.title).toBe(canonical.name);
    expect(row!.icon).toBe(canonical.icon);
    expect(row!.iconColor).toBe(canonical.color);
    expect(row!.accessibilityHint).toBe(canonical.hint);
  });

  /**
   * §25. A row grows with its content. Nothing inside the panel may cap a
   * name or a descriptor at one line — `ScreenHeader`'s own `numberOfLines`
   * is the deferred truncation issue and is outside the panel, so this is
   * scoped to the group rather than to the screen.
   */
  /**
   * §25, and a defect this slice's own device pass found rather than a
   * review. `ListRow variant="flat"` caps its title and descriptor at two
   * lines, which Settings' short strings never reach. Tools' do: at
   * accessibility-extra-large `Calculate U-100 syringe units from vial and
   * reconstitution values` was cut mid-word at `syringe units fro…`. A
   * two-line cap is still the fixed-height row §25 forbids, so these rows
   * opt out of it — and Settings, which the founder approved with the cap,
   * does not.
   */
  it('lets names and descriptors wrap instead of clipping them', async () => {
    const tree = await mount(<ToolsAndReference />);
    for (const row of rows(tree)) expect(row.wrap).toBe(true);

    const panel = tree.root.findAllByType(Card)[0];
    const lines = panel.findAllByType(Text).map((node) => node.props.numberOfLines);
    expect(lines.length).toBeGreaterThan(0);
    // Not "two or more" — any cap at all is a line this copy can reach.
    for (const value of lines) expect(value).toBeUndefined();
  });

  /**
   * The glyph belongs beside the name. Centred in a row that is four lines
   * tall at accessibility sizes it floats between the name and the
   * descriptor, which is what the device showed before `wrap`.
   */
  it('aligns the glyph and the disclosure to the first line', async () => {
    const tree = await mount(<ToolsAndReference />);
    for (const node of tree.root.findAllByType(PressableScale)) {
      const style = StyleSheet.flatten(node.props.style) as Record<string, unknown> | undefined;
      expect(style).toBeTruthy();
      expect(style?.alignItems).toBe('flex-start');
    }
  });
});

/* ── navigation ─────────────────────────────────────────────────────── */

describe('hub navigation', () => {
  it.each([
    ['Peptide Calculator', '/tools/peptide-calculator'],
    ['Injection Sites', '/tools/injection-sites'],
  ])('opens %s at its canonical route', async (label, href) => {
    const tree = await mount(<ToolsAndReference />);
    await act(async () => control(tree, label)!.props.onPress());
    expect(mockPush).toHaveBeenCalledWith(href);
  });

  /**
   * The retired address is gone rather than aliased — no route in the hub
   * may still point into the Settings tree.
   */
  it('never pushes a settings-owned tools route', async () => {
    const tree = await mount(<ToolsAndReference />);
    for (const row of rows(tree)) {
      if (row.onPress) await act(async () => row.onPress());
    }
    for (const call of mockPush.mock.calls) {
      expect(String(call[0])).not.toContain('/settings');
    }
  });

  it('offers a way back and never jumps to another feature', async () => {
    const tree = await mount(<ToolsAndReference />);
    await act(async () => control(tree, 'Back')!.props.onPress());
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

/* ── the migrated tools still work ──────────────────────────────────── */

describe('Peptide Calculator after migration', () => {
  it('renders at its new route with its approved fields intact', async () => {
    const tree = await mount(<PeptideCalculator />);
    const rendered = screen(tree);
    expect(rendered).toContain('Peptide Calculator');
    expect(rendered).toContain('Vial Amount (MG)');
    expect(rendered).toContain('Reconstitution Volume (ML)');
  });

  it('still converts', async () => {
    const tree = await mount(<PeptideCalculator />);
    const fields = tree.root.findAllByType(TextInput);
    await act(async () => fields[0].props.onChangeText('20'));
    await act(async () => fields[1].props.onChangeText('2'));
    expect(screen(tree)).toContain('1 mg = 10 units');
  });

  /** The 3.10A ruling survives the move: the vial is milligrams, full stop. */
  it('offers no vial unit toggle', async () => {
    const tree = await mount(<PeptideCalculator />);
    const toggles = tree.root.findAll(
      (node) => typeof node.props.accessibilityLabel === 'string' && /vial unit/i.test(node.props.accessibilityLabel),
    );
    expect(toggles).toHaveLength(0);
  });

  it('returns to the hub rather than anywhere else', async () => {
    const tree = await mount(<PeptideCalculator />);
    await act(async () => control(tree, 'Back')!.props.onPress());
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  /* ── 5.7D ──────────────────────────────────────────────────────────── */

  /**
   * The screen used to open by telling the user to enter the two values,
   * and then `UnitConversion`'s own empty state told them again four lines
   * below — in the place where the instruction is actually needed. At
   * accessibility-extra-large that paragraph measured **seven lines before
   * the first field**. The intro now carries only the fact nothing else
   * states.
   */
  it('says the instruction once, where it is needed', async () => {
    const tree = await mount(<PeptideCalculator />);
    const rendered = screen(tree);

    expect(rendered).toContain('Nothing here is saved, and no peptide needs to be tracked.');
    // The empty conversion still instructs; the header no longer pre-empts it.
    expect(rendered).toContain('Enter vial amount and reconstitution volume to see the unit');
    expect(rendered).not.toContain('Enter your vial amount and reconstitution volume');
  });

  /**
   * The preview seam is a default, not a feature: a real visit renders the
   * screen empty, exactly as before. If this ever fails, the tool has begun
   * pre-filling numbers VITA chose — which is the §29 trap the whole
   * calculator is built to avoid.
   */
  it('opens empty when nothing is passed to it', async () => {
    const tree = await mount(<PeptideCalculator />);
    const values = tree.root.findAllByType(TextInput).map((node) => node.props.value);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) expect(value).toBe('');
    // And therefore no result of any kind is on screen.
    expect(screen(tree)).not.toMatch(/\d+\s*units/);
  });

  /** §8: arithmetic and nothing else. Neither screen may imply a dose. */
  it('recommends no amount, schedule or verdict', async () => {
    const tree = await mount(<PeptideCalculator initialVialAmount="10" initialReconstitution="2" />);
    const rendered = screen(tree);

    // The canonical example, rendered by the real screen.
    expect(rendered).toContain('1 mg = 20 units');
    expect(rendered).not.toMatch(
      /common dose|typical dose|safe dose|maximum dose|recommended|suggested|how much (you|to)|dose planner|titrat|protocol|frequency/i,
    );
  });

  it('keeps its factual boundary note', async () => {
    const tree = await mount(<PeptideCalculator />);
    expect(screen(tree)).toContain('VITA does not recommend peptides, dosing, or treatment.');
  });
});

describe('Injection Sites after migration', () => {
  it('renders at its new route with the body map and reference intact', async () => {
    const tree = await mount(<InjectionSites />);
    const rendered = screen(tree);
    expect(rendered).toContain('Injection Sites');
    expect(rendered).toContain('Front');
    expect(rendered).toContain('Back');
    // 5.5 disclosed the reference rather than shouting it under a
    // `SectionHeader`; the content is unchanged and one tap away.
    expect(rendered).toContain('Site reference');
    expect(rendered).toContain('All recorded sites');
  });

  /** Still a lens onto history, never a suggestion about where to inject. */
  it('recommends nothing', async () => {
    const tree = await mount(<InjectionSites />);
    expect(screen(tree)).not.toMatch(/next site|recommended|you should|rotate to/i);
  });

  it('returns to the hub rather than anywhere else', async () => {
    const tree = await mount(<InjectionSites />);
    await act(async () => control(tree, 'Back')!.props.onPress());
    expect(mockBack).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

/* ── 5.9: the BMI calculator ────────────────────────────────────────── */

/**
 * The tool, driven the way a person drives it: type, read, switch units,
 * mistype, correct.
 *
 * The domain arithmetic is pinned in `src/lib/bmi/__tests__` — formula,
 * rounding policy, thresholds and conversion all live there. **These are
 * about the screen**: that it shows nothing it has not been told, that a
 * category never contradicts the number beside it, that it keeps its
 * boundaries, and that it saves nothing.
 */

/** Type into a field by its accessible name, the way the user reaches it. */
async function type(tree: ReactTestRenderer, label: string, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => node.props.accessibilityLabel === label);
  expect(field).toBeTruthy();
  await act(async () => field!.props.onChangeText(value));
}

async function enterUs(tree: ReactTestRenderer, feet: string, inches: string, pounds: string) {
  await type(tree, 'Height, feet', feet);
  await type(tree, 'Height, inches', inches);
  await type(tree, 'Weight in pounds', pounds);
}

describe('BMI Calculator — the empty screen', () => {
  it('invents no result before it has been given anything', async () => {
    const tree = await mount(<BmiCalculator />);
    const rendered = screen(tree);
    expect(rendered).toContain('Enter height and weight to calculate BMI.');
    // The fabricated-zero failure, named explicitly: a `0.0` is a number
    // the user did not produce.
    expect(rendered).not.toContain('0.0');
    for (const category of ['Underweight', 'Healthy weight', 'Overweight', 'Obesity']) {
      expect(rendered).not.toContain(category);
    }
  });

  it('shows no error on a screen nobody has typed into yet', async () => {
    const tree = await mount(<BmiCalculator />);
    expect(screen(tree)).not.toMatch(/Enter a number greater than zero|Enter a value from 0/);
  });

  /** Live-derived. A Calculate button would only add a step. */
  it('offers no Calculate button', async () => {
    const tree = await mount(<BmiCalculator />);
    expect(screen(tree)).not.toMatch(/calculate bmi$|^calculate$/i);
    expect(control(tree, /^Calculate$/)).toBeUndefined();
  });

  it('names every field explicitly rather than leaning on placeholders', async () => {
    const tree = await mount(<BmiCalculator />);
    const rendered = screen(tree);
    for (const label of ['Feet', 'Inches', 'Pounds', 'Height', 'Weight']) {
      expect(rendered).toContain(label);
    }
  });
});

describe('BMI Calculator — results', () => {
  it('calculates from US input as the founder will', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    const rendered = screen(tree);
    expect(rendered).toContain('27.4');
    expect(rendered).toContain('BMI category · Overweight');
    expect(rendered).not.toContain('Enter height and weight');
  });

  it('calculates from metric input', async () => {
    const tree = await mount(<BmiCalculator initialSystem="metric" />);
    await type(tree, 'Height in centimetres', '180');
    await type(tree, 'Weight in kilograms', '80');
    expect(screen(tree)).toContain('24.7');
    expect(screen(tree)).toContain('BMI category · Healthy weight');
  });

  /** Blank inches is a real height, not an unfinished one. */
  it('reads an empty inches field as zero rather than refusing to answer', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '6', '', '180');
    expect(screen(tree)).toContain('24.4');
  });

  /**
   * The rounding policy, at the screen. 80.87 kg at 180 cm is a raw
   * 24.9598…, shown as `25.0` — and the category beside it must be the one
   * `25.0` implies, not the one the hidden raw value implies.
   */
  it('never pairs a displayed value with a category that contradicts it', async () => {
    const tree = await mount(<BmiCalculator initialSystem="metric" />);
    await type(tree, 'Height in centimetres', '180');
    await type(tree, 'Weight in kilograms', '80.87');
    const rendered = screen(tree);
    expect(rendered).toContain('25.0');
    expect(rendered).toContain('BMI category · Overweight');
    expect(rendered).not.toContain('Healthy weight');
  });

  /** §36 — one node, one sentence, and the category is spoken. */
  it('announces the value and its category together', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    const announced = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => node.props.accessibilityLabel as string);
    expect(announced).toContain('BMI 27.4, category Overweight');
  });

  /**
   * Nothing on this screen may depend on seeing a colour: the category is
   * always present as words next to the number.
   */
  it('states the category in words, not only in colour', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    expect(screen(tree)).toContain('Overweight');
  });
});

describe('BMI Calculator — invalid input', () => {
  it('rejects twelve inches and withdraws the result rather than leaving a stale one', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    expect(screen(tree)).toContain('27.4');

    await type(tree, 'Height, inches', '12');
    const rendered = screen(tree);
    expect(rendered).toContain('Enter a value from 0 to under 12.');
    // The old answer must not sit there looking as though it still applies.
    expect(rendered).not.toContain('27.4');
    expect(rendered).toContain('Enter height and weight to calculate BMI.');
  });

  it('keeps the sibling fields intact while one is invalid', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    await type(tree, 'Height, inches', '12');

    const values = Object.fromEntries(
      tree.root
        .findAllByType(TextInput)
        .map((node) => [node.props.accessibilityLabel, node.props.value]),
    );
    expect(values['Height, feet']).toBe('5');
    expect(values['Weight in pounds']).toBe('180');
    // And the bad value stays on screen to be corrected, not erased.
    expect(values['Height, inches']).toBe('12');
  });

  it('recovers when the bad field is corrected', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    await type(tree, 'Height, inches', '12');
    await type(tree, 'Height, inches', '8');
    expect(screen(tree)).toContain('27.4');
    expect(screen(tree)).not.toContain('Enter a value from 0 to under 12.');
  });

  it.each(['0', '-5', 'abc'])('refuses %p as a weight without inventing a BMI', async (bad) => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', bad);
    const rendered = screen(tree);
    expect(rendered).toContain('Enter a number greater than zero.');
    expect(rendered).toContain('Enter height and weight to calculate BMI.');
  });
});

describe('BMI Calculator — switching unit systems', () => {
  /** The failure this behaviour exists to prevent: 180 lb becoming 180 kg. */
  it('converts the body rather than relabelling the number', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    await act(async () => control(tree, 'Unit system, Metric')!.props.onPress());

    const values = Object.fromEntries(
      tree.root
        .findAllByType(TextInput)
        .map((node) => [node.props.accessibilityLabel, node.props.value]),
    );
    expect(values['Height in centimetres']).toBe('172.7');
    expect(values['Weight in kilograms']).toBe('81.6');
    expect(values['Weight in kilograms']).not.toBe('180');
  });

  it('keeps the same BMI across the switch', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    expect(screen(tree)).toContain('27.4');
    await act(async () => control(tree, 'Unit system, Metric')!.props.onPress());
    expect(screen(tree)).toContain('27.4');
    expect(screen(tree)).toContain('BMI category · Overweight');
  });

  it('leaves an empty form empty instead of filling it with zeroes', async () => {
    const tree = await mount(<BmiCalculator />);
    await act(async () => control(tree, 'Unit system, Metric')!.props.onPress());
    const values = tree.root.findAllByType(TextInput).map((node) => node.props.value);
    for (const value of values) expect(value).toBe('');
    expect(screen(tree)).toContain('Enter height and weight to calculate BMI.');
  });

  it('is local to the screen and announces its selected state', async () => {
    const tree = await mount(<BmiCalculator />);
    const metric = control(tree, 'Unit system, Metric')!;
    const us = control(tree, 'Unit system, US')!;
    expect(us.props.accessibilityState).toEqual({ selected: true });
    expect(metric.props.accessibilityState).toEqual({ selected: false });
  });
});

describe('BMI Calculator — the product boundary', () => {
  /**
   * §3. The list of things this tool must never say. Each of these would
   * turn a reference measure into a diet app, which is the single failure
   * the founder named when authorizing the slice.
   */
  it.each([
    ['an ideal or target weight', /ideal weight|target weight|goal weight|should weigh/i],
    ['a weight to lose or gain', /lose \d|gain \d|lose about|you need to lose/i],
    ['a target BMI', /target bmi|goal bmi|aim for/i],
    ['calories, TDEE or BMR', /calorie|tdee|bmr|maintenance|deficit|macro/i],
    ['a risk or disease claim', /disease|risk of|at risk|unhealthy/i],
    ['advice', /you should|we recommend|recommended|try to|consider losing/i],
    ['a verdict about the person', /you are (over|under)weight|you are obese/i],
  ])('never offers %s', async (_label, pattern) => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '240');
    expect(screen(tree)).not.toMatch(pattern);
  });

  /**
   * The word *diagnose* appears exactly once and only to deny itself. This
   * is separate from the sweep above because that sweep cannot tell a claim
   * from its negation — and the negation is required copy.
   */
  it('mentions diagnosis only to say it does not do it', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '240');
    const mentions = screen(tree).match(/[^.]*diagnos[^.]*/gi) ?? [];
    expect(mentions).toHaveLength(1);
    expect(mentions[0]).toMatch(/does not .*diagnose/i);
  });

  it('describes the number, never the person', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '240');
    const rendered = screen(tree);
    expect(rendered).toContain('BMI category · Obesity');
    expect(rendered).not.toMatch(/you are|your body is/i);
  });

  it('says what BMI is, once, without becoming a disclaimer page', async () => {
    const tree = await mount(<BmiCalculator />);
    const rendered = screen(tree);
    expect(rendered).toContain('ABOUT BMI');
    expect(rendered).toContain(
      'BMI is a screening measure for adults. It does not measure body fat directly and does not diagnose health.',
    );
    // One note, not a wall. The whole screen's prose stays short.
    expect(rendered).not.toMatch(/consult|disclaimer|liability|medical advice before/i);
  });

  it('frames itself as adult reference', async () => {
    const tree = await mount(<BmiCalculator />);
    expect(screen(tree)).toMatch(/adult/i);
    // No demographic screening crept in.
    expect(screen(tree)).not.toMatch(/age|child|teen|pregnan|ethnic|athlete/i);
  });
});

describe('BMI Calculator — what it does not touch', () => {
  /**
   * §17 / §41. The calculator is a scratch pad. Sprint 6 owns stored height
   * and weight, and the single most likely way this slice could go wrong is
   * by quietly becoming that.
   */
  it('writes nothing to storage, however much it is used', async () => {
    const storage = require('@react-native-async-storage/async-storage');
    const AsyncStorage = storage.default ?? storage;
    AsyncStorage.setItem.mockClear();

    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    await act(async () => control(tree, 'Unit system, Metric')!.props.onPress());
    await type(tree, 'Weight in kilograms', '90');

    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.mergeItem).not.toHaveBeenCalled();
  });

  it('keeps no history of what was calculated', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    // The word "saved" does appear — in "Nothing here is saved", which is
    // the promise rather than a breach of it. What must not appear is an
    // affordance that keeps anything.
    const rendered = screen(tree);
    expect(rendered).toContain('Nothing here is saved.');
    expect(rendered).not.toMatch(/history|recent calculation|saved result|log this|save result/i);
  });

  /**
   * **The decision reversed in 5.9B.1.**
   *
   * 5.9B kept BMI out of the Quick Tools catalog entirely, because adding it
   * would have put a fourth tile on the founder's Home without being asked —
   * `normalizeQuickTools` appended a new tool *visible*. The founder wants
   * BMI offered on Home, so the fix was to the normalization contract rather
   * than to the catalog: BMI is now **available and unselected**.
   *
   * What still must never happen is the thing the old test was protecting:
   * BMI appearing on a Dashboard nobody asked to change. That is pinned in
   * `quickTools.test.ts` against the selection, which is where it belongs.
   */
  it('is offered as a Quick Tool without being selected', () => {
    expect(QUICK_TOOL_REGISTRY.bmi).toBeTruthy();
    expect(isToolHidden(DEFAULT_QUICK_TOOLS, 'bmi')).toBe(true);
  });

  /**
   * One tool, one identity. Features do not import routes, so only a test
   * can hold the hub row and the Quick Tool together — the same guarantee
   * the other three already have.
   */
  it('wears the same name, glyph and route in both places', async () => {
    const tree = await mount(<ToolsAndReference />);
    const row = rows(tree).find((item) => item.title === 'BMI Calculator');
    const canonical = QUICK_TOOL_REGISTRY.bmi;

    expect(row).toBeTruthy();
    expect(row!.title).toBe(canonical.name);
    expect(row!.icon).toBe(canonical.icon);
    expect(row!.accessibilityHint).toBe(canonical.hint);
    expect(canonical.route).toBe('/tools/bmi-calculator');
    // Gold in both places — the tool's identity, not a category colour.
    expect(canonical.color).toBe(palette.gold);
  });
});

describe('BMI Calculator — Dynamic Type', () => {
  /**
   * The reference rail is ornament, and past `COMPACT_FONT_SCALE` ornament
   * yields to the words — the rule Dashboard's squares already follow.
   *
   * This is not a preference. At accessibility-extra-large on device the
   * `18.5` label wrapped onto a second line and spilled out of the result
   * card into the note below it. Nothing is lost by dropping the rail: it
   * is hidden from assistive technology precisely because the number and
   * its category already state everything it encodes.
   */
  /**
   * Both cases state their own text scale rather than inheriting the
   * preset's — which is not 1, and silently decided the answer the first
   * time this was written.
   */
  it('keeps the rail at ordinary text sizes', async () => {
    const rn = require('react-native');
    const spy = jest
      .spyOn(rn, 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });

    try {
      const tree = await mount(
        <BmiCalculator initialUs={{ feet: '5', inches: '8', pounds: '180' }} />,
      );
      const rendered = screen(tree);
      expect(rendered).toContain('27.4');
      // The thresholds, drawn.
      expect(rendered).toContain('18.5');
      expect(rendered).toContain('30');
    } finally {
      spy.mockRestore();
    }
  });

  it('drops the rail — and nothing else — once the text is large', async () => {
    const rn = require('react-native');
    const spy = jest
      .spyOn(rn, 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1.6 });

    try {
      const tree = await mount(
        <BmiCalculator initialUs={{ feet: '5', inches: '8', pounds: '180' }} />,
      );
      const rendered = screen(tree);
      // The answer and its category survive at every text size.
      expect(rendered).toContain('27.4');
      expect(rendered).toContain('BMI category · Overweight');
      // The decorative scale does not.
      expect(rendered).not.toContain('18.5');
      // And the spoken result is unchanged, because the rail never spoke.
      const announced = tree.root
        .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
        .map((node) => node.props.accessibilityLabel as string);
      expect(announced).toContain('BMI 27.4, category Overweight');
    } finally {
      spy.mockRestore();
    }
  });
});

/* ── 5.9B.1: BMI category colour ────────────────────────────────────── */

/**
 * The founder reversed 5.9's neutral-category rule: the bands should read at
 * a glance. These pin the two things that reversal must not cost.
 *
 * **Colour follows the canonical category** — the thresholds live in
 * `src/lib/bmi` and the screen reads them, so there is no second copy of the
 * classification in presentation code to drift. And **colour never carries
 * meaning alone**: the number and the band are always written out.
 */

/** The colour the result's number is actually rendered in. */
function resultColor(tree: ReactTestRenderer, text: string): string | undefined {
  const node = tree.root
    .findAllByType(Text)
    .find((candidate) => candidate.props.children === text);
  const style = StyleSheet.flatten(node?.props.style) as Record<string, unknown> | undefined;
  return style?.color as string | undefined;
}

describe('BMI category colour', () => {
  it.each([
    ['Underweight', { centimetres: '180', kilograms: '55' }, '17.0'],
    ['Healthy weight', { centimetres: '180', kilograms: '70' }, '21.6'],
    ['Overweight', { centimetres: '180', kilograms: '85' }, '26.2'],
    ['Obesity', { centimetres: '180', kilograms: '100' }, '30.9'],
  ] as const)('draws %s in its own semantic colour', async (category, metric, value) => {
    const tree = await mount(<BmiCalculator initialSystem="metric" initialMetric={metric} />);

    expect(screen(tree)).toContain(value);
    expect(screen(tree)).toContain(`BMI category · ${category}`);
    expect(resultColor(tree, value)).toBe(BMI_CATEGORY_COLORS[category].light);
  });

  /** Four bands, four distinguishable colours — not one accent reused. */
  it('gives each band a colour of its own', () => {
    const light = Object.values(BMI_CATEGORY_COLORS).map((pair) => pair.light);
    const dark = Object.values(BMI_CATEGORY_COLORS).map((pair) => pair.dark);
    expect(new Set(light).size).toBe(4);
    expect(new Set(dark).size).toBe(4);
    // Every band is defined in both themes.
    for (const pair of Object.values(BMI_CATEGORY_COLORS)) {
      expect(pair.light).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(pair.dark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  /**
   * §10. The failure this prevents: a valid Overweight result, then an
   * invalid entry, leaving amber on an empty card as though it still meant
   * something.
   */
  it('withdraws the colour with the result when input goes invalid', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');
    expect(resultColor(tree, '27.4')).toBe(BMI_CATEGORY_COLORS.Overweight.light);

    await type(tree, 'Height, inches', '12');
    const rendered = screen(tree);
    expect(rendered).toContain('Enter height and weight to calculate BMI.');
    // No value left to carry a colour, and no band named anywhere.
    expect(resultColor(tree, '27.4')).toBeUndefined();
    for (const band of ['Underweight', 'Healthy weight', 'Overweight', 'Obesity']) {
      expect(rendered).not.toContain(band);
    }
  });

  it('shows no category colour before anything has been entered', async () => {
    const tree = await mount(<BmiCalculator />);
    const colors = Object.values(BMI_CATEGORY_COLORS).flatMap((pair) => [pair.light, pair.dark]);
    const used = tree.root
      .findAllByType(Text)
      .map((node) => (StyleSheet.flatten(node.props.style) as Record<string, unknown>)?.color);
    for (const color of colors) expect(used).not.toContain(color);
  });

  /**
   * The accessibility guarantee the colour change must not erode: the
   * sentence a screen reader hears is unchanged, and names no colour.
   */
  it('still says the band in words, and never names a colour', async () => {
    const tree = await mount(<BmiCalculator />);
    await enterUs(tree, '5', '8', '180');

    const announced = tree.root
      .findAll((node) => typeof node.props?.accessibilityLabel === 'string')
      .map((node) => node.props.accessibilityLabel as string);
    expect(announced).toContain('BMI 27.4, category Overweight');
    expect(screen(tree)).not.toMatch(/amber|yellow|green|red|blue/i);
  });
});
