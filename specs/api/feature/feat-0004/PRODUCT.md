# feat-0004: Token-only authentication (no refresh token, no client session layer)

## Summary

Troott uses a **single Bearer JWT** per signed-in user. Tokens are issued on **login** and **account activation**, live for **~30 days** (`JWT_EXPIRY`), and are **silently re-issued by the API** when they are close to expiry. Clients **do not** maintain a refresh token, a session object, or a background refresh scheduler.

This spec is the **authoritative API contract** for auth persistence. It supersedes mobile patterns that mimic a web “session hydrator” (`context/session/`, `refreshSession`, `syncSessionToContext` on cold start).

Complements [`specs/mobile/feature/feat-0001`](../mobile/feature/feat-0001/PRODUCT.md) (auth UX), [`specs/mobile/feature/feat-0011`](../mobile/feature/feat-0011/PRODUCT.md) (context slices — **session slice to be removed**), and [`specs/api/mobile-flow.md`](../mobile-flow.md) (listener journey).

---

## Problem

Mobile currently ships a **session subsystem** (`SessionState`, `SessionHydrator`, `refreshSession`, cold-start `syncSessionToContext`) that duplicates what the API already does:

- JWT is stored locally after login.
- **`Protect` middleware** can detect near-expiry tokens and return a replacement in **`X-New-Token`**.
- A separate **`POST /auth/token`** endpoint exists but is **not required** if clients honor the response header.

Maintaining both server-side silent reissue **and** client-side session refresh creates race conditions, extra cold-start latency, and confusion with OAuth refresh tokens (which Troott does **not** use for email/password auth).

---

## Goals

1. **One credential:** `Authorization: Bearer <jwt>` on protected routes.
2. **Long-lived access:** default lifetime **30 days** from issue (env-driven).
3. **Silent rolling reissue:** server replaces the JWT before hard expiry; client persists the new value when told.
4. **No refresh token** in API responses, storage, or mobile/web client models.
5. **No mobile session layer:** remove `apps/mobile/context/session/` and cold-start session sync; rely on stored JWT + on-demand user fetch.
6. **One auth middleware only:** [`Protect`](../../../../apps/api/src/middlewares/checkAuth.mdw.ts) (`checkAuth.mdw.ts`). **No `optionalAuth`.**

---

## Non-goals

- OAuth provider refresh tokens (Google/GitHub/Apple) — handled by Passport strategies only during social login handoff; not exposed to mobile as a Troott refresh token.
- Server-side “playback session” documents (`PlaybackSession`) — unrelated to auth; unchanged.
- Short-lived access + opaque refresh token pairs (OAuth2-style) — out of scope.
- Biometric “session” UX copy on mobile — may still say “sign in”; does not imply a separate server session resource.
- **`optionalAuth` middleware** — removed; do not reintroduce “maybe authenticated” route wrappers.
- **Public sermon teasers** — no unauthenticated sermon preview anywhere (API `GET /open/sermon/:id`, web `/open/sermon/*`, teaser payloads, or anonymous full-detail reads). Signed-in users only; unsigned deep links → sign-in → pending target.

---

## Public content policy (no teasers)

Troott has **no guest account** and **no public sermon teaser**. This applies to **API and web** (and mobile clients must not call teaser routes).

| Removed | Replacement |
| ------- | ----------- |
| `GET /api/v1/open/sermon/:id` | **Delete route** — no public teaser endpoint |
| Anonymous access to sermon detail via teaser eligibility on `GET /sermon/:id` | **`Protect`** on `GET /sermon/:id` — full detail only when signed in |
| Web route `/open/sermon/:sermonId` and `open.getPublicSermonTeaser` | **Delete** — share links land on sign-in or in-app `/sermon/:id` after auth |
| Teaser rate limiter, `sermon-teaser.util`, teaser cache keys | **Delete** with teaser routes |

**Deep links:** unsigned user opens `/sermon/{id}` → **Sign in / Sign up** with **pending target** stored locally → after login, open full sermon via authenticated API. No static preview before sign-in.

Supersedes teaser rows in [`specs/api/deep-links.md`](../deep-links.md) — update that doc in the same implementation pass.

---

## Actors

| Actor | Responsibility |
| ----- | -------------- |
| **API `Protect` middleware** | Verify JWT, reject revoked/expired tokens, **reissue when within reissue window**, set `X-New-Token` when reissued |
| **Public routes** | **No auth middleware** — anonymous access; `req.user` unset |
| **API `POST /auth/token`** | Optional explicit reissue for clients that want a proactive refresh (web tooling, diagnostics) |
| **Mobile / web HTTP client** | Attach Bearer token; **replace stored token** when `X-New-Token` is present; clear token on **401/403 auth failure** |
| **Mobile app shell** | Route guards based on **token presence** + **user profile in context** (from login payload or lazy `GET /user`), not `refreshSession()` |

---

## Token lifecycle (product)

| Event | Server | Client |
| ----- | ------ | ------ |
| Register | No JWT until activation | Store email draft only |
| Activate / Login | Returns `{ token, user }` (envelope) | Persist `token` (secure storage) + minimal user ids in MMKV |
| Authenticated API call | Validates JWT; may respond with `X-New-Token` | If header present → overwrite stored JWT |
| JWT hard-expired | `403` / `Token has expired` | Clear local auth; show login |
| Invalid / revoked JWT | `401` / `Token revoked` | Clear local auth; show login |
| Logout | Clears `user.accessToken` server-side | Clear local auth |

