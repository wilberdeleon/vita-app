/**
 * The research sections of a compound's detail page.
 *
 * Everything below the fold on this screen is unreachable in the simulator, so
 * the gating rules live here: a section appears when it has content and is
 * absent — heading included — when it does not. An empty "RESEARCH CLAIMS"
 * heading over blank space is worse than no section at all, and it is exactly
 * the failure a page assembled from optional fields tends to produce.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// `mock`-prefixed so Babel allows the hoisted factory below to close over it.
let mockRouteId = '';
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import PeptideDetail from '../../../app/(vita)/peptides/catalog/[id]';
import { PEPTIDE_CATALOG, PeptideProvider } from '../../../lib/peptides';
import { ToastProvider } from '../../../components/ui';
import { ThemeProvider } from '../../../theme/ThemeProvider';

let mounted: ReactTestRenderer | null = null;

async function renderDetail(definitionId: string): Promise<ReactTestRenderer> {
  mockRouteId = encodeURIComponent(definitionId);
  await act(async () => {
    mounted = create(
      // `Screen` reads insets, so the real provider is seeded with a fixed
      // frame rather than mocked — the layout is incidental to these assertions.
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider>
          <ToastProvider>
            <PeptideProvider>
              <PeptideDetail />
            </PeptideProvider>
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
  if (tree) await act(async () => tree.unmount());
});

/** Every string actually rendered into a `Text`, in order. */
function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).flatMap((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.filter((child): child is string => typeof child === 'string');
  });
}

function hasHeading(tree: ReactTestRenderer, title: string): boolean {
  return texts(tree).some((text) => text.toUpperCase() === title.toUpperCase());
}

describe('a compound with full research content', () => {
  it('renders claims, mechanisms and development status', async () => {
    const tree = await renderDetail('catalog:retatrutide');
    const rendered = texts(tree);

    expect(hasHeading(tree, 'Research claims')).toBe(true);
    expect(hasHeading(tree, 'How it works')).toBe(true);
    expect(hasHeading(tree, 'Development status')).toBe(true);

    // Claim titles and mechanism explanations, not just the headings.
    expect(rendered).toContain('Weight & Appetite');
    expect(rendered.join(' ').toLowerCase()).toContain('glucagon');
  });

  it('shows when the development information was last checked', async () => {
    const tree = await renderDetail('catalog:retatrutide');
    // `Updated {lastUpdated}` renders as two adjacent text children.
    expect(texts(tree).join(' ')).toMatch(/Updated\s+July 2026/);
  });

  it('renders a stated plan as a plan, never as a predicted approval', async () => {
    const tree = await renderDetail('catalog:retatrutide');
    const rendered = texts(tree).join(' ');
    expect(hasHeading(tree, 'Next milestone')).toBe(true);
    expect(rendered).toContain('plans to submit');
    expect(rendered.toLowerCase()).not.toContain('approval expected');
  });
});

describe('mechanism subtitles', () => {
  it('shows a target that adds information', async () => {
    const tree = await renderDetail('catalog:retatrutide');
    expect(texts(tree)).toContain('Glucagon Receptor');
  });

  it('never titles a mechanism after its own receptor', async () => {
    /**
     * Caught in device QA: Tesamorelin headed a mechanism "GHRH receptor" with
     * "GHRH Receptor" repeated beneath it, and the incretin pages headed theirs
     * "GLP-1" over "GLP-1 Receptor". `Mechanisms` now drops an exactly
     * duplicated subtitle, but the real fix is content — a heading that names
     * the receptor is the recitation this slice exists to remove.
     *
     * The rule is directional. A title contained in its target ("GLP-1" inside
     * "GLP-1 receptor") is the acronym-as-heading failure. A target contained
     * in its title ("NNMT" inside "Blocking the NNMT enzyme") is a real
     * sentence that happens to name the target, which is fine.
     */
    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const entry of PEPTIDE_CATALOG) {
      for (const item of entry.research?.mechanisms ?? []) {
        if (!item.target) continue;
        expect(normalize(item.target).includes(normalize(item.title))).toBe(false);
      }
    }
  });
});

describe('an approved medication', () => {
  it('labels the section Approval status rather than Development status', async () => {
    const tree = await renderDetail('catalog:semaglutide');
    expect(hasHeading(tree, 'Approval status')).toBe(true);
    expect(hasHeading(tree, 'Development status')).toBe(false);
  });
});

describe('a sparse compound', () => {
  it('renders no empty research headings', async () => {
    // IGF-1 DES is a laboratory reagent with no meaningful claim literature.
    // Slice 3.5D gave it a readable overview and deliberately stopped there —
    // padding it with confident filler would be worse than the gap.
    const tree = await renderDetail('catalog:igf-1-des');

    expect(hasHeading(tree, 'Research claims')).toBe(false);
    expect(hasHeading(tree, 'How it works')).toBe(false);
    expect(hasHeading(tree, 'Development status')).toBe(false);
    // Still a usable page, not a blank one.
    expect(hasHeading(tree, 'About')).toBe(true);
  });
});

describe('a blend', () => {
  it('lists components and offers no combined claims', async () => {
    const tree = await renderDetail('catalog:blend-glow');

    expect(hasHeading(tree, 'Components')).toBe(true);
    expect(hasHeading(tree, 'Research claims')).toBe(false);
    expect(texts(tree).join(' ')).toContain('GHK-Cu');
  });
});

describe('an unknown id', () => {
  it('renders an empty state rather than crashing', async () => {
    const tree = await renderDetail('catalog:does-not-exist');
    expect(hasHeading(tree, 'Research claims')).toBe(false);
    expect(texts(tree).join(' ').toLowerCase()).toContain("isn't available");
  });
});
