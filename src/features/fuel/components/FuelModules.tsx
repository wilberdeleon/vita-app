import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, ProgressBar, ProgressRing } from '../../../components/ui';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';
import type { FuelSectionSize } from '../sections';

/**
 * Water and Peptides, as Fuel shows them — square by default, wide by choice.
 *
 * ## Why they are here at all
 *
 * 5.6B removed them on the reasoning that cross-domain overview is Home's job.
 * The founder's device review reversed that: they are useful *beside the day's
 * food*, because hydration and a peptide routine are part of the same daily
 * picture as eating. 5.6B.1 brought them back as two full-width strips, and
 * the review of that was the correction this slice implements — **a pair of
 * squares, not two more bands** on a screen that is already a column of bands.
 *
 * ## Two designs, not one stretched
 *
 * The square stacks its label, its visual and its reading in a column, because
 * a column has height and no width. The wide lays them along a row and puts
 * the action on the right, because a row has the opposite. Squeezing the wide
 * layout into half a screen is what produces the widget nobody designed, so
 * neither shape is derived from the other.
 *
 * ## They are awareness, not a second copy of the feature
 *
 * Fuel does not embed the Water sheet or the Peptides Today list. Water offers
 * one *Add* into the existing flow; Peptides offers a way through. **Nothing
 * here mutates peptide data** — this slice only reads it. No Taken, no
 * Skipped, no dose, no schedule editing.
 *
 * ## Restraint, deliberately
 *
 * A square needs a boundary — content floating in half a row with nothing
 * around it reads as a mistake — so these are the only bounded objects on
 * Fuel. They take a hairline border and a radius and nothing else: no fill, no
 * shadow, no glass. That is the difference between a module and the card soup
 * this screen keeps being rescued from.
 */

/**
 * The shared square footprint at the system's default text size.
 *
 * **One height for both**, for the reason Home settled in 5.3C: a grid has to
 * hold still, and a module that shrinks because its feature happened to have
 * less to say today makes the page twitch. The quieter of the two centres
 * itself in the space rather than collapsing to fit.
 *
 * Deliberately shorter than Home's square. Home's carries a 56pt ring, a
 * headline, a detail line and a 40pt pill button; Fuel's carries a 44pt visual
 * and a text action, because these are context beside the day's food rather
 * than the day's headline. The founder's note was *compact premium modules*,
 * not a second Home.
 *
 * Fuel keeps its own constant rather than importing Home's: rule 4 — features
 * never import each other — and the two numbers are answering different
 * questions about different content.
 */
const FUEL_SQUARE_HEIGHT = 168;

/**
 * The footprint at a given system text scale — a **floor, never a ceiling**.
 *
 * The 5.6B.2 device pass found the ceiling version of this: with both bounds
 * pinned, an accessibility-XXXL square clipped `fl oz` off the bottom of
 * `24.3 fl oz`. VITA respects the text-size setting and nothing here passes
 * `allowFontScaling={false}`, so the box has to yield to the words rather than
 * the other way round — **information scales without limit; ornament does
 * not.** Past this height the module simply grows, and the two stay level with
 * each other because the row stretches both to its tallest member.
 *
 * Damped rather than proportional because at the same point the text needs
 * more room `isCompactModule` hands back the visual's 44pt, so following the
 * scale exactly would leave a square half empty at the sizes in between.
 */
function fuelSquareHeight(fontScale: number): number {
  const scale = Math.min(Math.max(fontScale, 1), 2);
  return Math.round(FUEL_SQUARE_HEIGHT * (1 + (scale - 1) * 0.7));
}

/** Past this, the decorative visual stands aside so the words can have its space. */
const COMPACT_FONT_SCALE = 1.3;

function isCompactModule(fontScale: number): boolean {
  return fontScale >= COMPACT_FONT_SCALE;
}

type ShellProps = {
  title: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** The square's decorative visual — a ring, a badge. Omitted when compact. */
  visual: React.ReactNode;
  /** The reading: `24 fl oz`, `4 scheduled`. */
  value: string;
  /** One line under it: `of 64 fl oz`, `2 logged today`, or nothing. */
  detail: string | null;
  spoken: string;
  actionLabel: string;
  onAction: () => void;
  /** Stable handle for tests, the way Home's `EditableWidget` carries one. */
  testID: string;
};

