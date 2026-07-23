# feat-0038: Staging sermon audio upload keeps failing (Progress step)

> **Severity:** P0 — blocks Alpha / staging ministers from creating sermons.  
> **Surface:** [`apps/web`](../../../../apps/web) Progress step at  
> `https://app.staging.troott.com/studio/{studioCode}/sermons/upload/file`  
> **Paired API:** [feat-0018 S3 multipart](../../../api/feature/feat-0018/PRODUCT.md), [feat-0006 pipeline](../../../api/feature/feat-0006/PRODUCT.md).  
> **Transport:** [feat-0037 Uppy](../feat-0037/PRODUCT.md) (default) or legacy `POST /sermon/start-upload` ([feat-0008](../feat-0008/PRODUCT.md)).

## Summary

On **staging** (`app.staging.troott.com`), selecting an audio file and advancing to the upload Progress step frequently ends with:

> Something went wrong while uploading. You can retry without selecting the file again.

Retry often fails again. Production may work or fail for different reasons (legacy 100 MB busboy vs Uppy/CORS). This spec is the **canonical incident + hardening** doc so we stop guessing and make staging sermon upload reliable.

**User-visible copy** lives in `UploadProgressStep` when `uploadError` is true. The toast (from `useStudioSermonAudioUpload`) may show a more specific API/network message; the static Progress copy does not.

---

## ASSUMPTIONS (correct before implementation)

