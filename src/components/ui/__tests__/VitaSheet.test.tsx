/**
 * VitaSheet — the shared sheet primitive introduced in slice 5.1.
 *
 * What is worth proving here is not that a `Modal` renders. It is the set of
 * promises the four existing hand-rolled sheets each had to keep on their own,
 * and which this component now keeps once: a sheet that is closed shows
 * nothing, a sheet that is open shows its content, every route out of it
 * works, and none of those routes is visual-only.
 */

import { Modal, ScrollView, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Screen } from '../Screen';
import { VitaSheet } from '../VitaSheet';
import { ThemeProvider } from '../../../theme/ThemeProvider';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mounted: ReactTestRenderer | null = null;

/** The providers every mount needs; `update` must pass through it too. */
function wrap(element: React.ReactElement) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>{element}</ThemeProvider>
    </SafeAreaProvider>
  );
}

async function mount(element: React.ReactElement): Promise<ReactTestRenderer> {
  await act(async () => {
    mounted = create(wrap(element));
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

  /**
   * Regression, Audit Log 2026-10-28: with the number pad up, the first tap
   * on Log Weight / "Log N fl oz" only dismissed the keyboard.
   *
   * The tap was taken by the *screen's* scroll view, not the sheet's — React
   * Native routes touches through the React tree, where the sheet's `Modal`
   * is still a child of the `Screen`, and a scroll view left on the default
   * `keyboardShouldPersistTaps` claims every touch while a keyboard is up. The
   * test renderer cannot drive the responder system, so this pins the
   * contract that prevents it: while a sheet is open, the screen it sits on
   * lets taps through to the sheet.
   */
  describe('on a Screen, with a keyboard up', () => {
    /** The outermost scroll view is the screen's; the sheet's is inside it. */
    const screenScroll = (tree: ReactTestRenderer) => tree.root.findAllByType(ScrollView)[0];

    it('lets taps through to the sheet only while the sheet is open', async () => {
      const page = (visible: boolean) => (
        <Screen>
          <Text>Hydration</Text>
          <VitaSheet visible={visible} onClose={() => {}} title="Add Water">
            <Text>Custom amount</Text>
          </VitaSheet>
        </Screen>
      );
      const tree = await mount(page(false));

      // Closed: the screen keeps the dismiss-first behaviour it always had.
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBeUndefined();

      await act(async () => tree.update(wrap(page(true))));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBe('handled');

      await act(async () => tree.update(wrap(page(false))));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBeUndefined();
    });

    it('stays handled until the last of two open sheets closes', async () => {
      const page = (first: boolean, second: boolean) => (
        <Screen>
          <VitaSheet visible={first} onClose={() => {}} title="Add Water">
            <Text>One</Text>
          </VitaSheet>
          <VitaSheet visible={second} onClose={() => {}} title="Log Weight">
            <Text>Two</Text>
          </VitaSheet>
        </Screen>
      );
      const tree = await mount(page(true, true));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBe('handled');

      await act(async () => tree.update(wrap(page(false, true))));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBe('handled');

      await act(async () => tree.update(wrap(page(false, false))));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBeUndefined();
    });

    it('leaves a keyboard-aware screen handled whether or not a sheet is open', async () => {
      const tree = await mount(
        <Screen keyboardAware>
          <VitaSheet visible={false} onClose={() => {}} title="Add Water">
            <Text>Custom amount</Text>
          </VitaSheet>
        </Screen>,
      );

      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBe('handled');
    });

    it('releases the screen when an open sheet unmounts without closing', async () => {
      const page = (withSheet: boolean) => (
        <Screen>
          {withSheet ? (
            <VitaSheet visible onClose={() => {}} title="Add Water">
              <Text>Custom amount</Text>
            </VitaSheet>
          ) : null}
        </Screen>
      );
      const tree = await mount(page(true));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBe('handled');

      await act(async () => tree.update(wrap(page(false))));
      expect(screenScroll(tree).props.keyboardShouldPersistTaps).toBeUndefined();
    });
  });
});
