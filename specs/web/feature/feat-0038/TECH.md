# feat-0038: Tech — Staging sermon upload failure diagnosis & hardening

Parent: [PRODUCT.md](./PRODUCT.md)

## 1. Symptoms → code

| UI | Code |
| -- | ---- |
| Progress: “Something went wrong while uploading…” | `UploadProgressStep` when `uploadError === true` |
| Toast with API/network message | `useStudioSermonAudioUpload` → `uploadErrorMessage` → `onUploadError` → `uploadActions.setUploadError` |
| Progress % | Uppy `upload-progress` or Axios `onUploadProgress` → `setProgress` |

Retry control must clear `uploadError` and bump retry token / clear single-flight signature per [feat-0008](../feat-0008/TECH.md).

## 2. Transport paths (deployed web)

```text
Default (feat-0037):
  File → sermon-upload.service uploadSermonAudioViaS3
       → POST /api/v1/sermon/s3/multipart/create
       → PUT presigned parts → S3
       → POST …/complete (Uppy) + POST …/complete-audio (sermon)
       → sermonId → setUploadComplete

Legacy (forceLegacy + ≤6MB only in current code):
  File → POST /api/v1/sermon/start-upload (whole body through API)
```

If staging Network shows **`start-upload` for large files**, the **web image is stale** (pre–feat-0037) or a fork still defaults to legacy. Treat as deploy issue first.

### 2.1 Confirmed staging session (2026-07-23)

API logs for `sessionId=fdad3ec5-7eeb-4163-9555-b0f645b10085`:

1. `s3-multipart-create` `purpose=sermon-audio` — OK  
2. Dozens of `s3-multipart-sign-part` for parts **1–9**, each number appearing **many times** — Uppy retrying part uploads  
3. `s3-multipart-abort` — terminal client abort  
4. Concurrent stack: `Not allowed by CORS` at `app.config` `origin` callback (`getOrigins` deny)

**Conclusion:** Transport is Uppy. Failure is **after create**, during part upload / resign loop — fix **API Origin allowlist** and **S3 bucket CORS** before more client features.

## 3. Staging environment contract

| Layer | Required |
| ----- | -------- |
| GitHub Environment `staging` | `API_URL=https://api.staging.troott.com`, `WEB_URL=https://app.staging.troott.com` |
| GHCR | `ghcr.io/thetroott/troott-web:staging`, `troott-api:staging` exist |
| Coolify web | `IMAGE_TAG=staging`, domain `https://app.staging.troott.com`, port **8080**, compose raw non-empty |
| Coolify API | `IMAGE_TAG=staging`, `NODE_ENV=staging`, `APP_ENV=staging`, `MONGODB_STAGING_URI`, Redis staging, `AWS_BUCKET_STAGING` (or prod bucket names if staging intentionally shares), healthy (not Exited) |
| Browser | Calls API host from baked `VITE_APP_API_URL` — must be staging API |

### 3.1 API CORS allowlist (Troott `origin.util`)

`cors` in `app.config.ts` only allows origins present in the set built from:

- `CLIENT_APP_URL`
- `CLIENT_STAGING_URL`
- `CLIENT_STAGING_BASE_URL`
- `CLIENT_LOCAL_URL`
- `CORS_ALLOWED_ORIGINS` (comma-separated)

Normalize: trim, **no trailing slash**. Exact match required.

**Staging Coolify API must include** (at minimum):

```text
CORS_ALLOWED_ORIGINS=https://app.staging.troott.com,https://staging.troott.com
CLIENT_STAGING_URL=https://app.staging.troott.com
CLIENT_STAGING_BASE_URL=https://app.staging.troott.com
```

Do **not** rely on production-only `CLIENT_APP_URL=https://app.troott.com` for Alpha.

If Coolify also lists `https://www.app.staging.troott.com` as a domain, either remove that domain or add the same Origin to the allowlist.

Mismatch → `callback(new Error('Not allowed by CORS'))` (logged stack through `cors` middleware).

### 3.2 S3 CORS (Uppy PUT path)

Bucket used for sermon originals (staging config) must allow:

| Header / rule | Value |
| ------------- | ----- |
| AllowedOrigins | `https://app.staging.troott.com` (and local if needed) |
| AllowedMethods | `GET`, `PUT`, `POST`, `HEAD` |
| AllowedHeaders | `*` or at least `Content-Type`, `Authorization`, `x-amz-*` |
| ExposeHeaders | `ETag` (required for multipart complete) |

Reference: [API feat-0018 TECH §20](../../../api/feature/feat-0018/TECH.md).

**Symptom of S3 CORS miss:** API shows repeated `sign-part` for same part numbers, then `abort`; browser console shows CORS on `*.amazonaws.com` PUT. API never sees `complete-audio`.

Apply example policy: [`docs/staging-s3-cors.json.example`](../../../../docs/staging-s3-cors.json.example) (merge with existing bucket rules as needed).

## 4. Diagnosis runbook (operators)

1. Confirm Coolify **API** Running (not Exited / restart loop). Curl health or `GET /api/v1/` from server.
2. Confirm Coolify **web** not Bad Gateway; Traefik → port 8080; compose raw shows `web:` service.
3. Open staging Progress upload → DevTools Network:
   - Filter `multipart` or `start-upload` or S3 host.
