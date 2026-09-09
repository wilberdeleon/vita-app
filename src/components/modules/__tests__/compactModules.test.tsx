/**
 * The shared compact modules — one presentation, two screens.
 *
 * The founder's 5.6B.3 device comparison found Home and Fuel showing the same
 * two features with different objects, different copy and different
 * footprints. These pin the fix in the only way that survives a later edit:
 * not by comparing pixels, but by asserting that **both screens render the
 * same component with the same view model for the same data**, and that the
 * one derivation each feature owns says what it is supposed to say.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 390, height: 844, scale: 3, fontScale: mockFontScale }),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    dismissAll: jest.fn(),
    canDismiss: () => false,
  },
  useLocalSearchParams: () => ({}),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Dashboard from '../../../app/(vita)/(tabs)/dashboard';
import Fuel from '../../../app/(vita)/(tabs)/fuel';
import { ToastProvider, WaterVessel } from '../../ui';
import { NutritionProvider } from '../../../lib/nutrition';
import { PeptideProvider, compactPeptidesView, type TodayRoutine } from '../../../lib/peptides';
import { WaterProvider, compactWaterView, type WaterToday } from '../../../lib/water';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { CompactPeptidesModule } from '../CompactPeptidesModule';
import { CompactWaterModule } from '../CompactWaterModule';
import { SQUARE_HEIGHT, squareHeight } from '../geometry';

/* ── the derivations ───────────────────────────────────────────────────── */

/** Only the fields the compact view reads. Everything else is irrelevant. */
function water(overrides: Partial<WaterToday> = {}): WaterToday {
  return {
    isLoading: false,
    hasGoal: true,
    percent: 38,
    progress: 0.38,
    isGoalMet: false,
    totalLabel: '24.3 fl oz',
    goalLabel: '64 fl oz',
    remainingLabel: '39.7 fl oz',
    ...overrides,
  } as WaterToday;
}

describe('the water derivation', () => {
  it('leads with the percentage and supports it with what is left', () => {
    const view = compactWaterView(water());
    expect(view.value).toBe('38%');
    expect(view.detail).toBe('39.7 fl oz to go');
    expect(view.progress).toBe(0.38);
  });

  it('says the goal is reached rather than counting past it', () => {
    const view = compactWaterView(water({ percent: 104, progress: 1.04, isGoalMet: true }));
    expect(view.value).toBe('104%');
    expect(view.detail).toBe('Goal reached');
    // Over-goal is not clamped away — the vessel clamps its drawing, the
    // reading does not.
    expect(view.progress).toBeGreaterThan(1);
  });

  it('reads zero as zero, not as absent', () => {
    const view = compactWaterView(
      water({ percent: 0, progress: 0, totalLabel: '0 fl oz', remainingLabel: '64 fl oz' }),
    );
    expect(view.value).toBe('0%');
    // `0`, not `null` — a goal exists and none of it is filled yet.
    expect(view.progress).toBe(0);
  });

  it('invents no percentage when there is no goal', () => {
    /*
     * `null`, never `0`. Someone who set no goal has not failed to fill
     * anything, and the vessel draws that state latent rather than empty.
     */
    const view = compactWaterView(
      water({ hasGoal: false, percent: null, goalLabel: null, remainingLabel: null }),
    );
    expect(view.value).toBe('24.3 fl oz');
    expect(view.detail).toBe('No goal set');
    expect(view.progress).toBeNull();
    expect(view.spoken).toBe('Water. 24.3 fl oz today. No goal set.');
  });

  it('speaks the volumes the percentage compresses', () => {
    expect(compactWaterView(water()).spoken).toBe('Water. 24.3 fl oz of 64 fl oz. 38 percent.');
  });

  it('formats in whichever unit Water hands it, and never picks its own', () => {
    // Cups, ounces, millilitres and litres all arrive pre-formatted — this
    // function has no unit logic to disagree with the Water screen.
    for (const [total, goal] of [
      ['3 cups', '8 cups'],
      ['720 mL', '2,000 mL'],
      ['0.7 L', '2 L'],
    ]) {
      const view = compactWaterView(water({ totalLabel: total, goalLabel: goal }));
      expect(view.spoken).toContain(`${total} of ${goal}`);
    }
  });

  it('claims nothing while it is still loading', () => {
    const view = compactWaterView(water({ isLoading: true }));
    expect(view.value).toBe('—');
    expect(view.progress).toBeNull();
  });
});

