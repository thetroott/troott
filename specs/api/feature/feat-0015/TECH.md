# feat-0015: Tech Spec — Sermon cover `image` vs `imageUrl`

## Context

See [PRODUCT.md](./PRODUCT.md). Source types: `apps/api/src/interfaces/core/sermon.interface.ts`.

```ts
// Delivery — CDN only
imageUrl: string;

// Provenance — original upload metadata (NOT CDN)
image: ImageSource;
```

---

## Target write contract (`handleSermonImage`)

**File:** `apps/api/src/services/core/sermon.service.ts`

Mirror audio upload (`handleSermonUpload`):

| Step | Audio (`item`) | Cover (`image` + `imageUrl`) |
| ---- | -------------- | ------------------------------ |
| Bucket | `troott-originals` | `troott-storage` |
| Upload option | `{ useS3Location: true }` | `{ useS3Location: true }` for **`image.item`** |
| `*.item` field | `uploadPayload.rawFile` (S3 Location) | `uploadPayload.rawFile` (S3 Location) |
| CDN field | `playbackUrl` / `manifestUrl` (jobs) | **`imageUrl`** = `buildStoragePublicUrl(s3Key)` |
| `itemId` | `uploadId` | `uploadId` |

**Target persistence:**

```ts
const uploadResult = await storageService.uploadFileToBucket(
  data,
  StorageBucket, // troott-storage
  { useS3Location: true },
);
const { s3Key, rawFile } = uploadResult.data;

const image: ImageSource = {
  item: rawFile,                              // S3 Location — NOT CDN
  itemId: uploadId,
  // width, height, size, fileType, mimetype, uploadedBy, uploadStatus, timestamps
};

await Sermon.findByIdAndUpdate(sermonId, {
  image,
  imageUrl: buildStoragePublicUrl(s3Key),    // CDN — ONLY here
  status: MediaStatus.DRAFT,
});
```

**Current bug (to fix):** both fields set to `publicImageUrl` from `{ publicUrl: buildStoragePublicUrl }` (~lines 247–291).

---

## Sequence (cover upload)

```mermaid
sequenceDiagram
    participant Web
    participant Svc as handleSermonImage
    participant Storage as uploadFileToBucket
    participant S3 as troott-storage
    participant DB as Sermon

    Web->>Svc: multipart + sermonId
    Svc->>Storage: PutObject images/{uploadId}.ext
    Storage->>S3: object + Content-Type
    Storage-->>Svc: s3Key, rawFile (S3 Location)
    Svc->>Svc: imageUrl = buildStoragePublicUrl(s3Key)
    Svc->>DB: image.item = rawFile; imageUrl = CDN
    Svc-->>Web: 200 SermonDTO (imageUrl for preview)
```

---

## Read / mapper contract

### Primary rule

**`toStoragePublicUrl` applies to `imageUrl` only.** Do not CDN-map `image.item` on read — it is already the original reference (or legacy bad data — see migration).

### Surface inventory (sermon cover)

| Surface | File | Field(s) | Action |
| ------- | ---- | -------- | ------ |
| Sermon detail / owner GET | `mappers/sermon.mapper.ts` → `mapSermon` | `imageUrl` | `toStoragePublicUrl(sermon.imageUrl)` |
| Same | `mapSermon` | `image.item` | Pass stored value or omit; **no** `toStoragePublicUrl` |
| Upload response | `mapUploadSermonImage` (if used) | `file` / `imageUrl` | CDN only |
| Search cards | `mappers/search.mapper.ts` | `imageUrl` | `toStoragePublicUrl` |
| Library rows | `mappers/library.mapper.ts` | `imageUrl` | `toStoragePublicUrl` |
| Playlist / series cards | `mappers/playlist.mapper.ts` | sermon `imageUrl` | `toStoragePublicUrl` |
| Studio aggregates | `mappers/studio.mapper.ts` | `imageUrl` | `toStoragePublicUrl` |
| Publish DTO build | `sermon.service.ts` → `buildSermonPipelineDTO` | both | Read from doc; do not synthesize CDN into `image.item` |
| Publish persist | `handlePublishSermon` | `imageUrl` optional in payload | Must not overwrite `image` subdocument with CDN-only payload |

**Regression grep:**

```bash
rg 'image\.item|imageUrl' apps/api/src/mappers apps/api/src/services/core/sermon.service.ts
```

---

## DTO / validation

**File:** `sermon.service.ts` → `validateSermonReadyToPublish`

