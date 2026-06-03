# feat-0008: Tech Spec — Storage stills CDN delivery

## Context

See [PRODUCT.md](./PRODUCT.md). Two related failure modes:

**A. Wrong CDN path (sermon covers)**

```text
https://storage.troott.com/sermon/image/file-image-2026-06-03-15-23-05
```

**B. Raw S3 URL returned on GET (verification, storage upload, `image.item`)**

```json
"frontPage": "https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-2026-06-03-15-34-03"
```

Extensionless paths are **by design** (`uploadId` = object name). Browsers render without `.jpg` when `Content-Type` is correct.

**“HTTPS error / no available server”** on CDN URLs usually indicates **CDN → origin** failure (TLS, DNS, 404 at origin, private bucket without OAC).

**403 on `*.s3.*.amazonaws.com`** in the browser is expected when the bucket is private — the API must not expose that URL as the display URL.

---

## Current implementation (as of codebase audit)

### Upload path

`apps/api/src/services/core/sermon.service.ts` — `handleSermonImage`:

| Step | Value |
| ---- | ----- |
| S3 bucket (dev) | `AWS_STORAGE_BUCKET` (`troott-storage`) |
| S3 key | `{folder}/{uploadId}` where folder = `images` for `image/jpeg`, `image/png`, etc. |
| Example key | `images/file-image-2026-06-03-15-23-05` |
| `Content-Type` | Set from multipart `mimeType` on `PutObject` |
| `image.item` | `s3Response.Location` (raw S3 HTTPS URL) |
| `imageUrl` | From `buildSermonImageUrl(uploadId)` |

### CDN URL builder

`apps/api/src/utils/audio.util.ts`:

```ts
function buildSermonImageUrl(uploadId: string): string {
  const base = (process.env.CLOUDFRONT_STORAGE_URL || '').replace(/\/$/, '');
  return `${base}/sermon/image/${encodeURIComponent(uploadId)}`;
}
```

Example persisted URL:

```text
https://storage.troott.com/sermon/image/file-image-2026-06-03-15-23-05
```

### Documented bucket layout (deployment plan)

[`media-compute-deployment-plan.md`](../../media-compute-deployment-plan.md):

| Bucket | Example key |
| ------ | ----------- |
| `troott-storage` | `images/{uploadId}` |

There is **no** `sermon/image/` prefix in S3 today.

---

## Root causes (ranked)

### RC-1 — CDN URL path ≠ S3 object key (most likely app + infra gap)

| Layer | Path |
| ----- | ---- |
| **S3 object** | `images/file-image-2026-06-03-15-23-05` |
| **Public URL** | `/sermon/image/file-image-2026-06-03-15-23-05` |

If CloudFront / Cloudflare origin maps the request path **literally** to the bucket root, the origin looks for:

```text
sermon/image/file-image-2026-06-03-15-23-05   ← missing in S3
```

instead of:

```text
images/file-image-2026-06-03-15-23-05        ← actual object
```

**Fix options (pick one, document in infra):**

| Option | App change | Infra change |
| ------ | ---------- | ------------ |
| **A. Origin rewrite** | None | CDN rewrites `/sermon/image/*` → `/images/*` on origin |
| **B. Align S3 key** | Upload to `sermon/image/{uploadId}` | Origin 1:1 path map |
| **C. Align CDN URL** | `buildSermonImageUrl` → `{base}/images/{uploadId}` | Origin 1:1 to `images/*` |

**Recommendation:** **Option C** for new code (matches `getS3Folder` / deployment plan) **or Option A** if marketing URLs must stay `/sermon/image/…` without re-uploading objects.

### RC-2 — `CLOUDFRONT_STORAGE_URL` / origin not configured

If `CLOUDFRONT_STORAGE_URL=https://storage.troott.com` but:

- DNS does not point to a live distribution, or
- Origin bucket is wrong account/region, or
- Origin uses HTTP-only while edge requires HTTPS (Error 525),

the browser shows generic TLS / “no available server” errors.

**Env (see `apps/api/example.env`):**

```env
CLOUDFRONT_STORAGE_URL=https://storage.troott.com
AWS_STORAGE_BUCKET=troott-storage
AWS_REGION=...
```

Playback uses a **separate** base: `CLOUDFRONT_PLAYBACK_URL` → `troott-playback` only.

### General storage upload (`POST /storage/upload`)

`apps/api/src/services/storage.service.ts` — `uploadFile`:

