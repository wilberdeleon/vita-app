import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { COMPACT_FONT_SCALE } from '../../../components/modules';
import {
  Card,
  NumericField,
  Screen,
  ScreenHeader,
  SectionHeader,
  SegmentedTabs,
} from '../../../components/ui';
import {
  BMI_THRESHOLDS,
  bmiResult,
  heightFromCm,
  heightFromUs,
  metricToUs,
  parseInches,
  parseMeasurement,
  usToMetric,
  weightFromLb,
  type BmiCategory,
  type MetricFields,
  type UnitSystem,
  type UsFields,
} from '../../../lib/bmi';
import { palette, radii, spacing, typography } from '../../../theme/tokens';
import { useTheme } from '../../../theme/ThemeProvider';

/**
 * The BMI calculator — a reference tool, and nothing more.
 *
 * ## What it answers, and what it refuses to
 *
 * One question: *given a height and a weight, what is the resulting adult
 * BMI and reference category?* It does not tell anyone what to weigh, what
 * to eat, or what to do. There is **no ideal weight, no target BMI, no
 * weight to lose or gain, no calories, no TDEE, no BMR, no macros, no risk
 * score and no diagnosis** — and the absence is the product decision, not a
 * backlog. A screening measure that starts prescribing has become a diet
 * app, which VITA is not.
 *
 * **Categories describe the number, never the person.** The result reads
 * *BMI category · Overweight*, not *you are overweight*. The distinction is
 * small on the page and the whole point of the screen.
 *
 * ## No colour grading
 *
 * There is **no green for healthy and no red for obesity** — no traffic
 * light, no smiley, no celebration and no warning. Colour that grades a
 * body is a scoring system, and VITA has no scores. One restrained accent
 * marks *the BMI value*, which is the thing the user came for, and the
 * category sits in ordinary type beneath it. Every meaning on this screen
 * survives being read in greyscale.
 *
 * ## Nothing is saved
 *
 * No history, no favourites, no log, no Journey or Weight record, no
 * storage key. Values live in component state and die with the screen —
 * exactly like the Peptide Calculator beside it in the hub. Sprint 6 owns
 * stored height and weight; this slice must not quietly become it.
 *
 * Nothing is pulled in either: no profile height, no logged weight, no
 * Health data. Every number on this screen was typed by the person reading
 * it.
 */

/**
 * The accent, per scheme.
 *
 * Gold because BMI belongs to no feature. The two tools beside it in the
 * hub are Peptides' and wear Peptides' violet; borrowing that would file a
 * body-measurement tool under peptides. Fuel's orange would say nutrition.
 * **Green is specifically wrong here** — green next to a BMI category reads
 * as a grade no matter what the copy says. Brand gold is the one accent
 * that claims a tool for VITA itself rather than for a domain.
 *
 * Two values because one does not work: `palette.gold` on the cream
 * background sits near 1.7:1 and is visibly washed out, which Dashboard
 * already measured and solved the same way for its quotation. The hue is
 * kept and deepened for light rather than swapped for another colour.
 *
 * Declared here rather than imported: `QUOTE_GOLD` lives in
 * `features/dashboard`, and features do not import one another. One
 * component's scheme pair, kept beside the component that uses it.
 */
export const BMI_GOLD = { light: '#8A6A2C', dark: palette.gold } as const;

/**
 * The category colours (founder correction, slice 5.9B.1).
 *
 * ## What changed, and what did not
 *
 * 5.9 shipped the categories deliberately neutral, on the argument that
 * colouring a body measurement turns a reference tool into a grade. **The
 * founder reviewed it and ruled the other way**: the bands should be legible
 * at a glance. That is their call to make, and it is made.
 *
 * What the reversal does *not* touch is the reason the rule existed. **Colour
 * is supplemental and never load-bearing**: the number and the category are
 * always written out, so the screen reads identically in greyscale, to a
 * colour-blind eye, and to a screen reader — which hears one sentence that
 * never mentions a colour. And the treatment stays small: a number and a
 * word, not a green card, a red border or a warning banner. This is a
 * reference tool that tells you which band you are in, not an alarm.
 *
 * ## Why not the existing palette tokens
 *
 * Measured, not assumed. `palette.success` green reaches only **3.41:1** on
 * the light result card — fine for the large number, short of the 4.5:1 that
 * 15pt category text needs — and `palette.carbs` amber is **2.03:1**, which
 * is unreadable. The two that would otherwise fit carry the wrong meaning:
 * `palette.fat` is documented as the app-wide *error* colour, and a BMI band
 * is not an error; `palette.water` is Water's feature identity.
 *
 * So these are named for their role, the way `routineSkipped` was — the hues
 * echo VITA's existing ones, deepened for light and softened for dark, the
 * same split `BMI_GOLD` needed and for the same reason. **Every value clears
 * 4.5:1 against both the card and the page in its own scheme**, so the number
 * and the label are both safe to colour. The dark blue is deliberately lighter
 * than `palette.water` so it does not read as a Water surface.
 *
 * Gold remains the *tool's* identity — the hub row, the Quick Tool tile —
 * while these describe the *answer*. The launcher never wears a category
 * colour, because it has no result to report.
 */
