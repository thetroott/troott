# feat-0007: Tech Spec — Library and playlists

## Context

See [`PRODUCT.md`](./PRODUCT.md). API contract for listener playlist listing: [`specs/api/feature/feat-0003/TECH.md`](../../../api/feature/feat-0003/TECH.md).

### React context (feat-0011)

Library and playlists use **`userContext`** for user id and guards; playlist/sermon lists stay in **TanStack** (`useLibrary`, `usePlaylist`). Favorites ids use **engine** Zustand, not Context.

| Concern | Path |
| ------- | ---- |
| Slice contract | [`feat-0011/TECH.md`](../feat-0011/TECH.md) |
| State ownership | [`feat-0010/TECH.md`](../feat-0010/TECH.md) |
| User slice | `context/user/userState.tsx` |
| Hooks | `api/hooks/app/useLibrary.ts`, `usePlaylist.ts` → `useContextType()` |

### Routes

| Screen | Path |
| ------ | ---- |
| Library tab | `app/(tabs)/library/index.tsx` |
| Playlist detail | `app/playlist/[id].tsx` |
| Create | `app/playlist/create-playlist.tsx` |
| Add track modal | `app/playlist/user-playlist-add-track.tsx` |

---

## Playlist list data flow (target)

```mermaid
sequenceDiagram
    participant Lib as Library tab
    participant Hook as usePlaylistsQuery
    participant API as GET /playlist/user/:userId
    participant Create as POST /playlist

    Lib->>Hook: enabled when userId
    Hook->>API: getPlaylistsByUser(userId)
    API-->>Hook: playlist[]
    Hook-->>Lib: playlistCount + Playlists rows
    Create->>Hook: invalidate playlistKeys.user(userId)
    Hook->>API: refetch
```

---

## API client

| Method | Path constant | HTTP | Library use |
| ------ | ------------- | ---- | ----------- |
| `getPlaylistsByUser(userId)` | `URL_PLAYLIST_USER(userId)` | `GET /playlist/user/:userId` | **Yes — primary** |
| `getAllPlaylists()` | `URL_PLAYLIST` | `GET /playlist` | **No** (public catalog only) |
| `createPlaylist` | `URL_PLAYLIST` | `POST /playlist` | Create flow |

File: [`apps/mobile/api/clients/playlist.ts`](../../../../apps/mobile/api/clients/playlist.ts)

---

## Hooks

### `usePlaylistsQuery` — **must fix**

File: [`apps/mobile/api/hooks/app/useLibrary.ts`](../../../../apps/mobile/api/hooks/app/useLibrary.ts)

| | Current (wrong) | Target |
| - | --------------- | ------ |
| `queryFn` | `api.playlist.getAllPlaylists()` | `api.playlist.getPlaylistsByUser(userId)` |
| `queryKey` | `queryKeys.playlist.user(userId)` | unchanged (already user-scoped key) |
| `enabled` | session has `userId` | unchanged |

Parse response: accept `data` as **array** or `{ items: [] }` (defensive — see `LibraryPlaylistCategory`).

Handle API empty list as success (`200`, `[]`), not thrown error once API feat-0003 repository fix lands.

### Mutations

File: [`apps/mobile/api/hooks/app/usePlaylist.ts`](../../../../apps/mobile/api/hooks/app/usePlaylist.ts)

| Mutation | Invalidates |
| -------- | ----------- |
| `useCreatePlaylistMutation` | `playlistKeys.user(userId)`, `playlistKeys.all` |
| `useDeletePlaylistMutation` | `playlistKeys.user(userId)` |
| `useAddSermonToPlaylistMutation` | detail + `playlistKeys.user(userId)` |

Create payload: [`create-playlist.tsx`](../../../../apps/mobile/app/playlist/create-playlist.tsx) — `ownerType: LISTENER`, `playlistType: LISTENER`.

---

## UI consumers of `usePlaylistsQuery`

All must share the **same fixed hook** (single cache):

| Consumer | Path |
| -------- | ---- |
| Library index (count + refresh) | `app/(tabs)/library/index.tsx` |
| Playlists category body | `components/features/library/library-category-bodies.tsx` → `LibraryPlaylistCategory` |
| Add-to-playlist / sermon card | `components/features/search/sermon-card.tsx` |
| Add track picker | `app/playlist/user-playlist-add-track.tsx` |
| Search query tab | `app/(tabs)/search/query.tsx` |
| Profile playlists | `components/features/profile/use-profile-playlists.ts` |

Mapping: [`engine/utils/library-map.ts`](../../../../apps/mobile/engine/utils/library-map.ts) → `playlistDocToRow`.

---

## Library document (parallel query)

| Hook | Endpoint | Contents |
| ---- | -------- | -------- |
| `useUserLibraryQuery` | `GET /library/user/:userId` | Liked sermons, ministers, downloads, history — **not** user-created playlist list |

Library tab pull-to-refresh: `Promise.all([refetchLibrary(), refetchPlaylists()])` in [`library/index.tsx`](../../../../apps/mobile/app/(tabs)/library/index.tsx).

---

## Query keys

[`apps/mobile/api/utils/query-keys.ts`](../../../../apps/mobile/api/utils/query-keys.ts)

```ts
playlistKeys.user(userId)  // list
playlistKeys.detail(id)    // single playlist
```

---

## PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1 | `useLibrary`, library index sections |
| 2 | `useFavorites`, `favorite-sermon-ids-store` |
| 3–4 | `create-playlist.tsx`, add sheet + mutations |
| 5–6 | `[id].tsx`, `user-playlist-add-track.tsx` |
| 7 | `use-play-from-catalog-list` / `loadQueue` |
| 8 | `useNetworkStatus` |
| **Listener playlists in Library** | `usePlaylistsQuery` → `getPlaylistsByUser` |

---

## Docs to update when hook is fixed

- [`apps/mobile/docs/mobile-action-api-matrix.md`](../../../../apps/mobile/docs/mobile-action-api-matrix.md) — list playlists row
- [`apps/mobile/docs/mobile-save-to-playlist-e2e.md`](../../../../apps/mobile/docs/mobile-save-to-playlist-e2e.md) — endpoint path

---

## Verification checklist

1. Create playlist → appears under Library **Playlists** and increments **My playlists** on **All**.
2. Add-to-playlist sheet shows the new playlist.
3. Delete playlist → removed from Library list after invalidation.
4. Zero playlists → empty state, no error screen.
5. Offline create → blocked with toast (existing behavior).
