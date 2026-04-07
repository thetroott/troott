# iOS `PlatformConstants` / `[runtime not ready]` — confidence and gaps

## Are we sure the rebuild path will fix it?

**Not 100%.** In practice, **`PlatformConstants` missing from `TurboModuleRegistry`** most often means **native binary and JS bundle are out of sync** or the **wrong host app** (e.g. Expo Go) is loading the bundle. A **clean prebuild + reinstall on simulator** fixes that class of issues **most of the time**.

It is **not** a guarantee: if the root cause is something else (below), rebuild alone will not help until that is addressed.

---

## What the plan is most confident about (high prior)

| Cause | Why rebuild / align fixes it |
|-------|------------------------------|
| Stale dev client after `pnpm` / RN / Expo bumps | Native TurboModules registry must match JS `react-native` version. |
| Never ran `prebuild` / `ios/` missing or from another machine | iOS project must be generated for current `newArchEnabled` and SDK. |
| Simulator still running an **old** install while Metro serves **new** JS | Deleting the app + reinstall clears the mismatch. |
| Metro from wrong project root / wrong app opened | Ensures the bundle matches the binary you built. |

---

## Remaining hypotheses (if rebuild does not fix)

These are **not fully exercised** by “prebuild + clean + ios” alone; keep them in mind if the error persists.

1. **Expo Go vs development build**  
   Opening the project in **Expo Go** while the app requires **expo-dev-client** and a specific RN version can produce core module errors. **Verify** the icon/app name is your dev client, not Expo Go.

2. **New Architecture / Hermes edge cases**  
   `newArchEnabled: true` + codegen or pod misconfiguration can theoretically leave core modules unregistered. **Diagnostic:** temporary `newArchEnabled: false`, prebuild, rebuild (then revert once root cause is found).

3. **Monorepo Metro resolving a different `react-native` than CocoaPods built**  
   Unusual for `PlatformConstants`, but if JS accidentally bundled a **second** RN tree, behavior can be bizarre. **Verify** with `pnpm why react-native` and Metro `resolveRequest` in `apps/mobile/metro.config.js`.

4. **Early native access before runtime ready**  
   Rare if entry is standard. **Audit** anything that runs at **import time** (not inside React) and touches `NativeModules`, `Platform`, or native-backed libs before `AppRegistry` runs. Custom `index.ts` + extra side effects could contribute; compare to `expo-router/entry` pattern if suspected.

5. **Xcode / simulator corruption**  
   Try another simulator device or `Reset Content and Settings`, or a physical device.

6. **Remote JS URL pointing at another Metro**  
   Another process on the same port or wrong LAN URL could load an **foreign** bundle (still sometimes “runs” but wrong native pairing if two projects share ports).

---

## Missing from the original plan (now explicit)

- [ ] **Confirm launcher app** (dev client bundle id / scheme vs Expo Go) — **do this before** long rebuilds.
- [ ] **`expo-doctor`** output saved / mismatches fixed — not optional for confidence.
- [ ] **Document outcome** of `newArchEnabled` false test if rebuild fails (narrows NA vs general mismatch).
- [ ] **Port alignment** — `apps/mobile` scripts use **8177**; document that `expo run:ios` and `expo start` must agree (see `ios-build-stability.plan.md`).
- [ ] **Typo in command** — e.g. `expo:mobile--` (double dash) may invoke wrong script; verify actual `pnpm` script name in root `package.json`.

---

## Success vs “try next”

- **Success:** Error gone after aligned native + Metro + correct app host.
- **Still failing:** Work through **Remaining hypotheses** in order; capture `expo-doctor`, Xcode build log, and whether error is immediate at launch or after a specific screen.

---

## Related

- [ios-build-stability.plan.md](./ios-build-stability.plan.md) — Metro port, prebuild, Pods, `@expo/cli` patch.
