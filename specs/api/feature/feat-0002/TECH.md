# feat-0002: Tech Spec — Listener taste onboarding (API)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation lives in `apps/api`.

---

## Routes

| Method | Path | Auth | Handler |
| ------ | ---- | ---- | ------- |
| `POST` | `/api/v1/listener/onboarding/ministers` | `Protect` | `listener.controller.onboardMinisters` |
| `POST` | `/api/v1/listener/onboarding/topics` | `Protect` | `listener.controller.onboardTopics` |
| `POST` | `/api/v1/listener/onboarding/skip` | `Protect` | `listener.controller.skipOnboarding` |
| `GET` | `/api/v1/search/ministers` | Public | `search.controller.searchMinisters` |
| `GET` | `/api/v1/search/topics` | Public | `search.controller.searchTopics` |

Router: [`apps/api/src/routes/listener.router.ts`](../../../../apps/api/src/routes/listener.router.ts), [`apps/api/src/routes/search.router.ts`](../../../../apps/api/src/routes/search.router.ts).

---

## DTOs

[`apps/api/src/dtos/core/listener.dto.ts`](../../../../apps/api/src/dtos/core/listener.dto.ts)

```ts
interface OnboardMinistersDTO { ministerIds: string[] }
interface OnboardTopicsDTO { topicIds: string[] }
```

Controller validation today checks non-empty arrays only; **service layer must enforce** minimum counts (1 minister, 5 topics) per PRODUCT.

---

## Service logic (target)

File: [`apps/api/src/services/core/listener.service.ts`](../../../../apps/api/src/services/core/listener.service.ts)

### `onboardMinisters(userId, ministerIds)` — **step 1**

1. Validate `ministerIds.length >= 1`.
2. Require activated user (mirror topics check).
3. Resolve listener by `user`.
4. Validate minister ids exist.
5. `$set`: `ministers`, `onboarding.step: 1`, `onboarding.status: in-progress`.
6. Update user: `onboard.step: 1`, `onboard.stage: MINISTERS`, `onboard.status: in-progress`.
7. `recommendationService.seedFromMinisters` (non-blocking).
8. Invalidate `listener:profile:{userId}` Redis key (controller).

**Must not** require topics first. **Must not** set `completed` here.

### `onboardTopics(userId, topicIds)` — **step 2 (terminal)**

1. Validate `topicIds.length >= 5`.
2. Require activated user.
3. Require `listener.onboarding.step >= 1` unless redoing completed onboarding.
4. Validate active topic ids.
5. `$set`: `topics`, `onboarding.step: 2`, `onboarding.status: completed`.
6. Update user: `onboard.step: 2`, `onboard.stage: TOPICS`, `onboard.status: completed`.
7. `recommendationService.seedFromTopics` (non-blocking).

**Error when step < 1:** `Please complete minister selection before selecting topics` (400).

### `skipOnboarding(userId)`

Unchanged shape: step `2`, status `completed`, stage `SKIPPED` on user.

---

## Search catalog (target)

File: [`apps/api/src/services/core/search.service.ts`](../../../../apps/api/src/services/core/search.service.ts)

| Method | Purpose |
| ------ | ------- |
| `listActiveInterestTopics(options)` | **Exists** — leaf topics with `parentTopic`, `isActive: true` |
| `listActiveMinistersForOnboarding(options)` | **Add** — active ministers eligible for picker |

File: [`apps/api/src/controllers/core/search.controller.ts`](../../../../apps/api/src/controllers/core/search.controller.ts)

```ts
// searchMinisters — target behavior
const q = (req.query.q as string) || '';
const result = q.trim()
  ? await searchService.searchMinisters(q, options)
  : await searchService.listActiveMinistersForOnboarding(options);

// searchTopics — already matches this pattern
```

Suggested minister browse filter:

```ts
{ isActive: true /* + published sermon count > 0 if indexed */ }
.sort({ name: 1 })
.limit(options.limit ?? 30)
```

Map with [`search.mapper.mapMinisters`](../../../../apps/api/src/mappers/search.mapper.ts).

---

## Enums

[`apps/api/src/interfaces/user.interface.ts`](../../../../apps/api/src/interfaces/user.interface.ts)

```ts
enum OnboardStage {
  MINISTERS = 'ministers',
  TOPICS = 'topics',
  SKIPPED = 'skipped',
  // minister/creator web stages unchanged
}
```

Stage names stay the same; **order of assignment** changes per PRODUCT ladder.

---

## Response envelopes

Standard Troott JSON:

```json
{
  "error": false,
  "message": "Ministers selected successfully",
  "status": 200,
  "data": { /* listener doc or mapped DTO */ }
}
```

Topic list `data` is an array of `{ id, name, slug, description?, icon?, color?, usageCount? }`.

Minister list `data` is an array of minister search cards from mapper.

---

## Caching

| Key | Invalidate on |
| --- | ------------- |
| `listener:profile:{userId}` | Any onboarding POST success |

---

## Tests (recommended)

| Case | Assert |
| ---- | ------ |
| Ministers POST fresh listener | step 1, in-progress |
| Topics POST without ministers | 400 prerequisite |
| Topics POST after ministers with 5 ids | step 2, completed |
| Skip | completed without topics |
| `GET /search/topics?limit=50` no `q` | 200, array |
| `GET /search/ministers?limit=30` no `q` | 200, array |

Existing: [`apps/api/test/unit/configs/topic.seed.test.ts`](../../../../apps/api/test/unit/configs/topic.seed.test.ts) for topic seed data.

---

## Migration notes

### Code drift (2026-05)

| File | Issue |
| ---- | ----- |
| `listener.service.ts` | Swapped milestone semantics — see PRODUCT migration table |
| `search.controller.ts` | `searchMinisters` still 400 without `q` |
| Mobile hooks | Navigation and optimistic `SET_LISTENER_ONBOARDING` step values inverted |

### In-flight users

Listeners with `onboard.step === 1` and `stage === topics` (old flow) should either:

- **Option A (strict):** Treat as ministers-complete, route to topics screen only.
- **Option B (reset):** Reset to step 0 on next login (support-only).

**Default for implementation:** Option A — step ≥ 1 means ministers satisfied under old data model only if `listener.ministers.length > 0`; else reset to step 0.

---

## Related implementation map

| Concern | Path |
| ------- | ---- |
| Listener model | `apps/api/src/models/core/listener.model.ts` |
| Listener mapper | `apps/api/src/mappers/listener.mapper.ts` |
| Topic model | `apps/api/src/models/core/topic.model.ts` |
| Recommendations | `apps/api/src/services/core/recommendation.service.ts` |
| Mobile client | [`specs/mobile/feature/feat-0002/TECH.md`](../../../mobile/feature/feat-0002/TECH.md) |
