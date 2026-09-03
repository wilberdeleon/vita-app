/**
 * VitaSheet — the shared sheet primitive introduced in slice 5.1.
 *
 * What is worth proving here is not that a `Modal` renders. It is the set of
 * promises the four existing hand-rolled sheets each had to keep on their own,
 * and which this component now keeps once: a sheet that is closed shows
 * nothing, a sheet that is open shows its content, every route out of it
 * works, and none of those routes is visual-only.
 */

import { Modal, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { VitaSheet } from '../VitaSheet';
import { ThemeProvider } from '../../../theme/ThemeProvider';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

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

afterEach(() => {
  act(() => {
    mounted?.unmount();
  });
  mounted = null;
});

function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).flatMap((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.filter((child): child is string => typeof child === 'string');
  });
}

/** Every pressable carrying this spoken name, however it was built. */
function byLabel(tree: ReactTestRenderer, label: string) {
  return tree.root
    .findAll((node) => node.props?.accessibilityLabel === label && typeof node.props?.onPress === 'function');
}

describe('VitaSheet', () => {
  it('renders nothing while hidden', async () => {
    const tree = await mount(
      <VitaSheet visible={false} onClose={() => {}} title="Add Water">
        <Text>Quick amounts</Text>
      </VitaSheet>,
    );

    // The Modal exists but is not presented; nothing inside it is on screen.
    expect(tree.root.findByType(Modal).props.visible).toBe(false);
  });

  it('shows its title and content when visible', async () => {
    const tree = await mount(
      <VitaSheet visible onClose={() => {}} title="Add Water">
        <Text>Quick amounts</Text>
      </VitaSheet>,
    );

    expect(texts(tree)).toContain('Add Water');
    expect(texts(tree)).toContain('Quick amounts');
  });

  it('closes from the backdrop, the close control, and the Android back button', async () => {
    const onClose = jest.fn();
    const tree = await mount(
      <VitaSheet visible onClose={onClose} title="Add Water">
        <Text>Quick amounts</Text>
      </VitaSheet>,
    );

    /**
     * Both the backdrop and the close control answer to "Close" — that is
     * deliberate, and it is why this asserts on the count as well as the
     * behaviour. A sheet with only one way out is a sheet someone gets stuck
     * in when their thumb misses.
     */
    const exits = byLabel(tree, 'Close');
    expect(exits).toHaveLength(2);

    for (const exit of exits) {
      await act(async () => exit.props.onPress());
    }
    expect(onClose).toHaveBeenCalledTimes(2);

    // Android's hardware back button is a third route out, and forgetting it
    // is what turns a sheet into a trap on that platform.
    await act(async () => tree.root.findByType(Modal).props.onRequestClose());
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('announces itself as modal, and names itself for a screen reader', async () => {
    const tree = await mount(
      <VitaSheet visible onClose={() => {}} title="Add Water">
        <Text>Quick amounts</Text>
      </VitaSheet>,
    );

    expect(tree.root.findByType(Modal).props.accessibilityViewIsModal).toBe(true);
    expect(tree.root.findAll((node) => node.props?.accessibilityLabel === 'Add Water').length).toBeGreaterThan(0);
  });

  it('falls back to the title for its spoken name, and prefers an explicit label', async () => {
    const tree = await mount(
      <VitaSheet visible onClose={() => {}} title="Add Water" accessibilityLabel="Log a drink">
        <Text>Quick amounts</Text>
      </VitaSheet>,
    );

    expect(tree.root.findAll((node) => node.props?.accessibilityLabel === 'Log a drink').length).toBeGreaterThan(0);
  });

  it('renders without a title — a sheet is not required to have a head', async () => {
    const tree = await mount(
      <VitaSheet visible onClose={() => {}}>
        <Text>Just content</Text>
      </VitaSheet>,
    );

    expect(texts(tree)).toContain('Just content');
    // Only the backdrop remains as an exit; the close control lives in the head.
    expect(byLabel(tree, 'Close')).toHaveLength(1);
  });
});
