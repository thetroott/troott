# feat-0013: Tech Spec — Favorites library sync

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API contract

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/api/v1/library/user/:userId` | Read items + `flags.favourite` |
| POST | `/api/v1/library` | Body `{ listenerId }` — lazy create when missing |
| PUT | `/api/v1/library/user/:userId` | Update library (toggle flag or append sermon item) |

Auth: **`Protect`** — Bearer JWT.

## Existing hooks (wire, do not rewrite)

| Hook | File |
| ---- | ---- |
| `useSyncLibraryFavoriteMutation` | `apps/mobile/api/hooks/app/useFavorites.ts` |
| `useToggleFavoriteWithSync` | same |
| `useUserLibraryQuery` | `apps/mobile/api/hooks/app/useLibrary.ts` |

## Components to update

Replace direct `useFavoriteSermonIdsStore((s) => s.toggleFavorite)` with `useToggleFavoriteWithSync()`:

| Surface | File |
| ------- | ---- |
| Search sermon card | `components/features/search/sermon-card.tsx` |
| Mini player heart | `components/features/player/mini-player/mini-player.tsx` |
| Full player actions | `components/features/player/full-player/components/track-actions-controller.tsx` |
| Track list actions | `engine/playback/use-favourites.ts` (if used by sheet) |

Keep `useIsFavorite` / store **read** paths; only **write** goes through sync hook.

## Hydrate local from server (P1)

After `useUserLibraryQuery` success in library provider or `useLibrary` hook:

```ts
// Pseudocode: merge items where flags.favourite === true into favorite-sermon-ids-store
```

File candidate: `engine/state/favorite-sermon-ids-store.ts` — add `mergeIds(ids: string[])`.

## Sync mutation logic (resolved)

In `useSyncLibraryFavoriteMutation`:

1. `GET` library.
2. If 404 → `GET /listener` → `POST /library { listenerId }` → `GET` again.
3. If item exists → map `flags.favourite`.
4. If item missing and `favourite === true` → push new item:

```ts
{
  id: sermonId,
  type: 'sermon',
  sermon: sermonId,
  addedFrom: 'manual',
  flags: { favourite: true, liked: false, downloaded: false, pinned: false },
}
```

5. `PUT` full library document.

## Error handling

| Error | UX |
| ----- | -- |
| `LibraryNotFoundError` | Revert + toast (existing) |
| 401 | Clear session path (feat-0001) |
| Offline | Revert + “You’re offline” (optional: queue retry) |

## Tests

| Test | Type |
| ---- | ---- |
| Toggle calls `api.library.updateLibrary` with `flags.favourite` | Unit mock |
| Revert on 404 library | Unit |
| Integration: heart → Liked tab | Manual / E2E |

## Docs to update

- `apps/mobile/docs/mobile-action-api-matrix.md` — `sermon.like` → **ready** + PUT library
- `apps/mobile/docs/mobile-action-inventory.md` — handler column

## Implementation checklist

- [ ] Switch all heart handlers to `useToggleFavoriteWithSync`
- [ ] Fix Zustand reactivity in sync hook if still using `getState()` in hook body (feat-0012)
- [ ] P1: hydrate favorites from library on fetch
- [ ] Upsert sermon item on first favorite (append to `items[]`)
- [ ] Lazy `POST /library` on 404 before retry
- [ ] Resolve open question: add sermon to library on first favorite — **done (upsert)**
