# feat-0014: Share links from API / sermon metadata

## Summary

Replace hardcoded share URLs (`https://app.troott.com/track/{id}`) with **authoritative links** from the API (`sermon.shareableUrl`, shareable-link resolve, or deep-link contract).

Extends [feat-0008](../feat-0008/PRODUCT.md) (share UI). Complements [`specs/api/deep-links.md`](../../../api/deep-links.md).

## Problem

`openShareFlow` + root `_layout.tsx` build URLs client-side. `useShareSermon` does not call the server. Recipients may get wrong domains, unsigned paths, or slug fallbacks when `track.id` is missing.

## Goals

1. Share sheet copy / native share / Instagram use a **stable URL** from sermon document or share API.
2. Incoming links use `GET /api/v1/share/resolve?token=&resourceId=` (already on client).
3. Outgoing shares prefer `shareableUrl` on sermon when present.
4. Fallback only when API field absent (dev / legacy rows).

## Non-goals

- Building marketing landing pages.
- Web share widgets.
- Subscription-gated sharing.

## Consumer

Signed-in listeners sharing sermons from card, player, or share overlay.

## Behavior

1. User opens share from sermon row or player → `openShareFlow({ id, title, minister, artwork })`.
2. Before copy/native share, resolve URL:
   - **Primary:** `shareableUrl` from sermon DTO (if loaded).
   - **Secondary:** fetch `GET /sermon/:id` for `shareableUrl` when id known and URL missing.
   - **Fallback:** configured app base + `/sermon/:id` (env `EXPO_PUBLIC_APP_WEB_BASE`).
3. **Copy** puts resolved URL on clipboard.
4. **Native / Instagram** use resolved URL in message body.
5. **Deep link open** (existing): app handles `troott://share/open?token=…` via `useResolveShareLinkQuery`.
6. Invalid / expired token → error screen + sign-in if needed (deep-links spec).

## Acceptance criteria

1. Share URL for a published sermon matches API `shareableUrl` when field exists.
2. No slug-from-title URL when valid sermon id is available.
3. `feat-0008` TECH updated; matrix `sermon.share` lists API dependency.
4. Offline: last cached sermon detail URL or graceful fallback message.

## Related docs

- [`TECH.md`](./TECH.md)
- [feat-0008 TECH](../feat-0008/TECH.md)
