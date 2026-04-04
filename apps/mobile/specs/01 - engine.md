# Engine

The engine is the playback and queue layer for the Troott mobile app. It wraps **react-native-track-player** (RNTP), manages the play queue, shuffle/repeat, skip/previous behavior, offline cache, and integrates with the app's stores and React Query. This document describes its structure, responsibilities, and how to work with it.

---

## Overview

- **Purpose:** Centralize all audio playback logic, queue management, and player state so the rest of the app can use hooks and queries without touching RNTP directly.
- **Stack:** React Native Track Player, Zustand (player/queue stores), TanStack React Query, MMKV (offline cache).
- **Scope:** Queue load/add/reorder, shuffle and deshuffle, skip/previous with threshold, player setup and background service, progress/playback state (including Google Cast), offline filtering, and query keys for cache sync.

---

## Directory Structure

```
engine/
  constants/     # Numeric/config constants (intervals, thresholds, gapless, capabilities)
  core/          # Queue load, add, shuffle, skip-previous
  helpers/       # Queue index helpers, network filtering, shuffle logic, init, time display
  hooks/         # React hooks for play/pause, seek, queue, repeat, shuffle, favourites, etc.
  player/        # RNTP setup, background service, option updates
  queries/       # Query key definitions and playback/queue query configs
  types/         # Queue context types, query key enums
  utils/         # DTO-to-track mappers, offline cache, text, runtimeticks
```

---

## Core Modules

### `core/queue.ts`

Handles loading a new queue and adding tracks to the current queue.

- **`loadQueue(options)`**
  - **Input:** `QueueMutationDTO`: `index`, `tracklist`, `queue` (ref string), `shuffled`, `api`, `networkStatus`.
  - **Behavior:**
    - Sets queue ref and shuffled flag in the player queue store.
    - Filters `tracklist` by network status: when offline, only items present in the audio cache are kept (`filterTracksOnNetworkStatus`).
    - Maps filtered items to RNTP-compatible tracks via `mapDtoToTrack` with `QueuingType.FromSelection`.
    - Stores the unshuffled queue in the store; if `shuffled` is true and there is more than one track, shuffles with `shuffleSermonTracks` (only "from selection" tracks; manual queue items stay in place).
    - Stops the player, sets the queue so the requested start track is at index 0, adds the rest, then moves that track to `finalStartIndex` so the mini player does not flicker.
  - **Returns:** `{ finalStartIndex, tracks }`.

- **`playNextInQueue({ api, tracks })`**
  - Maps `tracks` with `QueuingType.PlayingNext` and inserts them immediately after the current track in RNTP (or at the end if current is last). Syncs both the RNTP queue and the store’s unshuffled queue.

- **`playLaterInQueue({ api, tracks })`**
  - Maps `tracks` with `QueuingType.DirectlyQueued` and appends them to the end of the queue. Updates store queue and unshuffled queue.

### `core/shuffle.ts`

- **`handleShuffle()`**
  - If queue is empty or has one track, shows "Nothing to shuffle" and returns.
  - Saves current queue as unshuffled in the store.
  - Keeps the current track at index 0; shuffles only the rest (or entire queue with current preserved when at the end). Uses `shuffleSermonTracks` so only "from selection" tracks are randomized; "play next" / "directly queued" tracks are not included in the shuffle set.
  - Replaces upcoming tracks in RNTP with the new order and returns the new queue array.

- **`handleDeshuffle()`**
  - If not shuffled or no stored unshuffled queue, no-op.
  - Moves current track to index 0, clears upcoming tracks, re-adds the rest of the unshuffled queue, then moves the current track back to its original index. Clears the stored unshuffled queue.

### `core/skip-previous.ts`

- **`previous()`**
  - If current position (seconds) is **below** `SKIP_TO_PREVIOUS_THRESHOLD` (e.g. 4 seconds), skips to the previous track; otherwise seeks to 0.

- **`skip(index?)`**
  - If `index` is provided, skips to that queue index; otherwise skips to next.

---

## Player Layer

### `player/setup.ts`

