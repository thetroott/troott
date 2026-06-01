# feat-0004: Tech Spec — Token-only authentication

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation spans **`apps/api`** (authoritative) and **`apps/mobile`** (client obligations).

---

## API: token model

| Field | Location | Purpose |
| ----- | -------- | ------- |
| JWT payload | `id`, `email`, `role`, `tokenVersion` | Identity + revocation |
| `user.accessToken` | Mongo `User` | Must match presented JWT (single active token per user for email/password flow) |
| `JWT_EXPIRY` | env (e.g. `30d`) | Passed to `jwt.sign` `expiresIn` |
| `JWT_SECRET` | env | HS512 signing |

Issue paths: [`apps/api/src/services/token.service.ts`](../../../../apps/api/src/services/token.service.ts) `attachToken`, login/activate controllers.

Revoke paths: `detachToken` on logout; increment `tokenVersion` on password change / admin lock (existing patterns).

**There is no refresh-token collection, cookie session, or Redis auth session.**

---

## API: auth middleware (Protect only)

**Single middleware:** [`Protect`](../../../../apps/api/src/middlewares/checkAuth.mdw.ts) in `checkAuth.mdw.ts`.

| Pattern | Middleware | When |
| ------- | ---------- | ---- |
| **Protected route** | `Protect` | Caller must send valid `Authorization: Bearer <jwt>`; errors on missing/invalid/expired token; may set `X-New-Token` |
| **Public route** | *(none)* | Catalog, search, marketing reads; `getAuthUserId(req)` returns `''` |

**Removed:** [`optionalAuth.mdw.ts`](../../../../apps/api/src/middlewares/optionalAuth.mdw.ts) — do not attach a second middleware that silently sets `req.user`. If a handler needs identity, the route uses **`Protect`**. If a route is public, it stays public without parsing Bearer in middleware.

### Route migrations (feat-0004)

| Route | Before | After |
| ----- | ------ | ----- |
| `POST /auth/logout` | `optionalAuth` | **`Protect`** — server invalidates token when Bearer present |
| `GET /sermon/:id` | `optionalAuth` | **`Protect`** — no anonymous/teaser access; signed-in only |
| `GET /open/sermon/:id` | public teaser | **Removed** — delete route, controller handler, client |

**Minister preview** of unpublished sermons: **`Protect`** on minister/studio routes (`canAccessSermonDocument` minister-owner rule), not a public GET.

**Client logout:** call `POST /auth/logout` **with Bearer** (`logoutUser`) before or while clearing local storage so the server runs `detachToken`. Clearing local storage alone is sufficient for UX; server revoke requires `Protect`.

---

## API: remove public teasers

**Goal:** no unauthenticated sermon preview on API or web. Aligns with no-guest-account product rule.

### Delete (API)

| Item | Path |
| ---- | ---- |
| Open router handler | `apps/api/src/routes/open.router.ts` — remove `/sermon/:id` or delete router if empty |
| Controller | `apps/api/src/controllers/open.controller.ts` — `getPublicSermonTeaser` |
| Teaser util | `apps/api/src/utils/sermon-teaser.util.ts` |
| Rate limiter | `apps/api/src/middlewares/open-teaser.ratelimit.mdw.ts` |
| Unit tests | `apps/api/test/unit/core/sermon-teaser.util.test.ts` |
| v1 mount + limiter | `apps/api/src/routes/v1/routes.router.ts` — drop `openRoutes` teaser mount / `openSermonTeaserLimiter` |

### Change (API)

| Item | Change |
| ---- | ------ |
| `GET /sermon/:id` | Add **`Protect`**; remove `isSermonPublicTeaserEligible` / `teaserEligible` cache branching for anonymous |
| `canAccessSermonDocument` | Drop teaser short-circuit; access = minister owner **or** published listener entitlement (existing product rules) |
| `sermon.controller` `getSermonById` | Cache key always scoped to authenticated viewer (`user:{id}`); `Cache-Control: private, no-store` |

### Delete (web)

