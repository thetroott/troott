# Action-level acceptance criteria and test cases

Per plan **5.1**: expected UI, navigation, state, API, analytics — plus **happy**, **backend error**, **offline**, **retry / idempotency**.

Analytics column uses proposed names from `mobile-action-analytics.md` (wire when product enables).

---

## `search.open_query` / `search.recent_chip`

| Criteria | Expected |
|----------|----------|
| UI | Landing shows trigger field + chips when history non-empty |
| Navigation | `/search/query` or same with `q` param |
| State | Query state initializes from `q` |
| API | None until committed search length met |
| Analytics | `search.screen_view` (optional) |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy | Tap field | Query screen opens |
| Happy | Tap chip | Query prefilled, results may load |
| Offline | Open query | Cached prefix / stale data per React Query |

---

## `search.committed` / catalog results

| Criteria | Expected |
|----------|----------|
| UI | Loader / results / empty |
| Navigation | Row tap starts playback |
| API | GET `/search?q=&scope=all` |
| Analytics | `search.committed`, `search.results` (optional) |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy | Type >= min length, wait commit | 200 sermons/ministers |
| Backend error | Mock 500 | Error surfaced; retry refetch |
| Offline | Airplane after cache empty | Error or empty + messaging |

---

## `sermon.play_row`

| Criteria | Expected |
|----------|----------|
| UI | Mini player appears |
| State | Queue store + RNTP updated |
| API | Optional thin-queue hydration (`QueueMutationDTO.api`) |
| Analytics | `sermon.play` |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy | Tap row | Playback starts |
| Unplayable URIs | Mock unresolved URL | Engine warns; no crash |

---

## `sermon.save_playlist`

| Criteria | Expected |
|----------|----------|
| UI | Confirmation bar or portal toast |
| API | PATCH `/playlists/:id/add` |
| State | Query invalidate playlists |
| Analytics | `playlist.sermon_add_success` / `_failure` |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy | Pick playlist | 200, confirmation |
| Duplicate | Same sermon + playlist | 400, error toast, no duplicate confirm |
| Offline | PATCH fails | Error toast; retry opens sheet again |
| Idempotency | User taps twice quickly | Second request may 400 duplicate — acceptable |

---

## `sermon.like` / favorites

| Criteria | Expected |
|----------|----------|
| UI | Heart filled/outline consistent |
| State | MMKV `favorite-sermon-ids` |
| API | None (current) |
| Analytics | `sermon.like_toggle` |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy | Toggle | Persisted across restart |
| Multi-surface | Mini + full + sheet | Same sermon id same state |

---

## `sermon.queue_next` / `sermon.queue_end`

| Criteria | Expected |
|----------|----------|
| UI | Success toast |
| State | RNTP queue |
| Analytics | `queue.add_next` / `queue.add_end` (optional) |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy | Menu actions | Items inserted at correct index |
| Empty player | Add with no active queue | Engine handles per `playLaterInQueue` |

---

## `sermon.share` / share sheet

| Criteria | Expected |
|----------|----------|
| UI | Listener sheet then OS share or clipboard toast |
| Navigation | Dismiss returns to prior screen |
| Analytics | `share.open`, `share.copy`, `share.instagram_sheet`, `share.native` |

| Suite | Steps | Expect |
|-------|-------|--------|
| Happy copy | Copy | Clipboard has troott URL |
| Happy IG | Instagram row | `Share.share` invoked |

---

## `player.queue_add_browse`

| Criteria | Expected |
|----------|----------|
| Navigation | `/search/query` |
| UI | Queue sheet closes |

---

## `sermon.download`

| Criteria | Expected |
|----------|----------|
| UI | Info toast (until pipeline exists) |
| Status | **frontend blocked** |

---

## Automated tests (recommended)

| Target | Type | Notes |
|--------|------|-------|
| `mapPlaylistDocsToChooseItems` | Unit | Array + `{ items }` + id/title extraction |
| `useAddSermonToPlaylistMutation` | Integration | Mock axios PATCH |
| Search query param hydration | Component | `useLocalSearchParams` + initial state |

---

## Manual matrix

Use `mobile-validation-matrix.md` for iOS/Android checkboxes per slice.
