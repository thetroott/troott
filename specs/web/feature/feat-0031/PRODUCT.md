# feat-0031: Get Started hub — Upload sermon CTA (no-op / blink)

## Summary

On **`http://localhost:5173/get-started`**, hub accordion item **4 — Upload first sermon** exposes **Upload sermon**. For ministers who have finished earlier steps (including the studio tour), clicking that control must open the **studio upload wizard**. Today the button often **does nothing visible** except a brief **blink** (flash) and the user remains on `/get-started`.

This feature spec defines expected product behavior, preconditions, failure modes, and acceptance criteria. Implementation detail lives in [GET_STARTED_UPLOAD_SERMON_CTA_SPEC.md](./GET_STARTED_UPLOAD_SERMON_CTA_SPEC.md) and [TECH.md](./TECH.md).

## Problem

| Symptom | User impact |
| ------- | ----------- |
| **Upload sermon** on hub item 4 clicks with no lasting navigation | Cannot start first sermon from onboarding |
| Brief UI flash (“blink”) then same URL | Looks broken; blocks onboarding completion |
| No error toast or inline message | User cannot self-recover |

**Reported context:** Minister on Get Started hub, last checklist item (**Upload first sermon**), local dev (`localhost:5173`).

## Consumer

- **Minister** (primary) and **creator** on web Get Started hub.
- **QA** reproducing onboarding item 4 after tour (server `onboarding.step >= 5`).

## Non-goals

- Full upload wizard UX ([feat-0008](../feat-0008/PRODUCT.md), [feat-0018](../feat-0018/PRODUCT.md), [feat-0027](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md)).
- Interactive studio tour popover ([feat-0016](../feat-0016/PRODUCT.md)) — except as a **prerequisite** for upload access.
- API publish / `onboardingFirstSermonComplete` ([feat-0010](../feat-0010/PRODUCT.md) §5).
- Hiding Get Started after completion ([feat-0030](../feat-0030/PRODUCT.md)).

## Related specs

- [feat-0010](../feat-0010/PRODUCT.md) — Get Started hub, item 4 links to studio upload.
- [feat-0009](../feat-0009/PRODUCT.md) — Post-auth and studio entry; studio code in storage.
- [feat-0016](../feat-0016/PRODUCT.md) — Tour completes milestone `onboarding.step >= 5`.
- [feat-0005](../feat-0005/PRODUCT.md) — Minister onboarding ladder.
- [feat-0030](../feat-0030/PRODUCT.md) — Redirect away from hub when onboarding complete.

## User story

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-US01 | Minister on Get Started with tour done | **Upload sermon** to open `/studio/{code}/sermons/upload` | I can upload and publish my first sermon |
| UC-US02 | Minister missing studio code | A clear message when upload cannot start | I know to wait for studio provisioning or support |
| UC-US03 | Minister who has not finished tour (step &lt; 5) | Guided copy to complete tour first | I do not hit a silent redirect loop |

## Expected behavior (normative)

### When **Upload sermon** is enabled

All of the following must be true:

1. Authenticated minister or creator.
2. Server onboarding **`step >= 5`** (tour milestone complete) — see [GET_STARTED_UPLOAD_SERMON_CTA_SPEC.md](./GET_STARTED_UPLOAD_SERMON_CTA_SPEC.md) § Preconditions.
3. Resolvable **studio public code** (session, minister/creator context, or `localStorage` studio code) — not placeholder `_`.

**Action:** Navigate to **`/studio/{studioCode}/sermons/upload`** (wizard entry on that route per [feat-0027](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md)). Optional: default redirect to `…/upload/file` after mount; user must see upload UI (entry modal or wizard), not an instant bounce back to `/get-started`.

### When prerequisites are not met

| Condition | Product response (no silent blink) |
| --------- | ------------------------------------- |
| `step < 5` (tour not complete) | Toast: finish **Tour & Tutorial** (item 3) first; stay on hub or deep-link to `/get-started/tour-guide` |
| No studio code after hydrate | Toast: studio not ready; stay on hub; do not navigate to `/studio/_/…` |
| `onboarding.status === 'completed'` | [feat-0030](../feat-0030/PRODUCT.md): hub redirect to sermons list; item 4 shows **Completed** |
| Item 4 already complete (`step >= 6`) | **Completed** control disabled; optional link to sermons list for another upload |

### Hub controls (both CTAs)

Item 4 has two **Upload sermon** buttons ([`GetStarted.tsx`](../../../../apps/web/src/app/get-started/GetStarted.tsx)):

- Collapsed row (accordion trigger)
- Expanded body

Both must behave identically: same preflight, same navigation, same error toasts.

## Known failure mode (current implementation)

**Blink / no-op** is most often a **redirect loop**:

1. Hub navigates to `/studio/{code}/sermons/upload` (or `/studio/_/sermons/upload` when code missing).
2. [`StudioPortal`](../../../../apps/web/src/app/studio/StudioPortal.tsx) runs `canAccessStudioDuringOnboarding` — upload paths are allowed only when **`onboarding.step >= 5`** ([`hub-onboarding.util.ts`](../../../../apps/web/src/utils/hub-onboarding.util.ts)).
3. If step is still **4** (tour UI done locally but API milestone not saved), portal **`replace` navigates to `/get-started`** immediately → user perceives a flash only.

Secondary causes: invalid studio code `_`, failed `GET /studio/_`, or accordion-only visual feedback without navigation. See [TECH.md](./TECH.md).

## Acceptance criteria

- [ ] Minister with `step >= 5` and valid `studioCode`: **Upload sermon** lands on upload route and upload UI stays visible.
- [ ] Minister with `step === 4`: **Upload sermon** shows explicit toast; does not navigate to studio upload (no blink).
- [ ] Minister with no studio code: toast; no navigation to `/studio/_/…`.
- [ ] Collapsed and expanded **Upload sermon** buttons behave the same.
- [ ] After successful publish (`step >= 6`), hub item 4 shows **Completed**; primary CTA does not re-open wizard unless product adds “Upload another”.
- [ ] Automated test: hub CTA preflight mirrors `canAccessStudioDuringOnboarding` for upload paths.

## Test plan (manual)

| # | Setup | Action | Expected |
| - | ----- | ------ | -------- |
| 1 | `onboarding.step = 5`, studio code in storage | Hub **Upload sermon** | Upload page; entry modal or wizard visible |
| 2 | `step = 4`, tour not API-complete | Hub **Upload sermon** | Toast; remain on `/get-started` |
| 3 | Clear `studioCode` from storage | Hub **Upload sermon** | Toast; no `_` in URL |
| 4 | Complete tour via `/get-started/tour-guide` **Continue** then hub item 4 | **Upload sermon** | Same as #1 |
| 5 | `step = 6` | Hub item 4 | **Completed**, disabled |

## Open questions

1. Should hub item 4 navigate directly to `…/upload/file` instead of `…/upload`? **Recommendation:** yes, after code exists, to avoid an extra redirect hop.
2. Should item 4 call `onboardingTourComplete` if user skipped tour but `step` is still 4? **Out of scope** — enforce tour milestone first.
3. Should **Upload sermon** open upload from hub without leaving Get Started chrome? **No** — product uses studio route ([feat-0010](../feat-0010/PRODUCT.md) §7).
