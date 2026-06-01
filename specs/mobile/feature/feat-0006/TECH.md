# feat-0006: Tech Spec — Search and discover

## Context

See [`PRODUCT.md`](./PRODUCT.md).

### React context (feat-0011)

Search uses **TanStack** for results and **Context** only for signed-in identity / gating. Do not add search rows to context reducers.

| Concern | Path |
| ------- | ---- |
| Slice contract | [`feat-0011/TECH.md`](../feat-0011/TECH.md) |
| State ownership | [`feat-0010/TECH.md`](../feat-0010/TECH.md) |
| Aggregator hook | `context/apps/app.context.tsx` — `useContextType().userContext` |
| Offline gate | `lib/state/network-store.ts` — `useNetworkStatus` |

### Routes

| Screen | Path |
| ------ | ---- |
| Search landing | `app/(tabs)/search/index.tsx` |
| Query | `app/(tabs)/search/query.tsx` |
| Topic | `app/(tabs)/search/topic/[slug].tsx` |
| Layout | `app/(tabs)/search/_layout.tsx` |

### Hooks and utils

| Concern | Path |
| ------- | ---- |
| Search hook | `api/hooks/app/useSearch.ts` |
| Catalog local merge | `engine/utils/catalog-local-search.ts` |
| Cache policy | `api/config/cache-policy.ts` |
| Analytics | `components/features/search/search.analytics.ts` |

### UI

| Component | Path |
| --------- | ---- |
| Query bar / trigger | `components/features/search/search-query-bar-trigger.tsx` |
| Results | `search-catalog-results.tsx`, `search-catalog-entity-row.tsx` |
| Sermon row | `components/features/search/sermon-card.tsx` |
| Sections | `search-recently-played-section.tsx`, `topic-most-streamed-section.tsx` |

### PRODUCT mapping

| Behaviors | Implementation |
| --------- | -------------- |
| 1–3 | `index.tsx`, `query.tsx`, `useSearch` |
| 4 | `useNetworkStatus` from `lib/state/network-store.ts` |
| 5–8 | Results list components + `sermon-card` |
| 6 | `topic/[slug].tsx` |
| 9 | `search.analytics.ts` |