| Step | Value |
| ---- | ----- |
| S3 key | `{folder}/{uploadId}` via `getS3Folder(mimeType)` → `images/…` for stills |
| Response `data.s3Key` | e.g. `images/file-image-2026-06-03-15-34-03` |
| Response `data.rawFile` | **`s3Response.Location`** (raw S3 HTTPS URL) — **wrong for clients** |

Web onboarding / verification sends `rawFile` as `document.frontPage` to minister APIs; Mongo stores that string verbatim.

### Minister verification (observed bug)

Flow:

1. Client `POST /storage/upload` → receives `rawFile: https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-…`
2. Client submits verification with `document.frontPage` = that URL
3. `minister.service.submitVerification` persists `verification.document` **as submitted** (no URL normalization)
4. `GET /minister` → mapper returns stored value → browser gets S3 URL

**Correction:** owner `GET /minister` does **not** call any mapper today — it returns the raw repository document (then Redis-caches it). `mapMinisterProfile` is only used for **public** `GET /minister/:id` and omits `verification.document` entirely. `mapMinisterResponse` exists but is **unused** and also omits `verification.document`.

Example broken response:

```json
"verification": {
  "document": {
    "type": "national_identity_number",
    "frontPage": "https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-2026-06-03-15-34-03"
  }
}
```

**Expected after fix:**

```json
"frontPage": "https://storage.troott.com/images/file-image-2026-06-03-15-34-03"
```

Fix at **three layers**:

| Layer | Action |
| ----- | ------ |
| Upload response | Return CDN URL in `rawFile` / `ImageDTO.file`; keep `s3Key` internal |
| Write path | Normalize to CDN before `$set` on verification (defense in depth) |
| Read path | Map legacy S3 URLs → CDN in minister/creator mappers |

### RC-3 — Bucket private without OAC / public read

Upload uses IAM (`PutObject`). Browser `GET` uses **anonymous CDN → origin**.

Storage bucket must allow the CDN origin principal (CloudFront OAC or Cloudflare R2 public bucket policy). IAM user upload success does **not** imply public read.

### RC-4 — Wrong `Content-Type` (less likely here)

Upload sets `ContentType: mimeType`. If a proxy strips it or upload used `application/octet-stream`, some clients refuse to render.

Verify with:

```bash
aws s3api head-object \
  --bucket troott-storage \
  --key images/file-image-2026-06-03-15-23-05 \
  --query '{ContentType:ContentType,ContentLength:ContentLength}'
```

### RC-5 — Extensionless filename (usually OK)

Missing `.jpg` in the URL is **not** required for S3 or CloudFront when `Content-Type` is set. Optional future improvement: append extension to key for human debugging (`images/{uploadId}.jpg`) — requires migration or dual-key strategy.

### RC-6 — Dual URL on document

| Field | Typical value today |
| ----- | ------------------- |
| `image.item` | `https://troott-storage.s3.{region}.amazonaws.com/images/...` |
| `imageUrl` | `https://storage.troott.com/sermon/image/...` |

Web should prefer **`imageUrl`** for display ([feat-0011](../../../web/feature/feat-0011/PRODUCT.md)). Fallback to `image.item` only if CDN URL missing; raw S3 may 403 on private buckets.

### RC-7 — API persists and returns raw S3 `Location` (verification + storage upload)

| Source | Field | Value today |
| ------ | ----- | ----------- |
| `storage.service.uploadFile` | `data.rawFile` | `s3Response.Location` |
| Minister `verification.document` | `frontPage` | Client-pasted S3 URL from upload |
| `GET /minister` | `verification.document.frontPage` | Same S3 URL from Mongo |
| `sermon.image` | `item` | `s3Response.Location` |

**Symptoms:** KYC preview blank; `<img src="https://…s3…">` → 403; inconsistent with `CLOUDFRONT_STORAGE_URL` contract.

**Fix:** Shared `buildStoragePublicUrl(s3Key)` (see Target contract). Never assign `s3Response.Location` to browser-facing DTO fields when CDN base is configured.

**Legacy rows:** Mapper helper `toStoragePublicUrl(stored: string)`:

- If already `CLOUDFRONT_STORAGE_URL` host → pass through
- If S3 virtual-hosted URL matching `AWS_STORAGE_BUCKET` → extract key suffix (`images/{uploadId}`) → rebuild CDN URL
- If bare `uploadId` or relative key → prefix with CDN + folder

---

## Infrastructure verification runbook

Run in order when `imageUrl` fails in browser.

### 1. Confirm object exists