**Reissue window (target):** when remaining lifetime **≤ 5 hours**, the next successful **`Protect`** request returns a **new** JWT in `X-New-Token` with a **fresh 30-day** `exp`. Outside that window, no header is sent.

**Client must not** call `POST /auth/token` on a timer for mobile — ordinary traffic is enough.

---

## Mobile simplification (consumer requirements)

The listener app **must not** ship:

| Remove | Replace with |
| ------ | ------------- |
| `context/session/` (`SessionState`, `SessionHydrator`, `useSession`, `isHydratingSession`) | Nothing — delete folder |
| Cold-start `syncSessionToContext` / `refreshSession` | Lazy `useCurrentUserQuery` (or login `persistSession`) when UI needs profile |
| Client-side JWT expiry pre-clear before request (`isTokenExpired` → clear + emit) | Send existing token until server rejects; honor `X-New-Token` |
| Dedicated refresh-token storage | N/A |
| `POST /auth/token` from mobile hooks | N/A (header-driven reissue only) |

**Keep (minimal auth shell):**

- `AuthSessionRouting` (or equivalent) for **401 → login**, deep links, post-auth navigation — **without** session hydration state.
- `persistSession` in `useAuth` on login/activate.
- MMKV: `userId`, `userEmail`, `userType` for fast gating; secure storage: `token`.

---

## Success criteria

1. API documents and implements **header-based silent reissue** on `Protect` routes.
2. Mobile removes `context/session/` and passes typecheck without `useSession` / `SessionHydrator`.
3. Mobile HTTP layer persists **`X-New-Token`** automatically.
4. No mobile code path stores or sends a “refresh token”.
5. Logged-in users stay signed in across app restarts for the JWT lifetime without a session refresh mutation on launch.
6. **No public sermon teasers** on API or web; sermon detail requires authentication.

---

## Policy decisions (authoritative)

These close gaps previously left undefined. Implementers treat this table as source of truth unless a later ADR amends it.

| Topic | Decision |
| ----- | -------- |
| **`JWT_EXPIRY`** | Required env var; production value **`30d`**. Validated at API startup (missing → 500). Clients must not assume a fixed TTL except “long-lived (~30 days)”. |
| **`POST /auth/token`** | **Keep** for diagnostics; **require `Protect`** (same as logout). **Deprecated** for product clients — do not call from mobile; web may call manually in dev tools only. Production refresh = **`X-New-Token`** on any `Protect` response. |
| **Social auth (Google/GitHub/Apple)** | After OAuth callback, same as email login: **`attachToken`** → one Troott JWT in response redirect/body; **no** separate refresh token stored. Provider refresh tokens are discarded after handoff. |
| **`tokenVersion` bump** | Increment (invalidates all outstanding JWTs) on: **`changePassword`**, **`resetPassword`** (successful), **admin lock / force sign-out**, **account deactivation**. **Do not** bump on silent reissue or ordinary logout (`detachToken` only). **Implement** bumps where missing today. |
| **Multi-tab / multi-device** | **Single active JWT per user** (`user.accessToken` overwritten on each `attachToken`). New login/device replaces prior token; old Bearer fails on next `Protect` when DB token no longer matches. No concurrent refresh-token pairs. |
| **Web client** | Axios/fetch interceptor: read **`X-New-Token`** → update stored Bearer; on **401/403** from authenticated calls → clear storage → redirect login. No session hydrator; no `POST /auth/token` timer. Token in existing web storage pattern (see [`apps/web/docs/adr/0001-web-api-client.md`](../../../apps/web/docs/adr/0001-web-api-client.md)). |
| **Error copy (mobile)** | **401** (invalid/revoked/missing): toast **"Sign in again."** **403** (expired JWT): toast **"Your sign-in expired. Please sign in again."** Route to `/login`; clear local credentials. |
| **`AuthSessionRouting` location** | Move to **`apps/mobile/context/AuthSessionRouting.tsx`** (context root, not `context/session/`). Headless component; mount from `providers.tsx` after `AppState`. |
| **`syncSessionToContext`** | **Remove** exported helper and cold-start usage. After auth mutations (login, onboarding POST): **`queryClient.invalidateQueries`** for `users.me` / `listener.me` + update context from mutation payload where present. Explicit refresh: **`useCurrentUserQuery`** only when a screen needs it. |
| **Tests** | **Unit (Jest):** `shouldReissueToken`, `Protect` sets/skips `X-New-Token`. **Integration (supertest):** login → protected call in reissue window → header present + DB token updated. **Mobile manual:** checklist in TECH. **E2E (Detox/Appium):** deferred until harness exists; do not block feat-0004 on E2E. |
| **`accessTokenExpiry` (User model)** | Set in **`attachToken`** from JWT `exp` (Date). Used for **support/admin** and future ops only — **not** for client refresh timers. Silent reissue does not require client to read this field. |

---

## Related specs to update (follow-up PRs)

- [`specs/mobile/feature/feat-0011`](../mobile/feature/feat-0011/PRODUCT.md) — drop session slice
- [`specs/mobile/feature/feat-0010`](../mobile/feature/feat-0010/PRODUCT.md) — state ownership table
- [`specs/mobile/09 - context.md`](../mobile/09%20-%20context.md) — three slices only (user, auth, app)
- [`specs/api/deep-links.md`](../deep-links.md) — remove teaser matrix and `GET /open/sermon/:id`
- [`specs/web/feature/feat-0006`](../web/feature/feat-0006/TECH.md) — sermon detail auth = `Protect`, not `optionalAuth` or teaser
