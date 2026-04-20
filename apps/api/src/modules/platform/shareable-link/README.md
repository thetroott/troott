# Shareable link (token-based)

## When to use this module

Use **`generateShareableLink`** / **`GET /api/v1/share/resolve`** only when you need:

- **Time-bound** access (default expiration in `ShareableLinkService`).
- **Revocation** without changing the underlying sermon/playlist id.
- **Campaign or partner** links.
- Optional **non-public** resource access where a stable public URL would leak existence or content (e.g. private playlist sharing, if productized).

## Primary sharing (default)

Listener “Copy link” and universal links should use **stable paths** documented in repository file `specs/api/deep-links.md`, for example:

- `https://{CLIENT_HOST}/sermon/{idOrSlug}`
- `GET /api/v1/open/sermon/:id` for a **public teaser** (rate limited).

## Call sites

Search the monorepo for `generateShareableLink` when adding new flows; keep call count small and intentional.

**Inventory:** The generator is defined on `ShareableLinkService`; a repo-wide search should only hit that definition plus this README unless a new feature intentionally calls it. Token resolve traffic is observable via logs labeled `deep_link_open` / `surface: share_resolve` (see `specs/api/deep-links.md`).

## Resolve behavior

- **Token + `tokenLookupHash`:** token-only resolve for links created after hashing was added.
- **Legacy:** `?token=&resourceId=` still supported for older rows without `tokenLookupHash`.

Hydration for resolve includes **sermon**, **playlist**, **minister**, **series**, and **library** document types where repositories exist; other `ShareableLinkType` values return `resource: null` until implemented.
