# feat-0017: Tech Spec — Topic browse API

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API contract

| Method | Path | Auth |
| ------ | ---- | ---- |
| GET | `/api/v1/sermon/topic/:topic` | Public |

Client: `apps/mobile/api/clients/sermon.ts` → `getSermonsByTopic(topic, params)`.

Verify API topic param: sermon `topic` field stores **display label** (e.g. `Healing`), not slug — repository uses `{ topic }` exact match (`sermon.repository.ts` `findByTopic`).

**Production key:**

```ts
const topicKey = getBrowseTopicLabel(slugStr) || slugStr;
useSermonsByTopicQuery(topicKey);
```

If API returns empty but slug matches seeded topic document, retry once with slug (telemetry to fix upload taxonomy).

## New hook

File: `apps/mobile/api/hooks/app/useSermon.ts`

```ts
export function useSermonsByTopicQuery(topic: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.sermon.topic(topic),
    queryFn: async () => {
      const res = await api.sermon.getSermonsByTopic(topic);
      if (res.error) throw new Error(res.message);
      return normalizeSermonList(res.data);
    },
    enabled: enabled && topic.length > 0,
  });
}
```

Add `queryKeys.sermon.topic(topic)`.

## Screen refactor

File: `apps/mobile/app/(tabs)/search/topic/[slug].tsx`

| Today | Target |
| ----- | ------ |
| `useDiscoveryHomeRails` + filter | `useSermonsByTopicQuery(slugOrLabel)` |
| `useCatalogSearchQuery(topicLabel)` as supplement | Optional P1 fallback only |

Map response with `mapSermonDocsToItems` from `engine/utils/library-map.ts`.

## Secondary sections (per-screen)

| Section | P0 implementation | P1 |
| ------- | ----------------- | -- |
| `NewSermon` / new releases | `allDtos.slice(0, 6)` from topic query | — |
| `TopicMostStreamedSection` | Sort topic rows by `playCount` desc, slice | API sort param if added |
| `PlayList` | Keep `useDiscoveryHomeRails` playlists | Topic-scoped playlist search |
| `SimilarMinisters` | Keep discovery ministers | `searchMinisters({ q: topicLabel })` |
| `SearchRecentlyPlayedSection` | Local MMKV | Listening history API (feat-0015) |

P0: **remove** `useDiscoveryHomeRails` + `matchesTopic` for sermon list; keep for P1 sections until replaced.

## Params

```ts
const topicKey = getBrowseTopicLabel(slugStr) || slugStr;
```

## Degraded fallback (P1)

```ts
const topicQuery = useSermonsByTopicQuery(topicKey);
const fallbackSearch = useCatalogSearchQuery(topicLabel, topicQuery.isError);
const rows = topicQuery.data?.length ? topicQuery.data : fallbackSearch.data?.sermons;
```

## Tests

| Test | Type |
| ---- | ---- |
| Hook calls correct path | Unit mock axios |
| Screen renders API items | Component |

## Checklist

- [ ] `useSermonsByTopicQuery` + query key
- [ ] Refactor `[slug].tsx` primary fetch
- [ ] Remove client-only `matchesTopic` filter for main list
- [ ] Update `mobile-route-action-trace.md` topic row
- [ ] Confirm topic param = browse **label** (documented above)
- [ ] P1: catalog search fallback on topic API error
- [ ] P1: wire PlayList + SimilarMinisters to search APIs
