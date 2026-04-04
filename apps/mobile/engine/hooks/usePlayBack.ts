












// This code is the **analytics / reporting layer** of a music player.
// It is responsible for telling your backend **what the user is doing with audio**.

// In a real app (Spotify, Apple Music, YouTube Music), this is critical for:

// * playback history
// * recommendations
// * recently played
// * user progress
// * resume playback
// * reporting skips
// * reporting completion
// * syncing between devices

// Let’s break it down in simple terms.

// ---

// # **1. What this code *does***

// It reports **three main events**:

// ### **A. Playback started**

// `useReportPlaybackStarted`
// Called when:

// * user hits play
// * or a new track in the queue starts

// It sends to your backend:

// * which track started
// * the time it started
// * the device

// Useful for:

// * showing “Now playing” in user dashboard
// * analytics ("this song was played 500 times")
// * syncing with other devices
// * supporting cross-device casting

// ---

// ### **B. Playback stopped or completed**

// `useReportPlaybackStopped`

// It checks:

// ```ts
// isPlaybackFinished(lastPosition, duration)
// ```

// If yes → playback completed
// If no → playback stopped

// It then reports:

// * **completed track** → user played it fully
// * **stopped track** → user paused, skipped or closed the app

// Useful for:

// * recently played ordering
// * incrementing play counts
// * understanding skip behavior
// * recommendations

// Example:
// If user only listened to 20 percent of a song, backend should not count it as a completed play.

// ---

// ### **C. Playback progress**

// `useReportPlaybackProgress`

// Called every few seconds (commonly 5-10s).

// Reports:

// * track id
// * current position

// Useful for:

// * **resume playback on next app launch**
// * syncing position across devices
// * saving audiobook or podcast progress
// * detecting when to preload next track
// * analytics

// Example:
// Spotify remembers the exact second you left a long podcast.

// ---

// # **2. What this code *can do* in a music player**

// If you want a real-world music app, these events allow you to build:

// ---

// ## **A. Recently Played**

// Backend can store:

// * last played track
// * last played position

// This drives the “Continue listening” section.

// ---

// ## **B. Recommendations**

// Tracks with:

// * high completion rate
// * low skip rate

// get recommended more.

// ---

// ## **C. Sync playback across devices**

// If user logs in on another phone or web:

// * show the same song
// * same position
// * same playback state

// ---

// ## **D. Offline analytics batching**

// These events can be queued and sent later.

// ---

// ## **E. Avoid double counting plays**

// Reporting *started* and *completed* separately avoids inflating stream count.

// ---

// ## **F. Behaviour analysis**

// Example:

// * which songs users skip
// * where they stop listening
// * which genres are finished fully
// * top artists
// * favorite tracks per month

// ---

// ## **G. Artist royalties / stats (if needed)**

// If your platform needs to track streams for artist dashboards.

// ---

// # **3. Why devs write it this way**

// Using React Query mutations gives:

// ### **1. Retry on failure**

// If network drops, React Query can retry sending the event.

// ### **2. Cached API instance**

// `useApi()` returns your Axios client so all events use correct headers.

// ### **3. Debug logs for each event**

// Makes diagnosing playback easier.

// ### **4. Clean separation of concerns**

// * Player only plays audio
// * Reporting layer only reports events

// This keeps your player clean and makes the reporting system testable.

// ---

// # **4. Summary (simple)**

// This system tells your backend:

// * when a song starts
// * how far the user has listened
// * when it stops
// * whether the user finished it or skipped it

// This is **core** to building a modern streaming app.

// ---

// If you want, I can show you how to **integrate this with React Native Track Player events** properly so it auto-reports without manual calling.
