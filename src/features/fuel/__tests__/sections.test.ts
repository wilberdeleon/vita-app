/**
 * Fuel's section order — normalization and the two ways it moves.
 *
 * Pure, for the reason `dragLayout.ts` and `weekSwipe.ts` are: a
 * `PanResponder` is only reachable through React Native's responder
 * negotiation, and the decisions worth pinning are functions of a few
 * numbers.
 */

import {
  DEFAULT_FUEL_ORDER,
  FUEL_SECTIONS,
  moveSection,
  normalizeFuelOrder,
  reorderSection,
  targetIndexFor,
} from '../sections';

describe('the default order', () => {
  it('is the founder-approved hierarchy', () => {
    expect([...DEFAULT_FUEL_ORDER]).toEqual([
      'dayStrip',
      'nutrition',
      'meals',
      'water',
      'peptides',
    ]);
  });
});

describe('normalizing what came back from storage', () => {
  it('accepts a complete order unchanged', () => {
    const stored = ['water', 'meals', 'dayStrip', 'peptides', 'nutrition'];
    expect(normalizeFuelOrder(stored)).toEqual(stored);
  });

  it('falls back when there is nothing stored', () => {
    for (const nothing of [null, undefined, 'nope', 42, {}]) {
      expect(normalizeFuelOrder(nothing)).toEqual([...DEFAULT_FUEL_ORDER]);
    }
  });

  it('drops a section that no longer exists', () => {
    const order = normalizeFuelOrder(['meals', 'movement', 'dayStrip']);
    expect(order).not.toContain('movement');
    expect(order).toHaveLength(FUEL_SECTIONS.length);
  });

  it('drops a repeat rather than rendering a section twice', () => {
    const order = normalizeFuelOrder(['meals', 'meals', 'dayStrip']);
    expect(order.filter((id) => id === 'meals')).toHaveLength(1);
  });

  it('appends a section added since the order was written', () => {
    /*
     * The case that matters for a later slice: a user who arranged Fuel
     * before a section existed must not lose it, and must not lose their
     * arrangement either. It arrives at the bottom.
     */
    const order = normalizeFuelOrder(['meals', 'dayStrip']);
    expect(order.slice(0, 2)).toEqual(['meals', 'dayStrip']);
    expect(order).toHaveLength(FUEL_SECTIONS.length);
    for (const section of FUEL_SECTIONS) expect(order).toContain(section);
  });

  it('always returns every section exactly once', () => {
    for (const stored of [[], ['water'], ['x', 'y'], ['peptides', 'peptides', 'peptides']]) {
      const order = normalizeFuelOrder(stored);
      expect([...order].sort()).toEqual([...FUEL_SECTIONS].sort());
    }
  });
});

describe('moving one place', () => {
  const order = [...DEFAULT_FUEL_ORDER];

  it('moves a section up', () => {
    expect(moveSection(order, 'meals', -1)).toEqual([
      'dayStrip',
      'meals',
      'nutrition',
      'water',
      'peptides',
    ]);
  });

  it('moves a section down', () => {
    expect(moveSection(order, 'meals', 1)).toEqual([
      'dayStrip',
      'nutrition',
      'water',
      'meals',
      'peptides',
    ]);
  });

  it('does nothing at the top', () => {
    expect(moveSection(order, 'dayStrip', -1)).toEqual(order);
  });

  it('does nothing at the bottom', () => {
    expect(moveSection(order, 'peptides', 1)).toEqual(order);
  });

  it('never mutates the order it was given', () => {
    const before = [...order];
    moveSection(order, 'meals', 1);
    expect(order).toEqual(before);
  });
});

describe('dropping a dragged section', () => {
  const order = [...DEFAULT_FUEL_ORDER];

  it('moves it to the index it was carried to', () => {
    expect(reorderSection(order, 'peptides', 0)[0]).toBe('peptides');
  });

  it('clamps past either end', () => {
    expect(reorderSection(order, 'meals', -5)[0]).toBe('meals');
    expect(reorderSection(order, 'meals', 99).at(-1)).toBe('meals');
  });

  it('returns the same order when nothing moved', () => {
    expect(reorderSection(order, 'meals', 2)).toEqual(order);
  });
});

describe('where a drag lands', () => {
  // Five sections of differing height, as a real screen has.
  const heights = [120, 200, 300, 90, 90];

  it('stays put for a hesitation', () => {
    expect(targetIndexFor(heights, 2, 0)).toBe(2);
    expect(targetIndexFor(heights, 2, 20)).toBe(2);
  });

  it('swaps once the finger passes half the neighbour', () => {
    // The section below index 2 is 90 tall, so 46 crosses its midpoint.
    expect(targetIndexFor(heights, 2, 44)).toBe(2);
    expect(targetIndexFor(heights, 2, 46)).toBe(3);
  });

  it('crosses several sections on a long drag', () => {
    expect(targetIndexFor(heights, 0, 1000)).toBe(heights.length - 1);
    expect(targetIndexFor(heights, 4, -1000)).toBe(0);
  });

  it('travels upward past the taller sections above it', () => {
    // Above index 2 is 200 tall; half of it is 100.
    expect(targetIndexFor(heights, 2, -99)).toBe(2);
    expect(targetIndexFor(heights, 2, -101)).toBe(1);
  });

  it('never leaves the list', () => {
    expect(targetIndexFor(heights, 0, -500)).toBe(0);
    expect(targetIndexFor(heights, 4, 500)).toBe(4);
  });
});
