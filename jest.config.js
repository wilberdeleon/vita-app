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
  // SDK 58 / RN 0.88 asset-registry repair — see the file for why.
  setupFiles: ['<rootDir>/jest/setup-asset-registry.js'],
  /**
   * React Native 0.88 (Expo SDK 58) has four entry points that exist only as
   * package `exports` pointing into `src/`. The preset's catch-all
   * `^react-native($|/.*)` mapping turns each into a file path that is not on
   * disk. jest-expo 58 maps two of them (`asset-registry`,
   * `unstable-internals-do-not-use`) and not these two, which the renderer
   * shim requires — so every suite that renders failed to load. Same mapping
   * jest-expo uses for the other two, nothing more; project entries take
   * precedence over the preset's.
   */
  moduleNameMapper: {
    '^react-native/react-private-interface$': '<rootDir>/node_modules/react-native/src/react-private-interface.js',
    '^react-native/setup-env$': '<rootDir>/node_modules/react-native/src/setup-env.js',
  },
};
