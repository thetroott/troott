# Agent prompt: maintain `packages/api-client/docs/models`

Copy everything below the line into a new task when updating DTO documentation.

---

You are editing **`packages/api-client/docs/models/`** for the Troott monorepo.

**Goals**

- Keep docs aligned with **`packages/api-client/src`** only (do not describe repo root `docs/models/*.model.tsx` as current api-client types).
- Use the same style as **`packages/state/docs/context/README.md`**: short markdown, **index tables**, **explicit file paths** (`packages/api-client/src/...`), no vague references like “the user module” without a path.

**When `apps/api` or api-client types change**

1. Run a fresh inventory: `*.dto.ts` under `packages/api-client/src/api`.
2. Open **`packages/api-client/src/dto-index.ts`** and verify every non-empty DTO module has `export * from './api/...';`. Note intentional gaps (empty files) in **`dto-inventory.md`**.
3. Update **`entry-points.md`** if `package.json` `exports`, `src/index.ts`, or `src/dto-index.ts` behavior changes.
4. Update **`conventions.md`** only if naming or placement rules change.
5. Refresh **`README.md`** index table if you add or remove a doc file.

**Checklist before finishing**

- [ ] Every cited path exists in the workspace.
- [ ] Barrel coverage in `dto-inventory.md` matches `dto-index.ts`.
- [ ] Import examples use **`@troott/api-client/dto`** and/or root as actually exported in `package.json`.
- [ ] `pnpm --filter @troott/api-client build` succeeds if TypeScript or exports changed.

**Do not** edit plan files in the repo; scope doc edits to **`packages/api-client/docs/models/`** and **`packages/api-client/README.md`** unless the user expands scope.
