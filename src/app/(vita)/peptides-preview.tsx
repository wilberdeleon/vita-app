import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader } from '../../components/ui';
import { todayLogDate } from '../../lib/daily';
import type { PeptideRepository } from '../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../lib/peptides';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import Peptides from './peptides/index';

/**
 * Peptides Home, in every state, touching nothing real (slice 5.4).
 *
 * **`__DEV__`-gated, and the point is data safety.** The founder review needs
 * to see a populated Today, a mixed day, unfinished setups and a long
 * catalog name — none of which exist on a fresh install, and all of which
 * would otherwise have to be *seeded into real peptide storage*. Writing
 * invented administrations into someone's actual history to take a
 * screenshot is exactly the thing the authorization forbids.
 *
 * So this renders the **real production screen** — no copy, no fork — over an
 * in-memory repository that is created fresh per scenario and persisted
 * nowhere. Tapping *Taken* here writes to a `Map` that dies with the route.
 *
 * Reachable at `/peptides-preview`, or `/peptides-preview?state=mixed` to
 * open on one directly. Temporary, and removed with the other Sprint 5
 * scaffolding in 5.9.
 */

const TODAY = todayLogDate();
const CREATED = '2026-08-25T10:00:00.000Z';
const OTHER_DAY = (new Date().getDay() + 3) % 7;

function setup(overrides: Partial<PeptideSetup> & { id: string }): PeptideSetup {
  return {
    definitionId: 'catalog:retatrutide',
    vial: { amountMcg: toMcg(20, 'mg'), authored: { amount: 20, unit: 'mg' } },
    reconstitutionMl: 2,
    preferredDoseUnit: 'mg',
    preferredEntryMode: 'mass',
    routineAmount: { amountMcg: toMcg(1, 'mg'), authored: { amount: 1, unit: 'mg' } },
    schedule: { kind: 'daily' },
    routineState: 'active',
    active: true,
    createdAt: CREATED,
    updatedAt: CREATED,
    ...overrides,
  };
}

const status = (setupId: string, state: 'taken' | 'skipped'): RoutineDayStatus => ({
  id: `status-${setupId}`,
  setupId,
  logDate: TODAY,
  state,
  createdAt: CREATED,
  updatedAt: CREATED,
});

type Scenario = {
  key: string;
  label: string;
  setups: PeptideSetup[];
  statuses?: RoutineDayStatus[];
};

const SCENARIOS: Scenario[] = [
  { key: 'none', label: 'No routines', setups: [] },
  {
    key: 'nothing',
    label: 'Nothing today',
    setups: [setup({ id: 'a', schedule: { kind: 'daysOfWeek', days: [OTHER_DAY] } })],
  },
  { key: 'one', label: 'One scheduled', setups: [setup({ id: 'a' })] },
  {
    key: 'multiple',
    label: 'Three scheduled',
    setups: [
      setup({ id: 'a' }),
      setup({ id: 'b', definitionId: 'catalog:bpc-157' }),
      setup({ id: 'c', definitionId: 'catalog:ipamorelin' }),
    ],
  },
  { key: 'taken', label: 'Taken', setups: [setup({ id: 'a' })], statuses: [status('a', 'taken')] },
  {
    key: 'skipped',
    label: 'Skipped',
    setups: [setup({ id: 'a' })],
    statuses: [status('a', 'skipped')],
  },
  {
    key: 'mixed',
    label: 'Mixed states',
    setups: [
      setup({ id: 'a' }),
      setup({ id: 'b', definitionId: 'catalog:bpc-157' }),
      setup({ id: 'c', definitionId: 'catalog:ipamorelin' }),
    ],
    statuses: [status('a', 'taken'), status('b', 'skipped')],
  },
  {
    key: 'setup',
    label: 'Needs setup',
    setups: [
      setup({ id: 'a', routineState: 'needs-setup', active: false }),
      setup({ id: 'b', definitionId: 'catalog:bpc-157', routineState: 'needs-setup', active: false }),
      setup({ id: 'c', definitionId: 'catalog:ipamorelin' }),
    ],
  },
  {
    key: 'inactive',
    label: 'Inactive',
    setups: [
      setup({ id: 'a', schedule: { kind: 'daysOfWeek', days: [OTHER_DAY] } }),
      setup({
        id: 'b',
        definitionId: 'catalog:bpc-157',
        routineState: 'inactive',
        active: false,
      }),
      setup({
        id: 'c',
        definitionId: 'catalog:ipamorelin',
        routineState: 'inactive',
        active: false,
      }),
    ],
  },
  {
    key: 'asneeded',
    label: 'As needed',
    setups: [setup({ id: 'a', schedule: { kind: 'asNeeded' } })],
  },
  {
    key: 'long',
    label: 'Long names',
    setups: [
      setup({ id: 'a', definitionId: 'catalog:blend-cjc-ipamorelin' }),
      setup({
        id: 'b',
        definitionId: 'catalog:blend-semax-selank',
        schedule: { kind: 'daysOfWeek', days: [OTHER_DAY] },
      }),
    ],
  },
  {
    key: 'everything',
    label: 'Everything',
    setups: [
      setup({ id: 'a' }),
      setup({ id: 'b', definitionId: 'catalog:blend-cjc-ipamorelin' }),
      setup({ id: 'c', definitionId: 'catalog:bpc-157', routineState: 'needs-setup', active: false }),
      setup({
        id: 'd',
        definitionId: 'catalog:ipamorelin',
        schedule: { kind: 'daysOfWeek', days: [OTHER_DAY] },
      }),
      setup({
        id: 'e',
        definitionId: 'catalog:tirzepatide',
        routineState: 'inactive',
        active: false,
      }),
    ],
    statuses: [status('b', 'taken')],
  },
];