- **`startPlayerService()`**
  - Calls `TrackPlayer.setupPlayer()` with:
    - `autoHandleInterruptions: true`
    - iOS: `Playback` category, AirPlay and Bluetooth allowed.
    - Android: `Music` content type; optional Android-specific buffer settings (e.g. 50MB cache, 30s buffer) for smoother/gapless playback.
  - Then `TrackPlayer.updateOptions()` with:
    - `capabilities` and `notificationCapabilities` from `constants/capabilities`
    - `progressUpdateEventInterval` from engine constants.
  - If the error message indicates the player is already initialized, treats it as success.

Used at app startup (e.g. in `_layout.tsx`) so the player is ready before any playback.

### `player/background.ts`

- **`playerBackgroundService()`**
  - Registers RNTP event listeners that run when the app is in the background or the notification is used:
    - **RemotePlay / RemotePause / RemoteStop:** play, pause, stop.
    - **RemoteNext:** skip to next.
    - **RemotePrevious:** same logic as `previous()` (threshold-based skip vs seek to 0).
    - **RemoteSeek:** seek to position.
    - **RemoteJumpForward / RemoteJumpBackward:** seek by interval.
    - **RemoteDuck:** temporary pause vs permanent stop vs resume.
  - Also registers no-op or placeholder listeners for queue ended, active track changed, progress, play-when-ready, playback state, and metadata events so the service is fully wired.

This function is passed to `TrackPlayer.registerPlaybackService()` so the native background/notification controls work.

### `player/useUpdateOptions.ts`

- **`useUpdateOptions(isFavorite)`**
  - Updates RNTP options with:
    - Progress interval, capabilities, `RatingType.Heart`, and like/dislike options so the lock screen / notification can show favorite state.

### `player/foreground.ts`

- Currently commented out: contains a legacy `PlayerService` class (play/pause, queue, repeat, shuffle, seek, volume, etc.). The app uses the engine’s hooks and core functions instead; this file is kept for reference.

---

## Constants

### `constants/engine.ts`

- **`UPDATE_INTERVAL`** (e.g. 250 ms): Progress update interval for the main scrubber.
- **`MINIPLAYER_UPDATE_INTERVAL`** (e.g. 1000 ms): Progress update interval for the mini player.
- **`SKIP_TO_PREVIOUS_THRESHOLD`** (e.g. 4 seconds): Position below which "previous" goes to previous track; otherwise seek to 0.
- **`PROGRESS_UPDATE_EVENT_INTERVAL`** (e.g. 30): Interval (in seconds) for RNTP progress events.

### `constants/gapless.ts`

- Prefetch and queue lookahead (e.g. prefetch count, threshold seconds, queue preparation threshold, max lookahead, min buffer, track finish threshold). Used for gapless and preloading behavior (can be wired in queue/playback logic).

### `constants/capabilities.ts`

- **`CAPABILITIES`:** Array of RNTP `Capability` values exposed to the system (Play, Pause, Stop, SeekTo, Skip, SkipToNext, SkipToPrevious, JumpForward, JumpBackward, PlayFromId, PlayFromSearch, SetRating, Like, Dislike, Bookmark). Used in setup and option updates.

---

## Helpers

### `helpers/helpers.ts`

- **`findPlayNextIndexStart(playQueue)`:** Index after the current active track for "play next" insert.
- **`findPlayQueueIndexStart(playQueue, currentIndex)`:** Index in the queue where "from selection" tracks end after `currentIndex` (for inserting user-queue items).
- **`buildNewQueue(existingQueue, tracksToInsert, insertIndex)`:** Builds a new queue array with `tracksToInsert` at `insertIndex`.
- **`filterTracksOnNetworkStatus(networkStatus, queuedItems, downloadedTracks)`:** When offline, returns only items that exist in `downloadedTracks`; when online, returns all `queuedItems`.
- **`fetchManuallyQueuedTracks(queue)`:** Returns tracks with `QueuingType.PlayingNext` or `QueuingType.DirectlyQueued`.
- **`shuffleSermonTracks(tracks)`:** Splits "from selection" vs manually queued; Fisher–Yates shuffle on the "from selection" list only; returns `{ shuffled, manuallyQueued, original }`.

### `helpers/initialization.ts`

