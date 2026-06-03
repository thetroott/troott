# feat-0032: Tech Spec — Upload modal immediate cover upload

## Context

See [PRODUCT.md](./PRODUCT.md).

**Endpoint:** `POST /api/v1/sermon/image-upload`  
**Web entry:** `SermonDetailsForm` inside `UploadModal` ([feat-0018](../feat-0018/PRODUCT.md))  
**API detail:** [feat-0014 TECH](../../../api/feature/feat-0014/TECH.md)

---

## Current vs target

| Area | Current | Target |
| ---- | ------- | ------ |
| Pick cover | `uploadActions.setUploadData({ thumbnail, thumbnailPreview })` only | + trigger upload when `sermonId` set |
| Crop apply | Updates local `File` blob only | + trigger upload with cropped `File` |
| Cover HTTP | `ReviewSubmit.handleSubmit` → `uploadSermonCoverForSermon` | **Removed from ReviewSubmit** — Details only |
| Save draft | `POST /sermon/publish/:id` metadata only | No multipart |
| Publish | Cover upload + publish in one handler | **Only** `POST /sermon/publish/:id` (published) |
| Metadata | Often only on Publish / auto-save after audio | `updateDraft` on Details/Listener exit + auto-save |
| Preview on resume | Not loaded from API | `GET /sermon/:id` → `imageUrl` / `image.item` |

---

## End-to-end sequence

```mermaid
sequenceDiagram
    participant User
    participant Details as SermonDetailsForm
    participant Hook as useSermonCoverUpload
    participant API as POST /sermon/image-upload
    participant S3 as troott-storage
    participant DB as Mongo sermons

    Note over User,DB: Audio already uploaded (sermonId in context)

    User->>Details: Pick or crop cover image
    Details->>Details: validateThumbnailFile
    alt no sermonId
        Details-->>User: local preview + "Finish audio upload first"
    else sermonId present
        Details->>Hook: uploadCover(sermonId, file)
        Hook->>API: multipart file + sermonId
        API->>S3: uploadFileToBucket (images/{id}.ext)
        API->>DB: image + imageUrl on sermon
        API-->>Hook: 200 + image.item CDN URL
        Hook->>Details: coverUploadStatus uploaded, thumbnailPreview CDN
        Details-->>User: Saved indicator
    end

    User->>Details: Continue wizard → Review → Publish
    Note over Details,API: Publish handler: POST /sermon/publish/:id ONLY
    Details->>API: POST /sermon/publish/:id (published metadata snapshot)
```

---

## Web implementation plan

### 1. Upload context state

Extend `ISermonUpload` / `initialUploadData` (`apps/web/src/context/upload/types.ts`):

| Field | Type | Purpose |
| ----- | ---- | ------- |
| `coverUploadStatus` | `'idle' \| 'local-only' \| 'uploading' \| 'uploaded' \| 'error'` | Tile UI |
| `coverImageUrl` | `string \| null` | Last successful server CDN URL |
| `coverUploadError` | `string \| null` | Retry copy |
| `coverFileFingerprint` | `string \| null` | `name:size:lastModified` — skip duplicate POST |

Keep existing `thumbnail: File | null` and `thumbnailPreview: string | null`.

### 2. Hook (three-layer mobile rule does not apply to web; keep colocated)

Add `apps/web/src/hooks/upload/useSermonCoverUpload.ts`:

- Wraps `uploadSermonCoverForSermon` from `@/services/upload/sermon-cover-upload.service`
- Accepts `onProgress` for tile progress
- Returns `{ uploadCover, isUploading, error, reset }`
- **Single-flight:** ignore new call while `isUploading`; abort previous only on explicit replace

Or inline in `SermonDetailsForm` if hook is thin — prefer hook for testability.

### 3. `SermonDetailsForm` changes

Files: `apps/web/src/components/shared/upload/SermonDetailsForm.tsx`

