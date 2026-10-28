/**
 * Shared test harness for the Journey screens (slice 6.5).
 *
 * Mounts a route under the **real** root providers — `WeightProvider` and
 * `JourneyProvider` over their AsyncStorage repositories — exactly as
 * `src/app/_layout.tsx` does, so a test reads and writes the same storage the
 * app does. Each test file still declares its own `jest.mock`s (they are
 * hoisted per file); this module only renders and inspects.
 *
 * Not a test file: `jest.config.js` matches `*.test.ts(x)` only.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { ToastProvider } from '../../../components/ui';
import { shiftLogDate, toLogDate } from '../../../lib/daily';
import { JourneyKeys, JourneyProvider, WeightProvider, toKg, type Journey, type WeightEntry } from '../../../lib/journey';
import type { PreferencesRepository } from '../../../lib/preferences/data/PreferencesRepository';
import type { ThemeMode } from '../../../lib/preferences/model/types';
import { ThemeProvider } from '../../../theme/ThemeProvider';

let mounted: ReactTestRenderer | null = null;

export function currentTree(): ReactTestRenderer | null {
  return mounted;
}

export async function mountApp(element: React.ReactElement, themeMode: ThemeMode = 'light'): Promise<ReactTestRenderer> {
  const theme: PreferencesRepository = { get: async () => ({ themeMode }), save: async () => {} };
  await act(async () => {
    mounted = create(
      <SafeAreaProvider
        initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}
      >
        <ThemeProvider repository={theme}>
          <WeightProvider>
            <JourneyProvider>
              <ToastProvider>{element}</ToastProvider>
            </JourneyProvider>
          </WeightProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return mounted!;
}

export async function unmountApp() {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
}

/* ── reading the screen ─────────────────────────────────────────────── */

export function text(tree: ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((node) => {
      const children = node.props.children;
      return Array.isArray(children) ? children.join('') : String(children ?? '');
    })
    .join(' \n ');
}

function matches(label: string | RegExp, value: unknown): boolean {
  return typeof label === 'string' ? value === label : typeof value === 'string' && label.test(value);
}

/** A pressable found by accessibility label, or — for chips and toasts — by its visible text. */
export function control(tree: ReactTestRenderer, label: string | RegExp): ReactTestInstance {
  const found = tree.root.findAll((node) => matches(label, node.props.accessibilityLabel) && typeof node.props.onPress === 'function');
  if (found.length) return found[0];
  for (const node of tree.root.findAllByType(Text)) {
    const children = node.props.children;
    if (!matches(label, Array.isArray(children) ? children.join('') : children)) continue;
    let parent: ReactTestInstance | null = node.parent;
    while (parent && typeof parent.props.onPress !== 'function') parent = parent.parent;
    if (parent) return parent;
  }
  throw new Error(`No control labelled ${label}`);
}

export function hasControl(tree: ReactTestRenderer, label: string | RegExp): boolean {
  try {
    control(tree, label);
    return true;
  } catch {
    return false;
  }
}

export function field(tree: ReactTestRenderer, label: string): ReactTestInstance {
  const found = tree.root.findAll((node) => node.props.accessibilityLabel === label && typeof node.props.onChangeText === 'function');
  if (!found.length) throw new Error(`No field labelled ${label}`);
  return found[0];
}

export async function press(tree: ReactTestRenderer, label: string | RegExp) {
  await act(async () => control(tree, label).props.onPress());
}

export async function type(tree: ReactTestRenderer, label: string, value: string) {
  await act(async () => field(tree, label).props.onChangeText(value));
}

export async function pillar(tree: ReactTestRenderer, name: 'Overview' | 'Weight' | 'Photos') {
  await press(tree, `Journey, ${name}`);
}

export function hasPillars(tree: ReactTestRenderer): boolean {
  return hasControl(tree, 'Journey, Overview');
}

/* ── storage ────────────────────────────────────────────────────────── */

export const TODAY = toLogDate(new Date());

export function at(daysAgo: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function journeyFixture(overrides: Partial<Journey> & { id: string }): Journey {
  const startDate = overrides.startDate ?? shiftLogDate(TODAY, -10);
  return {
    name: 'Test Journey',
    startDate,
    plannedEndDate: shiftLogDate(startDate, 89),
    status: 'active',
    createdAt: at(10, 7),
    ...overrides,
  };
}

export function entry(id: string, iso: string, lb: number, journeyId?: string): WeightEntry {
  return { id, loggedAt: iso, weightKg: toKg(lb, 'lb'), enteredUnit: 'lb', ...(journeyId ? { journeyId } : {}) };
}

export async function seedStorage({
  journeys = [],
  weights = [],
  unit,
}: {
  journeys?: Journey[];
  weights?: WeightEntry[];
  unit?: 'lb' | 'kg';
}) {
  if (journeys.length) await AsyncStorage.setItem(JourneyKeys.journeys, JSON.stringify(journeys));
  if (weights.length) await AsyncStorage.setItem(JourneyKeys.weight, JSON.stringify(weights));
  if (unit) await AsyncStorage.setItem(JourneyKeys.preferences, JSON.stringify({ unit }));
}

export async function storedWeights(): Promise<WeightEntry[]> {
  const raw = await AsyncStorage.getItem(JourneyKeys.weight);
  return raw ? (JSON.parse(raw) as WeightEntry[]) : [];
}

export async function storedJourneys(): Promise<Journey[]> {
  const raw = await AsyncStorage.getItem(JourneyKeys.journeys);
  return raw ? (JSON.parse(raw) as Journey[]) : [];
}
