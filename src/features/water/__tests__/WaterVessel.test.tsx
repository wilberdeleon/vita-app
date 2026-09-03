/**
 * The hydration object, and the prototype it is proved in.
 *
 * The vessel's *appearance* is a founder judgement made on a real device, and
 * no test can stand in for that. What tests can hold are the promises the
 * drawing rests on: that the geometry the liquid is clipped to is the same
 * geometry the silhouette is drawn from, that a percentage cannot escape
 * 0–100, that the value is available to a screen reader rather than only to
 * the eye, and — the one that matters most for founder testing — that the
 * prototype cannot write into real hydration history.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: (...args: unknown[]) => mockPush(...args), navigate: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

const mockHaptic = jest.fn();
jest.mock('../../../lib/haptics', () => ({
  vitaHaptic: (...args: unknown[]) => mockHaptic(...args),
}));

let mockReducedMotion = false;
jest.mock('../../../theme/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));

import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import IdentityPrototype from '../../../app/(vita)/identity';
import { WaterVessel, halfWidthAt } from '../components/WaterVessel';
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
  mockReducedMotion = false;
  jest.clearAllMocks();
});

/**
 * The visible text of each `Text` node, joined.
 *
 * Joined rather than collected per child because `{percent}%` renders as two
 * children — a number and a string — and a reader sees "25%", not "25" and
 * "%" as separate facts.
 */
function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).map((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children
      .filter((child) => typeof child === 'string' || typeof child === 'number')
      .join('');
  });
}

function vessel(tree: ReactTestRenderer) {
  return tree.root.find(
    (node) => node.props?.accessibilityRole === 'progressbar' && node.type === View,
  );
}

function byLabel(tree: ReactTestRenderer, label: string) {
  return tree.root.find(
    (node) => node.props?.accessibilityLabel === label && typeof node.props?.onPress === 'function',
  );
}

/**
 * The nearest pressable ancestor of a piece of visible text.
 *
 * `Button` carries no `accessibilityLabel` — its text child is what a screen
 * reader announces, which is correct and is why nothing was changed to make
 * this test easier. So the test finds the control the way a person does:
 * by the words on it.
 */
function tapTargetFor(tree: ReactTestRenderer, label: string) {
  const text = tree.root.findAll((node) => {
    if (node.type !== Text) return false;
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.includes(label);
  })[0];

  let node: typeof text | null = text?.parent ?? null;
  while (node && typeof node.props?.onPress !== 'function') node = node.parent;
  if (!node) throw new Error(`No pressable found for "${label}"`);
  return node;
}

/**
 * Quick amounts live inside the sheet, which is the interaction under test:
 * the amounts are unreachable until Add Water opens it, and the sheet closes
 * itself once one is chosen. Every amount tap below therefore opens first,
 * which is exactly the path a finger takes.
 */
async function addAmount(tree: ReactTestRenderer, floz: number) {
  await act(async () => tapTargetFor(tree, 'Add Water').props.onPress());
  await act(async () => byLabel(tree, `Add ${floz} ounces`).props.onPress());
}

