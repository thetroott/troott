# feat-0014: Tech Spec — Share links from API

## Context

See [`PRODUCT.md`](./PRODUCT.md).

## API endpoints

| Method | Path | Use |
| ------ | ---- | --- |
| GET | `/api/v1/share/resolve` | Inbound deep link (`token`, optional `resourceId`) |
| GET | `/api/v1/sermon/:id` | Read `shareableUrl` on sermon (`Protect`) |

Sermon field: `shareableUrl` on [`ISermonDoc`](../../../../apps/api/src/interfaces/core/sermon.interface.ts).

## Current vs target

| Area | Today | Target |
| ---- | ----- | ------ |
| `app/_layout.tsx` `buildShareUrl` | Hardcoded `app.troott.com/track/…` | `resolveShareUrl(track)` helper |
| `useShareSermon` | Local `troott://sermon/` only | Optional fetch sermon + return `shareableUrl` |
| Inbound | `useResolveShareLinkQuery` exists | Wire deep link handler if not already |

## Implementation

### 1. `resolveShareUrl` helper

New: `apps/mobile/api/hooks/app/useShare.ts` or `engine/utils/share-url.ts`

```ts
async function resolveShareUrl(input: {
  sermonId?: string | null;
  shareableUrl?: string | null;
}): Promise<string>
```

Order: `input.shareableUrl` → `api.sermon.getSermonById` → env fallback.

### 2. Root layout

File: `apps/mobile/app/_layout.tsx`

- `buildShareUrl` becomes async or prefetches on `openShareFlow`.
- Show loading on copy if fetch in flight (rare).

### 3. Pass `shareableUrl` into share flow

When opening share from `SermonCard` / player, include `shareableUrl` from catalog row if mapper exposes it (`catalog-map.ts`, `sermonDocToCatalogRow`).

### 4. Env

```env
EXPO_PUBLIC_APP_WEB_BASE=https://app.troott.com
```

### 5. Inbound (verify)

Route: universal link / app scheme → parse token → `useResolveShareLinkQuery` → navigate to sermon.

## Files

| File | Change |
| ---- | ------ |
| `app/_layout.tsx` | Use resolved URL |
| `api/hooks/app/useShare.ts` | `useResolveShareUrlMutation` or query |
| `lib/state/share-flow.ts` | Optional `shareableUrl` on `ShareTrack` type |
| `components/features/share/share-types.ts` | Extend `ShareTrack` |
| `engine/utils/catalog-map.ts` | Map `shareableUrl` |

## Tests

| Test | Notes |
| ---- | ----- |
| Prefers DTO `shareableUrl` | Unit |
| Fetches by id when missing | Mock `api.sermon` |
| Fallback when 404 | Unit |

## Checklist

- [ ] Helper + env fallback
- [ ] Layout handlers use helper
- [ ] Catalog/play payloads include `shareableUrl`
- [ ] Update feat-0008 + action matrix
- [ ] Document inbound resolve in deep-links if gap found
