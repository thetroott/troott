# feat-0012: Storage still images broken in browser (CDN URL loads nothing)

## Summary

API responses and the web client surface **HTTPS CDN URLs** for still images (profile avatar/banner, sermon covers, KYC documents) shaped like:

```text
https://storage.troott.com/images/file-image-2026-06-03-16-28-33?v=2026-06-03T15%3A28%3A44.890Z
```

Opening that URL in a **new browser tab** shows no image (blank, broken icon, TLS error, or XML error). The path has **no file extension** (`.png`, `.jpeg`) — that is **expected** for Troott upload ids and is **not** the root cause when S3 `Content-Type` is set correctly.

The failure happens **after** the API JSON response: the browser’s **GET to CloudFront → S3** does not return renderable image bytes. This spec traces the full request/response cycle, ranks root causes, and defines acceptance criteria. Implementation work is tracked under [feat-0008](../feat-0008/PRODUCT.md); feat-0012 is the **incident + diagnosis** spec for “URL looks correct but image never loads.”

---

## Reported symptom

| Observation | Notes |
| ----------- | ----- |
| URL host | `storage.troott.com` (`CLOUDFRONT_STORAGE_URL`) |
| URL path | `/images/file-image-{date}-{time}` — **no extension** |
| Query string | `?v={ISO timestamp}` — added by **web** for cache busting ([profile page](../../../web/src/app/profile/profile-page.util.ts)), **not** sent by API |
| New tab | Same failure as `<img>` — rules out React/CSS-only bugs |
| Upload API | Often returns **200**; user assumes upload succeeded |

Example (from report):

```text
https://storage.troott.com/images/file-image-2026-06-03-16-28-33?v=2026-06-03T15%3A28%3A44.890Z
```

---

## What is NOT the bug

| Misconception | Reality |
| ------------- | ------- |
| “URL must end in `.jpg` / `.png`” | S3 keys are `images/{uploadId}` without suffix by design ([`genFileName`](../../../apps/api/src/utils/helpers.util.ts)); browsers use **`Content-Type`** on the object, not the URL path |
| “API should append extension to JSON URL” | Optional ops improvement only; does not fix a missing object or broken CDN |
| “`?v=` breaks the URL” | S3 ignores query strings for object lookup; CloudFront must forward or strip them — see [TECH.md § Layer 6](./TECH.md#layer-6-browser--img--new-tab) |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-IMG01 | Minister on `/profile` | Avatar and cover to load after save | Profile hero matches upload preview |
| UC-IMG02 | Minister uploading sermon cover | Thumbnail visible in upload wizard and My Sermons | I can confirm artwork |
| UC-IMG03 | Minister submitting KYC | `verification.document.frontPage` to open in browser | Verification preview works |
| UC-IMG04 | Operator | `curl -I` on a CDN URL from API JSON to return **200** + `Content-Type: image/*` | We distinguish app vs infra failures in minutes |

---

## Scope

**In scope**

- End-to-end cycle: multipart upload → S3 → Mongo → GET mapper → web display URL → browser fetch
- Failure attribution per layer (API, Redis cache, web, CloudFront, S3)
- Diagnostic runbook (`curl`, `aws s3api head-object`)
- Alignment with [feat-0008](../feat-0008/PRODUCT.md) URL contract (`/images/{uploadId}` 1:1 with S3 key)

**Out of scope**

- HLS / `CLOUDFRONT_PLAYBACK_URL` playback images
- Client-side URL building when API already sends HTTPS (forbidden by [web feat-0011](../../../web/feature/feat-0011/PRODUCT.md))
- Replacing CloudFront with public S3 buckets

---

## Acceptance criteria

1. For a fresh `POST /storage/upload` or `POST /sermon/image-upload`, `aws s3api head-object` on `s3://{AWS_STORAGE_BUCKET}/images/{uploadId}` returns **200**, **`ContentLength` > 0**, and **`ContentType`** matching upload MIME (`image/jpeg`, `image/png`, …).
2. `curl -I "https://storage.troott.com/images/{uploadId}"` returns **200** and `content-type: image/*` (query string optional).
3. API GET (`/minister`, `/sermon/:id`, etc.) returns the **same path** as S3 key (no `/sermon/image/` mismatch unless CDN rewrite documented in feat-0008).
4. No browser-facing field uses `*.amazonaws.com` when `CLOUDFRONT_STORAGE_URL` is set ([feat-0008](../feat-0008/PRODUCT.md) AC-1).
5. Runbook in [TECH.md](./TECH.md) identifies which layer failed from HTTP status alone.

---

## Related

| Doc | Role |
| --- | ---- |
| [feat-0008 PRODUCT](../feat-0008/PRODUCT.md) | Canonical CDN URL contract + phased fix |
| [feat-0008 TECH](../feat-0008/TECH.md) | Path mismatch RC-1, infra checklist |
| [profile-image-display-spec.md](../../profile-image-display-spec.md) | Profile GET / `asset.url` gap (partially addressed by mappers) |
| [media-compute-deployment-plan.md](../../media-compute-deployment-plan.md) | `troott-storage` bucket + CDN origin |
