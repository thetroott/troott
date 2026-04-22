// This `useTracks` hook is a **powerful data-fetching and caching tool for music tracks** in a React/React Native music player, built with **React Query’s `useInfiniteQuery`**. Let’s break down what it does and what it can do in the context of a music player.

// ---

// ## **1. Purpose**

// `useTracks` handles **fetching, filtering, sorting, and paginating tracks** from either:

// 1. **The server/library API** (`fetchTracks` using Jellyfin SDK)
// 2. **Downloaded tracks on the device** (`useAllDownloadedTracks`)

// It abstracts all the logic for loading tracks and gives you an **infinite scroll-ready list** for the UI.

// ---

// ## **2. Key Features**

// ### **Infinite Scroll / Pagination**

// * Uses `useInfiniteQuery` from React Query to fetch tracks **page by page**.
// * `getNextPageParam` determines the next page to fetch.
// * If `isDownloaded` is true, it skips pagination because all tracks are already local.

// ### **Filtering**

// * Filters tracks based on:

//   * Favorites (`isFavorites`)
//   * Downloaded tracks (`isDownloaded`)
// * Supports combining filters, e.g., "downloaded favorites only".

// ### **Sorting**

// * Sorts tracks by name (or other criteria if extended) in ascending/descending order.

// ### **Caching & Deduplication**

// * `trackPageParams` keeps track of which track IDs have already been loaded.
// * Prevents duplicate tracks from appearing in the infinite query list.
// * `flattenInfiniteQueryPages` merges pages and removes duplicates.

// ### **Integration with local data**

// * Can combine server tracks with **downloaded tracks** for offline mode.
// * Supports checking if downloaded tracks are also favorites with `isDownloadedTrackAlsoFavorite`.

// ### **Custom selection**

// * The `select` option in `useInfiniteQuery` (`selectTracks`) allows you to **transform or flatten the API response** before storing it in the query cache.

// ---

// ## **3. What it returns**

// ```ts
// return [trackPageParams, tracksInfiniteQuery]
// ```

// 1. `trackPageParams` → `RefObject<Set<string>>`

//    * Tracks which IDs have already been fetched. Useful to avoid duplicates or track loading state.

// 2. `tracksInfiniteQuery` → `UseInfiniteQueryResult<(string | number | BaseItemDto)[]>`

//    * Full React Query result object with:

//      * `data` → list of tracks, flattened
//      * `fetchNextPage` → function to load the next page
//      * `isFetchingNextPage` → loading state for infinite scroll
//      * `hasNextPage` → whether more pages exist
//      * `refetch` → refetch all tracks
//    * Can be directly used to render a track list in the UI with **infinite scrolling**.

// ---

// ## **4. How it can be used in a music player**

// * **Infinite scroll playlist / library**: Fetch tracks page by page instead of loading all at once.
// * **Filter by favorites / downloads**: Toggle between "All", "Favorites", or "Downloaded" tracks.
// * **Sorting UI**: Allow sorting by track name, artist, or album.
// * **Offline-first support**: Mix downloaded tracks with server tracks seamlessly.
// * **Efficient caching**: Avoid refetching pages already loaded; supports smooth playback queue loading.
// * **Lazy queue building**: You could feed the infinite query data directly into your queue for `TrackPlayer`.

// ---

// ### **5. Example usage in a music player component**

// ```tsx
// const [trackPageParams, tracksQuery] = useTracks();

// const loadMoreTracks = () => {
//   if (tracksQuery.hasNextPage && !tracksQuery.isFetchingNextPage) {
//     tracksQuery.fetchNextPage();
//   }
// };

// return (
//   <FlatList
//     data={tracksQuery.data ?? []}
//     keyExtractor={(item) => item.Id}
//     renderItem={({ item }) => <TrackRow track={item} />}
//     onEndReached={loadMoreTracks}
//     onEndReachedThreshold={0.5}
//     ListFooterComponent={tracksQuery.isFetchingNextPage ? <LoadingSpinner /> : null}
//   />
// );
// ```

// * Automatically handles fetching more tracks as the user scrolls.
// * Works for both **streamed and downloaded tracks**.
// * Integrates with your **queue or playback logic**.

// ---

// **In short:**

// This hook gives a **scalable, offline-aware, infinite scroll-friendly, sorted, and filtered track list**, ready to feed a music player's UI and queue logic. It can **replace manual fetching loops**, reduce duplicated tracks, and keep the UI responsive even for large libraries.

// ---

// If you want, I can **rewrite it in a way that it directly feeds your TrackPlayer queue**, so new tracks are added automatically as the user scrolls or filters. That’s super handy for building Spotify-like behavior.

// Do you want me to do that?
