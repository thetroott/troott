# feat-0017: Topic browse screen (sermon API)

## Summary

Load **`/search/topic/[slug]`** from **`GET /api/v1/sermon/topic/:topic`** instead of filtering the discovery home catalog client-side.

Extends [feat-0006](../feat-0006/PRODUCT.md) (search & discover).

## Problem

`app/(tabs)/search/topic/[slug].tsx` uses `useDiscoveryHomeRails()` + client-side `matchesTopic()` and optional catalog search. `api.sermon.getSermonsByTopic` exists but has **no hook** and is **not called**.

## Goals

1. Primary data source: **sermon topic API** keyed by slug/label.
2. Faster, correct topic pages when home catalog is stale or incomplete.
3. Keep supplementary rails (playlists, ministers) from search/discovery where appropriate.
4. Pull-to-refresh refetches topic endpoint.

## Non-goals

- Topic CRUD or admin taxonomy.
- Replacing browse topic grid labels (`constants/browse-topics.ts` can stay for display names).

## Consumer

Signed-in listeners browsing topic tiles from Search landing.

## Behavior

1. User taps topic tile → `/search/topic/{slug}`.
2. Resolve display label via `getBrowseTopicLabel(slug)`.
3. Fetch sermons: `GET /sermon/topic/{topic}` with topic = slug or label (align with API expectation — see TECH).
4. Show loading skeleton, then sermon list (reuse `TopicMostStreamedSection`, `NewSermon`, etc.).
5. **Empty:** “No sermons for this topic” + search CTA.
6. **Error:** inline retry; optional fallback to catalog search (P1 degraded mode).
7. Play row → engine queue (unchanged).

## Resolved decisions

| Topic | Decision |
| ----- | -------- |
| Topic API key | Pass **`getBrowseTopicLabel(slug)`** as `:topic` param first. API matches sermon `topic` field exactly (`findByTopic`). If empty, retry with raw **slug**. Document mapping in seed/upload — labels align with `constants/browse-topics.ts`. |
| Dedicated topic metadata API | **Not needed P0.** Title/subtitle from browse-topics; hero is static tile art. |
| Topic stats / most streamed | **Client-side P0:** sort topic sermon list by `playCount` / `streamCount` if present on DTO; no separate stats endpoint. |
| Fallback on topic API failure | **P1:** degraded mode → `useCatalogSearchQuery(topicLabel)` (current behavior). P0: inline retry only. |

## Per-screen recommendations

Route: `/search/topic/[slug]` → `app/(tabs)/search/topic/[slug].tsx`

| Section | P0 | P1 | Data source |
| ------- | -- | -- | ----------- |
| Page title | Label from `getBrowseTopicLabel(slug)` | — | Local constants |
| **New Releases on {topic}** | Sermons from `GET /sermon/topic/:topic` (first 6) | — | Topic API |
| **TopicMostStreamedSection** | Same list sorted by play/stream count desc (slice 4–12) | Dedicated stats API if added later | Topic API + client sort |
| **Trending {topic} Series** | Unchanged | Series search by topic label | Discovery / `GET /search/series` — **not in P0 scope** |
| **Playlists** (`PlayList`) | Unchanged | `useCatalogSearchQuery` or discovery playlists | Search/discovery — **P1** |
| **Top Ministers on {topic}** (`SimilarMinisters`) | Unchanged | Ministers from search filtered by topic | Discovery — **P1** |
| **SearchRecentlyPlayedSection** | Local until feat-0015 history API | `GET /listener/listening-history` filtered by topic | feat-0015 P1 |
| Error / empty | Retry topic API; empty CTA to search | Fallback catalog search | |
| Pull-to-refresh | Refetch topic query only | Also refetch discovery supplements | |

**P0 scope is narrow:** only the **main sermon-driven sections** switch to `GET /sermon/topic/:topic`. Playlist and minister sections stay on discovery/search until P1.

## Acceptance criteria

1. Topic page network tab shows `/sermon/topic/` not only `/discovery/home`.
2. Sermons shown belong to topic per API (not full home catalog filter).
3. Slug `faith` (example) returns consistent results after refresh.
4. feat-0006 TECH references this feat for topic route.

## Related docs

- [`TECH.md`](./TECH.md)
