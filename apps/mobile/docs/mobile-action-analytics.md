# Analytics contract per high-impact action

Defines **event names** and **payload schemas** (JSON-shaped) for implementation behind a single analytics adapter (e.g. Segment, PostHog). Do not fire duplicate events on sheet mount — only on **user-confirmed** outcomes.

## Common envelope (all events)

Apply at transport layer:

```json
{
  "event": "string",
  "timestamp_ms": "number",
  "app_version": "string",
  "platform": "ios | android",
  "session_id": "string (optional)"
}
```

## Schema conventions

- Required fields listed explicitly; omit optional keys when unknown.
- IDs are strings; never log raw JWT or PII beyond stable user id if policy allows.
- `source_screen` uses route file id e.g. `(tabs)/search/query`.

---

## Search

### `search.committed`

Emitted when debounced committed search term is persisted or used for API fetch.

```json
{
  "event": "search.committed",
  "canonical_query_length": "number",
  "filter_chip": "Sermon | Minister | Playlist | string",
  "source_screen": "string"
}
```

### `search.results_loaded`

```json
{
  "event": "search.results_loaded",
  "sermon_count": "number",
  "minister_count": "number",
  "had_error": "boolean",
  "source_screen": "string"
}
```

---

## Sermon playback

### `sermon.play`

```json
{
  "event": "sermon.play",
  "sermon_id": "string",
  "queue_ref": "Search | Library | string",
  "source_screen": "string"
}
```

### `sermon.like_toggle`

```json
{
  "event": "sermon.like_toggle",
  "sermon_id": "string",
  "is_favorite": "boolean",
  "source_control": "mini_player | full_player | sermon_sheet | string"
}
```

---

## Queue

### `queue.add_next`

```json
{
  "event": "queue.add_next",
  "sermon_id": "string",
  "source_screen": "string"
}
```

### `queue.add_end`

```json
{
  "event": "queue.add_end",
  "sermon_id": "string",
  "source_screen": "string"
}
```

### `queue.open_browse`

```json
{
  "event": "queue.open_browse",
  "from": "playback_queue_sheet"
}
```

---

## Playlist

### `playlist.sermon_add_success`

```json
{
  "event": "playlist.sermon_add_success",
  "playlist_id": "string",
  "sermon_id": "string",
  "playlist_item_type": "string"
}
```

### `playlist.sermon_add_failure`

```json
{
  "event": "playlist.sermon_add_failure",
  "playlist_id": "string",
  "sermon_id": "string",
  "reason_code": "duplicate | type_mismatch | network | unknown",
  "reason_message_sanitized": "string (optional, truncated)"
}
```

---

## Share

### `share.open`

```json
{
  "event": "share.open",
  "sermon_id": "string | null",
  "title_present": "boolean"
}
```

### `share.copy`

```json
{
  "event": "share.copy",
  "sermon_id": "string | null",
  "url_length": "number"
}
```

### `share.instagram_sheet`

```json
{
  "event": "share.instagram_sheet",
  "sermon_id": "string | null"
}
```

### `share.native`

```json
{
  "event": "share.native",
  "sermon_id": "string | null"
}
```

---

## Implementation checklist

- [ ] Single `trackMobileEvent(name, payload)` helper validates required keys.
- [ ] Map `reason_message_sanitized` from API errors (strip tokens, cap length).
- [ ] Debounce duplicate `sermon.play` for same id within 2s if needed.
