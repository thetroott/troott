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
| User library | `useUserLibraryQuery` | GET | `/library/user/:userId` | — | Library doc or null | `:userId` = signed-in user id or listener id (must own listener); 404 -> null; other -> throw | **ready** |
| List playlists | `usePlaylistsQuery` | GET | `/playlist/user/:userId` | — | Playlist docs (array or envelope) | throws (empty → `[]`) | **ready** |

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
| Toggle favorite | `useToggleFavoriteWithSync` | GET + POST + PUT | `/library/user/:userId`, `POST /library`, PUT library | upsert item + `flags.favourite` | see [feat-0013](../../specs/mobile/feature/feat-0013/PRODUCT.md) | lazy create on 404 | **ready** |

## Playback & history

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Save progress | `useSyncPlaybackProgress` / `PlaybackProgressSync` | POST | `/playback` | `{ sermonId, positionSeconds, durationSeconds? }` | playback row | 401 stop sync | **ready** |
| Continue listening | `useRecentPlaybackQuery` + `ContinueListeningSection` | GET | `/playback` | — | recent rows | empty ok | **ready** |
| Listening history list | `useListeningHistoryQuery` (target) | GET | `/listener/listening-history` (proposed) | pagination | sermon summaries | — | **backend blocked** → feat-0015 |
| Record listen | `useRecordListeningHistoryMutation` (target) | POST | `/listener/listening-history` (proposed) | `{ sermonId }` | updated history | — | **backend blocked** |

## Minister & topic

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Minister profile | `useMinisterByIdQuery` | GET | `/minister/:id` (proposed public) | — | minister DTO | 404 | **backend blocked** → feat-0016 |
| Minister sermons rails | `useMinisterSermonsRails` | GET | `/sermon/minister/:id/most-played`, `/most-liked`, `/recently-published` | — | sermon lists | — | **frontend blocked** |
| Topic browse | `useSermonsByTopicQuery` (target) | GET | `/sermon/topic/:topic` | topic = browse **label** | sermon list | retry/fallback P1 | **frontend blocked** → feat-0017 |
| Picker search ministers | `useMinisterPickerSearchQuery` (target) | GET | `/search/ministers` | `q`, `limit` | ministers[] | q≥2 P0 | **frontend blocked** → feat-0019 |

## Invitations

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Accept listener invite | `listener.acceptListenerInvitation` (client) | POST | `/listener/invite/accept` | token + invitationId | listener provisioned | invalid token | **frontend blocked** — see [feat-0020](../../specs/mobile/feature/feat-0020/PRODUCT.md) |
| Invitation lookup | `api.invitation.*` | GET | `/invitation/*` | — | invitation rows | — | **client only** (no listener UI) |

## Share

| Action | Hook / module | Method | Path | Payload | Response | Failure | Status |
|--------|---------------|--------|------|---------|----------|---------|--------|
| Share URL build | `resolveShareUrl` + `_layout` | GET | `/sermon/:id` (shareableUrl), `/share/resolve` (inbound) | see [feat-0014](../../specs/mobile/feature/feat-0014/PRODUCT.md) | **ready** |
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
