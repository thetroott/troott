# Feature flows (action chains)

Format per plan: start action -> decisions -> success -> failure -> recovery.

## Auth / onboarding

- Start: open auth or onboarding route from index gate.
- Success: session stored; tabs reachable.
- Failure: inline errors on forms.
- Recovery: retry submit; password reset flows as implemented.

## Search / discovery

1. Start: user opens Search tab -> `SearchQueryBarTrigger` or taps recent chip (`RecentSearches`).
2. Query screen: committed term drives `useCatalogSearchQuery` + local merge.
3. Success: results list; tap row -> `SermonCard` -> `useLoadNewQueue`.
4. Empty: `SearchNoResults` + discovery hints.
5. Recovery: clear chips / edit query; recent history managed via `useSearchHistory`.

## Playback / player

1. Start: play from card or resume mini-player.
2. Full player: `TrackActionsController` — like (store), share (global flow), queue list.
3. Queue sheet Add -> navigates to `/search/query` to pick more content.
4. Failure: queue resolution warnings in engine (`playNextInQueue` / `loadQueue` logs).
5. Recovery: skip / reload queue from catalog.

## Save to playlist (E2E)

Authoritative step-by-step spec (triggers, PATCH contract, edges, files): **`mobile-save-to-playlist-e2e.md`**.

Summary:

1. Triggers: `SermonCard` ellipsis -> Save -> stacked `AddToPlaylistBottomSheet`; or `/playlist/user-playlist-add-track` from actions default route.
2. Data: `usePlaylistsQuery` -> `mapPlaylistDocsToChooseItems` -> filter sermon playlists.
3. Pick row -> PATCH add -> confirmation UI.
4. Edges: unauthenticated, empty list, duplicate, type mismatch, offline — see E2E doc.

## Share

1. Start: `openShareFlow` from sermon menu or player.
2. Listener sheet: Copy / Instagram / More options.
3. Instagram / More: native `Share.share` with URL (`buildShareUrl` in `_layout`).
4. Success / dismiss: `close()` share store.

## Library / profile

- Library categories navigate to filtered sermon lists; downloads count from library doc fields.
- Profile stacks under `user/*` — follow individual screens.
