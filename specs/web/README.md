# Web specs (minister / creator / admin portal)

Product and technical specifications for **`apps/web`**.

## Feature specs

| ID | Topic | PRODUCT | TECH |
| -- | ----- | ------- | ---- |
| feat-0001 | Authentication & session | [PRODUCT](./feature/feat-0001/PRODUCT.md) | [TECH](./feature/feat-0001/TECH.md) |
| feat-0002 | Portal sidebar | [PRODUCT](./feature/feat-0002/PRODUCT.md) | [TECH](./feature/feat-0002/TECH.md) |
| feat-0003 | Admin login (no public register) | [PRODUCT](./feature/feat-0003/PRODUCT.md) | [TECH](./feature/feat-0003/TECH.md) |
| feat-0004 | Studio-scoped sidebar URLs | [PRODUCT](./feature/feat-0004/PRODUCT.md) | [TECH](./feature/feat-0004/TECH.md) |
| feat-0005 | Minister/creator Get Started | [PRODUCT](./feature/feat-0005/PRODUCT.md) | [TECH](./feature/feat-0005/TECH.md) |
| feat-0006 | Studio sermon CRUD (upload, drafts, bin) | [PRODUCT](./feature/feat-0006/PRODUCT.md) | [TECH](./feature/feat-0006/TECH.md) |
| feat-0007 | Get Started Save & Exit | [PRODUCT](./feature/feat-0007/PRODUCT.md) | [TECH](./feature/feat-0007/TECH.md) |
| feat-0008 | Studio upload single-flight (`start-upload`) | [PRODUCT](./feature/feat-0008/PRODUCT.md) | [TECH](./feature/feat-0008/TECH.md) |
| feat-0009 | Auth routing & portal entry | [PRODUCT](./feature/feat-0009/PRODUCT.md) | [TECH](./feature/feat-0009/TECH.md) |
| feat-0010 | Get Started onboarding (`/get-started`) | [PRODUCT](./feature/feat-0010/PRODUCT.md) | [TECH](./feature/feat-0010/TECH.md) |
| feat-0011 | Portal profile (`/profile`) | [PRODUCT](./feature/feat-0011/PRODUCT.md) | [TECH](./feature/feat-0011/TECH.md) |
| feat-0012 | Account settings (`/settings`) | [PRODUCT](./feature/feat-0012/PRODUCT.md) | [TECH](./feature/feat-0012/TECH.md) |
| feat-0016 | Tour & Tutorial (studio walkthrough) | [PRODUCT](./feature/feat-0016/PRODUCT.md) | [TECH](./feature/feat-0016/TECH.md) |
| feat-0017 | Sermon Analytics — Overview tab | [PRODUCT](./feature/feat-0017/PRODUCT.md) | [TECH](./feature/feat-0017/TECH.md) |
| feat-0018 | My Sermons upload, library, drafts (Figma) | [PRODUCT](./feature/feat-0018/PRODUCT.md) | [TECH](./feature/feat-0018/TECH.md) |
| feat-0026 | Empty states — centered layout (`apps/web`) | [PRODUCT](./feature/feat-0026/PRODUCT.md) | [TECH](./feature/feat-0026/TECH.md) |
| feat-0031 | Get Started — Upload sermon CTA (blink / no-op) | [PRODUCT](./feature/feat-0031/PRODUCT.md) | [TECH](./feature/feat-0031/TECH.md) |
| feat-0032 | Upload modal — immediate sermon cover image API upload | [PRODUCT](./feature/feat-0032/PRODUCT.md) | [TECH](./feature/feat-0032/TECH.md) |
| feat-0033 | Profile cover (`banner`) / Background image not visible on web | [PRODUCT](./feature/feat-0033/PRODUCT.md) | [TECH](./feature/feat-0033/TECH.md) |
| feat-0034 | Dashboard sidebar — always show onboarding Dashboard UI | [PRODUCT](./feature/feat-0034/PRODUCT.md) | [TECH](./feature/feat-0034/TECH.md) |
| feat-0035 | `/get-troott` smart redirect (app host) | [PRODUCT](./feature/feat-0035/PRODUCT.md) | [TECH](./feature/feat-0035/TECH.md) |
| feat-0036 | Portal shell loading — sidebar-first, region-scoped fetch | [PRODUCT](./feature/feat-0036/PRODUCT.md) | [TECH](./feature/feat-0036/TECH.md) |
| feat-0037 | Resumable uploads — Uppy `@uppy/aws-s3` direct to S3; **sermon audio primary** | [PRODUCT](./feature/feat-0037/PRODUCT.md) | [TECH](./feature/feat-0037/TECH.md) · [TASKS](./feature/feat-0037/TASKS.md) |
| feat-0038 | Staging sermon Progress upload keeps failing (generic error) | [PRODUCT](./feature/feat-0038/PRODUCT.md) | [TECH](./feature/feat-0038/TECH.md) · [TASKS](./feature/feat-0038/TASKS.md) |