| Function | Change |
| -------- | ------ |
| `handleThumbnailSelect` | After dispatch local state, call `maybeUploadCover(file)` |
| `applyCrop` | After blob dispatch, call `maybeUploadCover(blobAsFile)` |
| `handleThumbnailRemove` | Reset `coverUploadStatus`, revoke object URLs; v1 no DELETE API |
| `useEffect` on mount / `sermonId` | If `uploadData.sermonId` and no local file, prefetch cover from `useSermonByIdQuery` |

`maybeUploadCover(file)`:

```ts
if (!uploadData.sermonId) {
  dispatch coverUploadStatus: 'local-only';
  return;
}
if (fingerprint === uploadData.coverFileFingerprint && coverUploadStatus === 'uploaded') return;
dispatch uploading → await uploadSermonCoverForSermon → dispatch uploaded + coverImageUrl
```

Use server URL for preview after success (`profileImageSrc` pattern optional for `?v=` busting — [feat-0012](../../../api/feature/feat-0012/PRODUCT.md)).

### 4. `ReviewSubmit` — Publish publishes only

Files: `apps/web/src/components/shared/upload/ReviewSubmit.tsx`

**Remove** the `uploadSermonCoverForSermon` block from `handleSubmit` entirely (no dedupe fallback — cover is Details’ job).

`handleSubmit` (Publish):

1. Guard: `sermonId`, `uploadComplete`, `coverUploadStatus === 'uploaded'` (or server `image.item` from last GET).
2. Optional guard: required metadata present (else toast + link to Details).
3. **Single call:** `publishSermonMutation.mutateAsync({ id, payload: buildPublishBody('published') })`.
4. Invalidate queries, reset upload, navigate, toast.

`handleSaveDraft`:

- **No** multipart.
- `POST /sermon/publish/:id` with draft payload and/or `updateDraft` — same as today, without cover upload.

### 4b. Metadata save on step exit

| Component | Trigger | Call |
| --------- | ------- | ---- |
| `SermonDetailsForm` | Next / step change to Listener | `updateDraft(sermonId, { title, description, tags, category, … })` |
| `ListenerSettings` | Next / step change to Review | `updateDraft(sermonId, { visibility, scheduledDate, isPublic, … })` |
| `ReviewSubmit` | After audio complete (existing) | Silent `updateDraft` auto-save |

Publish body still sends metadata fields (API contract) but values should match what was already saved via `updateDraft`.

### 5. API client (no change expected)

Existing: `apps/web/src/api/clients/sermon.ts` → `uploadCover` → `URL_SERMON_IMAGE_UPLOAD`  
Service: `apps/web/src/services/upload/sermon-cover-upload.service.ts`

### 6. Cache invalidation

After successful cover upload, invalidate:

- `sermonQueryKeys.all`
- `sermonQueryKeys.ministerListRoot(ministerId)` when minister id known

