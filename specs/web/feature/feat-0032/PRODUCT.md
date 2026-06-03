# feat-0032: Upload modal — immediate sermon cover image API upload

## Summary

When a minister or creator picks a **sermon cover / thumbnail** in the **Upload modal** (`SermonDetailsForm` on the Details step), the web app must **immediately** call the API to persist the image on the draft sermon row — not wait until **Publish** on the Review step.

Today the cover `File` lives only in React state until `ReviewSubmit.handleSubmit` runs `POST /api/v1/sermon/image-upload`. That delays persistence, breaks **Save draft** (metadata saved without cover), makes publish fail when pipeline validation requires `image.item`, and leaves no server URL for library thumbnails until the final click.

This spec is the canonical contract for **when** the cover upload fires, **what** the user sees, and **how** it ties to audio upload order and publish. API storage and access rules: [feat-0014 API](../../../api/feature/feat-0014/PRODUCT.md).

Parent context: [feat-0018 Upload wizard](../feat-0018/PRODUCT.md) (Figma `4296:7648`, `SermonDetailsForm`); lifecycle: [feat-0006](../feat-0006/PRODUCT.md); CDN URLs: [feat-0012 API](../../../api/feature/feat-0012/PRODUCT.md).

---

## Problem

| Today | Impact |
| ----- | ------ |
| Cover stored in `uploadData.thumbnail` only (client) | Lost on refresh / tab close |
| `POST /sermon/image-upload` only in `ReviewSubmit` on publish | **Save draft** has no cover; user must re-pick image |
| Publish validates `image.item` on server | **"Image File is required"** even though UI shows a preview |
| No upload progress / error on Details step | User thinks cover is saved when it is not |
| Resume draft loads metadata but not cover from server | Preview empty unless user re-uploads |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-COV01 | Studio user on Details step | Cover upload to start as soon as audio `sermonId` exists and I confirm the image | My draft row has `imageUrl` before I leave Details |
| UC-COV02 | Studio user | Clear uploading / success / error on the thumbnail tile | I know whether the server has my artwork |
| UC-COV03 | Studio user | **Save draft** to keep the cover already on the server | I do not re-upload on every save |
| UC-COV04 | Studio user | **Publish** to only flip lifecycle to published — not upload cover or audio | Publish is one API action, not a bundle |
| UC-COV05 | Studio user resuming a draft | Existing `imageUrl` from `GET /sermon/:id` as preview | I see the saved cover when reopening the wizard |
| UC-COV06 | Studio user replacing cover | New pick to replace S3 object and DB fields | Library shows updated art |
| UC-COV07 | Operator | One in-flight cover upload per `sermonId` | No duplicate S3 keys from double-clicks |
| UC-COV08 | Studio user | Title, tags, visibility saved as I move through steps | Review **Publish** does not first-save fields I entered earlier |
| UC-COV09 | Engineer merging feat-0032 | Legacy publish+cover path fully removed | No dual-path or fallback code in repo |

---

## Wizard action boundaries (canonical)

Each footer / step action has **one job**. **Publish must not upload files or compensate for unsaved earlier steps.**

| User action | Allowed HTTP | Must NOT |
| ----------- | ------------ | -------- |
| Audio upload (Progress step) | `POST /sermon/start-upload` | — |
| Cover pick / crop (Details step) | `POST /sermon/image-upload` | — |
| Metadata + listener fields (Details, Listener) | `PUT /sermon/update/:id` via `updateDraft` (step exit, debounced blur, auto-save after audio) | Multipart file uploads |
| **Save draft** (footer / close modal) | `POST /sermon/publish/:id` with `status: draft`, `isPublished: false` **or** `PUT /sermon/update/:id` | `image-upload`, `start-upload`, second audio upload |
| **Publish** (Review footer) | **Only** `POST /sermon/publish/:id` with `status: published`, `isPublished: true` | `image-upload`, `start-upload`, multipart, `updateDraft` as a substitute for missing cover |

### Publish button (Review step)

**Publish publishes.** It transitions the sermon to catalog/live and sends the final metadata snapshot the API expects in the publish body. It does **not**:

- Upload or re-upload the cover image
- Upload audio
- Silently fix missing cover / metadata from earlier steps

If cover is not on the server (`coverUploadStatus !== 'uploaded'` or missing `image.item` on `GET /sermon/:id`), **block Publish** with copy such as **"Add and save a cover on Details"** — do not fall back to uploading on Publish click.

If required metadata is missing, block with validation on Review or redirect to Details — do not bundle first-save into Publish.

### Save other info (before Publish)

