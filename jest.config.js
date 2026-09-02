/**
 * Jest, via Expo's own preset.
 *
 * `jest-expo` is pinned to the SDK (54) for the same reason every other Expo
 * package is: it configures the Babel transform, module resolution, and the
 * React Native environment the app actually runs in, so a test exercises the
 * same module graph Metro builds.
 *
 * Deliberately minimal. Everything below is a decision; anything not below is
 * the preset's default on purpose.
 */

module.exports = {
  preset: 'jest-expo',
  // Only files under a `__tests__` folder ending in `.test.ts(x)`. Keeps the
  // runner off fixtures and helpers that may live alongside them later.
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  // Source only. `node_modules` and the Expo build output are never our tests.
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  clearMocks: true,
};
