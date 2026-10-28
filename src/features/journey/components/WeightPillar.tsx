import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, PressableScale, SectionHeader, SegmentedTabs, useToast } from '../../../components/ui';
import { vitaHaptic } from '../../../lib/haptics';
import { WEIGHT_UNITS, latestEntry, type WeightEntry, type WeightUnit } from '../../../lib/journey';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import {
  clockTime,
  dayKeyOf,
  dayLabel,
  shortDate,
  signedChange,
  spokenChange,
  spokenWeight,
  spokenWhen,
  weightNumber,
  whenLabel,
} from '../format';
import type { JourneyViewData, JourneyWeightActions } from '../types';
import { useJourneyAccent } from './useJourneyAccent';
import { WeightEntrySheet } from './WeightEntrySheet';
import { WeightTrend } from './WeightTrend';

/** History renders in pages, so a year of weigh-ins never mounts at once. */
export const HISTORY_PAGE = 30;

type Props = {
  data: JourneyViewData;
  /** Release passes the real provider's functions; the preview passes none. */
  actions?: JourneyWeightActions;
  /** `__DEV__` preview only — the 6.7 trend line. Release never draws it. */
  showFuture?: boolean;
  /**
   * History only, without the latest-weight heading — for a completed
   * Journey's summary, whose own statistics already say it (6.5).
   */
  historyOnly?: boolean;
};

/**
 * Weight — the measurable body-weight history (6.3 structure, 6.4 function).
 *
 * Empty: what belongs here, and **Log Weight** — the button exists now
 * because the action does. With entries: the latest weight as this pillar's
 * subject, its time, a neutral signed change **since the previous entry**
 * when there is one, then the history — grouped by local day, newest first,
 * every row opening that entry to edit or delete.
 *
 * Not here, by design: a chart (6.7), a goal (deferred), BMI (deferred), any
 * word that grades a change. One entry shows one entry — no "0.0 lb", no
 * comparison against nothing.
 */
export function WeightPillar({ data, actions, showFuture = false, historyOnly = false }: Props) {
  const [sheet, setSheet] = useState<{ open: boolean; entry: WeightEntry | null }>({ open: false, entry: null });
  const { showToast } = useToast();

  const openLog = actions ? () => setSheet({ open: true, entry: null }) : undefined;
  const openEdit = actions ? (entry: WeightEntry) => setSheet({ open: true, entry }) : undefined;
  const closeSheet = () => setSheet((current) => ({ ...current, open: false }));

  const log = async (weight: number, unit: WeightUnit, loggedAt: Date) => {
    const saved = await actions!.addEntry(weight, unit, loggedAt);
    vitaHaptic(saved ? 'confirm' : 'warn');
    return saved;
  };

  const update = async (id: string, changes: Parameters<JourneyWeightActions['updateEntry']>[1]) => {
    const saved = await actions!.updateEntry(id, changes);
    vitaHaptic(saved ? 'confirm' : 'warn');
    return saved;
  };

  const remove = (entry: WeightEntry) => {
    closeSheet();
    void (async () => {
      const removed = await actions!.removeEntry(entry.id);
      if (!removed) {
        vitaHaptic('warn');
        return;
      }
      showToast({
        message: 'Weight entry deleted',
        actionLabel: 'Undo',
        onAction: () => void actions!.restoreEntry(entry),
      });
    })();
  };

  return (
    <>
      {data.weights.length === 0 ? (
        <WeightEmpty onLog={openLog} />
      ) : (
        <WeightPopulated
          data={data}
          onLog={openLog}
          onEdit={openEdit}
          onUnit={actions ? (unit) => void actions.setUnit(unit) : undefined}
          showFuture={showFuture}
          historyOnly={historyOnly}
        />
      )}
      {actions ? (
        <WeightEntrySheet
          visible={sheet.open}
          entry={sheet.entry}
          preferredUnit={data.unit}
          onClose={closeSheet}
          onLog={log}
          onUpdate={update}
          onDelete={remove}
        />
      ) : null}
    </>
  );
}

function WeightEmpty({ onLog }: { onLog?: () => void }) {
  const { surfaces } = useTheme();
  const accent = useJourneyAccent();
  return (
    <View style={styles.empty}>
      <Ionicons name="scale-outline" size={26} color={accent} accessibilityElementsHidden importantForAccessibility="no" />
      <Text style={[styles.emptyTitle, { color: surfaces.text }]} accessibilityRole="header">
        No weight entries yet
      </Text>
      <Text style={[styles.emptyBody, { color: surfaces.textSecondary }]}>
        Every weigh-in you record is kept here with its date and time — more than one a day included — so you can
        see your weight across the whole Journey.
      </Text>
      {onLog ? (
        <View style={styles.cta}>
          <Button variant="neutral" label="Log Weight" onPress={onLog} />
        </View>
      ) : null}
    </View>
  );
}

type PopulatedProps = {
  data: JourneyViewData;
  onLog?: () => void;
  onEdit?: (entry: WeightEntry) => void;
  onUnit?: (unit: WeightUnit) => void;
  showFuture: boolean;
  historyOnly: boolean;
};

