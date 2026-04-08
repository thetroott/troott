# @troott/sdk

Shared tooling utilities and services for Troott applications.

## Installation

This package is part of the Troott monorepo and is automatically available to all workspace packages.

## Usage

```typescript
import { 
  cookieService, 
  idempotentService, 
  QueryProvider,
  CookieKeyType 
} from '@troott/sdk';
```

## Exports

### `cookieService`

Cookie management service for setting, getting, and removing cookies.

```typescript
import { cookieService } from '@troott/sdk';

// Set a cookie
cookieService.setData({
  key: 'token',
  payload: 'your-token-value',
  maxAge: 3600,
  path: '/'
});

// Get a cookie
const token = cookieService.getData({ key: 'token', parse: false });

// Remove a cookie
cookieService.removeData({ key: 'token' });

// Helper methods
const userType = cookieService.getUserType();
const token = cookieService.getToken();
```

### `idempotentService`

Service for generating and managing idempotent request keys.

```typescript
import { idempotentService } from '@troott/sdk';

// Get or create a request key
const requestKey = idempotentService.getRequestKey();

// Set a new request key
const newKey = idempotentService.setRequestKey();
```

### `QueryProvider`

React Query provider component with default configuration.

```typescript
import { QueryProvider } from '@troott/sdk';

function App() {
  return (
    <QueryProvider>
      {/* Your app components */}
    </QueryProvider>
  );
}
```

### Types

```typescript
import { 
  CookieKeyType,
  ISetCookie,
  IGetCookie,
  IRemoveCookie 
} from '@troott/sdk';
```

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `axios` - HTTP client
- `universal-cookie` - Cookie management
- `uuid` - Unique ID generation
- `zod` - Schema validation
- `zustand` - State management

## Peer Dependencies

- `react` ^19
- `react-dom` ^19
