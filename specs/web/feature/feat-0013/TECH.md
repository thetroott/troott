# feat-0013: Engineering contract — Document verification uploads (web)

## Context

See [`PRODUCT.md`](./PRODUCT.md). Implementation roots:

- Page shell: `apps/web/src/app/account/VerifyDocument.tsx`
- Get Started steps: `components/shared/get-started/` (`SelectDocumentType`, `verify-document1`, …)
- Upload UI: refactor `components/shared/upload/file-upload.tsx` and related into a **studio-aligned** document modal
- APIs: `api/clients/storage.ts`, `api/clients/minister.ts`, `api/clients/creator.ts`
- Checkpoints: `services/get-started-checkpoint.ts`

**Frozen screen map (committed — do not reorder or merge):**

| ID | URL | Route name | Component | `onboarding.tsx` step title |
| -- | --- | ---------- | ----------- | --------------------------- |
| Shell | `…/verify-document` | `verify-document` | `VerifyDocument` | (parent; header only) |
| **D1** | `…/verify-document` (index) | `verify-document-index` | `SelectDocumentType` | Document Verification |
| **D2** | `…/verify-document/select` | `select` | `VerifyDocumentForm` | Document tips |
| **D3** | `…/verify-document/document1` | `document1` | `VerifyDocument1` | Upload method |
| **D4** | `…/verify-document/upload` | `upload` | `UploadDocumentWrapper` | Document Verification |

Path constants: `PATH_SEG_GET_STARTED_VERIFY_DOCUMENT`, `_VERIFY_DOC_SELECT`, `_DOCUMENT1`, `_UPLOAD` in `routes/paths.ts`.

Registered in `minister.route.tsx` under `verify-document` → `subroutes` (index + three children).

**Layout wrapper:** `GetVerified` / verify-account tree uses `InnerLayout` (`Outlet` + `ProgressButtons` + `SaveAndExit`).

---

## Figma implementation map (channel `5mtmmnxl`)

