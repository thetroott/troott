# Continue Listening – Core Loop and Engine Gaps

**Related UX spec:** [`specs/api/mobile-flow.md`](../api/mobile-flow.md) — §4E First Home load (“Continue listening” row), §5A resume to player, §7 resume after hours/days. **User-facing goal:** the listener never feels “stuck at zero” after leaving the app or finishing a queue.

This document describes the **continue listening** core loop for the sermon app and what is **missing in the engine** to support it. Continue listening means: the user can leave and return (or let the queue finish) and the app resumes or suggests what to play next so listening never has to "start from zero."

---

## What "Continue Listening" Implies

1. **Resume after app restart** – Restore the same queue, current track, and **playback position (seconds)** so the user continues from where they left off.
2. **Queue restoration on startup** – On cold start, rehydrate the player from persisted state (queue, index, track, position) so the last session is restorable.
3. **When the queue ends** – Either auto-continue (e.g. load more from same series or recommendations) or surface a clear "Continue with …" / "Queue ended" so the loop is explicit, not a dead stop.
4. **Optional: backend sync** – Report playback started/stopped/progress so the backend can power "Recently Played", "Continue listening" lists, and cross-device resume.

The engine today supports parts of (1)–(2) but is missing critical pieces; (3) and (4) are largely unimplemented.

---

## Continuous Listening Without a Recommendation Backend

You can achieve continuous listening **without** a recommendation engine by using only client-side state and the tracklists you already have (same series, same playlist, search results, library, etc.). No "recommendations" API is required.

### Strategies (client-only)

1. **Repeat queue (already in the engine)**
   You already have `RepeatMode.Queue`. When the user has "Repeat queue" on, the queue loops forever. That _is_ continuous listening. Ensure the repeat-mode control is visible and that restoring `repeatMode` on startup (which `Initialize()` does) is enough. No backend needed.
2. **Same source, loop or extend on queue end**
   When the queue was built, you had a **tracklist** and a **queueRef** (e.g. "Library", "Search", "Favorite Tracks"). Persist that tracklist (or a reference to it) in the queue store or in a dedicated "last queue source" cache. When `PlaybackQueueEnded` fires:

- **Loop same list:** Re-queue the same tracklist from the start (or from the next logical index). Call `loadQueue` with the same list, start index 0, or append the same list via `playLaterInQueue` so playback continues with the same content in order.

3. **Client-side "recently played"**
   In MMKV (or the queue store), maintain a short list of recently played track IDs (e.g. last 20–50). When the queue ends (or on a "Continue listening" shelf), the "next" content is that list. Either auto-append it when queue ends or show a "Continue listening" row that calls `loadQueue` with that list. No backend recommendation API; the client is the source of truth for "what I just played."
4. **Next-in-context (same series / same playlist)**
   If the current queue came from a **series** or **playlist** that you fetched from the backend (e.g. "Sermons in Series X"), you already have that list. When the queue ends, the "next" content is the rest of that same list (or the same list again). Persist `queueRef` + the tracklist (or `listId` + fetch it again). On queue end, either refetch that list and append, or use a cached copy. The backend only needs to return a list by id/series; no recommendation logic required.
5. **Default "continue" list**
   If you have a single canonical list (e.g. "all sermons," "recent uploads," or "library"), you can use that as the default "what to play next" when the queue ends: append that list via `playLaterInQueue` or replace with `loadQueue`. Again, a simple list endpoint is enough; no recommendations.

### What you need to persist (no backend recommendations)

- **Last queue source** – Enough to re-create or re-fetch the same tracklist: e.g. `queueRef` + `tracklist` (or `tracklistId` / `seriesId` / `playlistId`). Stored in queue store or MMKV.
- **Client recently played** – Optional: list of `{ trackId, playedAt? }` in MMKV, trimmed to last N items, for a "Continue listening" shelf and/or auto-append on queue end.
- **Playback position** – As in the rest of this doc: current (or per-track) position so resume-after-restart works.

### Summary (no recommendation engine)

- **Resume after restart:** Position + queue + `Initialize()` (see below).
- **When queue ends:** Use repeat queue, or same tracklist (loop/append), or client recently-played list, or same series/playlist list. All of these are client-side or simple "get list by id" APIs; no recommendation engine required.

