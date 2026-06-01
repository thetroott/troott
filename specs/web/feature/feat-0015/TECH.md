# feat-0015: Engineering contract — Document upload completion & storage lifecycle

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implements post-upload **routing**, **milestone timing**, and **localStorage** cleanup on top of [feat-0013](../feat-0013/TECH.md) (`useDocumentVerification`, `DocumentVerificationModal`).

**Hub progress source:** `apps/web/src/app/get-started/GetStarted.tsx` + `hub-onboarding.util.ts` (`hubCompletedItemIds`, `resolveOnboardingStep`).

---

## Target completion sequence (modal Continue)

```text
User clicks modal Continue (all required slots filled)
  → for each slot: POST /storage/upload
  → POST /minister|creator/verification { document: { type, frontPage, backPage? } }
  → POST /minister|creator/onboarding/document-complete
  → clearDocumentVerificationLocalStorage()
  → dispatchOnboardingProfileRefresh()   // minister/creator refresh listeners — NOT refreshSession
  → navigate(PATH_GET_STARTED)   // '/get-started'
```

Persona branch: `useDocumentVerification` / checkpoint — `isCreatorPersona()` → creator clients ([feat-0013](../feat-0013/TECH.md)).

---

## Routing matrix

| From | Trigger | Navigate to | Milestone API |
| ---- | ------- | ----------- | ------------- |
| D3 modal | Continue success | `/get-started` | `document-complete` |
| D4 modal | Continue success | `/get-started` | `document-complete` (idempotent if step ≥ 2) |
| D4 footer | Continue (step ≥ 2 only) | `/get-started` | None — modal already completed |
| D1–D3 footer | Continue (no modal submit) | Next step in ladder | None |
| Hub | Item 2 button | `/get-started/home-address` | None |

Path constant: `PATH_GET_STARTED` in `routes/paths.ts`.

---

## Document type → API mapping (unchanged from feat-0013)

| UI type | Modal fields | `DocumentType` | `frontPage` | `backPage` |
| ------- | ------------ | ---------------- | ----------- | ---------- |
| `nin` | `nin_page` | `national_identity_number` | URL | — |
| `passport` | `passport_page` | `international_passport` | URL | — |
| `drivers-license` | `front`, `back` | `drivers_license` | URL | URL |

Dual-slot license is **modal-only**; routes match single-slot types.

---

## Backend onboarding API reference

Canonical ladder in `apps/api/src/services/core/minister.service.ts`:

```ts
const STEP_PERSONAL = 1;
const STEP_DOCUMENT = 2;
const STEP_ADDRESS = 3;
const STEP_MINISTRY = 4;
const STEP_TOUR = 5;
const STEP_FIRST_SERMON = 6;
```

### Minister milestone routes (`minister.router.ts`)

| Step | Path constant (web `paths.ts`) | HTTP |
| ---- | ------------------------------ | ---- |
| 1 | `URL_MINISTER_ONBOARDING_PERSONAL_COMPLETE` | `POST /minister/onboarding/personal-complete` |
| 2 | `URL_MINISTER_ONBOARDING_DOCUMENT_COMPLETE` | `POST /minister/onboarding/document-complete` |
| 3 | `URL_MINISTER_ONBOARDING_ADDRESS_COMPLETE` | `POST /minister/onboarding/address-complete` |
| 4 | `URL_MINISTER_ONBOARDING_MINISTRY_COMPLETE` | `POST /minister/onboarding/ministry-complete` |
| 5 | `URL_MINISTER_ONBOARDING_TOUR_COMPLETE` | `POST /minister/onboarding/tour-complete` |
| 6 | `URL_MINISTER_ONBOARDING_FIRST_SERMON_COMPLETE` | `POST /minister/onboarding/first-sermon-complete` |
| — | `URL_MINISTER_VERIFICATION` | `POST /minister/verification` |
| — | `URL_MINISTER_ONBOARDING_SKIP` | `POST /minister/onboarding/skip` |

Creator: parallel under `/creator/…` (`URL_CREATOR_ONBOARDING_*`, `URL_CREATOR_VERIFICATION`).

Web clients: `apps/web/src/api/clients/minister.ts`, `creator.ts` — `onboardingPersonalComplete`, `onboardingDocumentComplete`, etc.

### Document step server rules

