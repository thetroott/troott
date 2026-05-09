# Mobile action inventory (canonical)

Single source of truth for user-visible actions in `apps/mobile`. Update when adding CTAs, menus, or sheets.

| Action id | Source (route / UI) | Component | Handler | Outcome |
|-----------|---------------------|-----------|---------|---------|
| `search.open_query` | `(tabs)/search`, landing | `SearchQueryBarTrigger` | `router.push('/search/query')` | Opens query stack |
| `search.recent_chip` | `(tabs)/search`, landing | `RecentSearches` | `router.push({ pathname: '/search/query', params: { q } })` | Query prefilled |
| `search.submit` | `(tabs)/search/query` | `SearchQueryScreen` | committed term + catalog fetch | Results / empty / library merge |
| `sermon.play_row` | Search, library, lists | `SermonCard` | `useLoadNewQueue` | Playback starts |
| `sermon.sheet_actions` | Search list | `SermonCard` + bottom sheet | `getTrackListActions` options | Per-row effects below |
| `sermon.like` | Sheet / full player | `getTrackListActions` / `TrackActionsController` | `toggleFavorite` on `favorite-sermon-ids` store | Local persisted favorites |
| `sermon.save_playlist` | Sheet | `AddToPlaylistBottomSheet` | `useAddSermonToPlaylistMutation` then confirmation | PATCH `/playlists/:id/add` |
| `sermon.queue_next` | Sheet | `SermonCard` | `useAddToQueue` + `QueuingType.PlayingNext` | RNTP queue insert after current |
| `sermon.queue_end` | Sheet | `SermonCard` | `useAddToQueue` + `QueuingType.DirectlyQueued` | Append queue |
| `sermon.share` | Sheet / player | `openShareFlow` | `ListenerSharingFlow` | Copy / Instagram share sheet / native share |
| `sermon.view_minister` | Sheet | `SermonCard` | `resolveMinisterIdFromLabel` + `router.push` | `/minister/[id]/about` |
| `share.instagram` | Root overlay | `ListenerSharingFlow` | `_layout` `handlePressInstagram` | `Share.share` message + URL |
| `share.copy` | Root overlay | `_layout` | `handleCopyToClipboard` | Clipboard + toast step |
| `share.more` | Root overlay | `_layout` | `handleOpenNativeShare` | expo-sharing or RN Share |
| `player.queue_add_browse` | Full player queue sheet | `PlaybackQueue` header | `router.push('/search/query')` | Discovery for more tracks |
| `playlist.modal_add` | `/playlist/user-playlist-add-track` | `PlaylistAddTrackContent` | Same PATCH flow when `sermonTrackId` set | Persist + toast errors |

## Placeholder / deferred

| Action | Notes |
|--------|--------|
| `sermon.download` | Menu shows info toast unless `onDownload` supplied; offline pipeline not wired here |

## Related docs

- `mobile-route-action-trace.md` — route-by-route trace tables.
- `mobile-save-to-playlist-e2e.md` — save-to-playlist E2E contract.
- `mobile-action-api-matrix.md` — backend contracts.
- `mobile-action-acceptance-tests.md` — acceptance + error/offline cases.
- `mobile-action-analytics.md` — event payload schemas.
