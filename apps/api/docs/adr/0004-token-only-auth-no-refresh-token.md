# ADR 0004: Token-only auth (no refresh token, silent reissue via header)

## Status

Accepted — spec [`specs/api/feature/feat-0004`](../../../specs/api/feature/feat-0004/PRODUCT.md)

## Context

Listener mobile shipped a `context/session/` layer (hydrator, `refreshSession`, cold-start user/listener sync) alongside JWT storage. The API already issues **30-day** JWTs and can reissue them when near expiry via **`Protect`** middleware and the **`X-New-Token`** response header. Troott does **not** use OAuth2-style refresh tokens for email/password auth.

## Decision

1. **Single Bearer JWT** per user session; no refresh token in API or client storage.
2. **Silent reissue** on protected requests when the JWT is within **5 hours** of `exp`; clients persist **`X-New-Token`** when present.
3. **`POST /auth/token`** remains optional for explicit refresh; **mobile must not** depend on it.
4. **Remove** mobile `context/session/` and cold-start session sync; use stored token + login/lazy profile fetch.
5. **Remove `optionalAuth` middleware** — **`Protect` only** for authenticated routes; public routes have no auth middleware.
6. **Remove public sermon teasers** — delete `GET /open/sermon/:id`; sermon detail requires **`Protect`** on API and web.

## Consequences

- Simpler mobile cold start (no blocking hydrator).
- HTTP client must read `X-New-Token` on every authenticated response.
- Unsigned users never receive sermon preview payloads; deep links require sign-in first.
- Fix inverted reissue predicate in `token.service.ts` / `checkAuth.mdw.ts` before relying on header reissue in production (see feat-0004 TECH).
- Update mobile context specs (feat-0011) to three slices: user, auth, app.
- **`tokenVersion` bumps** must be implemented on password reset/change (currently missing in code).

## References

- [`specs/api/feature/feat-0004/PRODUCT.md`](../../../specs/api/feature/feat-0004/PRODUCT.md)
- [`specs/api/feature/feat-0004/TECH.md`](../../../specs/api/feature/feat-0004/TECH.md)
- `apps/api/src/middlewares/checkAuth.mdw.ts`
- `apps/api/src/services/token.service.ts`
