# feat-0013: Favorites synced to listener library (API)

## Summary

Wire the **heart / like** action on mobile to the listener **library API**, so favorites persist server-side and appear in Library “Liked” — not only in local MMKV (`favorite-sermon-ids`).

Complements [feat-0007](../feat-0007/PRODUCT.md) (library), [feat-0004](../feat-0004/PRODUCT.md) (player actions), and [feat-0012](../feat-0012/PRODUCT.md) (favorites edge cases).

## Problem

UI surfaces (search `SermonCard`, mini player, full player, track sheet) call `useFavoriteSermonIdsStore.toggleFavorite` only. Hook **`useToggleFavoriteWithSync`** exists in `useFavorites.ts` but is **never imported** by components. Library “Liked” reads API flags; hearts can disagree across devices.

## Goals

1. One code path for favorite toggle: optimistic local + **`PUT /library/user/:userId`** sync.
2. Library Liked category reflects server `items[].flags.favourite`.
3. On sync failure, revert optimistic toggle and show clear toast (library missing vs network).
4. Hydrate local favorite ids from library on login / library refetch (optional merge).

## Non-goals

- Download / offline favorites.
- Subscription-gated likes.
- Replacing Zustand entirely (keep fast UI; sync in background).

## Consumer

Signed-in listeners with a listener library row (or product rule when library is missing — see open questions).

## Behavior

1. **Toggle heart** on any supported surface calls `useToggleFavoriteWithSync().toggle(sermonId)`.
2. **Optimistic:** MMKV store updates immediately (heart fills/unfills).
3. **Sync:** `useSyncLibraryFavoriteMutation` loads library, sets `flags.favourite` on matching item, `PUT` library.
4. **Success:** invalidate `libraryKeys.user(userId)`; Liked tab updates.
5. **Library not found (404):** call `POST /library` with `{ listenerId }`, retry sync; revert + toast only if listener profile or create fails.
6. **Other errors:** revert; toast with API message; user can retry.
7. **Multi-surface consistency:** same sermon id shows same heart state on card, mini player, full player.
8. **Cold start (P1):** after library fetch, merge server-favourited sermon ids into Zustand store so hearts match Liked tab without user action.

## Resolved decisions (production)

| # | Question | Decision |
| - | -------- | -------- |
| 1 | Library row missing for new listener | **Lazy auto-create on first favorite.** On `GET /library/user/:userId` 404, call `POST /library` with `{ listenerId }` from `GET /listener`, then retry sync. Do **not** block the heart or force onboarding — toast only if listener profile itself is missing (401/404 listener). |
| 2 | Sermon not yet in library items | **Upsert on first favorite.** When toggling `favourite: true` and sermon id is absent from `items[]`, append a new `LibraryItem` (`type: sermon`, `flags.favourite: true`, `addedFrom: manual`) in the same `PUT`. Toggle-off on a non-member is a no-op server-side (local heart still clears). |

Rationale: `libraryService.getOrCreateLibrary` already exists server-side; listener create does **not** provision library today, so blocking hearts would fail for valid signed-in users. Liked tab must include sermons never explicitly “saved” before.

## Per-screen recommendations

| Screen / surface | P0 behavior | P1 |
| ---------------- | ----------- | -- |
| Search `SermonCard` heart | `useToggleFavoriteWithSync` | — |
| Mini player heart | same | — |
| Full player / track sheet heart | same | — |
| Library → Liked | Reads `flags.favourite` from `GET /library/user/:userId` | Hydrate Zustand from library on fetch |
| Library → Saved sermons | Unchanged (explicit save is separate action) | — |
| Guest / logged out | Local MMKV only; prompt sign-in on heart (feat-0001) | — |

## Acceptance criteria

1. Heart on search row syncs to API when library exists.
2. Liked library category includes sermon after toggle (after refetch).
3. Failed sync reverts heart and shows toast.
4. `mobile-action-api-matrix.md` row `sermon.like` documents API path.
5. No duplicate toggle logic left on raw `toggleFavorite` in player/search (except store internals).

## Related docs

- [`TECH.md`](./TECH.md)
- [`apps/mobile/docs/mobile-action-api-matrix.md`](../../../../apps/mobile/docs/mobile-action-api-matrix.md)
