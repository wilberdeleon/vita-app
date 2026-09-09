import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { PressableScale, ProgressBar } from '../../../components/ui';
import {
  calorieSummary,
  formatAmount,
  hasAnyGoal,
  progress,
  roundForDisplay,
  type DailyNutrition,
  type MacroKey,
} from '../../../lib/nutrition';
import { macroAccent } from '../macroAccent';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * Amber, not red, when a calorie goal is passed. Passing a target is worth
 * noticing and not worth being scolded for, and red is the colour VITA uses
 * for nothing else here.
 */
const OVER_ACCENT = palette.carbs;

type Props = {
  today: DailyNutrition;
  /**
   * Water's goal counts as configuration: setup offers all three, so someone
   * who set only a water goal has been through it and must not be asked again.
   */
  waterHasGoal: boolean;
  /** True once the user chose *Skip for now*. Softens the invitation. */
  setupDismissed: boolean;
  onSetUp: () => void;
};

/**
 * **Fuel's first section** — what the day added up to, stated, not scored.
 *
 * ## Why it leads
 *
 * 5.6B.1 opened with the Day Strip. The founder's device review was that Fuel
 * had become visually interesting while the information it exists for had been
 * pushed down the page: the screen's first practical question is *where am I
 * today*, and calories are the answer. The strip is personality and context
 * and now follows this rather than preceding it.
 *
 * ## Calories say only what is true
 *
 * With no goal: the figure and `Calories today`. No ring, no percentage, no
 * remainder, no denominator — there is nothing to be a fraction of. With a
 * goal the user set: the same figure, the goal beside it, what is left or what
 * is over, and a slim rail. **Never a large ring**: a ring is the gesture of a
 * scoreboard, and it was the single most generic thing on the old screen.
 *
 * ## Protein can have a goal; carbs and fat cannot
 *
 * Founder ruling, 5.6A.1, reaffirmed in 5.6B.2. Protein is something people
 * set out to reach, so it may carry a target and a rail. Carbohydrate and fat
 * are secondary totals: tracked, summed and shown exactly as before, and they
 * can never gain a denominator, a rail, or an implied ceiling. VITA does not
 * invent limits it was not given.
 *
 * ## Zeroes are not a dashboard
 *
 * A user with no goals and no food used to get `0` above `Protein 0 g · Carbs
 * 0 g · Fat 0 g` — a scoreboard for a game nobody has played. So the section
 * has four states rather than one, and the emptiest of them leads with the one
 * useful thing on offer: setting the goals up. **The moment real food exists
 * the figures take the lead again**, goals or not; VITA never hides what
 * someone actually ate because they declined to configure a target.
 *
 * ## Why there is no composition bar
 *
 * The 5.6 audit proposed one — a slim bar showing the share of the day's
 * energy from each macro — and 5.6B built it before removing it. Rendered, it
 * was the most generic object on the screen: VITA's macro tokens are green,
 * amber and red, so a contiguous tri-colour bar reads as a **traffic light**,
 * which is precisely the health verdict the brief forbids. It stays removed by
 * founder instruction (5.6B.2 §73).
 */
export function NutritionContext({ today, waterHasGoal, setupDismissed, onSetUp }: Props) {
  const { surfaces } = useTheme();

  const hasGoals = hasAnyGoal(today.targets);
  const configured = hasGoals || waterHasGoal;
  const noFood = today.isEmpty;

  /* ── nothing set up, nothing eaten ─────────────────────────────────────
   * The one state where there is genuinely nothing to report. Rather than
   * report it as zeroes, the section becomes the offer — and once that offer
   * has been declined it shrinks to a quiet link, because an invitation that
   * returns at full size after being waved away is nagging.
   */
  if (!configured && noFood) {
    return (
      <View style={styles.section}>
        <Heading />
        {setupDismissed ? (
          <>
            <Text style={[styles.restingTitle, { color: surfaces.text }]}>
              No food logged today
            </Text>
            <SetUpLink onPress={onSetUp} />
          </>
        ) : (
          <>
            <Text style={[styles.setupTitle, { color: surfaces.text }]}>Set up Fuel</Text>
            <Text style={[styles.setupBody, { color: surfaces.textTertiary }]}>
              Add calorie, protein, and water goals. Optional — Fuel works without them.
            </Text>
            <PressableScale
              onPress={onSetUp}
              accessibilityRole="button"
              accessibilityLabel="Set up Fuel"
              accessibilityHint="Set optional calorie, protein and water goals"
              style={[styles.setupButton, { borderColor: surfaces.border }]}
            >
              <Text style={[styles.setupButtonLabel, { color: surfaces.text }]}>Set up Fuel</Text>
              <Ionicons name="chevron-forward" size={14} color={palette.primary} />
            </PressableScale>
            <Text style={[styles.restingFoot, { color: surfaces.textTertiary }]}>
              No food logged today
            </Text>
          </>
        )}
      </View>
    );
  }

  /* ── set up, but the day has not started ───────────────────────────────
   * The goals the user set are stated, never reported as `0 / 2,000` and
   * `0%` — a progress report on a day that has not begun.
   */
  if (noFood) {
    const stated = [
      today.targets?.calories !== undefined
        ? `${today.targets.calories.toLocaleString()} calorie goal`
        : null,
      today.targets?.protein !== undefined ? `${today.targets.protein} g protein goal` : null,
    ].filter(Boolean);

    return (
      <View style={styles.section}>
        <Heading />
        <Text style={[styles.restingTitle, { color: surfaces.text }]}>No food logged today</Text>
        {stated.length > 0 ? (
          <Text style={[styles.restingBody, { color: surfaces.textTertiary }]}>
            {stated.join(' · ')}
          </Text>
        ) : null}
        {/* Only a water goal exists, so the nutrition half is still on offer. */}
        {hasGoals ? null : <SetUpLink onPress={onSetUp} />}
      </View>
    );
  }

  return <NutritionFigures today={today} configured={configured} onSetUp={onSetUp} />;
}