| Check | Target |
| ----- | ------ |
| Cover exists | `data.image` && (`data.image.itemId` \|\| `data.image.item`) |
| Original reference | `data.image.item` non-empty string (S3 Location acceptable) |
| CDN ready | `data.imageUrl` non-empty (catalog render) |
| Anti-pattern | Reject logic that treats `image.item` host === `storage.troott.com` as success for **writes** |

Error copy (optional tighten): keep **"Image File is required"** for missing subdocument; **"Original Sermon image URL is required"** applies to missing **`image.item`**, not missing CDN.

**Publish payload:** `buildPublishSermonDTO` / `buildSermonPipelineDTO` should pass through stored `doc.image` unchanged; `imageUrl` from `doc.imageUrl`.

---

## Interface JSDoc (follow-up)

Update misleading comments in `sermon.interface.ts`:

| Line | Current | Target |
| ---- | ------- | ------ |
| `ImageSource.item` | "S3 / CDN URL of the original image file" | "S3 Location URL of the original image object in troott-storage (not CDN)" |
| `ISermonDoc.imageUrl` | (already correct) | "CDN URL of the sermon's cover image for client rendering" |

---

## Client contracts

### Web ([feat-0032](../../web/feature/feat-0032/PRODUCT.md))

| Use case | Field |
| -------- | ----- |
| Thumbnail preview after upload | `response.data.imageUrl` |
| Resume draft | `GET /sermon/:id` → `imageUrl` |
| Publish gate | `coverUploadStatus === 'uploaded'` **and** non-empty `imageUrl` (or `image.itemId` on doc) |
| **Remove** | Fallback `<img src={image.item}>` when `imageUrl` missing |

### Mobile / web catalog

Per [feat-0011 web](../../web/feature/feat-0011/PRODUCT.md): consume **`imageUrl`** from API; no client-side CDN construction.

---

## Legacy / migration

| Stored state | `imageUrl` GET | `image.item` GET | Backfill |
| ------------ | -------------- | ---------------- | -------- |
| Correct (S3 + CDN) | CDN via mapper | S3 Location (not for img) | None |
| CDN in both fields | CDN | Wrong (CDN) | If `itemId` set: rewrite `image.item` to S3 Location from key; else manual |
| CDN in `image.item`, empty `imageUrl` | Map from `itemId` | Wrong | Set `imageUrl = buildStoragePublicUrl(images/{itemId})` |
| Raw S3 in `imageUrl` | `toStoragePublicUrl` on GET | S3 | Optional Mongo backfill of `imageUrl` |

Optional one-off script (out of v1 code path): scan `sermons` where `image.item` matches `storage.troott.com` and restore S3 Location from `image.itemId` + bucket config.

---

## Implementation checklist

| # | Task | File(s) |
| - | ---- | ------- |
| 1 | Split write: `useS3Location` + separate `imageUrl` | `sermon.service.ts` `handleSermonImage` |
| 2 | Stop CDN-mapping `image.item` on GET | `sermon.mapper.ts` |
| 3 | Confirm aggregate mappers only touch `imageUrl` | `search`, `library`, `playlist`, `studio` mappers |
| 4 | Publish must not clobber `image` with CDN | `handlePublishSermon` |
| 5 | Update interface JSDoc | `sermon.interface.ts` |
| 6 | Align feat-0014 TECH response table (`image.item` ≠ display URL) | `specs/api/feature/feat-0014/TECH.md` cross-link |
| 7 | Web: preview from `imageUrl` only | `ReviewSubmit`, `SermonDetailsForm`, resume helpers |
| 8 | Unit test: after upload mock, assert `image.item` host ≠ `imageUrl` host | `apps/api/test/` |

---

## Testing

| Test | Assert |
| ---- | ------ |
| `handleSermonImage` happy path | `image.item` contains `amazonaws.com` or bucket endpoint; `imageUrl` contains `CLOUDFRONT_STORAGE_URL` |
| `mapSermon` | `imageUrl` passed through `toStoragePublicUrl`; `image.item` unchanged |
| Publish with cover on row | Passes validation; does not rewrite `image.item` to CDN |
| `curl -I` on GET `imageUrl` | 200 + image content-type |

---

## Supersedes (partial)

These statements are **replaced** by feat-0015 for sermon covers:

- feat-0008 PRODUCT AC #1: "`sermon.image.item`" in "no browser-facing field" — **`image.item` is not browser-facing**; **`imageUrl`** is.
- feat-0008 TECH stored-value matrix row "`image.item` = CDN URL (same as imageUrl)" — **wrong**; target is S3 Location + CDN split.
- feat-0014 TECH response table "`data.image.item` — CDN URL for `<img>`" — use **`data.imageUrl`** instead.

Cross-links remain valid for endpoint timing, ownership, and CDN infra.
