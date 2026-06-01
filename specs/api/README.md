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

## Flow / integration docs

- [`minister-flow.md`](./minister-flow.md) — Minister web UX (product-level)
- [`audio-processing-job-plan.md`](./audio-processing-job-plan.md) — Bull/ffmpeg HLS pipeline (implementation)
- [`media-compute-deployment-plan.md`](./media-compute-deployment-plan.md) — AWS **production** deploy: EC2, ffmpeg, **`troott-originals`** / **`troott-playback`** / **`troott-storage`**
- [`feature/feat-0005/`](./feature/feat-0005/PRODUCT.md) — **API implementation** for three-bucket routing, HLS keys, worker tuning, Docker
- [`web-flow.md`](./web-flow.md) — Web ↔ API integration notes
- [`mobile-flow.md`](./mobile-flow.md) — Mobile listener ↔ API
- [`search.md`](./search.md) — Search behavior

## Related app specs

- Web portal: [`specs/web/README.md`](../web/README.md)
- Mobile: [`specs/mobile/README.md`](../mobile/README.md)
