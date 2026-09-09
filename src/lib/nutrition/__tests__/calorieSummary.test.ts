/**
 * The one calorie summary, across every state a day can be in.
 *
 * The founder's 5.6B.4 finding was that Fuel's headline meant *consumed* and
 * Home's meant *remaining* — same day, same totals, two derivations. These pin
 * the single derivation that replaced them: what each state says, what it
 * refuses to say, and that the two screens' strings are built from one place.
 */

import { dailyTotals } from '../model/nutrition';
import { calorieSummary } from '../state/calorieSummary';
import type { FoodEntry, NutritionTargets } from '../model/types';

/** One entry carrying exactly the calories a case needs. */
function day(calories: number): FoodEntry[] {
  return [
    {
      id: 'e1',
      name: 'Test',
      logDate: '2026-09-09',
      loggedAt: '2026-09-09T12:00:00.000Z',
      meal: 'Lunch',
      serving: { label: '1 serving', quantity: 1, unit: 'serving' },
      nutrition: { calories, protein: 0, carbs: 0, fat: 0 },
    } as unknown as FoodEntry,
  ];
}

const summary = (calories: number, targets: NutritionTargets | null = null) =>
  calorieSummary(dailyTotals(day(calories), targets));

describe('no goal', () => {
  it('states the total and claims nothing about a target', () => {
    const view = summary(0);
    expect(view.state).toBe('no-goal');
    expect(view.figure).toBe('0');
    expect(view.caption).toBe('Calories consumed');
    expect(view.goalLine).toBeNull();
    expect(view.goal).toBeNull();
  });

  it('never invents a remainder, an over, or a rail', () => {
    const view = summary(616);
    expect(view.remaining).toBeNull();
    expect(view.over).toBeNull();
    /* `null`, not `0`. A track at zero is the "empty reads as complete" bug. */
    expect(view.progress).toBeNull();
    expect(view.compactDetail).toBeNull();
  });

  it('says consumed on both screens', () => {
    const view = summary(616);
    expect(view.figure).toBe('616');
    expect(view.compact).toBe('616 cal consumed');
    expect(view.spoken).toBe('616 calories consumed. No calorie goal set.');
  });
});

describe('under goal', () => {
  const view = summary(616, { calories: 1500 });

  it('leads with what was consumed, never with what is left', () => {
    // The 5.6B.4 correction, in one assertion: the large figure is intake.
    expect(view.figure).toBe('616');
    expect(view.caption).toBe('Calories consumed');
  });

  it('supports it with the remainder and the goal', () => {
    expect(view.state).toBe('under');
    expect(view.remaining).toBe(884);
    expect(view.over).toBe(0);
    expect(view.goalLine).toBe('884 left · 1,500 goal');
  });

  it('gives Home the same facts, compactly', () => {
    expect(view.compact).toBe('616 cal consumed');
    expect(view.compactDetail).toBe('884 left');
  });

  it('speaks all three figures', () => {
    expect(view.spoken).toBe(
      '616 calories consumed. 1,500 calorie goal. 884 calories remaining.',
    );
  });
});

describe('exactly at goal', () => {
  const view = summary(1500, { calories: 1500 });

  it('says the goal was reached rather than reporting zero left', () => {
    // `0 left` is arithmetic, not a sentence.
    expect(view.state).toBe('met');
    expect(view.remaining).toBe(0);
    expect(view.over).toBe(0);
    expect(view.goalLine).toBe('Goal reached · 1,500 goal');
    expect(view.compactDetail).toBe('Goal reached');
  });

  it('fills the rail exactly once', () => {
    expect(view.progress).toBe(1);
  });
});

describe('over goal', () => {
  const view = summary(1620, { calories: 1500 });

  it('states the excess as a fact', () => {
    expect(view.state).toBe('over');
    expect(view.over).toBe(120);
    expect(view.remaining).toBe(0);
    expect(view.goalLine).toBe('120 over · 1,500 goal');
    expect(view.compactDetail).toBe('120 over');
  });

  it('still leads with consumed', () => {
    expect(view.figure).toBe('1,620');
    expect(view.compact).toBe('1,620 cal consumed');
  });

  it('caps the rail rather than overflowing it', () => {
    expect(view.progress).toBe(1);
  });

  it('carries no verdict, in any string it produces', () => {
    /*
     * Passing a goal is worth noticing and not worth being scolded for. No
     * failure language anywhere — the colour the callers use is amber, and
     * the words never grade the day.
     */
    const strings = [view.figure, view.caption, view.goalLine, view.compact, view.compactDetail, view.spoken]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    for (const word of [
      'exceed',
      'too much',
      'limit',
      'warning',
      'failed',
      'bad',
      'poor',
      'should',
      'recommend',
      'target',
    ]) {
      expect(strings).not.toContain(word);
    }
  });
});

describe('fractional totals', () => {
  it('rounds for display and keeps the arithmetic consistent', () => {
    const view = summary(616.4, { calories: 1500 });
    expect(view.consumed).toBe(616);
    expect(view.figure).toBe('616');
    // 1500 − 616.4 = 883.6, rounded for display.
    expect(view.remaining).toBe(884);
  });
});

describe('loading', () => {
  it('claims nothing at all', () => {
    const view = calorieSummary(dailyTotals([], { calories: 1500 }), true);
    expect(view.state).toBe('loading');
    expect(view.figure).toBe('—');
    expect(view.progress).toBeNull();
    expect(view.goalLine).toBeNull();
  });
});

describe('the two screens', () => {
  it('are built from the same view for every state', () => {
    /*
     * The architectural assertion. Fuel renders `figure` + `caption` +
     * `goalLine`; Home renders `compact` + `compactDetail`. Different
     * strings, one derivation — so they can be laid out differently and
     * cannot describe the day differently.
     */
    for (const [consumed, goal] of [
      [0, null],
      [616, null],
      [616, 1500],
      [1500, 1500],
      [1620, 1500],
    ] as const) {
      const view = summary(consumed, goal === null ? null : { calories: goal });

      // The figure both screens lead with is the same number.
      expect(view.compact.startsWith(view.figure)).toBe(true);
      // Fuel's supporting line opens with exactly Home's detail.
      if (view.goalLine) expect(view.goalLine.startsWith(view.compactDetail!)).toBe(true);
      else expect(view.compactDetail).toBeNull();
      // And the rail is one number, not two.
      expect(view.progress).toBe(goal === null ? null : Math.min(1, consumed / goal));
    }
  });
});
