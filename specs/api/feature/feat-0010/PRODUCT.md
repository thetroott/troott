# feat-0010: Minister `GET /minister` 403 (“only available for minister accounts”)

## Summary

A **minister** who is logged in, has progressed through onboarding, and opens **Profile** (or any surface that loads the minister studio profile) can receive:

```text
ErrorResponse: Minister profile is only available for minister accounts
statusCode: 403
  at minister.controller.ts:487
```

This is **not** because the user registered as the wrong account type. Upload and sermon jobs may still succeed in the same session. The failure is an **API auth stub vs controller guard mismatch**: the JWT middleware never attaches `userType` to `req.user`, but `getMinister` rejects the request when `user.userType !== minister`.

This spec explains why a real minister hits 403, how it differs from [feat-0009](../feat-0009/PRODUCT.md) (creator 404 noise), and what to change so profile and onboarding refresh work without new util modules.

---

## Reported scenario

| Step | What happens |
| ---- | ------------- |
| 1 | User registers / logs in as **minister** |
| 2 | Completes part of Get Started / onboarding (personal info, verification upload, sermon upload, etc.) |
| 3 | Opens **profile** (or profile refresh runs after publish / verification) |
| 4 | API logs **403** on `GET /api/v1/minister` with message above |
| 5 | Upload (`POST /sermon/start-upload`) may still work in parallel |

**Observed stack:** `checkAuth.mdw.ts:72` → `minister.controller.ts:487`.

---

## Problem

| Symptom | User impact |
| ------- | ----------- |
| Profile page empty or “Could not load profile” | Cannot view/edit avatar, banner, ministry details |
| `MinisterState` / `useProfileQuery` error | Onboarding refresh after upload may fail silently |
| Terminal `ERR` 403 during otherwise healthy session | Operators think account type is wrong |
| Sermon upload continues | Confusing — “I’m clearly a minister in the studio” |

---

## Why this is not “wrong userType in Mongo”

| Check | Minister user (expected) |
| ----- | ------------------------ |
| `users.userType` in Mongo | `minister` |
| Web cookie / `cookieService.getUserType()` | `minister` (gates `MinisterState`, profile hook) |
| `ministers` document for `user` id | Exists after registration |
| JWT valid | Yes — otherwise 401, not 403 |
| **`req.user.userType` inside `getMinister`** | **`minister`** when RC-1 fix deployed — was **`undefined`** before fix ([TECH.md](./TECH.md) RC-1) |

The 403 means “controller thinks you are not a minister,” not “you are not logged in” and not “minister row missing” (that would be 404 from the service after the guard).

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-M40301 | Minister after onboarding | `GET /minister` to return my profile when JWT is valid | Profile and verification preview work |
| UC-M40302 | Minister uploading a sermon | Profile refresh after publish without 403 | Studio state stays consistent |
| UC-M40303 | Operator reading logs | 403 on minister routes to mean wrong role or missing row — not missing JWT field | Logs match reality |
| UC-M40304 | Engineer | Fix without new `utils/*` facades | Behavior lives in middleware or service, per project convention |

---

## Acceptance criteria

1. Authenticated user with `users.userType === minister` and a `ministers` row receives **200** from `GET /api/v1/minister` (not 403).
2. Authenticated **creator** calling `GET /minister` receives **403** (or documented alternative), not 200 with wrong shape.
3. Same fix pattern applied to `GET /creator` if it uses the same broken `req.user.userType` check ([TECH.md](./TECH.md) RC-2).
4. No new util modules; changes in `checkAuth.mdw.ts`, `minister.controller.ts`, `minister.service.ts`, or `userRepository` only ([TECH.md § API code placement](./TECH.md#api-code-placement)).
5. Web minister profile (`useProfileQuery`, `MinisterState`) loads after onboarding without manual re-login.
6. Related log noise from wrong persona calls remains covered by [feat-0009](../feat-0009/PRODUCT.md) (creator 404), not this 403.

---

## Scope

| In scope | Out of scope |
| -------- | ------------ |
| `GET /minister` 403 for real ministers | CDN / image URLs ([feat-0008](../feat-0008/PRODUCT.md)) |
| `Protect` / `req.user` shape | Creator 404 when minister client calls `GET /creator` ([feat-0009](../feat-0009/PRODUCT.md)) |
| `GET /creator` same guard bug | Mobile listener app |
| Web profile + `MinisterState` consumption | Full Get Started hub UX ([web feat-0031](../../../web/feature/feat-0031/PRODUCT.md)) |

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Root cause, sequence diagram, fix options |
| [feat-0009 PRODUCT](../feat-0009/PRODUCT.md) | Spurious `GET /creator` 404 (different error, same portal) |
| [feat-0004 PRODUCT](../feat-0004/PRODUCT.md) | JWT / `Protect` / `X-New-Token` |
| [profile-image-display-spec.md](../../profile-image-display-spec.md) | Profile GET contract |
| [web-api-auth-handshake.md](../../web-api-auth-handshake.md) | Web Bearer alignment |
