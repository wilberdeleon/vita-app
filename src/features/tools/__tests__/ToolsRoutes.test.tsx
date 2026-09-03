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
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    push: (...args: unknown[]) => mockPush(...args),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import InjectionSites from '../../../app/(vita)/tools/injection-sites';
import PeptideCalculator from '../../../app/(vita)/tools/peptide-calculator';
import ToolsAndReference from '../../../app/(vita)/tools/index';
import { ListRow, ToastProvider } from '../../../components/ui';
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
});

describe('Injection Sites after migration', () => {
  it('renders at its new route with the body map and reference intact', async () => {
    const tree = await mount(<InjectionSites />);
    const rendered = screen(tree);
    expect(rendered).toContain('Injection Sites');
    expect(rendered).toContain('Front');
    expect(rendered).toContain('Back');
    // `SectionHeader` uppercases its title.
    expect(rendered).toContain('SITE REFERENCE');
    expect(rendered).toContain('RECENT SITES');
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
