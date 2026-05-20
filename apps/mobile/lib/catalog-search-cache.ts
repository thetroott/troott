import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/utils/query-keys';

/**
 * Drops in-memory + persisted TanStack entries for catalog search (anonymous or prior user).
 * Call on logout and after login success so results never bleed across accounts.
 */
export function removeCatalogSearchQueries(client: QueryClient): void {
    client.removeQueries({ queryKey: queryKeys.search.all });
}
