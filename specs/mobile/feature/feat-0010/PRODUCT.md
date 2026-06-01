# feat-0010: State ownership (Context vs TanStack vs Zustand)

## Summary

Defines **which layer owns which state** on the listener mobile app: React Context slices ([feat-0011](../feat-0011/PRODUCT.md)), TanStack Query in `api/hooks`, and Zustand under `engine/state` and `lib/`. Prevents duplicate `user` in stores, queue in Context, or list data in reducers. Complements [feat-0004](../feat-0004/PRODUCT.md) (engine) and [feat-0011](../feat-0011/PRODUCT.md) (context slice files).

## Problem

Without a ownership map, features put sermon lists in Context, auth forms in Zustand, or queue in reducers — causing desync with RNTP and TanStack cache.

## Non-goals

- Per-slice file layout (see [feat-0011](../feat-0011/PRODUCT.md)).
- Every `queryKeys` entry.
- Web portal role contexts on mobile.

## Consumer

All feature authors choosing between Context, `useQuery`, and Zustand.

## Behavior

### A. Context (feat-0011)

1. **User identity**, **auth wizards**, **app shell flags**, **session refresh** — `apps/mobile/context/` only.
2. Implement slices per [feat-0011](../feat-0011/PRODUCT.md) four-file contract.

### B. TanStack Query

3. **Server lists and detail**: library, search, playlists, discovery, `me` refetch — `api/hooks/*`.
4. Queries for **signed-in user** must **hydrate** `userContext` on success (`setResource(GET_LOGGEDIN_USER, …)`).
5. Do not copy full list responses into Context reducers.

### C. Engine Zustand

6. **Queue, current track, shuffle, repeat, last played** — `engine/state/player-queue-store.ts`.
7. **Cast / engine mode** — `player-engine-store.ts`.
8. **Favorite sermon ids** — `favorite-sermon-ids-store.ts`.
9. **Transport** — `engine/hooks/useControl.ts` + mutations.

### D. Lib Zustand (not Context)

10. **Share flow** — `lib/state/share-flow.ts`.
11. **Network / offline** — `lib/state/network-store.ts`.
12. **Preferences** (haptics, metrics, swipe) — `lib/preferences/*`.
13. **Full-player chrome** — `engine/state/player-ui-store.ts`.

### E. Legacy bridge

14. `usePlaybackDispatch` / `useQueueDispatch` are **no-ops**; engine is authoritative.

### F. Web comparison

15. Mobile has **no** minister/creator/studio/admin/draft/upload Context until product adds native portal roles.

## Related docs

- Slice implementation: [feat-0011](./feat-0011/PRODUCT.md) · [TECH](./feat-0011/TECH.md)
- Inventory: [`09 - context.md`](../../09%20-%20context.md)
