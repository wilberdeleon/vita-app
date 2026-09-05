import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { ResolvedSetup } from '../../../lib/peptides';
import { spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import { spokenAmount } from '../spoken';

type Props = {
  active: readonly ResolvedSetup[];
  inactive: readonly ResolvedSetup[];
  onOpen: (item: ResolvedSetup) => void;
};

/**
 * Your routines — the management area, and deliberately quieter than Today.
 *
 * ## What it replaced
 *
 * Two more uppercase section headers over two more identical card panels.
 * `ACTIVE` and `INACTIVE` carried the same visual weight as `TODAY`, so the
 * screen offered three equal lists and no answer to *what do I do now?* This
 * is one region: compact rows, and paused routines folded away behind a
 * count.
 *
 * ## A routine scheduled today appears here only when Today is not asking
 *
 * `usePeptides()` already excludes today's routines from `active` — a
 * presentation filter added in 3.10A, decided in the hook, not here. That is
 * what stops a routine being named twice on one screen, and this component
 * must not undo it by reaching for the unfiltered list.
 *
 * **As-needed routines live here, not in Today.** `isScheduledOn` returns
 * false for them by design: an as-needed routine is available, not scheduled,
 * and promoting it into Today would invent a plan the user never wrote.
 *
 * ## Inactive is collapsed, not hidden
 *
 * A long list of paused routines should never be most of this screen, but it
 * has to stay reachable — pausing is reversible and the routine still owns
 * its history. The disclosure announces expanded/collapsed, so the state is
 * available without sight.
 *
 * Pause, Resume and Remove are **not** here. Those belong to the routine
 * itself, where there is room to say what they do.
 */
export function RoutineList({ active, inactive, onOpen }: Props) {
  const { surfaces } = useTheme();
  const [showInactive, setShowInactive] = useState(false);

  if (active.length === 0 && inactive.length === 0) return null;

  const row = (item: ResolvedSetup, muted: boolean) => {
    const amount = item.setup.routineAmount?.authored;
    const schedule = item.scheduleLabel ?? 'No schedule set';
    const detail = amount ? `${schedule} · ${amount.amount} ${amount.unit}` : schedule;

    return (
      <PressableScale
        key={item.setup.id}
        onPress={() => onOpen(item)}
        style={[styles.row, { borderTopColor: surfaces.border }]}
        accessibilityLabel={[
          item.name,
          muted ? 'paused' : schedule,
          amount ? spokenAmount(amount.amount, amount.unit) : null,
        ]
          .filter(Boolean)
          .join(', ')}
        accessibilityHint="Opens the routine"
      >
        <View style={styles.rowText}>
          <Text
            style={[styles.name, { color: muted ? surfaces.textSecondary : surfaces.text }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: surfaces.textTertiary }]} numberOfLines={2}>
            {muted ? 'Paused' : detail}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={surfaces.textTertiary} />
      </PressableScale>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: surfaces.textSecondary }]}>Your routines</Text>

      {active.length > 0 ? <View>{active.map((item) => row(item, false))}</View> : null}

      {inactive.length > 0 ? (
        <View>
          <PressableScale
            onPress={() => setShowInactive((open) => !open)}
            style={[styles.disclosure, { borderTopColor: surfaces.border }]}
            accessibilityLabel={`Inactive, ${inactive.length}`}
            accessibilityHint={showInactive ? 'Collapses the list' : 'Expands the list'}
            accessibilityState={{ expanded: showInactive }}
          >
            <Text style={[styles.disclosureLabel, { color: surfaces.textSecondary }]}>
              Inactive · {inactive.length}
            </Text>
            <Ionicons
              name={showInactive ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={surfaces.textTertiary}
            />
          </PressableScale>

          {showInactive ? <View>{inactive.map((item) => row(item, true))}</View> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
  heading: {
    ...typography.bodyMedium,
    fontSize: 15.5,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyMedium,
    fontSize: 16,
  },
  meta: {
    ...typography.caption,
    fontSize: 13.5,
  },
  disclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
    paddingVertical: spacing.m,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  disclosureLabel: {
    ...typography.captionMedium,
    fontSize: 14.5,
    fontWeight: '600',
  },
});
