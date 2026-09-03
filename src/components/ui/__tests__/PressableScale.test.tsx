/**
 * The press primitive's opacity contract.
 *
 * This exists because of a regression it now guards. Slice 5.1 added a
 * reduced-motion fade by putting an `opacity` *after* the caller's `style` in
 * the same array — which silently won every time. `Button` dims itself to 0.4
 * when disabled, so from 5.1 until 5.2A every disabled button in the app
 * rendered at full strength while still refusing taps: a control that looked
 * available and was not.
 *
 * The tests below are about the composition rule rather than about any
 * particular number, so they hold if the press fade is ever retuned.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockHaptic = jest.fn();
jest.mock('../../../lib/haptics', () => ({
  vitaHaptic: (...args: unknown[]) => mockHaptic(...args),
}));

import { Animated, Text, View } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Button } from '../Button';
import { PressableScale } from '../PressableScale';
import { ThemeProvider } from '../../../theme/ThemeProvider';

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement): Promise<ReactTestRenderer> {
  await act(async () => {
    mounted = create(<ThemeProvider>{element}</ThemeProvider>);
  });
  return mounted!;
}

afterEach(() => {
  act(() => mounted?.unmount());
  mounted = null;
  jest.clearAllMocks();
});

/** The animated wrapper the primitive puts the caller's style on. */
function animatedLayer(tree: ReactTestRenderer) {
  return tree.root.findAllByType(Animated.View)[0];
}

/** The resolved numeric opacity of that layer, whatever shape it arrives in. */
function opacityOf(tree: ReactTestRenderer): number {
  const style = animatedLayer(tree).props.style.flat(Infinity);
  const withOpacity = style.reverse().find((entry: unknown) => {
    if (!entry || typeof entry !== 'object') return false;
    return 'opacity' in (entry as Record<string, unknown>);
  });
  const value = (withOpacity as { opacity: unknown }).opacity;
  // An Animated node exposes its current value through __getValue.
  return typeof value === 'number'
    ? value
    : (value as { __getValue: () => number }).__getValue();
}

describe('PressableScale opacity', () => {
  it('is fully opaque when the caller asks for nothing', async () => {
    const tree = await mount(
      <PressableScale onPress={() => {}} accessibilityLabel="Plain">
        <Text>Plain</Text>
      </PressableScale>,
    );
    expect(opacityOf(tree)).toBe(1);
  });

  it("respects the caller's own opacity instead of overwriting it", async () => {
    const tree = await mount(
      <PressableScale onPress={() => {}} style={{ opacity: 0.4 }} accessibilityLabel="Dim">
        <Text>Dim</Text>
      </PressableScale>,
    );
    expect(opacityOf(tree)).toBeCloseTo(0.4, 5);
  });

  it('finds the opacity wherever it sits in a style array', async () => {
    // Callers routinely pass `[base, condition && dimmed]`, which is the exact
    // shape the regression hid in.
    const tree = await mount(
      <PressableScale
        onPress={() => {}}
        style={[{ padding: 8 }, false as never, { opacity: 0.5 }]}
        accessibilityLabel="Nested"
      >
        <Text>Nested</Text>
      </PressableScale>,
    );
    expect(opacityOf(tree)).toBeCloseTo(0.5, 5);
  });

  it('keeps a disabled Button visibly disabled', async () => {
    /*
     * The regression, stated as the user-facing fact it broke: a disabled
     * button must look disabled. It already refused taps; what it stopped
     * doing was saying so.
     */
    const enabled = await mount(<Button label="Save" onPress={() => {}} />);
    expect(opacityOf(enabled)).toBe(1);

    act(() => mounted?.unmount());
    mounted = null;

    const disabled = await mount(<Button label="Save" disabled onPress={() => {}} />);
    expect(opacityOf(disabled)).toBeLessThan(1);
  });
});

describe('PressableScale behaviour', () => {
  it('announces itself as a button only when it does something', async () => {
    const acting = await mount(
      <PressableScale onPress={() => {}}>
        <Text>Go</Text>
      </PressableScale>,
    );
    expect(acting.root.findAll((n) => n.props?.accessibilityRole === 'button').length).toBeGreaterThan(0);

    act(() => mounted?.unmount());
    mounted = null;

    const inert = await mount(
      <PressableScale>
        <View />
      </PressableScale>,
    );
    expect(inert.root.findAll((n) => n.props?.accessibilityRole === 'button')).toHaveLength(0);
  });

  it('fires its haptic on the committed press, not on touch down', async () => {
    const tree = await mount(
      <PressableScale onPress={() => {}} haptic="selection" accessibilityLabel="Tap">
        <Text>Tap</Text>
      </PressableScale>,
    );

    // The inner Pressable, not the composite wrapper — only the former
    // carries the touch handlers the primitive attaches.
    const pressable = tree.root.find(
      (node) => node.props?.accessibilityLabel === 'Tap' && typeof node.props?.onPressIn === 'function',
    );

    // A finger that lands and slides off has not made anything happen.
    await act(async () => pressable.props.onPressIn());
    expect(mockHaptic).not.toHaveBeenCalled();

    await act(async () => pressable.props.onPress());
    expect(mockHaptic).toHaveBeenCalledWith('selection');
    expect(mockHaptic).toHaveBeenCalledTimes(1);
  });

  it('stays silent when no haptic was asked for', async () => {
    const tree = await mount(
      <PressableScale onPress={() => {}} accessibilityLabel="Quiet">
        <Text>Quiet</Text>
      </PressableScale>,
    );

    const pressable = tree.root.find(
      (node) => node.props?.accessibilityLabel === 'Quiet' && typeof node.props?.onPress === 'function',
    );
    await act(async () => pressable.props.onPress());
    expect(mockHaptic).not.toHaveBeenCalled();
  });
});