```bash
aws s3 ls s3://troott-storage/images/ | grep file-image-2026-06-03-15-23-05
aws s3api head-object \
  --bucket troott-storage \
  --key images/file-image-2026-06-03-15-23-05
```

Expect `ContentType: image/jpeg` (or png/webp).

### 2. Test origin directly (bypass CDN)

```bash
# Virtual-hosted-style (adjust region)
curl -I "https://troott-storage.s3.eu-west-1.amazonaws.com/images/file-image-2026-06-03-15-23-05"
```

- **403** → bucket private; CDN/OAC required (expected for private bucket).
- **404** → wrong key or bucket name.
- **200** → object OK; problem is CDN/DNS/SSL.

### 3. Test CDN URL

```bash
curl -Iv "https://storage.troott.com/sermon/image/file-image-2026-06-03-15-23-05"
```

| Result | Likely cause |
| ------ | ------------- |
| 404 | Path mapping (RC-1) |
| 403 | OAC / bucket policy |
| 525 / SSL error | Origin cert or HTTPS mismatch |
| 522 / timeout | Origin unreachable |
| 200 + `content-type: image/*` | Fixed |

### 4. DNS

```bash
dig storage.troott.com +short
```

Must resolve to CloudFront / Cloudflare edge, not a dead host.

### 5. TLS

```bash
curl -Iv https://storage.troott.com 2>&1 | grep -i 'SSL certificate verify'
```

Certificate must cover `storage.troott.com`.

### 6. CDN origin mapping checklist

Document in infra repo (not in app):

- [ ] Origin = `troott-storage` (correct account + region)
- [ ] Path rewrite: `/sermon/image/*` → `/images/*` **OR** app emits `/images/*` URLs
- [ ] OAC / origin access identity allows `s3:GetObject` on `images/*`
- [ ] Optional: `Cache-Control` / TTL for immutable `uploadId` keys

---

## Target contract (normative after fix)

### Single source of truth

Introduce shared helpers (future code change):

```ts
// Pseudocode — one module e.g. storage-url.util.ts

function storageObjectKey(uploadId: string, mimeType: string): string {
  const folder = getS3Folder(mimeType); // images | audio | …
  return `${folder}/${uploadId}`;
}

function buildStoragePublicUrl(s3Key: string): string {
  const base = (process.env.CLOUDFRONT_STORAGE_URL || '').replace(/\/$/, '');
  if (!base) return ''; // dev fallback: document behavior when unset
  return `${base}/${s3Key.split('/').map(encodeURIComponent).join('/')}`;
}

function buildStoragePublicUrlFromUploadId(uploadId: string): string {
  return buildStoragePublicUrl(`images/${uploadId}`);
}

/** Map stored S3 or CDN string → CDN for GET responses */
function toStoragePublicUrl(stored: string | undefined): string {
  if (!stored) return '';
  // … parse s3.amazonaws.com/{bucket}/images/… or pass-through CDN host
}
```

Deprecate sermon-only `buildSermonImageUrl` `/sermon/image/` segment **or** keep as thin alias only if infra uses RC-1 Option A rewrite.

**Rule:** `head-object` key must match what the CDN origin requests for any public URL.

### File extension policy

| Topic | Decision |
| ----- | -------- |
| URL path | `{uploadId}` only — **no** `.jpg` / `.png` suffix required |
| S3 key | `images/{uploadId}` — same as today |
| Browser render | Relies on S3 object `Content-Type` from upload |
| Optional future | Append extension to key (`images/{uploadId}.jpg`) for ops; requires migration |

Do **not** block this feature on adding extensions; fix CDN host + path + stop leaking S3 URLs first.

### API response

| Field | Content |
| ----- | ------- |
| `ImageDTO.file` / upload `rawFile` | CDN HTTPS URL |
| `ImageDTO` / upload metadata | `s3Key`, `uploadId` for internal/debug |
| `sermon.imageUrl` | CDN HTTPS URL |
| `sermon.image.item` | CDN URL (same as `imageUrl`) or omit raw S3 on new writes |
| `verification.document.frontPage` | CDN HTTPS URL on write and GET |
| Minister/creator avatar, banner | CDN on GET per [profile-image-display-spec.md](../../profile-image-display-spec.md) |

### Environment

| Variable | Purpose |
| -------- | ------- |
| `CLOUDFRONT_STORAGE_URL` | Base for **all** `troott-storage` stills (covers, KYC, avatars) |
| `CLOUDFRONT_PLAYBACK_URL` | HLS only — do not use for images |
| `AWS_STORAGE_BUCKET` | `troott-storage` |