function SquareModule({
  title,
  accent,
  icon,
  visual,
  value,
  detail,
  spoken,
  actionLabel,
  onAction,
  testID,
}: ShellProps) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();
  const compact = isCompactModule(fontScale);
  const height = fuelSquareHeight(fontScale);

  return (
    <View
      testID={testID}
      style={[styles.square, { borderColor: surfaces.border, minHeight: height }]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={spoken}
    >
      <View style={styles.head}>
        <Ionicons name={icon} size={13} color={accent} />
        <Text style={[styles.title, { color: surfaces.textSecondary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.squareBody}>
        {/*
          * Decorative in every state — it encodes only what the two lines
          * below already say — so at large text sizes it steps aside and
          * nothing is lost. No figure is ever abbreviated away.
          */}
        {compact ? null : visual}

        <Text
          style={[styles.squareValue, { color: surfaces.text }]}
          numberOfLines={compact ? 3 : 2}
        >
          {value}
        </Text>
        {detail ? (
          <Text style={[styles.squareDetail, { color: surfaces.textTertiary }]} numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>

      {/*
        * A text action rather than a filled pill. The square is already a
        * bounded object; a second bounded object inside it is the weight this
        * redesign removed.
        */}
      <PressableScale
        onPress={onAction}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${title.toLowerCase()}`}
        style={styles.squareAction}
      >
        <Text style={[styles.actionLabel, { color: accent }]}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={13} color={accent} />
      </PressableScale>
    </View>
  );
}

type WideProps = Omit<ShellProps, 'visual'> & {
  /** `null` when there is no goal to fill — an empty track is not a state. */
  progress: number | null;
};

function WideModule({
  title,
  accent,
  icon,
  value,
  detail,
  spoken,
  progress,
  actionLabel,
  onAction,
  testID,
}: WideProps) {
  const { surfaces } = useTheme();

  return (
    <View testID={testID} style={styles.wide}>
      <View style={styles.head}>
        <Ionicons name={icon} size={14} color={accent} />
        <Text style={[styles.title, { color: surfaces.textSecondary }]}>{title}</Text>
      </View>

      <View style={styles.wideRow}>
        <Text
          style={[styles.wideValue, { color: surfaces.text }]}
          numberOfLines={2}
          accessible
          accessibilityRole="text"
          accessibilityLabel={spoken}
        >
          {value}
          {detail ? (
            <Text style={[styles.wideDetail, { color: surfaces.textTertiary }]}> {detail}</Text>
          ) : null}
        </Text>

        <PressableScale
          onPress={onAction}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${title.toLowerCase()}`}
          style={styles.wideAction}
        >
          <Text style={[styles.actionLabel, { color: accent }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={13} color={accent} />
        </PressableScale>
      </View>

      {progress === null ? null : (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressBar progress={progress} height={3} color={accent} />
        </View>
      )}
    </View>
  );
}

type WaterProps = {
  size: FuelSectionSize;
  /** `24 fl oz` — the day's real total, in the user's own unit. */
  value: string;
  /** `of 64 fl oz`, or `No goal set`. */
  detail: string;
  spoken: string;
  /** 0..1, or `null` with no goal. */
  progress: number | null;
  /** Whole percent, or `null` — what goes inside the ring. */
  percent: number | null;
  onAdd: () => void;
};

/**
 * Hydration, read from Water's own domain.
 *
 * The ring is Water's shape across the app — Fuel is a bar, Peptides a count —
 * so a glance separates the domains before a word is read. It is the same
 * shared `ProgressRing` Home uses; **no second hydration visualisation was
 * invented for this screen**, and the vessel stays on Water's own screen where
 * it belongs.
 *
 * **No goal is an honest state.** Without a target there is nothing to be a
 * fraction of, so the ring carries the droplet instead of a percentage and the
 * module states the day's real total. A ring at 0% would say someone is
 * failing a goal they never set.
 */
export function FuelWaterModule({
  size,
  value,
  detail,
  spoken,
  progress,
  percent,
  onAdd,
}: WaterProps) {
  const { surfaces } = useTheme();

  if (size === 'wide') {
    return (
      <WideModule
        title="WATER"
        accent={palette.water}
        icon="water"
        value={value}
        detail={detail}
        spoken={spoken}
        progress={progress}
        actionLabel="Add"
        onAction={onAdd}
        testID="fuel-water-wide"
      />
    );
  }

  return (
    <SquareModule
      title="WATER"
      accent={palette.water}
      icon="water"
      visual={
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressRing progress={progress ?? 0} size={44} thickness={4} color={palette.water}>
            {percent === null ? (
              <Ionicons name="water" size={16} color={palette.water} />
            ) : (
              <Text style={[styles.ringValue, { color: surfaces.text }]} numberOfLines={1}>
                {percent}%
              </Text>
            )}
          </ProgressRing>
        </View>
      }
      value={value}
      detail={detail}
      spoken={spoken}
      actionLabel="Add"
      onAction={onAdd}
      testID="fuel-water-square"
    />
  );
}

type PeptidesProps = {
  size: FuelSectionSize;
  /** `4 scheduled`, `2 logged today`, `None logged`. */
  value: string;
  detail: string | null;
  spoken: string;
  /** Marks that something is outstanding. The words say so too. */
  outstanding: boolean;
  onOpen: () => void;
};

/**
 * Today's peptides, read-only.
 *
 * Sprint 3's wording rules apply here in full: **"scheduled", never "due"** as
 * an obligation; an unanswered day stays unanswered — never *missed*, *late*
 * or *overdue*; **nothing is scored** — no adherence, no streak, no
 * percentage; and no amount, dose or protocol appears on this screen at all.
 *
 * Neither shape is a ring or a bar. Peptides is a count with a violet badge,
 * so the three domains stay distinguishable at a glance.
 */
export function FuelPeptidesModule({
  size,
  value,
  detail,
  spoken,
  outstanding,
  onOpen,
}: PeptidesProps) {
  const { surfaces } = useTheme();

  if (size === 'wide') {
    return (
      <WideModule
        title="PEPTIDES"
        accent={palette.peptide}
        icon="medical-outline"
        value={value}
        detail={detail}
        spoken={spoken}
        /* A day of peptides has no goal, so there is nothing to fill — the bar
           that used to sit here was permanently empty. */
        progress={null}
        actionLabel="View"
        onAction={onOpen}
        testID="fuel-peptides-wide"
      />
    );
  }

  return (
    <SquareModule
      title="PEPTIDES"
      accent={palette.peptide}
      icon="medical-outline"
      visual={
        <View
          style={[styles.badge, { backgroundColor: `${palette.peptide}1A` }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Ionicons name="medical" size={18} color={palette.peptide} />
          {outstanding ? (
            <View
              style={[
                styles.dot,
                { backgroundColor: palette.peptide, borderColor: surfaces.background },
              ]}
            />
          ) : null}
        </View>
      }
      value={value}
      detail={detail}
      spoken={spoken}
      actionLabel="View"
      onAction={onOpen}
      testID="fuel-peptides-square"
    />
  );
}

const styles = StyleSheet.create({
  square: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.control,
    padding: spacing.m,
    alignItems: 'center',
    gap: spacing.xs,
    /*
     * `minHeight` inline, not `height` and not `maxHeight`. `flex: 1` above
     * resolves a flex basis of 0 on the main axis, which would win over a
     * plain height and collapse the cell; a `maxHeight` would clip growing
     * text, which is what the device pass caught. A floor pins the shape at
     * ordinary text sizes and gets out of the way at large ones. The value is
     * applied inline — it depends on the text scale.
     */
  },
  wide: {
    gap: spacing.xs,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    ...typography.micro,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  squareBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  squareValue: {
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  squareDetail: {
    ...typography.caption,
    textAlign: 'center',
  },
  squareAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 24,
  },
  ringValue: {
    ...typography.micro,
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
  wideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  wideValue: {
    ...typography.bodyMedium,
    fontSize: 17,
    flex: 1,
  },
  wideDetail: {
    ...typography.caption,
    fontWeight: '400',
  },
  wideAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLabel: {
    ...typography.captionMedium,
    fontWeight: '600',
  },
});