| API | Preconditions | Effect on `onboarding.step` |
| --- | ------------- | --------------------------- |
| `submitVerification` | step ≥ 1 (personal) | `max(step, 2)` + `verification.status = pending` |
| `onboardingDocumentComplete` | step ≥ 1; idempotent if step ≥ 2 | Sets step to **2** if below 2 |

feat-0015 client **must** call both `submitVerification` and `onboardingDocumentComplete` on modal success (document-complete is idempotent after submit).

---

## Onboarding step updates (web ↔ API)

| Server step | `hub-onboarding.util` constant | Milestone client method | Hub display |
| ----------- | ------------------------------ | ----------------------- | ----------- |
| 0 | — | — | 0/4 |
| 1 | `ONBOARDING_STEP_PERSONAL` | `onboardingPersonalComplete` | 0/4 |
| 2 | `ONBOARDING_STEP_DOCUMENT` | **`onboardingDocumentComplete`** | **1/4** |
| 3 | `ONBOARDING_STEP_ADDRESS` | `onboardingAddressComplete` | 1/4 |
| 4 | `ONBOARDING_STEP_MINISTRY` | `onboardingMinistryComplete` | **2/4** |
| 5 | `ONBOARDING_STEP_TOUR` | `onboardingTourComplete` | **3/4** |
| 6 | `ONBOARDING_STEP_FIRST_SERMON` | `onboardingFirstSermonComplete` | **4/4** |

Document upload must reach step **≥ 2** before hub shows `1/4`.

---

## Hub UI & progress refresh (shipped)

### Data flow

```text
resolveOnboardingStep(userType, minister, creator, user)
  → minister?.onboarding?.step ?? user?.onboard?.step  (minister)
  → creator?.onboarding?.step ?? user?.onboard?.step   (creator)
hubCompletedItemIds(step) → accordion + "{n}/4 completed"
```

File: `apps/web/src/utils/hub-onboarding.util.ts`. Step values coerced with `Number()` for string API edge cases.

### GetStarted.tsx

| Concern | Rule |
| ------- | ---- |
| Progress display | Always render `{n}/4` from context — **no** `isHydratingSession` / minister loading gate |
| Session refresh on mount | **Forbidden** — causes `AuthGate` infinite/stuck Loading |
| Legacy storage | `clearLegacyOnboardingProgress()` on mount only |
| Completed button | `variant="outline"`, `border-[#08ffdb]`, `text-[#08ffdb]` |
| Progress fill | `#6f94b8` on `#9d9d9d` track (Figma `6115:15910`) |

### MinisterState parse fix

`GET /minister` returns lean Mongo document with `_id`. `parseMinisterPayload` in `ministerState.tsx` must map `_id` → `id` or `minister` stays `null` and hub shows **0/4**.

### Refresh event

`ONBOARDING_PROFILE_REFRESH_EVENT` (`hub-onboarding.util.ts`):

- Fired from `DocumentVerificationModal` after successful submit.
- `MinisterState` / `CreatorState` listen and `refresh({ force: true })`.
- Hub does **not** register its own duplicate session refresh listener.

### AuthGate / userType

`useWebPortalEligibility` falls back to `cookieService.getUserType()` so `/get-started` is not stuck on Loading when cookie has role before React context hydrates.

---

## localStorage — functions and call sites

| Function | File | Clears |
| -------- | ---- | ------ |
| `clearDocumentVerificationLocalStorage()` | `get-started-local-storage.util.ts` | `selectedDocumentType`, `uploadedDocuments`, legacy passport/license keys |
| `clearGetStartedLocalStorage()` | same | Above + country + `onboarding_progress` |
| `clearPersonalDraft()` + `clearVerifyAccountCountry()` | `get-started-draft-storage.ts` | Personal draft keys |
| `clearDraftForCheckpointPath()` | same | Path-based (see below) |

### Target `clearDraftForCheckpointPath` behavior

| `fromPath` suffix / path | Clear |
| ------------------------ | ----- |
| `/personal-information` | personal draft + country |
| `/verify-document/upload` | document verification keys |
| `/home-address`, `/complete-profile` | address draft |
| `/ministry-input` | ministry draft |

### Document completion — modal only (no legacy D4 path)

- **Only** `DocumentVerificationModal` Continue runs upload + verification + `document-complete`.
- D4 footer Continue does **not** call milestone APIs or read `uploadedDocuments`.
- D4 footer: if `readServerOnboardingStep() >= 2` → allow navigation to hub; else toast.

---