describe('the vessel geometry', () => {
  it('is symmetric, monotonic through the shoulder, and never wider than the body', () => {
    // Through the shoulder and the body the silhouette only ever opens
    // outward — one that narrowed again partway down would read as a waist,
    // which is a different object.
    for (let t = 0; t <= 0.83; t += 0.01) {
      expect(halfWidthAt(t + 0.01)).toBeGreaterThanOrEqual(halfWidthAt(t) - 1e-9);
    }

    // Past the body it only ever draws in. The heel taper (from 0.855 since
    // the 5.1A shape polish) is a narrowing and never a second flare.
    for (let t = 0.86; t < 1; t += 0.01) {
      expect(halfWidthAt(t + 0.01)).toBeLessThanOrEqual(halfWidthAt(t) + 1e-9);
    }

    const widest = halfWidthAt(0.5);
    for (let t = 0; t <= 1; t += 0.01) {
      expect(halfWidthAt(t)).toBeLessThanOrEqual(widest + 1e-9);
    }
  });

  it('is vertical where the rounded corners start, so the outline cannot kink', () => {
    // The corners are only true corners if the silhouette is flat where they
    // begin. R_TOP is 11 of 260, R_BOT is 16 of 260.
    expect(halfWidthAt(0)).toBeCloseTo(halfWidthAt(11 / 260), 6);
    expect(halfWidthAt(1)).toBeCloseTo(halfWidthAt(1 - 16 / 260), 6);
  });

  it('has a mouth narrower than its body and a base only slightly drawn in', () => {
    expect(halfWidthAt(0)).toBeLessThan(halfWidthAt(0.5));
    expect(halfWidthAt(1)).toBeLessThan(halfWidthAt(0.5));
    // A base that tapered hard would read as a funnel, not a vessel.
    expect(halfWidthAt(1)).toBeGreaterThan(halfWidthAt(0.5) * 0.9);
  });

  it('clamps outside 0..1 rather than extrapolating', () => {
    expect(halfWidthAt(-5)).toBe(halfWidthAt(0));
    expect(halfWidthAt(5)).toBe(halfWidthAt(1));
  });
});

describe('WaterVessel', () => {
  it('states its percentage to a screen reader, not only to the eye', async () => {
    const tree = await mount(<WaterVessel progress={0.33} />);

    expect(vessel(tree).props.accessibilityValue).toEqual({
      min: 0,
      max: 100,
      now: 33,
      text: '33 percent of goal',
    });
    expect(vessel(tree).props.accessibilityLabel).toBe('Hydration');
  });

  it('clamps the fill but tells the truth about the percentage', async () => {
    /*
     * The drawing clamps so liquid never spills outside the vessel; the
     * announcement does not, because a screen-reader user must hear the same
     * figure the screen shows. A day at 250% is a full vessel that says 250.
     */
    const over = await mount(<WaterVessel progress={2.5} />);
    expect(vessel(over).props.accessibilityValue.now).toBe(250);

    act(() => {
      mounted?.unmount();
    });
    mounted = null;

    const under = await mount(<WaterVessel progress={-1} />);
    expect(vessel(under).props.accessibilityValue.now).toBe(0);
  });

  it('renders at every state the founder review asks for', async () => {
    for (const [progress, expected] of [
      [0, 0],
      [0.25, 25],
      [0.5, 50],
      [0.75, 75],
      [1, 100],
    ] as const) {
      const tree = await mount(<WaterVessel progress={progress} />);
      expect(vessel(tree).props.accessibilityValue.now).toBe(expected);
      act(() => {
        mounted?.unmount();
      });
      mounted = null;
    }
  });

  /**
   * The settle (5.1A) overshoots the target level and comes back. What must
   * hold regardless is that it *ends* on the real value — an overshoot that
   * failed to return would leave the vessel permanently reporting more than
   * was logged.
   */
  it('lands on the true level after a rise, overshoot included', async () => {
    const tree = await mount(<WaterVessel progress={0.4} />);
    expect(vessel(tree).props.accessibilityValue.now).toBe(40);

    await act(async () => {
      tree.update(<WaterVessel progress={0.6} />);
    });
    expect(vessel(tree).props.accessibilityValue.now).toBe(60);
  });

  it('renders under reduced motion with the value intact', async () => {
    mockReducedMotion = true;
    const tree = await mount(<WaterVessel progress={0.75} />);

    // Reduced motion changes how it gets there, never what it says.
    expect(vessel(tree).props.accessibilityValue.now).toBe(75);
  });

  it('under reduced motion a rise still lands exactly, with no settle', async () => {
    mockReducedMotion = true;
    const tree = await mount(<WaterVessel progress={0.2} />);

    await act(async () => {
      tree.update(<WaterVessel progress={0.9} />);
    });

    // No overshoot path is taken at all — the level is set directly.
    expect(vessel(tree).props.accessibilityValue.now).toBe(90);
  });
});

