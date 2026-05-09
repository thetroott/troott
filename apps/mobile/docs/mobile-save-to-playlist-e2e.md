# Save to Playlist — end-to-end specification

Implements plan section **2.1**: trigger through persistence, feedback, return state, and edge cases.

## Trigger points

| # | Source | Route / UI | Opens picker via |
|---|--------|------------|------------------|
| T1 | Search (and lists using `SermonCard`) | `(tabs)/search/query` (sheet) | Ellipsis -> Save -> `AddToPlaylistBottomSheet` (`openAddToPlaylistSheet`) |
| T2 | Track actions menu (no stacked sheet) | Any caller using `getTrackListActions` without `onOpenAddToPlaylist` | `router.push('/playlist/user-playlist-add-track')` |
| T3 | Modal add route | `playlist/user-playlist-add-track.tsx` | Full-screen modal; playlist list + PATCH |

## Data flow

1. **Fetch playlists** — `usePlaylistsQuery` (`GET /playlists`, authenticated).
2. **Normalize** — `mapPlaylistDocsToChooseItems` (`lib/playlists-map.ts`) supports array or `{ items: [] }`.
3. **Filter for sermons** — UI keeps rows where `playlistType === 'sermon'` (case-insensitive) so PATCH `type` matches server `playlistType`.
4. **Pick row** — `ChoosePlaylistSheet` -> `PlaylistAddTrackContent.onPickPlaylist`.
5. **Persist** — If `sermonTrackId` set: `useAddSermonToPlaylistMutation` -> `PATCH /playlists/:playlistId/add` body `{ itemId: sermonId, type: row.playlistType }`.
6. **Confirm** — On success only: `useAddToPlaylistState.handleSelect` -> toast state or `onSermonAddedToPlaylist` callback.

## Feedback and return state

| Mode | Success UI | Post-success navigation |
|------|------------|-------------------------|
| `SermonCard` + `onSermonAddedToPlaylist` | Portal toast `AddToPlaylistConfirmationBar` above tabs | Optional **View** -> `router.push(/playlist/${id})`; dismiss toast |
| Inline sheet (no callback) | `AddToPlaylistConfirmationBar` inside `PlaylistAddTrackContent` | **View** -> `handleViewPlaylist` |
| Modal `user-playlist-add-track` | Same inline confirmation | User closes modal via backdrop |

## Edge outcomes

| Case | Behavior |
|------|----------|
| **Unauthenticated** | `usePlaylistsQuery` disabled; list empty or demo fallback on routes that still default `DEFAULT_CHOOSE_PLAYLISTS`; user should sign in for real PATCH |
| **No sermon playlists** | Filtered list empty; **New playlist** -> `router.push('/playlist/create-playlist')` (created playlist must use server-compatible `playlistType` for sermons) |
| **Missing `playlistType` on row** | Toast: cannot add; no optimistic confirmation |
| **Duplicate item** | API 400 e.g. `Item already in playlist`; Toast error; no confirmation |
| **Type mismatch** | API 400 `Invalid item type`; Toast shows message |
| **Network / offline** | PATCH throws; Toast error; user can retry by opening sheet again |
| **No `sermonTrackId`** (legacy path) | Selection updates UI only — **avoid for production lists**; modal route supplies id from `useCurrentTrack` |

## Related implementation files

- `components/features/playlist/playlist-add-track-content.tsx`
- `components/features/playlist/add-to-playlist-bottom-sheet.tsx`
- `components/features/playlist/use-add-to-playlist.ts`
- `hooks/use-playlist-mutations.ts`
- `components/features/search/sermon-card.tsx`
- `app/playlist/user-playlist-add-track.tsx`
