# feat-0019: Tech Spec — Minister and series pickers

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API endpoints

| Method | Path | Client method |
| ------ | ---- | ------------- |
| GET | `/api/v1/search/ministers` | `api.search.searchMinisters({ q, limit })` |
| GET | `/api/v1/search/series` | `api.search.searchSeries({ q, limit })` |

Already used elsewhere:

- `useOnboardingMinistersQuery` → `searchMinisters` (`useListenerOnboarding.ts`)
- Pattern to reuse for picker search.

## New hooks

File: `apps/mobile/api/hooks/app/useSearch.ts` (or `usePickerSearch.ts`)

```ts
export function useMinisterPickerSearchQuery(q: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.search.ministers(q),
    queryFn: () => api.search.searchMinisters({ q, limit: 20 }),
    enabled: enabled && q.trim().length >= 2,
  });
}

export function useSeriesPickerSearchQuery(q: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.search.series(q),
    queryFn: () => api.search.searchSeries({ q, limit: 20 }),
    enabled: enabled && q.trim().length >= 2,
  });
}
```

## Component upgrades

### Minister picker

File: `components/features/pickers/minister-picker.tsx`

Add props:

```ts
selectedIds?: string[];
onSelectionChange?: (ids: string[]) => void;
// keep onPrimaryPress — parent saves
```

Internal:

- Controlled search input state
- `FlatList` of minister rows from hook
- Checkbox or highlight for selected

### Series picker

File: `components/features/pickers/series-picker.tsx`

Same pattern with series DTO mapping.

## DTO mapping

| Entity | Mapper |
| ------ | ------ |
| Minister | `ministerDocToRow` or search result shape from `useSearch` |
| Series | Add `mapSeriesSearchRow` if missing in `engine/utils/library-map.ts` |

## Parents (wire — P0)

| Parent | File | Action on primary |
| ------ | ---- | ----------------- |
| Pick ministers modal | `app/(pickers)/pick-ministers.tsx` | `useOnboardMinistersMutation({ ministers: selectedIds })` then `router.back()` |
| Choose series modal | `app/(pickers)/choose-series.tsx` | Persist series ids (listener onboard or `PUT /library` series items) — remove fake 900ms timeout |
| Onboarding (optional) | feat-0002 screens | Keep dedicated flows; share picker UI only |

Grep for `<MinisterPicker` / `<SeriesPicker` when adding parents.

## Empty browse (P1)

When `q.trim().length < 2`:

- Ministers: `useOnboardingMinistersQuery()` or `searchMinisters({ q: '', limit: 20 })` if API allows.
- Series: `searchSeries({ q: '', limit: 20 })` or hide list with helper text “Type to search”.

P0: require **q ≥ 2** (matches search API validation elsewhere).

## Pagination (P1)

```ts
useInfiniteQuery({
  queryKey: queryKeys.search.ministers(q),
  queryFn: ({ pageParam = 1 }) =>
    api.search.searchMinisters({ q, limit: 20, page: pageParam }),
  getNextPageParam: (last) => last.meta?.hasNext ? last.meta.page + 1 : undefined,
});
```

## UX

| State | UI |
| ----- | -- |
| Loading | `ActivityIndicator` (series picker already has `loading` prop — use real query) |
| Error | Text + retry |
| minSelection not met | Disable primary button |

## Tests

| Test | Type |
| ---- | ---- |
| Debounced search fires API | Hook unit |
| Selection count enables primary | Component |

## Checklist

- [ ] Search hooks for ministers + series
- [ ] Picker list UI + selection state
- [ ] Wire `pick-ministers.tsx` + `choose-series.tsx` parents (P0)
- [ ] P1: empty browse + infinite scroll
- [ ] Remove “Wire when ready” comments
- [ ] Update feat-0002 TECH if onboarding adopts picker
