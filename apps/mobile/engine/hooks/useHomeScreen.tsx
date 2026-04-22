// This `useHomeQueries` hook is essentially a **React Query mutation that batches multiple data-fetching calls** related to a music app’s home screen. Let me break it down in the context of a music player:

// ---

// ### **1. What it imports**

// * `useMutation` from React Query: for performing actions that modify state or trigger side-effects.
// * Various custom hooks like `useFrequentlyPlayedArtists`, `useRecentArtists`, etc., which themselves are probably `useQuery` hooks fetching data from your backend or Spotify/Jellyfin API.

// ---

// ### **2. What it does**

// Inside the hook:

// ```ts
// const { refetch: refetchUserPlaylists } = useUserPlaylists()
// const { refetch: refetchRecentArtists } = useRecentArtists()
// const { refetch: refetchRecentlyPlayed } = useRecentlyPlayedTracks()
// const { refetch: refetchFrequentArtists } = useFrequentlyPlayedArtists()
// const { refetch: refetchFrequentlyPlayed } = useFrequentlyPlayedTracks()
// ```

// * Each of these destructured `refetch` functions lets you manually re-fetch the respective queries.
// * For example:

//   * `refetchUserPlaylists()` reloads the user’s playlists.
//   * `refetchRecentlyPlayed()` reloads recently played tracks.
//   * `refetchFrequentArtists()` reloads frequently played artists.

// ---

// ### **3. The mutation function**

// ```ts
// mutationFn: async () => {
// 	await Promise.all([
// 		refetchRecentlyPlayed(),
// 		refetchFrequentlyPlayed(),
// 		refetchUserPlaylists(),
// 	])
// 	await Promise.all([refetchFrequentArtists(), refetchRecentArtists()])
// 	return true
// }
// ```

// * **Batching**: It fetches multiple data sources **in parallel** using `Promise.all` instead of sequentially, which is faster.
// * First batch: Recently played tracks, frequently played tracks, user playlists.
// * Second batch: Frequently played artists, recent artists.
// * After both batches complete, it returns `true`.

// ---

// ### **4. Why use a mutation here**

// * Normally `useQuery` is for fetching data automatically.
// * This is more like a **manual refresh of multiple queries at once**, e.g., when the user opens the home screen or pulls to refresh.
// * Using `useMutation` allows you to call `mutate()` to trigger **all these queries at once**, rather than refetching them individually.

// ---

// ### **5. What it can do in a music player**

// * Quickly refresh all home screen data: playlists, recent tracks, frequently played tracks/artists.
// * Keep the home UI up-to-date when user interacts with the app.
// * Can be extended to also refresh **queue, recommendations, or new releases** in a single call.
// * Can combine with **loading indicators** to show progress while all queries are refetched.

// ---

// ### ✅ **Example usage**

// ```ts
// const refreshHomeData = useHomeQueries();

// <Button onPress={() => refreshHomeData.mutate()}>
//   Refresh Home
// </Button>
// ```

// When clicked, this button will trigger **all your home-related queries at once**, so the UI shows the latest playlists, tracks, and artists.

// ---

// If you want, I can **redesign this for a music player with queue, now-playing, and recommendations**, so it becomes a **complete “refresh home” mutation** for a Spotify-style app.

// Do you want me to do that?
