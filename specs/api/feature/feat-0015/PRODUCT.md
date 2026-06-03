# feat-0015: Sermon cover image — field contract (`image` vs `imageUrl`)

## Summary

Every sermon cover is represented by **two distinct fields** on `ISermonDoc` (`apps/api/src/interfaces/core/sermon.interface.ts`):

| Field | Interface lines | Role |
| ----- | ---------------- | ---- |
| **`image`** | `ImageSource` subdocument (~100–102) | **Original upload provenance** — what was stored in S3, who uploaded it, dimensions, pipeline status |
| **`imageUrl`** | top-level string (~38–39) | **CDN delivery URL** — the only browser-facing cover URL for grids, player art, and share cards |

This spec is the **canonical data contract** for all sermon still images. It clarifies and supersedes conflicting guidance in [feat-0008](../feat-0008/PRODUCT.md) and [feat-0014](../feat-0014/PRODUCT.md) that treated `image.item` as a CDN URL.

Upload flow and endpoint behaviour remain in [feat-0014](../feat-0014/PRODUCT.md). CDN infra and `storage.troott.com` remain in [feat-0008](../feat-0008/PRODUCT.md). **This feature defines what each field stores and what clients must read.**

---

## Problem

| Today | Impact |
| ----- | ------ |
| `handleSermonImage` writes the **same CDN URL** into `image.item` and `imageUrl` | Breaks the provenance / delivery split modeled in the interface |
| `sermon.mapper` runs `toStoragePublicUrl` on `image.item` | Masks the bug; clients cannot tell original from CDN |
| Publish validation message says **"Original Sermon image URL"** but checks a CDN-shaped value | Confusing audits and migrations |
| Web/docs say use `image.item` **or** `imageUrl` for `<img>` | Two sources of truth; wrong field may 403 (raw S3) or 404 (path mismatch) |

Audio already follows the correct pattern: **`item.item`** = original object in `troott-originals`; **`playbackUrl` / `manifestUrl`** = CDN delivery. Sermon covers must mirror that split.

---

## Canonical field semantics

### `image: ImageSource` — original (NOT CDN)

Persist the full subdocument defined in `sermon.interface.ts`:

```ts
interface ImageSource {
  item: string;       // original storage reference — see below
  itemId: string;     // uploadId; basename of S3 key
  width, height, size, fileType, mimetype,
  uploadedBy, uploadStatus, createdAt, updatedAt
}
```

**`image.item` (stored value)**

- **Must be** the S3 PutObject **`Location`** for the object in **`troott-storage`** (same pattern as `item.item` for audio with `useS3Location: true`).
- Example: `https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-2026-06-03-17-54-00.png`
- **Must not be** `buildStoragePublicUrl(...)`, `storage.troott.com`, or any CDN hostname on **new writes**.
- **Purpose:** audit trail, re-processing, orphan cleanup, publish validation that a cover exists — **not** `<img src>`.

**`image.itemId`**

- Same `uploadId` used in the S3 key: `images/{uploadId}.{ext}` ([feat-0012](../feat-0012/PRODUCT.md)).

### `imageUrl: string` — CDN delivery

- **Must be** `buildStoragePublicUrl(s3Key)` where `s3Key` matches the uploaded object ([feat-0008](../feat-0008/PRODUCT.md)).
- Example: `https://storage.troott.com/images/file-image-2026-06-03-17-54-00.png`
- **Purpose:** every client render path — upload wizard preview, My Sermons grid, search cards, library rows, player artwork, Open Graph.

---

## Parity with audio (reference model)

| Concern | Audio | Cover image |
| ------- | ----- | ----------- |
| Provenance subdocument | `item: SermonSource` | `image: ImageSource` |
| Original object URL | `item.item` → S3 Location (`troott-originals`) | `image.item` → S3 Location (`troott-storage`) |
| Stable id | `item.itemId` → `uploadId` | `image.itemId` → `uploadId` |
| CDN delivery | `playbackUrl`, `manifestUrl` | **`imageUrl`** |
| Client `<img>` / thumbnail | Never `item.item` | **`imageUrl` only** |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-SIMG01 | Platform engineer | One documented write contract for cover uploads | Mongo rows are consistent and auditable |
| UC-SIMG02 | Web/mobile client | A single display field (`imageUrl`) | No fallback logic between `image.item` and CDN |
| UC-SIMG03 | Minister in studio | Cover preview after upload to use CDN URL | Private bucket S3 Location never hits the browser |
| UC-SIMG04 | Operator | `image.item` to point at the real S3 object | Cleanup jobs and support can `head-object` by URL or `itemId` |
| UC-SIMG05 | Publish pipeline | Validation to require provenance, not CDN in `image.item` | Publish gates match stored semantics |

