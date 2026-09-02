/**
 * `ThemeProvider` persistence, exercised through real React renders.
 *
 * The bug this slice fixed is a startup bug, so every test here is written
 * as a *relaunch*: mount, act, unmount, mount again against the same store.
 * Toggling the control and observing the theme change proves nothing about
 * the defect — that already worked. What did not work was coming back.
 *
 * The probe renders nothing; it exists only to hand the context out so the
 * provider's actual state can be asserted rather than reasoned about.
 */

// The provider's *default* repository is the AsyncStorage one, so importing
// it pulls the native module in even though most tests here inject a fake.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { Appearance } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { PreferencesRepository } from '../data/PreferencesRepository';
import type { AppPreferences, ThemeMode } from '../model/types';
import { ThemeProvider, useTheme } from '../../../theme/ThemeProvider';

/** An in-memory repository — the injectable seam the provider was built with. */
function fakeRepository(seed: AppPreferences | null = null) {
  let stored: AppPreferences | null = seed;
  const repository: PreferencesRepository = {
    async get() {
      return stored;
    },
    async save(next) {
      stored = next;
    },
  };
  return { repository, read: () => stored };
}

type Captured = { mode: ThemeMode; scheme: string; setMode: (mode: ThemeMode) => void };

let captured: Captured | null = null;

function Probe() {
  const { mode, scheme, setMode } = useTheme();
  captured = { mode, scheme, setMode };
  return null;
}

let mounted: ReactTestRenderer | null = null;

async function mount(repository: PreferencesRepository): Promise<void> {
  await act(async () => {
    mounted = create(
      <ThemeProvider repository={repository}>
        <Probe />
      </ThemeProvider>,
    );
  });
}

async function unmount(): Promise<void> {
  const tree = mounted;
  mounted = null;
  if (tree) await act(async () => tree.unmount());
}

/** Mount, run something, unmount — one app session. */
async function session(repository: PreferencesRepository, during?: () => Promise<void>): Promise<Captured> {
  await mount(repository);
  if (during) await during();
  const result = captured!;
  await unmount();
  return result;
}

afterEach(async () => {
  await unmount();
  captured = null;
  jest.restoreAllMocks();
});

describe('hydration', () => {
  it('uses System when nothing has ever been stored', async () => {
    const { repository } = fakeRepository(null);
    const state = await session(repository);
    expect(state.mode).toBe('system');
  });

  it.each<ThemeMode>(['light', 'dark', 'system'])('restores a stored %s', async (mode) => {
    const { repository } = fakeRepository({ themeMode: mode });
    const state = await session(repository);
    expect(state.mode).toBe(mode);
  });

  /**
   * The defect, stated as the founder stated it: choose Dark, close the
   * app, reopen it, still Dark.
   */
  it.each<ThemeMode>(['light', 'dark', 'system'])(
    'keeps %s across a relaunch of the same store',
    async (mode) => {
      const { repository } = fakeRepository(null);

      await session(repository, async () => {
        await act(async () => captured!.setMode(mode));
      });

      const relaunched = await session(repository);
      expect(relaunched.mode).toBe(mode);
    },
  );

  it('persists the last of several choices', async () => {
    const { repository, read } = fakeRepository(null);

    await session(repository, async () => {
      await act(async () => captured!.setMode('dark'));
      await act(async () => captured!.setMode('light'));
      await act(async () => captured!.setMode('dark'));
    });

    expect(read()).toEqual({ themeMode: 'dark' });
    expect((await session(repository)).mode).toBe('dark');
  });
});

describe('resolved scheme', () => {
  it('applies an explicit choice regardless of the device', async () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
    const { repository } = fakeRepository({ themeMode: 'light' });
    expect((await session(repository)).scheme).toBe('light');
  });

  /**
   * `system` is a real persistent choice, not the absence of one: after a
   * relaunch it must still be *following* the device rather than having
   * frozen whatever the device happened to be when it was chosen.
   */
  it('keeps following the device after a relaunch on System', async () => {
    const { repository } = fakeRepository({ themeMode: 'system' });

    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
    expect((await session(repository)).scheme).toBe('dark');

    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const second = await session(repository);
    expect(second.mode).toBe('system');
    expect(second.scheme).toBe('light');
  });
});

describe('damaged or unavailable storage', () => {
  it('falls back to the default when the read throws', async () => {
    const repository: PreferencesRepository = {
      async get() {
        throw new Error('storage unavailable');
      },
      async save() {},
    };

    const state = await session(repository);
    expect(state.mode).toBe('system');
  });

  /**
   * The important half of that: a failed read must not leave the app
   * permanently blank. `hydrated` is set in a `finally`, so children still
   * mount — proven by the probe having reported anything at all.
   */
  it('still renders its children when the read throws', async () => {
    const repository: PreferencesRepository = {
      async get() {
        throw new Error('storage unavailable');
      },
      async save() {},
    };

    await mount(repository);
    expect(captured).not.toBeNull();
  });

  it('keeps the choice for the session when the write fails', async () => {
    const repository: PreferencesRepository = {
      async get() {
        return null;
      },
      async save() {
        throw new Error('disk full');
      },
    };

    await mount(repository);
    await act(async () => captured!.setMode('dark'));
    // The user's choice still applies even though it could not be stored —
    // reverting the UI would be a second failure on top of the first.
    expect(captured!.mode).toBe('dark');
  });
});
