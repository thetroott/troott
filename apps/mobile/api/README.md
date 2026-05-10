# Trifold API Integration

Production-ready TanStack Query integration for the Trifold API V2.

## Features

- ✅ **Type-Safe API Client** - Full TypeScript support with generated types
- ✅ **TanStack Query v5** - Modern data fetching with caching and synchronization
- ✅ **Offline Support** - Queue mutations when offline, sync when online
- ✅ **Cache Persistence** - AsyncStorage-based cache persistence
- ✅ **Authentication** - Secure token storage with automatic refresh
- ✅ **Error Handling** - Centralized error handling with Bugsnag integration
- ✅ **Network Resilience** - Retry logic, circuit breakers, adaptive timeouts
- ✅ **Request Deduplication** - Automatic request deduplication
- ✅ **Production Ready** - Environment-based configs, logging, monitoring

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_API_URL` - Your API base URL
- `EXPO_PUBLIC_BUGSNAG_API_KEY` - Your Bugsnag API key (optional)

### 3. Initialize Bugsnag

In your app entry point (`app/_layout.tsx`):

```typescript
import { initializeApi } from './api/setup';

// Initialize API services (Bugsnag, offline queue, etc.)
initializeApi();
```

### 4. Wrap Your App with QueryProvider

```typescript
import { QueryProvider } from './api/query-client';

export default function RootLayout() {
  return (
    <QueryProvider>
      {/* Your app content */}
    </QueryProvider>
  );
}
```

### 5. Use Hooks in Your Components

```typescript
import { useUsers, useUpdateUserProfile } from './api/hooks';

function UsersScreen() {
  const { data: users, isLoading, error } = useUsers({ limit: 10 });
  const updateProfile = useUpdateUserProfile();

  const handleUpdate = async () => {
    await updateProfile.mutateAsync({
      name: 'New Name',
      interests: ['parenting'],
    });
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <View>
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </View>
  );
}
```

## File Structure

```
api/
├── README.md              # This file
├── client.ts              # HTTP client with interceptors
├── query-client.tsx       # TanStack Query setup
├── setup.ts               # API initialization
├── core/                  # Core infrastructure modules
│   ├── circuit-breaker.ts
│   ├── fetch.ts
│   ├── interceptors.ts
│   ├── request-deduplication.ts
│   └── retry.ts
├── config/                # Configuration
│   ├── index.ts           # API configuration
│   └── endpoints.ts       # API endpoint constants
├── errors/                # Error handling (modular)
│   ├── index.ts
│   ├── types.ts
│   ├── handlers.ts
│   └── messages.ts
├── hooks/                 # React Query hooks
│   ├── auth/              # Authentication hooks
│   │   ├── use-login.ts
│   │   ├── use-register.ts
│   │   └── use-logout.ts
│   ├── users/             # User hooks
│   │   ├── use-users.ts
│   │   ├── use-user.ts
│   │   └── use-update-user-profile.ts
│   └── index.ts
├── monitoring/            # Monitoring & error tracking
│   └── bugsnag.ts
├── services/              # Service layer
│   ├── base.service.ts
│   ├── auth.service.ts
│   └── users.service.ts
├── storage/               # Storage & persistence
│   ├── auth.ts            # Token storage
│   ├── cache.ts           # Cache persistence
│   └── offline.ts         # Offline mutation queue
├── types/                 # TypeScript types
│   └── index.ts
└── utils/                 # Utilities
    └── query-keys.ts
```

## API Client Usage

### Basic Requests

```typescript
import { get, post, patch, del } from './api/client';

// GET request
const users = await get<User[]>('/api/v1/users');

