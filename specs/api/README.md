# API specs (`apps/api`)

Product and technical specifications for the Troott **API** service.

## Feature specs

| ID | Topic | PRODUCT | TECH | MODELS |
| -- | ----- | ------- | ---- | ------ |
| feat-0001 | Organization → Branch → Minister hierarchy | [PRODUCT](./feature/feat-0001/PRODUCT.md) | [TECH](./feature/feat-0001/TECH.md) | [MODELS](./feature/feat-0001/MODELS.md) |
| feat-0002 | Listener taste onboarding (ministers → topics) | [PRODUCT](./feature/feat-0002/PRODUCT.md) | [TECH](./feature/feat-0002/TECH.md) | — |
| feat-0003 | Listener playlists in Library | [PRODUCT](./feature/feat-0003/PRODUCT.md) | [TECH](./feature/feat-0003/TECH.md) | — |
| feat-0004 | Token-only auth (no refresh token; `X-New-Token` reissue) | [PRODUCT](./feature/feat-0004/PRODUCT.md) | [TECH](./feature/feat-0004/TECH.md) | — |
| feat-0005 | Production media pipeline (3 buckets, HLS, EC2/Coolify) | [PRODUCT](./feature/feat-0005/PRODUCT.md) | [TECH](./feature/feat-0005/TECH.md) | — |
| feat-0006 | Sermon audio upload → processing → playback | [PRODUCT](./feature/feat-0006/PRODUCT.md) | [TECH](./feature/feat-0006/TECH.md) | — |
| feat-0007 | Stream-native processing + optimization roadmap (P1–P3) | [PRODUCT](./feature/feat-0007/PRODUCT.md) | [TECH](./feature/feat-0007/TECH.md) | — |
| feat-0008 | Storage stills CDN (`storage.troott.com`; no raw S3 in GET) | [PRODUCT](./feature/feat-0008/PRODUCT.md) | [TECH](./feature/feat-0008/TECH.md) | — |
| feat-0009 | Spurious `Creator profile not found` 404 (minister sessions) | [PRODUCT](./feature/feat-0009/PRODUCT.md) | [TECH](./feature/feat-0009/TECH.md) | — |
| feat-0010 | Minister `GET /minister` 403 (Protect `userType`; RC-1 fixed) | [PRODUCT](./feature/feat-0010/PRODUCT.md) | [TECH](./feature/feat-0010/TECH.md) | — |
| feat-0011 | Upload poll 404 `sermon not found` on `GET /sermon/:id` | [PRODUCT](./feature/feat-0011/PRODUCT.md) | [TECH](./feature/feat-0011/TECH.md) | — |
| feat-0012 | Storage CDN URLs load nothing in browser (no extension red herring) | [PRODUCT](./feature/feat-0012/PRODUCT.md) | [TECH](./feature/feat-0012/TECH.md) | — |
| feat-0013 | Turbo `ERR` stacks ending at `async.mdw` / `checkAuth:83` (misleading auth frames) | [PRODUCT](./feature/feat-0013/PRODUCT.md) | [TECH](./feature/feat-0013/TECH.md) | — |
| feat-0014 | Sermon cover `POST /sermon/image-upload` (upload modal immediate upload) | [PRODUCT](./feature/feat-0014/PRODUCT.md) | [TECH](./feature/feat-0014/TECH.md) | — |
| feat-0015 | Sermon cover field contract (`image` provenance vs `imageUrl` CDN) | [PRODUCT](./feature/feat-0015/PRODUCT.md) | [TECH](./feature/feat-0015/TECH.md) | — |
| feat-0016 | Profile `banner` / `avatar` CDN on GET (cover visible on web) | [PRODUCT](./feature/feat-0016/PRODUCT.md) | [TECH](./feature/feat-0016/TECH.md) | — |
| feat-0017 | Superadmin — one login, all persona flags + profiles (phase 2) | [PRODUCT](./feature/feat-0017/PRODUCT.md) | [TECH](./feature/feat-0017/TECH.md) | — |
| feat-0018 | Resumable uploads — direct S3 multipart (Uppy); **sermon audio primary** | [PRODUCT](./feature/feat-0018/PRODUCT.md) | [TECH](./feature/feat-0018/TECH.md) · [TASKS](./feature/feat-0018/TASKS.md) | — |

**Related (web):** Staging Progress upload failures — [web feat-0038](../web/feature/feat-0038/PRODUCT.md) (ops CORS / Coolify / client error UX; uses feat-0018 routes).

## Flow / integration docs

