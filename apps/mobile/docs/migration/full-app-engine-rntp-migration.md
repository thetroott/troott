# Full-app migration plan: consolidate Troott on `@/engine` + `@rntp/player` (Expo)

This plan migrates **the whole app** from legacy playback (`hooks/useTrackPlayer`, direct player calls, split stores) to the **canonical `engine`** layer. Target playback uses **`@rntp/player`** (v5 preview / commercial license per rntp.dev). **Today** the app may still depend on **`react-native-track-player@4.x`** until the package swap and native rebuild land (see [Current package vs target](#current-package-vs-target)).

**Cursor rule (authoritative for patterns):** repository root [`.cursor/rules/react-native-track-player-expo.mdc`](../../../../.cursor/rules/react-native-track-player-expo.mdc) (not under `apps/mobile/.cursor`).

---

## Companion specs (missing in repo)

These filenames are referenced historically but **are not present** under `apps/mobile/docs/`. Either recreate them or treat the bullets below as the working spec until dedicated docs exist.

| Intended doc                      | Purpose                                        | Minimal content to capture                                                                                                |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `docs/01 - engine.md`             | Single source of truth for queue / now playing | Queue store + `engine/queries`; forbid `TrackPlayer` / `@rntp/player` outside `engine/` (except agreed DTOs).             |
| `docs/02 - continue-listening.md` | Resume + persistence                           | `Initialize()` restore rules; where position is saved (e.g. on `MediaItemTransition`); per-track resume product decision. |

**Action:** Add `apps/mobile/docs/specs/engine.md` and `apps/mobile/docs/specs/continue-listening.md` (or one combined `playback-spec.md`) and link them from this file when written.

---

## Current package vs target

|             | Current (typical)                                                        | Target                                                                                                    |
| ----------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| npm package | `react-native-track-player` ^4.x                                         | `@rntp/player` (v5 per rntp.dev + license)                                                                |
| Patches     | Root `patches/react-native-track-player+4.1.2.patch` via `patch-package` | Remove 4.x patches after cutover; follow `@rntp/player` upgrade notes                                     |
| Native      | Dev client built against 4.x native module                               | **Rebuild** iOS/Android (`expo prebuild` / EAS) after switching package                                   |
| API surface | `TrackPlayer.*`, service registration patterns from v4                   | v5: no `registerPlaybackService`; foreground listeners in `engine/player/background.ts` (see Cursor rule) |

**Sleep-timer / ObjC warnings:** If the JS package exposes methods the native binary does not implement, versions are skewed—align npm and native, then rebuild the dev client.

---

## Monorepo (Troott / pnpm)

- Install from **repository root**; mobile is **`@troott/mobile`** under `apps/mobile`.
- **Hoisted** `node_modules` at root: Metro must resolve **one** `react` / `react-native` for the app (see [`apps/mobile/metro.config.js`](../../metro.config.js) `resolveRequest` and [`apps/mobile/README.md`](../../README.md) monorepo section).
- After changing `@rntp/player` or any native dependency: `pnpm install` at root, then rebuild the mobile dev client.

---

## Goals

1. **Single playback API** – Queue, transport, shuffle, repeat, seek, progress: only via `engine/` (core, hooks, queries) + agreed stores (`@/stores/player/queue`, etc.).
2. **Single setup + listeners** – `startPlayerService()` in `app/_layout.tsx`; optional `Initialize()` after setup; `attachEnginePlaybackListeners()` from `engine/player/background.ts` once bootstrap succeeds (not in `index.ts`). No legacy `updateOptions` during cold setup; use `useUpdateOptions` / `setCommands` when the player is active.
3. **Continue listening** – `Initialize()` + position persistence; document whether **per-item resume** is required (previously Android RNTP patches). If yes: implement with explicit `seekTo` + MMKV (or app storage), not implicit native behavior alone.
4. **Reliable Android init** – Player setup when the app is actually foregrounded (retry / `AppState`), avoiding `android_cannot_setup_player_in_background`.

---

## Policy: No backward compatibility

This migration is **breaking by design**. Do **not** preserve parallel code paths “just in case” old behavior is still needed.

| Area             | Rule                                                                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Packages**     | After v5 cutover, **`react-native-track-player` must not remain** as a second dependency, re-export shim, or optional import. One player package: **`@rntp/player`** at a pinned version.                                                                  |
| **Native**       | No “works with either native module” branching. If you roll back, you roll back **git + lockfile + patches + native project** together ([Phase 7.8](#78-rollback-plan)); do not ship an app that tries to detect which native player is linked at runtime. |
| **APIs**         | No wrappers that accept both v4 and v5 shapes (e.g. dual `Track` / `MediaItem` converters in hot paths). Migrate call sites; delete v4-only helpers.                                                                                                       |
| **Registration** | No hybrid **`registerPlaybackService`** (v4) **and** v5 foreground-only wiring in the same production build. Pick the model that matches the installed package.                                                                                            |
| **Patches**      | RNTP **4.x** `patch-package` patches are **removed** when leaving 4.x; do not keep them “for reference” in a way that still runs on install.                                                                                                               |
| **Config / env** | No alternate keys for the same concern (e.g. legacy API base URL env vars alongside the canonical one). One source of truth; update `.env.example` and docs, do not read deprecated names.                                                                 |
| **Layering**     | No **upward** dependencies into playback: **`engine/`** does not import **`@/stores`**, **`@/dtos`**, or **`@/components`** for player logic; **`dtos/`** does not import **`engine/`**. Shared shapes live in **`types/`** (see codebase conventions).    |

**Intent:** Reduce conflicts, binary skew, and maintenance cost. Temporary feature flags for _product_ behavior are fine; **dual stack** for the audio engine is not.

---

## Platform rules reference (@rntp/player + Expo)

Source: [`.cursor/rules/react-native-track-player-expo.mdc`](../../../../.cursor/rules/react-native-track-player-expo.mdc) at repo root.

### Registration and setup

- **Foreground listeners**: After successful `startPlayerService()` + `Initialize()`, call `attachEnginePlaybackListeners()` from `engine/player/background.ts` (wired in `app/_layout.tsx` when `trackPlayerBootstrapped` is true). Optional: `registerBackgroundEventHandler` only for headless Android analytics/queue work.
- **Player setup**: `startPlayerService()` in `app/_layout.tsx` with Android foreground retry when setup fails in background.
- **Do not** use legacy `TrackPlayer.updateOptions`. Use `useUpdateOptions` → `setCommands` / `applyTrackPlayerNotificationOptions`. Commands live in `engine/constants/capabilities.ts` (`PlayerCommand`).

### Engine usage

- **Setup**: `engine/player/setup.ts`, `applyTrackPlayerOptions.ts`, `background.ts` (`Event.MediaItemTransition`, `RemotePrevious`, `PlaybackError`).
- **Queue and state**: `engine/core/queue.ts` (`setMediaItems`, `insertMediaItems`, `addMediaItems`, etc.); `engine/queries/current-track.ts`; `@/stores/player/queue`.
- **Shuffle / skip**: `engine/core/shuffle.ts`, `engine/core/skip-previous.ts`.
- **Controls**: `engine/hooks/useControl.ts`. Progress: `engine/queries/playback-queries.ts` (Cast + local).
- **Track type**: `SermonTrackDTO` / `MediaItem` + `engine/utils/mappers.ts`.
- **Offline**: Same as before (`networkStatus`, `getAudioCache()`).

### Expo-specific

- **Background audio**: `app.json` iOS `UIBackgroundModes` includes `"audio"`.
- **Native modules**: `expo-dev-client`; rebuild after `@rntp/player` or native changes.

---

## Current state (audit)

### In good shape (engine)

- `engine/core/queue.ts`, `shuffle.ts`, `skip-previous.ts`
- `engine/player/setup.ts`, `background.ts`, `useUpdateOptions.ts`
- `engine/hooks/useControl.ts`
- `engine/queries/*`, `engine/helpers/initialization.ts`, `engine/utils/mappers.ts`, `offline.tsx`

### Legacy / duplicate (migrate away)

| Area                | Location                             | Issue                                                                                                           |
| ------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Player facade       | `hooks/useTrackPlayer.tsx`           | Direct `TrackPlayer.*`, inline track maps, `useTrackStore` – bypasses `mapDtoToTrack`, `loadQueue`, queue store |
| Home tab            | `app/(tabs)/home.tsx`                | Uses `useTrackPlayer` **and** direct `TrackPlayer.getQueue` / `TrackPlayer.skip`                                |
| Home widgets        | `components/containers/tabs/home/*`  | `useTrackPlayer` / `playerService`                                                                              |
| Old player UI       | `components/containers/player-old/*` | Same                                                                                                            |
| Cast / engine store | `stores/player/engine.ts`            | `TrackPlayer.pause()` – align with engine + Google Cast strategy                                                |

### Registration

- Grep `attachEnginePlaybackListeners` / `trackPlayerBootstrapped`. Listeners attach **only** after successful bootstrap in `app/_layout.tsx` (not duplicated on every navigation).

---

## Target architecture (end state)

```text
app/_layout.tsx
  └── startPlayerService() (+ Android foreground gate / retry)
  └── useUpdateOptions(false) + Initialize()
  └── trackPlayerBootstrapped → attachEnginePlaybackListeners()

Screens / features
  └── engine hooks + queue store + mappers
  └── no direct @rntp/player outside engine/ (except typed imports where agreed)
```

- Remove or replace `hooks/useTrackPlayer.tsx` after call sites migrate.
- Resolve **dual state**: `stores/player-store` vs `usePlayerQueueStore` / query keys – pick one source of truth for now playing + queue (recommended: queue store + engine queries; formalize in [Companion specs](#companion-specs-missing-in-repo)).

---

## Phase 0: Prerequisites

1. **Android** – Foreground-gated or retried `startPlayerService` (handle `android_cannot_setup_player_in_background`).
2. **New Architecture** – `@rntp/player` targets New Arch; keep `newArchEnabled` in `app.json` aligned with Expo SDK.
3. **Patches** – While on **4.x**, root `postinstall` applies `patches/react-native-track-player+*.patch` (and any worklets patch) under the **monorepo root** `patches/` directory. After moving to **`@rntp/player`**, remove obsolete 4.x patches and confirm `pnpm install` + clean native build.
4. **Verify** listeners attach once after bootstrap in `_layout` (grep below).

---

## Phase 1: Inventory

Run from repository root (adjust path if needed):

```bash
rg '@rntp/player|react-native-track-player' apps/mobile --glob '!node_modules'
rg 'useTrackPlayer|playerService' apps/mobile --glob '!node_modules'
rg 'TrackPlayer\.' apps/mobile --glob '!node_modules' --glob '!**/engine/**'
```

1. List imports of `@rntp/player` / `react-native-track-player` outside `engine/` and agreed boundaries.
2. List all `useTrackPlayer` / `playerService` usages.
3. Map each to engine APIs (table—fill rows as you migrate):

| Screen / file                        | Old behavior                                      | Engine replacement                                                                          |
| ------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `hooks/useTrackPlayer.tsx`           | Facade over `TrackPlayer`, `useTrackStore`        | Delete after call sites use `useControl` / `loadQueue` / queue store                        |
| `app/(tabs)/home.tsx`                | `useTrackPlayer`, `TrackPlayer.getQueue` / `skip` | `useLoadNewQueue` / `useAddToQueue`, `useSkip`, store-backed queue reads                    |
| `components/containers/tabs/home/*`  | `useTrackPlayer` / `playerService`                | Same as home; prefer engine hooks + mappers                                                 |
| `components/containers/player-old/*` | Legacy UI + direct player                         | Rewrite or remove; use `engine/` + current player components                                |
| `stores/player/engine.ts`            | `TrackPlayer.pause()` etc.                        | Route through `useControl` / queue APIs; keep Cast branches in sync with `playback-queries` |

---

## Phase 2: Stores and DTOs

1. All queue entries: **`mapDtoToTrack`** + `QueuingType` where applicable.
2. Consolidate **current track** / **queue** UI reads to `usePlayerQueueStore` + `NOW_PLAYING` / `PLAY_QUEUE` query patterns.
3. **`useUpdateOptions(isFavorite)`** when favorite state changes for the active item (not in cold `setup`).

---

## Phase 3: Replace `useTrackPlayer`

**Suggested order:** home list widgets → `app/(tabs)/home.tsx` → `player-old` (delete or rewrite).

- Replace `playTrack` / `addTrack` with **`useLoadNewQueue`** (full list + start index + `queueRef` + `networkStatus` + optional shuffle) or **`useAddToQueue`** + play as product requires.
- Replace transport with **`useTogglePlayback`**, **`useSkip`**, **`usePrevious`**, **`useSeekTo`**, **`useToggleRepeatMode`**, **`useToggleShuffle`**.

If a screen needs “play sermon **i** in this list”, add a small **engine-local** helper (e.g. `engine/hooks/usePlayFromList.ts`) instead of calling `TrackPlayer` in the screen.

After migration: delete `hooks/useTrackPlayer.tsx` or make it throw in dev on import; add [CI grep](#phase-9-docs-and-guardrails) to block new imports.

---

## Phase 4: `app/_layout.tsx` (rule-compliant)

1. **`startPlayerService`** with try/catch + **Android retry** when `AppState` becomes `active` if first attempt failed.
2. **`Initialize()`** after successful setup (restore queue/index from store).
3. **Audit `engine/player/setup.ts`** – No legacy `updateOptions` during cold setup; options via `useUpdateOptions` / `applyTrackPlayerNotificationOptions` once the player is active.

### Product decisions (record answers here)

| Question                  | Decision                                        | Notes                                |
| ------------------------- | ----------------------------------------------- | ------------------------------------ |
| Setup fails on cold start | Retry only / block UI / continue without player | Affects splash and error UI          |
| Per-item resume required? | Y / N                                           | Drives MMKV + `seekTo` on track open |
| Offline-first queue       | Allowed tracks only vs error state              | Align with `getAudioCache()`         |

---

## Phase 5: `engine/player/background.ts`

1. **`Event.MediaItemTransition`** – call `handleActiveTrackChanged()`; optional save previous track position (see [Companion specs](#companion-specs-missing-in-repo) / future `continue-listening` doc).
2. **`Event.RemotePrevious`** – mirror `SKIP_TO_PREVIOUS_THRESHOLD` (hybrid `Previous` command in `applyTrackPlayerOptions`).
3. **`Event.PlaybackError`** – log / user-visible handling.
4. **Queue ended / continue listening** – implement via `Event` payloads or app-level logic if still required (verify against current `@rntp/player` docs).

---

## Phase 6: Offline

Every `loadQueue` path passes **`networkStatus`**; confirm offline filtering via **`getAudioCache()`**.

---

## Phase 6b: Google Cast

- **Rule reference:** Cursor rule § Google Cast: `useControl` and `playback-queries` branch on `PlayerEngine.GOOGLE_CAST` and `react-native-google-cast`.
- **Migration work:** After queue APIs unify on `loadQueue` / engine hooks, smoke-test: start local playback, connect Cast, load/play queue changes from device, disconnect.
- **Files to touch when auditing:** `engine/hooks/useControl.ts`, `engine/queries/playback-queries.ts`, any UI that starts Cast sessions (search `GOOGLE_CAST`, `CastButton`, `useCast`).

---

## Phase 7: `@rntp/player` upgrades (v5 cutover)

Pin a **single** `@rntp/player` version. Follow **your** license or early-access instructions from [rntp.dev](https://rntp.dev) (install source may be the public npm scope, a private registry, or a tarball; this repo cannot assume one path).

**Non-negotiable:** Phase 7 follows [Policy: No backward compatibility](#policy-no-backward-compatibility): **no** dual `react-native-track-player` + `@rntp/player` install, **no** runtime fallback to v4 APIs, **no** keeping v4 `registerPlaybackService` while on v5.

The checklist below is **Troott-specific**: it maps this codebase from **`react-native-track-player` 4.x** to **v5 patterns** described in [`.cursor/rules/react-native-track-player-expo.mdc`](../../../../.cursor/rules/react-native-track-player-expo.mdc). Exact symbol names (`MediaItem`, `setMediaItems`, event enums) must be verified against the **@rntp/player** version you install.

### 7.0 Prerequisites (before touching code)

1. **License / package access** – Confirm you can install `@rntp/player` and which versions your agreement allows. Keep one pinned version across the monorepo.
2. **Expo SDK + New Architecture** – v5 targets the new architecture; align `newArchEnabled` (and Expo’s RN version) with `@rntp/player` release notes. Resolve any conflicts before the swap.
3. **Baseline** – Finish or consciously defer [Execution checklist](#execution-checklist) items that still assume v4 (e.g. duplicate listener wiring, direct `TrackPlayer` outside `engine/`).
4. **Inventory** – Run Phase 1 `rg` commands; save the list of files importing `react-native-track-player` or deep paths (e.g. `lib/src/interfaces/...`). After cutover, only **`engine/**`** (plus the agreed type barrel, e.g. `types/sermon.ts`if it still extends the player’s`MediaItem`/`Track` type) should import the player package.

### 7.1 Dependencies and patches (monorepo root)

1. From the **repository root**: remove **`react-native-track-player`** from `apps/mobile/package.json` and add **`@rntp/player`** at the pinned version.
2. Delete **`patches/react-native-track-player+*.patch`** (and any patch that only targets 4.x). Run `pnpm install` at root and confirm **`postinstall` / `patch-package`** succeeds with no stale RNTP 4 patch.
3. Search the repo for **`react-native-track-player`** in `package.json`, `metro.config.js`, `babel.config.js`, and CI; remove or replace with `@rntp/player` as required by that package’s docs.
4. If you use **config plugins** or **expo prebuild** customizations for RNTP 4, replace them with whatever `@rntp/player` documents for Expo 52+.

### 7.2 Native rebuild (mandatory)

1. Clean generated native projects if you commit them, or rely on CI: e.g. remove **`apps/mobile/ios`** and **`apps/mobile/android`** if they are prebuild outputs, then regenerate. **Do not** use or restore **`android/`** or **`ios/`** at the repository root.
2. From **`apps/mobile`**, run **`pnpm prebuild:clean`** (or **`pnpm prebuild:mobile:clean`** from the repo root). **Do not** run bare **`expo prebuild`** from the monorepo root without setting the project directory to **`apps/mobile`**.
3. **iOS**: `pod install` in **`apps/mobile/ios`**; open **`apps/mobile/ios/*.xcworkspace`** in Xcode once to confirm the RNTP module is linked.
4. **Android**: from **`apps/mobile/android`**, clean Gradle (`./gradlew clean` or delete **`apps/mobile/android/app/build`**).
5. Build a **new dev client** (`expo run:ios` / `expo run:android` or EAS). **Do not** expect OTA JS-only updates to fix native skew after this change.

### 7.3 Entry point: remove v4 playback service registration

1. In **`apps/mobile/index.ts`**, remove **`TrackPlayer.registerPlaybackService(() => playerBackgroundService)`** and the import of **`playerBackgroundService`** if it exists only for registration.
2. Keep **`renderRootComponent(App)`** and other Expo/Router bootstrap unchanged.
3. v5: lock screen / remotes are driven natively; JS “service” registration is not the v4 pattern (see Cursor rule).

### 7.4 App bootstrap: foreground listeners once

1. In **`app/_layout.tsx`**, after **`startPlayerService()`** and **`Initialize()`** (and **`useUpdateOptions`** if you keep that flow) **succeed**, set a **`trackPlayerBootstrapped`** (or reuse **`playerIsReady`**) flag.
2. Add **`useEffect(() => { attachEnginePlaybackListeners(); }, [trackPlayerBootstrapped])`** when that flag is true, importing **`attachEnginePlaybackListeners`** from **`engine/player/background.ts`**.
3. **Do not** attach listeners before setup completes (especially after Android deferred init / `android_cannot_setup_player_in_background`).
4. Remove any **duplicate** listener attachment from **`playerBackgroundService`** if it only existed for v4’s headless service; keep **one** place for foreground wiring unless `@rntp/player` docs require a separate headless handler (**`registerBackgroundEventHandler`**) for your product.

### 7.5 Engine: swap imports and APIs (file-by-file order)

Work inside **`engine/`** first; use a single barrel if helpful (e.g. **`engine/player/rntp.ts`**) re-exporting the v5 client so the rest of the app never imports the package twice with mismatched types.

Suggested order:

| Step | Area                                                                                                  | Actions                                                                                                                                                                                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A    | **`engine/player/setup.ts`**                                                                          | Replace v4 `setupPlayer` / options with v5 setup API. Remove v4-only cold **`updateOptions`** if still present; keep notification/command configuration aligned with **`useUpdateOptions`** / **`applyTrackPlayerNotificationOptions`**.                                 |
| B    | **`engine/player/background.ts`**                                                                     | Re-map remote and lifecycle events to v5 names (e.g. active track / media item transition, seek, duck, errors). Call **`handleActiveTrackChanged()`** from the v5 equivalent of “active track changed”. Keep **`SKIP_TO_PREVIOUS_THRESHOLD`** behavior for **Previous**. |
| C    | **`engine/player/pause-local-playback.ts`**, **`skip-previous.ts`**, **`shuffle.ts`**, **`queue.ts`** | Replace **`TrackPlayer.*`** calls with v5 queue/transport APIs (`setMediaItems`, `insertMediaItems`, `addMediaItems`, skip, seek, etc. per docs).                                                                                                                        |
| D    | **`engine/queries/current-track.ts`**, **`queries.ts`**, **`playback-queries.ts`**                    | Replace **`getQueue`**, **`getActiveTrack`**, **`getProgress`**, playback state with v5 hooks or imperative APIs. Preserve **Google Cast** branches in **`useControl`** / **`playback-queries`**.                                                                        |
| E    | **`engine/player/useUpdateOptions.ts`**, **`applyTrackPlayerOptions.ts`**, **`capabilities.ts`**      | Map **`Capability`** / **`RatingType`** to v5 **`setCommands`** / options model.                                                                                                                                                                                         |
| F    | **`engine/constants/*`**, **`types/sermon.ts`** (if applicable)                                       | Ensure **`SermonTrackDTO`** (or rename to **`MediaItem`**) matches v5’s expected fields (**`mediaId`**, artwork URL field names, etc.). Update **`mapDtoToTrack`** accordingly.                                                                                          |
| G    | **`engine/state/player-queue-store.ts`**                                                              | Import **`RepeatMode`** (or equivalent) from **`@rntp/player`**, not from `react-native-track-player`.                                                                                                                                                                   |
| H    | **`index.ts`**, **`stores/types.ts`**, **`components/**`\*\*                                          | Eliminate any remaining **`react-native-track-player`** imports outside the agreed boundary; use engine hooks or **`types/`** re-exports.                                                                                                                                |

### 7.6 Google Cast, offline, and edge cases

1. **Cast** – After queue APIs change, re-run Phase 6b: connect Cast, change queue from the device, verify remote metadata and transport.
2. **Offline** – Confirm **`getAudioCache()`** and **`filterTracksOnNetworkStatus`** still run **before** building the v5 queue payload.
3. **CarPlay / Android Auto** – If you register extra scenes (e.g. **`RNCarPlayScene`** in `index.ts`), verify against v5 and platform docs after the native rebuild.

### 7.7 Verification

1. Run **`pnpm exec tsc --noEmit`** in **`apps/mobile`** and fix type breaks from renamed types (`Track` vs `MediaItem`, etc.).
2. Run the [Phase 8 test matrix](#phase-8-test-matrix) on **physical** devices (lock screen controls are not trustworthy on simulators alone).
3. Watch Metro logs for **TurboModule / JNI** errors; those almost always mean **JS package version ≠ native binary** → reinstall pods, clean build, rebuild dev client.

### 7.8 Rollback plan

Rollback is a **full revert** of the branch or commit set (dependencies, patches, `index.ts`, `engine/*`, native folders)—not a supported “compat mode” inside a v5 build. Align with [Policy: No backward compatibility](#policy-no-backward-compatibility).

1. Revert the dependency change and restore **`patches/react-native-track-player+*.patch`** if you still need it on 4.x.
2. Restore **`registerPlaybackService`** in **`index.ts`** and remove foreground-only listener wiring if you revert v5.
3. Regenerate native projects again so the 4.x native module is what Gradle/CocoaPods link.

---

## Phase 8: Test matrix

Use **Pass / Fail / Skip** (or date + initials) in cells. `Skip` = not applicable for that platform.

| Case                                | iOS  | Android | Notes                                            |
| ----------------------------------- | ---- | ------- | ------------------------------------------------ |
| Cold start + Initialize             |      |         |                                                  |
| Setup when foreground (Android)     | Skip |         | Background setup must fail gracefully then retry |
| Play from list / home               |      |         |                                                  |
| Queue add / play next               |      |         |                                                  |
| Shuffle / repeat                    |      |         |                                                  |
| Previous threshold                  |      |         | Hybrid `Previous: 'js'`                          |
| Lock screen / notification controls |      |         |                                                  |
| Offline queue                       |      |         |                                                  |
| Favorite → `useUpdateOptions`       |      |         |                                                  |
| Google Cast queue sync              |      |         | See Phase 6b                                     |

---

## Phase 9: Docs and guardrails

1. Add or update **`apps/mobile/docs/specs/engine.md`** (or equivalent): state explicitly that **`TrackPlayer` / `@rntp/player` imports** are confined to `engine/**` plus any explicitly listed exceptions.
2. **ESLint (optional)** – Restrict player imports. Example with core `no-restricted-imports` (paths only; add **overrides** so `apps/mobile/engine/**` is allowed):

```js
// Example – adapt to eslint flat config or .eslintrc
'no-restricted-imports': ['error', {
  paths: [
    { name: 'react-native-track-player', message: 'Use @/engine playback APIs.' },
    { name: '@rntp/player', message: 'Use @/engine playback APIs.' },
  ],
}],
```

Alternatively use `eslint-plugin-import` **`no-restricted-paths`** so `engine/**` may import the player but `app/**` and `components/**` may not.

3. **CI grep (optional)** – Fail if forbidden imports appear outside `engine/`:

```bash
if rg -q 'from [\'"]react-native-track-player[\'"]|from [\'"]@rntp/player[\'"]' apps/mobile \
  --glob '!apps/mobile/engine/**' --glob '!**/node_modules/**'; then
  echo 'Forbidden player import outside engine/'
  exit 1
fi
```

Tune patterns for `require()` or barrel files; run in CI after tests.

4. Remove dead **`player-old`** and duplicate listener registration once Phase 3 is done.

---

## Execution checklist

- [ ] **No backward compatibility** – [Policy](#policy-no-backward-compatibility): single player package after cutover, no dual v4/v5 APIs, no deprecated env/config fallbacks for the same value
- [ ] `attachEnginePlaybackListeners` after successful bootstrap in `_layout` (once)
- [ ] `startPlayerService` + foreground handling in `_layout`
- [ ] `Initialize()` after successful setup
- [ ] Remove direct player API from app screens (use engine hooks)
- [ ] Remove / replace `hooks/useTrackPlayer.tsx`
- [ ] Unify queue / now-playing state with engine + store
- [ ] `useUpdateOptions` / `setCommands` outside cold setup
- [ ] Background module: `MediaItemTransition` + `RemotePrevious` + `PlaybackError`
- [ ] Offline `networkStatus` on all queue loads
- [ ] Google Cast paths smoke-tested with new queue APIs
- [ ] Test matrix signed off

---

## Tracking

Fill **Owner** (person or team), **Target** (date or sprint), **Status** (`not started` / `in progress` / `blocked` / `done`). Example:

| Phase | Owner | Target | Status                    |
| ----- | ----- | ------ | ------------------------- |
| 0     |       |        | not started               |
| 1     |       |        |                           |
| 2     |       |        |                           |
| 3     |       |        |                           |
| 4     |       |        |                           |
| 5     |       |        |                           |
| 6     |       |        |                           |
| 6b    |       |        | Cast smoke tests          |
| 7     |       |        | optional until v5 cutover |
| 8     |       |        |                           |
| 9     |       |        |                           |

---

## Optional Android headless

`registerBackgroundEventHandler` from `@rntp/player` is only for **analytics or dynamic queue work while the app is headless**—not required for basic playback. Add only if product requires background queue mutations without UI; document the use case in the engine spec when introduced.