---

## Must-have context types (to aid continuous listening)

These context types give the app clear "sources" for what to play next. Each can drive queue loading, "Continue listening" UI, and queue-end behavior so listening stays continuous.

| Context type                     | Description                                                                                                   | How it aids continuous listening                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current sermon / now playing** | The sermon the user is actively listening to. Track metadata: title, minister, date, length, series, passage. | Single source of truth for "what is playing." Used to derive next context (e.g. same series, same minister) when the queue ends or for "Continue with same series?"                                                              |
| **Queue / upcoming sermons**     | Manually added or auto-populated next sermons. Supports reorder, remove, clear.                               | The immediate "what's next." Persist this (engine already does) so on restart and queue-end you can restore or extend it. Reorder/remove/clear keep the queue under user control.                                                |
| **History / recently played**    | Last N sermons played. Helps user revisit content.                                                            | Feeds "Continue Listening" shelf: load this list to resume or replay. Can auto-append when queue ends. Client-side list (MMKV) or backend later.                                                                                 |
| **Series / sermon series**       | Collections of sermons (e.g. "Genesis Overview," "Easter 2026"). Natural context for binging a series.        | When user plays from a series, persist `seriesId` (or full tracklist) as last queue source. On queue end, continue with same series (loop or next in series). Strong continuous-listening driver.                                |
| **Minister**                     | All sermons from a particular pastor or guest speaker.                                                        | Context for "more from this minister." When queue ends or from now-playing, offer "Continue with [Minister name]" by loading sermons filtered by minister id.                                                                    |
| **Topics / tags / passages**     | Organize by topic (faith, leadership, hope, forgiveness) or by Bible passage/book (e.g. John, Psalms).        | When queue ends or for discovery, "Continue with [topic]" or "More in [passage]." Load tracklist by topic id or passage/tag.                                                                                                     |
| **Favourites / liked sermons**   | User-curated list of sermons the user has marked as favourite (e.g. via heart/like).                          | When user plays from favourites, persist `queueRef: 'Favorite Tracks'` + tracklist. On queue end or home, offer "Continue with Favourites"; load favourites list via backend or local state. Strong intent: "play what I liked." |

### Mapping context types to engine and app

- **Now playing** – Already in engine: `currentTrack`, `NOW_PLAYING_QUERY_KEY`, queue store. Ensure track metadata (title, minister, date, length, series, passage) is on the track DTO and visible in UI.
- **Queue** – Already in engine: `queue`, `PLAY_QUEUE_QUERY_KEY`, `loadQueue`, `playNextInQueue`, `playLaterInQueue`, reorder/remove/clear hooks. Persist as last queue source for queue-end.
- **History** – Add client-side list (e.g. MMKV `recentlyPlayed`: last N `{ trackId, playedAt }`). Push on track start or completion; use as tracklist for "Continue Listening" and optionally for queue-end auto-append.
- **Series** – Backend or app: list sermons by series id. When user starts playback from a series screen, call `loadQueue` with that tracklist and persist `queueRef: 'Series'` + `lastTracklistId` (series id) or full tracklist. Queue-end: refetch or use cached series list and append/loop.
- **Minister** – Backend or app: list sermons by minister id. Use as tracklist for "Continue with [Minister]." Can be the last queue source if user started from a minister screen.
- **Topics / passages** – Backend or app: list sermons by topic or passage. Use as tracklist for "Continue with [topic]" or "More in [passage]." Can drive discovery and queue-end continue.
- **Favourites** – Engine already has `queueRef: 'Favorite Tracks'` in `engine/types/type.tsx` and `useAddFavorite` / `useRemoveFavorite` in `engine/hooks/useFavourites.ts`. When user starts playback from a Favourites/Liked screen, call `loadQueue` with the favourites tracklist and persist `queueRef: 'Favorite Tracks'` + `lastTracklist` or list id. Queue-end or home: offer "Continue with Favourites" and load favourites list (backend when wired, or client cache).

Treat these seven as the must-have contexts: they give you clear, named sources for building and extending the queue without a recommendation engine, and they align with how users think ("same series," "more from this minister," "continue with favourites," "continue where I left off").

---

## What the Engine Already Has

