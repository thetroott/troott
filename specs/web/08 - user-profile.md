# User profile (web portal)

Canonical spec for **`/profile`** — public listener-facing identity preview and edit.

| Doc | Purpose |
| --- | ------- |
| [feat-0011 PRODUCT](./feature/feat-0011/PRODUCT.md) | UX, use case index (UC-P01–P14), field inventory |
| [feat-0011 TECH](./feature/feat-0011/TECH.md) | Routes, files, hooks, historical gaps |
| **[feat-0024 PROFILE_DATA_ACTIONS_SPEC](./feature/feat-0024/PROFILE_DATA_ACTIONS_SPEC.md)** | **Figma-backed data + actions contract (normative for parity work)** |
| [feat-0024 PRODUCT](./feature/feat-0024/PRODUCT.md) | Goals, definition of done, Figma links |
| [feat-0024 TECH](./feature/feat-0024/TECH.md) | Implementation phases |

**Local dev:** [http://localhost:5173/profile](http://localhost:5173/profile)

**Account settings** (password, email, deactivate): [http://localhost:5173/settings](http://localhost:5173/settings) — [feat-0012](./feature/feat-0012/PRODUCT.md).

**Status:** Read/edit UI shipped; **`GET/PUT /minister`** wired in `useProfile.ts`. Remaining parity (stats, contact/ministry/social read blocks, recent sermons, page header) tracked in [feat-0024](./feature/feat-0024/PRODUCT.md).
