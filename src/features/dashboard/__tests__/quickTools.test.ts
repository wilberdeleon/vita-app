/**
 * Quick Tools preferences — the registry, and what happens to a stored record
 * that cannot be trusted.
 *
 * The same pressure as `dashboardLayout.test.ts`: this reads a JSON blob off
 * the device that a previous version wrote, that a future version will have
 * changed the shape of, and that nothing verifies. Every one of those cases
 * has to produce something renderable, because the alternative is a Home
 * screen that crashes on launch and cannot be recovered from inside the app.
 */

import {
  DEFAULT_QUICK_TOOLS,
  QUICK_TOOLS,
  QUICK_TOOL_REGISTRY,
  isToolHidden,
  moveTool,
  normalizeQuickTools,
  toggleTool,
  visibleTools,
  type QuickToolsPrefs,
} from '../quickTools';

describe('the registry', () => {
  it('describes every tool, each pointing at a route that exists', () => {
    for (const id of QUICK_TOOLS) {
      const tool = QUICK_TOOL_REGISTRY[id];
      expect(tool.label.length).toBeGreaterThan(0);
      expect(tool.name.length).toBeGreaterThan(0);
      expect(tool.route.startsWith('/')).toBe(true);
    }

    expect(QUICK_TOOL_REGISTRY.calculator.route).toBe('/tools/peptide-calculator');
    expect(QUICK_TOOL_REGISTRY.sites.route).toBe('/tools/injection-sites');
    // Founder ruling, 5.3C: the Food Scanner routes to the Fuel scanner.
    expect(QUICK_TOOL_REGISTRY.scanner.route).toBe('/fuel/scan');
  });

  it('claims only what each tool actually does', () => {
    /*
     * The rule that survived the 5.3C reversal. The barcode scanner looks a
     * product up so it can be logged; no VITA Score is authorised, so no
     * label or hint may imply one.
     */
    for (const id of QUICK_TOOLS) {
      const { hint, label, name } = QUICK_TOOL_REGISTRY[id];
      const words = `${hint} ${label} ${name}`.toLowerCase();
      for (const claim of ['score', 'grade', 'rating', 'rank', 'analyz', 'analys', 'recommend']) {
        expect(words).not.toContain(claim);
      }
    }
    expect(QUICK_TOOL_REGISTRY.scanner.hint).toBe('Opens the food barcode scanner');
  });
});

describe('the shipped default', () => {
  /**
   * The catalog grew in 5.9B.1; the **default selection did not**. BMI is
   * offered to a new install, not given to it.
   */
  it('selects the three the founder approved, and no more', () => {
    expect(visibleTools(DEFAULT_QUICK_TOOLS)).toEqual(['calculator', 'sites', 'scanner']);
  });

  it('still offers every tool in the catalog, including the unselected one', () => {
    expect(DEFAULT_QUICK_TOOLS.order).toEqual(['calculator', 'sites', 'scanner', 'bmi']);
    expect(isToolHidden(DEFAULT_QUICK_TOOLS, 'bmi')).toBe(true);
  });
});

