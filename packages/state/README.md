# @troott/state

React Context + `useReducer` for Troott. Depends on `@troott/api-client` where domains call `troottAPIClient()` (e.g. auth bootstrap, profile refresh, discovery home).

## Use at app root

```tsx
import { TroottStateProvider } from '@troott/state';

export function Root() {
    return (
        <TroottStateProvider>
            <App />
        </TroottStateProvider>
    );
}
```

Do **not** nest the deprecated pass-through `UserState` / `AppState` wrappers unless you are bridging old call sites; prefer a single `TroottStateProvider`.

## Context reference (explicit layout)

Same idea as repo **`docs/context/`** (flat action constants, split contexts, provider wiring): see **`packages/state/docs/context/README.md`** and maintainer copy-paste **`packages/state/docs/context/PROMPT.md`** for:

- `helpers/types.ts` action strings
- `TroottStateProvider` nesting order
- `UserContext` / `AppContext` + `IUserContext` / `IAppContext`
- `useContextType`, selectors, and how `compat/LegacyCompatContexts.tsx` fills the legacy contracts

## Package exports

See `src/index.ts`: `TroottStateProvider`, `useContextType`, `UserContext`, `AppContext`, domain hooks (`useAuthState`, `usePlaybackDispatch`, …), `helpers/types`, `helpers/interface`, seeds, `useUserSelector` / `useAppSelector`.

## ADR

`docs/adr/0001-music-app-state-domains.md`.
