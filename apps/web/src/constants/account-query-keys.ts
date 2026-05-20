/** React Query keys for account / current user. */

export const accountQueryKeys = {
    all: ['account'] as const,
    current: () => [...accountQueryKeys.all, 'current'] as const,
};
