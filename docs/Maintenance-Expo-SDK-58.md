# Maintenance — Expo SDK 57 → 58

**Status: implemented on `maintenance/expo-sdk-58` · founder physical-iPhone acceptance PENDING · not merged.**
Date: 2026-10-27. Branch cut from `sprint-6-journey-weight` at `1c5945e`.

## Why it became mandatory

The founder opened Sprint 6.3 on a physical iPhone and Expo Go reported *"Project is incompatible with this version of Expo Go."* The App Store Expo Go client had moved to **SDK 58**, and the SDK 58 client opens only SDK 58 projects. VITA was on SDK 57, so **physical-device QA was blocked**. This is the same rule that moved the project 54 → 57 on 2026-09-05: VITA tracks the SDK the App Store Expo Go supports.

## Boundary

Infrastructure only. **Sprint 6 product work is paused, and 6.3 stays 🟡 awaiting founder review.** No product design, persistence key, schema, domain semantic, or Dashboard / Fuel / Water / Peptides / BMI / Settings / Tools / Journey behaviour changed. The only source edits are the two the SDK broke.

## Migration audit (before upgrading)

Sources: [Expo SDK 58 changelog](https://expo.dev/changelog/sdk-58), [How to upgrade to SDK 58](https://expo.dev/blog/how-to-upgrade-to-sdk-58), [Expo Router SDK 57 → 58 migration](https://docs.expo.dev/router/migrate/sdk-57-to-58/).

| Area | Result |
|---|---|
| Native project model | **CNG / Expo Go** — no committed `ios/` or `android/`, no custom AppDelegate. Nothing to regenerate |
| `ios.enableSceneSupport` / `expo-build-properties` | **Not used** — nothing to remove |
| Web output (`web.output` now defaults to `"server"`) | **Not relied on** — `app.json` sets only a favicon; VITA ships native. No config invented |
| `expo-router/react-navigation`, `withLayoutContext`, native tabs, custom navigators | **Not used** |
| Tabs declared explicitly | **Already** — all four dock tabs are `Tabs.Screen`s |
| iOS 26 transparent stack headers | **Unaffected** — every navigator sets `headerShown: false` |
| `freezeOnBlur`, `initialRouteName`, `redirect`/`initialParams`, `navigation.dispatch`, `useNavigation` | **Not used** |
| Module-level `router` before first render | **Unaffected** — called only from handlers and effects |
| Removed RN APIs (`InteractionManager`, `Touchable` root, `Modal animated`, `StatusBar` props, `ImageBackground`) | **Not used** |
| Custom tab bar (`FloatingDock`) | **Required migration** — see below |
| Strict TypeScript API refs | **Required migration** — one ref, see below |

## Dependency delta (direct)

Applied with `npx expo install expo@^58.0.0 --fix`; `expo` then written back as `~58.0.20` to match the repo's tilde convention.

| Package | Before | After |
|---|---|---|
| expo | ~57.0.22 | ~58.0.20 |
| react | 19.2.3 | 19.3.0 |
| react-native | 0.86.3 | 0.88.0 |
| expo-router | ~57.0.21 | ~58.0.27 |
| expo-blur | ~57.0.3 | ~58.0.5 |
| expo-camera | ~57.0.5 | ~58.0.13 |
| expo-constants | ~57.0.17 | ~58.0.13 |
| expo-font | ~57.0.3 | ~58.0.10 |
| expo-haptics | ~57.0.3 | ~58.0.7 |
| expo-linking | ~57.0.10 | ~58.0.14 |
| expo-splash-screen | ~57.0.9 | ~58.0.11 |
| expo-status-bar | ~57.0.1 | ~58.0.4 |
| react-native-safe-area-context | ~5.7.0 | ~5.10.1 |
| react-native-screens | ~4.26.0 | ~4.30.0 |
| react-native-svg | 15.15.4 | 15.16.0 |
| jest (dev) | ~29.7.0 | ~30.5.2 |
| jest-expo (dev) | ~57.0.5 | ~58.0.12 |
| @types/jest (dev) | 29.5.14 | 30.0.0 |
| @types/react (dev) | ~19.2.10 | ~19.3.0 |
| **react-test-renderer (dev)** | *(transitive 19.2.3)* | **19.3.0, explicit** |

`react-test-renderer` is the only addition, and it is not new to the project: 38 suites have always imported it, and it used to arrive through jest-expo 57. jest-expo 58 no longer brings it, so it is now declared, pinned exactly to the React version as the renderer requires. No other package was added.

## Compatibility fixes caused by SDK 58

**App source (two):**

1. **`FloatingDock` — a runtime crash, not just a type error.** Expo Router 58 no longer passes a custom tab bar `navigation`; it passes `navigateToTab(routeKey)` (the call its own tab bar makes). The dock called `navigation.navigate(name)`, which on SDK 58 would throw on the first tap. It now finds the route by name exactly as before and calls `navigateToTab(route.key)`; tapping the active tab stays a no-op. Look and tints unchanged.
2. **`EditableWidget` — Strict TypeScript API.** `useRef<View>` becomes `useRef<ViewInstance>`: React Native 0.88 types a host ref by its instance. Type-only; `measureInWindow` behaviour is unchanged.

**Test infrastructure (three, no assertion weakened):**

3. `react-test-renderer@19.3.0` declared explicitly (above).
4. `jest.config.js` maps `react-native/react-private-interface` and `react-native/setup-env`. RN 0.88 exposes these only as package `exports` into `src/`; the preset's catch-all mapping points at files that do not exist. jest-expo 58 maps the two sibling entry points and not these.
5. `jest/setup-asset-registry.js` applies jest-expo's own asset-registry mock to `react-native/src/private/assets/AssetRegistry`, the module RN 0.88's `AssetRegistry` export now loads directly. Without it every Ionicons render threw *Module "1" is missing from the asset registry* (1,076 tests). Remove it once jest-expo mocks that path itself; jest-expo 58.0.12 is the latest 58.x and does not.

**Test updated:** the 6.1 dock tests built the old `navigation` prop through a cast, so they would have stayed green with a broken dock. They now pass `navigateToTab`, and a new test pins that tapping Journey calls `navigateToTab('journey-key')` and tapping the active tab calls nothing. Mutation-checked: a dock that never navigates fails it.

## Validation

| Check | Result |
|---|---|
| `npm test` | **92 suites / 2514 tests** (2513 before; +1 dock navigation test) |
| `tsc --noEmit` | Clean |
| `tsc --noEmit --noUnusedLocals --noUnusedParameters` | Clean |
| `npx expo-doctor@latest` | **20/20 checks passed** (SDK 58 runs 20; SDK 57 was 20/21 on patch drift) |
| iOS export | Clean — 1,623 modules |
| Metro dev bundle (`expo start -c`, iOS) | HTTP 200, 1,758 modules, no errors |
| Dependencies | Only the Expo-aligned set above + the explicit test renderer |
| Persistence | No key, schema or migration touched |

**Simulator.** The iOS Simulator carries Expo Go **57.0.2**, which cannot open an SDK 58 project (the founder's exact symptom). Expo CLI tried to install Expo Go 58.0.7 and its download timed out; installing the downloaded client by hand was not approved in this session. **So this pass has no on-device run** — the founder's iPhone, which already has the SDK 58 client, is the first device to open it. Regression evidence is the full product suite (every route test, the dock, Journey, Dashboard, Fuel, Water, Peptides, Tools, BMI, Settings, motion, haptics and Reduced Motion) plus a clean bundle.

**`npm audit`** reports 17 advisories in the dependency tree after the upgrade. Not addressed here — `npm audit fix` would move packages off Expo's aligned versions, which is out of scope for this pass.

## Not merged

`maintenance/expo-sdk-58` merges into `sprint-6-journey-weight` only after the founder confirms VITA opens and works in SDK 58 Expo Go on the physical iPhone.
