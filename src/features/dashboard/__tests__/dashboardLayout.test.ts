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
  DEFAULT_SIZES,
  buildGrid,
  isHidden,
  moveModule,
  normalizeLayout,
  reorderModule,
  setModuleSize,
  sizeOf,
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
    const stored = {
      order: ['schedule', 'fuel', 'quickTools', 'peptides', 'water'],
      hidden: ['fuel'],
      sizes: { water: 'wide' },
    };
    const layout = normalizeLayout(stored);
    expect(layout.order).toEqual(['schedule', 'fuel', 'quickTools', 'peptides', 'water']);
    expect(layout.hidden).toEqual(['fuel']);
    expect(layout.sizes.water).toBe('wide');
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

describe('migrating a slice 5.3A layout', () => {
  it('adopts default sizes while keeping the order and visibility the user chose', () => {
    /*
     * Every layout saved before 5.3B has no `sizes` at all. Nobody should
     * lose the Home they arranged because the app learned about widget
     * shapes, so the arrangement survives and the shapes take defaults.
     */
    const stored = { order: ['peptides', 'water', 'fuel', 'schedule', 'quickTools'], hidden: ['quickTools'] };
    const layout = normalizeLayout(stored);

    expect(layout.order).toEqual(['peptides', 'water', 'fuel', 'schedule', 'quickTools']);
    expect(layout.hidden).toEqual(['quickTools']);
    expect(layout.sizes).toEqual(DEFAULT_SIZES);
  });

  it('ships Fuel wide with Water and Peptides square', () => {
    expect(DEFAULT_SIZES.fuel).toBe('wide');
    expect(DEFAULT_SIZES.water).toBe('square');
    expect(DEFAULT_SIZES.peptides).toBe('square');
  });

  it('corrects a size the module has no design for', () => {
    // A hand-edited or stale record must not produce a squeezed widget.
    const layout = normalizeLayout({ sizes: { schedule: 'square', water: 'enormous' } });
    expect(layout.sizes.schedule).toBe('wide');
    expect(layout.sizes.water).toBe(DEFAULT_SIZES.water);
  });
});

describe('sizing', () => {
  it('switches a module between square and wide', () => {
    const wide = setModuleSize(DEFAULT_LAYOUT, 'water', 'wide');
    expect(sizeOf(wide, 'water')).toBe('wide');
    expect(sizeOf(setModuleSize(wide, 'water', 'square'), 'water')).toBe('square');
  });

  it('refuses a size the module was never designed for', () => {
    // Today's Schedule is a list; a square form would be the wide layout
    // squeezed, which is exactly what this slice was told not to ship.
    expect(setModuleSize(DEFAULT_LAYOUT, 'schedule', 'square')).toEqual(DEFAULT_LAYOUT);
    expect(sizeOf(DEFAULT_LAYOUT, 'schedule')).toBe('wide');
  });

  it('changes nothing but the size', () => {
    const resized = setModuleSize(DEFAULT_LAYOUT, 'fuel', 'square');
    expect(resized.order).toEqual(DEFAULT_LAYOUT.order);
    expect(resized.hidden).toEqual(DEFAULT_LAYOUT.hidden);
  });
});

describe('the two-column grid', () => {
  it('puts a wide module on its own row and pairs two squares', () => {
    // The shipped default: Fuel wide, then Water | Peptides.
    expect(buildGrid(DEFAULT_LAYOUT)).toEqual([
      ['fuel'],
      ['water', 'peptides'],
      ['quickTools'],
      ['schedule'],
    ]);
  });

  it('reflows when a square is hidden, with no placeholder left behind', () => {
    const layout = toggleModule(DEFAULT_LAYOUT, 'peptides');
    const rows = buildGrid(layout);

    expect(rows).toEqual([['fuel'], ['water'], ['quickTools'], ['schedule']]);
    expect(rows.flat()).not.toContain('peptides');
  });

  it('keeps a lone square in its own column rather than promoting it to wide', () => {
    /*
     * The screen renders an empty cell beside it. Stretching would show the
     * square design at wide proportions — a layout nobody drew.
     */
    const layout = toggleModule(DEFAULT_LAYOUT, 'peptides');
    const row = buildGrid(layout).find((entry) => entry.includes('water'))!;

    expect(row).toEqual(['water']);
    expect(sizeOf(layout, 'water')).toBe('square');
  });

  it('splits a run of three squares into a pair and a single', () => {
    let layout = setModuleSize(DEFAULT_LAYOUT, 'fuel', 'square');
    layout = reorderModule(layout, 0, 2); // water, peptides, fuel
    expect(buildGrid(layout)).toEqual([['water', 'peptides'], ['fuel'], ['quickTools'], ['schedule']]);
  });

  it('follows the order the user arranged, not the order we shipped', () => {
    // Schedule dragged to the top, then the pair.
    const layout = reorderModule(DEFAULT_LAYOUT, 4, 0);
    expect(buildGrid(layout)[0]).toEqual(['schedule']);
    expect(buildGrid(layout)).toContainEqual(['water', 'peptides']);
  });

  it('renders nothing at all when every module is hidden', () => {
    let layout: DashboardLayout = DEFAULT_LAYOUT;
    for (const id of DEFAULT_MODULE_ORDER) layout = toggleModule(layout, id);
    expect(buildGrid(layout)).toEqual([]);
  });
});

