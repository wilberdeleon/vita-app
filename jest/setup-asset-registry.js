/**
 * Expo SDK 58 / React Native 0.88 test-environment repair.
 *
 * jest-expo turns every asset `require` into the number `1` and mocks
 * `react-native/asset-registry` so that id `1` resolves to placeholder
 * metadata. Through React Native 0.86 that was the registry the app reached.
 * In 0.88, `import { AssetRegistry } from 'react-native'` — which `expo-asset`
 * uses when `@expo/vector-icons` loads its font — reads
 * `src/private/assets/AssetRegistry` directly, so the mock never applies and
 * every icon render throws `Module "1" is missing from the asset registry`.
 *
 * This applies jest-expo 58.0.12's own mock (its `src/preset/setup.js`) to the
 * module 0.88 actually loads. It changes nothing about what tests assert;
 * remove it once jest-expo mocks this path itself.
 */
jest.mock('react-native/src/private/assets/AssetRegistry', () => {
  const placeholder = {
    fileSystemLocation: '/full/path/to/directory',
    httpServerLocation: '/assets/full/path/to/directory',
    scales: [1],
    fileHashes: ['md5'],
    name: 'name',
    exists: true,
    type: 'type',
    hash: 'md5',
    uri: 'uri',
    width: 1,
    height: 1,
  };
  const AssetRegistry = {
    registerAsset: jest.fn(() => 1),
    getAssetByID: jest.fn(() => placeholder),
  };
  return { AssetRegistry };
});