1. Failure is observed on **staging Alpha**, not only local `pnpm dev`.
2. Studio route `/studio/07at3o4yflg1/sermons/upload/file` is a valid studio; auth session is valid enough to open the wizard.
3. Default client path is **Uppy → `/sermon/s3/multipart/*` → S3 → `complete-audio`** — **confirmed on staging by API logs** (see [Evidence](#evidence--staging-api-logs-2026-07-23)).
4. Staging API uses `NODE_ENV=staging`, `APP_ENV=staging`, and staging Mongo/S3/Redis — not production buckets by accident.
5. We will **diagnose with Network tab + API logs** before changing product UX copy.

→ Correct any assumption that is wrong before coding fixes.

---

## Evidence — staging API logs (2026-07-23)

Captured from Coolify **troott-api-staging** during a failed Progress upload.

### Classification: **Uppy / S3 multipart** (not legacy `start-upload`)

| Event | Meaning |
| ----- | ------- |
| `s3-multipart-create` `purpose=sermon-audio` `sessionId=fdad3ec5-…` | Create succeeded; session opened |
| Many `s3-multipart-sign-part` for `partNumber` 1–9 (repeated) | API keeps issuing presigned URLs; client is **retrying the same parts** |
| `s3-multipart-abort` same `sessionId` | Client/Uppy gave up and aborted the multipart upload |
| **No** `complete-audio` / multipart complete in this log | Bytes never finished on S3 (or complete never reached API) |

### CORS error (API origin callback)

Stack excerpt (same deploy window):

```text
at origin (/app/apps/api/dist/configs/app.config.js:85:18)
…
callback(new Error('Not allowed by CORS'))
```

Source: `app.config.ts` `cors({ origin })` → `getOrigins(origin)` from `origin.util.ts` (allowlist from `CLIENT_*` + `CORS_ALLOWED_ORIGINS`).

**Interpretation:** At least one browser request to the **API** used an `Origin` header **not** in the staging allowlist (e.g. missing `https://app.staging.troott.com`, typo, trailing slash mismatch, or `www.app.staging…`). That throws `Not allowed by CORS`.

Create + sign-part still logged for this session (likely some requests succeeded with a valid Origin, or same Origin intermittently). Repeated `sign-part` without complete strongly suggests **S3 PUT failures** (bucket CORS / network) and/or **API CORS** on intermittent calls → Uppy retries → abort.

### Raw log pattern (abridged)

```text
ERR … Not allowed by CORS
  at origin (…/configs/app.config.js:85:18)
  … corsMiddleware …

s3-multipart event=s3-multipart-create sessionId=fdad3ec5-… purpose=sermon-audio
s3-multipart event=s3-multipart-sign-part … partNumber=1..9  (many repeats)
…
s3-multipart event=s3-multipart-abort sessionId=fdad3ec5-…
```

### Working hypothesis (priority order)

1. **S3 bucket CORS** missing `https://app.staging.troott.com` → browser blocks PUT → Uppy re-requests `sign-part` → abort.  
2. **API `CORS_ALLOWED_ORIGINS` / `CLIENT_STAGING_*`** incomplete → some API calls fail with `Not allowed by CORS`.  
3. Less likely: JWT mid-upload (would usually show 401 on sign-part, not endless same-part resigns).

**Next evidence needed:** Browser Network — failed S3 `PUT` (CORS) vs failed `sign-part`/`create` (API CORS). Fix both allowlists if unsure.

---

## Problem

| Observation | Impact |
| ----------- | ------ |
| Progress step shows generic error + Retry | Minister cannot finish upload |
| Toast may show axios/Uppy message; Progress copy stays generic | Hard for support to know root cause from screenshots alone |
| Staging logs: create OK → repeated sign-part → **abort** (no complete) | Uppy never finishes parts to S3 |
| Staging logs: `Not allowed by CORS` from `app.config` origin | API deny Origin for `app.staging.troott.com` (or variant) |
| Staging Coolify API previously crash-looped / missing `:staging` GHCR tag | Upload cannot succeed if API or S3 signing is down |
| Staging web may be baked with wrong `VITE_APP_API_URL` | Client calls prod or empty API |
| S3 CORS may omit `https://app.staging.troott.com` | Browser blocks PUT to originals bucket |

---

## User stories

| ID | As a | I want | So that |
| -- | ---- | ------ | ------- |
| UC-SU01 | Minister on staging | Upload MP3/M4A through Progress and reach Details | Alpha demos work |
| UC-SU02 | Minister | Retry after failure without re-picking the file | Same as current copy promise |
| UC-SU03 | Minister | See a **specific** error (size, CORS, auth, network) | I know what to do next |
| UC-SU04 | Operator | A diagnosis checklist (Network + Coolify + GHCR + S3 CORS) | Fix env/CORS without code thrash |
| UC-SU05 | Engineer | One failure matrix for legacy vs Uppy paths | Fixes land in the right layer |

---

## Failure matrix (diagnose first)

Capture **one failing upload** in DevTools → Network **and** Coolify API logs. Classify:

| Path seen | Likely causes | Owner |
| --------- | ------------- | ----- |
| **`create` + repeated `sign-part` + `abort` (no complete)** — **staging confirmed** | S3 PUT CORS / network; API Origin deny; Uppy retries then abort | AWS + Coolify `CORS_*` / `CLIENT_STAGING_*` |
| API log `Not allowed by CORS` / `app.config` origin | Origin not in `getOrigins` allowlist | Coolify API env |
| `POST …/sermon/start-upload` only | Legacy path; proxy timeout; busboy size; API OOM; 413 | API + Coolify + web image age |
| `POST …/sermon/s3/multipart/create` then S3 `PUT` fails (CORS / opaque) | Bucket CORS missing staging origin | AWS ops |
| `create` / `sign-part` / `complete-audio` → 401/403 | JWT expiry / wrong API / Protect | API + web auth |
| `create` → 404 / 502 | Staging API down / Traefik bad gateway / wrong `VITE_APP_API_URL` | Coolify + web build |
| `complete-audio` → 4xx/5xx after S3 PUTs OK | Session missing, bucket env, Mongo | API |
| Progress ~67–70% then fail on `start-upload` | Historical **100 MB busboy** vs larger file | API |

Do **not** change Uppy UX until the CORS / S3 allowlists are verified for staging.

---

## Reproduce the error before fixing (required)

**Gate:** Do **not** change Coolify CORS, S3 CORS, or app code until this reproduction is completed once and evidence is saved. Goal: prove the failure is still live and capture artifacts that match [Evidence](#evidence--staging-api-logs-2026-07-23).

### Preconditions

| Check | Pass criteria |
| ----- | ------------- |
| Staging web | `https://app.staging.troott.com` loads (not Bad Gateway) |
| Staging API | Coolify API resource Running; `curl -sI https://api.staging.troott.com/api/v1/` responds |
| Account | Minister (or creator) that can open studio upload |
| File | Valid sermon audio (prefer **≥ 10 MB** MP3/M4A; second run with **≥ 50–100 MB** if allowed) |
| Tools | Chrome/Firefox DevTools open; Coolify API **Logs** open in another tab |

### Steps (manual)

1. Sign in at `https://app.staging.troott.com`.
2. Open studio upload Progress route, e.g.  
   `https://app.staging.troott.com/studio/{studioCode}/sermons/upload/file`  
   (example studio: `07at3o4yflg1`).
3. DevTools → **Network**: Preserve log ON; filter later by `multipart` / `amazonaws` / `s3`.
4. DevTools → **Console**: leave open for CORS messages.
5. Coolify → **troott-api-staging** → **Logs**: leave streaming.
6. Select the audio file and start upload (Progress step).
7. Wait until UI shows:  
   **Something went wrong while uploading. You can retry without selecting the file again.**  
   (and/or error toast).
8. **Do not** apply fixes yet. Capture artifacts below.
9. Optionally click **Retry** once — confirm it fails again with the same pattern (documents UC-SU02 broken state).

### Pass criteria for “reproduced” (before fix)

All of the following must be true (or explicitly noted if different):

| # | Expectation |
| - | ----------- |
| R1 | Progress (or toast) shows upload failure |
| R2 | Network shows `…/sermon/s3/multipart/create` (or equivalent) — **not** only legacy `start-upload` for large files |
| R3 | Coolify API logs include `s3-multipart-create` for a `sessionId` |
| R4 | Same logs show **repeated** `s3-multipart-sign-part` for overlapping `partNumber`s |
| R5 | Same logs end with `s3-multipart-abort` for that `sessionId` (no successful complete in that session) |
| R6 | Either API log `Not allowed by CORS` **and/or** browser Console/Network shows S3 `PUT` CORS / failed fetch |

If R2–R5 fail (e.g. upload suddenly succeeds), record date/time and env — do not “fix” a non-reproducing bug; re-check after any Coolify redeploy.

### Artifacts to save (attach to PR / incident note)

| Artifact | How |
| -------- | --- |
| Screenshot | Progress error + toast |
| Network | Export HAR **or** screenshots of `create`, `sign-part`, S3 `PUT` rows (status + failing URL) |
| Console | Screenshot of CORS / failed fetch lines |
| API logs | Paste lines from `create` through `abort` for one `sessionId` (redact tokens) |
| Env snapshot | Coolify API: `CORS_ALLOWED_ORIGINS`, `CLIENT_STAGING_*` values (no secrets) |
| Meta | File size, MIME, browser, UTC timestamp, `sessionId` |

### After reproduction → then fix

Only after R1–R6 (or documented variance):

1. Apply [TECH §3.1](./TECH.md#31-api-cors-allowlist-troott-originutil) / [§3.2](./TECH.md#32-s3-cors-uppy-put-path).
2. Re-run the **same** steps — expect **no** Progress error; logs: create → sign-part (≈ once per part) → complete (**no** abort).
3. Compare before/after HAR + API logs in the PR description.

Detailed checklist: [TECH §8](./TECH.md#8-test-plan--reproduce-before-fix) · [TASKS Phase 0R](./TASKS.md#phase-0r--reproduce-error-before-any-fix).

---

## Related specs (partial coverage)

| Spec | Covers | Gap this feat fills |
| ---- | ------ | ------------------- |
| [feat-0037](../feat-0037/PRODUCT.md) | Uppy client design | Staging reliability / ops diagnosis |
| [feat-0018 API](../../../api/feature/feat-0018/PRODUCT.md) | S3 signing contract | Staging CORS + deploy readiness |
| [feat-0008](../feat-0008/PRODUCT.md) | Single-flight start-upload | Does not fix transport failures |
| [feat-0006](../../../api/feature/feat-0006/PRODUCT.md) | Pipeline after success | Assumes upload succeeded |
| Coolify docs | GHCR pull / domains | Not upload-specific |

---

## Scope

### In scope

- Reproduce the failure on staging **before** any fix ([Reproduce section](#reproduce-the-error-before-fix-required)); save HAR/API logs.
- Reproduce and classify staging Progress-step failures (Network + API logs).
- **Fix staging API Origin allowlist** (`CORS_ALLOWED_ORIGINS` / `CLIENT_STAGING_*`) so `https://app.staging.troott.com` is allowed ([Evidence](#evidence--staging-api-logs-2026-07-23)).
- **Fix S3 bucket CORS** for the same origin (ExposeHeaders `ETag`) so part PUTs succeed and uploads reach `complete-audio` instead of `abort`.
- Ensure staging web image is built with `VITE_APP_API_URL=https://api.staging.troott.com`.
- Ensure staging API is healthy (`IMAGE_TAG=staging`, Mongo/Redis/S3 staging env).
- Surface actionable errors in Progress UI (not only toast) — map known failures to copy.
- Document runbook in [TECH.md](./TECH.md).
- Re-run the same reproduce script after fix to prove the error is gone.

### Out of scope

- Redesigning the upload wizard chrome (feat-0018 Figma).
- Mobile / Expo uploads.
- Changing HLS processing after `complete-audio` succeeds.
- Production-only marketing get-troott issues.

---

## Acceptance criteria

0. **Before fix:** Reproduce steps completed; R1–R6 documented with artifacts ([Reproduce](#reproduce-the-error-before-fix-required)).
1. On staging, a minister can upload a representative sermon file (**≥ 10 MB** and one **≥ 100 MB** if product allows) at `/studio/{code}/sermons/upload/file` and reach **upload complete** without the generic Progress error.
2. Network tab shows the **expected** path for the deployed web build (Uppy multipart **or** documented legacy) end-to-end with terminal success.
3. On failure, Progress step shows a **specific** message (or toast + Progress both carry the same actionable text), not only the static generic sentence.
4. Retry without re-selecting the file works when the failure is transient (network / 5xx), per feat-0008 single-flight reset.
5. Staging ops checklist in TECH is completed (API healthy, CORS, GHCR tags, baked `VITE_APP_API_URL`).
6. No regression: local + production upload paths still pass smoke for a small file.
7. **After fix:** Same reproduce script no longer hits Progress error; API logs show complete without abort for a successful run.

---

## Success metrics

| Metric | Target |
| ------ | ------ |
| Staging Progress → complete success rate (manual Alpha) | ≥ 95% for valid MIME/size files |
| Time to classify a new staging upload failure | &lt; 10 min using TECH checklist |
| Generic-only error with no toast detail | 0 for known failure classes |

---

## References

- Live URL pattern: `https://app.staging.troott.com/studio/{studioCode}/sermons/upload/file`
- UI: `UploadProgressStep.tsx`, `useStudioSermonAudioUpload.ts`, `sermon-upload.service.ts`
- Deploy: [`.github/workflows/deploy.yml`](../../../../.github/workflows/deploy.yml), [docs/coolify-monorepo-setup.md](../../../../docs/coolify-monorepo-setup.md)
- Tasks: [TASKS.md](./TASKS.md) · Tech: [TECH.md](./TECH.md)
