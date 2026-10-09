import {
  BMI_THRESHOLDS,
  IN_TO_M,
  LB_TO_KG,
  bmiFromMetric,
  bmiResult,
  categorize,
  formatBmi,
  heightFromCm,
  heightFromUs,
  metricToUs,
  parseInches,
  parseMeasurement,
  roundBmi,
  usToMetric,
  weightFromLb,
} from '..';

/**
 * The BMI domain.
 *
 * These pin the three things a later change could break without anyone
 * noticing on screen: that both unit systems take **one** calculation path,
 * that the displayed value and its category are derived from the **same**
 * number, and that switching systems converts a body rather than relabelling
 * a digit.
 */

describe('the formula', () => {
  /**
   * Computed independently of the implementation — `kg / m²` by hand — so
   * this fails if the helper ever reaches for the `703 × lb / in²`
   * approximation or mangles a conversion constant.
   */
  it('is kilograms over metres squared', () => {
    expect(bmiFromMetric(80, 1.8)).toBeCloseTo(80 / (1.8 * 1.8), 10);
    expect(bmiFromMetric(80, 1.8)).toBeCloseTo(24.691358, 5);
  });

  it('refuses a non-positive or non-finite input instead of returning Infinity', () => {
    expect(bmiFromMetric(80, 0)).toBeNull();
    expect(bmiFromMetric(0, 1.8)).toBeNull();
    expect(bmiFromMetric(-80, 1.8)).toBeNull();
    expect(bmiFromMetric(80, -1.8)).toBeNull();
    expect(bmiFromMetric(Number.NaN, 1.8)).toBeNull();
    expect(bmiFromMetric(80, Number.POSITIVE_INFINITY)).toBeNull();
  });

  /** The exact definitions, not rounded shorthands. */
  it('uses the exact US conversion constants', () => {
    expect(LB_TO_KG).toBe(0.45359237);
    expect(IN_TO_M).toBe(0.0254);
    expect(weightFromLb(180)).toBeCloseTo(81.6466266, 7);
    expect(heightFromUs(5, 8)).toBeCloseTo(1.7272, 10);
    expect(heightFromCm(172.72)).toBeCloseTo(1.7272, 10);
  });

  /**
   * **US and metric must not be two formulas.** The same physical body
   * entered either way produces the same raw BMI to well below display
   * precision — this is what makes a single normalization path provable
   * rather than merely intended.
   */
  it('gives the same answer whichever system the same body is entered in', () => {
    const viaUs = bmiFromMetric(weightFromLb(180), heightFromUs(5, 8));
    const viaMetric = bmiFromMetric(81.6466266, 1.7272);
    expect(viaUs).not.toBeNull();
    expect(viaUs!).toBeCloseTo(viaMetric!, 9);
  });
});

describe('canonical vectors', () => {
  it.each([
    ['80 kg / 180 cm', 80, 1.8, '24.7', 'Healthy weight'],
    ['100 kg / 180 cm', 100, 1.8, '30.9', 'Obesity'],
    ['50 kg / 180 cm', 50, 1.8, '15.4', 'Underweight'],
  ] as const)('%s reads %s, %s', (_label, kg, m, text, category) => {
    const result = bmiResult(kg, m);
    expect(result).not.toBeNull();
    expect(result!.text).toBe(text);
    expect(result!.category).toBe(category);
  });

  /** The founder's QA vector, taken all the way through the US path. */
  it('5 ft 8 in / 180 lb reads 27.4, Overweight', () => {
    const result = bmiResult(weightFromLb(180), heightFromUs(5, 8));
    expect(result).not.toBeNull();
    expect(result!.raw).toBeCloseTo(27.368626, 5);
    expect(result!.text).toBe('27.4');
    expect(result!.category).toBe('Overweight');
  });
});

describe('rounding', () => {
  it('presents one decimal place', () => {
    expect(formatBmi(roundBmi(27.3692))).toBe('27.4');
    expect(formatBmi(roundBmi(24.691358))).toBe('24.7');
    // A clean integer still shows its decimal, so the field never jumps width.
    expect(formatBmi(roundBmi(25))).toBe('25.0');
  });
});

describe('categories are read off the value the user sees', () => {
  /** §33 — the presented values, exactly. */
  it.each([
    [18.4, 'Underweight'],
    [18.5, 'Healthy weight'],
    [24.9, 'Healthy weight'],
    [25.0, 'Overweight'],
    [29.9, 'Overweight'],
    [30.0, 'Obesity'],
  ] as const)('%s is %s', (bmi, category) => {
    expect(categorize(bmi)).toBe(category);
  });

  it('puts each threshold in the upper category', () => {
    expect(categorize(BMI_THRESHOLDS.healthy)).toBe('Healthy weight');
    expect(categorize(BMI_THRESHOLDS.overweight)).toBe('Overweight');
    expect(categorize(BMI_THRESHOLDS.obesity)).toBe('Obesity');
  });

  /**
   * **The rounding policy, proved.**
   *
   * 80.87 kg at 1.8 m is a raw 24.9598…, which the user sees as `25.0`.
   * Classifying the raw value would print `25.0` beside *Healthy weight* —
   * the contradiction the documented policy exists to prevent. Reverting
   * `bmiResult` to classify `raw` fails exactly here.
   */
  it('classifies a value that rounds up onto a threshold by what it rounds to', () => {
    const result = bmiResult(80.87, 1.8);
    expect(result).not.toBeNull();
    expect(result!.raw).toBeLessThan(25);
    expect(result!.text).toBe('25.0');
    expect(result!.category).toBe('Overweight');
  });

  /** And the same policy in the other direction, at the lower threshold. */
  it('classifies a value that rounds up to 18.5 as Healthy weight', () => {
    // 59.86 kg at 1.8 m → raw 18.4753… → 18.5
    const result = bmiResult(59.86, 1.8);
    expect(result).not.toBeNull();
    expect(result!.raw).toBeLessThan(18.5);
    expect(result!.text).toBe('18.5');
    expect(result!.category).toBe('Healthy weight');
  });

  /** A value rounding *down* off a threshold belongs to the lower band. */
  it('classifies a value that rounds down below a threshold by what it rounds to', () => {
    // 80.8 kg at 1.8 m → raw 24.9382… → 24.9
    const result = bmiResult(80.8, 1.8);
    expect(result).not.toBeNull();
    expect(result!.text).toBe('24.9');
    expect(result!.category).toBe('Healthy weight');
  });

  it('never shows a value and a category that disagree', () => {
    for (let kg = 40; kg <= 140; kg += 0.37) {
      const result = bmiResult(kg, 1.75);
      expect(result).not.toBeNull();
      // The category must be the one the printed number implies.
      expect(result!.category).toBe(categorize(Number(result!.text)));
    }
  });
});