describe('dragging', () => {
  it('lifts a module out and drops it at the target index', () => {
    const moved = reorderModule(DEFAULT_LAYOUT, 0, 2);
    expect(moved.order).toEqual(['water', 'peptides', 'fuel', 'quickTools', 'schedule']);
  });

  it('is a no-op when the target is where it already is', () => {
    expect(reorderModule(DEFAULT_LAYOUT, 1, 1)).toEqual(DEFAULT_LAYOUT);
  });

  it('clamps a target past either end instead of losing the module', () => {
    expect(reorderModule(DEFAULT_LAYOUT, 0, 99).order.at(-1)).toBe('fuel');
    expect(reorderModule(DEFAULT_LAYOUT, 4, -5).order[0]).toBe('schedule');
    expect(reorderModule(DEFAULT_LAYOUT, 9, 0)).toEqual(DEFAULT_LAYOUT);
  });

  it('preserves sizes and visibility through a drag', () => {
    const layout = setModuleSize(toggleModule(DEFAULT_LAYOUT, 'water'), 'peptides', 'wide');
    const moved = reorderModule(layout, 0, 3);
    expect(moved.hidden).toEqual(['water']);
    expect(moved.sizes.peptides).toBe('wide');
  });
});

describe('resetting', () => {
  it('restores the shipped order, visibility and sizes', () => {
    let layout: DashboardLayout = DEFAULT_LAYOUT;
    layout = toggleModule(layout, 'peptides');
    layout = setModuleSize(layout, 'water', 'wide');
    layout = reorderModule(layout, 0, 4);
    expect(layout).not.toEqual(DEFAULT_LAYOUT);

    // Reset hands back the default object itself.
    expect(normalizeLayout(JSON.parse(JSON.stringify(DEFAULT_LAYOUT)))).toEqual(DEFAULT_LAYOUT);
  });
});

describe('showing and hiding', () => {
  it('hides and restores a module without disturbing the order', () => {
    const hiddenWater = toggleModule(DEFAULT_LAYOUT, 'water');
    expect(isHidden(hiddenWater, 'water')).toBe(true);
    expect(hiddenWater.order).toEqual(DEFAULT_LAYOUT.order);
    expect(hiddenWater.sizes).toEqual(DEFAULT_LAYOUT.sizes);
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

    expect(visibleModules(layout)).toEqual(['fuel', 'water', 'quickTools']);
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
    const moved = moveModule(DEFAULT_LAYOUT, 'water', 'up');
    expect(moved.order).toEqual(['water', 'fuel', 'peptides', 'quickTools', 'schedule']);

    const back = moveModule(moved, 'water', 'down');
    expect(back.order).toEqual(DEFAULT_LAYOUT.order);
  });

  it('does nothing at either end rather than wrapping', () => {
    // Wrapping would move a row the length of the list on one tap too many.
    expect(moveModule(DEFAULT_LAYOUT, 'fuel', 'up').order).toEqual(DEFAULT_LAYOUT.order);
    expect(moveModule(DEFAULT_LAYOUT, 'schedule', 'down').order).toEqual(DEFAULT_LAYOUT.order);
  });

  it('reorders hidden modules too, so restoring them lands where expected', () => {
    const hidden = toggleModule(DEFAULT_LAYOUT, 'peptides');
    const moved = moveModule(hidden, 'peptides', 'up');
    expect(moved.order.indexOf('peptides')).toBe(1);

    const shown = toggleModule(moved, 'peptides');
    expect(visibleModules(shown)[1]).toBe('peptides');
  });

  it('ignores a module that is not in the order', () => {
    const layout: DashboardLayout = { order: ['water'], hidden: [], sizes: { ...DEFAULT_SIZES } };
    expect(moveModule(layout, 'fuel', 'up')).toEqual(layout);
  });

  it('round-trips a reorder through storage normalization', () => {
    // What actually happens between two launches.
    const moved = moveModule(moveModule(DEFAULT_LAYOUT, 'schedule', 'up'), 'schedule', 'up');
    expect(normalizeLayout(JSON.parse(JSON.stringify(moved)))).toEqual(moved);
  });
});
