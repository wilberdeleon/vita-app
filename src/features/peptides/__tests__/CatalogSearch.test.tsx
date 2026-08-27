/**
 * The catalog screen, driven the way a person drives it.
 *
 * Slice 3.9A "fixed" PT-141 discoverability and shipped 92 passing tests, and
 * the founder still could not find it on a real device. Every one of those
 * tests called `searchCatalog` directly — a pure function that was working
 * perfectly — while the screen that actually renders results was never
 * exercised. This file types into the real field and reads the real list.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
let mockRouteId = '';
jest.mock('expo-router', () => ({
  router: {
    push: (...args: unknown[]) => mockPush(...args),
    back: jest.fn(),
    dismissAll: jest.fn(),
    navigate: jest.fn(),
  },
  useLocalSearchParams: () => ({ id: mockRouteId }),
}));

import { Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import PeptideCatalog from '../../../app/(vita)/peptides/catalog';
import PeptideDetail from '../../../app/(vita)/peptides/catalog/[id]';
import { PeptideProvider } from '../../../lib/peptides';
import { ToastProvider } from '../../../components/ui';
import { ThemeProvider } from '../../../theme/ThemeProvider';

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement) {
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

/** Types into the screen's real search field, by its accessible name. */
async function search(tree: ReactTestRenderer, value: string) {
  const field = tree.root
    .findAllByType(TextInput)
    .find((node) => /search/i.test(String(node.props.accessibilityLabel ?? node.props.placeholder ?? '')));
  if (!field) throw new Error('no search field on the catalog screen');
  await act(async () => field.props.onChangeText(value));
}

/** A result row by the compound name it displays. */
function result(tree: ReactTestRenderer, name: string) {
  return tree.root
    .findAll((node) => typeof node.props?.onPress === 'function')
    .find((node) =>
      node.findAllByType(Text).some((text) => {
        const children = Array.isArray(text.props.children)
          ? text.props.children
          : [text.props.children];
        return children.join('').includes(name);
      }),
    );
}

describe('finding PT-141 on the screen a person actually uses', () => {
  it.each(['PT-141', 'PT141', 'pt141', 'pt 141', 'Bremelanotide', 'bremelanotide'])(
    'shows the compound for "%s"',
    async (query) => {
      const tree = await mount(<PeptideCatalog />);
      await search(tree, query);

      const rendered = screen(tree);
      // Whatever the canonical name is, the row has to carry the name the
      // user typed — finding a row called something else is not finding it.
      expect(rendered).toContain('PT-141');
      expect(rendered).toContain('Bremelanotide');
    },
  );

  it('opens the right compound when the result is tapped', async () => {
    const tree = await mount(<PeptideCatalog />);
    await search(tree, 'PT141');

    const row = result(tree, 'PT-141');
    expect(row).toBeDefined();
    await act(async () => row!.props.onPress());

    expect(mockPush).toHaveBeenCalledWith(
      `/peptides/catalog/${encodeURIComponent('catalog:bremelanotide')}`,
    );
  });

  it('renders the detail page for that compound', async () => {
    mockRouteId = encodeURIComponent('catalog:bremelanotide');
    const tree = await mount(<PeptideDetail />);

    const rendered = screen(tree);
    expect(rendered).toContain('Bremelanotide');
    expect(rendered).toContain('PT-141');
    // The right compound, not a neighbour with a similar name.
    expect(rendered).toContain('Melanocortin');
    expect(rendered).not.toContain('Melanotan II');
  });

  it('does not hide it behind the default filters', async () => {
    // Bremelanotide is an approved medication, so an "All" default that
    // quietly excluded approved entries would hide it on the real screen
    // while every pure-function test still passed.
    const tree = await mount(<PeptideCatalog />);
    await search(tree, 'PT141');
    expect(screen(tree)).toContain('PT-141');
  });
});

describe('punctuation-insensitive search on the real screen', () => {
  it.each([
    ['ghkcu', 'GHK-Cu'],
    ['bpc157', 'BPC-157'],
    ['ll37', 'LL-37'],
    ['mk677', 'MK-677'],
    ['pegmgf', 'PEG-MGF'],
    ['tb500', 'TB-500'],
  ])('finds %s', async (query, name) => {
    const tree = await mount(<PeptideCatalog />);
    await search(tree, query);
    expect(screen(tree)).toContain(name);
  });

  it('finds a compound added in slice 3.9A', async () => {
    const tree = await mount(<PeptideCatalog />);
    await search(tree, 'setmelanotide');
    expect(screen(tree)).toContain('Setmelanotide');
  });

  it('still finds nothing for a genuine miss', async () => {
    const tree = await mount(<PeptideCatalog />);
    await search(tree, 'zzzznotacompound');
    expect(screen(tree)).not.toContain('Bremelanotide');
  });
});