describe('parsing', () => {
  it.each(['', '   ', 'abc', '0', '-5', 'NaN', 'Infinity'])('rejects %p as a measurement', (input) => {
    expect(parseMeasurement(input)).toBeNull();
  });

  it('accepts decimals and surrounding space', () => {
    expect(parseMeasurement('72.5')).toBe(72.5);
    expect(parseMeasurement('  180  ')).toBe(180);
    expect(parseMeasurement('0.5')).toBe(0.5);
  });

  describe('inches', () => {
    /** Empty means zero — `5 ft` is a height, not a half-finished one. */
    it('treats an empty field as zero', () => {
      expect(parseInches('')).toBe(0);
      expect(parseInches('   ')).toBe(0);
    });

    it('accepts zero through just under twelve', () => {
      expect(parseInches('0')).toBe(0);
      expect(parseInches('11')).toBe(11);
      expect(parseInches('11.9')).toBe(11.9);
    });

    it.each(['12', '12.5', '13', '-1', 'abc'])('rejects %p', (input) => {
      expect(parseInches(input)).toBeNull();
    });
  });
});

describe('switching unit systems converts the body, not the label', () => {
  it('turns 5 ft 8 in / 180 lb into 172.7 cm / 81.6 kg', () => {
    expect(usToMetric({ feet: '5', inches: '8', pounds: '180' })).toEqual({
      centimetres: '172.7',
      kilograms: '81.6',
    });
  });

  it('turns 180 cm / 80 kg into 5 ft 10.9 in / 176.4 lb', () => {
    expect(metricToUs({ centimetres: '180', kilograms: '80' })).toEqual({
      feet: '5',
      inches: '10.9',
      pounds: '176.4',
    });
  });

  /** The failure this whole behaviour exists to prevent. */
  it('never carries a number across as though the unit had not changed', () => {
    const metric = usToMetric({ feet: '5', inches: '8', pounds: '180' });
    expect(metric.kilograms).not.toBe('180');
    const us = metricToUs({ centimetres: '180', kilograms: '80' });
    expect(us.pounds).not.toBe('80');
  });

  it('preserves the BMI across a switch, within display precision', () => {
    const before = bmiResult(weightFromLb(180), heightFromUs(5, 8));
    const metric = usToMetric({ feet: '5', inches: '8', pounds: '180' });
    const after = bmiResult(Number(metric.kilograms), Number(metric.centimetres) / 100);

    expect(before!.text).toBe('27.4');
    expect(after!.text).toBe('27.4');
    expect(after!.category).toBe(before!.category);
  });

  /**
   * **Display rounding settles; it does not erode.** One round trip may move
   * a value by a tenth, and then it is a fixed point. Ten toggles must not
   * walk it anywhere.
   */
  it('does not drift on repeated toggling', () => {
    let us = usToMetric({ feet: '5', inches: '8', pounds: '180' });
    let back = metricToUs(us);
    const settledMetric = { ...us };
    const settledUs = { ...back };

    for (let i = 0; i < 10; i += 1) {
      us = usToMetric(back);
      back = metricToUs(us);
      expect(us).toEqual(settledMetric);
      expect(back).toEqual(settledUs);
    }
  });

  it('leaves empty fields empty rather than inventing a zero', () => {
    expect(usToMetric({ feet: '', inches: '', pounds: '' })).toEqual({
      centimetres: '',
      kilograms: '',
    });
    expect(metricToUs({ centimetres: '', kilograms: '' })).toEqual({
      feet: '',
      inches: '',
      pounds: '',
    });
  });

  it('converts a valid field even when its sibling is not', () => {
    // Weight is good, height is half-typed: the good one still converts.
    expect(usToMetric({ feet: '', inches: '', pounds: '180' })).toEqual({
      centimetres: '',
      kilograms: '81.6',
    });
  });

  it('reads blank inches as zero when converting', () => {
    expect(usToMetric({ feet: '6', inches: '', pounds: '' }).centimetres).toBe('182.9');
  });

  it('refuses to produce twelve inches when the remainder rounds up', () => {
    // 182.88 cm is exactly 6 ft; a naive remainder can round to 12 in.
    const us = metricToUs({ centimetres: '182.87', kilograms: '' });
    expect(Number(us.inches)).toBeLessThan(12);
    expect(Number(us.inches)).toBeGreaterThanOrEqual(0);
  });

  it('writes no value for a field whose input is invalid', () => {
    expect(usToMetric({ feet: '5', inches: '13', pounds: 'abc' })).toEqual({
      centimetres: '',
      kilograms: '',
    });
  });
});