/** Everything lives in this closure; nothing reaches storage. */
function memoryRepository(scenario: Scenario): PeptideRepository {
  let setups = scenario.setups.map((item) => ({ ...item }));
  const logs = new Map<string, PeptideLogEntry[]>();
  const statuses = new Map<string, RoutineDayStatus[]>();
  for (const entry of scenario.statuses ?? []) {
    statuses.set(entry.logDate, [...(statuses.get(entry.logDate) ?? []), entry]);
  }

  return {
    async getSetups() {
      return [...setups];
    },
    async saveSetups(next) {
      setups = [...next];
    },
    async getCustomDefinitions() {
      return [];
    },
    async saveCustomDefinitions() {},
    async getLogs(logDate) {
      return [...(logs.get(logDate) ?? [])];
    },
    async saveLogs(logDate, entries) {
      if (entries.length === 0) logs.delete(logDate);
      else logs.set(logDate, [...entries]);
    },
    async getRecentLogs() {
      return [...logs.values()].flat();
    },
    async getRoutineStatuses(logDate) {
      return [...(statuses.get(logDate) ?? [])];
    },
    async saveRoutineStatuses(logDate, next) {
      if (next.length === 0) statuses.delete(logDate);
      else statuses.set(logDate, [...next]);
    },
    async getRecentRoutineStatuses() {
      return [...statuses.values()].flat();
    },
  };
}

export default function PeptidesPreview() {
  const { surfaces } = useTheme();
  const { state } = useLocalSearchParams<{ state?: string }>();

  const active = SCENARIOS.find((item) => item.key === state) ?? SCENARIOS[0];
  // Re-created whenever the scenario changes, so each one starts clean.
  const repository = useMemo(() => memoryRepository(active), [active]);

  if (!__DEV__) {
    return (
      <Screen>
        <ScreenHeader title="Preview" back />
        <Text style={{ color: surfaces.textTertiary }}>
          This preview is only available in development builds.
        </Text>
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.bar,
          { borderBottomColor: surfaces.border, backgroundColor: surfaces.background },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SCENARIOS.map((item) => {
            const selected = item.key === active.key;
            return (
              <PressableScale
                key={item.key}
                // Replaces the route so the picker never stacks; the provider
                // remounts and the scenario starts fresh.
                onPress={() => router.replace(`/peptides-preview?state=${item.key}`)}
                style={[
                  styles.chip,
                  { borderColor: surfaces.border },
                  selected && { backgroundColor: palette.peptide, borderColor: palette.peptide },
                ]}
                accessibilityLabel={`Preview ${item.label}`}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: selected ? palette.textOnColor : surfaces.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {/* The real screen, over a repository that forgets everything. */}
      <View style={styles.stage}>
        <PeptideProvider key={active.key} repository={repository}>
          <Peptides />
        </PeptideProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // The stage below owns the themed background; this bar has to paint its
  // own or it shows the system default through in dark mode.
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xxxl + spacing.l,
    paddingBottom: spacing.s,
  },
  chips: {
    gap: spacing.xs,
    paddingHorizontal: spacing.l,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  chipLabel: {
    ...typography.micro,
    fontSize: 12,
    fontWeight: '600',
  },
  stage: {
    flex: 1,
  },
});
