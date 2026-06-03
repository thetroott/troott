# Sermon audio: upload through processing

**Moved.** The canonical API spec is now structured like other API features:

| Doc | Purpose |
| --- | ------- |
| **[`feature/feat-0006/PRODUCT.md`](./feature/feat-0006/PRODUCT.md)** | End-to-end flow, actors, status semantics, client polling, acceptance criteria |
| **[`feature/feat-0006/TECH.md`](./feature/feat-0006/TECH.md)** | `POST /sermon/start-upload`, S3 keys, Bull jobs, loudnorm, config, source files |

**Start here:** [`feature/feat-0006/PRODUCT.md`](./feature/feat-0006/PRODUCT.md)

Related:

- [`feature/feat-0005/`](./feature/feat-0005/PRODUCT.md) — three-bucket rollout, Docker, EC2
- [`media-compute-deployment-plan.md`](./media-compute-deployment-plan.md) — sizing and ops
- [`apps/api/docs/audio-pipeline-flow.md`](../apps/api/docs/audio-pipeline-flow.md) — short code index
