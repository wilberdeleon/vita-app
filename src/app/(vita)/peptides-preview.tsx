import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale, Screen, ScreenHeader } from '../../components/ui';
import { shiftLogDate, todayLogDate } from '../../lib/daily';
import { weekOf } from '../../features/peptides/week';
import type { PeptideRepository } from '../../lib/peptides/data/PeptideRepository';
import {
  PeptideProvider,
  createSiteSnapshot,
  toMcg,
  type PeptideLogEntry,
  type PeptideSetup,
  type RoutineDayStatus,
} from '../../lib/peptides';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import Peptides from './peptides/index';
import RoutineDetail from './peptides/routine/[id]';
import MonthlyActivity from './peptides/routine/[id]/month';
import PeptideActivity from './peptides/activity';
import EditPeptideSetup from './peptides/setup/[id]';
import InjectionSites from './tools/injection-sites';

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
 * open on one directly. **Slice 5.5 added `&screen=`** — `home`, `routine`,
 * `edit` or `sites` — so Routine, Edit Routine and Injection Sites can be
 * reviewed over the same seeded week without navigating out of the sandbox
 * into the real provider, where the data would be empty.
 *
 * Routine and Edit read their setup id from the route, and every scenario's
 * first setup is `a` — hence the `&id=a` the chips carry. A deep link to
 * either wants it too: `?state=mixed&screen=routine&id=a`.
 *
 * Temporary, and removed with the other Sprint 5 scaffolding in 5.9.
 */

const TODAY = todayLogDate();
/** Monday of the current week, so seeded sites land on the map. */
const MONDAY = weekOf(TODAY)[0];
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

const status = (
  setupId: string,
  state: 'taken' | 'skipped',
  logDate: string = TODAY,
): RoutineDayStatus => ({
  id: `status-${setupId}-${logDate}`,
  setupId,
  logDate,
  state,
  createdAt: CREATED,
  updatedAt: CREATED,
});

const log = (
  id: string,
  logDate: string,
  site: ReturnType<typeof createSiteSnapshot>,
  definitionId = 'catalog:retatrutide',
): PeptideLogEntry =>
  ({
    id,
    setupId: 'a',
    definitionId,
    logDate,
    loggedAt: `${logDate}T09:00:00.000Z`,
    amount: { amountMcg: toMcg(1, 'mg'), authoredUnit: 'mg' },
    site,
    createdAt: CREATED,
    updatedAt: CREATED,
  }) as PeptideLogEntry;

