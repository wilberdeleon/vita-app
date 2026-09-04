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
  it('shows all three, in registry order', () => {
    expect(DEFAULT_QUICK_TOOLS.hidden).toEqual([]);
    expect(visibleTools(DEFAULT_QUICK_TOOLS)).toEqual(['calculator', 'sites', 'scanner']);
  });
});

describe('normalizing an untrusted record', () => {
  it('falls back when there is nothing usable', () => {
    for (const stored of [null, undefined, 42, 'layout', [], { order: 'nope' }]) {
      expect(normalizeQuickTools(stored)).toEqual(DEFAULT_QUICK_TOOLS);
    }
  });

  it('drops ids it does not recognise', () => {
    // A tool removed in a later version, still sitting in a stored order.
    const prefs = normalizeQuickTools({ order: ['sites', 'bmi', 'calculator'], hidden: ['macros'] });
    expect(prefs.order).not.toContain('bmi');
    expect(prefs.hidden).toEqual([]);
  });

  it('collapses duplicates rather than rendering a tool twice', () => {
    const prefs = normalizeQuickTools({ order: ['sites', 'sites', 'calculator'], hidden: [] });
    expect(prefs.order.filter((id) => id === 'sites')).toHaveLength(1);
  });

  it('appends a newly shipped tool instead of losing it', () => {
    /*
     * This is the case that matters for 5.3C: anyone who used Home before
     * the Food Scanner existed has a stored order without it. It has to
     * appear for them, with no migration step and no reset.
     */
    const prefs = normalizeQuickTools({ order: ['calculator', 'sites'], hidden: [] });
    expect(prefs.order).toEqual(['calculator', 'sites', 'scanner']);
    expect(isToolHidden(prefs, 'scanner')).toBe(false);
  });

  it('keeps a customised order the user actually chose', () => {
    const prefs = normalizeQuickTools({ order: ['scanner', 'sites', 'calculator'], hidden: ['sites'] });
    expect(prefs.order).toEqual(['scanner', 'sites', 'calculator']);
    expect(visibleTools(prefs)).toEqual(['scanner', 'calculator']);
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