---

## Omissions in v1 spec (addressed here)

The first draft of feat-0008 listed **~6 files** and example flows (sermon cover, KYC, upload) but did **not** include:

| Gap | Why it matters |
| --- | -------------- |
| **Exhaustive surface inventory** | Easy to fix upload + miss list/search/library GET paths |
| **`GET /minister` unmapped path** | Returns **raw Mongo** (cached in Redis); your S3 `frontPage` example comes from here — not from `mapMinisterProfile` |
| **Aggregate mappers** | Search, library, playlist cards pass through `imageUrl` / `avatar` / `banner` without `toStoragePublicUrl` |
| **Studio / user / listener** | Separate read paths for logo, banner, avatar |
| **DTO contract drift** | `storage.dto.ts` / `storage.mapper.ts` comments still say “Full S3 URL” for `file` |
| **Redis cache shape** | Minister profile cached **before** URL mapping — fix requires map-then-cache |
| **Automated audit** | No grep/checklist to prove no `*.s3.*.amazonaws.com` in JSON responses |
| **Static vs storage assets** | Country `flag: "/images/flags/ng.svg"` is app static — **not** `troott-storage` (out of scope) |
| **Audio originals bucket** | `sermon.item.item` = `troott-originals` S3 — playback CDN is feat-0006/0007, not feat-0008 |

Detail: [`profile-image-display-spec.md`](../../profile-image-display-spec.md) covers avatar/banner GET gap; feat-0008 should **merge** that work under one helper, not duplicate partially.

---

## Image URL surface inventory (codebase audit)

Norm: every **browser-facing** still-image field from **`troott-storage`** must pass through `toStoragePublicUrl` on **GET** (and `buildStoragePublicUrl` on **write** / upload response).

Legend: **W** = write/upload persists URL/key · **R** = read/GET returns to client · **Fix** = required for feat-0008.

### Upload / write paths

| Surface | File | Field(s) | Today | Fix |
| ------- | ---- | -------- | ----- | --- |
| Generic upload | `storage.service.ts` → `uploadFile` | `data.rawFile` | `s3Response.Location` | W |
| Upload DTO | `dtos/storage.dto.ts`, `mappers/storage.mapper.ts` | `ImageDTO.file` | Maps `rawFile` (S3) | W |
| Sermon cover | `sermon.service.ts` → `handleSermonImage` | `image.item`, `imageUrl` | S3 Location + CDN `/sermon/image/` | W |
| Minister KYC | `minister.service.ts` → `submitVerification` | `verification.document.frontPage`, `backPage` | Client-pasted URL, no normalize | W |
| Creator KYC | `creator.service.ts` → `submitVerification` | `verification.document.*` | Same | W |
| Profile PUT | `minister.service` / `creator.service` / `studio.service` | `avatar`, `banner`, `profile.ministryLogo` | Often bare `s3Key` string | W (optional normalize on write) |
| User profile | `user.service.ts` | `avatar`, `banner` | `{ fileName, s3Key }` Upload object | W (if exposed as URL) |
| Playlist | `playlist.service.ts` | `banner` | Opaque string from client | W (if storage key) |
| Series | (no dedicated upload in API grep) | `banner.item` | Passthrough if set | R/W when series banner upload exists |

### Read paths — profile & verification (high priority)

| Endpoint / flow | File | Field(s) | Today | Fix |
| --------------- | ---- | -------- | ----- | --- |
| **`GET /minister`** (owner) | `minister.service.ts` → `getMinisterProfile` | `avatar`, `banner`, `profile.ministryLogo`, `verification.document.*` | **Raw `IMinisterDoc`** — no mapper | R + cache |
| `GET /minister/:id` (public) | `minister.service.ts` → `getPublicMinisterProfile` | same (via `mapMinisterProfile`) | Keys / S3 strings, not CDN | R |
| **`GET /creator`** | `creator.service.ts` → `getCreatorProfile` | same pattern | **Raw doc** | R |
| `minister.mapper.ts` | `mapMinisterProfile`, `mapMinisterResponse` | `avatar`, `banner`, `coverImage`, `ministryLogo` | `s3Key` or raw string | R |
| `studio.mapper.ts` | `mapStudio` | `avatar`, `profile.ministryLogo`, `profile.banner` | Passthrough strings | R |
| `user.mapper.ts` | `mapUserResponse`, etc. | `avatar`, `banner` | Raw `Upload` or string | R |

**Note:** `mapMinisterResponse` exists but is **unused**; owner GET never hits any mapper today.

