/**
 * The read side of the peptide domain — what screens consume.
 *
 * Everything is derived per render from the setup array. Nothing is cached, so
 * there is no second copy of a list that can drift from the records it came
 * from.
 */

import { useMemo } from 'react';
import { scheduleLabel } from '../model/schedule';
import type { PeptideDefinition, PeptideSetup } from '../model/types';
import { usePeptideContext } from './PeptideProvider';

/** A setup paired with the definition it points at, resolved once. */
export type ResolvedSetup = {
  setup: PeptideSetup;
  definition: PeptideDefinition;
  /** `displayName` when the user set one, otherwise the definition's name. */
  name: string;
  /** "Daily" · "Mon, Wed, Fri" · "Every 3 days" · "As needed", or `null`. */
  scheduleLabel: string | null;
};

export type PeptidesView = {
  isLoading: boolean;
  error: string | null;
  active: ResolvedSetup[];
  inactive: ResolvedSetup[];
  /** No setups at all — drives the empty state. */
  isEmpty: boolean;
  /**
   * Setups whose definition could not be resolved.
   *
   * Kept out of the lists rather than rendered as a blank row, and **not**
   * deleted: the record stays in storage untouched, so a definition that
   * reappears (a restored custom entry, a catalog id returning) brings its
   * setup back with it. Silently re-pointing it at some other compound would
   * be the one genuinely destructive option.
   */
  orphanedCount: number;
};

function resolve(
  setups: readonly PeptideSetup[],
  findDefinition: (id: string) => PeptideDefinition | undefined,
): { resolved: ResolvedSetup[]; orphanedCount: number } {
  const resolved: ResolvedSetup[] = [];
  let orphanedCount = 0;

  for (const setup of setups) {
    const definition = findDefinition(setup.definitionId);
    if (!definition) {
      orphanedCount += 1;
      continue;
    }
    resolved.push({
      setup,
      definition,
      name: setup.displayName?.trim() || definition.name,
      scheduleLabel: scheduleLabel(setup.schedule),
    });
  }

  return { resolved, orphanedCount };
}

export function usePeptides(): PeptidesView {
  const { status, setups, customDefinitions, error, findDefinition } = usePeptideContext();

  return useMemo(() => {
    const { resolved, orphanedCount } = resolve(setups, findDefinition);
    // Alphabetical within each list — neutral, and stable as setups are added.
    const byName = (a: ResolvedSetup, b: ResolvedSetup) => a.name.localeCompare(b.name);

    return {
      isLoading: status === 'loading',
      error,
      active: resolved.filter((item) => item.setup.active).sort(byName),
      inactive: resolved.filter((item) => !item.setup.active).sort(byName),
      isEmpty: setups.length === 0,
      orphanedCount,
    };
    // `customDefinitions` participates because `findDefinition` reads it
    // through a ref, so the identity of that callback never changes.
  }, [status, setups, customDefinitions, error, findDefinition]);
}

/** One setup by id, resolved. `null` while loading or if it no longer exists. */
export function useResolvedSetup(setupId: string): ResolvedSetup | null {
  const { setups, customDefinitions, findDefinition } = usePeptideContext();

  return useMemo(() => {
    const setup = setups.find((candidate) => candidate.id === setupId);
    if (!setup) return null;
    const definition = findDefinition(setup.definitionId);
    if (!definition) return null;
    return {
      setup,
      definition,
      name: setup.displayName?.trim() || definition.name,
      scheduleLabel: scheduleLabel(setup.schedule),
    };
  }, [setupId, setups, customDefinitions, findDefinition]);
}
