import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { palette, radii, spacing, typography } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { PressableScale } from '../ui/PressableScale';
import {
  MODULE_TYPE,
  SQUARE_RADIUS,
  WIDE_RADIUS,
  isCompactSquare,
  squareHeight,
} from './geometry';
import type { CompactModuleSize } from './CompactWaterModule';

type Props = {
  /** Already derived by `compactPeptidesView` — this component reaches nothing. */
  view: {
    value: string;
    detail: string | null;
    spoken: string;
    outstanding: boolean;
    isEmpty: boolean;
  };
  size: CompactModuleSize;
  onOpen: () => void;
  /** Enters the host screen's edit or arrange mode. See `CompactWaterModule`. */
  onLongPress?: () => void;
  testID?: string;
};

/**
 * Today's peptides, wherever they are reported — **one component, two screens.**
 *
 * ## Why it is shared
 *
 * Home and Fuel each had their own, built on different selectors, and on
 * device the same day read `4 scheduled · 4 today` on Home and `None logged`
 * on Fuel. The founder's 5.6B.3 ruling was that equivalent data must produce
 * equivalent presentation, so there is now one component and one derivation
 * (`compactPeptidesView`), with Home's approved wording as the source.
 *
 * **Presentational, strictly.** A view model and one callback. It imports no
 * peptide domain and holds no peptide state.
 *
 * ## Read-only, structurally
 *
 * This is awareness and navigation. There is no Taken, no Skipped, no amount
 * entry and no schedule editing here, and there cannot be: the component has
 * nothing to write with. **No dose, protocol, titration or recommendation
 * appears in either screen's module** — VITA has none to give.
 *
 * Neither shape is a ring or a bar. Peptides is a count with a violet badge,
 * so Water, Peptides and Fuel stay distinguishable at a glance.
 */
export function CompactPeptidesModule({ view, size, onOpen, onLongPress, testID }: Props) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const compact = isCompactSquare(fontScale);

  const badge = (
    <View
      style={[styles.badge, { backgroundColor: `${palette.peptide}1A` }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Ionicons name="medical" size={16} color={palette.peptide} />
      {/* The dot marks that something is outstanding; the words say so too,
          because colour is not a state a screen reader can read. */}
      {view.outstanding ? (
        <View
          style={[
            styles.dot,
            { backgroundColor: palette.peptide, borderColor: surfaces.background },
          ]}
        />
      ) : null}
    </View>
  );

  if (size === 'square') {
    return (
      <PressableScale
        testID={testID}
        style={[
          styles.square,
          {
            borderColor: surfaces.border,
            minHeight: squareHeight(fontScale),
            maxHeight: squareHeight(fontScale),
          },
        ]}
        onPress={onOpen}
        onLongPress={onLongPress}
        delayLongPress={450}
        accessibilityLabel={view.spoken}
        accessibilityHint={view.isEmpty ? 'Opens Peptides to add one' : 'Opens Peptides'}
      >
        <View style={styles.head}>
          <Ionicons name="medical" size={14} color={palette.peptide} />
          <Text style={[styles.label, { color: surfaces.textSecondary }]}>Peptides</Text>
        </View>

        {compact ? null : badge}

        <View style={styles.squareBody}>
          <Text
            style={[styles.squareValue, { color: surfaces.text }]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {view.value}
          </Text>
          {view.detail ? (
            <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]} numberOfLines={2}>
              {view.detail}
            </Text>
          ) : null}
        </View>

        <View style={[styles.action, { borderColor: surfaces.border }]}>
          <Text style={[styles.actionLabel, { color: surfaces.text }]}>
            {view.isEmpty ? 'Add' : 'View'}
          </Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      testID={testID}
      style={[styles.wide, { borderColor: surfaces.border }]}
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={450}
      accessibilityLabel={view.spoken}
      accessibilityHint={view.isEmpty ? 'Opens Peptides to add one' : 'Opens Peptides'}
    >
      {badge}

      <View style={styles.wideText}>
        <Text style={[styles.label, { color: surfaces.textSecondary }]}>Peptides</Text>
        {/* A figure is information, so it wraps rather than truncating once
            the text is large — 5.3D found `2,000 c…` on a wide Fuel strip. */}
        <Text style={[styles.wideValue, { color: surfaces.text }]} numberOfLines={compact ? 3 : 1}>
          {view.value}
          {view.detail ? (
            <Text style={[styles.detail, { color: surfaces.textTertiary }]}> · {view.detail}</Text>
          ) : null}
        </Text>
      </View>

      <Text style={[styles.link, { color: surfaces.textTertiary }]}>
        {view.isEmpty ? 'Add' : 'View'}
      </Text>
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
    /* Both bounds, applied inline — see `CompactWaterModule`. */
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
    fontSize: MODULE_TYPE.label,
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
    fontSize: MODULE_TYPE.squareValue,
    fontWeight: '700',
    textAlign: 'center',
  },
  squareDetail: {
    ...typography.caption,
    fontSize: MODULE_TYPE.support,
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
    fontSize: MODULE_TYPE.wideValue,
    fontWeight: '700',
  },
  detail: {
    ...typography.caption,
    fontSize: MODULE_TYPE.support,
    fontWeight: '400',
  },
  link: {
    ...typography.captionMedium,
    fontSize: MODULE_TYPE.actionLabel,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 40,
    alignSelf: 'stretch',
  },
  actionLabel: {
    ...typography.captionMedium,
    fontSize: MODULE_TYPE.actionLabel,
    fontWeight: '600',
  },
});
