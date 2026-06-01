# feat-0015: Server playback progress and continue listening

## Summary

Sync **listen position** to the API (`/playback`) so **Continue listening** and resume work across devices and reinstalls — not only local `lastPlayed` in MMKV.

Extends [feat-0004](../feat-0004/PRODUCT.md) and [`02 - continue-listening.md`](../../02%20-%20continue-listening.md).

## Problem

Hooks `usePlaybackForSermonQuery` and `useSavePlaybackProgressMutation` exist but are **unused**. Home continue rail and resume use `player-queue-store` + `last-played-sync` locally only.

## Goals

1. Save progress to **`POST /api/v1/playback`** on meaningful events (pause, track change, periodic while playing).
2. Hydrate **Continue listening** from **`GET /api/v1/playback`** (most recent) or **`GET /api/v1/playback/sermon/:id`**.
3. Merge server progress with local `lastPlayed` (server wins when newer).
4. Keep local cache for offline resume when API unavailable.

## Non-goals

- Full queue rehydrate to RNTP (see feat-0004 gaps).
- Download/offline progress files.
- Playback session analytics dashboard.

## Consumer

Signed-in listeners.

## Behavior

1. While playing, app debounces progress saves (e.g. every 30s and on pause/skip).
2. Payload: `{ sermonId, positionSeconds, durationSeconds? }`.
3. On Home mount, fetch recent playback list; if row exists, show **Continue listening** even when local `lastPlayed` empty.
4. **Resume** seeks to `max(local, server)` position when starting playback.
5. **New device:** after login, continue rail appears from API within one fetch.
6. **Offline:** save locally only; sync on reconnect (best-effort batch).
7. **401:** stop sync; local resume still works.
8. **App background (P1):** on `AppState` → `background` / `inactive`, flush pending progress immediately (bypass debounce).
9. **Listening history (required, separate from position):** when playback crosses product threshold (recommend **≥30s or ≥10% duration**), append sermon to server **listening history** via dedicated API — not via `PUT /library` and not inferred from `POST /playback` alone.

## Listening history vs playback progress

| Concern | API | Purpose |
| ------- | --- | ------- |
| Resume position | `POST/GET /playback` | Seek point, continue listening |
| Listening history | **New:** `GET /listener/listening-history` + `POST /listener/listening-history` (or populated `GET /listener`) | Library History / recently played rails, cross-device recents |

**API gap today:** `listenerService.addToListeningHistory` exists but has **no HTTP route**. This feat **requires** exposing read (paginated sermon summaries) and write (append on threshold) before Library History can be API-backed.

Mobile: Library “History” / search “Recently played” sections hydrate from **listening-history GET**, not MMKV-only `lastPlayed`.

## Priority

| Priority | Item |
| -------- | ---- |
| **P0** | Debounced `POST /playback`, continue listening from `GET /playback`, resume merge |
| **P1** | AppState flush on background |
| **P1** | Listening history API + wire History rails ([feat-0007](../feat-0007/PRODUCT.md)) |
| **P2** | MMKV offline queue for pending progress (`pending-playback-sync`); drain on reconnect |

## Per-screen recommendations

| Screen / surface | P0 | P1 | P2 |
| ---------------- | -- | -- | -- |
| Home → Continue listening | `GET /playback` recent + local merge | — | Offline queue drain |
| Full player / engine | Save on pause, skip, debounced interval | AppState flush | Queue when offline |
| Library → History | Local/lastPlayed until history API ships | **GET listening-history** | — |
| Search topic → Recently played | Same as History | API-backed list filtered by topic client-side | — |
| Player resume | `max(local, server)` position | — | Apply queued saves first |

## Acceptance criteria

1. Pause at 10:00 → relogin on second device → resume near 10:00.
2. `POST /playback` not fired more than debounce policy (no spam).
3. Continue listening hidden when no server row and no local lastPlayed.
4. feat-0004 TECH “Backend progress sync” gap closed.
5. Listening history: API routes documented and Library History reads server list (P1).

## Related docs

- [`TECH.md`](./TECH.md)
