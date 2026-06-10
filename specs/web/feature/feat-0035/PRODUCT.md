# feat-0035: `/get-troott` smart redirect (app host)

## Summary

Server-side redirect handler at **`https://app.troott.com/get-troott`** — paired with [website feat-0003](../../../website/feature/feat-0003/PRODUCT.md) (`GetTroottButton` on `troott.com`).

Warp reference: [get_warp?package=dmg](https://app.warp.dev/get_warp?package=dmg).

## Problem

Marketing CTAs link to **`get-troott?package=…`**. Without a handler on **`apps/web`**, users hit the SPA shell or 404. Store URLs must not be duplicated in the website codebase.

## Behavior

1. Accept `GET /get-troott?package={android|ios|web|dmg|exe}`.
2. Return **`302 Location`** to the configured target (see [TECH](./TECH.md)).
3. If `package` omitted, infer from `User-Agent` (same rules as website client).
4. Never return **404** — fall back to web app URL.

## Non-goals

- Desktop `.dmg` / `.exe` binaries (v1 redirects to web until installer URLs are set).
- Marketing site duplicate route on `troott.com`.

## Related

- Website: [feat-0003 PRODUCT](../../../website/feature/feat-0003/PRODUCT.md)
- Mobile package: `com.troott.app`