- **Persisted queue state** – `usePlayerQueueStore` (MMKV) persists: `queue`, `currentIndex`, `currentTrack`, `queueRef`, `repeatMode`, `shuffled`, `unShuffledQueue`. So we can know _which_ track and _which_ queue after restart.
- `**Initialize()`** – In `engine/helpers/initialization.ts`: restores queue and current index from store (or query client), resets RNTP, adds tracks, skips to stored index, restores repeat mode. It does **not\*\* restore playback position (no `seekTo` to a saved second).
- **No position persistence** – The store and initialization do not persist or restore **playback position in seconds**. So "resume from same second" is not implemented.
- **Startup wiring** – In `app/_layout.tsx` only `startPlayerService()` is called. `**Initialize()` is never called\*\*, so the persisted queue is never rehydrated on app startup.
- **Queue-end behavior** – In `engine/player/background.ts`, `Event.PlaybackQueueEnded` is registered but is a no-op. Nothing happens when the queue finishes (no auto-load more, no "continue with …" flow).
- **Track-change sync** – `handleActiveTrackChanged()` in `engine/queries/current-track.ts` keeps store and query client in sync when the active track changes, but there is no persistence or reporting of the **previous** track’s position when changing tracks (needed for accurate resume and backend progress).

---

## What Is Missing in the Engine

### 1. Persist and restore playback position

- **Gap:** No storage of current playback position (seconds) for the active track (or per track).
- **Needed:**
    - Persist position periodically (e.g. every 5–15 s or on pause/background) and/or on `PlaybackActiveTrackChanged` (save previous track’s position before switching).
    - Store it in the queue store (e.g. `lastPosition?: number` or a map `lastPositionByTrackId`) or in a dedicated MMKV key.
    - In `Initialize()`, after restoring queue and skipping to `currentIndex`, call `TrackPlayer.seekTo(savedPosition)` so playback resumes from the same second.

### 2. Run `Initialize()` on app startup

- **Gap:** `Initialize()` exists but is never invoked. The persisted queue and index are never applied after cold start.
- **Needed:** After `startPlayerService()` in `app/_layout.tsx` (or equivalent), call `Initialize()` so the last queue, index, and (once implemented) position are restored before the user sees the player.

### 3. Handle queue end (continue the loop)

- **Gap:** `Event.PlaybackQueueEnded` is a no-op. When the last track finishes, playback just stops with no "what’s next."
- **Needed (without a recommendation backend):**
    - In `playerBackgroundService()` (and any foreground equivalent), implement `PlaybackQueueEnded` using **client-only** strategies (see "Continuous Listening Without a Recommendation Backend" above):
        - If **Repeat Queue** is on, RNTP may already loop; if not, re-queue the same tracklist or rely on repeat mode.
        - Otherwise, use the **last queue source**: persist the tracklist (or list id/series id) when you call `loadQueue`. On queue end, either **auto-append** that same tracklist via `playLaterInQueue` (or re-`loadQueue` with start index 0 to loop), or set a **"queue ended"** flag and let the UI offer "Continue with [same list]?" that calls `loadQueue` again with the stored list.
        - Optional: maintain a **client-side recently-played** list and, on queue end, append it or show a "Continue listening" row that loads it.
    - No recommendation API required: the "next" content is the same tracklist, or a client-stored recent list, or a list you refetch by id (e.g. same series/playlist).
    - Small engine/app contract: the engine (or app) must have access to the **last tracklist** (or an id to refetch it) when handling queue end; the queue store already has `queueRef` and you can add `lastTracklist` or `lastTracklistId` for this.

### 4. Save position when track changes or app backgrounds

- **Gap:** When the user switches track or backgrounds the app, the current position is not written to persistent storage.
- **Needed:**
    - On `PlaybackActiveTrackChanged`: before updating store to the new track, read `TrackPlayer.getProgress()` for the previous track and persist that position (e.g. by track id).
    - Optionally on pause or app state "background": persist current track id + position so even if the process is killed, the next run can resume (Initialize + seekTo).

### 5. Optional: playback reporting (for "Recently Played" and sync)

