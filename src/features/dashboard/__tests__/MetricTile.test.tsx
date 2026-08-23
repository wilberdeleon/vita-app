/**
 * The Home Water tile.
 *
 * It lives below the fold on a scrolling Dashboard, and the simulator cannot
 * be scrolled without taps — so this is where its rendering is actually
 * verified rather than by screenshot. Rendered with the `react-test-renderer`
 * `jest-expo` already ships; no component-testing stack was installed.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);


import { Text } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { palette } from '../../../theme/tokens';
import { MetricTile } from '../components/MetricTile';
import type { QuickStat } from '../types';

const waterStat = (overrides: Partial<QuickStat> = {}): QuickStat => ({
  id: 'water',
  icon: 'water-outline',
  color: palette.water,
  value: '40.9 fl oz',
  label: 'Water',
  progress: 0.64,
  ...overrides,
});

/** Torn down in `afterEach`, inside `act` — see the water provider suite. */
let mounted: ReactTestRenderer | null = null;

async function render(stat: QuickStat, style?: object): Promise<ReactTestRenderer> {
  await act(async () => {
    mounted = create(
      <ThemeProvider>
        <MetricTile stat={stat} style={style} />
      </ThemeProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
});

/**
 * The tile's tappable node, if it has one.
 *
 * Found by accessibility role rather than by component type: React Native
 * wraps `Pressable`, so `findAllByType(Pressable)` matches nothing — and the
 * role is what actually has to be right anyway.
 */
function buttons(tree: ReactTestRenderer) {
  return tree.root.findAll(
    (node) => node.props?.accessibilityRole === 'button' && typeof node.props?.onPress === 'function',
    { deep: true },
  );
}

/** Every string the tile renders, flattened. */
function texts(tree: ReactTestRenderer): string[] {
  return tree.root.findAllByType(Text).flatMap((node) => {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    return children.filter((child): child is string => typeof child === 'string');
  });
}

describe('MetricTile', () => {
  it('shows the real hydration value it was given', async () => {
    const tree = await render(waterStat());
    expect(texts(tree)).toContain('40.9 fl oz');
    // The retired fixture, which used to be hardcoded here forever.
    expect(texts(tree)).not.toContain('5 / 8');
  });

  it('renders a zero day as a real zero, not a blank', async () => {
    const tree = await render(waterStat({ value: '0 fl oz', progress: 0 }));
    expect(texts(tree)).toContain('0 fl oz');
  });

  it('shows the value in whatever unit the user prefers', async () => {
    const tree = await render(waterStat({ value: '1.25 L' }));
    expect(texts(tree)).toContain('1.25 L');
  });

  it('is inert when the stat has no destination', async () => {
    // Steps, Sleep, Workouts, and Streak have no feature behind them; a tile
    // that navigates nowhere should not look or behave tappable.
    const tree = await render(waterStat({ onPress: undefined }));
    expect(buttons(tree)).toHaveLength(0);
  });

  it('is a labelled button when the stat has a destination', async () => {
    const onPress = jest.fn();
    const tree = await render(waterStat({ onPress }));

    const [button] = buttons(tree);
    expect(button).toBeDefined();
    // Icon-only would be unusable; the label names the metric and its value.
    expect(button.props.accessibilityLabel).toBe('Water, 40.9 fl oz');

    await act(async () => {
      button.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);

  });

  it('keeps the tile’s layout style on the element the row lays out', async () => {
    // `style` carries the grid's flexBasis. If it ends up on an inner wrapper
    // the flex item has no basis and the Health Metrics grid collapses.
    const tree = await render(waterStat({ onPress: jest.fn() }), { flexBasis: '23%' });

    const [button] = buttons(tree);
    const style = typeof button.props.style === 'function'
      ? button.props.style({ pressed: false })
      : button.props.style;
    expect(JSON.stringify(style)).toContain('23%');

  });
});
