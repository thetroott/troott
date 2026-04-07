# iOS build and dev-client stability (consolidated)

## Goals

- RNTP iOS 16 + codegen (`RNTrackPlayerSpec`) reliable
- No duplicate Reanimated / worklets native link
- Simulator `openurl` 115 not failing the workflow when patched CLI is used
- Metro port aligned between `expo start` and `expo run:ios`
- `@expo/cli` version locked to the pnpm-patched release

## Implemented mitigations (repo)

1. **`pnpm.overrides`** – pin `@expo/cli` to `0.22.28` (matches `patches/@expo__cli@0.22.28.patch`).
2. **`scripts/verify-expo-cli-patch.cjs`** – postinstall checks patch is present; fails fast if CLI drifted.
3. **Root `package.json`** – `postinstall` runs patch-package + verify; scripts `start:mobile`, `verify:expo-cli`.
4. **`apps/mobile/package.json`** – `dev` / `start` / `ios` use the **same** Metro port (default **8177** in-tree) to avoid clashes with other local Expo apps on 8081/8099 and to keep `expo start` + `expo run:ios` aligned.
5. **`apps/mobile/app.config.tsx`** – `expo.ios.deploymentTarget: "16.0"` (reinforces `expo-build-properties`).
6. **Existing** – `react-native.config.js` hoisted `@rntp/player` root for codegen; `expo-build-properties` iOS 16; `@rntp/player` + `@expo/cli` pnpm patches.

## Operational steps (when native drift occurs)

- `pnpm install` from monorepo root (never rely on global `expo` for patched behavior).
- `pnpm prebuild:mobile:clean` then `pnpm ios` if Podfile / deployment target / Pods are stale.
- Clean `apps/mobile/ios/Pods`, `Podfile.lock`, Xcode DerivedData if codegen or RNTP headers fail.
- Watchman: `watchman watch-del '<repo>' ; watchman watch-project '<repo>'` if Metro recrawl warnings persist.

## Verification

- `pnpm verify:expo-cli` exits 0.
- `pnpm ios` (or `CI=1 pnpm ios`) completes build; no missing `RNTrackPlayerSpec.h`; no `RNWorklets` if worklets removed from graph.