- **Gap:** `engine/hooks/usePlayBack.ts` only documents the intended behavior (report playback started, stopped, progress). No real implementation or API integration.
- **Needed (for a full continue-listening product):**
    - **Playback started** – When play is pressed or a new track starts, report (track id, timestamp) to backend.
    - **Playback stopped / completed** – On pause, skip, or track end, report last position and duration so backend can distinguish "completed" vs "stopped" and maintain "recently played" ordering.
    - **Progress** – Every 5–15 s (or on pause), report (track id, position) for resume and cross-device sync.
    - Backend can then expose "recently played" or "continue listening" lists that the app uses as `tracklist` for `loadQueue` or "Continue with …" when the queue ends.

---

## Suggested Implementation Order (without a recommendation backend)

1. **Add position persistence** – Extend queue store (or MMKV) with last position (current track and/or per track). Write on progress interval or on track change / pause; read in `Initialize()` and `seekTo(position)` after restoring queue and index.
2. **Call `Initialize()` on startup** – Invoke after `startPlayerService()` in `_layout.tsx` so every cold start restores queue, index, and (after step 1) position.
3. **Persist last queue source** – When calling `loadQueue`, store the tracklist (or a ref like `seriesId` / `playlistId`) in the queue store or MMKV (e.g. `lastTracklist` or `lastTracklistId`) so queue-end logic can reuse it.
4. **Implement `PlaybackQueueEnded`** – In `playerBackgroundService()`: if repeat queue handles it, no-op or sync state; otherwise get the last tracklist from store and either auto-append it (e.g. `playLaterInQueue` with same list) or set a "queue ended" flag and let the UI offer "Continue with [same list]?" using the stored list. No recommendation API needed.
5. **Optional** – Client-side "recently played" list in MMKV; optional playback reporting and backend "recently played" later when you add a recommendation engine.

---

## File Reference (where to change what)

| Goal                          | Where to change                                                                                                                                                                                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Persist position              | `stores/player/queue.ts` (add `lastPosition` or similar); or dedicated MMKV key. Write from progress handler or `PlaybackActiveTrackChanged`.                                                                                                                                                          |
| Restore position on startup   | `engine/helpers/initialization.ts`: after `skip(storedIndex)`, get saved position and `TrackPlayer.seekTo(position)`.                                                                                                                                                                                  |
| Run restore on startup        | `app/_layout.tsx`: after `startPlayerService()`, call `Initialize()` (from `engine/helpers/initialization`).                                                                                                                                                                                           |
| Queue-end behavior            | `engine/player/background.ts`: implement `Event.PlaybackQueueEnded` (load more or set "queue ended" state; optionally call `loadQueue` / `playLaterInQueue` with next tracklist).                                                                                                                      |
| Save position on track change | `engine/player/background.ts` or wherever `PlaybackActiveTrackChanged` is handled: before updating store, get progress and persist for previous track. If not in background.ts, ensure `handleActiveTrackChanged` or equivalent is called from an event subscriber and add position persistence there. |
| Playback reporting            | `engine/hooks/usePlayBack.ts`: implement mutations that call API (playback started/stopped/progress); trigger from play/track change and progress/pause.                                                                                                                                               |

---

## Summary

The **core loop** of the sermon app is: start a queue, listen, leave or finish, then **continue** (same position or next content). You can achieve this **without a recommendation backend** by resuming from persisted position and by reusing the last tracklist (or client recently-played) when the queue ends. The engine already has queue and current-track persistence and an `Initialize()` that restores them, but:

- **Position is not persisted or restored** – so true "resume from same second" is missing.
- `**Initialize()` is never run\*\* – so the stored queue is not rehydrated on startup.
- **Queue end is a no-op** – Implement it using the last tracklist or client recently-played (no recommendation API needed).
- **Last queue source is not persisted** – add `lastTracklist` or `lastTracklistId` when calling `loadQueue` so queue-end can continue with the same list.
- **Progress/track-change persistence and reporting** are documented but not implemented – so backend-driven "Continue listening" and cross-device resume are not possible yet.

Adding position persist/restore, calling `Initialize()` on startup, persisting the last queue source, and implementing `PlaybackQueueEnded` with client-only logic (same tracklist loop/append or client recently-played) gives you continuous listening without a recommendation engine. Backend reporting and "recently played" can be added later when you have one.

---

## iOS and Android

Yes. This approach works on **both iOS and Android**.

