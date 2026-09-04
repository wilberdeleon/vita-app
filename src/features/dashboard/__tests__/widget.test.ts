/**
 * Home's shared geometry and type scale.
 *
 * The interesting content here is the Dynamic Type policy: **VITA respects
 * the device's text-size setting**, which means a fixed widget footprint and
 * growing text will eventually collide — and slice 5.3C shipped exactly that
 * collision once, with Water's total landing on top of its status line. These
 * are the rules that stop it happening again.
 */

import {
  COMPACT_FONT_SCALE,
  SQUARE_HEIGHT,
  TOOL_TILE_HEIGHT,
  TYPE,
  isCompactSquare,
  squareHeight,
  toolTileHeight,
} from '../widget';

describe('the square footprint', () => {
  it('is the base height at the system default', () => {
    expect(squareHeight(1)).toBe(SQUARE_HEIGHT);
  });

  it('grows with the text, so larger type has somewhere to go', () => {
    expect(squareHeight(1.35)).toBeGreaterThan(squareHeight(1));
    expect(squareHeight(2)).toBeGreaterThan(squareHeight(1.35));
  });

  it('is one value, so all three squares stay equal at any text size', () => {
    // The 5.3C ruling is that Water, Peptides and Fuel match each other. It
    // was never that the grid should ignore accessibility.
    for (const scale of [1, 1.2, 1.35, 1.6, 2]) {
      expect(squareHeight(scale)).toBe(squareHeight(scale));
      expect(Number.isFinite(squareHeight(scale))).toBe(true);
    }
  });

  it('is damped rather than proportional', () => {
    // At the point text demands more room the ring steps aside and hands
    // back 56pt, so following the scale exactly would leave a half-empty box.
    expect(squareHeight(2)).toBeLessThan(SQUARE_HEIGHT * 2);
    expect(squareHeight(2)).toBeGreaterThan(SQUARE_HEIGHT * 1.4);
  });

  it('ignores a scale below the default, and stops climbing past double', () => {
    expect(squareHeight(0.8)).toBe(SQUARE_HEIGHT);
    expect(squareHeight(4)).toBe(squareHeight(2));
  });
});

describe('the compact presentation', () => {
  it('holds off until the text is meaningfully larger', () => {
    expect(isCompactSquare(1)).toBe(false);
    expect(isCompactSquare(1.15)).toBe(false);
    expect(isCompactSquare(COMPACT_FONT_SCALE)).toBe(true);
    expect(isCompactSquare(2)).toBe(true);
  });
});

describe('tool tiles', () => {
  it('scale the same way, and stay equal to each other', () => {
    expect(toolTileHeight(1)).toBe(TOOL_TILE_HEIGHT);
    expect(toolTileHeight(1.5)).toBeGreaterThan(toolTileHeight(1));
    expect(toolTileHeight(4)).toBe(toolTileHeight(2));
  });
});

describe('the type scale', () => {
  it('keeps the hierarchy it had, one step larger', () => {
    // A value dominates its label; support copy sits between them; nothing
    // secondary was promoted past something primary.
    expect(TYPE.squareValue).toBeGreaterThan(TYPE.support);
    expect(TYPE.support).toBeGreaterThan(TYPE.moduleLabel);
    expect(TYPE.moduleLabel).toBeGreaterThan(TYPE.sectionHeading - 1);
    expect(TYPE.wideValue).toBeGreaterThan(TYPE.support);
  });

  it('keeps the greeting an eyebrow', () => {
    // It was a 26px headline in 5.3 and that was the first thing rejected.
    expect(TYPE.greeting).toBeLessThan(TYPE.quote);
    expect(TYPE.greeting).toBeLessThan(TYPE.squareValue);
  });

  it('leaves the quote the largest thing in the header, with a quieter credit', () => {
    expect(TYPE.quote).toBeGreaterThan(TYPE.attribution);
    expect(TYPE.quoteLineHeight).toBeGreaterThan(TYPE.quote);
  });
});
