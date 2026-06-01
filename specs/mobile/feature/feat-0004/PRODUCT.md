# feat-0004: Playback engine and player UI

## Summary

All sermon audio playback goes through the **`engine/`** layer (@rntp/player), Zustand queue state, and React hooks — not ad-hoc `TrackPlayer` calls in screens. UI includes mini-player, full player, queue sheet, transport controls, shuffle/repeat, and share actions. Complements [`specs/api/mobile-flow.md`](../../../api/mobile-flow.md) §5A, [`01 - engine.md`](../../01%20-%20engine.md), and [`02 - continue-listening.md`](../../02%20-%20continue-listening.md).

## Problem

Dual state (`player-ui-store` UI vs `usePlayerQueueStore`) and legacy re-export paths caused import drift. Without a contract, features bypass the engine and break Cast, offline filtering, or queue sync.

## Non-goals

- Web studio upload or analytics.
- Recommendation ML backend (client-only continue strategies in `02 - continue-listening.md`).
- Implementing every gap in continue-listening doc in one release.

## Consumer

Signed-in listeners (playback may start from search/library without extra gate if session exists).

## Behavior

1. **Play from list** loads queue via engine (`loadQueue` / `useLoadNewQueue`) with network-aware track filtering.
2. **Play / pause / seek / skip** use `useControl` and playback queries — not raw RNTP in components.
3. **Shuffle** and **repeat** reflect store + RNTP; UI shows current mode.
4. **Mini-player** shows current track art/title; tap opens full player route.
5. **Full player** shows scrubber, controls, queue, track actions (favorite, share, add to playlist).
6. **Queue sheet** supports reorder, remove, add from search.
7. **Progress** updates on configured interval; seek updates store and player.
8. **Offline**: only cached/streamable items play when network unavailable.
9. **Last played** persisted for resume (`lastPlayed` in queue store + sync helpers).
10. **Google Cast** branches in `useControl` / `playback-queries` when engine is `GOOGLE_CAST`.
11. **Share** from player uses global share flow (feat-0008).
12. **Favorites** toggle uses `favorite-sermon-ids-store` (local persisted ids).
13. Dismissing full player restores prior route (`use-dismiss-full-player` + track store return path).
14. No `stores/player/queue` or `stores/player/engine` re-export shims — import `@/engine/state/*` directly.

## Related docs

- [`TECH.md`](./TECH.md)
- Actions: [`apps/mobile/docs/mobile-action-inventory.md`](../../../../apps/mobile/docs/mobile-action-inventory.md)