- **Stack** – React Native Track Player (RNTP), Zustand, MMKV, React Query, and the engine/app code are all cross-platform. No platform-specific branching is required for position persistence, queue restore, last-queue-source, queue-end handling, or recently-played storage.
- **Background / notifications** – RNTP and your `playerBackgroundService()` already handle remote events (play, pause, next, previous, seek) on both platforms. The continue-listening logic (e.g. persisting position, handling `PlaybackQueueEnded`) runs in the same JS context; it behaves the same on iOS and Android.
- **Persistence** – MMKV and Zustand persist work on both platforms. Storing `lastPosition`, `lastTracklist`/`lastTracklistId`, and a client-side recently-played list is platform-agnostic.
- **Optional platform details** – Background audio and notification behavior are configured per platform in `engine/player/setup.ts` (e.g. iOS playback category, Android content type). No change needed for continue-listening; any future tweaks (e.g. how often to write position in background) would be the same on both unless you explicitly branch.

So you can implement the checklist once and ship to iOS and Android.

---

## Folder structure

Use the **existing** app layout; new continue-listening pieces slot into the same structure. Below is where everything lives and where to add new code.

### Current (relevant) structure

```
app/
  _layout.tsx                 # Call Initialize() after startPlayerService() [missing #2]
  (tabs)/home.tsx             # Continue Listening shelf, queue-ended UI [missing #10]
  series/[id].tsx             # loadQueue from series; persist lastTracklistId [missing #8]
  minister/[id].tsx            # loadQueue from minister; persist for "Continue with Minister" [missing #9]
  sermon/[id].tsx              # Sermon detail; may start playback
  track.tsx                   # Full player / now-playing UI [metadata #7]

engine/
  constants/
    engine.ts                  # Intervals, thresholds (unchanged)
  core/
    queue.ts                   # loadQueue, playNextInQueue, playLaterInQueue; persist last source here or in store [missing #3]
  helpers/
    initialization.ts          # Restore queue, index; add seekTo(savedPosition) [missing #1]
  player/
    background.ts              # PlaybackQueueEnded, PlaybackActiveTrackChanged; persist position [missing #4, #5]
  hooks/
    useControl.ts              # loadQueue invoked from UI
    usePlayBack.ts             # Optional reporting [missing #11]
  queries/
    current-track.ts           # handleActiveTrackChanged; can persist position on track change [missing #5]
    query-keys.ts              # Add key for "queue ended" state if needed

stores/
  player/
    queue.ts                   # Add lastPosition, lastTracklistId / lastTracklist [missing #1, #3]

services/
  storage.ts                   # Query persist, MMKV (unchanged)
  mmkv-storage.tsx             # Or dedicated MMKV keys for recently-played [missing #6]

dtos/
  sermon.dto.tsx               # Ensure track has title, minister, date, length, series, passage [missing #7]

components/
  engine/
    mini-player.tsx            # Now-playing metadata
    full-player.tsx
    queue.tsx                  # Queue list, reorder, remove
  containers/engine/player/    # Row components, controls
```

### Where to add new pieces

| Piece                        | Location                                                                                                                                                                             | Notes                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Last playback position**   | `stores/player/queue.ts` (add `lastPosition` or `lastPositionByTrackId`) or a dedicated MMKV key                                                                                     | Read/write from progress handler and `PlaybackActiveTrackChanged`; read in `initialization.ts`                      |
| **Last queue source**        | `stores/player/queue.ts` (add `lastTracklist`, `lastTracklistId`, and optionally `lastQueueRef`)                                                                                     | Set whenever `loadQueue` is called (in `core/queue.ts` or in the hook that calls it)                                |
| **Recently played (client)** | New: `services/recently-played.ts` or MMKV key(s) in `services/mmkv-storage.tsx`; optional store `stores/player/recently-played.ts`                                                  | Push on track start/completion; trim to last N; expose as list for Continue Listening and queue-end                 |
| **Queue-ended state**        | `stores/player/queue.ts` (e.g. `queueEnded: boolean`) or engine query key                                                                                                            | Set in `PlaybackQueueEnded`; clear when queue is loaded or a new track is added; UI reads to show "Continue with …" |
| **Position on track change** | Same place that handles `PlaybackActiveTrackChanged` – e.g. `engine/player/background.ts` or a subscriber that calls `handleActiveTrackChanged` in `engine/queries/current-track.ts` | Before updating store, get progress and persist for current track id                                                |
| **Playback reporting**       | `engine/hooks/usePlayBack.ts` + API layer (e.g. `api/` or `services/` for endpoints)                                                                                                 | Optional; for backend "recently played" and cross-device                                                            |