| Item | Path |
| ---- | ---- |
| Open API client method | `apps/web/src/api/clients/open.ts` — `getPublicSermonTeaser` (or entire client if unused) |
| Path constant usage | `apps/web/src/api/core/paths.ts` — `URL_OPEN_SERMON` |
| Public route | `apps/web/src/routes/paths.ts` — `PATH_OPEN_SERMON`; `app.route.tsx` open sermon route |
| Share copy URL | `apps/web/src/components/shared/my-sermons/SermonsTable.tsx` — use in-app/studio sermon URL or shareable link, not `/open/sermon/` |

### Delete (mobile)

| Item | Path |
| ---- | ---- |
| Open client | `apps/mobile/api/clients/open.ts` — teaser call |
| Path | `apps/mobile/api/config/path.ts` — `URL_OPEN_SERMON` if unused |

### Deep links after teaser removal

| State | Behavior |
| ----- | -------- |
| Signed out, opens `/sermon/:id` | Persist **pending target**; show login/register; **no** teaser API call |
| Signed in | `GET /sermon/:id` with **`Protect`** → full document when entitled |

Update [`specs/api/deep-links.md`](../deep-links.md) to remove teaser matrix and `GET /open/sermon/:id` rows.

---

## API: silent reissue on protected routes

**File:** [`apps/api/src/middlewares/checkAuth.mdw.ts`](../../../../apps/api/src/middlewares/checkAuth.mdw.ts)

**Target behavior (after fix):**

```
1. Parse Authorization: Bearer <token>
2. jwt.verify → 403 if TokenExpiredError, 401 if invalid
3. Load user; compare tokenVersion
4. If shouldReissue(token):
     newToken = tokenService.issue(user)   // same payload rules as attachToken
     persist user.accessToken
     res.setHeader('X-New-Token', newToken)
5. req.user = { id, email, role }; next()
```

**Reissue predicate (replace `checkTokenValidity` name and logic):**

```ts
function shouldReissueToken(token: string): boolean {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  if (!decoded?.exp) return false;
  const msUntilExp = decoded.exp * 1000 - Date.now();
  const REISSUE_WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours
  return msUntilExp > 0 && msUntilExp <= REISSUE_WINDOW_MS;
}
```

**Do not** hardcode `30 * 24h` in the predicate — use **`exp` from the presented JWT** so `JWT_EXPIRY` changes stay correct.

### Known bug (current code)

[`token.service.ts`](../../../../apps/api/src/services/token.service.ts) `checkTokenValidity` uses a fixed 30-day threshold **and** [`checkAuth.mdw.ts`](../../../../apps/api/src/middlewares/checkAuth.mdw.ts) calls `if (!tokenService.checkTokenValidity(token))` before refresh — which **inverts** the intended window (fresh tokens match refresh today; near-expiry tokens may not). **feat-0004 implementation must fix** rename + condition before mobile relies on `X-New-Token`.

[`refreshToken`](../../../../apps/api/src/services/token.service.ts) service method uses the same inverted check — align with `shouldReissueToken`.

---

## API: explicit reissue endpoint (optional)

| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| `POST` | `/api/v1/auth/token` | Bearer (body/header) | [`refreshToken`](../../../../apps/api/src/controllers/auth.controller.ts) |

Router: [`apps/api/src/routes/auth.router.ts`](../../../../apps/api/src/routes/auth.router.ts)

**Response (200):**

```json
{
  "error": false,
  "message": { "message": "Token refreshed successfully" },
  "data": { "token": "<jwt>" }
}
```

**Mobile:** **do not call** in production flows. Prefer **`X-New-Token`** on any `Protect` route.

