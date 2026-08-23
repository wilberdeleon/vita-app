/**
 * The single source of truth for peptide definitions and setups.
 *
 * Context + `useReducer` with shadow refs, mirroring `NutritionProvider` and
 * `WaterProvider` rather than abstracting a shared `TrackerProvider<T>`. The
 * three look alike because the *pattern* is right; the domains are genuinely
 * different, and a generic built to satisfy all of them would hide what each
 * one does.
 *
 * Deliberately not here: administration logging (slice 3.7), dose calculation
 * (3.6), and injection sites (3.8). This provider owns definitions and setups
 * and nothing else.
 *
 * There is also no day rollover. Setups are not day-keyed — a configuration
 * does not belong to a calendar day the way a drink or a meal does.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from 'react';
import { newId } from '../../daily/ids';
import { PEPTIDE_CATALOG, findCatalogDefinition } from '../data/catalog';
import { asyncStoragePeptideRepository } from '../data/asyncStorageRepository';
import type { PeptideRepository } from '../data/PeptideRepository';
import { applySetupChanges, createPeptideSetup, type PeptideSetupChanges, type PeptideSetupDraft } from '../model/setups';
import type { PeptideDefinition, PeptideSetup } from '../model/types';

type Status = 'loading' | 'ready';

type PeptideState = {
  status: Status;
  setups: PeptideSetup[];
  /** Definitions the user created. The catalog is compiled, not stored. */
  customDefinitions: PeptideDefinition[];
  /** Set when persistence failed, so the UI can say so rather than look empty. */
  error: string | null;
};

type Action =
  | { type: 'loadFinished'; setups: PeptideSetup[]; customDefinitions: PeptideDefinition[] }
  | { type: 'loadFailed'; message: string }
  | { type: 'setSetups'; setups: PeptideSetup[] }
  | { type: 'setCustomDefinitions'; customDefinitions: PeptideDefinition[] }
  | { type: 'setError'; message: string | null };

function reducer(state: PeptideState, action: Action): PeptideState {
  switch (action.type) {
    case 'loadFinished':
      return {
        status: 'ready',
        setups: action.setups,
        customDefinitions: action.customDefinitions,
        error: null,
      };
    case 'loadFailed':
      return { ...state, status: 'ready', error: action.message };
    case 'setSetups':
      return { ...state, setups: action.setups };
    case 'setCustomDefinitions':
      return { ...state, customDefinitions: action.customDefinitions };
    case 'setError':
      return { ...state, error: action.message };
  }
}

export type PeptideContextValue = PeptideState & {
  /** The compiled catalog, exposed so screens never import the data module directly. */
  catalog: readonly PeptideDefinition[];
  /** Resolves a setup's `definitionId` across the catalog and custom definitions. */
  findDefinition: (definitionId: string) => PeptideDefinition | undefined;
  /** Creates and persists a custom definition, returning it so a setup can follow. */
  createCustomDefinition: (name: string, category?: string) => Promise<PeptideDefinition>;
  /** Creates a setup for a definition. Returns it so callers can navigate to it. */
  addSetup: (definitionId: string, draft?: PeptideSetupDraft) => Promise<PeptideSetup>;
  updateSetup: (id: string, changes: PeptideSetupChanges) => Promise<void>;
  setSetupActive: (id: string, active: boolean) => Promise<void>;
};

const PeptideContext = createContext<PeptideContextValue | null>(null);

type Props = PropsWithChildren<{
  /** Injectable so a Supabase implementation — or a test double — drops in unchanged. */
  repository?: PeptideRepository;
}>;

export function PeptideProvider({ children, repository = asyncStoragePeptideRepository }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'loading',
    setups: [],
    customDefinitions: [],
    error: null,
  });

  /**
   * Refs shadow the reducer state so a mutation reads the true current array
   * even when two fire in the same tick — reducer state would not have
   * re-rendered yet, and the second write would silently drop the first.
   */
  const setupsRef = useRef<PeptideSetup[]>([]);
  const definitionsRef = useRef<PeptideDefinition[]>([]);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [setups, customDefinitions] = await Promise.all([
          repository.getSetups(),
          repository.getCustomDefinitions(),
        ]);
        if (!active) return;
        setupsRef.current = setups;
        definitionsRef.current = customDefinitions;
        dispatch({ type: 'loadFinished', setups, customDefinitions });
      } catch {
        if (!active) return;
        dispatch({ type: 'loadFailed', message: "We couldn't load your peptides." });
      }
    })();

    return () => {
      active = false;
    };
  }, [repository]);

  const commitSetups = useCallback(
    async (next: PeptideSetup[]) => {
      setupsRef.current = next;
      dispatch({ type: 'setSetups', setups: next });
      try {
        await repository.saveSetups(next);
        dispatch({ type: 'setError', message: null });
      } catch {
        // State keeps the optimistic value — reverting would discard what the
        // user just did. The message is what tells them it isn't saved.
        dispatch({ type: 'setError', message: "We couldn't save that. Your changes may not persist." });
      }
    },
    [repository],
  );

  const findDefinition = useCallback(
    (definitionId: string) =>
      findCatalogDefinition(definitionId) ??
      definitionsRef.current.find((definition) => definition.id === definitionId),
    [],
  );

  const createCustomDefinition = useCallback(
    async (name: string, category?: string) => {
      const definition: PeptideDefinition = {
        id: newId('custom'),
        name: name.trim(),
        classification: 'custom',
        origin: 'user',
        ...(category?.trim() ? { category: category.trim() } : {}),
      };

      const next = [...definitionsRef.current, definition];
      definitionsRef.current = next;
      dispatch({ type: 'setCustomDefinitions', customDefinitions: next });

      try {
        await repository.saveCustomDefinitions(next);
      } catch {
        dispatch({ type: 'setError', message: "We couldn't save that peptide. It may not persist." });
      }
      return definition;
    },
    [repository],
  );

  const addSetup = useCallback(
    async (definitionId: string, draft: PeptideSetupDraft = {}) => {
      const setup = createPeptideSetup(definitionId, draft);
      await commitSetups([...setupsRef.current, setup]);
      return setup;
    },
    [commitSetups],
  );

  const updateSetup = useCallback(
    (id: string, changes: PeptideSetupChanges) =>
      commitSetups(
        setupsRef.current.map((setup) => (setup.id === id ? applySetupChanges(setup, changes) : setup)),
      ),
    [commitSetups],
  );

  /**
   * Deactivation is a state change, never a deletion. The setup keeps every
   * field, and once logging exists its history stays intact and independent
   * of whether the setup is currently active.
   */
  const setSetupActive = useCallback(
    (id: string, active: boolean) => updateSetup(id, { active }),
    [updateSetup],
  );

  const value = useMemo<PeptideContextValue>(
    () => ({
      ...state,
      catalog: PEPTIDE_CATALOG,
      findDefinition,
      createCustomDefinition,
      addSetup,
      updateSetup,
      setSetupActive,
    }),
    [state, findDefinition, createCustomDefinition, addSetup, updateSetup, setSetupActive],
  );

  return <PeptideContext.Provider value={value}>{children}</PeptideContext.Provider>;
}

export function usePeptideContext(): PeptideContextValue {
  const context = useContext(PeptideContext);
  if (!context) {
    throw new Error('usePeptideContext must be used inside a PeptideProvider (mounted in src/app/_layout.tsx).');
  }
  return context;
}
