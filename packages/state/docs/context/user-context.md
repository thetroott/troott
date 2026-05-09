# UserContext

## Context instance

File: `packages/state/src/user/userContext.tsx`.

```tsx
import { createContext } from 'react';

const UserContext = createContext<any>({});

export default UserContext;
```

Values are **not** defaulted by empty `{}` in production: `LegacyCompatContexts` wraps children with `UserContext.Provider` and passes the full `IUserContext` object.

## Contract

File: `packages/state/src/helpers/interface.ts` → `IUserContext`.

Data fields:

- `users`, `user`, `userType`, `profile`, `preferences`, `permissions`, `subscription`, `plan`, `loading`, `toast`, `sidebar`

Methods:

- `setUser`, `setUserType`, `setProfile`, `setPreferences`, `setPermissions`, `setSubscription`, `setPlan`, `setToast`, `clearToast`, `setSidebar`, `setCollection`, `setResource`, `setLoading`, `unsetLoading`, `refreshProfile`

Where those values come from after dispatch: [legacy-compat-contexts.md](./legacy-compat-contexts.md).
