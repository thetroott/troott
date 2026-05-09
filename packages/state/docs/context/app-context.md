# AppContext

## Context instance

File: `packages/state/src/app/appContext.tsx`.

```tsx
import { createContext } from 'react';

const AppContext = createContext<any>({});

export default AppContext;
```

Values are supplied by `LegacyCompatContexts` via `AppContext.Provider` (`packages/state/src/compat/LegacyCompatContexts.tsx`).

## Contract

File: `packages/state/src/helpers/interface.ts` → `IAppContext`.

Data fields:

- `sermons`, `sermon`, `playlists`, `playlist`, `ministers`, `minister`, `listeners`, `listener`, `creators`, `creator`, `library`, `discoveryHome`, `featuredMinister`, `searchResults`, `plans`, `plan`, `transactions`, `transaction`, `loading`

Methods:

- `setCollection`, `setResource`, `setLoading`, `unsetLoading`, `loadDiscoveryHome`

Mapping from domain state and dispatches: [legacy-compat-contexts.md](./legacy-compat-contexts.md).