function WeightPopulated({ data, onLog, onEdit, onUnit, showFuture, historyOnly }: PopulatedProps) {
  const { surfaces } = useTheme();
  const { weights, unit } = data;
  const [shown, setShown] = useState(HISTORY_PAGE);
  const latest = latestEntry(weights)!;
  const previous = weights[1] ?? null;

  const visible = weights.slice(0, shown);
  const groups: { key: string; label: string; entries: WeightEntry[] }[] = [];
  for (const entry of visible) {
    const key = dayKeyOf(entry.loggedAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.entries.push(entry);
    else groups.push({ key, label: dayLabel(entry.loggedAt), entries: [entry] });
  }
  const remaining = weights.length - visible.length;

  return (
    <View style={styles.container}>
      {historyOnly ? null : (
        <>
      <View accessible accessibilityLabel={`Latest weight ${spokenWeight(latest.weightKg, unit)}, ${spokenWhen(latest.loggedAt)}`}>
        <View style={styles.weightRow}>
          <Text style={[styles.weight, { color: surfaces.text }]}>{weightNumber(latest.weightKg, unit)}</Text>
          <Text style={[styles.unit, { color: surfaces.textSecondary }]}>{unit}</Text>
        </View>
        <Text style={[styles.meta, { color: surfaces.textSecondary }]}>{whenLabel(latest.loggedAt)}</Text>
      </View>

      {previous ? (
        <Text
          style={[styles.change, { color: surfaces.text }]}
          accessibilityLabel={`${spokenChange(previous.weightKg, latest.weightKg, unit)} since the previous entry`}
        >
          {signedChange(previous.weightKg, latest.weightKg, unit)}
          <Text style={{ color: surfaces.textSecondary }}>{'  since previous entry'}</Text>
        </Text>
      ) : null}

      {showFuture && weights.length > 1 ? <WeightTrend weights={weights} unit={unit} height={132} /> : null}

      {onLog ? <Button variant="neutral" label="Log Weight" onPress={onLog} /> : null}

        </>
      )}

      <View style={styles.section}>
        <View style={styles.historyHeader}>
          <View style={styles.grow}>
            <SectionHeader title={`Weight history · ${weights.length} ${weights.length === 1 ? 'entry' : 'entries'}`} />
          </View>
          {onUnit ? (
            <View style={styles.unitToggle}>
              <SegmentedTabs
                options={WEIGHT_UNITS}
                selectedIndex={WEIGHT_UNITS.indexOf(unit)}
                onChange={(index) => onUnit(WEIGHT_UNITS[index])}
                groupLabel="Show weight in"
              />
            </View>
          ) : null}
        </View>

        {groups.map((group) => (
          <View key={group.key}>
            <Text style={[styles.dayLabel, { color: surfaces.textTertiary }]} accessibilityRole="header">
              {group.label.toUpperCase()}
            </Text>
            {group.entries.map((entry, index) => {
              const label = `${spokenWeight(entry.weightKg, unit)}, ${spokenWhen(entry.loggedAt)}`;
              const row = (
                <View
                  style={[
                    styles.historyRow,
                    index > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surfaces.border },
                  ]}
                >
                  <Text style={[styles.historyWeight, { color: surfaces.text }]}>
                    {`${weightNumber(entry.weightKg, unit)} ${unit}`}
                  </Text>
                  <Text style={[styles.historyTime, { color: surfaces.textSecondary }]}>{clockTime(entry.loggedAt)}</Text>
                </View>
              );
              return onEdit ? (
                <PressableScale
                  key={entry.id}
                  onPress={() => onEdit(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityHint="Opens this entry to edit or delete it"
                >
                  {row}
                </PressableScale>
              ) : (
                <View key={entry.id} accessible accessibilityLabel={label}>
                  {row}
                </View>
              );
            })}
          </View>
        ))}

        {remaining > 0 ? (
          <PressableScale
            style={[styles.more, { borderColor: surfaces.border }]}
            onPress={() => setShown((count) => count + HISTORY_PAGE)}
            accessibilityRole="button"
            accessibilityLabel={`Show earlier entries, ${remaining} more`}
          >
            <Text style={[styles.moreLabel, { color: surfaces.text }]}>
              {`Show earlier entries · ${remaining} more`}
            </Text>
          </PressableScale>
        ) : weights.length > 1 ? (
          <Text style={[styles.since, { color: surfaces.textTertiary }]}>
            {`Recorded since ${shortDate(weights[weights.length - 1].loggedAt)}`}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  empty: {
    gap: spacing.s,
    paddingTop: spacing.s,
  },
  emptyTitle: {
    ...typography.heading,
    marginTop: spacing.xs,
  },
  emptyBody: {
    ...typography.body,
    lineHeight: 21,
  },
  cta: {
    marginTop: spacing.m,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  weight: {
    ...typography.display,
    fontSize: 44,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    ...typography.heading,
  },
  meta: {
    ...typography.caption,
  },
  change: {
    ...typography.bodyMedium,
    fontVariant: ['tabular-nums'],
    marginTop: -spacing.s,
  },
  section: {
    gap: spacing.s,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.m,
  },
  grow: {
    flex: 1,
  },
  unitToggle: {
    width: 112,
  },
  dayLabel: {
    ...typography.micro,
    letterSpacing: 0.8,
    marginTop: spacing.m,
    marginBottom: spacing.xs,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.m,
    paddingVertical: spacing.m,
  },
  historyWeight: {
    ...typography.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
  historyTime: {
    ...typography.body,
    fontVariant: ['tabular-nums'],
  },
  more: {
    marginTop: spacing.m,
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  moreLabel: {
    ...typography.bodyMedium,
  },
  since: {
    ...typography.caption,
    marginTop: spacing.m,
  },
});
