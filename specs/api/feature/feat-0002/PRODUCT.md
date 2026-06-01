# feat-0002: Listener taste onboarding (API)

## Summary

After account **activation**, a **listener** completes **taste onboarding** on mobile: pick favorite **ministers**, then favorite **topics**. The API persists selections on the listener profile, advances `listener.onboarding` and `user.onboard`, seeds recommendations, and exposes catalog list endpoints for both steps.

**Step order (authoritative):** **Ministers → Topics.** Ministers always come first.

Complements [`specs/api/mobile-flow.md`](../../mobile-flow.md) §4C, [`specs/mobile/feature/feat-0002/PRODUCT.md`](../../../mobile/feature/feat-0002/PRODUCT.md), and [`specs/mobile/00 - onboarding.md`](../../../mobile/00%20-%20onboarding.md).

## Problem

Onboarding spans listener mutations, search catalog reads, user `onboard` fields, and recommendation seeding. Without one API contract, mobile and server can disagree on **step order**, **minimum counts**, and **completion** — causing 400 loops (wrong prerequisite step) or guards that send users to the wrong screen.

## Non-goals

- Minister/creator **web** Get Started ([`specs/web/feature/feat-0005`](../../../web/feature/feat-0005/PRODUCT.md)).
- Guest or anonymous taste collection.
- Profile photo or push permission as onboarding **required** gates (optional product follow-ups).
- Replacing full search with dedicated onboarding-only databases (reuse `Topic` + `Minister` models).

## Consumer

- **Mobile listener app** — primary client for these endpoints.
- **Recommendation service** — reads saved `ministers` / `topics` after each milestone.
- **Session bootstrap** — `GET /user` and `GET /listener` expose `onboard` for client guards.

---

## Onboarding ladder (server)

| Order | Milestone | HTTP | `listener.onboarding.step` | `listener.onboarding.status` | `user.onboard.step` | `user.onboard.stage` | `user.onboard.status` |
| ----- | --------- | ---- | -------------------------- | ---------------------------- | ------------------- | -------------------- | --------------------- |
| — | Not started | — | `0` (or unset) | `not-started` | `0` | — | `not-started` |
| **1** | **Ministers saved** | `POST /listener/onboarding/ministers` | `1` | `in-progress` | `1` | `ministers` | `in-progress` |
| **2** | **Topics saved (complete)** | `POST /listener/onboarding/topics` | `2` | `completed` | `2` | `topics` | `completed` |
| — | **Skip** (either step) | `POST /listener/onboarding/skip` | `2` | `completed` | `2` | `skipped` | `completed` |

**Completion rule:** onboarding is **complete** when `user.onboard.status === 'completed'` (includes skip). Mobile may also treat `listener.onboarding.status === 'completed'` as complete.

**Prerequisite rule (critical):**

1. `POST /listener/onboarding/ministers` — allowed when onboarding is not complete, or when **re-selecting** after prior completion (profile refresh).
2. `POST /listener/onboarding/topics` — allowed only when `listener.onboarding.step >= 1` (ministers milestone reached), unless redoing after completion.
3. `POST /listener/onboarding/topics` **must not** be the first milestone in a fresh onboarding run.

---

## Catalog reads (onboarding pickers)

Onboarding lists are loaded **before** POST milestones. Empty search query means **browse list**, not 400.

| Step | Client need | Endpoint | When `q` omitted |
| ---- | ----------- | -------- | ---------------- |
| Ministers | Searchable grid | `GET /api/v1/search/ministers?limit=30` | Return active, discoverable ministers (sorted by name or usage — see TECH). |
| Topics | Searchable chips | `GET /api/v1/search/topics?limit=50` | Return active **leaf** interest topics (`listActiveInterestTopics`). |

When `q` is present, same endpoints perform scoped text search within the onboarding-eligible set (or global search — TECH defines filter parity).

---

## Request bodies and validation

### `POST /listener/onboarding/ministers`

```json
{ "ministerIds": ["<mongoId>", "..."] }
```

| Rule | Value |
| ---- | ----- |
| Auth | Bearer required (`Protect`) |
| `ministerIds` | Non-empty array of valid minister `_id` values |
| Minimum count | **At least 1** minister |
| Recommended UX | **5** ministers (mobile copy; not a hard API max unless product adds one) |
| Activation | Account must be activated (same rule as topics milestone) |
| On success | Persist `listener.ministers`, advance step per ladder, seed recommendations from ministers |

**Errors (representative):**

| Code | When |
| ---- | ---- |
| 400 | Empty array, invalid minister id |
| 401 | Missing session |
| 403 | Account not activated |
| 404 | Listener profile not found |