type Scenario = {
  key: string;
  label: string;
  setups: PeptideSetup[];
  statuses?: RoutineDayStatus[];
  logs?: PeptideLogEntry[];
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
    key: 'sites',
    label: 'Sites this week',
    setups: [setup({ id: 'a' })],
    logs: [
      log('s1', MONDAY, createSiteSnapshot('abdomen-left')),
      log('s2', shiftLogDate(MONDAY, 2), createSiteSnapshot('thigh-right')),
      log('s3', shiftLogDate(MONDAY, 4), createSiteSnapshot('upper-arm-left')),
    ],
  },
  {
    key: 'overlap',
    label: 'Same site twice',
    setups: [setup({ id: 'a' })],
    logs: [
      log('o1', MONDAY, createSiteSnapshot('thigh-left')),
      log('o2', shiftLogDate(MONDAY, 3), createSiteSnapshot('thigh-left')),
      log('o3', shiftLogDate(MONDAY, 5), createSiteSnapshot('glute-right')),
    ],
  },
  {
    key: 'history',
    label: 'Five logs',
    setups: [setup({ id: 'a' })],
    logs: [0, 1, 2, 3, 4].map((n) =>
      log(`h${n}`, shiftLogDate(TODAY, -n), createSiteSnapshot('abdomen-center')),
    ),
  },
  {
    /*
     * A month with all three answered states plus unscheduled days, so the
     * blank-versus-no-response distinction can be judged at a glance.
     */
    key: 'month-mixed',
    label: 'Month · mixed',
    setups: [setup({ id: 'a', schedule: { kind: 'daysOfWeek', days: [1, 3, 5] } })],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -2)),
      status('a', 'taken', shiftLogDate(TODAY, -4)),
      status('a', 'skipped', shiftLogDate(TODAY, -7)),
      status('a', 'taken', shiftLogDate(TODAY, -9)),
      status('a', 'taken', shiftLogDate(TODAY, -11)),
      status('a', 'skipped', shiftLogDate(TODAY, -14)),
    ],
    logs: [
      log('m1', shiftLogDate(TODAY, -2), createSiteSnapshot('thigh-left')),
      log('m2', shiftLogDate(TODAY, -4), createSiteSnapshot('abdomen-left')),
    ],
  },
  {
    key: 'month-daily',
    label: 'Month · daily',
    setups: [setup({ id: 'a' })],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -1)),
      status('a', 'taken', shiftLogDate(TODAY, -2)),
      status('a', 'skipped', shiftLogDate(TODAY, -3)),
      status('a', 'taken', shiftLogDate(TODAY, -5)),
    ],
  },
  {
    /* As needed: every day with no log stays blank. Nothing to answer. */
    key: 'month-asneeded',
    label: 'Month · as needed',
    setups: [setup({ id: 'a', schedule: { kind: 'asNeeded' } })],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -3)),
      status('a', 'taken', shiftLogDate(TODAY, -10)),
    ],
  },
  {
    key: 'month-everyn',
    label: 'Month · every 3 days',
    setups: [
      setup({
        id: 'a',
        schedule: { kind: 'everyNDays', n: 3 },
        startDate: shiftLogDate(TODAY, -21),
      }),
    ],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -3)),
      status('a', 'skipped', shiftLogDate(TODAY, -6)),
    ],
  },
  {
    /* Started mid-month: everything before the start date stays blank. */
    key: 'month-started',
    label: 'Month · started mid',
    setups: [setup({ id: 'a', startDate: shiftLogDate(TODAY, -6) })],
    statuses: [status('a', 'taken', shiftLogDate(TODAY, -2))],
  },
  {
    /* Tuesday and Thursday at different sites — the ambiguity 5.5B fixed. */
    key: 'sites-tue-thu',
    label: 'Sites · Tue + Thu',
    setups: [setup({ id: 'a' })],
    logs: [
      log('t1', shiftLogDate(MONDAY, 1), createSiteSnapshot('abdomen-left')),
      log('t2', shiftLogDate(MONDAY, 3), createSiteSnapshot('thigh-right')),
    ],
  },
  {
    /* Saturday and Sunday — the other ambiguous pair. */
    key: 'sites-sat-sun',
    label: 'Sites · Sat + Sun',
    setups: [setup({ id: 'a' })],
    logs: [
      log('s1', shiftLogDate(MONDAY, 5), createSiteSnapshot('upper-arm-left')),
      log('s2', shiftLogDate(MONDAY, 6), createSiteSnapshot('glute-right')),
    ],
  },
  {
    /* Two administrations on one day — the multiple-logs case. */
    key: 'month-twice',
    label: 'Month · two in a day',
    setups: [setup({ id: 'a' })],
    statuses: [status('a', 'taken', shiftLogDate(TODAY, -2))],
    logs: [
      log('d1', shiftLogDate(TODAY, -2), createSiteSnapshot('thigh-left')),
      {
        ...log('d2', shiftLogDate(TODAY, -2), createSiteSnapshot('thigh-right')),
        loggedAt: `${shiftLogDate(TODAY, -2)}T20:00:00.000Z`,
      } as PeptideLogEntry,
    ],
  },
  {
    /* Older than the provider's warm window — 5.5B's headline case. */
    key: 'month-old',
    label: 'Month · 200 days back',
    setups: [setup({ id: 'a' })],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -200)),
      status('a', 'skipped', shiftLogDate(TODAY, -198)),
      status('a', 'taken', shiftLogDate(TODAY, -195)),
    ],
    logs: [log('o1', shiftLogDate(TODAY, -200), createSiteSnapshot('abdomen-center'))],
  },
  {
    /*
     * Six and twelve months back, so the founder can prove on device that
     * history is bounded by what exists rather than by a window. The founder
     * saw "about two months" in 5.5B because the scenarios they opened only
     * held a fortnight — not because the loading stopped.
     */
    key: 'month-deep',
    label: 'Month · a year of history',
    setups: [setup({ id: 'a' })],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -60)),
      status('a', 'skipped', shiftLogDate(TODAY, -58)),
      status('a', 'taken', shiftLogDate(TODAY, -180)),
      status('a', 'taken', shiftLogDate(TODAY, -178)),
      status('a', 'skipped', shiftLogDate(TODAY, -365)),
      status('a', 'taken', shiftLogDate(TODAY, -362)),
    ],
    logs: [
      log('d60', shiftLogDate(TODAY, -60), createSiteSnapshot('abdomen-left')),
      log('d180', shiftLogDate(TODAY, -180), createSiteSnapshot('thigh-right')),
      log('d365', shiftLogDate(TODAY, -362), createSiteSnapshot('glute-left')),
    ],
  },
  {
    /* Three routines, several sharing dates — the multi-routine month. */
    key: 'all-activity',
    label: 'All routines · one month',
    setups: [
      setup({ id: 'a' }),
      setup({ id: 'b', definitionId: 'catalog:semax' }),
      setup({
        id: 'c',
        definitionId: 'catalog:ipamorelin',
        schedule: { kind: 'daysOfWeek', days: [OTHER_DAY] },
      }),
    ],
    statuses: [
      status('a', 'taken', shiftLogDate(TODAY, -1)),
      status('b', 'skipped', shiftLogDate(TODAY, -1)),
      status('c', 'taken', shiftLogDate(TODAY, -1)),
      status('a', 'taken', shiftLogDate(TODAY, -3)),
      status('b', 'taken', shiftLogDate(TODAY, -3)),
      status('a', 'skipped', shiftLogDate(TODAY, -5)),
    ],
    logs: [
      log('x1', shiftLogDate(TODAY, -1), createSiteSnapshot('abdomen-left')),
      { ...log('x2', shiftLogDate(TODAY, -1), createSiteSnapshot('thigh-left')), setupId: 'c' },
      log('x3', shiftLogDate(TODAY, -3), createSiteSnapshot('glute-right')),
    ],
  },
  {
    /*
     * A genuinely new routine: nothing configured, so the preparation
     * question is unanswered and neither option is selected. The `setup`
     * scenario above carries a vial, which seeds the answer — this is the
     * state someone actually lands on after adding from the catalog.
     */
    key: 'setup-blank',
    label: 'New setup · nothing entered',
    setups: [
      {
        id: 'a',
        definitionId: 'catalog:semax',
        preferredDoseUnit: 'mg',
        preferredEntryMode: 'mass',
        routineState: 'needs-setup',
        active: false,
        createdAt: CREATED,
        updatedAt: CREATED,
      } as PeptideSetup,
    ],
  },
  {
    /* One routine only — the sparse Home the founder flagged in §32. */
    key: 'single',
    label: 'One routine',
    setups: [setup({ id: 'a' })],
    statuses: [status('a', 'taken', shiftLogDate(TODAY, -2))],
  },
  {
    key: 'month-empty',
    label: 'Month · no activity',
    setups: [setup({ id: 'a', schedule: { kind: 'asNeeded' } })],
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
  for (const entry of scenario.logs ?? []) {
    logs.set(entry.logDate, [...(logs.get(entry.logDate) ?? []), entry]);
  }
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

    /* Slice 5.5B's historical reads. Range-bounded and read-only, exactly
       like the real repository — these fakes hold every day they were given,
       which is what makes an "older than the warm window" test meaningful. */
    async getLogsInRange(startDate, endDate) {
      return [...logs.entries()]
        .filter(([day]) => day >= startDate && day <= endDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, records]) => records);
    },

    async getRoutineStatusesInRange(startDate, endDate) {
      return [...statuses.entries()]
        .filter(([day]) => day >= startDate && day <= endDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap(([, records]) => records);
    },

    async getEarliestHistoryDate() {
      const all = [...logs.keys(), ...statuses.keys()];
      if (all.length === 0) return null;
      return all.reduce((oldest, day) => (day < oldest ? day : oldest)) as never;
    },
  };
}

