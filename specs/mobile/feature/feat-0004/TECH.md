# feat-0004: Tech Spec — Playback engine and player UI

## Context

See [`PRODUCT.md`](./PRODUCT.md) and engineering detail in [`01 - engine.md`](../../01%20-%20engine.md).

### Engine core

| Module | Path |
| ------ | ---- |
| Queue load/add | `engine/core/queue.ts` |
| Shuffle | `engine/core/shuffle.ts` |
| Skip previous | `engine/core/skip-previous.ts` |
| Setup / background | `engine/player/setup.ts`, `background.ts` |
| Controls hook | `engine/hooks/useControl.ts` |
| Playback queries | `engine/queries/playback-queries.ts` |
| Init | `engine/helpers/initialization.ts` |

### State (direct imports)

Context does **not** own queue/playback — see [feat-0010](../feat-0010/TECH.md).

| Store | Path |
| ----- | ---- |
| Queue + selectors | `engine/state/player-queue-store.ts` — `usePlayQueue`, `useCurrentTrack`, `useShuffle`, etc. |
| Engine mode (Cast) | `engine/state/player-engine-store.ts` |
| Favorites ids | `engine/state/favorite-sermon-ids-store.ts` |
| Last played sync | `engine/state/last-played-sync.ts` |
| UI chrome | `engine/state/player-ui-store.ts` — full player visibility, return path |
| Types | `engine/state/player-ui-types.ts` |

### UI components

| UI | Path |
| -- | ---- |
| Mini-player | `components/features/player/mini-player/mini-player.tsx` |
| Full player | `components/features/player/full-player/*` |
| Controls | `components/features/player/controls/*` |
| Queue | `components/features/player/full-player/queue.tsx` |
| Scrubber | `components/features/player/helpers/scrubber.tsx` |
| Playback hook | `components/features/player/hooks/use-playback-controls.ts` |

### API hooks

| Hook | Path |
| ---- | ---- |
| Play catalog list | `api/hooks/player/use-play-from-catalog-list.ts` |
| Resume last | `api/hooks/player/use-resume-last-played.ts` |
| Can skip next | `api/hooks/player/use-can-skip-next.ts` |
| Dismiss full player | `api/hooks/player/use-dismiss-full-player.ts` |

### PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1 | `useLoadNewQueue`, `engine/core/queue.ts` |
| 2–3 | `useControl`, `use-playback-controls.ts` |
| 4–6 | mini-player, full-player, `queue.tsx` |
| 7 | `scrubber.tsx`, `useProgress` |
| 8 | `filterTracksOnNetworkStatus`, `lib/state/network-store.ts` |
| 9 | `player-queue-store` `lastPlayed`, `mergeLastPlayedPosition` |
| 10 | `player-engine-store`, Cast branches in hooks |
| 11–12 | `openShareFlow`, `favorite-sermon-ids-store` |
| 13 | `use-dismiss-full-player`, `track-store` return path |
| 14 | Imports from `@/engine/state/player-queue-store` only |

### Known gaps ([`02 - continue-listening.md`](../../02%20-%20continue-listening.md))

| Gap | Status |
| --- | ------ |
| Cold-start full queue rehydrate to RNTP | Partial — `Initialize`, persist partialialize |
| Queue-ended auto-continue | Product/engine TBD |
| Backend progress sync | Optional / incomplete |