| Data | When it saves | API |
| ---- | ------------- | --- |
| Audio file | Progress step complete | `POST /sermon/start-upload` |
| Cover image | Details: after pick/crop when `sermonId` exists | `POST /sermon/image-upload` |
| Title, description, topic, tags | Leaving Details; auto-save after audio; optional debounced edit | `PUT /sermon/update/:id` |
| Visibility, schedule, listener settings | Leaving Listener step; included in draft save | `PUT /sermon/update/:id` and/or draft `POST /sermon/publish/:id` |
| Draft lifecycle (explicit Save draft) | Footer **Save draft** / modal close | `POST /sermon/publish/:id` (`draft`) |

Publish assumes the row already has cover + pipeline fields from prior steps; it only applies the **published** lifecycle + metadata envelope.

---

## No fallback, no legacy (hard requirement)

Implementation must **delete** old paths — not keep them behind flags, env vars, comments, or “just in case” branches. One canonical flow per concern.

### Prohibited patterns

| Do not | Why |
| ------ | --- |
| Call `uploadSermonCoverForSermon` (or any `image-upload`) from `ReviewSubmit`, `UploadModal` footer, or **Publish** / **Save draft** handlers | Cover is Details-only |
| “Fallback”: if `coverUploadStatus !== 'uploaded'`, upload cover inside Publish then publish | Hides missing Details upload; violates single responsibility |
| “Dedupe fallback”: upload on Publish when fingerprint mismatch or Details upload failed | Same as above — use **block Publish** + Retry on Details |
| Dual code paths (`if (immediateCoverUpload) … else legacyPublishUpload`) | No feature flag; remove legacy branch entirely |
| Leave dead imports (`uploadSermonCoverForSermon` in `ReviewSubmit.tsx`) | Delete import and call site |
| Upload cover from `ThumbnailUpload.tsx` as a separate publish-step path | Details / `SermonDetailsForm` is the only cover entry in the wizard |
| Server-side “auto-attach cover on publish” if `image` missing | API publish must not accept multipart or synthesize cover; return **400** |
| `@deprecated` wrappers that re-export old publish+cover behaviour | Remove callers, then remove wrapper |

### Required cleanup (delete list)

| Location | Action |
| -------- | ------ |
| `ReviewSubmit.tsx` → `handleSubmit` | **Remove** entire `uploadData.thumbnail` / `uploadSermonCoverForSermon` block |
| `ReviewSubmit.tsx` imports | **Remove** `uploadSermonCoverForSermon` import if unused |
| Any `// fallback` / `// legacy` cover-on-publish comments | **Remove** with the code they guarded |
| Publish handler | **Only** `publishSermonMutation.mutateAsync` after guards — no preceding multipart |

### Correct failure mode

When cover is not synced: **disable or block Publish**, show error, user returns to **Details** to upload or **Retry**. Never compensate silently on Publish.

---

## Behaviour (product)

### Preconditions

1. User is authenticated (Bearer JWT).
2. Audio upload finished: `uploadData.sermonId` set from `POST /sermon/start-upload` ([feat-0008](../feat-0008/PRODUCT.md)).
3. If user picks a cover **before** audio completes: show inline message **"Finish audio upload first"** and keep local preview only; **no API call**.

### When to call the API

| Event | API call |
| ----- | -------- |
| User selects file (drag/drop or file picker) and validation passes | **Yes** — if `sermonId` present |
| User applies crop (`applyCrop` → new `File` blob) | **Yes** — upload cropped bytes (replaces previous server cover) |
| User removes cover locally | **No** delete API in v1; clear client preview; **Publish blocked** until new cover uploaded on Details |
| User leaves Details / Listener step | **Yes** — `updateDraft` → `PUT /sermon/update/:id` for metadata / listener fields |
| User clicks **Save draft** | **No** file uploads; metadata/draft lifecycle only (`POST /sermon/publish/:id` draft and/or `PUT` update) |
| User clicks **Publish** | **No** file uploads — **only** `POST /sermon/publish/:id` (published). Cover must already be on server. |

### API call (canonical)

```http
POST /api/v1/sermon/image-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<image bytes>
sermonId=<mongo sermon _id>
```

Success: **200**, sermon payload includes `image.item` (CDN URL) and `imageUrl`. Web stores CDN URL for preview and marks cover as synced.

Failure: toast with API message; keep local preview; **Retry** affordance on thumbnail tile.

### Client validation (before HTTP)

| Rule | Message |
| ---- | ------- |
| MIME | JPEG, PNG, WebP, GIF |
| Max size | 5 MB |
| Recommended dimensions | 1280×720 (hint only) |

Matches existing `SermonDetailsForm.validateThumbnailFile`.

### UI states (thumbnail region)