Do **not** restart audio pipeline polling after cover upload; poll stop is driven only by `data.item.uploadStatus` terminal response ([feat-0018 P4b](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md#p4b--stop-on-terminal-response-requestresponse-cycle)).

---

## API contract summary

Full spec: [feat-0014](../../../api/feature/feat-0014/PRODUCT.md).

| Item | Value |
| ---- | ----- |
| Method / path | `POST /api/v1/sermon/image-upload` |
| Auth | `Protect` |
| Body | `multipart/form-data`: `file`, `sermonId` (string, Mongo id) |
| Success 200 | `{ data: SermonDTO, message: "Sermon image uploaded successfully" }` |
| Errors | 400 no file / no sermonId; 404 sermon not found; 403 not owner (feat-0014); 500 S3 failure |

Persisted fields (`sermon.service.handleSermonImage`):

- `image.item` — CDN public URL
- `imageUrl` — duplicate top-level for catalog
- `image.uploadStatus` — `completed`
- S3 key — `images/{uploadId}.{ext}` ([feat-0012](../../../api/feature/feat-0012/PRODUCT.md))

---

## Gaps to close (API + web)

| Gap | Owner | Action |
| --- | ----- | ------ |
| No ownership check on image-upload | API | `canUserViewSermonDetail` / `isSermonOwnedByUser` before `handleSermonImage` ([feat-0014](../../../api/feature/feat-0014/TECH.md)) |
| `uploadedBy` not set on cover | API | Set from `req.user.id` in controller (mirror `uploadSermon`) |
| Publish requires `image` but client deferred upload | Web | feat-0032 immediate upload |
| CDN URL blank in browser | Infra | [feat-0012](../../../api/feature/feat-0012/PRODUCT.md) |

---

## Testing

| Case | Expect |
| ---- | ------ |
| Pick cover before audio done | Local preview; no POST |
| Pick cover after `sermonId` | POST image-upload 200 |
| Crop and apply | Second POST with jpeg blob |
| Publish after uploaded cover | **Zero** `image-upload` requests on Publish click |
| Publish without cover synced | Blocked in UI; no fallback upload |
| Save draft | No multipart; metadata/draft only |
| Step exit Details → Listener | `PUT /sermon/update/:id` |
| Resume draft with imageUrl | Preview from GET sermon |
| 403/500 on image-upload | Error state + Retry |
| Replace image | New POST; GET sermon shows new URL |

---

## Files touched (implementation checklist)

| File | Change |
| ---- | ------ |
| `context/upload/types.ts` | Cover sync fields |
| `utils/interfaces.util.ts` | `ISermonUpload` fields if defined there |
| `hooks/upload/useSermonCoverUpload.ts` | New |
| `components/shared/upload/SermonDetailsForm.tsx` | Trigger upload + UI states |
| `components/shared/upload/ReviewSubmit.tsx` | **Remove** cover upload from Publish; guards only |
| `components/shared/upload/ListenerSettings.tsx` | `updateDraft` on step exit (if not present) |
| `apps/api/.../sermon.controller.ts` | Ownership + uploadedBy ([feat-0014](../../../api/feature/feat-0014/TECH.md)) |

No new `utils/*` facades on API; use `sermon.service` + existing `uploadFileToBucket`.

---

## No fallback, no legacy (implementation)

See [PRODUCT § No fallback, no legacy](./PRODUCT.md#no-fallback-no-legacy-hard-requirement).

### Delete — do not refactor into helpers

```ts
// ReviewSubmit.tsx — REMOVE entirely (legacy publish-time cover upload)
if (uploadData.thumbnail instanceof File) {
    await uploadSermonCoverForSermon(sermonId, uploadData.thumbnail);
}
```

### Do not add

- `uploadCoverBeforePublishIfNeeded()`
- `ensureCoverOnServer()` called from Publish
- Feature flag `IMMEDIATE_COVER_UPLOAD` with else-branch to old behaviour
- Commented-out legacy blocks “for reference”

### `maybeUploadCover` (Details only)

Fingerprint skip is **idempotency** on Details (same file picked twice), not a Publish fallback:

```ts
// OK on Details — skip duplicate POST for same file
if (fingerprint === coverFileFingerprint && coverUploadStatus === 'uploaded') return;

// FORBIDDEN on Review/Publish
if (coverUploadStatus !== 'uploaded') await uploadSermonCoverForSermon(...); // NO
```

### Verification (PR checklist)

- [ ] `rg 'uploadSermonCoverForSermon' apps/web/src/components/shared/upload/ReviewSubmit` → no matches
- [ ] `rg 'image-upload|uploadCover' apps/web/src/components/shared/upload/ReviewSubmit` → no matches (except comments forbidden)
- [ ] Publish click: Network tab shows **one** request → `POST …/sermon/publish/:id`
- [ ] Missing cover: Publish blocked; **no** `image-upload` in Network tab

---