### Read paths — sermons

| Endpoint / flow | File | Field(s) | Today | Fix |
| --------------- | ---- | -------- | ----- | --- |
| `GET /sermon/:id`, lists | `sermon.mapper.ts` → `mapSermon` | `imageUrl`, `image.item` | Passthrough Mongo | R |
| Image upload response | `sermon.mapper.ts` → `mapUploadSermonImage` | `file` (= `image.item`) | S3 Location | R |
| Publish / pipeline DTOs | `sermon.service.ts` | `imageUrl` | Mixed | R |

`sermon.item.item` / `mapUploadSermonFile` → **originals bucket / playback CDN** — out of scope (feat-0006).

### Read paths — discovery & library (pass-through risk)

| Surface | File | Field(s) | Source doc fields | Fix |
| ------- | ---- | -------- | ----------------- | --- |
| Search cards | `search.mapper.ts` | `imageUrl`, `avatar`, `coverImage` | sermon / minister docs | R |
| Library rows | `library.mapper.ts` | `imageUrl` | sermon, playlist, series, minister refs | R |
| Playlist items | `playlist.mapper.ts` | `imageUrl`, `banner` | sermon, series, playlist | R |
| Series DTO | `series.mapper.ts` | `banner.item` | `ImageSource.item` | R |
| Listener profile | `listener.mapper.ts` | `avatar`, `coverImage`, `banner` | listener doc | R |

Any fix at sermon/minister **write** helps these only if stored values are already CDN; **legacy + key-only rows** still need mapper-level `toStoragePublicUrl`.

### Explicitly out of scope (feat-0008)

| Item | Reason |
| ---- | ------ |
| `country.flag` (`/images/flags/*.svg`) | Static web asset, not S3 storage bucket |
| `sermon.playbackUrl`, `manifestUrl`, `item.item` | `troott-playback` / `troott-originals` — feat-0006/0007 |
| HLS segments | Playback CDN |
| Web/mobile URL builders | feat-0011 |
| Admin-only internal tools | Unless they expose images to browser (verify separately) |

### Regression audit commands

Run before closing feat-0008 (manual or CI script):

```bash
# 1. No S3 Location assigned on new upload responses (source)
rg 's3Response\.Location' apps/api/src/services apps/api/src/mappers \
  --glob '!**/*audio*'

# 2. DTO comments must not instruct clients to use raw S3
rg 'Full S3 URL|s3\.region\.amazonaws' apps/api/src/dtos apps/api/src/mappers

# 3. Mapper pass-through hotspots (review each field uses toStoragePublicUrl)
rg 'imageUrl|coverImage|ministryLogo|frontPage|backPage|avatar|banner' \
  apps/api/src/mappers --glob '*.ts'

# 4. Owner profile GET must use mapper (not raw repository doc)
rg 'getMinisterProfile|getCreatorProfile' apps/api/src/services -A3
```

**Acceptance extension:** spot-check JSON from `GET /minister`, `GET /creator`, `GET /sermon/:id`, search, library, playlist — no `amazonaws.com` in image fields when `CLOUDFRONT_STORAGE_URL` is set.

---

## Code touchpoints (implementation backlog)

| File | Change |
| ---- | ------ |
| `apps/api/src/utils/storage-url.util.ts` (new) | `buildStoragePublicUrl`, `toStoragePublicUrl` |
| `apps/api/src/utils/audio.util.ts` | Replace or delegate `buildSermonImageUrl` → `buildStoragePublicUrlFromUploadId` |
| `apps/api/src/services/core/sermon.service.ts` | `handleSermonImage` — set `image.item` to CDN URL |
| `apps/api/src/services/storage.service.ts` | `uploadFile` — `rawFile` = CDN URL from `s3Key` |
| `apps/api/src/dtos/storage.dto.ts`, `mappers/storage.mapper.ts` | Fix `ImageDTO.file` contract comments + mapping |
| `apps/api/src/services/core/minister.service.ts` | `getMinisterProfile` → map + CDN; `submitVerification` normalize; Redis cache mapped shape |
| `apps/api/src/services/core/creator.service.ts` | Same as minister; add `mapCreatorOwnerResponse` |
| `apps/api/src/mappers/minister.mapper.ts` | `mapMinisterOwnerResponse` (new), `mapMinisterProfile`, optional `mapMinisterResponse` |
| `apps/api/src/mappers/sermon.mapper.ts` | `imageUrl`, `image.item`, `mapUploadSermonImage.file` |
| `apps/api/src/mappers/search.mapper.ts` | `imageUrl`, `avatar`, `coverImage` |
| `apps/api/src/mappers/library.mapper.ts` | `imageUrl` fallbacks |
| `apps/api/src/mappers/playlist.mapper.ts` | `imageUrl`, `banner` |
| `apps/api/src/mappers/series.mapper.ts` | `banner.item` |
| `apps/api/src/mappers/studio.mapper.ts` | `avatar`, `ministryLogo`, `banner` |
| `apps/api/src/mappers/listener.mapper.ts` | `avatar`, `coverImage`, `banner` |
| `apps/api/src/mappers/user.mapper.ts` | `avatar`, `banner` if exposed as URLs |
| `apps/api/example.env` | Document `CLOUDFRONT_STORAGE_URL` + storage CDN origin setup |
| Infra (Terraform/Cloudflare) | Path rewrite or 1:1 mapping per chosen option |