**Web:** **deprecated** for production; dev-only manual call allowed. Implement **`X-New-Token`** in axios interceptor (see [Web client](#web-client) below).

**Router change:** wrap `POST /auth/token` with **`Protect`** (same as logout).

---

## API: response header contract

| Header | When | Client action |
| ------ | ---- | ------------- |
| `X-New-Token` | Reissue on this response | Replace stored Bearer JWT before next request |
| (none) | Token still outside reissue window | Keep current JWT |

**CORS:** ensure `X-New-Token` is exposed if browser clients read it:

```
Access-Control-Expose-Headers: X-New-Token
```

(Verify in [`apps/api/src/middlewares/headers.mdw.ts`](../../../../apps/api/src/middlewares/headers.mdw.ts) or CORS config.)

---

## API: error envelopes

| Condition | HTTP | Message (typical) |
| --------- | ---- | ----------------- |
| Missing Bearer | 401 | No token provided |
| Invalid signature | 401 | Invalid token |
| Expired JWT | 403 | Token has expired |
| `tokenVersion` mismatch | 401 | Token revoked |
| User not found | 401 | Invalid or expired token |

Clients clear local credentials on **401** and **403** from authenticated calls (except `skipAuth` public routes).

---

## API: login / activate payloads

Existing controllers return Troott envelope with:

```ts
data: {
  token: string;
  user: IUserMapped; // id, email, userType, onboard, ...
}
```

Mobile **`persistSession`** stores token + maps user into context — **sufficient for first paint**; full profile may lazy-load via `GET /user` / `GET /listener` when a screen needs fresh data (onboarding POST success, profile tab open).

**Remove requirement** for cold-start parallel `getCurrentUser` + `getCurrentListener` before showing tabs.

---

## Policy decisions (implementation detail)

See [`PRODUCT.md` — Policy decisions](./PRODUCT.md#policy-decisions-authoritative). Expanded notes for engineers:

### `JWT_EXPIRY`

- Set `JWT_EXPIRY=30d` in `apps/api/example.env` and deployment env.
- [`token.service.ts`](../../../../apps/api/src/services/token.service.ts) constructor already throws if unset — document only allowed forms: `30d`, `7d`, etc. (jsonwebtoken `expiresIn` strings).
- Reissue window stays **5 hours before `exp`** — computed from decoded JWT, not from env string parsing.

### `POST /auth/token`

```ts
authRouter.post('/token', Protect, refreshToken);
```

Mark `@deprecated` in controller JSDoc for external API docs. Response unchanged.

### Social auth token lifecycle

1. Passport callback → find/create user → **`tokenService.attachToken(user)`**.
2. Redirect to client with **same `{ token, user }` shape** as email login (query or fragment per existing web/mobile handoff).
3. **Do not** persist Google/GitHub/Apple `refreshToken` on `User`.

### `tokenVersion` bump rules

| Event | Action |
| ----- | ------ |
| `changePassword` success | `$inc: { tokenVersion: 1 }`, `detachToken` |
| `resetPassword` success | `$inc: { tokenVersion: 1 }`, `detachToken` |
| Admin lock / security revoke | `$inc: { tokenVersion: 1 }`, `detachToken` |
| Logout | `detachToken` only — **no** version bump |
| Silent reissue (`X-New-Token`) | New JWT, same `tokenVersion`, update `accessToken` |

**Gap today:** `tokenVersion` is never incremented in codebase — **implement** on password flows as part of feat-0004.

### Multi-tab / multi-device

- `attachToken` → `User.findByIdAndUpdate(..., { accessToken: token })` overwrites prior token.
- [`refreshToken`](../../../../apps/api/src/services/token.service.ts) rejects when `user.accessToken !== accessToken`.
- Product copy: signing in elsewhere signs out the previous device on next API call.

### `accessTokenExpiry`

On `attachToken` and reissue:

```ts
const decoded = jwt.decode(token) as jwt.JwtPayload;
await User.findByIdAndUpdate(user.id, {
  accessToken: token,
  accessTokenExpiry: decoded?.exp ? new Date(decoded.exp * 1000) : undefined,
});
```

Clients **must not** use this field for refresh timing.

### Web client

**File:** [`apps/web/src/api/core/axios.tsx`](../../../../apps/web/src/api/core/axios.tsx) (or response interceptor module)

1. After each authenticated response, if `headers['x-new-token']` → persist to token storage.
2. On 401/403 from authenticated request → clear token → redirect `PATH_LOGIN`.
3. No `/auth/token` polling.
4. Remove [`open.ts`](../../../../apps/web/src/api/clients/open.ts) teaser usage and `/open/sermon` route.

### Mobile error copy

| HTTP | When | Toast |
| ---- | ---- | ----- |
| 401 | Invalid, revoked, missing token on protected call | `Sign in again.` |
| 403 | `TokenExpiredError` / expired JWT | `Your sign-in expired. Please sign in again.` |

Implement in [`http-client.ts`](../../../../apps/mobile/api/http-client.ts) `emitSessionInvalid` messages and [`AuthSessionRouting`](../../../../apps/mobile/context/AuthSessionRouting.tsx) fallback.

### `AuthSessionRouting` location

```
apps/mobile/context/AuthSessionRouting.tsx   # moved from context/session/
```

Update imports in `providers.tsx`, delete `context/session/` entirely.

### `syncSessionToContext` → query invalidation

**Remove** export from [`useUser.ts`](../../../../apps/mobile/api/hooks/app/useUser.ts) and [`context/index.ts`](../../../../apps/mobile/context/index.ts).

**Replace** in [`useListenerOnboarding.ts`](../../../../apps/mobile/api/hooks/app/useListenerOnboarding.ts):

```ts
await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
await queryClient.invalidateQueries({ queryKey: queryKeys.listener.me() });
// optional: useCurrentUserQuery refetch if context fields stale
```

Keep inline user mapping in `useCurrentUserQuery` / `persistSession` only.

### Testing harness

| Layer | Scope | Blocking? |
| ----- | ----- | --------- |
| Jest unit | `shouldReissueToken`, tokenVersion bump helpers | Yes |
| Jest unit | Remove `sermon-teaser.util` tests with file | Yes |
| Supertest | `Protect` + `X-New-Token`, `GET /sermon/:id` returns 401 without Bearer | Yes |
| Supertest | `GET /open/sermon/:id` → **404** or route absent | Yes |
| Mobile manual | TECH checklist § Mobile manual | Yes |
| Detox / E2E | Pending deep link after login | No (defer) |

---

## Mobile: HTTP client changes

**File:** [`apps/mobile/api/http-client.ts`](../../../../apps/mobile/api/http-client.ts)

### Add — persist reissued token

After `fetch` resolves (success path, before JSON parse):

```ts
const newToken = response.headers.get('X-New-Token');
if (newToken?.trim()) {
  await storeToken({ token: newToken.trim() });
}
```

Apply in `processResponse` or immediately after `retryRequest` returns `Response`.

### Remove / change

| Current | Target |
| ------- | ------ |
| `handleAuthError`: if 401 && `isTokenExpired()` → clear + emit | On 401/403 auth failure → clear + emit (do not pre-clear based on local JWT clock) |
| `SESSION_INVALID_EVENT` naming | Keep event; message “Sign in again” (not “refresh token”) |
| `URL_GET_TOKEN` usage in mobile | Remove client method if unused |

**File:** [`apps/mobile/api/services/mmkv-storage.tsx`](../../../../apps/mobile/api/services/mmkv-storage.tsx)

- Keep `storeToken` / `getToken` / `clearTokens`.
- `isTokenExpired()` may remain for **UI hints only**; must **not** trigger logout before the server responds.

---

## Mobile: delete session layer

**Remove directory:** `apps/mobile/context/session/`

| File | Action |
| ---- | ------ |
| `sessionState.tsx` | Delete |
| `sessionContext.tsx` | Delete |
| `SessionHydrator.tsx` | Delete |
| `AuthSessionRouting.tsx` | **Move** to `context/AuthSessionRouting.tsx`; drop `isHydratingSession` gate |
| `types.ts` | Delete |

**Update:** [`apps/mobile/context/providers.tsx`](../../../../apps/mobile/context/providers.tsx)

```tsx
// Before: UserState → AuthState → AppState → SessionState → SessionHydrator → AuthSessionRouting
// After:  UserState → AuthState → AppState → AuthSessionRouting
```

**Update:** [`apps/mobile/context/index.ts`](../../../../apps/mobile/context/index.ts) — remove `useSession`, `SessionHydrator`, `syncSessionToContext` exports.

**Update:** [`apps/mobile/api/hooks/app/useUser.ts`](../../../../apps/mobile/api/hooks/app/useUser.ts)

- Remove exported `syncSessionToContext` **or** rename to internal helper used only by `useCurrentUserQuery` / profile mutations (not cold start).
- [`useListenerOnboarding.ts`](../../../../apps/mobile/api/hooks/app/useListenerOnboarding.ts): after onboarding POST, invalidate `queryKeys.users.me()` / `listener.me()` instead of full session sync if context already has user id.

**Update:** [`useLibrary.ts`](../../../../apps/mobile/api/hooks/app/useLibrary.ts) `useLibrarySessionEnabled`

- Gate on `getToken()` + `storage.getUserId()` **or** `userContext.user?.id` — not `isHydratingSession`.

---

## Mobile: auth routing (minimal)

[`AuthSessionRouting`](../../../../apps/mobile/context/AuthSessionRouting.tsx) responsibilities to **keep**:

1. Listen for `troott:session-invalid` → clear storage → `/login`
2. Deep link pending target capture
3. If token + user in context on auth entry routes → `navigatePostAuth`

Responsibilities to **drop**:

1. Waiting for `isHydratingSession === false` before routing
2. Any call to `refreshSession`

---

## Testing

### API unit

- `shouldReissueToken`: true when `exp - now <= 5h`, false otherwise
- `Protect` sets `X-New-Token` inside window; omits outside
- Expired JWT → 403, no header
- `POST /auth/token` with `Protect` returns new JWT when in window
- `tokenVersion` increments on password reset/change (when implemented)

### API integration

- Login → call protected route with token near expiry (mock clock or short-lived test secret) → response includes `X-New-Token` → old token replaced in DB
- `GET /sermon/:id` without Bearer → **401**
- `GET /open/sermon/:id` → **404** or route not registered

### Mobile manual

1. Login → kill app → reopen → tabs load **without** network stall on launch hydrator
2. Simulate `X-New-Token` via proxy → confirm secure storage updates
3. Force 401 → toast **"Sign in again."** → `/login`, storage cleared
4. Force 403 expired → toast **"Your sign-in expired. Please sign in again."**
5. Stay logged in > reissue window with normal browsing → no logout
6. Signed-out deep link to sermon → login → pending target opens full sermon (no teaser call)

---

## Implementation checklist

| # | Task | Repo | Status |
| - | ---- | ---- | ------ |
| 1 | Fix `shouldReissueToken` + middleware + `refreshToken` service | `apps/api` | Done |
| 2 | Expose `X-New-Token` in CORS if needed | `apps/api` | Done |
| 3 | Delete `optionalAuth.mdw.ts`; migrate routes to `Protect` | `apps/api` | Done |
| 4 | **`Protect` on `GET /sermon/:id`; remove teaser util + `GET /open/sermon/:id`** | `apps/api` | Done |
| 5 | Set `accessTokenExpiry` on attach/reissue; implement `tokenVersion` bumps | `apps/api` | Done |
| 6 | `POST /auth/token` requires `Protect` | `apps/api` | Done |
| 7 | Remove web `/open/sermon` route + `open.getPublicSermonTeaser` | `apps/web` | Done |
| 8 | Handle `X-New-Token` in mobile `http-client.ts` | `apps/mobile` | Done |
| 9 | Move `AuthSessionRouting` to `context/`; remove `context/session/*` | `apps/mobile` | Done |
| 10 | Remove `syncSessionToContext`; use query invalidation | `apps/mobile` | Done |
| 11 | Remove mobile `open` teaser client | `apps/mobile` | Done |
| 12 | Update `deep-links.md`, feat-0011, feat-0010, web feat-0006 | `specs/` | Done |
| 13 | Web axios `X-New-Token` + 401/403 handling | `apps/web` | Done |

---

## File reference (API)

| Concern | Path |
| ------- | ---- |
| **Auth middleware (only)** | `apps/api/src/middlewares/checkAuth.mdw.ts` |
| Token issue/reissue | `apps/api/src/services/token.service.ts` |
| Teaser removal (delete) | `open.controller.ts`, `sermon-teaser.util.ts`, `open-teaser.ratelimit.mdw.ts`, `open.router.ts` |
| Explicit refresh route | `apps/api/src/controllers/auth.controller.ts`, `routes/auth.router.ts` |
| Web teaser removal | `apps/web/src/api/clients/open.ts`, `routes/app.route.tsx` |
| Unit tests | `apps/api/test/unit/services/token.service.test.ts` (extend for reissue window) |