**Cross-cutting:** [feat-0026 EMPTY_STATE_LAYOUT_SPEC](./feature/feat-0026/EMPTY_STATE_LAYOUT_SPEC.md) — all empty states centered in page / region / panel.

**Portal shell loading:** [feat-0036 PRODUCT](./feature/feat-0036/PRODUCT.md) — one bootstrap model; sidebar static chrome immediate; API regions load in place. [TECH](./feature/feat-0036/TECH.md) — loading tiers, per-route implementation.

**Upload modal cover:** [feat-0032 PRODUCT](./feature/feat-0032/PRODUCT.md) — `POST /sermon/image-upload` on Details step, not only on Publish; API [feat-0014](../../api/feature/feat-0014/PRODUCT.md).

**Profile hero cover:** [feat-0033 PRODUCT](./feature/feat-0033/PRODUCT.md) — Figma **Background image** → API `banner` → web hero; API [feat-0016](../../api/feature/feat-0016/PRODUCT.md).

**Dashboard sidebar:** [feat-0034 PRODUCT](./feature/feat-0034/PRODUCT.md) — always render onboarding **Dashboard UI** (`AppSidebar`); do not unmount on sermon edit workspace.

**Get Started:** [feat-0031 GET_STARTED_UPLOAD_SERMON_CTA_SPEC](./feature/feat-0031/GET_STARTED_UPLOAD_SERMON_CTA_SPEC.md) — hub item 4 **Upload sermon** preflight and studio upload launch.

**Resumable uploads:** [feat-0037 PRODUCT](./feature/feat-0037/PRODUCT.md) — **Uppy** + direct S3 multipart for sermon audio (default), cover, KYC, profile; Troott API signs URLs — [feat-0018 API](../../api/feature/feat-0018/PRODUCT.md). Post-upload polling: [feat-0018 UPLOAD_STATUS_POLLING_SPEC](./feature/feat-0018/UPLOAD_STATUS_POLLING_SPEC.md) (not API feat-0018). [TASKS](./feature/feat-0037/TASKS.md).

**Staging upload reliability:** [feat-0038 PRODUCT](./feature/feat-0038/PRODUCT.md) — Progress step generic failure on `app.staging.troott.com`; diagnose Uppy vs legacy; CORS / Coolify / baked `VITE_APP_API_URL`; actionable error UX. [TECH](./feature/feat-0038/TECH.md) · [TASKS](./feature/feat-0038/TASKS.md).

## Numbered UX / flow docs

- [`07 - settings.md`](./07%20-%20settings.md) — `/settings` index (feat-0012)
- [`08 - user-profile.md`](./08%20-%20user-profile.md) — `/profile` index (feat-0011)

- [`01 - onboarding.md`](./01%20-%20onboarding.md) — points to feat-0005
- [`02 - get-started.md`](./02%20-%20get-started.md)
- [`04 - sermon-upload-draft.md`](./04%20-%20sermon-upload-draft.md) — detailed UC-U*; studio routing in feat-0006; Figma implementation in feat-0018
- [`05 -  sermon-view-trash.md`](./05%20-%20%20sermon-view-trash.md) — detailed UC-V*; studio routing in feat-0006

## Mobile listener app

See [`specs/mobile/README.md`](../mobile/README.md).

## Marketing website (`apps/website`)

See [`specs/website/README.md`](../website/README.md) — `troott.com`; [feat-0001 dark mode only](../website/feature/feat-0001/PRODUCT.md).
