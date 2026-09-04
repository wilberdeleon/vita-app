import { useCallback, useEffect, useRef, useState } from 'react';
import { singletonKey } from '../../lib/daily/keys';
import { readJson, writeJson } from '../../lib/daily/storage';
import { DEFAULT_LAYOUT, normalizeLayout, type DashboardLayout } from './modules';

/** `vita:v1:dashboard:layout` — built from the shared helper so the namespace cannot drift. */
export const DASHBOARD_LAYOUT_KEY = singletonKey('dashboard', 'layout');

export type DashboardLayoutState = {
  layout: DashboardLayout;
  /** True until the stored layout has been read. */
  isLoading: boolean;
  setLayout: (next: DashboardLayout) => void;
};

/**
 * Home's own layout preference, persisted.
 *
 * ## Why this has its own key rather than joining app preferences
 *
 * `src/lib/preferences` looks like the obvious home, and it is not — for two
 * reasons, one architectural and one concrete.
 *
 * The architectural one is its own stated rule: it holds preferences that
 * *no single feature owns*. Appearance passes that test because it changes
 * every screen. Which modules Home shows is owned by Home and read by
 * nothing else, so it belongs with the feature, exactly as Water's display
 * unit stays under `vita:v1:water:prefs`.
 *
 * The concrete one settles it. `PreferencesRepository.save()` writes the
 * **whole record**, and `ThemeProvider` calls it as `save({ themeMode })` —
 * so any field added alongside would be erased the next time someone changed
 * their theme. Fixing that means changing founder-approved Sprint 4 code to
 * carry a preference it has no reason to know about. A separate key costs
 * nothing and cannot collide.
 *
 * ## Reads are guarded, writes are fire-and-forget
 *
 * Whatever comes back is put through `normalizeLayout`, so a stale, partial,
 * duplicated or hand-edited record still produces a Home that renders. A
 * failed *write* is deliberately silent: the change already applies for this
 * session, and an alert about a preference that will re-apply itself next
 * time someone taps is more alarming than the loss it describes — the same
 * reasoning `ThemeProvider` records for the same trade.
 */
export function useDashboardLayout(): DashboardLayoutState {
  const [layout, setLayoutState] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await readJson(DASHBOARD_LAYOUT_KEY);
        // `null` means nothing was ever saved, which is not an error — it is
        // a user who has not customised Home, and they get the default.
        if (!cancelled && stored !== null) setLayoutState(normalizeLayout(stored));
      } catch (error) {
        if (__DEV__) console.warn('[dashboard] could not read the saved layout', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Shadows state so two changes in the same tick both persist — the same
   * refs pattern `WaterProvider` uses, and for the same reason: tapping
   * *move up* twice quickly must not write the first result twice.
   */
  const latest = useRef(DEFAULT_LAYOUT);
  latest.current = layout;

  const setLayout = useCallback((next: DashboardLayout) => {
    // Home changes immediately and does not wait on storage. A layout that
    // lagged a tap behind a disk write would feel broken.
    latest.current = next;
    setLayoutState(next);

    void (async () => {
      try {
        await writeJson(DASHBOARD_LAYOUT_KEY, next);
      } catch (error) {
        if (__DEV__) console.warn('[dashboard] could not save the layout', error);
      }
    })();
  }, []);

  return { layout, isLoading, setLayout };
}
