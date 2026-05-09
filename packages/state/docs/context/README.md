# Context reference (`packages/state`)

Explicit layout for Troott shared state: flat action strings, split Context instances, and one composed provider tree. Same mental model as repo `docs/context/` (UserContext + AppContext + dispatch helpers), extended with per-domain files under `src/domains/`.

App root (web or mobile): wrap once with `TroottStateProvider` from `@troott/state` (`packages/state/src/TroottStateProvider.tsx`, re-exported from `packages/state/src/index.ts`).

## Runtime entry → doc

| Entry | Source file | Doc |
|-------|-------------|-----|
| `TroottStateProvider` | `packages/state/src/TroottStateProvider.tsx` | [troott-state-provider.md](./troott-state-provider.md) |
| `LegacyCompatContexts` | `packages/state/src/compat/LegacyCompatContexts.tsx` | [legacy-compat-contexts.md](./legacy-compat-contexts.md) |
| `UserContext` | `packages/state/src/user/userContext.tsx` | [user-context.md](./user-context.md) |
| `AppContext` | `packages/state/src/app/appContext.tsx` | [app-context.md](./app-context.md) |
| `useContextType` | `packages/state/src/useContextType.tsx` | [use-context-type.md](./use-context-type.md) |

## Doc index

| Doc | What it is |
|-----|----------------|
| [PROMPT.md](./PROMPT.md) | Agent instructions for maintaining this folder (copy into tasks). |
| [types.md](./types.md) | Action constant exports (`helpers/types.ts`). |
| [troott-state-provider.md](./troott-state-provider.md) | Nested provider order (`TroottStateProvider`). |
| [user-context.md](./user-context.md) | `UserContext` + `IUserContext` (`user/userContext.tsx`, `helpers/interface.ts`). |
| [app-context.md](./app-context.md) | `AppContext` + `IAppContext` (`app/appContext.tsx`, `helpers/interface.ts`). |
| [use-context-type.md](./use-context-type.md) | `useContextType()` hook (`useContextType.tsx`). |
| [legacy-compat-contexts.md](./legacy-compat-contexts.md) | Values pushed into `UserContext` / `AppContext` (`compat/LegacyCompatContexts.tsx`). |
| [selectors.md](./selectors.md) | `useUserSelector` / `useAppSelector` (`hooks/selectors.ts`). |
| [domain-modules.md](./domain-modules.md) | Files under `src/domains/<name>/`. |
