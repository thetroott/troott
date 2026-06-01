# feat-0003: Listener playlists and Library (API)

## Summary

A **listener** creates **playlists** as first-class documents in the `Playlist` collection. Every playlist they create must be **listable for that user** and must **surface in the mobile Library** (client merges playlist list + library document — see mobile feat-0007).

This spec defines **ownership**, **list vs catalog endpoints**, and the relationship between the **library document** (`Library`) and **user-created playlists** (`Playlist`).

Complements [`specs/mobile/feature/feat-0007/PRODUCT.md`](../../../mobile/feature/feat-0007/PRODUCT.md), [`specs/mobile/04 - playlist.md`](../../../mobile/04%20-%20playlist.md), and [`specs/api/mobile-flow.md`](../../mobile-flow.md) §5B–5C.

## Problem

Two concepts overlap in product copy but are different on the server:

| Concept | Storage | Typical use |
| ------- | ------- | ----------- |
| **User-created playlist** | `Playlist` where `user` = listener’s user id | Create, rename, add sermons, delete |
| **Saved playlist** (bookmark) | `Library.items[]` with `type: playlist` | Listener saved someone else’s public playlist |
| **Public catalog playlist** | `Playlist` where `isPublic: true`, `status: active` | Discovery, “By Troott” picks |

Without a single contract, mobile can call the **wrong list endpoint** (`GET /playlist` = public catalog) and **user-created playlists never appear in Library**, even after successful `POST /playlist`.

## Non-goals

- Minister or system playlist authoring UX (web studio — separate specs).
- Embedding full playlist payloads inside `GET /library` (mobile uses a dedicated playlist query today).
- Auto-saving every created playlist into `Library.items` on create (optional future; not required for Library visibility).
- Collaborative playlist editing rules beyond create ownership.

## Consumer

- **Mobile listener app** — Library tab, add-to-playlist sheet, profile playlists, playlist detail.
- **Web listener** (future) — same list semantics.

---

## Core product rule (authoritative)

> **Every playlist created by a signed-in listener** (`ownerType: listener`, `user` = caller) **must appear** in that user’s playlist list via **`GET /api/v1/playlist/user/:userId`** (when `:userId` matches the session) **without any separate “save to library” step.**

Mobile Library **Playlists** category and **My playlists** smart card count derive from this endpoint, not from the public catalog.

---

## Create playlist

| Field | Rule |
| ----- | ---- |
| Route | `POST /api/v1/playlist` |
| Auth | Bearer required (`Protect`) |
| `title` | Required, non-empty |
| `ownerType` | `listener` for listener-created lists |
| `playlistType` | `listener` (mobile default) |
| `visibility` | `public` or `private` (sets `isPublic`) |
| Ownership | `user` and `createdBy` = authenticated user id; `listener` = same id when `ownerType` is listener |
| `status` | `active` on create |
| `slug` | Unique per document (title slug + code suffix) |

**Success:** `201` with created playlist document (includes `id` / `_id`).

**Side effects today:** Does **not** mutate the listener’s `Library` document. Library UI still shows the playlist via the user playlist list (client responsibility).

---

## List endpoints (do not conflate)

| Route | Purpose | Filter | Used for Library “By You”? |
| ----- | ------- | ------ | --------------------------- |
| `GET /api/v1/playlist` | **Public catalog** (discovery) | `isPublic: true`, `status: active` | **No** |
| `GET /api/v1/playlist/user/:userId` | **Caller’s own playlists** | `user: userId`, `status ≠ deleted` | **Yes** |
| `GET /api/v1/library/user/:userId` | **Library document** (saved sermons, ministers, etc.) | Listener profile | **No** (not the create list) |

**Authorization:** `GET /playlist/user/:userId` returns **403** if `:userId` ≠ authenticated user id.

**Pagination:** `limit`, `skip` on user list (default limit 25, sort `-updatedAt`).

**Empty list:** Must return **`200` with `data: []`** — not 404. A listener with zero playlists still has a valid Library empty state.

---

## Sub-filters (client; API may add query params later)

| Library sub-category | Client filter on user list |
| -------------------- | -------------------------- |
| **All Playlist** | All non-deleted playlists for user |
| **By You** | `ownerType === listener` (same as all for listener app today) |
| **By Troott** | Platform/system playlists — **not** from user list; separate discovery endpoint or static catalog (empty until wired) |

---

## Read single playlist

| Route | `GET /api/v1/playlist/:id` |
| ----- | --------------------------- |
| Auth | Bearer required |
| Populate | `items.item` must resolve sermon/series refs (strict populate path `items.item`, not legacy `items.itemId`) |
| Errors | `404` if missing; `500` if populate misconfigured |

---

## Lifecycle

| Action | Effect on Library list |
| ------ | ------------------------ |
| Create | Appears on next user list fetch |
| Update title/metadata | Remains in list; sort by `-updatedAt` |
| Archive / delete | Removed when `status` is `deleted` (or archived if client filters archived) |
| Add/remove sermon items | Playlist remains in list; detail reflects `itemsCount` |

---

## Use cases

| ID | Actor | Trigger | Expected API outcome |
| -- | ----- | ------- | -------------------- |
| **UC-P01** | Listener | `POST /playlist` with valid body | `201`; document owned by caller |
| **UC-P02** | Listener | `GET /playlist/user/:self` after create | `200`; array includes new playlist |
| **UC-P03** | Listener | `GET /playlist/user/:self` with zero playlists | `200`; `data: []` |
| **UC-P04** | Listener | `GET /playlist` (catalog) | Public playlists only; **must not** be used as “my library playlists” |
| **UC-P05** | Listener | `GET /playlist/user/:other` | `403` |
| **UC-P06** | Listener | `GET /playlist/:id` for own playlist | `200`; items populated |
| **UC-P07** | Listener | Create two playlists same title | Both succeed (unique slug via code suffix) |

---

## Known gaps vs this spec (2026-05)

| Area | Current | Target |
| ---- | ------- | ------ |
| Mobile `usePlaylistsQuery` | Calls `GET /playlist` (catalog) | `GET /playlist/user/:userId` |
| `playlist.repository.findAll` empty | Sets `error: true`, code `404` | `200`, `data: []` for user list |
| Library document | No auto-index on create | Unchanged; user list is source of truth for “By You” |

---

## Open questions

| # | Topic | Default |
| - | ----- | ------- |
| 1 | Include archived in user list | Yes, unless client filters; deleted excluded |
| 2 | `GET /playlist/user` filter `ownerType` query param | Optional v2; client filters for now |
| 3 | Sync `library.playlistCount` on create | Defer; count from playlist query on mobile |

## Related docs

- [`TECH.md`](./TECH.md) — routes, services, repository, response shapes
- [`specs/mobile/feature/feat-0007/PRODUCT.md`](../../../mobile/feature/feat-0007/PRODUCT.md)
- [`specs/mobile/03 - library.md`](../../../mobile/03%20-%20library.md)