/**
 * The section's name.
 *
 * Present only in the states that have no headline figure of their own. Once
 * calories lead, the number *is* the heading and a label above it would be
 * chrome — the same reason the Day Strip and Meals carry none.
 */
function Heading() {
  const { surfaces } = useTheme();
  return (
    <Text style={[styles.heading, { color: surfaces.textSecondary }]}>NUTRITION</Text>
  );
}

/** The quiet way into setup, once the full invitation is not appropriate. */
function SetUpLink({ onPress }: { onPress: () => void }) {
  const { surfaces } = useTheme();

  return (
    <PressableScale
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Set up Fuel"
      accessibilityHint="Set optional calorie, protein and water goals"
      style={styles.setupLink}
    >
      <Text style={[styles.setupLinkLabel, { color: surfaces.textSecondary }]}>Set up Fuel</Text>
      <Ionicons name="chevron-forward" size={13} color={surfaces.textTertiary} />
    </PressableScale>
  );
}

function NutritionFigures({
  today,
  configured,
  onSetUp,
}: {
  today: DailyNutrition;
  configured: boolean;
  onSetUp: () => void;
}) {
  const { surfaces, scheme } = useTheme();
  const { fontScale } = useWindowDimensions();

  const consumed = roundForDisplay(today.nutrition);
  const proteinGoal = today.targets?.protein;
  /*
   * **The same summary Home's Fuel widget is built from.** Every calorie
   * string on this screen comes out of `calorieSummary`, so the two can render
   * differently — a square widget cannot carry three lines — and still cannot
   * disagree. See `lib/nutrition/state/calorieSummary.ts`.
   */
  const calories = calorieSummary(today, today.isLoading);

  return (
    <View style={styles.section}>
      <View accessible accessibilityRole="text" accessibilityLabel={calories.spoken}>
        {/*
          * **The large number always means consumed.** Founder ruling: it read
          * as *remaining* on Home and *consumed* here, which is the one thing
          * a headline figure must not leave to inference. The caption says so
          * outright rather than relying on the reader knowing.
          *
          * Amber when the goal is passed — never red, never an icon, never a
          * warning. Passing a target is worth noticing and not worth being
          * scolded for.
          */}
        <Text
          style={[
            styles.calories,
            /*
             * The line box has to scale with the type.
             *
             * React Native scales `fontSize` by the system text setting and
             * leaves `lineHeight` in raw points, so a fixed one is a fixed
             * *ceiling* — at accessibility sizes the 51pt figure overflowed
             * its 37pt line and landed on the caption beneath it. The device
             * pass caught it; this is the same tracking and rhythm, expressed
             * as a ratio so it survives every size.
             */
            { lineHeight: Math.round(37 * fontScale) },
            { color: calories.state === 'over' ? OVER_ACCENT : surfaces.text },
          ]}
        >
          {calories.figure}
        </Text>
        <Text style={[styles.caloriesLabel, { color: surfaces.textSecondary }]}>
          {calories.caption}
        </Text>
        {calories.goalLine ? (
          <Text style={[styles.caloriesGoal, { color: surfaces.textTertiary }]}>
            {calories.goalLine}
          </Text>
        ) : null}
      </View>

      {/* A rail only where there is a real target to fill it. */}
      {calories.progress === null ? null : (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <ProgressBar
            progress={calories.progress}
            height={3}
            color={calories.state === 'over' ? OVER_ACCENT : palette.primary}
          />
        </View>
      )}

      <View style={[styles.macros, { borderTopColor: surfaces.border }]}>
        <Macro
          macro="protein"
          label="Protein"
          value={`${formatAmount(consumed.protein)}${proteinGoal === undefined ? '' : ` / ${proteinGoal}`} g`}
          spoken={
            proteinGoal === undefined
              ? `${formatAmount(consumed.protein)} grams protein.`
              : `${formatAmount(consumed.protein)} grams of ${proteinGoal} gram protein goal.`
          }
          rail={proteinGoal === undefined ? null : progress(consumed.protein, proteinGoal)}
          accent={macroAccent('protein', scheme)}
          /* Alignment only — see `Macro`. Nothing is drawn. */
          reserveRail={proteinGoal !== undefined}
        />
        <Macro
          macro="carbs"
          label="Carbs"
          value={`${formatAmount(consumed.carbs)} g`}
          spoken={`${formatAmount(consumed.carbs)} grams carbohydrates.`}
          rail={null}
          accent={macroAccent('carbs', scheme)}
          reserveRail={proteinGoal !== undefined}
        />
        <Macro
          macro="fat"
          label="Fat"
          value={`${formatAmount(consumed.fat)} g`}
          spoken={`${formatAmount(consumed.fat)} grams fat.`}
          rail={null}
          accent={macroAccent('fat', scheme)}
          reserveRail={proteinGoal !== undefined}
        />
      </View>

      {/*
        * Food exists but no goals do. The intake above still leads — that is
        * the founder's §33 ruling — and the offer sits under it as one quiet
        * line rather than displacing the figures.
        */}
      {configured ? null : <SetUpLink onPress={onSetUp} />}
    </View>
  );
}