/* ── peptides ──────────────────────────────────────────────────────────── */

function routine(name: string, mark: string): TodayRoutine {
  return { name, mark, setup: {} } as unknown as TodayRoutine;
}

describe('the peptide derivation', () => {
  it('counts what is scheduled and still unanswered', () => {
    const view = compactPeptidesView(
      [routine('A', 'unconfirmed'), routine('B', 'unconfirmed'), routine('C', 'taken')],
      false,
      false,
    );
    expect(view.value).toBe('2 scheduled');
    expect(view.detail).toBe('3 today');
    expect(view.outstanding).toBe(true);
  });

  it('names the routine when exactly one thing is outstanding', () => {
    const view = compactPeptidesView([routine('Semaglutide', 'unconfirmed')], false, false);
    expect(view.detail).toBe('Semaglutide');
  });

  it('says all answered without scoring it', () => {
    const view = compactPeptidesView([routine('A', 'taken')], false, false);
    expect(view.value).toBe('All answered');
    expect(view.outstanding).toBe(false);
    // No adherence, no streak, no percentage — Sprint 3's rule, still true.
    expect(view.spoken).not.toMatch(/%|streak|adherence|missed|due|overdue/i);
  });

  it('separates no routines from nothing scheduled today', () => {
    expect(compactPeptidesView([], true, false).value).toBe('No routines');
    expect(compactPeptidesView([], true, false).detail).toBe('Add one to start');
    expect(compactPeptidesView([], false, false).value).toBe('Nothing scheduled');
  });

  it('claims nothing while it is still loading', () => {
    const view = compactPeptidesView([], true, true);
    expect(view.value).toBe('—');
    expect(view.isEmpty).toBe(false);
  });
});

/* ── the components ────────────────────────────────────────────────────── */

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
            <NutritionProvider>
              <WaterProvider>
                <PeptideProvider>{element}</PeptideProvider>
              </WaterProvider>
            </NutritionProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

afterEach(async () => {
  if (mounted) await act(async () => mounted!.unmount());
  mounted = null;
  mockFontScale = 1;
  await AsyncStorage.clear();
});

describe('the water module', () => {
  const view = compactWaterView(water());

  it('draws Water’s own vessel, not a generic ring', async () => {
    // The founder ruling this slice carries: Water owns a distinctive object
    // and the compact modules were drawing the shape every health app has.
    const tree = await mount(
      <CompactWaterModule view={view} size="square" onAdd={jest.fn()} onOpen={jest.fn()} />,
    );
    expect(tree.root.findAllByType(WaterVessel)).toHaveLength(1);
    expect(tree.root.findAllByType(WaterVessel)[0].props.progress).toBe(0.38);
  });

  it('hands the vessel a null fill when there is no goal', async () => {
    const none = compactWaterView(
      water({ hasGoal: false, percent: null, goalLabel: null, remainingLabel: null }),
    );
    const tree = await mount(
      <CompactWaterModule view={none} size="square" onAdd={jest.fn()} onOpen={jest.fn()} />,
    );
    // `null`, so the vessel draws latent. `0` would say the goal was failed.
    expect(tree.root.findAllByType(WaterVessel)[0].props.progress).toBeNull();
  });

  it('carries the vessel into the wide shape too', async () => {
    const tree = await mount(
      <CompactWaterModule view={view} size="wide" onAdd={jest.fn()} onOpen={jest.fn()} />,
    );
    expect(tree.root.findAllByType(WaterVessel)).toHaveLength(1);
  });

  it('stands the vessel aside at accessibility text sizes, keeping every figure', async () => {
    mockFontScale = 1.6;
    const tree = await mount(
      <CompactWaterModule view={view} size="square" onAdd={jest.fn()} onOpen={jest.fn()} />,
    );
    expect(tree.root.findAllByType(WaterVessel)).toHaveLength(0);
    const spoken = tree.root.findAll(
      (node) => typeof node.props?.accessibilityLabel === 'string',
    )[0].props.accessibilityLabel;
    expect(spoken).toBe(view.spoken);
  });
});