Verified via pacepard-ui-agent against open Troott file (`9lFM6TncipSv0pNVGBWZwA`). See [PRODUCT § Figma](./PRODUCT.md#figma-reference-troott).

| Figma node | Layer | Use |
| ---------- | ----- | --- |
| `6109:14936` | **Page** D3 | Upload method — default ([link](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6109-14936)) |
| `6109:14563` | **Page** D3 | Upload photos selected + Back/Continue ([link](https://www.figma.com/design/9lFM6TncipSv0pNVGBWZwA/Troott?node-id=6109-14563)) |
| `6102:16623` | **Modal** | Passport or NIN **empty** |
| `6102:16190` | **Modal** | Passport or NIN **filled** |
| `6091:15526` | **Modal** | Driver license **empty** |
| `6100:15802` | **Modal** | Driver license **filled** |

**Page D3 (`verify-document1.tsx`) — git-committed (`59e7706`, `05f9b26`):**

```tsx
// Restore this pattern; do not ship single-button D3 only
<IconRadioSelect
  value={method}
  onChange={(value) => {
    setMethod(value);
    if (value === 'upload-photos') setModalOpen(true);
  }}
  options={[
    { label: 'Take picture with phone', value: 'take-picture', icon: <Camera /> },
    { label: 'Upload photos', value: 'upload-photos', icon: <Upload /> },
  ]}
/>
```

**Method card styles (from `6109:14563`):** `bg-[#333234]`, `border-[#545454]/50`, `rounded-lg`, `h-[58px]`; selected `border-[#08ffdb]`.

**D3 `PageHeader` description:** `Please select a way to complete document verification` (not the D1/D2 privacy line).

**Component:** `DocumentVerificationContent.tsx` — modal slots; heights 180px (single) / 156px (dual), gap 13px.

**Modal shell target:** 477px wide, `#333234`, radius 12 (matches `Frame 1618868882` and `EditProfileDialog` width).

**Continue button:** disabled `#cefff8` / `#9d9d9d`; enabled `#08ffdb` / `#292929`.

**Legacy behavior to keep:** `file-upload.tsx` open/submit/`useOutletFlow`; restyle only.

---

## Navigation & checkpoints (committed)

`ProgressButtons` resolves steps from `OnboardingItems[0].steps` where `action` starts with `…/verify-account`:

```text
personal-information → verify-document → verify-document/select
  → verify-document/document1 → verify-document/upload → (next group) home-address
```

| Path | `runGetStartedCheckpoint` |
| ---- | --------------------------- |
| D1, D2, D3 | No document checkpoint — Continue only navigates |
| D4 `/…/verify-document/upload` | Yes — see below |

**D4 checkpoint (committed `get-started-checkpoint.ts`):**

```ts
hasSelectedDocumentType()  // localStorage selectedDocumentType
hasUploadedDocumentSides() // uploadedDocuments JSON has front AND back
→ api.minister|creator.onboardingDocumentComplete({})
```

**Gaps to fix without new screens:**

| Gap | Fix on same D3/D4 |
| --- | ----------------- |
| Passport uses `internationalPassportDocuments` on D3 but checkpoint expects `uploadedDocuments.front/back` | On passport modal Continue, normalize to checkpoint shape or relax validator for `passport_page` only |
| D4 modal ignores `selectedDocumentType` | Reuse D3 per-type `UploadConfig` |
| D3 NIN/license modal Continue only `console.log` | Write `uploadedDocuments` or call storage+verification APIs |
| No `submitVerification` call in web today | Invoke on modal Continue before/at D4 footer Continue |

---

## localStorage keys (committed)

| Key | Set by | Contents |
| --- | ------ | -------- |
| `selectedDocumentType` | D1 `SelectDocumentType` | `nin` \| `drivers-license` \| `passport` |
| `uploadedDocuments` | D4 modal `onSubmit` (and target: D3) | `{ front?, back? }` blob metadata |
| `internationalPassportDocuments` | D3 modal when `passport` | `{ passport_page? }` |

Canonical constants: `GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY`, `GET_STARTED_UPLOADED_DOCUMENTS_KEY` in `get-started-local-storage.util.ts`.

---

## Architecture (required layering)

No standalone `*.util.ts` extractors for this feature. Follow the same rule as [feat-0011](../feat-0011/TECH.md):

```text
api (storage.uploadImage, minister|creator.submitVerification, onboardingDocumentComplete)
  → hook (useDocumentVerification — mutations + typed config per DocumentType)
  → component (SelectDocumentType, DocumentVerificationModal, verify-document steps)
```

Optional: thin **context** only if multiple sibling routes must share upload state; prefer React Query mutation cache + `localStorage` for selected type.

---

## UI contract — Figma document modal (primary) + studio tokens (secondary)

**Primary:** Figma `Frame 1618868882` (477×556, `#333234`) — not the 827px sermon wizard width.

**Secondary:** `UPLOAD_SHELL.primaryCta` / disabled palette where they match Figma Continue states.

### `DocumentVerificationModal` (target)

| Part | Spec |
| ---- | ---- |
| Root | 477px, `#333234`, border `#545454`/50, radius 12, `p-0` |
| Header | 61px, back, **Document verification** |
| Body | `DocumentVerificationContent` — no extra `#333234` card wrapper (body fill is the frame) |
| Slots | `layout: 'single' \| 'dual'` from hook |
| Footer | Full-width Continue; disabled `#cefff8` / `#9d9d9d` |
| Loading | `Loader2` in slot during upload |

**Deprecate:** `FileUploadDialog` `DialogContent` `mt-8 justify-center flex flex-col`.

**Sermon upload Figma (reference only):** `4530:20801`, `UploadEntryStepModal` `4281:11102` — spacing/CTA patterns, not modal width.

---

## Document type mapping

Centralize in hook (inline object, not a separate util file):

| `localStorage` / UI key | `DocumentType` enum (`minister.dto.ts`) |
| ----------------------- | --------------------------------------- |
| `nin` | `national_identity_number` |
| `drivers-license` | `drivers_license` |
| `passport` | `international_passport` |

**Normalize** legacy keys on read (`driver-license`, `international-passport`) → canonical UI keys above.

---

## Per-type modal config (`useDocumentVerification` — inline switch)

Figma copy is authoritative for headlines/descriptions; field IDs are code contract.

### `nin` — Figma `6102:16623` / `6102:16190` (same layout as passport)

```ts
layout: 'single',
headline: 'Upload an image of your NIN',
description:
  'Make sure the photo of your NIN isn’t blurry and that it clearly shows your face and NIN number.',
fields: [{
  id: 'nin_page',
  uploadText: 'Upload NIN',
  reuploadText: 'Re-upload',
  acceptedFormats: ['image/jpeg', 'image/png'],
  required: true,
}],
apiType: DocumentType.NIN,
mapToPayload: (urls) => ({ type, frontPage: urls.nin_page }),
```

### `drivers-license` — Figma `6091:15526` / `6100:15802`

```ts
layout: 'dual',
headline: 'Upload your driver’s license',
description:
  'Make sure your photos aren’t blurry and the front of your driver’s license clearly shows your face.',
fields: [
  { id: 'front', uploadText: 'Upload front', reuploadText: 'Re-upload front', ... },
  { id: 'back', uploadText: 'Upload back', reuploadText: 'Re-upload back', ... },
],
apiType: DocumentType.DRIVERS,
mapToPayload: (urls) => ({ type, frontPage: urls.front, backPage: urls.back }),
```

### `passport` — Figma `6102:16623` / `6102:16190`

```ts
layout: 'single',
headline: 'Upload an image of your passport',
description:
  'Make sure the photo of your passport isn’t blurry and that it clearly shows your face.',
fields: [{
  id: 'passport_page',
  uploadText: 'Upload passport',
  reuploadText: 'Re-upload',
  acceptedFormats: ['image/jpeg', 'image/png'], // add application/pdf if API requires
}],
apiType: DocumentType.PASSPORT,
mapToPayload: (urls) => ({ type, frontPage: urls.passport_page }),
```

**D3 + D4:** both call `buildConfigForType(readSelectedDocumentUiType())` — fixes HEAD mismatch (license config on D4 for all types).

### Checkpoint alignment (same routes)

| Type | `hasUploadedDocumentSides()` should check |
| ---- | ------------------------------------------- |
| `drivers-license` | `uploadedDocuments.front` && `.back` |
| `nin` | `uploadedDocuments.nin_page` or API submit flag |
| `passport` | `uploadedDocuments.passport_page` or API submit flag |

---

## Data flow

### Committed (screens only)

```text
D1 SelectDocumentType → localStorage.selectedDocumentType
D2 VerifyDocumentForm → (display only)
D3 VerifyDocument1 → optional FileUploadDialog → localStorage / console
D4 UploadDocumentWrapper → FileUploadDialog useOutletFlow → uploadedDocuments
D4 ProgressButtons Continue → onboardingDocumentComplete (local gate)
```

### Target (same D3/D4 entry points — no new screens)

```text
D1 → selectedDocumentType (unchanged)
D3/D4 modal Continue:
  per slot POST /storage/upload → ImageDTO.file
  POST /minister|creator/verification { document: { type, frontPage, backPage? } }
  normalize uploadedDocuments for checkpoint
D4 footer Continue → onboardingDocumentComplete (unchanged trigger)
```

**Submit body example (driver license):**

```json
{
  "document": {
    "type": "drivers_license",
    "frontPage": "https://…/images/abc.jpg",
    "backPage": "https://…/images/def.jpg"
  }
}
```

**Do not** persist `URL.createObjectURL` blobs in `localStorage` as production URLs (remove `driverLicenseDocuments` mock keys).

---

## File map (current → target)

| File | Screen | Action |
| ---- | ------ | ------ |
| `app/account/VerifyDocument.tsx` | Shell | **Keep** — title/description |
| `components/shared/get-started/SelectDocumentType.tsx` | D1 | **Keep** — three radios; persist `selectedDocumentType` |
| `components/shared/get-started/verify-document.tsx` | D2 | **Keep** — tips UI |
| `components/shared/get-started/verify-document1.tsx` | D3 | **Keep route** — restore `IconRadioSelect` per Figma `6109:14936` / `6109:14563`; `upload-photos` opens modal |
| `components/shared/get-started/IconRadioSelect.tsx` | D1, D3 | Style cards to match Figma `#333234` / `#08ffdb` selected |
| `components/shared/upload/UploadDocumentWrapper.tsx` | D4 | **Keep route** — apply per-type config + `UPLOAD_SHELL` |
| `components/shared/upload/file-upload.tsx` | D3/D4 modal | Restyle → `DocumentVerificationModal` or wrap with `UPLOAD_SHELL` |
| `components/shared/upload/DocumentVerificationContent.tsx` | Modal body | Restyle dropzones; same slot IDs |
| `components/shared/upload/DialogHeader.tsx` | Modal | Align with studio header |
| `components/shared/upload/DialogSubmitButton.tsx` | Modal footer | Use `primaryCta` / outline cancel |
| `hooks/app/useDocumentVerification.ts` | D3/D4 | **New** — config switch + upload/submit mutations |
| `components/shared/upload/components/*` | — | **Not** on Get Started path (legacy/dev) |
| `components/shared/upload/DocumentUploadWrapper.tsx` | — | **Not** used in minister route (different from `UploadDocumentWrapper`) |
| `components/shared/upload/FinalStep.tsx` | — | Out of Get Started flow |
| `api/clients/storage.ts` | `uploadImage` | Use existing multipart client |
| `api/clients/minister.ts` | `submitVerification`, `onboardingDocumentComplete` | Existing |
| `api/clients/creator.ts` | Creator parity | Existing |
| `utils/get-started-local-storage.util.ts` | Keys | `GET_STARTED_SELECTED_DOCUMENT_TYPE_KEY`, drop blob document keys |
| `services/get-started-checkpoint.ts` | Continue from upload route | Call document-complete after submit |

---

## Hook sketch (`useDocumentVerification.ts`)

```ts
// Pseudocode — implement inline mapping in file, no extract util
export function useDocumentVerification() {
  const selectedType = readSelectedTypeFromStorage(); // normalized
  const config = buildConfigForType(selectedType); // inline switch
  const uploadSlot = useMutation({ mutationFn: (file: File) => api.storage.uploadImage(file) });
  const submit = useMutation({
    mutationFn: async (files: Record<string, File>) => {
      const frontPage = await uploadAndGetUrl(files.front ?? files.passport_page);
      const backPage = files.back ? await uploadAndGetUrl(files.back) : undefined;
      return api.minister.submitVerification({ document: { type, frontPage, backPage } });
    },
  });
  return { config, uploadSlot, submit, ... };
}
```

Persona branch: `useUser()` / minister context → minister vs creator client.

Parse storage response in the hook: `ImageDTO.file` (and `error` envelope) — same as [feat-0011](../feat-0011/TECH.md).

---

## Validation (client)

| Rule | Value |
| ---- | ----- |
| Max image size | 10 MB per file (align with storage controller or feat-0011) |
| Images | `image/jpeg`, `image/png` |
| Passport PDF | `application/pdf`, max 15 MB (confirm with API) |
| Required slots | Block Continue until filled + uploads complete |

---

## Implementation checklist

| # | Task | Status |
| - | ---- | ------ |
| 1 | PRODUCT + TECH — frozen D1–D4 flow documented | Done |
| 2 | `DocumentVerificationModal` — Figma 477px shell on D3/D4 | Pending |
| 3 | `useDocumentVerification` — Figma copy + `single`/`dual` layout | Pending |
| 4 | NIN → single-slot (not license 2-slot) per `6102:*` | Pending |
| 5 | D4 shares hook config with D3 | Pending |
| 6 | Storage + `submitVerification` on modal Continue | Pending |
| 7 | Checkpoint validator per type (nin_page / passport_page / front+back) | Pending |
| 8 | Creator API branch | Pending |
| 9 | D3 page parity: `6109:14936`, `6109:14563` | Pending |
| 10 | Modal parity: `6102`, `6091`, `6100` nodes | Pending |
| 11 | Manual QA per PRODUCT screen + modal states | Pending |

---

## Cross-references

- [feat-0015 PRODUCT](../feat-0015/PRODUCT.md) — post-upload hub routing (supersedes D3→D4 on modal success)
- [feat-0005 TECH](../feat-0005/TECH.md) — verify-document route map, UC-C30–C35
- [feat-0006 TECH](../feat-0006/TECH.md) — `UploadModal` / `UPLOAD_SHELL`
- [`01 - onboarding.md`](../../01%20-%20onboarding.md)
- API: `apps/api/src/interfaces/core/minister.interface.ts` (`DocumentType`, `DocumentUpload`)
