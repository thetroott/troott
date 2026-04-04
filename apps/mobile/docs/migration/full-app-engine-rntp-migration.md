# Full-app migration plan: consolidate Troott on `@/engine` + react-native-track-player (Expo)

This plan migrates **the whole app** from legacy playback (`hooks/useTrackPlayer`, direct `TrackPlayer` calls, split stores) to the **canonical `engine`** layer. Behavior must follow the Cursor rule **react-native-track-player-expo** (embedded below under [Platform rules reference](#platform-rules-reference-react-native-track-player--expo)).

---

## Goals

1. **Single playback API** – Queue, transport, shuffle, repeat, seek, progress: only via `engine/` (core, hooks, queries) + agreed stores (`@/stores/player/queue`, etc.).
2. **Single registration / setup** – One `TrackPlayer.registerPlaybackService` in `index.ts`; `startPlayerService()` in `app/_layout.tsx`; optional `Initialize()` after setup; no `TrackPlayer.updateOptions` during cold setup (use `useUpdateOptions` when service is active).
3. **Continue listening** – Align with `docs/02 - continue-listening.md` where it overlaps: `Initialize()`, position persistence, `PlaybackQueueEnded` / `PlaybackActiveTrackChanged` (can ship in phases).
4. **Reliable Android init** – Player setup when the app is actually foregrounded (retry / `AppState`), avoiding `android_cannot_setup_player_in_background`.

---

## Platform rules reference (react-native-track-player + Expo)

Source: `.cursor/rules/react-native-track-player-expo.mdc`

### Registration and setup

- **Entry point**: Register the playback service **once** in `index.ts` with `TrackPlayer.registerPlaybackService(() => playerBackgroundService)`. **Do not** register elsewhere.
- **Player setup**: Call `startPlayerService()` from `@/engine/player/setup` in `app/_layout.tsx` (e.g. in a `useEffect`). Wait for it before hiding splash / rendering app. Optionally run `Initialize()` from `engine/helpers/initialization.ts` after setup to restore last queue and position from store.
- **Do not** call `TrackPlayer.updateOptions` during setup. RNTP 5.x can NPE if the native service is not ready. Use `useUpdateOptions` from `@/engine/player/useUpdateOptions` when the service is active (e.g. when loading queue or toggling favorite). Capabilities live in `engine/constants/capabilities.ts`.

### Engine usage

- **Setup**: `engine/player/setup.ts`, `engine/player/background.ts` (remote events, ducking, etc.). Background service registers required RNTP events.
- **Queue and state**: `engine/core/queue.ts` (`loadQueue`, `playNextInQueue`, `playLaterInQueue`); `engine/queries/current-track.ts` and `@/stores/player/queue`. Query keys in `engine/queries/query-keys.ts`. Sync on active track change (`handleActiveTrackChanged` where appropriate).
- **Shuffle / skip**: `engine/core/shuffle.ts`, `engine/core/skip-previous.ts` (threshold from `engine/constants/engine.ts`).
- **Controls**: `engine/hooks/useControl.ts`. Progress: `engine/queries/playback-queries.ts` (`useProgress`, `usePlaybackState`).
- **Track type**: `SermonTrackDTO` + `engine/utils/mappers.ts` (`mapDtoToTrack`).
- **Offline**: Pass `networkStatus` into `loadQueue`; `filterTracksOnNetworkStatus` + `getAudioCache()` from `engine/utils/offline.tsx`.

### Expo-specific

- **Background audio**: `app.json` iOS `UIBackgroundModes` includes `"audio"`.
- **Native modules**: Use `expo-dev-client` for dev builds with react-native-track-player.

---

## Current state (audit)

### In good shape (engine)

- `engine/core/queue.ts`, `shuffle.ts`, `skip-previous.ts`
- `engine/player/setup.ts`, `background.ts`, `useUpdateOptions.ts`
- `engine/hooks/useControl.ts`
- `engine/queries/*`, `engine/helpers/initialization.ts`, `engine/utils/mappers.ts`, `offline.tsx`

### Legacy / duplicate (migrate away)

| Area | Location | Issue |
|------|----------|--------|
| Player facade | `hooks/useTrackPlayer.tsx` | Direct `TrackPlayer.*`, inline track maps, `useTrackStore` – bypasses `mapDtoToTrack`, `loadQueue`, queue store |
| Home tab | `app/(tabs)/home.tsx` | Uses `useTrackPlayer` **and** direct `TrackPlayer.getQueue` / `TrackPlayer.skip` |
| Home widgets | `components/containers/tabs/home/*` | `useTrackPlayer` / `playerService` |
| Old player UI | `components/containers/player-old/*` | Same |
| Cast / engine store | `stores/player/engine.ts` | `TrackPlayer.pause()` – align with engine + Google Cast strategy |

### Registration

- Grep `registerPlaybackService` and `playerBackgroundService`. **Rule: only `index.ts`** registers the service; remove duplicates from `_layout` or elsewhere if any reappear.

---

## Target architecture (end state)

```text
index.ts
  └── TrackPlayer.registerPlaybackService(playerBackgroundService)  [once]

app/_layout.tsx
  └── startPlayerService() (+ Android foreground gate / retry)
  └── optional: Initialize()

Screens / features
  └── engine hooks + queue store + mappers
  └── no direct TrackPlayer outside engine/
```

- Remove or replace `hooks/useTrackPlayer.tsx` after call sites migrate.
- Resolve **dual state**: `stores/player-store` vs `usePlayerQueueStore` / query keys – pick one source of truth for now playing + queue (recommended: queue store + engine queries per `docs/01 - engine.md`).

---

## Phase 0: Prerequisites

1. **Android** – Foreground-gated or retried `startPlayerService` (handle `android_cannot_setup_player_in_background`).
2. **New Architecture** – RNTP 4.x vs 5.x and `newArchEnabled`; document team choice (4.x + legacy bridge vs v5 + New Arch).
3. **Native merge** – Keep `pickFirst` for `libworklets.so` if both Reanimated and worklets are present.
4. **Verify** single `registerPlaybackService` in `index.ts`.

---

## Phase 1: Inventory

1. List imports of `react-native-track-player` outside `engine/` and `index.ts`.
2. List all `useTrackPlayer` / `playerService` usages.
3. Map each to engine APIs (table):

| Screen / file | Old behavior | Engine replacement |
|---------------|--------------|-------------------|
| (fill as you migrate) | e.g. `playerService.playTrack` | `useLoadNewQueue` + play, or `useAddToQueue` + `useTogglePlayback` |
| (fill as you migrate) | `TrackPlayer.skip` in screen | `useSkip` |

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

After migration: delete `hooks/useTrackPlayer.tsx` or make it throw in dev on import; add CI grep to block new imports.

---

## Phase 4: `app/_layout.tsx` (rule-compliant)

1. **`startPlayerService`** with try/catch + **Android retry** when `AppState` becomes `active` if first attempt failed.
2. **`Initialize()`** after successful setup (restore queue/index from store).
3. **Splash** – Define behavior when setup fails (retry vs continue without player vs blocking UI) – document product choice.
4. **Audit `engine/player/setup.ts`** – If rule says no `updateOptions` during setup for RNTP 5, move options to post-setup / `useUpdateOptions` path only.

---

## Phase 5: `engine/player/background.ts`

1. **`PlaybackActiveTrackChanged`** – `handleActiveTrackChanged()`; optional save previous track position (`docs/02 - continue-listening.md`).
2. **`PlaybackQueueEnded`** – Implement continue-listening (repeat, same tracklist, recently played) per product spec.
3. **`PlaybackError`** – User-visible or logged handling.

---

## Phase 6: Offline

Every `loadQueue` path passes **`networkStatus`**; confirm offline filtering via **`getAudioCache()`**.

---

## Phase 7: RNTP major upgrade (optional)

If adopting **RNTP v5** / New Arch: follow library migration guide, update Android/iOS native config, re-run full test matrix.

---

## Phase 8: Test matrix

| Case | iOS | Android |
|------|-----|---------|
| Cold start + Initialize | | |
| Setup when foreground (Android) | N/A | |
| Play from list / home | | |
| Queue add / play next | | |
| Shuffle / repeat | | |
| Previous threshold | | |
| Lock screen / notification controls | | |
| Offline queue | | |
| Favorite → `useUpdateOptions` | | |

---

## Phase 9: Docs and guardrails

1. Update `docs/01 - engine.md`: “no `TrackPlayer` outside `engine`.”
2. Optional ESLint: restrict `react-native-track-player` imports to `engine/**` and `index.ts`.
3. Remove dead `player-old` / duplicate registration.

---

## Execution checklist

- [ ] Single `registerPlaybackService` in `index.ts`
- [ ] `startPlayerService` + foreground handling in `_layout`
- [ ] `Initialize()` after successful setup
- [ ] Remove direct `TrackPlayer` from app screens
- [ ] Remove / replace `hooks/useTrackPlayer.tsx`
- [ ] Unify queue / now-playing state with engine + store
- [ ] `useUpdateOptions` outside cold setup
- [ ] Background: track change + queue end + errors
- [ ] Offline `networkStatus` on all queue loads
- [ ] Test matrix signed off

---

## Tracking

| Phase | Owner | Target | Status |
|-------|-------|--------|--------|
| 0 | | | |
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | optional |
| 8 | | | |
| 9 | | | |
