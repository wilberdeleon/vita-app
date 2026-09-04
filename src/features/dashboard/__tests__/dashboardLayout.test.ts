/**
 * The saved Home layout, and what happens when it is wrong.
 *
 * A stored layout is untrusted input with a severe failure mode: get it wrong
 * and Home renders nothing, or renders a module twice, or silently drops a
 * feature added in a later build. Every case below is one this has to survive
 * on somebody's phone, not a hypothetical.
 */

import {
  DEFAULT_LAYOUT,
  DEFAULT_MODULE_ORDER,
  isHidden,
  moveModule,
  normalizeLayout,
  toggleModule,
  visibleModules,
  type DashboardLayout,
} from '../modules';

describe('normalizing a stored layout', () => {
  it('falls back to the default for anything unusable', () => {
    for (const stored of [null, undefined, 'nonsense', 42, [], {}]) {
      expect(normalizeLayout(stored)).toEqual(DEFAULT_LAYOUT);
    }
  });

  it('keeps a valid saved order exactly', () => {
    const stored = { order: ['schedule', 'fuel', 'quickTools', 'peptides', 'water'], hidden: ['fuel'] };
    expect(normalizeLayout(stored)).toEqual({
      order: ['schedule', 'fuel', 'quickTools', 'peptides', 'water'],
      hidden: ['fuel'],
    });
  });

  it('drops ids it does not recognise', () => {
    // A module removed in a later version leaves its id in everyone's saved
    // order; rendering it would crash the switch that maps ids to components.
    const layout = normalizeLayout({ order: ['water', 'steps', 'peptides'], hidden: ['sleep'] });
    expect(layout.order).not.toContain('steps');
    expect(layout.hidden).not.toContain('sleep');
  });

  it('collapses duplicates to their first appearance', () => {
    const layout = normalizeLayout({ order: ['water', 'peptides', 'water'], hidden: ['fuel', 'fuel'] });
    expect(layout.order.filter((id) => id === 'water')).toHaveLength(1);
    expect(layout.hidden).toEqual(['fuel']);
    expect(layout.order[0]).toBe('water');
  });

  it('appends modules the saved order predates', () => {
    /*
     * The case that makes a *new* module appear for existing users instead
     * of vanishing because their layout was written before it existed.
     */
    const layout = normalizeLayout({ order: ['water'], hidden: [] });
    expect(layout.order[0]).toBe('water');
    expect(new Set(layout.order)).toEqual(new Set(DEFAULT_MODULE_ORDER));
  });

  it('always returns every known module exactly once', () => {
    for (const stored of [{}, { order: ['fuel'] }, { order: ['x', 'y'] }, { order: [] }]) {
      const layout = normalizeLayout(stored);
      expect(layout.order).toHaveLength(DEFAULT_MODULE_ORDER.length);
      expect(new Set(layout.order).size).toBe(layout.order.length);
    }
  });

  it('tolerates a hidden list that is not an array', () => {
    expect(normalizeLayout({ order: ['water'], hidden: 'fuel' }).hidden).toEqual([]);
  });
});

describe('showing and hiding', () => {
  it('hides and restores a module without disturbing the order', () => {
    const hiddenWater = toggleModule(DEFAULT_LAYOUT, 'water');
    expect(isHidden(hiddenWater, 'water')).toBe(true);
    expect(hiddenWater.order).toEqual(DEFAULT_LAYOUT.order);
    expect(visibleModules(hiddenWater)).not.toContain('water');

    const restored = toggleModule(hiddenWater, 'water');
    expect(isHidden(restored, 'water')).toBe(false);
    expect(visibleModules(restored)).toEqual(DEFAULT_LAYOUT.order);
  });

  it('lets someone who does not take peptides remove them entirely', () => {
    // The request that drove customization in the first place.
    let layout: DashboardLayout = DEFAULT_LAYOUT;
    layout = toggleModule(layout, 'peptides');
    layout = toggleModule(layout, 'schedule');

    expect(visibleModules(layout)).toEqual(['water', 'fuel', 'quickTools']);
  });

  it('survives every module being hidden', () => {
    /*
     * Not corruption — a legitimate choice. Home still renders its header,
     * and the customization control lives there, so the choice is reversible
     * rather than a trap.
     */
    let layout: DashboardLayout = DEFAULT_LAYOUT;
    for (const id of DEFAULT_MODULE_ORDER) layout = toggleModule(layout, id);

    expect(visibleModules(layout)).toEqual([]);
    expect(layout.order).toHaveLength(DEFAULT_MODULE_ORDER.length);
  });
});

describe('reordering', () => {
  it('moves a module one place at a time', () => {
    const moved = moveModule(DEFAULT_LAYOUT, 'fuel', 'up');
    expect(moved.order).toEqual(['water', 'fuel', 'peptides', 'quickTools', 'schedule']);

    const back = moveModule(moved, 'fuel', 'down');
    expect(back.order).toEqual(DEFAULT_LAYOUT.order);
  });

  it('does nothing at either end rather than wrapping', () => {
    // Wrapping would move a row the length of the list on one tap too many.
    expect(moveModule(DEFAULT_LAYOUT, 'water', 'up').order).toEqual(DEFAULT_LAYOUT.order);
    expect(moveModule(DEFAULT_LAYOUT, 'schedule', 'down').order).toEqual(DEFAULT_LAYOUT.order);
  });

  it('reorders hidden modules too, so restoring them lands where expected', () => {
    const hidden = toggleModule(DEFAULT_LAYOUT, 'fuel');
    const moved = moveModule(hidden, 'fuel', 'up');
    expect(moved.order.indexOf('fuel')).toBe(1);

    const shown = toggleModule(moved, 'fuel');
    expect(visibleModules(shown)[1]).toBe('fuel');
  });

  it('ignores a module that is not in the order', () => {
    const layout: DashboardLayout = { order: ['water'], hidden: [] };
    expect(moveModule(layout, 'fuel', 'up')).toEqual(layout);
  });

  it('round-trips a reorder through storage normalization', () => {
    // What actually happens between two launches.
    const moved = moveModule(moveModule(DEFAULT_LAYOUT, 'schedule', 'up'), 'schedule', 'up');
    expect(normalizeLayout(JSON.parse(JSON.stringify(moved)))).toEqual(moved);
  });
});
