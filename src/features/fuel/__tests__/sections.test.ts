/**
 * Fuel's layout model — the default hierarchy, what a stored record is allowed
 * to do to it, the two powers this slice adds, and how an order becomes rows.
 *
 * Pure, for the reason `dragLayout.ts` and `weekSwipe.ts` are: a `PanResponder`
 * is only reachable through React Native's responder negotiation, and the
 * decisions worth pinning are functions of a list and a few numbers.
 */

import {
  DEFAULT_FUEL_LAYOUT,
  DEFAULT_FUEL_ORDER,
  FUEL_SECTIONS,
  buildFuelRows,
  defaultFuelLayout,
  isSectionHidden,
  moveSection,
  moveVisibleSection,
  normalizeFuelLayout,
  reorderSection,
  reorderVisibleSection,
  sectionSize,
  setSectionSize,
  targetIndexFor,
  toggleSection,
  visibleFuelSections,
  type FuelLayout,
  type FuelSection,
} from '../sections';

const base = () => defaultFuelLayout();

/** A layout from an order, with everything else left at its default. */
function withOrder(order: FuelSection[]): FuelLayout {
  return { ...base(), order };
}

describe('the default hierarchy', () => {
  it('leads with Nutrition, then the Day Strip', () => {
    // The 5.6B.2 correction: the screen's first question is answered first,
    // and the identity object follows it rather than preceding it.
    expect([...DEFAULT_FUEL_ORDER]).toEqual([
      'nutrition',
      'dayStrip',
      'meals',
      'water',
      'peptides',
    ]);
  });

  it('shows every section', () => {
    expect(DEFAULT_FUEL_LAYOUT.hidden).toEqual([]);
  });

  it('starts Water and Peptides square, and everything else wide', () => {
    const layout = base();
    expect(sectionSize(layout, 'water')).toBe('square');
    expect(sectionSize(layout, 'peptides')).toBe('square');
    for (const id of ['nutrition', 'dayStrip', 'meals'] as const) {
      expect(sectionSize(layout, id)).toBe('wide');
    }
  });

  it('hands back a fresh copy, so a caller cannot write through it', () => {
    const one = defaultFuelLayout();
    one.order.push('water');
    one.sizes.water = 'wide';
    expect(defaultFuelLayout().order).toEqual([...DEFAULT_FUEL_ORDER]);
    expect(defaultFuelLayout().sizes.water).toBe('square');
  });
});

describe('normalizing what came back from storage', () => {
  it('accepts a complete record unchanged', () => {
    const stored: FuelLayout = {
      order: ['water', 'meals', 'dayStrip', 'peptides', 'nutrition'],
      hidden: ['dayStrip'],
      sizes: { ...base().sizes, water: 'wide' },
    };
    expect(normalizeFuelLayout(stored)).toEqual(stored);
  });

  it('falls back when there is nothing usable stored', () => {
    for (const nothing of [null, undefined, 'nope', 42, {}]) {
      expect(normalizeFuelLayout(nothing)).toEqual(DEFAULT_FUEL_LAYOUT);
    }
  });

  it('drops a section that no longer exists', () => {
    const { order } = normalizeFuelLayout({ order: ['meals', 'movement', 'dayStrip'] });
    expect(order).not.toContain('movement');
    expect(order).toHaveLength(FUEL_SECTIONS.length);
  });

  it('drops a repeat rather than rendering a section twice', () => {
    const { order } = normalizeFuelLayout({ order: ['meals', 'meals', 'dayStrip'] });
    expect(order.filter((id) => id === 'meals')).toHaveLength(1);
  });

  it('appends a section added since the order was written', () => {
    /*
     * A user who arranged Fuel before a section existed must not lose it, and
     * must not lose their arrangement either. It arrives at the bottom.
     */
    const { order } = normalizeFuelLayout({ order: ['meals', 'dayStrip'] });
    expect(order.slice(0, 2)).toEqual(['meals', 'dayStrip']);
    expect(order).toHaveLength(FUEL_SECTIONS.length);
    for (const section of FUEL_SECTIONS) expect(order).toContain(section);
  });

  it('always returns every section exactly once', () => {
    for (const stored of [[], ['water'], ['x', 'y'], ['peptides', 'peptides', 'peptides']]) {
      const { order } = normalizeFuelLayout({ order: stored });
      expect([...order].sort()).toEqual([...FUEL_SECTIONS].sort());
    }
  });

  it('refuses to hide a section that defines the feature', () => {
    // A hand-edited or future record must not be able to empty Fuel out.
    const { hidden } = normalizeFuelLayout({
      order: [...DEFAULT_FUEL_ORDER],
      hidden: ['nutrition', 'meals', 'water'],
    });
    expect(hidden).toEqual(['water']);
  });

  it('drops an unknown or repeated id from the hidden list', () => {
    const { hidden } = normalizeFuelLayout({
      order: [...DEFAULT_FUEL_ORDER],
      hidden: ['water', 'water', 'movement', 7],
    });
    expect(hidden).toEqual(['water']);
  });

  it('corrects a size the section has no design for', () => {
    const { sizes } = normalizeFuelLayout({
      order: [...DEFAULT_FUEL_ORDER],
      // Nutrition has no square design; `enormous` is not a size at all.
      sizes: { nutrition: 'square', water: 'enormous', peptides: 'wide' },
    });
    expect(sizes.nutrition).toBe('wide');
    expect(sizes.water).toBe('square');
    expect(sizes.peptides).toBe('wide');
  });

  it('survives a record whose fields are the wrong types entirely', () => {
    expect(normalizeFuelLayout({ order: 'meals', hidden: 3, sizes: 'big' })).toEqual(
      DEFAULT_FUEL_LAYOUT,
    );
  });
});

