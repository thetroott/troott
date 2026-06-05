# Platform specs (monorepo)

Cross-cutting specifications for the **Troott monorepo** (`apps/*`, shared tooling, CI/CD, deployment).

## Feature specs

| ID | Topic | PRODUCT | TECH |
| -- | ----- | ------- | ---- |
| feat-0001 | CI/CD — GitHub Actions + Coolify + EAS | [PRODUCT](./feature/feat-0001/PRODUCT.md) | [TECH](./feature/feat-0001/TECH.md) |
| feat-0002 | CI/CD remediation — green pipeline + production deploy | [PRODUCT](./feature/feat-0002/PRODUCT.md) | [TECH](./feature/feat-0002/TECH.md) |

## Related app specs

- API deploy / media compute: [`specs/api/media-compute-deployment-plan.md`](../api/media-compute-deployment-plan.md), [feat-0005](../api/feature/feat-0005/PRODUCT.md)
- Web portal (studio): [`specs/web/README.md`](../web/README.md)
- Marketing website: [`specs/website/README.md`](../website/README.md) — `@troott/website` (`troott.com`); [feat-0001 dark-only](../website/feature/feat-0001/PRODUCT.md)
- Studio portal: `apps/web` — `@troott/web` (`app.troott.com`)
- Mobile listener: [`specs/mobile/README.md`](../mobile/README.md)
- Local guardrails (interim): [`docs/CI_GUARDRAILS.md`](../../docs/CI_GUARDRAILS.md)

## Reference implementation

Canonical CI/CD patterns live in the **Pacepard** monorepo on the same machine:

`/Users/pro/Documents/ProjectPacepard/pacepard`

- CI: `.github/workflows/ci.yml`
- CD: `.github/workflows/deploy.yml`