describe('the shared footprint', () => {
  it('is one height, and it grows with the text', () => {
    expect(squareHeight(1)).toBe(SQUARE_HEIGHT);
    expect(squareHeight(1.5)).toBeGreaterThan(squareHeight(1));
    // Damped and bounded: it does not chase an unbounded scale.
    expect(squareHeight(3)).toBe(squareHeight(2));
  });

  it('is the same for Water and Peptides', async () => {
    const tree = await mount(
      <>
        <CompactWaterModule
          view={compactWaterView(water())}
          size="square"
          onAdd={jest.fn()}
          onOpen={jest.fn()}
        />
        <CompactPeptidesModule
          view={compactPeptidesView([], true, false)}
          size="square"
          onOpen={jest.fn()}
        />
      </>,
    );

    /*
     * Read from the module's own root pressable rather than from the host it
     * renders: `PressableScale` forwards `style` to an inner animated view, so
     * the node carrying the `testID` is not the node carrying the style.
     */
    const heights = [/^Water\./, /^Peptides\./].map((label) => {
      const node = tree.root.find(
        (candidate) =>
          typeof candidate.props?.onPress === 'function' &&
          label.test(String(candidate.props?.accessibilityLabel ?? '')),
      );
      return (StyleSheet.flatten(node.props.style as ViewStyle) ?? {}).minHeight;
    });
    expect(heights[0]).toBe(SQUARE_HEIGHT);
    expect(heights[0]).toBe(heights[1]);
  });
});

/* ── the point of the whole slice ──────────────────────────────────────── */

describe('Home and Fuel', () => {
  /**
   * The module of a given kind rendered by a screen, with the props it got.
   *
   * Deliberately located by *component type*: if either screen ever goes back
   * to drawing its own, this finds nothing and the test fails — which is the
   * regression worth catching.
   */
  function moduleOf(tree: ReactTestRenderer, type: React.ElementType) {
    return tree.root.findAllByType(type as never)[0];
  }

  async function seed() {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('vita:v1:water:goal', JSON.stringify({ amount: 64, unit: 'floz' }));
  }

  it('render the same Water module from the same view', async () => {
    await seed();
    const home = await mount(<Dashboard />);
    const homeView = moduleOf(home, CompactWaterModule).props.view;
    await act(async () => home.unmount());
    mounted = null;

    const fuel = await mount(<Fuel />);
    const fuelView = moduleOf(fuel, CompactWaterModule).props.view;

    expect(fuelView).toEqual(homeView);
    expect(fuelView.detail).toBe('64 fl oz to go');
  });

  it('render the same Peptides module from the same view', async () => {
    await seed();
    const home = await mount(<Dashboard />);
    const homeView = moduleOf(home, CompactPeptidesModule).props.view;
    await act(async () => home.unmount());
    mounted = null;

    const fuel = await mount(<Fuel />);
    expect(moduleOf(fuel, CompactPeptidesModule).props.view).toEqual(homeView);
  });

  it('both default their Water and Peptides to square', async () => {
    await seed();
    const home = await mount(<Dashboard />);
    expect(moduleOf(home, CompactWaterModule).props.size).toBe('square');
    expect(moduleOf(home, CompactPeptidesModule).props.size).toBe('square');
    await act(async () => home.unmount());
    mounted = null;

    const fuel = await mount(<Fuel />);
    expect(moduleOf(fuel, CompactWaterModule).props.size).toBe('square');
    expect(moduleOf(fuel, CompactPeptidesModule).props.size).toBe('square');
  });

  it('keep their layout preferences apart', async () => {
    /*
     * **Presentation is shared; the layout choice is not.** Fuel storing a
     * wide Water must leave Home exactly as it was — they are different
     * records under different keys and always will be.
     */
    await seed();
    await AsyncStorage.setItem(
      'vita:v1:fuel:layout',
      JSON.stringify({
        order: ['nutrition', 'meals', 'water', 'peptides', 'dayStrip'],
        hidden: ['dayStrip'],
        sizes: { water: 'wide', peptides: 'square' },
      }),
    );

    const fuel = await mount(<Fuel />);
    expect(moduleOf(fuel, CompactWaterModule).props.size).toBe('wide');
    await act(async () => fuel.unmount());
    mounted = null;

    const home = await mount(<Dashboard />);
    expect(moduleOf(home, CompactWaterModule).props.size).toBe('square');
    // And nothing wrote to Home's record.
    expect(await AsyncStorage.getItem('vita:v1:dashboard:layout')).toBeNull();
  });
});