describe('the identity prototype', () => {
  it('starts empty and rises as amounts are logged', async () => {
    const tree = await mount(<IdentityPrototype />);
    expect(vessel(tree).props.accessibilityValue.now).toBe(0);

    // 16 of a 64 fl oz prototype goal.
    await addAmount(tree, 16);
    expect(vessel(tree).props.accessibilityValue.now).toBe(25);
    expect(texts(tree)).toContain('25%');
  });

  it('fires one confirmation haptic per log, and a completion haptic only at the goal', async () => {
    const tree = await mount(<IdentityPrototype />);

    await addAmount(tree, 24);
    expect(mockHaptic).toHaveBeenCalledWith('confirm');
    expect(mockHaptic).not.toHaveBeenCalledWith('complete');

    mockHaptic.mockClear();

    // Cross the goal in one tap; only the more specific event should fire.
    await act(async () => byLabel(tree, 'Set hydration to 75 percent').props.onPress());
    await addAmount(tree, 24);

    expect(mockHaptic).toHaveBeenCalledWith('complete');
    expect(mockHaptic).not.toHaveBeenCalledWith('confirm');
  });

  it('reaches and reports a completed goal', async () => {
    const tree = await mount(<IdentityPrototype />);

    await act(async () => byLabel(tree, 'Set hydration to 100 percent').props.onPress());

    expect(vessel(tree).props.accessibilityValue.now).toBe(100);
    expect(texts(tree)).toContain('100%');
    // The supporting line keeps the goal alongside the completion (5.1A copy
    // polish) rather than dropping the number the percentage refers to.
    expect(texts(tree)).toContain('Goal reached · 64 oz');
  });

  it('never reports beyond 100 percent, however much is logged', async () => {
    const tree = await mount(<IdentityPrototype />);

    for (let i = 0; i < 6; i += 1) {
      await addAmount(tree, 24);
    }

    expect(vessel(tree).props.accessibilityValue.now).toBe(100);
  });

  /**
   * The 5.1A quick-add polish changed both the layout and the spoken label
   * (`fluid ounces` → `ounces`, matching the visible `oz`). All four have to
   * stay individually reachable and individually named — a screen reader user
   * choosing an amount is choosing between four things that differ only by a
   * number.
   */
  it('offers four separately labelled quick amounts', async () => {
    const tree = await mount(<IdentityPrototype />);
    await act(async () => tapTargetFor(tree, 'Add Water').props.onPress());

    for (const amount of [8, 12, 16, 24]) {
      const control = byLabel(tree, `Add ${amount} ounces`);
      expect(typeof control.props.onPress).toBe('function');
    }

    // And the visible label is the compact form, not a stacked FL OZ kicker.
    expect(texts(tree)).toContain('oz');
  });

  /**
   * Narrow-width guard.
   *
   * Four equal slots in a flex row cannot overflow — they shrink together —
   * so the only way the layout breaks on a small phone is the number wrapping
   * inside its slot. At the narrowest supported width (320pt) each slot is
   * 64pt against roughly 46pt of content, but `numberOfLines` is what keeps
   * that true if the type scale ever moves.
   */
  it('keeps each quick amount on one line', async () => {
    const tree = await mount(<IdentityPrototype />);
    await act(async () => tapTargetFor(tree, 'Add Water').props.onPress());

    const value = tree.root.findAll(
      (node) => node.type === Text && node.props.numberOfLines === 1 && node.props.children === 24,
    );
    expect(value.length).toBe(1);
  });

  it('cannot touch real hydration data', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const tree = await mount(<IdentityPrototype />);

    await addAmount(tree, 16);
    await act(async () => byLabel(tree, 'Set hydration to 50 percent').props.onPress());

    /**
     * The guarantee that makes founder testing safe: the prototype holds its
     * state in `useState` and never reaches the Water domain, so no entry, no
     * goal, and no day record can be created by playing with it.
     */
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
