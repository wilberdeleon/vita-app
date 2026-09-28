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
import { Card, IconBadge, ListRow, PressableScale, ToastProvider } from '../../../components/ui';
import { QUICK_TOOL_REGISTRY } from '../../dashboard/quickTools';
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
    expect(rows(tree).map((row) => row.title)).toEqual(['Peptide Calculator', 'Injection Sites']);
  });

  /**
   * The hub's founding rule, carried over from the screen it replaces:
   * nothing is listed before it works. A dead row is worse than a short list.
   */
  it.each([
    ['BMI', /BMI/i],
    ['a food or product scanner', /scan/i],
    ['the Research Library', /research library/i],
    ['a Coming Soon placeholder', /coming soon|coming later/i],
  ])('advertises no %s', async (_label, pattern) => {
    const tree = await mount(<ToolsAndReference />);
    expect(screen(tree)).not.toMatch(pattern);
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
    expect(rows(tree).map((row) => row.variant)).toEqual(['flat', 'flat']);
    // One panel holding both, not one surface each.
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
  it('spends the feature colour on the glyph and nowhere else', async () => {
    const tree = await mount(<ToolsAndReference />);
    for (const row of rows(tree)) expect(row.iconColor).toBe(palette.peptide);

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