- **[`feature/feat-0006/`](./feature/feat-0006/PRODUCT.md)** — **Canonical** sermon audio: upload → S3 → metadata + HLS jobs → playback
- **[`feature/feat-0007/`](./feature/feat-0007/PRODUCT.md)** — Stream-native HLS worker (implements processing half of feat-0006)
- [`sermon-audio-upload-pipeline.md`](./sermon-audio-upload-pipeline.md) — redirect to feat-0006
- [`minister-flow.md`](./minister-flow.md) — Minister web UX (product-level)
- [`audio-processing-job-plan.md`](./audio-processing-job-plan.md) — Bull/ffmpeg HLS pipeline (implementation notes; superseded for E2E by feat-0006)
- [`upload-processing-step-timings.md`](./upload-processing-step-timings.md) — 4-step latency measurement per `uploadId` (upload, queue waits, metadata, HLS)
- [`media-compute-deployment-plan.md`](./media-compute-deployment-plan.md) — AWS **production** deploy: EC2, ffmpeg, **`troott-originals`** / **`troott-playback`** / **`troott-storage`**
- [`feature/feat-0005/`](./feature/feat-0005/PRODUCT.md) — **API implementation** for three-bucket routing, HLS keys, worker tuning, Docker
- [`web-api-auth-handshake.md`](./web-api-auth-handshake.md) — Web Bearer / `isAuth` alignment with `Protect` (feat-0004)
- [`profile-image-display-spec.md`](./profile-image-display-spec.md) — Profile avatar/cover: upload vs GET URL gap (storage bucket / mapper)
- [`feature/feat-0008/`](./feature/feat-0008/PRODUCT.md) — Storage stills CDN: sermon covers, KYC verification, `POST /storage/upload`; stop returning `*.s3.amazonaws.com`; path/TLS runbook
- [`feature/feat-0009/`](./feature/feat-0009/PRODUCT.md) — Minister studio calls `GET /creator` via onboarding refresh → expected 404 noise
- [`feature/feat-0010/`](./feature/feat-0010/PRODUCT.md) — Minister `GET /minister` 403; Protect now sets `userType` (RC-1 fixed); wrong persona still 403
- [`feature/feat-0011/`](./feature/feat-0011/PRODUCT.md) — Upload status polling gets 404 `sermon not found` on `GET /sermon/:id` (draft access gate)
- [`feature/feat-0012/`](./feature/feat-0012/PRODUCT.md) — CDN image URLs (`storage.troott.com/images/…`) fail in browser; full request/response cycle + infra vs app diagnosis
- [`feature/feat-0013/`](./feature/feat-0013/PRODUCT.md) — Dev `ERR` logs: `checkAuth.mdw:83` means auth OK; scroll for `ErrorResponse:` line; map to feat-0011 / 0010 / 0009
- [`feature/feat-0014/`](./feature/feat-0014/PRODUCT.md) — Sermon cover image-upload; owner gate + CDN persist; web calls on Details step ([feat-0032 web](../../web/feature/feat-0032/PRODUCT.md))
- [`feature/feat-0015/`](./feature/feat-0015/PRODUCT.md) — Sermon cover **`image`** (S3 provenance) vs **`imageUrl`** (CDN); supersedes CDN-in-`image.item` guidance
- [`feature/feat-0016/`](./feature/feat-0016/PRODUCT.md) — Profile **`banner`** / **`avatar`**: store `s3Key`, return CDN on GET; web [feat-0033](../../web/feature/feat-0033/PRODUCT.md)
- [`feature/feat-0017/`](./feature/feat-0017/PRODUCT.md) — Superadmin: one login, all flags (phase 1); Minister/Studio/Creator/Listener profiles + portal access (phase 2 planned)
- [`feature/feat-0018/`](./feature/feat-0018/PRODUCT.md) — Direct **S3 multipart** (presigned URLs); API orchestrates, browser uploads via Uppy; `complete-audio` → Bull jobs; web [feat-0037](../../web/feature/feat-0037/PRODUCT.md); [TASKS](./feature/feat-0018/TASKS.md)
- [`web-flow.md`](./web-flow.md) — Web ↔ API integration notes
- [`mobile-flow.md`](./mobile-flow.md) — Mobile listener ↔ API
- [`search.md`](./search.md) — Search behavior

## Related app specs

- Web portal: [`specs/web/README.md`](../web/README.md)
- Mobile: [`specs/mobile/README.md`](../mobile/README.md)
- Platform CI/CD: [`specs/platform/README.md`](../platform/README.md) — [feat-0001](../platform/feature/feat-0001/PRODUCT.md) (Pacepard reference)
