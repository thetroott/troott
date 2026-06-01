# feat-0018: Tech Spec — Sermon by ID hydration

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API contract

| Method | Path | Auth |
| ------ | ---- | ---- |
| GET | `/api/v1/sermon/:id` | **`Protect`** |

Fix client: `apps/mobile/api/clients/sermon.ts` — change `getSermonById` to `isAuth: true`.

## Hook (exists)

`useSermonByIdQuery(id)` in `api/hooks/app/useSermon.ts` — wire to UI.

Optional helper:

```ts
export function useSermonDetail(id: string | undefined) {
  const q = useSermonByIdQuery(id ?? '', !!id);
  const item = useMemo(() => q.data ? mapSermonDocToItem(q.data) : null, [q.data]);
  return { ...q, sermon: item, track: item ? mapDtoToTrack(item) : null };
}
```

Place mapper in hook file or `engine/utils/mappers.ts` (existing patterns).

## Files to update

| File | Change |
| ---- | ------ |
| `components/features/player/full-player/full-player-screen.tsx` | `useSermonByIdQuery(routeSermonId)` when id present |
| `app/sermon/[id].tsx` | Fetch by id; pass to player |
| `engine/playback/use-play-from-catalog-list.ts` | Optional: enrich row with by-id fetch if URL missing |
| `api/clients/sermon.ts` | `isAuth: true` on getById |

## Playback URL resolution

Order (match web/mobile engine):

1. `playbackUrl`
2. `manifestUrl`
3. `item.item` (ingest)

Use `resolveDtoPlaybackUrl` in `engine/utils/mappers.ts`.

## Deep link / share

When inbound link resolves to sermon id (feat-0014), navigate to `/sermon/[id]` which uses this feat.

## Caching

```ts
queryKey: queryKeys.sermon.detail(id)
staleTime: 5 * 60_000
```

Prefetch on sermon card long-press (P2).

## Tests

| Test | Type |
| ---- | ---- |
| Mapper produces playable URL from API doc | Unit |
| Full player calls getById when catalog miss | Component mock |

## Checklist

- [ ] Fix `isAuth` on sermon client getById
- [ ] Wire full player + sermon route
- [ ] Remove catalog-only hydration path for explicit id
- [ ] 404/403 UI
- [ ] Query key in `query-keys.ts`
