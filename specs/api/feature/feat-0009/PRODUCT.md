# feat-0009: “Creator profile not found” (404) on minister studio sessions

## Summary

While using the **minister** web portal (upload, get-started, tour, publish), the API logs repeat:

```text
ERR ErrorResponse: Creator profile not found
  at creator.controller.ts:414
  statusCode: 404
```

Upload and sermon processing may still succeed. The errors are **noisy and misleading** — they do not mean the uploader lacks a minister profile or that sermon jobs failed.

This spec explains **why** a minister `userType` triggers `GET /api/v1/creator`, when 404 is expected vs a real bug, and what to change so ministers never hit creator routes unless they are creator accounts.

---

## Minister vs creator (they are not the same account type)

| Dimension | **Minister** | **Creator** |
| --------- | ------------ | ----------- |
| `users.userType` | `minister` | `creator` |
| Mongo profile collection | `ministers` (linked by `user`) | `creators` (linked by `user`) |
| Created at registration | `user.service` → `ministerService.createMinister` | `user.service` → `creatorService.createCreator` |
| Studio profile API | `GET /api/v1/minister` | `GET /api/v1/creator` |
| Onboarding milestones | `POST /api/v1/minister/onboarding/*` | `POST /api/v1/creator/onboarding/*` |
| Web context | `MinisterState` → `api.minister.getMinister()` | `CreatorState` → `api.creator.getCreator()` |

A minister-only user has a **`ministers`** row and **no** **`creators`** row. Calling `GET /creator` for that JWT user id is always a lookup miss → **404**. That response is correct for the route; the **bug is the client calling the wrong route**, not missing sermon/upload data.

Sermon upload, metadata, and HLS jobs use **`POST /sermon/start-upload`** and Bull workers — they do **not** require a creator profile.

---

## Problem

| Observation | Impact |
| ----------- | ------ |
| Terminal shows multiple `Creator profile not found` during minister upload/onboarding | Operators think API is broken |
| Stack always points to `getCreatorProfile` → line 414 | Hard to tie to root cause without reading web context |
| Minister users have **no** `creators` Mongo document | `GET /creator` correctly returns 404 — but should not be called |
| Minister and creator share one web app shell | Both React contexts mount for every studio session |

---

## Why a minister session calls `GET /creator` (short answer)

The web app mounts **both** `MinisterState` and `CreatorState` for all portal users. Several minister flows call `dispatchOnboardingProfileRefresh()`, which fires a **global** browser event. **Both** contexts listen and refetch — so `CreatorState.refresh()` runs `api.creator.getCreator()` even when `userType=minister`.

Session bootstrap (`sessionState.tsx`) is **correctly gated** (minister refresh only for ministers). Most get-started checkpoints are **correctly gated** (`isCreatorPersona()` → minister vs creator API). The spurious traffic comes from the **ungated onboarding refresh event** in `creatorState.tsx`.

See [TECH.md](./TECH.md) for the full call graph and file map.

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-CP01 | Minister in studio | Server logs without spurious creator 404s | I trust logs during upload debugging |
| UC-CP02 | Creator account | `GET /creator` to return my profile | Creator onboarding and profile still work |
| UC-CP03 | Operator | Clear spec: 404 = no row for **this user id** in `creators` | We distinguish data bugs from wrong client calls |
| UC-CP04 | Engineer | Persona-aware refresh (minister **or** creator, not both) | One account type maps to one profile API |

---

## Acceptance criteria

1. **Minister** session (cookie / `userType=minister`, minister row exists): no automatic `GET /api/v1/creator` during normal upload, get-started, tour, or publish flows.
2. **Creator** session: `GET /api/v1/creator` still returns 200 with profile when row exists.
3. `dispatchOnboardingProfileRefresh()` refreshes **only** the persona that matches `userType` (minister **or** creator), not both contexts unconditionally.
4. Dev/staging logs: expected “optional profile missing” does not emit `ERR` stack traces (or is downgraded) when the client should not have called the route.
5. Document data-fix path when `userType=creator` but no creator document (registration failure).
6. Document that **API** `GET /creator` does not reject minister JWTs today — wrong-role calls are a **client** responsibility (optional hardening: 403 when `userType !== creator`).
7. **API layering:** no new `utils/*` modules for persona or media URL logic; use `apps/api/src/services/**` and existing `helpers.util.ts` only (see [TECH.md — API code placement](./TECH.md#api-code-placement-no-utils-facades)).
8. Minister **403** on profile (`GET /minister`) is a separate bug — [feat-0010](../feat-0010/PRODUCT.md) (`Protect` missing `userType`); do not confuse with this 404.

---

## API code placement (product rule)

Minister and creator are **separate services** (`minister.service`, `creator.service`). Fixes for this feature must **not** hide persona or CDN URL logic in new util files.

| Do | Don't |
| -- | ----- |
| `ministerService.getMinisterProfile(userId)` from `minister.controller` | `minister-profile.util.ts` or mapper-only lookups |
| `creatorService.getCreatorProfile(userId)` from `creator.controller` | Shared `studio-profile.util.ts` that branches on `userType` |
| `storageService.urlForPlaybackKey(s3Key)` inline env + path in the service method | `storage-url.util.ts`, `buildSermonPlaybackUrl` in `audio.util.ts` |
| Small shared non-domain helpers in `helpers.util.ts` (`getS3Folder`, `genUserCode`) | New util modules that wrap services or duplicate env reads |

Keep behavior **explicit in the service method body** — no one-line re-export wrappers whose only job is to call another helper file.

Agent skills to follow when implementing: [api-and-interface-design](../../../../.agents/skills/api-and-interface-design/SKILL.md), [incremental-implementation](../../../../.agents/skills/incremental-implementation/SKILL.md), [code-simplification](../../../../.agents/skills/code-simplification/SKILL.md).

---

## Scope

| Surface | In scope |
| ------- | -------- |
| Web studio portal | Yes — primary source of spurious `GET /creator` |
| API | Yes — behavior of `GET /creator`, registration provisioning |
| Mobile listener app | Out of scope — no shared `CreatorState` / onboarding refresh; `URL_CREATOR` exists but minister studio flows are web-only today |

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Call graph, root causes, gated vs ungated paths, fixes, API placement rules |
| [feat-0005 web TECH](../../../web/feature/feat-0005/TECH.md) | Minister vs creator onboarding parity |
| [feat-0006 PRODUCT](../feat-0006/PRODUCT.md) | Upload + publish flows that dispatch profile refresh |
| [api-and-interface-design skill](../../../../.agents/skills/api-and-interface-design/SKILL.md) | Service boundaries, contract-first |
| [incremental-implementation skill](../../../../.agents/skills/incremental-implementation/SKILL.md) | Land web persona gate before API/util cleanup |