| State | User sees |
| ----- | --------- |
| `idle` | Drop zone / pick button |
| `local-only` | Preview; banner if no `sermonId` yet |
| `uploading` | Preview + progress or spinner |
| `uploaded` | Preview from server CDN URL; subtle "Saved" |
| `error` | Preview + error text + Retry |

Footer upload/processing copy ([feat-0018 UPLOAD_MODAL_FOOTER_STATUS](../feat-0018/UPLOAD_MODAL_FOOTER_STATUS.md)) is unchanged; cover upload is independent of audio pipeline polling.

### Audio pipeline polling stop (`uploadStatus: "completed"`)

While the upload modal tracks audio processing, `GET /api/v1/sermon/:id` polling is owned by `UploadModal` ([feat-0018 UPLOAD_STATUS_POLLING_SPEC](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md)).

When the response includes `"uploadStatus": "completed"` (or `failed` / `cancelled`):

- Stop interval polling **immediately** in that request/response cycle ([P4b](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md#p4b--stop-on-terminal-response-requestresponse-cycle)).
- Do **not** schedule another poll after a terminal response.
- Cover upload (`POST /sermon/image-upload`) is separate and does not affect `item.uploadStatus` poll stop.

### Draft resume

Opening upload wizard for an existing draft (`uploadData.sermonId` or resume route):

1. `GET /api/v1/sermon/:id` ([feat-0011 API](../../../api/feature/feat-0011/PRODUCT.md)).
2. If `image.item` or `imageUrl` present → set `thumbnailPreview` to CDN URL; `coverUploadStatus = 'uploaded'`.
3. Do not re-upload until user picks a new file.

### Alignment with sermon edit

[Sermon edit](../feat-0022/SERMON_EDIT_SPEC.md) today uploads cover on **Save** only. v1 of this spec is **upload modal only**; edit page should follow the same immediate-upload pattern in a follow-up slice (not blocking feat-0032).

---

## Acceptance criteria

1. After audio `sermonId` exists, picking a valid cover on Details triggers **exactly one** `POST /sermon/image-upload` without navigating to Review.
2. Network tab shows multipart `file` + `sermonId` on Details step, not only on Publish.
3. `GET /sermon/:id` after cover upload returns non-empty `image.item` / `imageUrl`.
4. **Save draft** persists metadata without any multipart upload.
5. **Publish** issues **only** `POST /sermon/publish/:id` (published) — **zero** `image-upload` or `start-upload` requests in the same click handler.
6. **Publish** blocked with clear UX when cover not synced to server (no fallback upload on Publish).
7. Metadata (title, description, tags, visibility) persisted via `updateDraft` before Review, not first saved only on Publish.
8. Replacing cover triggers a new image-upload on Details; library reflects new URL after invalidation.
9. Upload blocked with clear copy when `sermonId` missing.
10. At most one in-flight cover upload per modal session (`sermonId` + file signature debounce).
11. **No legacy code:** grep for `uploadSermonCoverForSermon` under `ReviewSubmit` / Publish path returns **zero** matches ([§ No fallback, no legacy](#no-fallback-no-legacy-hard-requirement)).
12. **No fallback branches** in Publish handler (no `if (!uploaded) await uploadCover(...)`).
13. When `GET /sermon/:id` returns `"uploadStatus": "completed"`, pipeline polling stops in that response cycle — no further interval polls ([feat-0018 P4b](../feat-0018/UPLOAD_STATUS_POLLING_SPEC.md#p4b--stop-on-terminal-response-requestresponse-cycle)).

---

## Out of scope (v1)

- Server endpoint to **delete** cover only (remove = local clear; publish may still require image)
- Auto-generate thumbnail from audio waveform
- Mobile upload modal
- Image dimension enforcement server-side (client hints only)
- Sermon edit page parity (noted as follow-up)

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Web files, state, hook, sequence |
| [feat-0014 API PRODUCT](../../../api/feature/feat-0014/PRODUCT.md) | Endpoint, S3, access, response |
| [feat-0018 PRODUCT](../feat-0018/PRODUCT.md) | Upload wizard host |
| [feat-0012 API](../../../api/feature/feat-0012/PRODUCT.md) | CDN URL must load in browser |
| [feat-0027 DRAFT_UPLOAD_MODAL_SPEC](../feat-0027/DRAFT_UPLOAD_MODAL_SPEC.md) | Resume draft into modal |

---

## Success signal

Details step: user picks cover → Network shows `POST …/sermon/image-upload` → 200 → metadata saved on step exit → Review **Publish** shows **only** `POST …/sermon/publish/:id` (no cover POST); My Sermons row shows thumbnail from `imageUrl`.