See [Image URL surface inventory](#image-url-surface-inventory-codebase-audit) for full checklist.

**No web client URL building** — consume API URLs only ([feat-0011](../../../web/feature/feat-0011/PRODUCT.md)).

---

## Implementation plan (phased)

Ship in order so each phase is testable without waiting for full mapper sweep.

### Phase P0 — Shared helper + upload response (unblocks KYC + profile upload preview)

| Step | Work |
| ---- | ---- |
| P0.1 | Add `apps/api/src/utils/storage-url.util.ts` ([normative API below](#storage-urlutil-normative-api)) |
| P0.2 | `storage.service.uploadFile` — set `rawFile = buildStoragePublicUrl(s3Key)` (not `s3Response.Location`) |
| P0.3 | Update `ImageDTO` / `storage.mapper` comments: `file` = CDN display URL; `s3Key` = internal key |
| P0.4 | `sermon.service.handleSermonImage` — `imageUrl` and `image.item` both from `buildStoragePublicUrl(s3Key)`; retire `/sermon/image/` segment (Option C) |
| P0.5 | `minister.service.submitVerification` / `creator.service.submitVerification` — normalize `document.frontPage` / `backPage` with `toStoragePublicUrl` before `$set` |

**Exit:** New uploads never receive S3 `Location` in `POST /storage/upload` or sermon image-upload responses.

### Phase P1 — Owner profile GET (fixes reported `GET /minister` bug)

| Step | Work |
| ---- | ---- |
| P1.1 | Add `ministerMapper.mapMinisterOwnerResponse(doc)` — same JSON shape as today's raw owner GET (includes `verification.document`, `sermons`, `playlists`, nested refs) with image fields mapped |
| P1.2 | `getMinisterProfile` → `result.data = await ministerMapper.mapMinisterOwnerResponse(minister)` |
| P1.3 | Mirror for `getCreatorProfile` (new `mapCreatorOwnerResponse` or shared profile mapper) |
| P1.4 | Cache **mapped** payload — use cache key `minister:profile:v2:${userId}`; on deploy flush legacy `minister:profile:*` once |
| P1.5 | Update all `redisWrapper.deleteData(\`minister:profile:${userId}\`)` call sites to delete **v2** key (and legacy key until flush complete) |

**Exit:** Existing Mongo row with S3 `frontPage` returns CDN URL on owner GET without re-upload.

### Phase P2 — Public profile + aggregate mappers

| Step | Work |
| ---- | ---- |
| P2.1 | `mapMinisterProfile` — apply `toStoragePublicUrl` on `avatar`, `coverImage`, `ministryLogo` |
| P2.2 | `sermon.mapper` — `imageUrl`, `image.item`, `mapUploadSermonImage.file` |
| P2.3 | `search.mapper`, `library.mapper`, `playlist.mapper`, `series.mapper` |
| P2.4 | `studio.mapper`, `listener.mapper`, `user.mapper` (if URLs exposed) |

**Exit:** Discovery/library/search cards show CDN thumbnails for legacy data.

### Phase P3 — Infra + optional write normalization

| Step | Work |
| ---- | ---- |
| P3.1 | CDN origin 1:1 with `images/*` (or rewrite documented in runbook) |
| P3.2 | OAC / bucket policy for anonymous CDN GET |
| P3.3 | Optional: normalize avatar/banner/ministryLogo to CDN on minister/creator PUT (reduces mapper-only reliance) |
| P3.4 | Optional one-time backfill script for Mongo (only if GET mapping perf is insufficient) |

---

## Stored value shapes (normalization inputs)

Clients and legacy rows store **different shapes** in the same Mongo string fields. `toStoragePublicUrl` must handle all of them:

| Stored value example | Origin | `toStoragePublicUrl` output |
| -------------------- | ------ | --------------------------- |
| `https://troott-storage.s3.eu-central-1.amazonaws.com/images/file-image-2026-06-03-15-34-03` | Upload `rawFile` pasted into verification | `https://storage.troott.com/images/file-image-2026-06-03-15-34-03` |
| `images/file-image-2026-06-03-15-34-03` | Web PUT profile with `s3Key` only | Same CDN URL |
| `file-image-2026-06-03-15-34-03` | Bare uploadId (legacy) | `https://storage.troott.com/images/file-image-…` |
| `https://storage.troott.com/images/file-image-…` | Already CDN | Pass through (normalize trailing slash / encoding) |
| `https://storage.troott.com/sermon/image/file-image-…` | Old sermon cover URL | Rewrite to `/images/` **or** pass through if infra Option A rewrite |
| `""` / missing | Not uploaded | `""` |
| `/images/flags/ng.svg` | Static app path on `country.flag` | **Do not transform** — not a storage object ([out of scope](#explicitly-out-of-scope-feat-0008)) |
| `https://…amazonaws.com/…` non-storage bucket | Wrong bucket / audio | Return unchanged or empty — do not rewrite to storage CDN |

**Upload object shape** (`user.avatar` as `{ fileName, s3Key }`): resolve via `toStoragePublicUrl(avatar.s3Key)` when mapping to a string URL for clients.

---

## `storage-url.util` (normative API)

New module: `apps/api/src/utils/storage-url.util.ts`

### Exports

```ts
/** CDN base from env, no trailing slash. Empty when unset. */
export function storageCdnBase(): string;

/** Public URL for a known S3 key, e.g. images/file-image-…. */
export function buildStoragePublicUrl(s3Key: string): string;

/** Shorthand for still images folder. */
export function buildStorageImageUrl(uploadId: string): string;

/**
 * Normalize any stored client/Mongo value → CDN URL for GET responses.
 * Idempotent when input is already CDN.
 */
export function toStoragePublicUrl(stored: string | undefined | null): string;

/** True if value looks like troott-storage (S3 virtual host or images/ key). */
export function isStorageStillReference(value: string): boolean;
```

### `toStoragePublicUrl` algorithm (normative)

1. If falsy → return `''`.
2. Trim whitespace.
3. If value starts with `http://` or `https://`:
   - Parse URL.
   - If hostname matches storage CDN host (`storage.troott.com` or host derived from `CLOUDFRONT_STORAGE_URL`) → return normalized CDN URL (fix `/sermon/image/` → `/images/` when Option C chosen).
   - If hostname matches `*.s3.*.amazonaws.com` **and** path contains bucket key prefix for `AWS_BUCKETS_STORAGE` → extract object key (path after bucket name in path-style, or full pathname in virtual-hosted style) → `buildStoragePublicUrl(key)`.
   - Else → return value unchanged (external URL, wrong bucket, playback, etc.).
4. If value matches `^images/` → `buildStoragePublicUrl(value)`.
5. If value matches `^file-image-` or `^file-` uploadId pattern (project convention) → `buildStorageImageUrl(value)`.
6. Else → return value unchanged (may be relative static path like `/images/flags/…`).

Use `AWS_BUCKETS_STORAGE` from `@/configs/aws.config` for bucket name checks — do not hardcode `troott-storage` in parsing logic.

### Dev fallback when `CLOUDFRONT_STORAGE_URL` unset

| Env | Behavior |
| --- | -------- |
| `CLOUDFRONT_STORAGE_URL` set | Always emit CDN URLs on upload + GET mapping |
| Unset (local dev) | Document in `example.env`: optional direct S3 or empty string; log once at startup if mapping skipped |

Production/staging **must** set `CLOUDFRONT_STORAGE_URL`; feat-0008 acceptance criteria apply only when it is set.

### Unit tests (recommended)

| Input | Expected |
| ----- | -------- |
| S3 virtual-hosted URL with `images/file-image-x` | CDN `/images/file-image-x` |
| `images/file-image-x` | CDN `/images/file-image-x` |
| Already CDN URL | Same host + path |
| `/images/flags/ng.svg` | Unchanged |
| Empty | `''` |

---

## Owner `GET /minister` fix (detailed)

### Current behavior

```ts
// minister.service.ts — getMinisterProfile (today)
result.data = ministerResult.data; // raw IMinisterDoc + populated sermons/playlists
```

```ts
// minister.controller.ts — getMinister
await redisWrapper.keepData({ key: cacheKey, value: result.data }, cacheTTL);
```

Response includes fields **not** on `MinisterResponseDTO`, e.g. `verification.document.frontPage`, `user`, `studio`, populated arrays.

### Target behavior

```ts
// minister.service.ts — after P1
result.data = await ministerMapper.mapMinisterOwnerResponse(minister);
```

### `mapMinisterOwnerResponse` responsibilities

| Concern | Rule |
| ------- | ---- |
| Shape | Preserve today's owner GET fields (do not switch to slim `MinisterResponseDTO`) |
| Image fields | `avatar`, `banner`, `profile.ministryLogo` → `toStoragePublicUrl` |
| Verification | `verification.document.frontPage`, `backPage` → `toStoragePublicUrl` |
| Nested sermons | Each sermon `imageUrl`, `image?.item` → `toStoragePublicUrl` (or delegate sermon mapper) |
| Non-image | Pass through ObjectIds, dates, status enums unchanged |
| `country.flag` | Pass through (static) |

Implement as shallow map over top-level + known nested paths — avoid `JSON.parse(JSON.stringify)` if it drops Dates; prefer explicit field list matching current API contract.

### Redis cache

| Issue | Fix |
| ----- | --- |
| Stale S3 URLs in cache | Deploy with cache key version `minister:profile:v2:${userId}` **or** flush `minister:profile:*` once |
| Cache before map | Controller caches `result.data` **after** service maps URLs (no change to controller order once service maps) |

### Creator parity

Same pattern: `getCreatorProfile` → `mapCreatorOwnerResponse`; cache key `creator:profile:v2:${userId}`.

---

## DTO contract updates

| File | Before | After |
| ---- | ------ | ----- |
| `dtos/storage.dto.ts` | `file: string // Full S3 URL (rawFile)` | `file: string // CDN display URL (CLOUDFRONT_STORAGE_URL + s3Key)` |
| `mappers/storage.mapper.ts` | Same comment | Align with helper output |
| `interfaces/core/minister.interface.ts` | Comments say CDN for banner | Enforce via mapper (already intended) |

Field name **`rawFile`** in upload service internal result may stay; value becomes CDN URL. Consider aliasing in docs as “public file URL” to reduce confusion.

---

## Testing

### Manual

1. Upload cover via studio wizard → `GET /sermon/:id` → `imageUrl` and `image.item` are CDN, not S3.
2. `curl -I` on `imageUrl` → 200, `content-type: image/jpeg`.
3. Upload KYC doc via onboarding → `POST /storage/upload` → response `rawFile` host is `storage.troott.com`.
4. Submit verification → `GET /minister` → `verification.document.frontPage` is CDN URL (extensionless OK).
5. Open `frontPage` in browser → image renders.
6. My Sermons grid shows thumbnail.

### Legacy data

1. Minister with existing S3 `frontPage` in Mongo → `GET /minister` returns CDN-mapped URL without DB migration.

### Regression

- Publish flow still requires cover (`CheckAudioReadyForPublish`).
- Profile uploads on same bucket use same helpers ([profile-image-display-spec.md](../../profile-image-display-spec.md)).

---

## Decision log

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Extension in URL | Not required | `Content-Type` sufficient; extension aids ops only |
| Pretty path `/sermon/image/` | Deprecate in favor of `/images/` **or** CDN rewrite | Must match S3 key |
| Raw S3 in API fields | Forbidden for browser-facing fields | Private bucket breaks direct S3 in browser |
| `rawFile` name | Keep field name; change value to CDN URL | Avoid breaking clients expecting `rawFile` key |
| Signed URLs | Not for public catalog/covers/KYC preview | Stable public CDN URLs |
| GET mapper for legacy S3 | Required | Existing ministers (e.g. Damola Oladipo example) without re-upload |
| Owner GET mapper | `mapMinisterOwnerResponse` | Raw doc today; must map `verification.document` without dropping fields |
| CDN path | Option C (`/images/{uploadId}`) | Matches S3 key + deployment plan |
| Redis cache | Version bump on deploy | Avoid 300s stale S3 URLs from old cache entries |

---

## Related

- [PRODUCT.md](./PRODUCT.md)
- [media-compute-deployment-plan.md](../../media-compute-deployment-plan.md) § CDN, `images/{uploadId}`
- [profile-image-display-spec.md](../../profile-image-display-spec.md)