4. Classify with [PRODUCT failure matrix](./PRODUCT.md#failure-matrix-diagnose-first).
5. **If logs show create → many sign-part → abort:** check browser S3 PUT status + API CORS env (§3.1–3.2).
6. If API log `Not allowed by CORS`: print Coolify values for `CORS_ALLOWED_ORIGINS` / `CLIENT_STAGING_*`; ensure exact `https://app.staging.troott.com`.
7. If S3 PUT shows CORS error in console → fix bucket CORS (ops).
8. If `create` 502 → API/Traefik; if 401 → token; if 404 route → API image missing multipart routes.
9. If only `start-upload` + fail ~70% → check file size vs busboy / `SERMON_AUDIO_MAX_BYTES` / proxy body limit.
10. Capture: request URL, status, response `message`, file size, sessionId, Coolify API log lines.

## 5. Client hardening (apps/web)

### 5.1 Progress step must show actionable error

`UploadProgressStep` keeps `uploadErrorDetail` (local state). `useStudioSermonAudioUpload` calls `onUploadError(message)` with `sermonUploadErrorMessage(error)` (also toasted). Retry clears detail.

Module: `apps/web/src/utils/sermon-upload-error-message.util.ts`  
Tests: `sermon-upload-error-message.util.spec.ts`

### 5.2 Known message mapping

| Condition | User-facing copy |
| --------- | ---------------- |
| `ERR_NETWORK` / no response | Network error. Check your connection and try again. |
| 413 / exceeds maximum size | File is too large for upload. |
| CORS / Failed to fetch to S3 | Upload blocked by storage configuration. Contact support. |
| `Not allowed by CORS` | Upload blocked by API CORS configuration. Contact support. |
| 401 / 403 | Session expired. Sign in again, then retry. |
| 502 / 503 / 504 | Staging API unavailable. Try again shortly. |
| Default | API `message` if string; else generic retry copy |

### 5.3 Do not silently fall back

Do not auto-switch Uppy → legacy `start-upload` for large files without product decision — hides staging CORS/API gaps.

## 6. API hardening (apps/api)

| Item | Action |
| ---- | ------ |
| Busboy limit on `start-upload` | Already aligned to sermon max in `upload.mdw` — verify **staging image** includes that commit |
| Multipart routes deployed | Staging API image must include feat-0018 controllers/routes |
| Escape `$` in Coolify secrets | `$$` or bcrypt corruption / crash |
| Staging AWS buckets | `AWS_BUCKET_STAGING` when `NODE_ENV=staging` |
| CORS reject logging | `app.config.ts` logs `[cors] Not allowed by CORS origin=…` |
| Env sample | `apps/api/example.env` staging checklist |

## 7. Verification commands

```bash
# From laptop — expect 401 without token, not connection refused
curl -sI "https://api.staging.troott.com/api/v1/"
```

## 8. Test plan — reproduce before fix

### 8.0 Gate

**No Coolify/S3/code fix** until [PRODUCT reproduce section](./PRODUCT.md#reproduce-the-error-before-fix-required) is done and artifacts are saved.

### 8.1 Pre-fix reproduction (staging)

| Step | Action | Record |
| ---- | ------ | ------ |
| 1 | Login `app.staging.troott.com` | — |
| 2 | Open `/studio/{code}/sermons/upload/file` | Full URL |
| 3 | Network Preserve + Console + Coolify API Logs | — |
| 4 | Upload ≥10 MB audio | Size, MIME, name |
| 5 | Wait for Progress error copy | Screenshot |
| 6 | Note Network: `create`, `sign-part`, S3 PUT | Status codes, failing host |
| 7 | Note API logs: `sessionId`, create / sign-part×N / abort | Paste |
| 8 | Note CORS: API `Not allowed by CORS` and/or S3 PUT CORS | Screenshot |
| 9 | Optional: Retry once | Same failure? Y/N |

**Reproduced** when PRODUCT R1–R6 hold.

### 8.2 Post-fix verification (same script)

| Case | Expect |
| ---- | ------ |
| Staging Uppy ≥10 MB | Progress 100%; API: create → sign-part (no mass repeats) → complete; **no** abort |
| Staging ≥50–100 MB (if allowed) | Same success **or** clear size error (no silent mid-progress drop) |
| Network | S3 PUT 200; `complete-audio` / complete present |
| API logs | No `Not allowed by CORS` for `https://app.staging.troott.com` during upload |
| Staging intentional offline mid-upload | Actionable network error + Retry |
| Staging expired JWT mid-sign-part | Session expired copy (after Phase 2 UX) |
| Local forceLegacy ≤6 MB | Still works for tests |
| Regression small file on staging | Pass |

### 8.3 Commands (sanity only — not a substitute for UI reproduce)

```bash
# From laptop — expect 401 without token, not connection refused
curl -sI "https://api.staging.troott.com/api/v1/"

# Confirm GHCR tag (auth as needed)
# ghcr.io/thetroott/troott-api:staging
# ghcr.io/thetroott/troott-web:staging
```

## 9. Out of scope (tech)

- Changing Bull/ffmpeg pipeline.
- Companion / TUS.
- Redesign of Progress Figma layout beyond error text.
