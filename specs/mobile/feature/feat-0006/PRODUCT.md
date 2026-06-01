# feat-0006: Search and discover

## Summary

The **Search** tab lets listeners find sermons by query, browse topics, view recent searches, and act on results (play, queue, favorite, playlist, share). Requires signed-in session when API does. Complements [`07 - search.md`](../../07%20-%20search.md) and [`specs/api/search.md`](../../../api/search.md).

## Problem

Search spans landing tab, query stack, catalog merge, network gating, and shared `SermonCard` actions. Inconsistent empty/error handling confuses users.

## Non-goals

- Home rails (feat-0005).
- Minister studio management.

## Consumer

Signed-in listeners (default).

## Behavior

1. Landing: search trigger opens **query** stack (`/search/query`).
2. **Recent chips** prefill query; clear-all with confirmation.
3. Submit runs catalog search; skeleton then results or empty state.
4. **Offline** blocks or degrades play per network store.
5. Results support infinite scroll or pagination with end marker.
6. **Topic browse** (`/search/topic/[slug]`) uses same loading/error patterns.
7. Row actions: play, sheet actions (queue, favorite, playlist, share, minister).
8. No results: supportive copy + topic chips; clear filters when active.
9. Analytics events per `search.analytics.ts` where instrumented.

## Related docs

- [`TECH.md`](./TECH.md)
