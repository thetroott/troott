# feat-0018: Sermon detail and full player by ID

## Summary

Hydrate **`/sermon/[id]`** and full player from **`GET /api/v1/sermon/:id`** instead of scanning the discovery home catalog.

Extends [feat-0004](../feat-0004/PRODUCT.md) (player UI).

## Problem

`full-player-screen.tsx` and related routes use `useSermonsCatalog()` (discovery home) to find the active track by id. `useSermonByIdQuery` exists but is **never used**. Deep links and share opens may fail when sermon is not on home rails.

## Goals

1. Route param `sermonId` → **`GET /sermon/:id`** (authenticated).
2. Full player shows title, minister, artwork, **playbackUrl** / **manifestUrl** from API.
3. Queue play still works when opened from lists; detail fetch supplements missing fields.
4. Align mobile client auth flag with API **`Protect`** on `GET /sermon/:id`.

## Non-goals

- Public teaser playback (feat-0004 API: signed-in only).
- Studio edit flows.

## Consumer

Signed-in listeners opening sermon route, share deep link, or full player without catalog context.

## Behavior

1. User lands on `/sermon/[id]` or full player with id param.
2. Fetch sermon by id; show skeleton until loaded.
3. **404 / 403:** message + navigate back or to search.
4. Map document to `SermonItemDTO` + RNTP track (`mapDtoToTrack`).
5. Prefer **HLS** `playbackUrl` / `manifestUrl`; fallback `item.item` (raw ingest) per API pipeline doc.
6. If id already in RNTP queue, merge API metadata without restarting playback.
7. Session expired → auth gate (feat-0001).

## Acceptance criteria

1. Sermon not on home discovery still plays when opened by direct id URL.
2. Network shows `GET /sermon/:id` on full player open.
3. Mobile sermon client uses `isAuth: true` for getById.
4. No reliance on `_mock/tracks` for player hydration.

## Related docs

- [`TECH.md`](./TECH.md)
- [`apps/api/docs/audio-pipeline-flow.md`](../../../../apps/api/docs/audio-pipeline-flow.md)