export const BMI_CATEGORY_COLORS: Record<BmiCategory, { light: string; dark: string }> = {
  /* Cool and informational. Never red: both ends of the scale being alarming
     would say that only the middle is acceptable. */
  Underweight: { light: '#1F63C4', dark: '#7FB3F5' },
  'Healthy weight': { light: '#1F7A43', dark: '#53C285' },
  /* Amber, not yellow — neon yellow is illegible on cream. */
  Overweight: { light: '#9A6508', dark: '#E0A33A' },
  /* Restrained, and deliberately not the error red. */
  Obesity: { light: '#B4323A', dark: '#E8767A' },
};

/** Where the reference rail starts and ends. Wide enough to hold real bodies. */
const RAIL_MIN = 15;
const RAIL_MAX = 40;

type Props = {
  /**
   * Starting values, for the `__DEV__` preview only — **not a feature**.
   * Expo Router passes no props, so every real visit opens empty. The same
   * seam the Peptide Calculator exposes, for the same reason: the states
   * worth reviewing are the ones that need typing to reach.
   */
  initialSystem?: UnitSystem;
  initialUs?: Partial<UsFields>;
  initialMetric?: Partial<MetricFields>;
};

export default function BmiCalculator({
  initialSystem = 'us',
  initialUs,
  initialMetric,
}: Props = {}) {
  const { surfaces, scheme } = useTheme();
  const dark = scheme === 'dark';

  const [system, setSystem] = useState<UnitSystem>(initialSystem);
  const [us, setUs] = useState<UsFields>({
    feet: initialUs?.feet ?? '',
    inches: initialUs?.inches ?? '',
    pounds: initialUs?.pounds ?? '',
  });
  const [metric, setMetric] = useState<MetricFields>({
    centimetres: initialMetric?.centimetres ?? '',
    kilograms: initialMetric?.kilograms ?? '',
  });

  /**
   * Switching systems converts what is valid and leaves the rest alone.
   *
   * The failure being prevented is `180 lb` silently becoming `180 kg`
   * because only the label changed. Anything unparseable stays exactly as
   * typed, with its error — a unit toggle must not destroy input.
   */
  const switchTo = (next: UnitSystem) => {
    if (next === system) return;
    if (next === 'metric') setMetric(usToMetric(us));
    else setUs(metricToUs(metric));
    setSystem(next);
  };

  const isUs = system === 'us';

  // A present-but-unparseable field is invalid; an empty one is simply not
  // answered yet, and an untouched screen shows no errors at all.
  const feet = parseMeasurement(us.feet);
  const inches = parseInches(us.inches);
  const pounds = parseMeasurement(us.pounds);
  const centimetres = parseMeasurement(metric.centimetres);
  const kilograms = parseMeasurement(metric.kilograms);

  const touched = (value: string) => value.trim().length > 0;
  const feetInvalid = touched(us.feet) && feet === null;
  const inchesInvalid = touched(us.inches) && inches === null;
  const poundsInvalid = touched(us.pounds) && pounds === null;
  const cmInvalid = touched(metric.centimetres) && centimetres === null;
  const kgInvalid = touched(metric.kilograms) && kilograms === null;

  const metres = isUs
    ? feet !== null && inches !== null
      ? heightFromUs(feet, inches)
      : null
    : centimetres !== null
      ? heightFromCm(centimetres)
      : null;

  const kg = isUs
    ? pounds !== null
      ? weightFromLb(pounds)
      : null
    : kilograms !== null
      ? kilograms
      : null;

  const result = metres !== null && kg !== null ? bmiResult(kg, metres) : null;

  /**
   * Derived from the canonical category, never from a second copy of the
   * thresholds — the classification lives in `src/lib/bmi` and this reads it.
   *
   * Read **inside** the branch that has a result, so there is no colour in
   * scope at all when there is none. An invalid entry cannot leave the last
   * answer's band tinting an empty card, because the value never survives
   * the result that produced it.
   */
  const categoryColorFor = (category: BmiCategory) =>
    BMI_CATEGORY_COLORS[category][dark ? 'dark' : 'light'];

  return (
    <Screen keyboardAware contentGap={spacing.m}>
      <ScreenHeader title="BMI Calculator" back />

      {/* What the tool is, in one line: the measure, its scope, and that it
          keeps nothing. Everything else it might say belongs in ABOUT BMI. */}
      <Text style={[styles.intro, { color: surfaces.textTertiary }]}>
        Adult BMI from your height and weight. Nothing here is saved.
      </Text>

      {/* Local to this screen. BMI does not touch Settings → Units, which
          governs how Water and Fuel display their own stored values. */}
      <SegmentedTabs
        options={['US', 'Metric']}
        selectedIndex={isUs ? 0 : 1}
        onChange={(index) => switchTo(index === 0 ? 'us' : 'metric')}
        groupLabel="Unit system"
      />

      <SectionHeader title="Measurements" />

      {/* One group: the fields, their errors and their sub-labels share a
          rhythm, and `Screen` spaces this group from the sections around it
          — the arrangement the Peptide Calculator settled on. */}
      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: surfaces.textSecondary }]}>Height</Text>

        {isUs ? (
          <>
            <View style={styles.pair}>
              <View style={styles.pairField}>
                <NumericField
                  label="Feet"
                  placeholder="e.g. 5"
                  value={us.feet}
                  onChangeText={(feetText) => setUs({ ...us, feet: feetText })}
                  accessibilityLabel="Height, feet"
                />
              </View>
              <View style={styles.pairField}>
                <NumericField
                  label="Inches"
                  placeholder="e.g. 8"
                  value={us.inches}
                  onChangeText={(inchesText) => setUs({ ...us, inches: inchesText })}
                  accessibilityLabel="Height, inches"
                />
              </View>
            </View>
            {feetInvalid ? (
              <Text style={[styles.error, { color: palette.fat }]}>
                Enter a number greater than zero.
              </Text>
            ) : null}
            {inchesInvalid ? (
              <Text style={[styles.error, { color: palette.fat }]}>
                Enter a value from 0 to under 12.
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <NumericField
              label="Centimetres"
              placeholder="e.g. 173"
              value={metric.centimetres}
              onChangeText={(cm) => setMetric({ ...metric, centimetres: cm })}
              accessibilityLabel="Height in centimetres"
            />
            {cmInvalid ? (
              <Text style={[styles.error, { color: palette.fat }]}>
                Enter a number greater than zero.
              </Text>
            ) : null}
          </>
        )}

        <Text style={[styles.groupLabel, styles.secondLabel, { color: surfaces.textSecondary }]}>
          Weight
        </Text>

        {isUs ? (
          <>
            <NumericField
              label="Pounds"
              placeholder="e.g. 180"
              value={us.pounds}
              onChangeText={(lb) => setUs({ ...us, pounds: lb })}
              accessibilityLabel="Weight in pounds"
            />
            {poundsInvalid ? (
              <Text style={[styles.error, { color: palette.fat }]}>
                Enter a number greater than zero.
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <NumericField
              label="Kilograms"
              placeholder="e.g. 82"
              value={metric.kilograms}
              onChangeText={(kgText) => setMetric({ ...metric, kilograms: kgText })}
              accessibilityLabel="Weight in kilograms"
            />
            {kgInvalid ? (
              <Text style={[styles.error, { color: palette.fat }]}>
                Enter a number greater than zero.
              </Text>
            ) : null}
          </>
        )}
      </View>

      {/* The result is derived, never submitted. No Calculate button: the
          answer is a function of the fields, and a button would only add a
          step between typing and knowing. */}
      <Text style={[styles.groupLabel, { color: surfaces.textSecondary }]}>Result</Text>

      <Card style={styles.result}>
        {result === null ? (
          /* Not `0.0`, and no category. An unanswered question has no
             answer, and a fabricated zero is a number the user did not
             produce. The same reason the rail is not drawn yet either. */
          <Text style={[styles.pending, { color: surfaces.textSecondary }]}>
            Enter height and weight to calculate BMI.
          </Text>
        ) : (
          <View
            accessible
            accessibilityRole="text"
            /* One node, one sentence. Read as a value and its category
               rather than as two unrelated strings, and the category is
               spoken — so nothing here depends on seeing a colour. */
            accessibilityLabel={`BMI ${result.text}, category ${result.category}`}
          >
            {/* The number and its band share one colour, because they are
                one statement. `BMI category ·` stays in the colour too — it
                is the label of the thing being coloured, not a second idea. */}
            <Text
              style={[styles.value, { color: categoryColorFor(result.category) }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {result.text}
            </Text>
            <Text
              style={[styles.category, { color: categoryColorFor(result.category) }]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              BMI category · {result.category}
            </Text>

            <ReferenceRail bmi={result.rounded} accent={categoryColorFor(result.category)} />
          </View>
        )}
      </Card>

      <Text style={[styles.aboutLabel, { color: surfaces.textTertiary }]}>ABOUT BMI</Text>
      {/* One sentence. A screening measure, stated plainly — not a
          legalistic disclaimer card, which would make a simple tool look
          like something to be afraid of. */}
      <Text style={[styles.about, { color: surfaces.textTertiary }]}>
        BMI is a screening measure for adults. It does not measure body fat directly and does not
        diagnose health.
      </Text>
    </Screen>
  );
}

/**
 * Where this BMI sits between the reference thresholds.
 *
 * **One neutral track, no zones.** Colouring the bands green through red is
 * precisely the scoring system this tool refuses to be; the only colour is
 * the marker for the user's own value, which is the same accent the number
 * above already uses. Thresholds are hairline ticks with their numbers
 * beneath, so the scale is readable in greyscale.
 *
 * Decorative to assistive technology: the value and its category are
 * already spoken as one sentence above, and a screen reader walking three
 * loose numbers would add noise rather than meaning.
 *
 * **Past `COMPACT_FONT_SCALE` it steps aside entirely**, which is the rule
 * Dashboard's squares already follow: a fixed track and growing text
 * eventually collide, and when they do the ornament yields to the words.
 * Found on device at accessibility-extra-large, where `18.5` wrapped onto a
 * second line and spilled out of the card into the note below. Nothing is
 * lost — the rail is already hidden from assistive technology because the
 * number and its category state everything it encodes, so dropping it costs
 * a reader nothing and buys the figures their room. The same documented
 * threshold rather than a second one invented here.
 */
function ReferenceRail({ bmi, accent }: { bmi: number; accent: string }) {
  const { surfaces } = useTheme();
  const { fontScale } = useWindowDimensions();

  if (fontScale >= COMPACT_FONT_SCALE) return null;
  const position = (value: number): `${number}%` => {
    const percent = ((value - RAIL_MIN) / (RAIL_MAX - RAIL_MIN)) * 100;
    return `${Math.min(100, Math.max(0, percent))}%`;
  };

  return (
    <View
      style={styles.rail}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={[styles.track, { backgroundColor: surfaces.track }]}>
        {[BMI_THRESHOLDS.healthy, BMI_THRESHOLDS.overweight, BMI_THRESHOLDS.obesity].map(
          (threshold) => (
            <View
              key={threshold}
              style={[styles.tick, { left: position(threshold), backgroundColor: surfaces.border }]}
            />
          ),
        )}
        <View style={[styles.marker, { left: position(bmi), backgroundColor: accent }]} />
      </View>

      {/*
        * Each number sits under its own tick.
        *
        * They were laid out `space-between` first, which put `30` hard
        * against the right edge while its tick was at 60% of the track —
        * a scale whose labels pointed at the wrong places. Found on device,
        * because on paper the row looked fine. Each label is now a
        * fixed-width box centred on its threshold, which is the only way to
        * centre on a point without measuring the text.
        */}
      <View style={styles.scaleLabels}>
        {[BMI_THRESHOLDS.healthy, BMI_THRESHOLDS.overweight, BMI_THRESHOLDS.obesity].map(
          (threshold) => (
            <Text
              key={threshold}
              style={[styles.scaleLabel, { color: surfaces.textTertiary, left: position(threshold) }]}
            >
              {threshold}
            </Text>
          ),
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    ...typography.caption,
  },
  group: {
    gap: spacing.s,
  },
  groupLabel: {
    ...typography.captionMedium,
  },
  secondLabel: {
    marginTop: spacing.s,
  },
  /* Feet and inches share a line at the default size and wrap on their own
     at accessibility sizes, because each half is free to grow. */
  pair: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  pairField: {
    flex: 1,
  },
  error: {
    ...typography.caption,
  },
  result: {
    gap: spacing.xs,
  },
  pending: {
    ...typography.body,
  },
  /* The number is the hero of the card, not of the screen — large enough to
     be the answer, nowhere near the half-screen display a score would get. */
  value: {
    ...typography.display,
  },
  category: {
    ...typography.body,
  },
  rail: {
    marginTop: spacing.m,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    justifyContent: 'center',
  },
  tick: {
    position: 'absolute',
    width: 1,
    height: 10,
  },
  marker: {
    position: 'absolute',
    width: 3,
    height: 14,
    borderRadius: radii.pill,
    marginLeft: -1,
  },
  /* Tall enough to hold one absolutely-positioned row of labels, and it
     grows with the text because the height comes from the token. */
  scaleLabels: {
    marginTop: spacing.xs,
    height: typography.micro.fontSize * 1.6,
  },
  scaleLabel: {
    ...typography.micro,
    position: 'absolute',
    /* A fixed box centred on the tick: half its width to the left, text
       centred inside. Wide enough for `18.5` well past the default size,
       and the three boxes cannot reach each other at any text size. */
    width: 56,
    marginLeft: -28,
    textAlign: 'center',
  },
  aboutLabel: {
    ...typography.micro,
    letterSpacing: 0.6,
    marginTop: spacing.s,
  },
  about: {
    ...typography.caption,
  },
});