describe('a layout written by 5.6B.1', () => {
  /*
   * That slice stored a bare array of ids. Reading it has to keep whatever the
   * user arranged and add the new defaults around it — anything else means a
   * founder who arranged Fuel last week silently losing that arrangement.
   */
  it('keeps the order it recorded', () => {
    const layout = normalizeFuelLayout(['water', 'meals', 'dayStrip', 'peptides', 'nutrition']);
    expect(layout.order).toEqual(['water', 'meals', 'dayStrip', 'peptides', 'nutrition']);
  });

  it('gains the new visibility and size defaults', () => {
    const layout = normalizeFuelLayout(['dayStrip', 'nutrition', 'meals', 'water', 'peptides']);
    expect(layout.hidden).toEqual([]);
    expect(layout.sizes.water).toBe('square');
    expect(layout.sizes.peptides).toBe('square');
  });

  it('is repaired the same way a partial one is', () => {
    const layout = normalizeFuelLayout(['meals', 'meals', 'movement']);
    expect(layout.order[0]).toBe('meals');
    expect([...layout.order].sort()).toEqual([...FUEL_SECTIONS].sort());
  });

  it('does not silently become the new default', () => {
    // The whole point: a stored old order is preserved, not reset to
    // nutrition-first just because the default moved.
    const layout = normalizeFuelLayout(['dayStrip', 'nutrition', 'meals', 'water', 'peptides']);
    expect(layout.order[0]).toBe('dayStrip');
  });
});

describe('showing and hiding', () => {
  it('hides and shows the Day Strip', () => {
    const hiddenStrip = toggleSection(base(), 'dayStrip');
    expect(isSectionHidden(hiddenStrip, 'dayStrip')).toBe(true);
    expect(visibleFuelSections(hiddenStrip)).not.toContain('dayStrip');

    const shownAgain = toggleSection(hiddenStrip, 'dayStrip');
    expect(isSectionHidden(shownAgain, 'dayStrip')).toBe(false);
    expect(visibleFuelSections(shownAgain)).toContain('dayStrip');
  });

  it('hides and shows Water', () => {
    const hidden = toggleSection(base(), 'water');
    expect(visibleFuelSections(hidden)).not.toContain('water');
    expect(visibleFuelSections(toggleSection(hidden, 'water'))).toContain('water');
  });

  it('hides and shows Peptides', () => {
    const hidden = toggleSection(base(), 'peptides');
    expect(visibleFuelSections(hidden)).not.toContain('peptides');
    expect(visibleFuelSections(toggleSection(hidden, 'peptides'))).toContain('peptides');
  });

  it('refuses to hide Nutrition', () => {
    expect(toggleSection(base(), 'nutrition')).toEqual(base());
  });

  it('refuses to hide Meals', () => {
    expect(toggleSection(base(), 'meals')).toEqual(base());
  });

  it('returns a section to where it was, not to the bottom', () => {
    // Hidden sections hold their absolute slot, so showing one again puts it
    // back between the same two neighbours.
    let layout = toggleSection(base(), 'dayStrip');
    layout = moveVisibleSection(layout, 'meals', -1);
    layout = toggleSection(layout, 'dayStrip');
    expect(layout.order.indexOf('dayStrip')).toBe(1);
  });

  it('leaves the data alone — this is a layout, not a delete', () => {
    // The model has no concept of removing a section, only of not drawing it.
    const hidden = toggleSection(base(), 'water');
    expect(hidden.order).toContain('water');
    expect(hidden.order).toHaveLength(FUEL_SECTIONS.length);
  });
});

