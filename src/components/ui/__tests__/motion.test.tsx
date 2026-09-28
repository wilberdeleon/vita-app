/**
 * The shared motion contract (slice 5.8B).
 *
 * 5.8A's audit found the vocabulary already in place — `motion` tokens, the
 * `useReducedMotion` hook, `PressableScale`, and `vitaHaptic`'s four named
 * events — and two places that did not honour it. These are about the
 * contract rather than about any particular number, so they survive a
 * retune.
 *
 * **No frame-level or millisecond assertions.** What matters is that reduced
 * motion removes spatial movement without removing feedback, and that a
 * haptic fires exactly where the vocabulary says it should.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockHaptic = jest.fn();
jest.mock('../../../lib/haptics', () => ({
  vitaHaptic: (...args: unknown[]) => mockHaptic(...args),
}));

import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { SegmentedTabs } from '../SegmentedTabs';
import { ToastProvider, useToast } from '../Toast';
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
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

/**
 * Every distinct control matching a label, deduped across composite layers.
 *
 * A `PressableScale` segment is two composite instances — the primitive
 * itself, holding the caller's raw `onPress`, and RN's `Pressable` inside
 * it, holding the handler the primitive composed (the one that also fires
 * the haptic). **The innermost is the one a real tap runs**, so that is the
 * one kept; it carries the accessibility props too, since they are spread
 * straight through.
 */
function controls(tree: ReactTestRenderer, label: RegExp) {
  const seen = new Map<string, { props: Record<string, unknown> }>();
  for (const node of tree.root.findAll(
    (item) =>
      typeof item.props?.onPress === 'function' &&
      label.test(String(item.props?.accessibilityLabel ?? '')),
  )) {
    seen.set(String(node.props.accessibilityLabel), node as never);
  }
  return seen;
}

/* ── SegmentedTabs: the control that used to answer a press with nothing ── */

describe('SegmentedTabs press vocabulary', () => {
  function Harness({ initial = 0 }: { initial?: number }) {
    const [index, setIndex] = require('react').useState(initial);
    return (
      <SegmentedTabs
        options={['Light', 'Dark', 'System']}
        selectedIndex={index}
        onChange={setIndex}
        groupLabel="Appearance"
      />
    );
  }

  it('uses the shared press primitive rather than a bare pressable', async () => {
    const tree = await mount(<Harness />);
    // `PressableScale` is the only thing in the app that renders an
    // Animated.View per control; one per segment means all three go through it.
    expect(tree.root.findAllByType(Animated.View)).toHaveLength(3);
  });

  it('still divides the track evenly', async () => {
    const tree = await mount(<Harness />);
    /*
     * The flex moved off the segment and onto a wrapper, because
     * `PressableScale` applies its style to an inner view and a `flex`
     * handed to it never reaches the row. If that wrapper ever loses its
     * flex the segments collapse to their text width.
     */
    const slots = tree.root.findAll(
      (node) =>
        typeof node.type === 'string' &&
        (StyleSheet.flatten(node.props.style) as { flex?: number } | undefined)?.flex === 1,
    );
    expect(slots.length).toBeGreaterThanOrEqual(3);
  });

  it('fires one selection haptic when the choice actually changes', async () => {
    const tree = await mount(<Harness />);
    const dark = controls(tree, /^Appearance, Dark$/).get('Appearance, Dark');
    expect(dark).toBeTruthy();

    await act(async () => (dark!.props.onPress as () => void)());
    expect(mockHaptic).toHaveBeenCalledTimes(1);
    expect(mockHaptic).toHaveBeenCalledWith('selection');
  });

  /** §9: a buzz for a press that changed nothing is the noise to avoid. */
  it('stays silent when the active segment is pressed again', async () => {
    const tree = await mount(<Harness />);
    const light = controls(tree, /^Appearance, Light$/).get('Appearance, Light');
    expect(light).toBeTruthy();

    await act(async () => (light!.props.onPress as () => void)());
    expect(mockHaptic).not.toHaveBeenCalled();
  });

  it('keeps announcing which segment is selected', async () => {
    const tree = await mount(<Harness initial={1} />);
    const found = controls(tree, /^Appearance, /);
    expect([...found.keys()].sort()).toEqual([
      'Appearance, Dark',
      'Appearance, Light',
      'Appearance, System',
    ]);
    expect(
      (found.get('Appearance, Dark')!.props.accessibilityState as { selected: boolean }).selected,
    ).toBe(true);
  });
});

/* ── Toast: the one animated surface that ignored Reduced Motion ────────── */

describe('Toast under Reduced Motion', () => {
  function Shower({ label }: { label: string }) {
    const { showToast } = useToast();
    return <Text onPress={() => showToast({ message: label })}>{label}</Text>;
  }

  async function showWith(reduced: boolean) {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduced);
    const tree = await mount(
      <ToastProvider>
        <Shower label="Logged" />
      </ToastProvider>,
    );
    const trigger = tree.root.findAll(
      (node) => typeof node.props?.onPress === 'function' && node.props?.children === 'Logged',
    )[0];
    await act(async () => (trigger.props.onPress as () => void)());
    return tree;
  }

  /** The banner's own layer — the only Animated.View this tree renders. */
  const banner = (tree: ReactTestRenderer) => tree.root.findAllByType(Animated.View)[0];

  it('travels 16pt upward when motion is allowed', async () => {
    const tree = await showWith(false);
    const style = StyleSheet.flatten(banner(tree).props.style) as { transform?: unknown[] };
    expect(style.transform).toHaveLength(1);
  });

  it('removes the movement, and only the movement, when motion is reduced', async () => {
    const tree = await showWith(true);
    const style = StyleSheet.flatten(banner(tree).props.style) as {
      transform?: unknown[];
      opacity?: { __getValue?: () => number } | number;
    };
    // No spatial travel …
    expect(style.transform).toHaveLength(0);
    // … and the message is fully present rather than waiting on a fade.
    const opacity = style.opacity;
    const value = typeof opacity === 'number' ? opacity : opacity?.__getValue?.();
    expect(value).toBe(1);
  });

  it('shows the message either way', async () => {
    for (const reduced of [false, true]) {
      const tree = await showWith(reduced);
      const said = tree.root.findAllByType(Text).map((node) => node.props.children);
      expect(said).toContain('Logged');
      await act(async () => tree.unmount());
      mounted = null;
    }
  });
});
