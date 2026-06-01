# feat-0016: Tech Spec — Minister profile API

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API endpoints (available today)

| Method | Path | Auth | Purpose |
| ------ | ---- | ---- | ------- |
| GET | `/api/v1/sermon/minister/:id/most-played` | Public | Top sermons |
| GET | `/api/v1/sermon/minister/:id/most-liked` | Public | **P0** — liked rail |
| GET | `/api/v1/sermon/minister/:id/most-shared` | Public | **P1** — shared rail |
| GET | `/api/v1/sermon/minister/:id/recently-published` | Public | Latest |
| GET | `/api/v1/search/ministers` | Public | Search/list ministers (`q`, pagination) |

## API gap (minister metadata)

Mobile client: `api.minister.getMinisterById(id)` → `GET /api/v1/minister/:id`

**API today:** no public `GET /minister/:id` route (`minister.router.ts` only `GET /` for current minister).

### Options

| Option | Owner | Work |
| ------ | ----- | ---- |
| **A (preferred)** | API | Add `GET /minister/:id` public read DTO (name, bio, avatar, church, slug) |
| **B** | Mobile only | Pass minister object via router params from search row; profile fetches sermons only |
| **C** | Mobile | Use discovery/search minister embed when navigating from home |

Spec assumes **A + mobile wire**; ship **B** as interim if API delayed.

## Mobile hooks to wire

| Hook | File |
| ---- | ---- |
| `useMinisterByIdQuery(id)` | `api/hooks/app/useMinister.ts` |
| `useSermonsByMinisterQuery(id)` | `api/hooks/app/useSermon.ts` |

Add:

| Hook | Purpose |
| ---- | ------- |
| `useMinisterSermonsRails(id)` | Parallel: most-played + most-liked + recently-published |
| `useMinisterMostSharedQuery(id)` | P1 optional rail |

## Minister stats formatting

```ts
// Pseudocode — apps/mobile/lib/format-audience.ts
export function formatMonthlyListeners(n?: number | null): string | null {
  if (n == null || n <= 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M monthly audience`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K monthly audience`;
  return `${n} monthly listeners`;
}
```

Source field: `IMinisterDoc.monthlyListeners` (`apps/api/src/interfaces/core/minister.interface.ts`).

## Component changes

| File | Change |
| ---- | ------ |
| `components/features/minister/profile.tsx` | Remove `MINISTERS`, `_mock/tracks`; use hooks |
| `app/minister/[id].tsx` | Pass id; error boundary |
| `components/features/minister/about-section.tsx` | Bio from API; follow → feat-0019 or library |
| `components/features/minister/top-sermons.tsx` | `useMinisterSermonsRails` → most-played |
| `components/features/minister/latest-release.tsx` | recently-published query |
| (new) most-liked section | `GET .../most-liked` — P0 if layout includes rail |

## Follow button (P0 with feat-0013 pattern)

Use existing mappers:

- `sermonDocToCatalogRow` / `catalogRowToSermonItem`
- Minister DTO from `api/dtos/minister.dto.ts`

## Navigation

Ensure `sermon.view_minister` passes **Mongo id or stable slug** from search results (`resolveMinisterIdFromLabel` cleanup).

Until library minister upsert ships: disable follow or show loading.

## Mapping

| Test | Type |
| ---- | ---- |
| Profile renders API minister name | Integration mock |
| Empty sermons 404 | Component |
| No mock import in profile | Lint/grep CI |

## Checklist

- [ ] API: `GET /minister/:id` (if option A)
- [ ] Wire `useMinisterByIdQuery` + `useSermonsByMinisterQuery`
- [ ] Remove static MINISTERS + mock tracks
- [ ] Loading/error UI
- [ ] Wire most-played + most-liked + recently-published rails
- [ ] Audience label from `monthlyListeners` only
- [ ] Follow minister via library PUT
- [ ] P1: most-shared rail + SimilarMinisters from discovery
