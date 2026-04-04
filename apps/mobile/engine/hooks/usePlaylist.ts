























// Here’s the simplest way to understand what this whole file **does** and **can do** inside a real music player app.

// I’ll explain it in plain english without any heavy terms.

// ---

// # **What this file actually does in a music player**

// This file is a **playlist manager**.
// It talks to the Jellyfin server and controls playlists.

// Think of it as the "playlist actions" of your music app.

// It lets the user:

// ### **1. Add a track to a playlist**

// ```ts
// addToPlaylist(...)
// ```

// Good for when a user taps “Add to playlist”.

// ---

// ### **2. Add multiple tracks at once**

// ```ts
// addManyToPlaylist(...)
// ```

// Useful when the user selects many tracks at once
// or tries to save an album into a playlist in one click.

// ---

// ### **3. Remove a track from a playlist**

// ```ts
// removeFromPlaylist(...)
// ```

// Used when a user presses “Remove” inside a playlist.

// ---

// ### **4. Move a track inside a playlist**

// ```ts
// reorderPlaylist(...)
// ```

// This is for drag-and-drop reordering inside the playlist screen.

// ---

// ### **5. Create a new playlist**

// ```ts
// createPlaylist(...)
// ```

// For when the user taps “New playlist”.

// ---

// ### **6. Delete a playlist**

// ```ts
// deletePlaylist(...)
// ```

// Used when the user taps delete.

// ---

// ### **7. Rename or update a playlist**

// ```ts
// updatePlaylist(...)
// ```

// Used when user edits playlist details
// (rename, reorder, replace track list, etc).

// ---

// # **Why devs write code like this**

// Because music player apps have to:

// * manage user-created playlists
// * sync playlist changes to the server
// * keep track of playlist order
// * update instantly in the UI
// * stay consistent across mobile, desktop, and server

// This code acts as a **bridge** between the app and the Jellyfin server.

// It makes playlist actions easy to call from anywhere:

// ```ts
// addToPlaylist(api, user, track, playlist)
// ```

// Instead of repeating the same Axios code everywhere
// (setting headers, user id, playlist id, track ids, error handling…).

// ---

// # **What this code CAN support in a real music player**

// Even though the code is simple, it forms the foundation for powerful features:

// ### **1. User-created playlist system**

// (Like Spotify’s user library)

// ### **2. Multi-select add-to-playlist**

// (Add an entire album or multiple tracks)

// ### **3. Drag-and-drop playlist reordering**

// ### **4. Collaborative playlist support**

// (This will work when Jellyfin supports it)

// ### **5. Offline-first playlist management**

// You can later wrap these actions in background queues.

// ### **6. Smart playlists**

// Generated or recommended playlists.

// ### **7. Syncing playlists across devices**

// ### **8. Playlist sharing (future)**

// ---

// # **Why devs like this structure**

// Because it is:

// ### **1. Reusable**

// Every action is one simple function.

// ### **2. Predictable**

// Every playlist action uses the same `Api` client.

// ### **3. Easy to wrap in React Query**

// You can do:

// ```ts
// const mutation = useMutation(addToPlaylist);
// ```

// ### **4. Easy to test**

// Because each action is isolated.

// ### **5. Easy to replace**

// If you stop using Jellyfin SDK and move to Axios,
// you only rewrite these small functions.

// ---

// # **In short**

// This file is a **playlist micro-service for your app**.

// It handles everything related to playlist actions:

// ✔ add
// ✔ remove
// ✔ reorder
// ✔ create
// ✔ delete
// ✔ update

// All using the Jellyfin SDK.

// ---

// If you want, I can rewrite this entire file using **the hybrid Axios + domain services pattern** so it stops depending on Jellyfin's SDK. Just say the word.
