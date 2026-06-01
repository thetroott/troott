# Deep links and stable sharing (API and clients)

This document is the **canonical contract** for Troott listener sharing and universal links. It complements [`mobile-flow.md`](./mobile-flow.md) (UX) with paths, auth behavior, and when to use **stable URLs** vs **token** links.

## Canonical URL rules

- **Scheme:** `https` only for universal links.
- **Host:** Use the same host configured as `CLIENT_APP_URL` (or a dedicated marketing host that redirects consistently). Avoid mixing `www` and apex; pick one and redirect the other.
- **Path style (primary):**
    - Sermon: **`/sermon/{idOrSlug}`** (matches Expo Router in `apps/mobile/app/sermon/[id].tsx`).
    - Playlist: **`/playlist/{id}`** (matches `apps/mobile/app/playlist/[id].tsx`).
    - Minister: **`/minister/{idOrSlug}`** (matches `apps/mobile/app/minister/[id].tsx`).
- **Trailing slash:** Omit trailing slashes on share URLs (single canonical form).
- **Optional query:** `?t=` seconds for seek position (reserved; clients may ignore until supported).
- **Optional analytics:** `utm_source=share` (and related UTM params); servers should **preserve** them when redirecting.

## Primary vs secondary share mechanisms

| Mechanism                                            | When to use                                                                                                       | Typical lifetime                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Stable URL** (`https://…/sermon/{id}`)             | Default “Copy link”, OS share sheet, email, push deep links to catalog content                                    | Permanent while resource exists and visibility allows |
| **Token link** (`GET /api/v1/share/resolve?token=…`) | Campaigns, partner windows, revocable access without changing resource id, optional **non-public** playlist share | Short TTL; see shareable-link service                 |

## Auth, onboarding, and access matrix

Per [feat-0004](./feature/feat-0004/PRODUCT.md): **no public sermon teasers**. Full sermon detail requires a signed-in user.

| User state               | Stable link opened in app                                                           | Full sermon API (`GET /api/v1/sermon/:id`)       |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| Signed out               | App stores **pending** target; show Sign in / Sign up                               | **401** — not callable without Bearer            |
| Signed in, not onboarded | Product policy A or B (document in mobile-flow): block Home vs allow one-off listen | **200** when entitled per sermon-access rules    |
| Signed in, onboarded     | `router` to `/sermon/[id]`                                                          | **200** full document when public or entitled    |

**Note:** [`mobile-flow.md`](./mobile-flow.md) requires no guest **account**; unsigned users must sign in before sermon detail loads.

## Universal Links and App Links (hosting)

Place on the **HTTPS origin users tap** (not the API origin unless they are the same):

1. **Apple:** `/.well-known/apple-app-site-association` (JSON, no extension). Paths must match the app’s associated domains and entitlements.
2. **Android:** `/.well-known/assetlinks.json` with package name `com.troott.app` (see `apps/mobile/app.json`) and signing cert SHA-256.

Example templates live in [`apps/mobile/docs/universal-link-host-files.md`](../apps/mobile/docs/universal-link-host-files.md) (copy to your web server).

**Fallback when app is not installed:** Redirect to web sermon page (requires sign-in), App Store / Play, or marketing landing—choose per product and document the default here once decided.

## API surfaces

| Route                         | Purpose                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `GET /api/v1/sermon/:id`      | Full sermon by Mongo id or **slug**; **`Protect`** — Bearer required                                         |
| `GET /api/v1/share/resolve`   | Token-based resolve + optional `resourceId` for legacy links                                                 |

**Removed:** `GET /api/v1/open/sermon/:id` — no public teaser endpoint (feat-0004).

## Paywall and region (future)

When subscription or geo rules apply, stable links should still **resolve identity**; response may be **403** after sign-in with upsell metadata, documented per product in this matrix once billing ships.

## Revocation and caching

When a sermon becomes private or deleted: `GET /api/v1/sermon/:id` returns **404** (or **410**). Set `private, no-store` on authenticated responses; purge or TTL-invalidate CDN and Open Graph when titles or artwork change.

## Rollout feature flag

- **`STABLE_SHARE_LINKS_PRIMARY`** (optional env on **clients** or CMS): When `true` (default), “Copy link” should emit **stable** `https://…/sermon/{id}` URLs. When `false`, token-first UI may be used during transition (document in release notes). Server behavior does not depend on this variable today.

## Cross-references

- UX: [`mobile-flow.md`](./mobile-flow.md) §3 (deep link — shared sermon).
- Auth: [`feature/feat-0004/PRODUCT.md`](./feature/feat-0004/PRODUCT.md) (token-only JWT, no teasers).
- Home tab context: [`specs/mobile/00 - home.md`](../mobile/00%20-%20home.md).
- Shareable token module: [`shareable-link/README.md`](../../apps/api/src/modules/platform/shareable-link/README.md).

## Web and native route parity

The mobile app uses Expo Router segments `app/sermon/[id].tsx`, `app/playlist/[id].tsx`, and `app/minister/[id].tsx`. Expo web (`web.output: static`) should expose the **same path shapes** so one copied `https` link works in the browser and in the native app. When the app is not installed, the link host should serve a matching marketing or web player page (or redirect to store), as configured on that host.

## Audit: `GET /api/v1/sermon/:id` (full document)

- **Middleware:** **`Protect`** — Bearer required; silent reissue via `X-New-Token` in last 5 hours of JWT lifetime (feat-0004).
- **Visibility:** Signed-in callers see catalog-public or entitled sermons per `sermon-access.util.ts`. Non-entitled or non-catalog responses return **404** (`sermon not found`) where appropriate.
- **Caching:** `private, no-store` for authenticated sermon detail.

## Paywall and subscription (stable links)

Billing fields are not enforced on sermon documents yet. When subscriptions or region locks ship, extend this matrix: signed-out users remain blocked until sign-in; signed-in without entitlement may see **403** or upsell payloads on `GET /api/v1/sermon/:id` while stable paths and pending deep link targets stay the same.

## Revocation, CDN, and Open Graph

Prefer **404** (or **410** when explicitly removed) for private or deleted catalog content on `GET /api/v1/sermon/:id`. Use short cache TTLs on any public marketing pages; plan CDN purge or low `max-age` when titles or artwork change so social previews do not lie.

## Observability

The API logs structured lines with label **`deep_link_open`** for:

- `surface: share_resolve` — outcomes `ok` or `error` (includes HTTP `code`).

Forward these logs to your aggregation stack to compare stable opens vs token resolves.

## Rollout and release notes

Document client env **`STABLE_SHARE_LINKS_PRIMARY`** (see above) in mobile/web release notes when toggling “Copy link” behavior. Coordinate email templates and CMS share buttons in the same release window.

## Open Graph and share analytics (optional)

Stable sermon pages on the marketing or web shell should expose `og:title`, `og:description`, and `og:image` consistent with product visibility (never leak private media URLs). Incrementing `totalShares` or a dedicated “opened from share” event remains a product choice once analytics contracts exist.

## Automated tests

Jest covers URL parsing (`parse-stable-target` contract) and sermon access rules (`canAccessSermonDocument`). Add integration/E2E tests when a harness exists for cold-start universal links and post-auth resume.

## Call site inventory: `generateShareableLink`

As of this document, the implementation lives in `shareable-link.service.ts`; there are **no other package call sites** in this monorepo (search for the symbol before adding new callers). Prefer stable URLs from `attachAppUrl` for default sharing.
