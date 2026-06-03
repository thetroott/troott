# feat-0008: Storage stills CDN delivery (`storage.troott.com`)

## Summary

All **still images** in the **`troott-storage`** bucket (sermon covers, KYC verification photos, profile avatars/banners via `POST /storage/upload`) must be **written and returned as CDN URLs** on `CLOUDFRONT_STORAGE_URL` (e.g. `https://storage.troott.com`), not as raw S3 `Location` strings.

Today the platform mixes:

- CDN-shaped paths **without file extensions** (by design for `uploadId` keys)
- Raw S3 URLs persisted on documents and returned on **GET** — which **must not** be used in browsers when the bucket is private

Example of **wrong** API output (observed on `GET /minister`):

```json
"verification": {
  "document": {
    "type": "national_identity_number",
    "frontPage": "https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-2026-06-03-15-34-03"
  }
}
```

Expected after fix:

```json
"frontPage": "https://storage.troott.com/images/file-image-2026-06-03-15-34-03"
```

(No `.jpg` suffix required if S3 `Content-Type` is `image/jpeg`.)

Sermon covers also use a CDN path that may not match the S3 key (`/sermon/image/…` vs `images/…`) — see [TECH.md](./TECH.md).

This feature defines the **URL ↔ S3 key contract**, **API response rules**, infra checklist, and acceptance criteria so images load in studio, verification, and profile surfaces.

**Incident diagnosis (CDN URL in new tab fails):** [feat-0012 PRODUCT](./feature/feat-0012/PRODUCT.md) — request/response cycle, layer matrix, `curl`/`head-object` runbook. Missing `.jpg` in the URL is **not** the root cause.

## Problem

| Symptom | User impact |
| ------- | ----------- |
| CDN URL has **no file extension** (`.jpg`, `.png`) | Normal for `uploadId`-based keys; OK when `Content-Type` is set on the object |
| **GET returns `*.s3.*.amazonaws.com/...`** | Browser `<img>` fails with 403 on private bucket; wrong URL leaked to clients |
| Browser shows HTTPS / **no available server** on `storage.troott.com` | CDN origin path/SSL mismatch; object may never be fetched |
| Upload succeeds but preview/list thumbnail blank | Public URL points to wrong path or raw S3 |
| Sermon: `image.item` = S3, `imageUrl` = CDN | Inconsistent; clients may pick the broken URL |
| Minister KYC: `verification.document.frontPage` = S3 Location | Verification preview and admin review break |

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-COV01 | Minister uploading a cover | The thumbnail to appear immediately after upload | I can confirm the right artwork in the wizard |
| UC-COV02 | Minister in My Sermons | Grid rows to show cover art from `imageUrl` | Drafts look like YouTube Studio |
| UC-COV03 | Listener (published sermon) | Cover art to load over HTTPS from the CDN | Share cards and player art work |
| UC-COV04 | Operator | A clear runbook when CDN fails | We fix origin/SSL/path in minutes, not guesswork |
| UC-COV05 | Minister submitting KYC | `GET /minister` to return CDN URLs for `verification.document.*` | Document preview works without S3 credentials |
| UC-COV06 | Any storage upload client | `POST /storage/upload` `ImageDTO.file` to be CDN URL, not `Location` | Upload preview matches GET behavior |
| UC-COV07 | Engineer implementing fix | A phased plan + stored-value matrix + owner GET mapper spec | Ship P0/P1 without missing aggregate mappers |

## Implementation phases (summary)

| Phase | Delivers | User-visible |
| ----- | -------- | ------------ |
| **P0** | `storage-url.util` + upload/sermon write paths | New uploads get CDN URLs immediately |
| **P1** | Owner `GET /minister` / `GET /creator` + cache fix | KYC `frontPage` loads; profile refetch fixed |
| **P2** | Public profile + search/library/sermon mappers | Catalog thumbnails + legacy rows |
| **P3** | CDN infra OAC/TLS + optional Mongo backfill | Production CDN reliability |

Detail: [TECH.md § Implementation plan](./TECH.md#implementation-plan-phased).

## Scope

**In scope**

- Shared **`buildStoragePublicUrl(s3Key)`** (or equivalent) for all `troott-storage` stills
- Sermon cover upload (`handleSermonImage`) — `imageUrl` and `image.item`
- General upload (`storage.service.uploadFile`) — `rawFile` / `ImageDTO.file`
- Minister/creator verification — persist and map `verification.document.frontPage` (and back page if used) to CDN on write and on **GET**
- Minister/creator profile avatar/banner on GET (align with [`profile-image-display-spec.md`](../../profile-image-display-spec.md))
- `CLOUDFRONT_STORAGE_URL` / `storage.troott.com` origin mapping (path 1:1 with `images/{uploadId}`, etc.)
- Object `Content-Type`, bucket policy / OAC, TLS, DNS
- Extension policy (optional suffix; not required for browser render)
- Phased rollout P0–P3 ([TECH.md § Implementation plan](./TECH.md#implementation-plan-phased))
- Full codebase image surface inventory + regression grep ([TECH.md § Image URL surface inventory](./TECH.md#image-url-surface-inventory-codebase-audit))

**Out of scope**

- HLS playback CDN (`CLOUDFRONT_PLAYBACK_URL` / `troott-playback`)
- Client-side URL building on web (API owns URLs per feat-0011)
- Storing raw S3 `Location` as the long-term display URL (may keep `s3Key` internally)

## Acceptance criteria

1. **No browser-facing field** on new uploads/updates contains `*.s3.*.amazonaws.com` when `CLOUDFRONT_STORAGE_URL` is configured — including `verification.document.frontPage`, `sermon.image.item`, `ImageDTO.file`, and `sermon.imageUrl`.
2. `GET /minister` (and creator equivalent) returns verification document URLs on **`https://storage.troott.com/images/{uploadId}`** (or documented path), matching the S3 key — **without** requiring a file extension in the URL.
3. After `POST /sermon/image-upload`, `GET /sermon/:id` → `imageUrl` returns **HTTP 200** + image `Content-Type` in browser/`curl -I`.
4. S3 object exists at the key the CDN origin resolves (verified with `aws s3api head-object`).
5. CDN path and S3 key follow **one documented mapping** (see [TECH.md](./TECH.md)); no silent mismatch between `images/…` and `sermon/image/…`.
6. Runbook in TECH covers SSL, DNS, bucket policy, and origin path.
7. Legacy Mongo rows that still store raw S3 URLs are **mapped to CDN on GET** (or backfilled) so existing ministers (e.g. verification doc above) display without manual DB edits.
8. **Surface inventory** in [TECH.md § Image URL surface inventory](./TECH.md#image-url-surface-inventory-codebase-audit) is implemented or explicitly waived — no unmapped mapper/read path left for `troott-storage` stills.

## Related

| Doc | Role |
| --- | ---- |
| [TECH.md](./TECH.md) | Root causes, path contract, surface inventory, implementation plan, helper API |
| [media-compute-deployment-plan.md](../../media-compute-deployment-plan.md) | Three buckets, CDN split playback vs storage |
| [profile-image-display-spec.md](../../profile-image-display-spec.md) | Profile stills on same storage bucket |
| [feat-0006 PRODUCT](../feat-0006/PRODUCT.md) | Sermon upload pipeline; cover required before publish |
| [feat-0011 web PRODUCT](../../../web/feature/feat-0011/PRODUCT.md) | Web must consume API URLs only |