// POST request
const newUser = await post<User>('/api/v1/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PATCH request
const updated = await patch<User>('/api/v1/users/123', {
  name: 'Jane Doe',
});

// DELETE request
await del('/api/v1/users/123');
```

### Using Endpoints

```typescript
import { userEndpoints } from './api/config/endpoints';
import { get } from './api/client';

const user = await get(userEndpoints.getById('123'));
```

## React Query Hooks

### Query Hooks (GET requests)

```typescript
import { useUsers, useUser } from './api/hooks';

// List query
const { data, isLoading, error, refetch } = useUsers({ limit: 10 });

// Single item query
const { data: user } = useUser('user-id', true);
```

### Mutation Hooks (POST/PATCH/DELETE)

```typescript
import { useUpdateUserProfile, useLogin } from './api/hooks';

// Update mutation
const updateProfile = useUpdateUserProfile();

updateProfile.mutate({
  name: 'New Name',
}, {
  onSuccess: (data) => {
    console.log('Updated:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Login mutation
const login = useLogin();

login.mutate({
  email: 'user@example.com',
  password: 'password',
});
```

## Authentication

Tokens are automatically managed and included in requests:

```typescript
import { storeToken, getToken, clearTokens } from './api/storage/auth';

// Store token after login
await storeToken({
  token: 'jwt-token',
  expiresAt: Date.now() + 3600000, // 1 hour
});

// Get current token
const token = await getToken();

// Clear tokens on logout
await clearTokens();
```

## Offline Support

Mutations are automatically queued when offline and synced when back online:

```typescript
import { getSyncStatus } from './api/storage/offline';

// Check sync status (now async)
const status = await getSyncStatus();
console.log(`Pending: ${status.pending}, Failed: ${status.failed}`);
```

## Error Handling

Errors are automatically logged to Bugsnag and provide user-friendly messages:

```typescript
import { ApiError, getUserFriendlyMessage } from './api/errors';

try {
  await apiClient('/api/v1/users');
} catch (error) {
  if (error instanceof ApiError) {
    const message = getUserFriendlyMessage(error);
    // Show message to user
  }
}
```

## Environment Configuration

Configuration is environment-based (dev/staging/prod):

```typescript
import { apiConfig, getEnvironment } from './api/config';

console.log(apiConfig.baseURL);
console.log(getEnvironment()); // 'development' | 'staging' | 'production'
```

## Regenerating from Postman

When the API changes:

1. Update the Postman collection
2. Re-run the Postman MCP tools to fetch the latest collection
3. Update `api/types/index.ts` with new request/response types
4. Update `api/config/endpoints.ts` with new endpoint paths
5. Create/update hooks in `api/hooks/{feature}/` as needed
6. Add services in `api/services/` if needed

## Testing

See `__tests__/api/` for example tests.

## Troubleshooting

### Cache Issues

Clear the query cache:

```typescript
import { queryClient } from './api/query-client';

queryClient.clear();
```

### Network Issues

Check network status:

```typescript
import { getNetworkState } from './utils/network';

const state = await getNetworkState();
console.log('Connected:', state.isConnected);
console.log('Quality:', state.quality);
```

### Token Issues

Clear tokens and re-authenticate:

```typescript
import { clearTokens } from './api/storage/auth';

await clearTokens();
// Redirect to login
```

## Best Practices

1. **Use Hooks** - Prefer hooks over direct API client calls
2. **Handle Loading States** - Always show loading indicators
3. **Handle Errors** - Display user-friendly error messages
4. **Optimistic Updates** - Use optimistic updates for better UX
5. **Cache Invalidation** - Invalidate related queries after mutations
6. **Type Safety** - Use TypeScript types for all API calls

## Performance Tips

1. **Query Keys** - Use consistent query keys for cache sharing
2. **Stale Time** - Set appropriate stale times for your data
3. **Pagination** - Use infinite queries for large lists
4. **Prefetching** - Prefetch data before navigation
5. **Background Updates** - Use `refetchInterval` for real-time data

## Security

- Tokens are stored securely using Expo SecureStore
- Sensitive data is not persisted in cache
- SSL pinning can be configured (see Expo docs)
- API keys should be in environment variables

## Support

For issues or questions, check:
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Expo Docs](https://docs.expo.dev)
- [Bugsnag Docs](https://docs.bugsnag.com/platforms/react-native/)