### `POST /listener/onboarding/topics`

```json
{ "topicIds": ["<mongoId>", "..."] }
```

| Rule | Value |
| ---- | ----- |
| Auth | Bearer required |
| `topicIds` | Non-empty array of valid active topic `_id` values |
| Minimum count | **At least 5** topics |
| Prerequisite | `listener.onboarding.step >= 1` (ministers milestone done) |
| Activation | Account must be activated |
| On success | Persist `listener.topics`, set onboarding **completed**, seed recommendations from topics |

**Errors (representative):**

| Code | When |
| ---- | ---- |
| 400 | Fewer than 5 topics, invalid/inactive ids, ministers step not done |
| 401 | Missing session |
| 403 | Account not activated |
| 404 | Listener profile not found |

### `POST /listener/onboarding/skip`

| Rule | Value |
| ---- | ----- |
| Auth | Bearer required |
| Body | Empty |
| Effect | Mark onboarding completed without persisting new taste rows (existing selections kept if any) |
| Use | Available on **both** onboarding screens; mobile shows consequence copy |

---

## Session fields returned to clients

After any milestone, `GET /user` should reflect updated `onboard`:

```ts
onboard: {
  step: number;      // 0 | 1 | 2
  stage?: string;    // ministers | topics | skipped
  status: string;    // not-started | in-progress | completed
}
```

`GET /listener` returns `onboarding: { step, status }`, plus `ministers[]` and `topics[]` when set.

Clients derive the **next screen** from `onboard.step` + `status` (see mobile feat-0002).

---

## Use cases

| ID | Actor | Trigger | Expected API outcome |
| -- | ----- | ------- | -------------------- |
| **UC-L01** | New listener | First open after activation | `onboard.step === 0`; ministers list loads via `GET /search/ministers` |
| **UC-L02** | New listener | Submit 3 ministers | 400 if below minimum 1; or 200 with step 1 if valid |
| **UC-L03** | New listener | Submit ministers then topics | Ministers 200 → topics 200 → `onboard.status === completed` |
| **UC-L04** | New listener | POST topics before ministers | **400** — prerequisite not met |
| **UC-L05** | New listener | Skip from ministers | Skip 200 → completed; topics POST not required |
| **UC-L06** | Returning listener | Reopen app mid-flow (`step === 1`) | Session shows ministers saved; topics screen is next |
| **UC-L07** | Completed listener | Change ministers from profile (future) | Ministers POST allowed when `status === completed` (redo path) |
| **UC-L08** | Unactivated user | Any milestone POST | **403** — activation required |

---

## Recommendation side effects

| Milestone | Service call | Failure handling |
| --------- | ------------ | ---------------- |
| Ministers saved | `recommendationService.seedFromMinisters(listenerId, ministerIds)` | Log and continue; milestone still succeeds |
| Topics saved | `recommendationService.seedFromTopics(listenerId, topicIds)` | Log and continue |

---

## Migration from current implementation (2026-05)

**Today’s code inverts step order (topics first).** The following must change to match this spec:

| Area | Current (wrong) | Target (this spec) |
| ---- | ----------------- | ------------------- |
| `listener.service.onboardTopics` | Sets step **1**, `in-progress` | Sets step **2**, `completed`; requires step ≥ 1 |
| `listener.service.onboardMinisters` | Requires topics first; sets **completed** | First milestone; sets step **1**, `in-progress` |
| `OnboardStage` usage | Topics stage on first POST | Ministers stage on first POST |
| `GET /search/ministers` without `q` | **400** | Browse list for onboarding |
| Mobile navigation | interests → ministers | **ministers → interests** |
| `listenerOnboardingRoute` | `step < 2` → interests | `step < 1` → ministers; else topics |

Existing listeners mid-onboarding (step 1 after topics-only) need a one-time migration or tolerant routing — TECH defines default.

---

## Open questions

| # | Topic | Default |
| - | ----- | ------- |
| 1 | Minister browse sort | `name` asc, only ministers with ≥1 published sermon |
| 2 | Skip persistence | Skip does not clear prior partial selections |
| 3 | Minimum ministers in API | **1** required; UX recommends **5** |

## Related docs

- [`TECH.md`](./TECH.md) — routes, services, mapper shapes, migration steps
- [`specs/api/mobile-flow.md`](../../mobile-flow.md) §4C–4D
- [`specs/mobile/feature/feat-0002/PRODUCT.md`](../../../mobile/feature/feat-0002/PRODUCT.md)