No new top-level folders are required. Keep engine for playback/queue logic, stores for persisted UI/player state, services for storage and (if you add it) recently-played list, and app/components for screens and UI that read queue-ended and last-queue-source and call `loadQueue`.

---

## What's missing (checklist)

Use this as the implementation checklist for continuous listening and the seven context types.

### Engine (must-have)

| #   | Missing                                                                                                                                                                                                                         | Where                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **Playback position** – Not persisted or restored. Add `lastPosition` (or per-track map) to store/MMKV; write on progress interval or track change/pause; in `Initialize()` call `seekTo(savedPosition)` after restoring queue. | `stores/player/queue.ts`, `engine/helpers/initialization.ts`, progress/track-change handler |
| 2   | **Startup restore** – `Initialize()` is never called. Call it after `startPlayerService()` so queue, index, and (after #1) position are restored on cold start.                                                                 | `app/_layout.tsx`                                                                           |
| 3   | **Last queue source** – No `lastTracklist` or `lastTracklistId` persisted. When calling `loadQueue`, store the tracklist (or seriesId/playlistId) so queue-end can reuse it.                                                    | Queue store or MMKV; wherever `loadQueue` is invoked                                        |
| 4   | **Queue-end behavior** – `PlaybackQueueEnded` is a no-op. Implement: get last tracklist from store and auto-append/loop or set "queue ended" and let UI offer "Continue with [same list]?"                                      | `engine/player/background.ts`                                                               |
| 5   | **Position on track change** – When active track changes, previous track position is not saved. On `PlaybackActiveTrackChanged`, read `getProgress()` and persist position (e.g. by track id) before updating store.            | `PlaybackActiveTrackChanged` handler (e.g. background or current-track)                     |

### Context types / app (must-have for full flow)

| #   | Missing                                                                                                                                                                                                              | Notes                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 6   | **History / recently played** – No client-side list. Add MMKV list of last N `{ trackId, playedAt }`; push on track start/completion; use as tracklist for "Continue Listening" shelf and optional queue-end append. | Feeds Continue Listening; no backend required initially                                                                  |
| 7   | **Now-playing metadata** – Confirm track DTO and UI show title, minister, date, length, series, passage so "Continue with same series/minister" can be derived.                                                      | `dtos/sermon.dto`, now-playing UI                                                                                        |
| 8   | **Series as queue source** – When user plays from a series, pass and persist `queueRef` + series id (or full tracklist) so queue-end can continue with same series.                                                  | Screens that call `loadQueue` from a series                                                                              |
| 9   | **Favourites as queue source** – When user plays from a Favourites/Liked screen, pass and persist `queueRef: 'Favorite Tracks'` + tracklist (or list id); queue-end or home can offer "Continue with Favourites."    | Screens that call `loadQueue` from favourites; `engine/hooks/useFavourites.ts` for add/remove; backend or cache for list |
| 10  | **Minister / topics as queue source** – Same idea for minister id or topic/passage id when user starts from those contexts; persist so queue-end or UI can offer "Continue with [Minister]" or "[topic]."            | Screens that call `loadQueue` from minister/topic                                                                        |
| 11  | **"Queue ended" UI** – When queue ends (and no auto-append), show state and a "Continue with [same list]?" (or "Continue Listening") action that uses stored last tracklist or recently played.                      | UI that reads queue-ended state and calls `loadQueue`                                                                    |

### Optional (later)

| #   | Missing                                                                                                                                                                                 | Notes                                    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 12  | **Playback reporting** – usePlayBack.ts is documentation only. Implement report playback started/stopped/progress to backend for cross-device resume and server-side "recently played." | `engine/hooks/usePlayBack.ts`, API layer |
| 13  | **Backend "recently played"** – If backend exposes a recently-played or continue-listening list, use it as a tracklist source alongside client-side history.                            | App + backend                            |
