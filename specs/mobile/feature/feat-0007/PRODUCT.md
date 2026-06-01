# feat-0007: Library and playlists

## Summary

The **Library** tab centralizes saved sermons, history, favorite ministers, and **playlists the listener created**. Users create playlists, add/remove sermons, reorder, and play lists through the engine. Complements [`03 - library.md`](../../03%20-%20library.md), [`04 - playlist.md`](../../04%20-%20playlist.md), [`specs/api/feature/feat-0003/PRODUCT.md`](../../../api/feature/feat-0003/PRODUCT.md), and mobile-flow §5B–5C.

## Problem

Library and playlist flows share PATCH APIs, bottom sheets, and optimistic favorites. Divergent UX on save/remove causes duplicate toasts or wrong cache keys. Additionally, **user-created playlists must always appear in Library**; calling the public playlist catalog instead of the user-scoped list hides newly created playlists.

## Non-goals

- Search landing (feat-0006).
- Offline download pipeline (deferred in action inventory).
- Minister/system playlist authoring.

## Consumer

Signed-in listeners only.

## Behavior

1. Library sections each have skeleton, empty, and error+retry.
2. **Save/unsave** sermon uses one optimistic pattern (favorites store + API where wired).
3. **Create playlist** from library FAB, sermon sheet, or player — name validation, discard confirm.
4. **Add to playlist** sheet: pick list → PATCH add → confirmation toast.
5. **Playlist detail** (`/playlist/[id]`): play all, reorder, remove, delete playlist confirm.
6. **Add tracks picker** route `user-playlist-add-track` with `sermonTrackId` param.
7. Play playlist row uses engine queue load.
8. Offline: show cached labels; block actions that need network when offline.
9. Default/system playlists (e.g. Favourites) non-deletable with explanatory copy.

---

## Listener playlists in Library (authoritative)

> **Every playlist the listener creates** must appear in the Library tab **without** a separate “save to library” action.

### Where they appear

| Surface | Behavior |
| ------- | -------- |
| **All** category | **My playlists** smart card count = number of user-created playlists |
| **Playlists** category | Full list of user playlists; tap → `/playlist/[id]` |
| **Add to playlist** sheet | Same list (sermon card, player, search) |
| **Profile playlists** (if shown) | Same data source |

### Data source (not the library document)

- Fetch via **`GET /api/v1/playlist/user/:userId`** where `userId` is the signed-in user.
- **Do not** use `GET /api/v1/playlist` for Library — that endpoint is the **public catalog**.
- **`GET /library/user/:userId`** holds saved sermons, ministers, history — not the create list.

### After create

1. `POST /playlist` succeeds → invalidate `playlistKeys.user(userId)`.
2. User navigates to playlist detail (or back to Library).
3. Returning to Library **Playlists** or **All** shows the new row/count **without app restart**.

### Sub-filters (Playlists category)

| Filter | Content |
| ------ | ------- |
| **All Playlist** | All playlists from user list |
| **By You** | Same as All for listener app (`ownerType: listener`) |
| **By Troott** | Platform picks — separate discovery source; may be empty until wired |

### Empty state

Zero user playlists: **No playlists yet** with CTA to create or browse (not an error).

---

## Use cases

| ID | User action | Expected UI |
| -- | ----------- | ----------- |
| **UC-LP01** | Create playlist from Library FAB | Detail opens; Library list includes it on return |
| **UC-LP02** | Open Playlists category | Lists all user-created playlists |
| **UC-LP03** | Add sermon via sheet | Sheet lists same playlists as Library |
| **UC-LP04** | Pull-to-refresh on Library | Refetches library doc **and** user playlist list |
| **UC-LP05** | New user, zero playlists | Empty state, count `0` on All card |

---

## Known gap (2026-05)

[`usePlaylistsQuery`](../../../../apps/mobile/api/hooks/app/useLibrary.ts) calls `getAllPlaylists()` (`GET /playlist`). **Must** call `getPlaylistsByUser(userId)` per [`specs/api/feature/feat-0003`](../../../api/feature/feat-0003/PRODUCT.md).

---

## Related docs

- [`TECH.md`](./TECH.md)
- [`specs/api/feature/feat-0003/PRODUCT.md`](../../../api/feature/feat-0003/PRODUCT.md)
- E2E: [`apps/mobile/docs/mobile-save-to-playlist-e2e.md`](../../../../apps/mobile/docs/mobile-save-to-playlist-e2e.md)
