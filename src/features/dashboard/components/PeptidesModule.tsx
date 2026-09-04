import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/ui';
import type { TodayRoutine } from '../../../lib/peptides';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { ModuleSize } from '../modules';
import { SQUARE_HEIGHT, SQUARE_RADIUS, WIDE_RADIUS } from '../widget';

type Props = {
  today: readonly TodayRoutine[];
  isEmpty: boolean;
  isLoading: boolean;
  size: ModuleSize;
  onOpen: () => void;
  /**
   * Enters Home's edit mode. Lives on this module's own root pressable
   * because React Native gives the innermost pressable the responder — a
   * wrapper above it would never see the hold — and because `Pressable`
   * suppresses `onPress` once a long press fires, so holding a widget cannot
   * also open the feature.
   */
  onLongPress?: () => void;
};

/**
 * Peptides on Home — what today holds, in two shapes.
 *
 * Neither is a ring or a bar: Peptides is a count with a violet badge, so the
 * three domains stay distinguishable at a glance. The square stacks the count
 * over the routine's name and amount; the wide puts them on one line and adds
 * a chevron. Both name the routine when exactly one thing is outstanding —
 * the common case, and the one where a name saves a tap.
 *
 * ## Sprint 3's wording rules apply here in full
 *
 * - **"Scheduled", never "due"** as an obligation. A schedule is what the
 *   user planned, not something VITA enforces.
 * - **An unanswered day stays unanswered** — never *missed*, *late* or
 *   *overdue*, and never silently converted to *skipped*.
 * - **Nothing is scored.** No adherence, no streak, no percentage.
 * - **The amount is the user's own configured routine amount**, read back.
 *   It is not a recommendation; VITA has none.
 *
 * The violet dot marks that something is outstanding and the words say so
 * too, because colour is not a state a screen reader can read.
 */
export function PeptidesModule({ today, isEmpty, isLoading, size, onOpen, onLongPress }: Props) {
  const { surfaces } = useTheme();

  const unanswered = today.filter((item) => item.mark === 'unconfirmed');
  const only = unanswered.length === 1 ? unanswered[0] : null;

  const value = isLoading
    ? '—'
    : today.length === 0
      ? isEmpty
        ? 'No routines'
        : 'Nothing scheduled'
      : unanswered.length === 0
        ? 'All answered'
        : `${unanswered.length} scheduled`;

  const amount = only?.setup.routineAmount
    ? `${only.setup.routineAmount.authored.amount} ${only.setup.routineAmount.authored.unit}`
    : null;

  const detail = isLoading || today.length === 0
    ? isEmpty && !isLoading
      ? 'Add one to start'
      : null
    : only
      ? [only.name, amount].filter(Boolean).join(' · ')
      : `${today.length} today`;

  const spoken = `Peptides, ${value}${detail ? `, ${detail}` : ''}. ${
    isEmpty ? 'Opens Peptides to add one' : 'Opens Peptides'
  }`;

  const badge = (
    <View style={[styles.badge, { backgroundColor: `${palette.peptide}1A` }]}>
      <Ionicons name="medical" size={16} color={palette.peptide} />
      {unanswered.length > 0 ? (
        <View
          style={[styles.dot, { backgroundColor: palette.peptide, borderColor: surfaces.background }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
    </View>
  );

  if (size === 'square') {
    return (
      <PressableScale
        style={[styles.square, { borderColor: surfaces.border }]}
        onPress={onOpen}
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityLabel={spoken}
      >
        <View style={styles.head}>
          <Ionicons name="medical" size={14} color={palette.peptide} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Peptides</Text>
        </View>

        <View style={styles.squareBody}>
          <Text style={[styles.squareValue, { color: surfaces.text }]} numberOfLines={2} adjustsFontSizeToFit>
            {value}
          </Text>
          {detail ? (
            <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]} numberOfLines={2}>
              {detail}
            </Text>
          ) : null}
        </View>

        <View style={[styles.action, { borderColor: surfaces.border }]}>
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>
            {isEmpty ? 'Add' : 'View'}
          </Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      style={[styles.wide, { borderColor: surfaces.border }]}
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityLabel={spoken}
    >
      {badge}

      <View style={styles.wideText}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Peptides</Text>
        <Text style={[styles.wideValue, { color: surfaces.text }]} numberOfLines={1}>
          {value}
          {detail ? <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {detail}</Text> : null}
        </Text>
      </View>

      <Text style={[styles.link, { color: surfaces.textTertiary }]}>{isEmpty ? 'Add' : 'View'}</Text>
      <Ionicons name="chevron-forward" size={14} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  square: {
    flex: 1,
    borderWidth: 1,
    borderRadius: SQUARE_RADIUS,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.s,
    /*
     * One shared footprint — see `widget.ts`. A widget must not resize because
     * its feature happened to have less to say today.
     *
     * Both bounds, not `height`: `flex: 1` above resolves a flex basis of 0 on
     * the main axis, which would win over a plain height and collapse the
     * cell. Clamping the range pins the footprint whatever the flex maths
     * decides, in either direction.
     */
    minHeight: SQUARE_HEIGHT,
    maxHeight: SQUARE_HEIGHT,
  },
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    borderWidth: 1,
    borderRadius: WIDE_RADIUS,
    padding: spacing.m,
    minHeight: 64,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.micro,
    letterSpacing: 0.6,
  },
  squareBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  squareValue: {
    ...typography.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  squareDetail: {
    ...typography.caption,
    textAlign: 'center',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
  wideText: {
    flex: 1,
    gap: 1,
  },
  wideValue: {
    ...typography.bodyMedium,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontWeight: '400',
  },
  link: {
    ...typography.captionMedium,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 36,
    alignSelf: 'stretch',
  },
  actionLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
