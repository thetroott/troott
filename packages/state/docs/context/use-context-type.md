# useContextType

File: `packages/state/src/useContextType.tsx`.

Reads the two default-export contexts and returns both shapes:

```tsx
import { useContext } from 'react';
import type { IAppContext, IUserContext } from './helpers/interface';
import UserContext from './user/userContext';
import AppContext from './app/appContext';

export default function useContextType(): {
    userContext: IUserContext;
    appContext: IAppContext;
} {
    const userContext = useContext(UserContext) as IUserContext;
    const appContext = useContext(AppContext) as IAppContext;

    return {
        userContext,
        appContext,
    };
}
```

Requirement: render under `TroottStateProvider` so `LegacyCompatContexts` has mounted and both providers hold real values.

Export: `packages/state/src/index.ts` → `useContextType`.