function Macro({
  macro,
  label,
  value,
  spoken,
  rail,
  accent,
  reserveRail = false,
}: {
  macro: MacroKey;
  label: string;
  value: string;
  spoken: string;
  /** `null` when this macro has no goal — carbs and fat never do. */
  rail: number | null;
  /**
   * The macro's **category** colour — see `macroAccent`.
   *
   * It marks which of the three this is and means nothing else: not good, not
   * bad, not over, not under. It is carried by the small label and, where a
   * goal exists, by the rail; the figure itself stays neutral and
   * high-contrast, which is as far as identity goes before it starts looking
   * like a status.
   */
  accent: string;
  /**
   * Hold the rail's height in a column that has no rail, so the three
   * columns end level.
   *
   * **Space, not a track.** Nothing is drawn: an empty progress track under
   * carbs would imply a target they do not have and must never have. This is
   * the alternative to a ragged row — the founder's note was that the three
   * should look intentionally related, and a column that is 6pt shorter than
   * its neighbour looks like a mistake rather than like a distinction.
   */
  reserveRail?: boolean;
}) {
  const { surfaces } = useTheme();

  return (
    <View
      style={styles.macro}
      accessible
      accessibilityRole="text"
      accessibilityLabel={spoken}
      testID={`fuel-macro-${macro}`}
    >
      <Text style={[styles.macroLabel, { color: accent }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.macroValue, { color: surfaces.text }]} numberOfLines={2}>
        {value}
      </Text>
      {rail === null ? (
        reserveRail ? <View style={styles.macroRailSpace} /> : null
      ) : (
        <View style={styles.macroRail}>
          <ProgressBar progress={rail} height={2} color={accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.s,
  },
  heading: {
    ...typography.micro,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  calories: {
    /*
     * The section's subject, and deliberately not bigger than that.
     *
     * `typography.display` at its authored tracking reads loose for a figure
     * — digits want tighter spacing than words — and the negative margin that
     * used to pull the label up under it was a hack standing in for a line
     * height. A real `lineHeight` does the same job honestly and survives
     * Dynamic Type, where a negative margin does not scale with the text it
     * was compensating for.
     */
    ...typography.display,
    letterSpacing: -0.6,
    /* `lineHeight` is applied inline — it depends on the text scale. */
  },
  caloriesLabel: {
    // The caption that makes the figure unambiguous. Body-weight, not a
    // whisper: it is the half of the headline that carries the meaning.
    ...typography.bodyMedium,
    fontSize: 15,
  },
  caloriesGoal: {
    ...typography.caption,
    fontSize: 13.5,
    marginTop: 1,
  },
  macros: {
    flexDirection: 'row',
    // Equal thirds with a generous gutter: three columns of the same width
    // read as one row of related figures rather than as three labels that
    // happened to line up.
    gap: spacing.l,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.m,
    marginTop: spacing.xs,
  },
  macro: {
    flex: 1,
    gap: 2,
  },
  macroLabel: {
    // Small, coloured, and slightly tracked — an eyebrow that identifies the
    // column. The weight goes to the figure below it.
    ...typography.micro,
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  macroValue: {
    // 17pt — the same size the shared Water and Peptides modules give their
    // value line, so the figures across Fuel and Home sit at one weight.
    // Nothing on this section should read as small print.
    ...typography.bodyMedium,
    fontSize: 17,
    fontWeight: '600',
  },
  macroRail: {
    marginTop: spacing.s,
  },
  macroRailSpace: {
    // The rail's own height plus its margin. Empty on purpose.
    marginTop: spacing.s,
    height: 2,
  },
  setupTitle: {
    ...typography.heading,
    fontSize: 19,
  },
  setupBody: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    minHeight: 40,
  },
  setupButtonLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  setupLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    minHeight: 36,
  },
  setupLinkLabel: {
    ...typography.captionMedium,
  },
  restingTitle: {
    ...typography.bodyMedium,
    fontSize: 17,
  },
  restingBody: {
    ...typography.caption,
    marginTop: -spacing.xs,
  },
  restingFoot: {
    ...typography.caption,
  },
});