describe('normalizing an untrusted record', () => {
  it('falls back when there is nothing usable', () => {
    for (const stored of [null, undefined, 42, 'layout', [], { order: 'nope' }]) {
      expect(normalizeQuickTools(stored)).toEqual(DEFAULT_QUICK_TOOLS);
    }
  });

  /**
   * The distinction §18 turns on. A corrupt record and a deliberately empty
   * one must not collapse into the same state: the first takes the default,
   * the second stays empty. They are told apart by shape — an empty
   * selection still *names* its tools, in `hidden`.
   */
  it('keeps a deliberately empty selection empty', () => {
    const emptied = { order: ['calculator', 'sites', 'scanner', 'bmi'], hidden: ['calculator', 'sites', 'scanner', 'bmi'] };
    expect(visibleTools(normalizeQuickTools(emptied))).toEqual([]);
    // And it survives being written and read again.
    expect(visibleTools(normalizeQuickTools(normalizeQuickTools(emptied)))).toEqual([]);
  });

  it('drops ids it does not recognise', () => {
    // A tool removed in a later version, still sitting in a stored order.
    const prefs = normalizeQuickTools({ order: ['sites', 'tdee', 'calculator'], hidden: ['macros'] });
    expect(prefs.order).not.toContain('tdee');
    expect(prefs.hidden).not.toContain('macros');
  });

  it('collapses duplicates rather than rendering a tool twice', () => {
    const prefs = normalizeQuickTools({ order: ['sites', 'sites', 'calculator'], hidden: [] });
    expect(prefs.order.filter((id) => id === 'sites')).toHaveLength(1);
  });

  /**
   * **The contract reversed in 5.9B.1, and the reason it was reversed.**
   *
   * 5.3C made normalization append a newly shipped tool *visible*, so the
   * Food Scanner would reach existing users without a migration. Building
   * BMI showed what that costs: every release silently adds its new tools
   * to every existing Home. The founder ruled that growing someone's
   * Dashboard is their decision.
   *
   * So a new tool is still **offered** — it joins `order`, so customization
   * lists it — and it is **not selected**. Reverting either half of this
   * fails here, and it is generic: no tool is named in the implementation.
   */
  it('offers a newly shipped tool without selecting it', () => {
    const prefs = normalizeQuickTools({ order: ['calculator', 'sites', 'scanner'], hidden: [] });

    // Offered: it is in the catalog the customization sheet renders.
    expect(prefs.order).toContain('bmi');
    // Not selected: the user's Home is exactly what it was.
    expect(isToolHidden(prefs, 'bmi')).toBe(true);
    expect(visibleTools(prefs)).toEqual(['calculator', 'sites', 'scanner']);
  });

  it('does not restore a tool the user removed', () => {
    const prefs = normalizeQuickTools({
      order: ['calculator', 'sites', 'scanner', 'bmi'],
      hidden: ['scanner'],
    });
    expect(isToolHidden(prefs, 'scanner')).toBe(true);
    expect(visibleTools(prefs)).toEqual(['calculator', 'sites', 'bmi']);
  });

  it('keeps a customised order the user actually chose', () => {
    const prefs = normalizeQuickTools({ order: ['scanner', 'sites', 'calculator'], hidden: ['sites'] });
    // Their order first; the tool they have not met yet comes after it.
    expect(prefs.order).toEqual(['scanner', 'sites', 'calculator', 'bmi']);
    expect(visibleTools(prefs)).toEqual(['scanner', 'calculator']);
  });

  it('never alphabetises a selection', () => {
    const prefs = normalizeQuickTools({ order: ['bmi', 'scanner', 'calculator', 'sites'], hidden: [] });
    expect(visibleTools(prefs)).toEqual(['bmi', 'scanner', 'calculator', 'sites']);
  });
});

describe('changing the preferences', () => {
  const base: QuickToolsPrefs = { order: ['calculator', 'sites', 'scanner'], hidden: [] };

  it('hides and shows one tool without touching the order', () => {
    const hidden = toggleTool(base, 'sites');
    expect(visibleTools(hidden)).toEqual(['calculator', 'scanner']);
    expect(hidden.order).toEqual(base.order);

    expect(visibleTools(toggleTool(hidden, 'sites'))).toEqual(['calculator', 'sites', 'scanner']);
  });

  it('allows every tool to be hidden, and says so as an empty list', () => {
    // `QuickTools` renders nothing at all in this state rather than a
    // heading over a void.
    let prefs = base;
    for (const id of QUICK_TOOLS) prefs = toggleTool(prefs, id);
    expect(visibleTools(prefs)).toEqual([]);
  });

  it('moves one place at a time and stops at the ends', () => {
    expect(moveTool(base, 'sites', 'up').order).toEqual(['sites', 'calculator', 'scanner']);
    expect(moveTool(base, 'sites', 'down').order).toEqual(['calculator', 'scanner', 'sites']);

    // No wrapping: the top does not become the bottom.
    expect(moveTool(base, 'calculator', 'up')).toBe(base);
    expect(moveTool(base, 'scanner', 'down')).toBe(base);
  });

  it('never mutates the record it was given', () => {
    const snapshot = JSON.parse(JSON.stringify(base));
    moveTool(base, 'sites', 'up');
    toggleTool(base, 'scanner');
    expect(base).toEqual(snapshot);
  });
});
