import { singletonKey } from '../../lib/daily/keys';
import { DEFAULT_LAYOUT, normalizeLayout, type DashboardLayout } from './modules';
import {
  DEFAULT_QUICK_TOOLS,
  normalizeQuickTools,
  type QuickToolsPrefs,
} from './quickTools';
import { usePersistedPrefs, type PrefsUpdate } from './usePersistedPrefs';

/** `vita:v1:dashboard:layout` — built from the shared helper so the namespace cannot drift. */
export const DASHBOARD_LAYOUT_KEY = singletonKey('dashboard', 'layout');

/** `vita:v1:dashboard:tools` — a separate record, so the two never clobber each other. */
export const QUICK_TOOLS_KEY = singletonKey('dashboard', 'tools');

export type DashboardLayoutState = {
  layout: DashboardLayout;
  isLoading: boolean;
  setLayout: (next: PrefsUpdate<DashboardLayout>) => void;
};

/**
 * Home's widget layout — which modules show, in what order, at what size.
 *
 * Kept in its own record rather than merged with Quick Tools: they change for
 * different reasons and at different times, and one write must never drop the
 * other's state.
 */
export function useDashboardLayout(): DashboardLayoutState {
  const { value, isLoading, setValue } = usePersistedPrefs<DashboardLayout>(
    DASHBOARD_LAYOUT_KEY,
    normalizeLayout,
    DEFAULT_LAYOUT,
  );
  return { layout: value, isLoading, setLayout: setValue };
}

export type QuickToolsState = {
  tools: QuickToolsPrefs;
  isLoading: boolean;
  setTools: (next: PrefsUpdate<QuickToolsPrefs>) => void;
};

/**
 * Which utilities Quick Tools shows, and in what order.
 *
 * A user with no stored record gets all three, so **the Food Scanner appears
 * for existing users** without a migration step — `normalizeQuickTools`
 * appends any tool a saved order predates.
 */
export function useQuickTools(): QuickToolsState {
  const { value, isLoading, setValue } = usePersistedPrefs<QuickToolsPrefs>(
    QUICK_TOOLS_KEY,
    normalizeQuickTools,
    DEFAULT_QUICK_TOOLS,
  );
  return { tools: value, isLoading, setTools: setValue };
}
