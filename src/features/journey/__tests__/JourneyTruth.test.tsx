/**
 * Slice 6.1 — Journey says only what VITA knows.
 *
 * Before 6.1 the Journey tab rendered `JOURNEY_FIXTURE` to every user: a
 * 185.2 lb current weight, a green "−2.4 lbs in the last 4 weeks",
 * "Momentum — Week 4 of 24", completed milestones, a workout count and
 * "You dropped 2.4 lbs. Keep the momentum." None of it was entered by the
 * person holding the phone.
 *
 * These pin the product contract, not the layout: what must be absent, the
 * truthful empty state that replaced it, and the gold identity that replaced
 * the success-green one. No snapshot of the whole screen.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

import { Ionicons } from '@expo/vector-icons';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import Journey from '../../../app/(vita)/(tabs)/journey';
import { FloatingDock } from '../../../components/shell/FloatingDock';
import type { PreferencesRepository } from '../../../lib/preferences/data/PreferencesRepository';
import type { ThemeMode } from '../../../lib/preferences/model/types';
import { journeyAccent, palette } from '../../../theme/tokens';
import { ToastProvider } from '../../../components/ui';
import { ThemeProvider } from '../../../theme/ThemeProvider';

const ROOT = join(__dirname, '..', '..', '..', '..');

/** Code only — the history comments that name the fixture are allowed. */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function themeRepository(themeMode: ThemeMode): PreferencesRepository {
  return { get: async () => ({ themeMode }), save: async () => {} };
}

let mounted: ReactTestRenderer | null = null;

async function mount(element: React.ReactElement, themeMode: ThemeMode = 'light') {
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 47, left: 0, right: 0, bottom: 34 },
        }}
      >
        <ThemeProvider repository={themeRepository(themeMode)}>
          <ToastProvider>{element}</ToastProvider>
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

function screenText(tree: ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = node.props.children;
      return Array.isArray(children) ? children.join('') : String(children ?? '');
    })
    .join(' \n ');
}

/** Mounts release Journey and returns the text of all three pillars, visited in turn. */
async function allPillarsText(): Promise<string> {
  const tree = await mount(<Journey />);
  const parts = [screenText(tree)];
  for (const pillar of ['Weight', 'Photos', 'Overview']) {
    const control = tree.root.findAll(
      (node) => node.props.accessibilityLabel === `Journey, ${pillar}` && typeof node.props.onPress === 'function',
    )[0];
    await act(async () => control.props.onPress());
    parts.push(screenText(tree));
  }
  return parts.join(' \n ');
}

describe('release Journey with no recorded weight — every pillar', () => {
  it('renders the truthful empty state', async () => {
    const text = await allPillarsText();
    expect(text).toContain('My Journey');
    expect(text).toContain('No weight entries yet');
    expect(text).toContain('No progress photos yet');
  });

  it('shows no invented weight, delta or trend', async () => {
    const text = await allPillarsText();
    for (const fiction of ['185.2', '186.2', '191.8', '175.0', '2.4', ' lb', 'lbs', 'Weight Trend', 'Average Weight', 'Goal Weight']) {
      expect(text).not.toContain(fiction);
    }
  });

  it('shows no staged program', async () => {
    const text = await allPillarsText();
    expect(text).not.toMatch(/week\s+\d+\s+of\s+\d+/i);
    for (const stage of ['Momentum', 'Foundation', 'Journey Stage']) {
      expect(text).not.toContain(stage);
    }
  });

  it('shows no milestones, workouts, streaks or rewards', async () => {
    const text = (await allPillarsText()).toLowerCase();
    for (const fiction of ['milestone', 'workout', 'streak', 'achievement', 'reward', '5 / 5', 'protein goal']) {
      expect(text).not.toContain(fiction);
    }
  });

  it('generates no praise or judgment', async () => {
    const text = (await allPillarsText()).toLowerCase();
    for (const judgment of ['momentum', 'dropped', 'keep going', 'keep the', 'great', 'success', 'on track', 'off track', 'improv', 'setback', 'results will follow', 'well done', 'congrat']) {
      expect(text).not.toContain(judgment);
    }
    // "Progress" survives only as the name of the thing — a progress photo —
    // never as a verdict ("making progress", "great progress").
    expect(text.replace(/progress[- ]photo/g, '')).not.toContain('progress');
  });

  it('draws no chart on any pillar', async () => {
    const tree = await mount(<Journey />);
    for (const pillar of ['Overview', 'Weight', 'Photos']) {
      const control = tree.root.findAll(
        (node) => node.props.accessibilityLabel === `Journey, ${pillar}` && typeof node.props.onPress === 'function',
      )[0];
      await act(async () => control.props.onPress());
      expect(tree.root.findAllByType(Svg)).toHaveLength(0);
    }
  });

  it('offers no action into an unfinished flow', async () => {
    // Since 6.4 Weight has one real action, Log Weight. Photo capture is 6.5,
    // so Photos and Overview still have none beyond the pillar segments.
    const text = (await allPillarsText()).toLowerCase();
    const tree = mounted!;
    for (const action of ['add photo', 'take a photo', 'upload', 'view all', 'coming soon', 'sprint', 'soon']) {
      expect(text).not.toContain(action);
    }
    const expected: Record<string, string[]> = {
      Overview: [],
      Weight: ['Log Weight'],
      Photos: [],
    };
    for (const pillar of ['Overview', 'Weight', 'Photos']) {
      const control = tree.root.findAll(
        (node) => node.props.accessibilityLabel === `Journey, ${pillar}` && typeof node.props.onPress === 'function',
      )[0];
      await act(async () => control.props.onPress());
      const buttons = tree.root.findAll(
        (node) => typeof node.type === 'string' && (node.props.accessibilityRole === 'button' || typeof node.props.onPress === 'function'),
      );
      const labels = buttons.map((node) => node.props.accessibilityLabel ?? '');
      expect(labels.filter((label) => !/^Journey, |^Settings$/.test(label)).filter(Boolean).sort()).toEqual(expected[pillar]);
    }
  });
});

