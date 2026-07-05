/**
 * Generates app icon, splash, and Android adaptive assets from the official
 * VITA mark (brand sheet, July 2026). Vector reproduction of the approved
 * logo — same composition and palette, no redesign.
 *
 * Run: node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';

const INK = '#1C1F1A';
const GOLD = '#D4B27A';
const CREAM_TOP = '#F2EEE6';
const CREAM_BOTTOM = '#B9AE97';

/** The mark in a 1024 box: gold circle behind a cream three-peak range. */
function mark({ circle = GOLD, gradient = true, mono } = {}) {
  const fill = mono ?? (gradient ? 'url(#peaks)' : CREAM_TOP);
  return `
    <defs>
      <linearGradient id="peaks" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${CREAM_TOP}"/>
        <stop offset="1" stop-color="${CREAM_BOTTOM}"/>
      </linearGradient>
    </defs>
    <circle cx="512" cy="465" r="295" stroke="${mono ?? circle}" stroke-width="22" fill="none"/>
    <path d="M155 795 L370 505 L455 595 L560 400 L655 510 L725 450 L880 795 Z" fill="${fill}"/>
  `;
}

const svg = (body, size = 1024) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">${body}</svg>`);

const assets = [
  // iOS app icon — full-bleed ink square (iOS applies the mask).
  ['assets/icon.png', svg(`<rect width="1024" height="1024" fill="${INK}"/>${mark()}`)],
  // Splash icon — mark on transparent; app.json sets the ink background.
  ['assets/splash-icon.png', svg(mark())],
  // Android adaptive layers.
  ['assets/android-icon-background.png', svg(`<rect width="1024" height="1024" fill="${INK}"/>`)],
  ['assets/android-icon-foreground.png', svg(`<g transform="translate(512 512) scale(0.62) translate(-512 -512)">${mark()}</g>`)],
  ['assets/android-icon-monochrome.png', svg(`<g transform="translate(512 512) scale(0.62) translate(-512 -512)">${mark({ mono: '#FFFFFF' })}</g>`)],
  // Web favicon.
  ['assets/favicon.png', svg(`<rect width="1024" height="1024" fill="${INK}"/>${mark()}`, 48)],
];

for (const [file, buffer] of assets) {
  await sharp(buffer).png().toFile(file);
  console.log('wrote', file);
}