describe('sizing', () => {
  it('sets Water wide and back to square', () => {
    const wide = setSectionSize(base(), 'water', 'wide');
    expect(sectionSize(wide, 'water')).toBe('wide');
    expect(sectionSize(setSectionSize(wide, 'water', 'square'), 'water')).toBe('square');
  });

  it('sets Peptides wide and back to square', () => {
    const wide = setSectionSize(base(), 'peptides', 'wide');
    expect(sectionSize(wide, 'peptides')).toBe('wide');
    expect(sectionSize(setSectionSize(wide, 'peptides', 'square'), 'peptides')).toBe('square');
  });

  it('ignores a size the section has no design for', () => {
    // Not stored and then corrected on read — never stored at all.
    for (const id of ['nutrition', 'dayStrip', 'meals'] as const) {
      expect(setSectionSize(base(), id, 'square')).toEqual(base());
    }
  });

  it('changes nothing else', () => {
    const next = setSectionSize(base(), 'water', 'wide');
    expect(next.order).toEqual(base().order);
    expect(next.hidden).toEqual([]);
    expect(next.sizes.peptides).toBe('square');
  });
});

describe('reset', () => {
  it('restores the order, the visibility and both squares', () => {
    let layout = base();
    layout = setSectionSize(layout, 'water', 'wide');
    layout = setSectionSize(layout, 'peptides', 'wide');
    layout = toggleSection(layout, 'dayStrip');
    layout = moveSection(layout, 'peptides', -1);
    expect(layout).not.toEqual(DEFAULT_FUEL_LAYOUT);

    expect(defaultFuelLayout()).toEqual({
      order: ['nutrition', 'dayStrip', 'meals', 'water', 'peptides'],
      hidden: [],
      sizes: {
        nutrition: 'wide',
        dayStrip: 'wide',
        meals: 'wide',
        water: 'square',
        peptides: 'square',
      },
    });
  });
});

describe('moving one place in the full order', () => {
  const layout = base();

  it('moves a section up', () => {
    expect(moveSection(layout, 'meals', -1).order).toEqual([
      'nutrition',
      'meals',
      'dayStrip',
      'water',
      'peptides',
    ]);
  });

  it('moves a section down', () => {
    expect(moveSection(layout, 'meals', 1).order).toEqual([
      'nutrition',
      'dayStrip',
      'water',
      'meals',
      'peptides',
    ]);
  });

  it('does nothing at either end', () => {
    expect(moveSection(layout, 'nutrition', -1)).toEqual(layout);
    expect(moveSection(layout, 'peptides', 1)).toEqual(layout);
  });

  it('never mutates the layout it was given', () => {
    const before = [...layout.order];
    moveSection(layout, 'meals', 1);
    expect(layout.order).toEqual(before);
  });
});

describe('moving among the sections on screen', () => {
  /*
   * The in-page arrange path. With nothing hidden it must agree exactly with
   * the sheet's; with something hidden it must step over it, because a button
   * that swaps two sections the user cannot both see reads as broken.
   */
  it('agrees with the full-order move when nothing is hidden', () => {
    for (const id of FUEL_SECTIONS) {
      expect(moveVisibleSection(base(), id, -1)).toEqual(moveSection(base(), id, -1));
      expect(moveVisibleSection(base(), id, 1)).toEqual(moveSection(base(), id, 1));
    }
  });

  it('steps over a hidden section', () => {
    const hidden = toggleSection(base(), 'dayStrip');
    const moved = moveVisibleSection(hidden, 'meals', -1);
    expect(visibleFuelSections(moved)).toEqual(['meals', 'nutrition', 'water', 'peptides']);
  });

  it('does nothing at either end of the visible list', () => {
    const hidden = toggleSection(base(), 'peptides');
    expect(moveVisibleSection(hidden, 'nutrition', -1)).toEqual(hidden);
    // Water is last on screen even though Peptides is last in the order.
    expect(moveVisibleSection(hidden, 'water', 1)).toEqual(hidden);
  });

  it('keeps the hidden section hidden', () => {
    const hidden = toggleSection(base(), 'water');
    expect(moveVisibleSection(hidden, 'meals', -1).hidden).toEqual(['water']);
  });
});