- **`Initialize()` (default export):**
  - Reads from player queue store (and optionally query client) for persisted queue, current index, current track, repeat mode.
  - If there is a valid stored queue and index, resets RNTP, adds the stored queue, skips to the stored index, and updates the store.
  - Restores repeat mode with `TrackPlayer.setRepeatMode` and syncs it to the repeat-mode query key.

Used to restore queue and position after app restart.

### `helpers/time-codes.tsx`

- **`RunTimeSeconds` / `RunTimeTicks`:** Display components that format seconds or Jellyfin-style run-time ticks as `M:SS` or `H:MM:SS` using `utils/runtimeticks`.

---

## Queries and Current Track

### `queries/query-keys.ts`

- Defines React Query keys used by the engine and app:
  - **Player:** `ACTIVE_INDEX_QUERY_KEY`, `NOW_PLAYING_QUERY_KEY`, `PLAY_QUEUE_QUERY_KEY`, `QUEUE_REF_QUERY_KEY`, `REPEAT_MODE_QUERY_KEY`, `UNSHUFFLED_QUEUE_QUERY_KEY`, `SHUFFLED_QUERY_KEY`.
  - **User/favorites:** `UserDataQueryKey(user, item)`, `useIsFavorite(item)`.

### `queries/queries.ts` (playback-queries)

- **Query configs** (with long-lived cache, no refetch on focus/reconnect):
  - **`QUEUE_QUERY`:** `TrackPlayer.getQueue` -> `SermonTrackDTO[]`.
  - **`CURRENT_INDEX_QUERY`:** `TrackPlayer.getActiveTrackIndex`.
  - **`NOW_PLAYING_QUERY`:** `TrackPlayer.getActiveTrack` -> `SermonTrackDTO | undefined`.
  - **`REPEAT_MODE_QUERY`:** `TrackPlayer.getRepeatMode`.
  - **`AUDIO_CACHE_QUERY`:** `getAudioCache()` for downloaded tracks; invalidated when downloads change.
- **`MediaInfoQueryKey({ api, deviceProfile, itemId })`:** Key for media info (e.g. streaming URLs).

### `queries/current-track.ts`

- **`getActiveIndex()` / `setActiveIndex(index)`:** Read/write active index from/to query client.
- **`getCurrentTrack()` / `getPlayQueue()` / `setPlayQueue(tracks)`:** Read/write current track and play queue from/to query client.
- **`handleActiveTrackChanged()`:** Fetches queue, active track, and active index from RNTP and updates the player queue store (queue, current track, current index).

These are the single source of truth for "current track" and "queue" in the cache; the queue store is updated when the active track changes or when queue mutations run.

---

## Hooks (`hooks/`)

Hooks in the engine are the main API for the UI. They call RNTP, the queue store, and sometimes the core queue/shuffle/skip functions.

### Playback

- **`usePlay()`:** Mutation that calls `TrackPlayer.play()`.
- **`useTogglePlayback()`:** Callback that toggles play/pause; supports Google Cast (uses remote client when casting).
- **`useSeekTo()`:** Callback to seek to a position (local or cast).
- **`useSeekBy()`:** Callback to seek by a relative number of seconds.

### Queue

- **`useLoadNewQueue()`:** Callback that accepts `QueueMutationDTO`, calls `loadQueue`, updates store (current index, queue ref, queue, current track), then skips to `finalStartIndex` and optionally starts playback; handles cast by skipping and not starting local playback.
- **`useAddToQueue()`:** Callback that accepts `AddToQueueMutation`; calls `playNextInQueue` or `playLaterInQueue` based on `queuingType`, shows toast, then syncs queue from RNTP to store.
- **`useRemoveFromQueue()`:** Mutation that removes a track by index and syncs queue to store.
- **`useRemoveUpcomingTracks()`:** Mutation that clears upcoming tracks and syncs queue.
- **`useReorderQueue()`:** Mutation that moves a track from one index to another and syncs queue.
- **`useResetQueue()`:** Mutation that clears unshuffled queue, shuffled flag, queue ref, queue, current track, current index in store and calls `TrackPlayer.reset()`.

### Shuffle and repeat

- **`useToggleShuffle()`:** Mutation that calls `handleDeshuffle` or `handleShuffle` and flips the shuffled flag in the store.
- **`useToggleRepeatMode()`:** Callback that cycles RepeatMode (Off -> Queue -> Track -> Off), updates RNTP and store.