---

## Write paths (API)

| Action | Endpoint / code | Sets `image` | Sets `imageUrl` |
| ------ | ----------------- | -------------- | ----------------- |
| Cover upload | `POST /sermon/image-upload` → `handleSermonImage` | Full `ImageSource`; `item` = S3 Location | CDN from `buildStoragePublicUrl(s3Key)` |
| Publish | `POST /sermon/publish/:id` | **Must not** replace `image.item` with CDN | May pass through existing `imageUrl`; must not clear if omitted |
| Draft update | `PUT /sermon/update/:id` | **Must not** accept client-supplied CDN into `image.item` | Optional metadata only if explicitly in scope |

**Replace cover:** second `image-upload` overwrites both fields; previous S3 object may orphan (unchanged from feat-0014).

---

## Read paths (API responses)

| Consumer | Use for `<img>` / thumbnail | Do not use |
| -------- | --------------------------- | ---------- |
| Web upload wizard ([feat-0032](../../web/feature/feat-0032/PRODUCT.md)) | `imageUrl` | `image.item` |
| My Sermons / studio lists | `imageUrl` | `image.item` |
| Search / library / playlist cards | `imageUrl` | `image.item` |
| Player / share surfaces | `imageUrl` | `image.item` |

**`image` on GET:** return provenance metadata (`itemId`, `width`, `height`, `uploadStatus`, etc.). **`image.item` in JSON responses must not be promoted as a display URL** — mappers apply `toStoragePublicUrl` only to **`imageUrl`**, not to `image.item`. Optional: omit `image.item` from public DTOs in a later tightening; v1 may pass through stored S3 Location for owner/debug with client rule above.

Legacy Mongo rows that stored CDN in `image.item`: **GET still serves CDN via `imageUrl`**; migration/backfill moves CDN out of `image.item` (see [TECH.md](./TECH.md)).

---

## Publish validation

`validateSermonReadyToPublish` requires:

1. `data.image` present.
2. `data.image.itemId` non-empty (or equivalent: subdocument exists from prior `image-upload`).
3. `data.image.item` non-empty **original reference** (S3 Location or restorable key) — **not** a CDN hostname check.
4. `data.imageUrl` non-empty CDN URL for catalog surfaces after publish.

**Must not** require `image.item` to equal `imageUrl` or to contain `storage.troott.com`.

---

## Acceptance criteria

1. After `POST /sermon/image-upload`, Mongo document has **`image.item`** = S3 Location and **`imageUrl`** = `storage.troott.com/...` (different hostnames).
2. `GET /sermon/:id` returns **`imageUrl`** that returns HTTP 200 + image `Content-Type` in browser/`curl -I` ([feat-0012](../feat-0012/PRODUCT.md)).
3. No client spec instructs using **`image.item`** for thumbnail render; **`imageUrl`** is canonical ([feat-0011 web](../../web/feature/feat-0011/PRODUCT.md) alignment).
4. `handleSermonImage` uses `uploadFileToBucket(..., { useS3Location: true })` for **`image.item`** and separate `buildStoragePublicUrl(s3Key)` for **`imageUrl`** (see TECH).
5. Aggregate mappers (`search`, `library`, `playlist`, `studio`) map **`imageUrl`** only via `toStoragePublicUrl`; **`image.item`** is not CDN-mapped.
6. Interface JSDoc updated: `ImageSource.item` = original S3 reference; `imageUrl` = CDN (implementation follow-up in TECH).
7. Conflicting feat-0008 / feat-0014 bullets that require CDN in **`image.item`** are superseded by this spec.

---

## Out of scope

- Multiple renditions / responsive srcset
- `DELETE` cover-only endpoint
- Series / playlist **banner** images (same `ImageSource` type but separate documents — reuse this contract when those paths are audited)
- HLS / playback bucket imagery

---

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Code paths, mapper matrix, migration, implementation checklist |
| [feat-0014 PRODUCT](../feat-0014/PRODUCT.md) | When upload fires; ownership; no publish-time upload |
| [feat-0008 PRODUCT](../feat-0008/PRODUCT.md) | CDN origin, `buildStoragePublicUrl`, infra |
| [feat-0032 web PRODUCT](../../web/feature/feat-0032/PRODUCT.md) | Web uses `imageUrl` for preview and publish gate |
| [feat-0006 PRODUCT](../feat-0006/PRODUCT.md) | Sermon pipeline; cover required before publish |
