# Mobile action API dependency matrix

Maps **user-visible actions** to **hooks/services**, **HTTP contract**, and **readiness**. Extend rows when new endpoints back CTAs.

Columns: Action | Hook / module | Method | Path | Payload | Response (success) | Failure contract | Status

---

## Search and discovery

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Catalog search | `useCatalogSearchQuery` | GET | `/search?q=&scope=all` | Query string `q`, `scope=all` | `{ sermons[], ministers[] }` parsed to DTOs | `parseApiData` throws on `error: true` | **ready** |
| Recent searches (local) | `useSearchHistory` | — | MMKV | — | `SearchHistoryEntry[]` | — | **ready** |

## Library

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| User library | `useUserLibraryQuery` | GET | `/library/user/:userId` | — | Library doc or null | 404 -> null; other -> throw | **ready** |
| List playlists | `usePlaylistsQuery` | GET | `/playlists` | — | Playlist docs (array or envelope) | throws | **ready** |

## Playlists (mutations)

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Add item to playlist | `useAddSermonToPlaylistMutation` | PATCH | `/playlists/:playlistId/add` | `{ itemId: string, type: string }` | `{ error:false, data: playlist }` | 400 duplicate / type mismatch; 404 not found; axios maps body | **ready** |
| Create playlist | (screen `create-playlist`) | (see playlist API module) | — | — | — | — | **frontend blocked** / verify controller |

## Playback engine (client-side)

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Load queue | `useLoadNewQueue` + `loadQueue` | — | RNTP | `QueueMutationDTO` | Queue set + index | Empty playable -> warn; toast paths in hook | **ready** |
| Add next / end | `useAddToQueue` | — | RNTP | `AddToQueueMutation` | Queue mutation | Toast on failure | **ready** |

## Favorites

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Toggle favorite | `useFavoriteSermonIdsStore` | — | MMKV persist | sermon id | ids[] updated | — | **ready** (local only) |
| Sync favorites to API | — | — | — | — | — | — | **frontend blocked** (no wire yet) |

## Share

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Share URL build | `stores/app/share` + `_layout` | — | — | track meta | URL string | — | **ready** |
| Native share | RN `Share` / expo-sharing | — | OS sheet | message + url | user dismiss | — | **ready** |

## Download

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Download sermon asset | — | — | — | — | — | — | **frontend blocked** (menu shows info toast only) |

## Auth

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Login / register / reset | `app/(auth)/*` + API layer | varies | `/auth/*` | forms | tokens / user | inline errors | **ready** (per screen) |

---

## Status legend

| Tag | Meaning |
|-----|---------|
| **ready** | Implemented path exists in app |
| **frontend blocked** | Backend OK or N/A; UI or hook missing |
| **backend blocked** | Needs API change |
| **contract mismatch** | Types or paths drift from server |

## P0 / P1 ambiguity checklist

- [x] PATCH add requires `type === playlist.playlistType` — documented and client sends row `playlistType`.
- [x] Sermon playlists filtered client-side — documented.
- [ ] Playlist **create** body schema aligned with POST/PUT — verify against `playlist.controller` when wiring submit.
