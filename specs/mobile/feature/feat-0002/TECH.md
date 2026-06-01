# feat-0002: Tech Spec — Listener onboarding (mobile)

## Context

See [`PRODUCT.md`](./PRODUCT.md) and API [`specs/api/feature/feat-0002/TECH.md`](../../../api/feature/feat-0002/TECH.md).

---

## Routes

| Step | Path | Component |
| ---- | ---- | --------- |
| Layout | `app/(onboarding)/_layout.tsx` | Stack, no header |
| **1 — Ministers** | `app/(onboarding)/select-ministers.tsx` | `components/features/onboarding/favorites-ministers.tsx` |
| **2 — Topics** | `app/(onboarding)/select-interests.tsx` | `components/features/onboarding/interests.tsx` |

**Target navigation:**

- Ministers Continue → `router.push('/(onboarding)/select-interests')`
- Topics Continue → `replaceWithPendingTargetOrHome(user)`

---

## Guards

| Concern | Path |
| ------- | ---- |
| Completion | `lib/onboarding-guard.ts` — `isListenerOnboardingComplete`, `listenerOnboardingRoute` |
| Tab redirect | `api/hooks/app/useOnboardingGuard.ts` |
| Post-auth | feat-0001 login/activate success → same guard rules |

### Target `listenerOnboardingRoute`

```ts
const ONBOARDING_COMPLETE_STEP = 2;

// complete when status completed/skipped OR step >= 2

if (step < 1) return '/(onboarding)/select-ministers';
return '/(onboarding)/select-interests';
```

---

## API hooks

File: [`api/hooks/app/useListenerOnboarding.ts`](../../../../apps/mobile/api/hooks/app/useListenerOnboarding.ts)

| Hook | Query / mutation | Catalog / body |
| ---- | ---------------- | -------------- |
| `useOnboardingMinistersQuery` | `GET /search/ministers?limit=30` | No `q` — browse list (requires API feat-0002) |
| `useOnboardingTopicsQuery` | `GET /search/topics?limit=50` | No `q` — `normalizeOnboardingTopics(res.data)` |
| `useOnboardMinistersMutation` | `POST /listener/onboarding/ministers` | `{ ministerIds }` — **first** milestone |
| `useOnboardTopicsMutation` | `POST /listener/onboarding/topics` | `{ topicIds }` — **terminal** milestone |
| `useSkipOnboardingMutation` | `POST /listener/onboarding/skip` | — |

### Target optimistic context (onSuccess)

| Mutation | `SET_LISTENER_ONBOARDING` |
| -------- | ------------------------- |
| Ministers | `{ step: 1, status: 'in-progress' }` |
| Topics | `{ step: 2, status: 'completed' }` |
| Skip | sync via `syncSessionToContext` only |

Always call `syncSessionToContext(userContext, queryClient)` after success.

Query keys: [`api/utils/query-keys.ts`](../../../../apps/mobile/api/utils/query-keys.ts) — `onboarding.ministers`, `onboarding.topics`.

---

## Client modules

| File | Responsibility |
| ---- | -------------- |
| `favorites-ministers.tsx` | Minister grid, search filter, Continue → topics, Skip |
| `interests.tsx` | Topic chips, `MIN_TOPICS = 5`, Continue → Home, Skip |
| `api/clients/search.ts` | `searchMinisters`, `searchTopics` |
| `api/clients/listener.ts` | `onboardMinisters`, `onboardTopics`, `skipOnboarding` |
| `api/dtos/listener.dto.ts` | `OnboardMinistersDTO`, `OnboardTopicsDTO` |
| `lib/deep-link/replace-with-pending-or-home.ts` | Post-completion navigation |

Minister rows: `ministerDocToRow` from [`engine/utils/library-map.ts`](../../../../apps/mobile/engine/utils/library-map.ts).

Topic rows: `flattenTopics` in `interests.tsx` — expects `{ id, name }` from API cards.

---

## Context / session

| Concern | Path |
| ------- | ---- |
| `SessionUser.onboard` | `context/user/types.ts` |
| Hydrate after POST | `api/services/sync-session-to-context.ts` |
| Listener onboarding slice | `SET_LISTENER_ONBOARDING` in `context/types.ts` |

---

## PRODUCT → implementation matrix

| Behaviors | Implementation |
| --------- | -------------- |
| 1–3, 6, 10 | `useOnboardingGuard` + `listenerOnboardingRoute` |
| 4–5, 12 | Onboarding components + mutations |
| 7 | `onboard.step` from API + TanStack cache |
| 8 | `replace-with-pending-or-home.ts` |
| 9 | Guard skips `(auth)` |
| 11 | `useOnboarding*Query` hooks |

---

## Known gaps (implementation backlog)

| Gap | Owner | Notes |
| --- | ----- | ----- |
| **Step order inverted** | Mobile + API | Ministers screen currently second; see PRODUCT migration |
| **`GET /search/ministers` without `q`** | API | Returns 400 today; blocks minister list |
| Minister minimum validation | Mobile | `handleFinish` does not enforce min count before POST |
| Topics API min 5 | API service | Message says 5 but only rejects empty array today |
| `ONBOARDING_COMPLETE_STEP = 3` in guard | Mobile | Should be **2** per API ladder |
| Photo / notification steps | Product | Not routed — add PRODUCT + routes if required |

---

## Verification checklist

- [ ] Fresh user lands on `select-ministers`
- [ ] Ministers POST → topics screen; `onboard.step === 1`
- [ ] Topics POST with 5 ids → Home; `onboard.status === completed`
- [ ] Topics POST before ministers → toast with API message
- [ ] Skip from either step → Home
- [ ] Deep link pending target opens after completion
- [ ] Guard does not flash when already on onboarding route

---

## Related docs

- [`specs/mobile/00 - onboarding.md`](../../00%20-%20onboarding.md)
- [`specs/api/feature/feat-0002/PRODUCT.md`](../../../api/feature/feat-0002/PRODUCT.md)
