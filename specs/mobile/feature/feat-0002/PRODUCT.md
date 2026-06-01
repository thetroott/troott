# feat-0002: Listener onboarding (taste before Home)

## Summary

After activation, **listeners** complete taste onboarding: favorite **ministers**, then favorite **topics**, before the main tab shell. Completion is driven by `user.onboard` (`step`, `stage`, `status`) synced from the API.

**Step order (authoritative):** **Ministers → Topics.** Ministers always come first.

Complements [`specs/api/feature/feat-0002/PRODUCT.md`](../../../api/feature/feat-0002/PRODUCT.md), [`specs/api/mobile-flow.md`](../../../api/mobile-flow.md) §4C–4D, and [`specs/mobile/00 - onboarding.md`](../../00%20-%20onboarding.md).

## Problem

Onboarding spans Expo routes under `(onboarding)`, TanStack hooks, context `onboard`, and server milestones. Without a contract aligned with the API, guards send users to the wrong step, POST calls fail with prerequisite 400s, or pending deep links never resolve.

## Non-goals

- Minister/creator web Get Started.
- Guest onboarding.
- Push permission as a **required** gate (optional only; see feat-0009).
- Reordering steps client-side without matching API milestone order.

## Figma

Figma: none provided. Baseline: `select-ministers`, `select-interests`, search + multi-select lists, Skip on both steps.

## Consumer

Signed-in listeners with `onboard.status` not `completed` (includes mid-flow `in-progress`).

---

## Step flow (UX)

| Step | Route | Screen title (current copy) | Continue action | Next route |
| ---- | ----- | --------------------------- | --------------- | ---------- |
| **1** | `/(onboarding)/select-ministers` | “Pick 5 ministers you like” | `POST /listener/onboarding/ministers` | `/(onboarding)/select-interests` |
| **2** | `/(onboarding)/select-interests` | “What topics interest you” | `POST /listener/onboarding/topics` | Home / pending deep link |

**Back:** From topics → ministers with **both** local selections preserved.

**Skip:** Available on both steps → `POST /listener/onboarding/skip` → Home / pending deep link. Show consequence copy (“Recommendations may be generic”).

---

## Selection minimums

| Step | Client validation | Server validation |
| ---- | ----------------- | ----------------- |
| Ministers | **At least 1** before Continue (enforce **5** in UI copy when product tightens) | `ministerIds.length >= 1` |
| Topics | **At least 5** (`MIN_TOPICS = 5`) | `topicIds.length >= 5` |

Continue / Finish disabled or shows toast until minimum met — one pattern app-wide.

---

## Behavior

1. Verified user with incomplete onboarding lands on **first incomplete step**, not Home tabs.
2. **Step 1 is always ministers** when `onboard.step < 1` (or equivalent not-started).
3. **Step 2 is topics** when `onboard.step === 1` and onboarding not complete.
4. **Back** between steps preserves selections (local state; server already has ministers after step 1 POST).
5. **Search** on each step: debounced filter on loaded list; empty state + Retry on fetch error.
6. On completion (`onboard.status === 'completed'` or skip): guard stops redirecting; user reaches `(tabs)/home` or pending deep link target.
7. Reopen app mid-onboarding: resume step from `user.onboard.step` with lists refetched.
8. Pending deep link: after completion, open pending sermon/playlist/minister when [`deep-links.md`](../../../api/deep-links.md) policy allows.
9. User on `(auth)` routes is not forced into onboarding until session exists.
10. `useOnboardingGuard` does not loop while already on `/(onboarding)/*`.
11. Catalog loads: ministers via `GET /search/ministers?limit=30` (no `q`); topics via `GET /search/topics?limit=50` (no `q`).
12. Optimistic context updates after POST must match API ladder (ministers → step 1 in-progress; topics → step 2 completed).

---

## Routing guard (target)

[`lib/onboarding-guard.ts`](../../../../apps/mobile/lib/onboarding-guard.ts):

| Condition | Route |
| --------- | ----- |
| Complete (`status === 'completed'` or `skipped`, or `step >= 2`) | `null` (allow tabs) |
| `step < 1` | `/(onboarding)/select-ministers` |
| else incomplete | `/(onboarding)/select-interests` |

---

## Use cases

| ID | Scenario | Expected UX |
| -- | -------- | ------------- |
| **UC-M01** | Fresh activation | Land on **ministers** screen |
| **UC-M02** | Select ministers → Continue | Navigate to **topics**; session `onboard.step === 1` |
| **UC-M03** | Select 5 topics → Continue | Enter Home (or pending link) |
| **UC-M04** | Skip on ministers | Home without topics step |
| **UC-M05** | Kill app on topics step | Reopen on **topics** with ministers already saved |
| **UC-M06** | Open tabs URL mid-onboarding | Guard replaces with correct onboarding route |

---

## Migration from current app (2026-05)

| Area | Current (wrong) | Target |
| ---- | ----------------- | ------ |
| `interests.tsx` Continue | `router.push('/select-ministers')` | `router.push('/select-interests')` from **ministers** screen |
| `favorites-ministers.tsx` Finish | Goes Home | Goes to **topics**; Home only after topics |
| `listenerOnboardingRoute` | `step < 2` → interests | `step < 1` → ministers |
| `useOnboardTopicsMutation` | Sets step 2 in-progress | Sets step 2 **completed** |
| `useOnboardMinistersMutation` | Sets step 3 completed | Sets step 1 **in-progress** |

Implement API feat-0002 **before** or **with** mobile reorder to avoid 400 prerequisite errors.

---

## Open questions

| # | Topic | Default |
| - | ----- | ------- |
| 1 | Enforce 5 ministers client-side | Match header copy; API minimum stays 1 |
| 2 | Loading overlay after final POST | Optional “Setting things up…” per mobile-flow §4D |

## Related docs

- [`00 - onboarding.md`](../../00%20-%20onboarding.md) — screen-level UX
- [`TECH.md`](./TECH.md) — file map and gaps
- [`specs/api/feature/feat-0002/PRODUCT.md`](../../../api/feature/feat-0002/PRODUCT.md) — API contract
- Tab shell: [feat-0003](../feat-0003/PRODUCT.md)