describe('the fixture cannot reach release runtime', () => {
  it('no longer exists as a data source', () => {
    for (const path of ['api.ts', 'mock.ts', 'components/OverviewTab.tsx', 'components/WeightTab.tsx', 'components/PhotosTab.tsx']) {
      expect(existsSync(join(ROOT, 'src/features/journey', path))).toBe(false);
    }
  });

  it('is referenced nowhere in source', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name) && withoutComments(readFileSync(full, 'utf8')).includes('JOURNEY_FIXTURE')) {
          offenders.push(full);
        }
      }
    };
    walk(join(ROOT, 'src'));
    expect(offenders).toEqual([]);
  });
});

describe('Journey identity is gold, and gold is not a verdict', () => {
  it('palette.journey is brand gold, not the success green', () => {
    expect(palette.journey).toBe(palette.gold);
    expect(palette.journey).not.toBe(palette.success);
    expect(palette.journey).not.toBe(palette.protein);
    expect(palette.journey).not.toBe(palette.fat);
  });

  it('the scheme pair is gold in both themes, with no green or red', () => {
    expect(journeyAccent.dark).toBe(palette.gold);
    expect(journeyAccent.light).toBe('#8A6A2C');
    for (const value of Object.values(journeyAccent)) {
      expect([palette.success, palette.protein, palette.fat]).not.toContain(value);
    }
  });

  it('no Journey source attaches green or red to weight movement', () => {
    const dir = join(ROOT, 'src/features/journey');
    const sources: string[] = [];
    const walk = (d: string) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name)) sources.push(withoutComments(readFileSync(full, 'utf8')));
      }
    };
    walk(dir);
    sources.push(withoutComments(readFileSync(join(ROOT, 'src/app/(vita)/(tabs)/journey.tsx'), 'utf8')));
    const all = sources.join('\n');
    for (const verdict of ['palette.success', 'palette.fat', 'palette.protein', 'journeySoft', '#2E9E5B']) {
      expect(all).not.toContain(verdict);
    }
  });

  async function dockJourneyColor(themeMode: ThemeMode, activeRoute: string) {
    const routes = ['dashboard', 'fuel', 'journey', 'atlas'].map((name) => ({ key: name, name }));
    const props = {
      state: { index: routes.findIndex((r) => r.name === activeRoute), routes },
      navigateToTab: jest.fn(),
    } as unknown as Parameters<typeof FloatingDock>[0];
    const tree = await mount(<FloatingDock {...props} />, themeMode);
    const tab = tree.root.findAll((node) => node.props.accessibilityLabel === 'Journey' && node.props.accessibilityRole === 'tab')[0];
    return tab.findByType(Ionicons).props.color as string;
  }

  it('the dock tints selected Journey gold — deepened in Light, brand gold in Dark', async () => {
    expect(await dockJourneyColor('light', 'journey')).toBe(journeyAccent.light);
    await act(async () => mounted!.unmount());
    mounted = null;
    expect(await dockJourneyColor('dark', 'journey')).toBe(journeyAccent.dark);
  });

  it('leaves the other dock tints exactly as they were', async () => {
    const routes = ['dashboard', 'fuel', 'journey', 'atlas'].map((name) => ({ key: name, name }));
    const colorOf = async (active: string, label: string) => {
      const props = {
        state: { index: routes.findIndex((r) => r.name === active), routes },
        navigateToTab: jest.fn(),
      } as unknown as Parameters<typeof FloatingDock>[0];
      const tree = await mount(<FloatingDock {...props} />, 'light');
      const tab = tree.root.findAll((node) => node.props.accessibilityLabel === label && node.props.accessibilityRole === 'tab')[0];
      const color = tab.findByType(Ionicons).props.color as string;
      await act(async () => tree.unmount());
      mounted = null;
      return color;
    };
    expect(await colorOf('fuel', 'Fuel')).toBe(palette.primary);
    expect(await colorOf('atlas', 'Atlas')).toBe(palette.peptide);
    expect(await colorOf('dashboard', 'Home')).toBe(palette.text);
  });

  it('navigates through the tab bar API Expo Router 58 provides', async () => {
    // SDK 58 removed `navigation` from a custom tab bar's props; the dock now
    // calls `navigateToTab(routeKey)`. A dock still calling the old API would
    // throw on the first tap on a real device.
    const routes = ['dashboard', 'fuel', 'journey', 'atlas'].map((name) => ({ key: `${name}-key`, name }));
    const navigateToTab = jest.fn();
    const props = {
      state: { index: 0, routes },
      navigateToTab,
    } as unknown as Parameters<typeof FloatingDock>[0];
    const tree = await mount(<FloatingDock {...props} />, 'light');
    const tab = (label: string) =>
      tree.root.findAll((node) => node.props.accessibilityLabel === label && node.props.accessibilityRole === 'tab' && typeof node.props.onPress === 'function')[0];
    await act(async () => tab('Journey').props.onPress());
    expect(navigateToTab).toHaveBeenCalledWith('journey-key');
    navigateToTab.mockClear();
    await act(async () => tab('Home').props.onPress());
    expect(navigateToTab).not.toHaveBeenCalled();
  });
});