### Skip

- **`usePrevious()`:** Callback that calls `previous()` from `core/skip-previous`.
- **`useSkip(index?)`:** Callback that calls `skip(index)`.

### Favourites

- **`useAddFavorite()` / `useRemoveFavorite()`:** Mutations that mark/unmark an item as favorite (API integration and toasts; can sync to query cache when backend is wired).

### Playback state and progress (from `queries/playback-queries.ts`)

- **`useProgress(UPDATE_INTERVAL)`:** Wraps RNTP’s progress hook; when casting (Google Cast), uses cast stream position instead of local position.
- **`usePlaybackState()`:** Wraps RNTP’s playback state; when casting, maps cast `MediaPlayerState` to RNTP `State`.

Other hooks under `hooks/` (e.g. `useTrack`, `useSession`, `usePlaylist`, `useHomeScreen`, `useUtillities`) are either commented documentation or thin/placeholder implementations for tracks, session, playlists, home screen refetch, and utilities; the main playback surface is the control and queue hooks above.

---

## Utils

### `utils/mappers.ts`

- **`mapDtoToTrack(api, item, queuingType?)`:** Maps a sermon/item DTO to a `SermonTrackDTO` (RNTP-compatible shape) with `title`, `album`, `artist`, `QueuingType`. Can be extended to use `getAudioCache()` for offline URLs and media info for streaming URLs.

### `utils/offline.tsx`

- **Audio cache (MMKV):** Persists a list of downloaded sermons (metadata + local file path, optional artwork path). Keys: `audioCache`, `audioCacheLimit`.
- **`getAudioCache()`:** Returns the list of downloaded tracks.
- **`saveAudio(track, setDownloadProgress, isAutoDownloaded)`:** Downloads audio (and optional artwork), saves to MMKV, invalidates `AUDIO_CACHE_QUERY`. Respects `audioCacheLimit` for auto-downloads.
- **`deleteAudio(itemId)`** / **`deleteDownloadsByIds(itemIds)`** / **`deleteAudioCache()`:** Remove downloads and free space; invalidate cache.
- **`purneAudioCache()`:** Prunes oldest auto-downloaded items when over the limit.
- **`setAudioCacheLimit` / `getAudioCacheLimit` / `getDefaultAudioCacheLimit`:** Manage the cache size limit.

Used by queue loading (offline filtering) and by any UI that downloads or removes downloads.

### `utils/text.ts`

- **`getItemName(item)`:** Returns display name for a sermon item (title, originalTitle, or a fallback like "Unknown Sermon" based on `sourceType`).

### `utils/runtimeticks.ts`

- **`convertRunTimeTicksToSeconds(ticks)`:** Converts Jellyfin/Emby RunTimeTicks to seconds.
- **`convertSecondsToRunTimeTicks(seconds)`:** Converts seconds to RunTimeTicks (worklet-safe for UI).

Used by time display helpers and any logic that needs duration in seconds.

---

## Types

### `types/type.tsx`

- **`Queue`:** Union of queue context labels (e.g. "Recently Played", "Search", "Favorite Tracks", "Downloaded Tracks", "On Repeat", "Instant Mix", "Library").
- **`QueuingRequest`:** `{ sermon, queuingType, atIndex? }` for requesting a track to be queued.

### `types/queries-type.ts`

- **`PlayerQueryKeys`:** Enum of player-related query key suffixes (PlayQueue, NowPlaying, ActiveIndex, etc.).
- **`DownloadQueryKeys`:** Enum for download/cache query keys.

---

## Integration with the App

1. **Startup (`app/_layout.tsx` or similar):**
   - `TrackPlayer.registerPlaybackService(() => playerBackgroundService)` so background/notification events are handled.
   - After app is ready, `await startPlayerService()` to configure the player and options.
   - Optional: run `Initialize()` to restore the last queue and position from the queue store/query client.

2. **Starting playback:**
   - Use `useLoadNewQueue()` with a `QueueMutationDTO` (tracklist, start index, queue ref, shuffled, network status) to load a new queue and optionally start playing.
   - Use `useAddToQueue()` for "play next" or "add to queue" from lists or sermon screens.