## Files to change (implementation)

| File | Change |
| ---- | ------ |
| `hooks/app/useDocumentVerification.ts` | `completeDocumentOnboardingMilestone`, `readServerOnboardingStep`; mutation calls milestone + clear |
| `components/shared/upload/DocumentVerificationModal.tsx` | Success → `dispatchOnboardingProfileRefresh` + hub route (no `refreshSession`) |
| `app/get-started/GetStarted.tsx` | Server-driven progress + Figma hub chrome; no session refresh loop |
| `context/minister/ministerState.tsx` | `parseMinisterPayload` accepts `_id` |
| `hooks/app/useUser.tsx` | Cookie fallback for portal `userType` during hydrate |
| `components/shared/get-started/verify-document1.tsx` | No D3→D4 redirect on modal success |
| `components/shared/upload/UploadDocumentWrapper.tsx` | D4 modal; `onDismiss` → D3 |
| `services/get-started-checkpoint.ts` | D4: server step ≥ 2 → ok; else toast (no milestone) |
| `components/shared/get-started/ProgressButtons.tsx` | D4 footer Continue → `/get-started` |
| `utils/get-started-local-storage.util.ts` | `clearDocumentVerificationLocalStorage` on milestone |

---

## Hook sketch

```ts
// useDocumentVerification.ts — extend submit mutation
mutationFn: async (files) => {
  // ... upload slots, build document
  await api.minister|creator.submitVerification({ document });
  const milestone = isCreatorPersona()
    ? await api.creator.onboardingDocumentComplete({})
    : await api.minister.onboardingDocumentComplete({});
  if (milestone.error) throw new Error(milestone.message);
  clearDocumentVerificationLocalStorage();
  return milestone.data;
}
```

```tsx
// DocumentVerificationModal handleSubmit success
await submit.mutateAsync(payload);
toast.success('Documents submitted for verification.');
dispatchOnboardingProfileRefresh(); // minister/creator context — not refreshSession
navigate(PATH_GET_STARTED);
onSuccess?.();
```

---

## Checkpoint (D4 footer)

D4 upload route footer **does not** complete document verification.

```ts
if (fromPath === DOCUMENT_UPLOAD_PATH) {
  const serverStep = await readServerOnboardingStep();
  if (serverStep >= ONBOARDING_STEP_DOCUMENT) return { ok: true };
  return { ok: false, message: 'Submit your documents in the upload dialog before continuing.' };
}
```

---

## Error handling

| Failure | UX |
| ------- | -- |
| Storage upload fail | Toast; stay on modal |
| `submitVerification` fail | Toast; keep files for retry |
| `document-complete` fail after submit | Toast; **do not** clear localStorage; **do not** navigate hub; verification may exist server-side — show support copy |
| Network offline | Same as upload fail |
| Hub stuck on Loading | Do not mount `refreshSession` on GetStarted; check `parseMinisterPayload` / cookie userType |
| Hub shows 0/4 after upload | Confirm `onboarding.step ≥ 2` in network tab; minister context non-null |

---

## Implementation checklist

| # | Task | Status |
| - | ---- | ------ |
| 1 | PRODUCT + TECH spec (this feature) | Done |
| 2 | Backend 6-step API documented in PRODUCT/TECH | Done |
| 3 | Modal success → verification + `document-complete` + hub route | Done |
| 4 | Remove D3 → D4 redirect on modal success | Done |
| 5 | D4 footer → hub (not home-address) when document done | Done |
| 6 | `clearDocumentVerificationLocalStorage` on modal milestone | Done |
| 7 | Hub refresh shows 1/4 after upload | Done — event + minister parse; no session hydrate loop |
| 8 | D4 footer: no legacy milestone / localStorage path | Done |
| 9 | Manual QA UC-V01–V03 per type | Pending |
| 10 | Hub Figma progress + outline Completed button | Done |

---

## Cross-references

- [feat-0013 TECH](../feat-0013/TECH.md)
- [feat-0016 PRODUCT](../feat-0016/PRODUCT.md) — interactive tour (hub **3/4**)
- [feat-0005 TECH](../feat-0005/TECH.md)
- `apps/api/src/services/core/minister.service.ts` — `STEP_*` constants
- `apps/api/src/routes/minister.router.ts` — onboarding routes
- `apps/web/src/utils/hub-onboarding.util.ts`
- `apps/web/src/utils/get-started-local-storage.util.ts`
