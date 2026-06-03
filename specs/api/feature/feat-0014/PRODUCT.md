# feat-0014: Sermon cover image upload (`POST /sermon/image-upload`)

## Summary

Studio users attach a **cover / thumbnail** to a draft sermon through `POST /api/v1/sermon/image-upload`. The Upload modal must call this endpoint **as soon as** the user confirms a cover image ([feat-0032 web PRODUCT](../../web/feature/feat-0032/PRODUCT.md)), not only at publish time.

This spec defines the API contract, persistence, access control, and how cover data satisfies publish validation (`validateSermonReadyToPublish` requires `image` and `image.item`).

Related: [feat-0008](../feat-0008/PRODUCT.md) storage CDN, [feat-0012](../feat-0012/PRODUCT.md) browser-loadable URLs, [feat-0006](../feat-0006/PRODUCT.md) sermon pipeline.

---

## Problem

| Gap | Impact |
| --- | ----- |
| Web deferred cover POST to publish | Draft rows missing `image` → publish 400 **Image File is required** |
| No ownership gate on image-upload | Any authenticated user could attach to another user's `sermonId` if id known |
| `uploadedBy` optional on multipart file | Audit trail incomplete |
| Error mapping always 500 in controller | Client cannot distinguish 404 vs validation |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-IMGUP01 | Minister / creator | To upload cover for my draft sermon id | Publish validation passes |
| UC-IMGUP02 | Security | Non-owners blocked from image-upload | No cross-tenant writes |
| UC-IMGUP03 | Web upload modal | Stable 200 envelope with CDN URL in `image.item` | Preview and library use same URL |
| UC-IMGUP04 | Operator | Correct HTTP status on failure | Logs and client toasts match reality |
| UC-IMGUP05 | Web Review step | Publish calls only `POST /sermon/publish/:id` | No `image-upload` bundled into Publish ([feat-0032](../../web/feature/feat-0032/PRODUCT.md)) |

---

## Endpoint

```http
POST /api/v1/sermon/image-upload
Authorization: Bearer <JWT>
Content-Type: multipart/form-data
```

| Field | Required | Notes |
| ----- | -------- | ----- |
| `file` | Yes | Single image; stream via `upload.mdw` |
| `sermonId` | Yes | Mongo `_id` of existing sermon row (from audio start-upload) |

**Router:** `sermon.router.ts` — `Protect`, `uploadHandler`, `uploadSermonImage`  
**Handler:** `sermon.controller.uploadSermonImage`  
**Service:** `sermon.service.handleSermonImage`

---

## Behaviour

### Happy path

1. JWT passes `Protect`.
2. Controller resolves `sermonId` from body; rejects 400 if missing.
3. **Owner check:** caller may upload only if `sermon.service.isSermonOwnedByUser(userId, doc)` ([feat-0011](../feat-0011/PRODUCT.md)).
4. Multipart `file` validated (image MIME allowlist in upload middleware / service).
5. `storage.service.uploadFileToBucket` → `troott-storage`, folder `images`, key `images/{uploadId}.{ext}`.
6. `Sermon.findByIdAndUpdate` sets `image` subdocument + `imageUrl` (CDN URL).
7. Invalidate sermon detail + list caches (existing controller logic).
8. Return **200** + mapped sermon DTO.

### Replace

Second POST for same `sermonId` **overwrites** `image` and `imageUrl`; previous S3 object may remain orphaned (v1 acceptable; deep cleanup out of scope).

### Publish dependency

`validateSermonReadyToPublish` checks:

- `data.image` present
- `data.image.item` non-empty CDN/original URL

Those fields come from the sermon document built in `buildPublishSermonDTO` → `buildSermonPipelineDTO`. **Cover must already be on the row** via `POST /sermon/image-upload` on the Details step ([feat-0032](../../web/feature/feat-0032/PRODUCT.md)). **`POST /sermon/publish/:id` must not upload cover** — web blocks Publish if `image.item` is missing.

---

## No fallback, no legacy (API)

| Rule | Detail |
| ---- | ------ |
| Publish handler | **Must not** accept multipart image or call `handleSermonImage` |
| No “helpful” publish side effect | If `doc.image` missing at publish validation → **400** with clear message; do not auto-upload from publish body |
| No deprecated dual endpoints | Single cover path: `POST /sermon/image-upload` only |
| Remove client legacy, not server shim | API does not add publish-time cover upload “for old web clients” |

Web deletion rules: [feat-0032 § No fallback, no legacy](../../web/feature/feat-0032/PRODUCT.md#no-fallback-no-legacy-hard-requirement).

---

## Acceptance criteria

1. Authenticated owner receives **200** and persisted `image.item` + `imageUrl`.
2. Non-owner receives **404** (`sermon not found`) or **403** — no enumeration; align with `GET /sermon/:id` policy.
3. Missing `sermonId` or `file` → **400**.
4. Unknown sermon id → **404**.
5. S3 key includes file extension ([feat-0012](../feat-0012/PRODUCT.md)).
6. Response JSON never returns raw `*.s3.amazonaws.com` for public URL ([feat-0008](../feat-0008/PRODUCT.md)).
7. `uploadedBy` on `image` subdocument set from JWT user id.
8. Controller propagates service `code` (not always 500).
9. Web **Publish** handler never invokes `image-upload` ([feat-0032 § Wizard action boundaries](../../web/feature/feat-0032/PRODUCT.md#wizard-action-boundaries-canonical)).
10. **No legacy/fallback:** API does not add publish-time cover upload or multipart on `POST /sermon/publish/:id` for backward compatibility ([feat-0032 § No fallback](../../web/feature/feat-0032/PRODUCT.md#no-fallback-no-legacy-hard-requirement)).

---

## Out of scope

- `DELETE` cover-only endpoint
- Image transcoding / multiple renditions
- Minister profile or KYC images (see `POST /storage/upload`, profile specs)

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Code paths, sequence, implementation gaps |
| [feat-0032 web](../../web/feature/feat-0032/PRODUCT.md) | When web calls this endpoint |
| [feat-0011](../feat-0011/PRODUCT.md) | Sermon access for owner check |
