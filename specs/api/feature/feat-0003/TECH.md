# feat-0003: Tech Spec — Listener playlists and Library (API)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation lives in `apps/api`.

---

## Routes

| Method | Path | Auth | Handler | Purpose |
| ------ | ---- | ---- | ------- | ------- |
| `POST` | `/api/v1/playlist` | `Protect` | `playlist.controller.createPlaylist` | Create listener playlist |
| `GET` | `/api/v1/playlist` | `Protect` | `playlist.controller.getAllPlaylists` | **Public catalog** only |
| `GET` | `/api/v1/playlist/user/:userId` | `Protect` | `playlist.controller.getPlaylistsByUser` | **User’s playlists (Library source)** |
| `GET` | `/api/v1/playlist/:id` | `Protect` | `playlist.controller.getPlaylistById` | Detail + items |
| `PATCH` | `/api/v1/playlist/:playlistId/add` | `Protect` | `addItemToPlaylist` | Add sermon/series |
| `PATCH` | `/api/v1/playlist/:playlistId/remove` | `Protect` | `removeItemFromPlaylist` | Remove item |
| `PUT` | `/api/v1/playlist/:id` | `Protect` | `updatePlaylist` | Metadata |
| `DELETE` | `/api/v1/playlist/:id` | `Protect` | `deletePlaylist` | Soft delete / archive |

Router: [`apps/api/src/routes/playlist.router.ts`](../../../../apps/api/src/routes/playlist.router.ts)

Mount: [`apps/api/src/routes/v1/routes.router.ts`](../../../../apps/api/src/routes/v1/routes.router.ts) → `/playlist`

---

## DTOs

[`apps/api/src/dtos/core/playlist.dto.ts`](../../../../apps/api/src/dtos/core/playlist.dto.ts)

```ts
interface CreatePlaylistDTO {
  title: string;
  description?: string;
  banner?: string;
  playlistType: PlaylistType;
  visibility: PlaylistVisibility;
  ownerType: PlaylistOwnerType;
  isCollaborative?: boolean;
  tags?: string[];
  genres?: string[];
  languages?: string[];
}
```

Controller: [`playlist.controller.ts`](../../../../apps/api/src/controllers/core/playlist.controller.ts) — `parseCreatePlaylistBody`, validates enums.

---

## Service logic

File: [`apps/api/src/services/core/playlist.service.ts`](../../../../apps/api/src/services/core/playlist.service.ts)

### `createPlaylist(dto, user)`

1. Generate `code` (`pl-{random}`) and **unique** `slug`: `` `${genSlug(title)}-${code}` ``.
2. Set `status: active`, `items: []`, counters zeroed.
3. Set `user`, `createdBy` to `user._id`.
4. When `ownerType === LISTENER`, set `listener: user._id`.
5. `isPublic` from visibility ≠ `private`.
6. Persist via `playlistRepository.createPlaylist`.

**Does not** call `libraryService.addItem` today.

### `getUserPlaylists(userId, { limit, skip, status? })`

- Filter: `{ user: userId, status: { $ne: deleted } }` (or explicit status).
- Sort: `-updatedAt`.
- Delegates to `playlistRepository.findAll`.

### `getPublicPlaylists({ limit, skip })`

- Filter: `{ isPublic: true, status: active }`.
- Used **only** by `GET /playlist` — not Library.

### `getPlaylistById(id)`

- `playlistRepository.findById` with populate `items.item`.

---

## Repository

File: [`apps/api/src/repository/core/playlist.repository.ts`](../../../../apps/api/src/repository/core/playlist.repository.ts)

| Method | Notes |
| ------ | ----- |
| `findById` | `.populate('user createdBy items.item')` — **must** use `items.item` (schema ref name) |
| `findAll` | Paginated find + populate |
| `findByUser` | Legacy; prefer `findAll({ user })` via service |

### Target fix: empty user list

**Today:** `findAll` sets `error: true`, `code: 404` when zero rows.

**Target (PRODUCT UC-P03):**

```ts
result.data = playlists; // may be []
result.error = false;
result.code = 200;
result.message = playlists.length ? 'Playlists found' : 'No playlists';
```

Apply for `getUserPlaylists` path (either in repository or service wrapper so catalog empty behavior stays product-defined).

---

## Models and enums

[`apps/api/src/interfaces/core/playlist.interface.ts`](../../../../apps/api/src/interfaces/core/playlist.interface.ts)

| Enum | Values relevant to listeners |
| ---- | ---------------------------- |
| `PlaylistOwnerType` | `listener`, `minister`, `system` |
| `PlaylistType` | `listener`, … |
| `PlaylistVisibility` | `public`, `private` |
| `PlaylistStatus` | `active`, `archived`, `deleted` |

Mongoose model: [`apps/api/src/models/core/playlist.model.ts`](../../../../apps/api/src/models/core/playlist.model.ts)

---

## Library document (separate resource)

File: [`apps/api/src/services/core/library.service.ts`](../../../../apps/api/src/services/core/library.service.ts)

| Method | Purpose |
| ------ | ------- |
| `getSavedPlaylists(listenerId)` | Items in **library index** where `type === playlist` (bookmarks) |
| `getLibraryByUser` | Aggregated listener library (sermons, ministers, …) |

**Not** the source for listener-created playlists in mobile Library (feat-0003 PRODUCT rule).

Library controller populate: [`library.controller.ts`](../../../../apps/api/src/controllers/core/library.controller.ts) — `playlists` field on legacy mapper shape; distinct from `Playlist` collection list.

---

## Response envelope

Standard API shape:

```json
{
  "error": false,
  "errors": [],
  "message": "OK",
  "status": 200,
  "data": [ /* playlist docs or single doc */ ]
}
```

Mobile normalizes array vs `{ items: [] }` in `LibraryPlaylistCategory` and library index — prefer **array** in `data` for list routes.

---

## Mapper (optional client-facing DTO)

[`apps/api/src/mappers/playlist.mapper.ts`](../../../../apps/api/src/mappers/playlist.mapper.ts) — `PlaylistResponseDTO`, item rows with sermon title/duration when populated.

List endpoints may return raw lean docs today; mapper adoption is optional if mobile `playlistDocToRow` handles both.

---

## Mobile integration (read-only reference)

| Client | Path |
| ------ | ---- |
| Playlist service | [`apps/mobile/api/clients/playlist.ts`](../../../../apps/mobile/api/clients/playlist.ts) |
| **Bug:** list hook | [`useLibrary.ts`](../../../../apps/mobile/api/hooks/app/useLibrary.ts) → `getAllPlaylists()` |
| **Fix:** | `getPlaylistsByUser(userId)` |
| Path constant | `URL_PLAYLIST_USER(userId)` in [`path.ts`](../../../../apps/mobile/api/config/path.ts) |
| Invalidation | `playlistKeys.user(userId)` on create/delete/add — [`usePlaylist.ts`](../../../../apps/mobile/api/hooks/app/usePlaylist.ts) |

---

## Verification checklist

1. `POST /playlist` as listener → `201` with id.
2. `GET /playlist/user/{sameId}` → includes created playlist.
3. `GET /playlist/user/{sameId}` with no playlists → `200`, `data: []`.
4. `GET /playlist` → does not need to include private user playlists.
5. `GET /playlist/{id}` → `200`, no populate 500 on empty items.
6. Duplicate title create → two rows, distinct `slug`.

---

## Related docs

- [`PRODUCT.md`](./PRODUCT.md)
- [`specs/mobile/feature/feat-0007/TECH.md`](../../../mobile/feature/feat-0007/TECH.md)
