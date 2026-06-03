# feat-0013: Misleading `async.mdw` / `checkAuth.mdw` frames in API dev `ERR` logs

## Summary

Turbo / `pnpm dev:api` often shows an `ERR` block whose **visible** stack ends at:

```text
ERR
    at .../middlewares/async.mdw.ts:29:18
    at Layer.handle [as handle_request] (.../express/lib/router/layer.js:95:5)
    at next (.../express/lib/router/route.js:149:13)
    at .../middlewares/checkAuth.mdw.ts:83:9
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
```

That pattern looks like an **auth failure**, but it usually is not. Line **83** in `checkAuth.mdw.ts` is `next()` **after** JWT verification succeeded. The real failure is almost always in a **downstream** controller or service on a `Protect` route. Turbo frequently **truncates** the lines above the stack (`ErrorResponse: …`, `statusCode`, controller file:line).

This spec is the **runbook** for reading API dev errors, mapping them to existing feature specs, and avoiding false “Protect is broken” diagnoses.

---

## Observed scenario (this report)

| Observation | Meaning |
| ------------- | ------- |
| Stack shows `async.mdw.ts:29` | `asyncHandler` caught a rejected promise and called `next(error)` — wrapper only |
| Stack shows `checkAuth.mdw.ts:83` | Auth **passed**; request entered the route handler |
| No `ErrorResponse:` line in Turbo viewport | Scroll **up** in the task log, or reproduce and read full `logger.log({ label: 'ERR' })` object |
| `25 topics upserted` / workers start **after** the stack | Often a **prior** request’s error still in the scroll buffer before a **restart** (`last_exit_code: 1` on previous `pnpm dev:api`) — not necessarily the same boot |

**Likely match (when full message is visible):** same session as [feat-0011](../feat-0011/PRODUCT.md) — `ErrorResponse: sermon not found` at `sermon.controller.ts:867` during upload polling. The middleware-only tail is a **display artifact**, not a new bug class.

---

## Problem

| Symptom | Impact |
| ------- | ------ |
| Engineers focus on `Protect` / `asyncHandler` | Time lost “fixing” auth that already succeeded |
| Turbo hides the first lines of `ERR` | Wrong spec or wrong endpoint assumed |
| Error appears above startup lines | Mistaken belief that seeding or Redis failed |
| Multiple specs cover similar `ERR` noise | Unclear which doc is canonical |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-ERR01 | Engineer reading Turbo | To know `checkAuth:83` means auth OK | I debug the handler, not JWT |
| UC-ERR02 | Operator | One line (`ErrorResponse: …`) tied to a feature spec | I open the right PRODUCT/TECH doc |
| UC-ERR03 | On-call | Network tab method + path correlated with log | I confirm which client triggered the ERR |
| UC-ERR04 | Maintainer | feat-0010 marked resolved where Protect now sets `userType` | Old 403 RCA is not re-applied blindly |

---

## Decision matrix (after reading full `ERR` message)

| `ErrorResponse` message (or plain `Error.message`) | status | Controller / area | Canonical spec | Action |
| -------------------------------------------------- | ------ | ----------------- | -------------- | ------ |
| `sermon not found` | 404 | `sermon.controller.ts` ~867 | [feat-0011](../feat-0011/PRODUCT.md) | Verify `canUserViewSermonDetail` / upload poll owner |
| `Creator profile not found` | 404 | `creator.controller.ts` ~414 | [feat-0009](../feat-0009/PRODUCT.md) | Web persona gate; avoid `GET /creator` on minister sessions |
| `Minister profile is only available for minister accounts` | 403 | `minister.controller.ts` ~487 | [feat-0010](../feat-0010/PRODUCT.md) | If real minister: was RC-1 (fixed). If creator JWT: expected 403 |
| `Creator profile is only available for creator accounts` | 403 | `creator.controller.ts` | [feat-0009](../feat-0009/PRODUCT.md) | Symmetric role guard |
| CDN / image loads empty in browser | — | Storage GET, not always ERR | [feat-0012](../feat-0012/PRODUCT.md) | Infra + `s3Key` with extension |
| `No token provided` / `Invalid token` / `Token revoked` | 401 | `checkAuth.mdw.ts` **before** line 83 | [feat-0004](../feat-0004/PRODUCT.md) | Client auth / session |
| Stack **only** `async.mdw` + `checkAuth:83`, no message | — | Unknown | **This spec** | Scroll up; reproduce with Network tab |

---

## Acceptance criteria

1. Engineers can decode a truncated Turbo stack without opening auth middleware first ([TECH.md](./TECH.md)).
2. Each known recurring `ERR` message links to an existing feat spec (table above).
3. [feat-0010](../feat-0010/PRODUCT.md) documents that `Protect` now attaches `userType` (RC-1 fixed); remaining minister 403s are wrong persona or legitimate guard.
4. Diagnosis steps do **not** require new util modules — use logs, Network, and existing controller line numbers.

---

## Out of scope

- Changing `logger` format or Turbo layout
- Silencing expected 404/403 in production
- New error taxonomy (403 vs 404 for private sermons) — see [feat-0011](../feat-0011/PRODUCT.md)

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Stack anatomy, reproduction checklist, code references |
| [feat-0011](../feat-0011/PRODUCT.md) | Upload poll `sermon not found` |
| [feat-0010](../feat-0010/PRODUCT.md) | Minister 403 (historical RC-1) |
| [feat-0009](../feat-0009/PRODUCT.md) | Creator 404 noise |
| [web-api-auth-handshake.md](../../web-api-auth-handshake.md) | Bearer / Protect alignment |
