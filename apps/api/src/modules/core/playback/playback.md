Playback & Player
audio streaming engine
buffering, caching
play, pause, queue, repeat, shuffle
background play

Why: Most logic is client-side; server only tracks session state if you have multi-device sync.
Backend layers:
Controller ✅ (optional) – endpoints for session creation, queue sync
Service ✅ – queue logic, cross-device sync, event publishing
Model ❌ – mostly ephemeral (Redis or in-memory for session state), not persistent DB

Heavy in logic, low in persistent data.

Most playback logic is client-side:
Maintaining queue
Shuffle, repeat
Progress updates
Server only steps in for:
Multi-device sync
Persisting “currently playing” state
Real-time analytics

So:

Controller optional because:
If your backend is event-driven or uses WebSocket, you don’t need REST endpoints for every playback action.
The client can directly push events (e.g., queue update) to a message broker.
Only certain actions (like syncing across devices) need an actual endpoint.
Service required because:
Business logic like merging queues, resolving conflicts, syncing state.
Model optional / minimal:
Usually ephemeral storage (Redis, in-memory)
Not persistent DB like catalog or payments