const SCREENS = [
  { key: 'home', label: 'Home', render: () => <Peptides /> },
  { key: 'routine', label: 'Routine', render: () => <RoutineDetail /> },
  { key: 'month', label: 'Month', render: () => <MonthlyActivity /> },
  /* The Peptides-level calendar — every routine on one month (5.5C). */
  { key: 'activity', label: 'All activity', render: () => <PeptideActivity /> },
  { key: 'edit', label: 'Edit', render: () => <EditPeptideSetup /> },
  { key: 'sites', label: 'Sites', render: () => <InjectionSites /> },
] as const;

export default function PeptidesPreview() {
  const { surfaces } = useTheme();
  const { state, screen } = useLocalSearchParams<{ state?: string; screen?: string }>();

  const active = SCENARIOS.find((item) => item.key === state) ?? SCENARIOS[0];
  const stage = SCREENS.find((item) => item.key === screen) ?? SCREENS[0];
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
                onPress={() =>
                  router.replace(
                    `/peptides-preview?state=${item.key}&screen=${stage.key}&id=a`,
                  )
                }
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

      {/*
        * Which screen to review. `RoutineDetail` and `EditPeptideSetup` read
        * their id from the route, so every scenario's first setup is `a`.
        */}
      <View
        style={[
          styles.screenBar,
          { borderBottomColor: surfaces.border, backgroundColor: surfaces.background },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {SCREENS.map((item) => {
            const selected = item.key === stage.key;
            return (
              <PressableScale
                key={item.key}
                onPress={() =>
                  router.replace(
                    `/peptides-preview?state=${active.key}&screen=${item.key}&id=a`,
                  )
                }
                style={[
                  styles.chip,
                  { borderColor: surfaces.border },
                  selected && { backgroundColor: surfaces.text, borderColor: surfaces.text },
                ]}
                accessibilityLabel={`Preview ${item.label} screen`}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: selected ? surfaces.background : surfaces.textSecondary },
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
        <PeptideProvider key={`${active.key}-${stage.key}`} repository={repository}>
          {stage.render()}
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
  screenBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.s,
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