describe('dropping a dragged section', () => {
  const layout = base();

  it('moves it to the index it was carried to', () => {
    expect(reorderSection(layout, 'peptides', 0).order[0]).toBe('peptides');
  });

  it('clamps past either end', () => {
    expect(reorderSection(layout, 'meals', -5).order[0]).toBe('meals');
    expect(reorderSection(layout, 'meals', 99).order.at(-1)).toBe('meals');
  });

  it('returns the same layout when nothing moved', () => {
    expect(reorderSection(layout, 'meals', 2)).toEqual(layout);
  });

  it('drops among the visible sections when one is hidden', () => {
    const hidden = toggleSection(base(), 'dayStrip');
    const moved = reorderVisibleSection(hidden, 'peptides', 0);
    expect(visibleFuelSections(moved)).toEqual(['peptides', 'nutrition', 'meals', 'water']);
    expect(moved.hidden).toEqual(['dayStrip']);
  });
});

describe('laying the sections out in rows', () => {
  it('pairs Water and Peptides by default', () => {
    expect(buildFuelRows(base())).toEqual([
      ['nutrition'],
      ['dayStrip'],
      ['meals'],
      ['water', 'peptides'],
    ]);
  });

  it('gives a wide Water the whole row and leaves Peptides its own', () => {
    const rows = buildFuelRows(setSectionSize(base(), 'water', 'wide'));
    expect(rows.at(-2)).toEqual(['water']);
    expect(rows.at(-1)).toEqual(['peptides']);
  });

  it('gives a wide Peptides its own row and leaves Water square', () => {
    const rows = buildFuelRows(setSectionSize(base(), 'peptides', 'wide'));
    expect(rows.at(-2)).toEqual(['water']);
    expect(rows.at(-1)).toEqual(['peptides']);
  });

  it('gives each a row when both are wide', () => {
    let layout = setSectionSize(base(), 'water', 'wide');
    layout = setSectionSize(layout, 'peptides', 'wide');
    expect(buildFuelRows(layout)).toEqual([
      ['nutrition'],
      ['dayStrip'],
      ['meals'],
      ['water'],
      ['peptides'],
    ]);
  });

  it('never teleports a square up the page to find a partner', () => {
    /*
     * The founder's §16 example. Water square, Meals, Peptides square is three
     * rows: the order the user arranged is the order they see, whatever that
     * costs in whitespace.
     */
    const layout = withOrder(['nutrition', 'water', 'meals', 'peptides', 'dayStrip']);
    expect(buildFuelRows(layout)).toEqual([
      ['nutrition'],
      ['water'],
      ['meals'],
      ['peptides'],
      ['dayStrip'],
    ]);
  });

  it('pairs two squares wherever they end up adjacent', () => {
    const layout = withOrder(['water', 'peptides', 'nutrition', 'dayStrip', 'meals']);
    expect(buildFuelRows(layout)[0]).toEqual(['water', 'peptides']);
  });

  it('reflows when the section between two squares is hidden', () => {
    const layout = toggleSection(
      withOrder(['nutrition', 'water', 'dayStrip', 'peptides', 'meals']),
      'dayStrip',
    );
    expect(buildFuelRows(layout)).toEqual([['nutrition'], ['water', 'peptides'], ['meals']]);
  });

  it('drops a hidden section from the rows entirely', () => {
    const rows = buildFuelRows(toggleSection(base(), 'water')).flat();
    expect(rows).not.toContain('water');
    expect(rows).toEqual(['nutrition', 'dayStrip', 'meals', 'peptides']);
  });

  it('leaves a lone square in its own row rather than stretching it', () => {
    // A square with no partner keeps square width — it is not promoted to
    // wide, because a stretched module is a layout nobody designed.
    const layout = toggleSection(base(), 'peptides');
    expect(buildFuelRows(layout).at(-1)).toEqual(['water']);
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