3. **UI controls:**
   - Use `useTogglePlayback()`, `useSeekTo()`, `useSeekBy()`, `usePrevious()`, `useSkip()`, `useToggleRepeatMode()`, `useToggleShuffle()` for transport and mode toggles.
   - Use `useProgress(UPDATE_INTERVAL)` and `usePlaybackState()` for sliders and play/pause icon (they account for casting).

4. **Queue UI:**
   - Use the same query keys and store as the engine: e.g. `PLAY_QUEUE_QUERY_KEY`, `NOW_PLAYING_QUERY_KEY`, and the player queue store for queue list, current track, and reorder/remove actions via `useReorderQueue()`, `useRemoveFromQueue()`, `useRemoveUpcomingTracks()`, `useResetQueue()`.

5. **Favourites and lock screen:**
   - Use `useUpdateOptions(isFavorite)` when the current track’s favorite state changes so the notification shows the correct like state.

6. **Offline:**
   - Ensure `loadQueue` is called with the current `networkStatus` and that the tracklist is filtered by `filterTracksOnNetworkStatus` (using `getAudioCache()`). Use the same cache for download/delete UI and cache limit settings.

---

## Data Flow Summary

- **Queue and current track:** RNTP holds the actual queue and active index. The engine keeps the store and query client in sync via `handleActiveTrackChanged`, `loadQueue`, `playNextInQueue`, `playLaterInQueue`, and the hooks that mutate the queue. Components read from the store or from queries using the engine’s query keys.
- **Shuffle:** The store keeps an `unshuffledQueue` and a `shuffled` flag. Shuffle only randomizes "from selection" tracks; "play next" / "add to queue" tracks stay in place. Deshuffle restores from `unshuffledQueue`.
- **Offline:** Downloaded items are stored in MMKV and exposed via `getAudioCache()`. Queue loading filters by this list when offline so only playable tracks are enqueued.
- **Casting:** Playback state and progress hooks switch to Google Cast’s client/stream position when the engine is in cast mode; transport hooks (play, pause, seek, skip) call the cast client when casting instead of RNTP.

---

## File Reference

| Path | Role |
|------|------|
| `constants/capabilities.ts` | RNTP notification/lock screen capabilities |
| `constants/engine.ts` | Update intervals, skip-previous threshold |
| `constants/gapless.ts` | Gapless/prefetch tuning constants |
| `core/queue.ts` | loadQueue, playNextInQueue, playLaterInQueue |
| `core/shuffle.ts` | handleShuffle, handleDeshuffle |
| `core/skip-previous.ts` | previous, skip |
| `helpers/helpers.ts` | Queue index, filter, shuffle helpers |
| `helpers/initialization.ts` | Restore queue/position on startup |
| `helpers/time-codes.tsx` | RunTimeSeconds, RunTimeTicks components |
| `hooks/useControl.ts` | Play, toggle, seek, queue, repeat, shuffle, skip, remove, reorder, reset |
| `hooks/useFavourites.ts` | useAddFavorite, useRemoveFavorite |
| `player/setup.ts` | startPlayerService |
| `player/background.ts` | playerBackgroundService (remote events) |
| `player/useUpdateOptions.ts` | useUpdateOptions (notification like state) |
| `queries/query-keys.ts` | Player and user query key constants |
| `queries/queries.ts` | MediaInfoQueryKey, AUDIO_CACHE_QUERY |
| `queries/playback-queries.ts` | QUEUE_QUERY, CURRENT_INDEX_QUERY, NOW_PLAYING_QUERY, REPEAT_MODE_QUERY, useProgress, usePlaybackState |
| `queries/current-track.ts` | get/set active index, current track, queue; handleActiveTrackChanged |
| `types/type.tsx` | Queue, QueuingRequest |
| `types/queries-type.ts` | PlayerQueryKeys, DownloadQueryKeys |
| `utils/mappers.ts` | mapDtoToTrack |
| `utils/offline.tsx` | getAudioCache, saveAudio, delete*, purge, cache limit |
| `utils/text.ts` | getItemName |
| `utils/runtimeticks.ts` | convertRunTimeTicksToSeconds, convertSecondsToRunTimeTicks |
