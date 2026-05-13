/**
 * Query keys for TanStack Query (Troott mobile API).
 */

export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        user: () => [...queryKeys.auth.all, 'user'] as const,
        login: () => [...queryKeys.auth.all, 'login'] as const,
        register: () => [...queryKeys.auth.all, 'register'] as const,
    },
    users: {
        all: ['users'] as const,
        me: () => [...queryKeys.users.all, 'me'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        list: (filters?: unknown) => [...queryKeys.users.lists(), filters] as const,
    },
} as const;
